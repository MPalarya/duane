export type DuaneType = 1 | 2 | 3;
export type AffectedEye = 'left' | 'right';

export interface EyePosition {
  x: number; // -1 (left) to 1 (right)
  retraction: number; // 0 to 1
  upshoot: number; // 0 to 1
  fissureNarrowing: number; // 0 to 1
}

export function calculateEyePosition(
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
