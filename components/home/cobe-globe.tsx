'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useMotionValue, useSpring } from 'framer-motion';

export interface GlobeMarker {
  location: [number, number]; // [lat, lng]
  size: number;
  code: string;
  count: number;
}

interface CobeGlobeProps {
  markers: GlobeMarker[];
  /** Show floating labels on all visible markers (debug / always-on mode) */
  showLabels?: boolean;
  onFramePhi?: (phi: number) => void;
}

const THETA = 0.25;

/** Convert ISO alpha-2 code to flag emoji */
function countryFlag(code: string): string {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

interface Projected {
  x: number;
  y: number;
  visible: boolean;
  depth: number; // zFinal — higher = more towards camera
}

/**
 * Project a marker to screen coordinates using cobe's exact rotation matrix.
 *
 * Extracted from cobe's shader source:
 *  - World position: wx = cos(lat)*cos(lng), wy = sin(lat), wz = -cos(lat)*sin(lng)
 *  - Rotation matrix J(theta, phi) applied as world-to-camera transform
 */
function projectMarker(
  lat: number,
  lng: number,
  phi: number,
  canvasWidth: number,
): Projected {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // World coordinates (matches cobe's marker placement)
  const wx = Math.cos(latR) * Math.cos(lngR);
  const wy = Math.sin(latR);
  const wz = -Math.cos(latR) * Math.sin(lngR);

  // Cobe's rotation matrix J(theta, phi) — world to camera
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const ct = Math.cos(THETA), st = Math.sin(THETA);

  const camX = cp * wx + sp * wz;
  const camY = sp * st * wx + ct * wy - cp * st * wz;
  const camZ = -sp * ct * wx + st * wy + cp * ct * wz;

  const radius = canvasWidth / 2;
  const cx = canvasWidth / 2;
  const cy = canvasWidth / 2;

  return {
    x: cx + camX * radius,
    y: cy - camY * radius,
    visible: camZ > 0.05,
    depth: camZ,
  };
}

export function CobeGlobe({ markers, showLabels, onFramePhi }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const springOffsetRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const projectedRef = useRef<Projected[]>([]);
  const markersRef = useRef(markers);
  markersRef.current = markers;

  const r = useMotionValue(0);
  const rs = useSpring(r, { mass: 1, damping: 30, stiffness: 100 });

  useEffect(() => {
    const unsub = rs.on('change', (v) => {
      springOffsetRef.current = v;
    });
    return unsub;
  }, [rs]);

  // Globe setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    const globe = createGlobe(canvas, {
      devicePixelRatio: pixelRatio,
      width: widthRef.current * pixelRatio,
      height: widthRef.current * pixelRatio,
      phi: 0,
      theta: THETA,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.14, 0.22],
      markerColor: [1, 0.8, 0.02],
      glowColor: [0.08, 0.11, 0.18],
      markers,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.0015;
        }
        const currentPhi = phiRef.current + rs.get();
        state.phi = currentPhi;
        state.width = widthRef.current * pixelRatio;
        state.height = widthRef.current * pixelRatio;
        onFramePhi?.(currentPhi);

        // Project markers for the label overlay (write to ref, read in RAF loop)
        const w = widthRef.current;
        const projected: Projected[] = [];
        for (const m of markersRef.current) {
          projected.push(projectMarker(m.location[0], m.location[1], currentPhi, w));
        }
        projectedRef.current = projected;
      },
    });

    requestAnimationFrame(() => {
      canvas.style.opacity = '1';
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  // RAF loop to update label positions via direct DOM manipulation (~15fps)
  useEffect(() => {
    if (!showLabels) return;
    let frameId: number;
    let lastUpdate = 0;

    const update = (time: number) => {
      if (time - lastUpdate > 66) {
        lastUpdate = time;
        const container = labelsRef.current;
        const projected = projectedRef.current;
        if (container && projected.length > 0) {
          const children = container.children;
          for (let i = 0; i < children.length && i < projected.length; i++) {
            const el = children[i] as HTMLElement;
            const p = projected[i];
            if (p.visible) {
              el.style.display = '';
              el.style.left = `${p.x}px`;
              el.style.top = `${p.y}px`;
              // Fade based on depth: fully opaque when facing camera, fade near edges
              el.style.opacity = String(Math.min(1, p.depth * 2.5));
            } else {
              el.style.display = 'none';
            }
          }
        }
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [showLabels]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="3D globe showing visitor logins around the world"
      className="relative aspect-square w-full"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab opacity-0 transition-opacity duration-500"
        style={{ contain: 'layout paint size', touchAction: 'none' }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteracting.current = e.clientX;
            r.set(r.get() + delta / 200);
          }
        }}
      />

      {/* Label overlay — positioned via direct DOM manipulation in RAF loop */}
      {showLabels && (
        <div
          ref={labelsRef}
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {markers.map((m) => (
            <div
              key={m.code}
              className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-white backdrop-blur-sm"
              style={{ display: 'none' }}
            >
              {countryFlag(m.code)} {m.code} · {m.count.toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
