import { ExplainTemplates } from '@/components/tools/explain-templates';

export default function ExplainTemplatesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">&quot;Explain to My...&quot; Templates</h1>
      <p className="mt-4 text-warm-600">
        Pre-written scripts to help you explain Duane Syndrome to different people in your life.
        Customize them with your specific type, then copy and use however you need.
      </p>

      <div className="mt-8">
        <ExplainTemplates />
      </div>
    </div>
  );
}
