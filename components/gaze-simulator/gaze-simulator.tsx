'use client';

import { useState, useCallback } from 'react';

type DuaneType = 1 | 2 | 3;
type AffectedEye = 'left' | 'right';

interface EyePosition {
  x: number; // -1 (left) to 1 (right)
  retraction: number; // 0 to 1
  upshoot: number; // 0 to 1
  fissureNarrowing: number; // 0 to 1
}

function calculateEyePosition(
  gazeDirection: number, // -1 left to 1 right
  duaneType: DuaneType,
  severity: number, // 0 to 1
  isAffectedEye: boolean
): EyePosition {
  if (!isAffectedEye) {
    // Normal eye follows gaze freely
    return { x: gazeDirection, retraction: 0, upshoot: 0, fissureNarrowing: 0 };
  }

  let x = gazeDirection;
  let retraction = 0;
  let upshoot = 0;
  let fissureNarrowing = 0;

  switch (duaneType) {
    case 1:
      // Limited abduction (can't look outward well)
      if (gazeDirection > 0) {
        // For left affected eye, outward = right (positive)
        x = gazeDirection * (1 - severity * 0.8);
      }
      // Retraction on adduction
      if (gazeDirection < -0.2) {
        retraction = Math.abs(gazeDirection + 0.2) * severity * 0.6;
        fissureNarrowing = retraction * 0.8;
        upshoot = retraction * 0.4;
      }
      break;

    case 2:
      // Limited adduction (can't look inward well)
      if (gazeDirection < 0) {
        x = gazeDirection * (1 - severity * 0.7);
      }
      // Retraction on adduction attempt
      if (gazeDirection < -0.2) {
        retraction = Math.abs(gazeDirection + 0.2) * severity * 0.5;
        fissureNarrowing = retraction * 0.7;
      }
      break;

    case 3:
      // Limited both directions
      x = gazeDirection * (1 - severity * 0.6);
      if (Math.abs(gazeDirection) > 0.3) {
        retraction = (Math.abs(gazeDirection) - 0.3) * severity * 0.5;
        fissureNarrowing = retraction * 0.7;
        upshoot = retraction * 0.3;
      }
      break;
  }

  return { x, retraction, upshoot, fissureNarrowing };
}

function Eye({
  position,
  label,
  isAffected,
}: {
  position: EyePosition;
  label: string;
  isAffected: boolean;
}) {
  const eyeWidth = 120;
  const eyeHeight = 60 - position.fissureNarrowing * 20;
  const irisRadius = 22;
  const pupilRadius = 10;

  // Iris position (mapped from -1..1 to pixel offset)
  const maxOffset = eyeWidth / 2 - irisRadius - 5;
  const irisX = position.x * maxOffset;
  const irisY = position.upshoot * -8;

  // Retraction makes the eye slightly smaller
  const scale = 1 - position.retraction * 0.15;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-warm-600">{label}</span>
      <div className="relative">
        <svg
          width={140}
          height={100}
          viewBox="-70 -50 140 100"
          className="drop-shadow-md"
        >
          {/* Eye white (sclera) */}
          <ellipse
            cx={0}
            cy={0}
            rx={eyeWidth / 2 * scale}
            ry={eyeHeight / 2 * scale}
            fill="white"
            stroke={isAffected ? '#14b8a6' : '#d6d3d1'}
            strokeWidth={2}
          />

          {/* Iris */}
          <circle
            cx={irisX * scale}
            cy={irisY * scale}
            r={irisRadius * scale}
            fill={isAffected ? '#0d9488' : '#57534e'}
          />

          {/* Pupil */}
          <circle
            cx={irisX * scale}
            cy={irisY * scale}
            r={pupilRadius * scale}
            fill="#1c1917"
          />

          {/* Light reflection */}
          <circle
            cx={irisX * scale + 4}
            cy={irisY * scale - 4}
            r={3 * scale}
            fill="white"
            opacity={0.7}
          />

          {/* Eyelids (top and bottom) */}
          <path
            d={`M ${-eyeWidth / 2 * scale - 5} 0 Q 0 ${-eyeHeight * scale} ${eyeWidth / 2 * scale + 5} 0`}
            fill="none"
            stroke="#a8a29e"
            strokeWidth={3}
          />
          <path
            d={`M ${-eyeWidth / 2 * scale - 5} 0 Q 0 ${eyeHeight * scale} ${eyeWidth / 2 * scale + 5} 0`}
            fill="none"
            stroke="#a8a29e"
            strokeWidth={2}
          />
        </svg>

        {/* Retraction indicator */}
        {position.retraction > 0.1 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-coral-100 px-1.5 py-0.5 text-xs text-coral-500">
            retraction
          </div>
        )}
      </div>
      {isAffected && (
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
          affected
        </span>
      )}
    </div>
  );
}

export function GazeSimulator() {
  const [gazeDirection, setGazeDirection] = useState(0);
  const [duaneType, setDuaneType] = useState<DuaneType>(1);
  const [severity, setSeverity] = useState(0.7);
  const [affectedEye, setAffectedEye] = useState<AffectedEye>('left');

  const leftEyeAffected = affectedEye === 'left';

  const leftPos = calculateEyePosition(
    gazeDirection,
    duaneType,
    severity,
    leftEyeAffected
  );
  const rightPos = calculateEyePosition(
    gazeDirection,
    duaneType,
    severity,
    !leftEyeAffected
  );

  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams({
      type: String(duaneType),
      severity: String(severity),
      eye: affectedEye,
    });
    return `${window.location.pathname}?${params.toString()}`;
  }, [duaneType, severity, affectedEye]);

  return (
    <div className="rounded-xl border border-warm-200 bg-card p-6">
      {/* Eyes Display */}
      <div className="flex items-center justify-center gap-8 py-6">
        <Eye
          position={leftPos}
          label="Left Eye"
          isAffected={leftEyeAffected}
        />
        <div className="text-2xl text-warm-300">👃</div>
        <Eye
          position={rightPos}
          label="Right Eye"
          isAffected={!leftEyeAffected}
        />
      </div>

      {/* Gaze Direction Label */}
      <div className="mb-2 text-center text-sm text-warm-500">
        Looking: {gazeDirection < -0.3 ? 'Left' : gazeDirection > 0.3 ? 'Right' : 'Straight ahead'}
      </div>

      {/* Controls */}
      <div className="mt-6 space-y-5">
        {/* Gaze Direction */}
        <div>
          <label className="mb-1 flex items-center justify-between text-sm font-medium text-warm-700">
            <span>Gaze Direction</span>
            <span className="text-warm-400">← Left | Right →</span>
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={gazeDirection}
            onChange={(e) => setGazeDirection(parseFloat(e.target.value))}
            className="w-full accent-primary-600"
          />
        </div>

        {/* Duane Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-warm-700">
            Duane Syndrome Type
          </label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDuaneType(type)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  duaneType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                Type {type}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-warm-400">
            {duaneType === 1 && 'Limited outward movement (most common, ~78%)'}
            {duaneType === 2 && 'Limited inward movement (~7%)'}
            {duaneType === 3 && 'Limited both directions (~15%)'}
          </p>
        </div>

        {/* Severity */}
        <div>
          <label className="mb-1 flex items-center justify-between text-sm font-medium text-warm-700">
            <span>Severity</span>
            <span className="text-warm-400">{Math.round(severity * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={severity}
            onChange={(e) => setSeverity(parseFloat(e.target.value))}
            className="w-full accent-primary-600"
          />
        </div>

        {/* Affected Eye */}
        <div>
          <label className="mb-2 block text-sm font-medium text-warm-700">
            Affected Eye
          </label>
          <div className="flex gap-2">
            {(['left', 'right'] as const).map((eye) => (
              <button
                key={eye}
                onClick={() => setAffectedEye(eye)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  affectedEye === eye
                    ? 'bg-primary-600 text-white'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                {eye}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            const url = getShareUrl();
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.origin + url);
            }
          }}
          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
        >
          Copy shareable link
        </button>
      </div>
    </div>
  );
}
