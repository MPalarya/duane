import { GazeSimulator } from '@/components/gaze-simulator/gaze-simulator';

export default function GazeSimulatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Gaze Simulator</h1>
      <p className="mt-4 text-warm-600">
        See how Duane Syndrome affects eye movement from two perspectives: the <strong>Observer View</strong> shows
        how the eyes appear to others, while the <strong>Patient View</strong> simulates the double vision (diplopia)
        that patients may experience. Adjust the controls to explore different types and severity levels.
      </p>

      <div className="mt-8">
        <GazeSimulator />
      </div>

      <p className="mt-6 text-sm text-warm-400 italic">
        This information is for educational purposes only and should not replace professional medical advice.
      </p>
    </div>
  );
}
