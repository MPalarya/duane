'use client';

import Image from 'next/image';
import { calculateEyePosition, type DuaneType, type AffectedEye } from './shared';

interface VisionViewProps {
  gazeDirection: number;
  duaneType: DuaneType;
  severity: number;
  affectedEye: AffectedEye;
}

export function VisionView({ gazeDirection, duaneType, severity, affectedEye }: VisionViewProps) {
  const leftEyeAffected = affectedEye === 'left';

  // Calculate positions for both eyes
  const leftPos = calculateEyePosition(gazeDirection, duaneType, severity, leftEyeAffected);
  const rightPos = calculateEyePosition(gazeDirection, duaneType, severity, !leftEyeAffected);

  // The offset between what the two eyes see
  const normalEyeX = leftEyeAffected ? rightPos.x : leftPos.x;
  const affectedEyeX = leftEyeAffected ? leftPos.x : rightPos.x;

  // Misalignment = difference in where the two eyes are pointing
  const misalignment = Math.abs(normalEyeX - affectedEyeX);

  // Ghost image offset in pixels (proportional to misalignment)
  const maxOffset = 50;
  const ghostOffset = misalignment * maxOffset;

  // Ghost: constant opacity, blur increases with misalignment
  const ghostOpacity = 0.6;
  const ghostBlur = Math.min(misalignment * 4, 3);

  // Determine vision status
  let visionStatus: 'clear' | 'mild' | 'significant';
  if (misalignment < 0.05) {
    visionStatus = 'clear';
  } else if (misalignment < 0.3) {
    visionStatus = 'mild';
  } else {
    visionStatus = 'significant';
  }

  const statusConfig = {
    clear: { label: 'Clear vision', color: 'bg-green-100 text-green-700' },
    mild: { label: 'Mild double vision', color: 'bg-amber-100 text-amber-700' },
    significant: { label: 'Significant double vision', color: 'bg-red-100 text-red-700' },
  };

  const { label: statusLabel, color: statusColor } = statusConfig[visionStatus];

  // Direction of ghost offset (affected eye lags, so ghost shifts opposite to gaze)
  const offsetDirection = normalEyeX > affectedEyeX ? 1 : normalEyeX < affectedEyeX ? -1 : 0;
  const ghostTranslateX = ghostOffset * offsetDirection;

  // Pan: zoom in 130% and shift based on gaze direction so it feels like looking around
  const zoom = 1.3;
  const maxPan = 15; // max % the image pans left/right
  const panX = -gazeDirection * maxPan; // negative so looking right pans image left

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Status indicator */}
      <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
        {statusLabel}
      </div>

      {/* Scene with diplopia effect — overflow hidden crops the zoomed image */}
      <div className="relative overflow-hidden rounded-lg border border-warm-200">
        {/* Primary image (dominant eye) */}
        <Image
          src="/images/diplopia-scene.jpeg"
          alt="Street scene with a No Entry sign"
          width={600}
          height={400}
          className="block h-auto w-full max-w-[600px]"
          style={{
            transform: `scale(${zoom}) translateX(${panX}%)`,
            filter: ghostBlur > 0 ? `blur(${ghostBlur}px)` : undefined,
          }}
          priority
        />

        {/* Ghost image (affected eye) — constant opacity, increasing blur */}
        {ghostOffset > 1 && (
          <Image
            src="/images/diplopia-scene.jpeg"
            alt=""
            width={600}
            height={400}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              transform: `scale(${zoom}) translateX(${panX}%) translateX(${ghostTranslateX}px)`,
              opacity: ghostOpacity,
              filter: `blur(${ghostBlur}px)`,
            }}
            priority
          />
        )}
      </div>

      {/* Explanation */}
      <p className="max-w-sm text-center text-xs text-warm-400">
        {visionStatus === 'clear'
          ? 'Both eyes are aligned — the patient sees a single clear image.'
          : `The affected eye can't fully follow the gaze, causing the brain to receive two misaligned images.`}
      </p>
    </div>
  );
}
