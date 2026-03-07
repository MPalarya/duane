import { ScreeningWizard } from '@/components/screening/screening-wizard';

export default function ScreeningPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Screening Tool</h1>
      <p className="mt-4 text-warm-600">
        Answer a few questions to help understand your eye movement pattern. This is not
        a medical diagnosis — always consult an ophthalmologist for proper evaluation.
      </p>

      <div className="mt-4 rounded-lg border border-coral-200 bg-coral-50 p-4 text-sm text-coral-500">
        <strong>Important:</strong> This information is for educational purposes only and should not replace professional medical advice.
      </div>

      <div className="mt-8">
        <ScreeningWizard />
      </div>
    </div>
  );
}
