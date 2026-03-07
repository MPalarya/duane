import { SubmissionForm } from '@/components/content/submission-form';

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Contribute</h1>
      <p className="mt-4 text-warm-600">
        Help grow the Duane Syndrome community. Submit a specialist, share your story,
        suggest a blog post, or contribute a resource. All submissions are reviewed before publishing.
      </p>

      <SubmissionForm />
    </div>
  );
}
