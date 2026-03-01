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
  onFramePhi?: (phi: number) => void;
}

const THETA = 0.25;

export function CobeGlobe({ markers, onFramePhi }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);

  const r = useMotionValue(0);
  const rs = useSpring(r, { mass: 1, damping: 30, stiffness: 100 });

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

  return (
    <div
      role="img"
      aria-label="3D globe showing visitor logins around the world"
      className="aspect-square w-full"
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
    </div>
  );
}
