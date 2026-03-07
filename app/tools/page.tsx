import Link from 'next/link';

const tools = [
  { href: '/tools/gaze-simulator', label: 'Gaze Simulator', icon: '\u{1F441}', desc: 'See how DS affects eye movement \u2014 from both observer and patient perspectives' },
  { href: '/tools/screening', label: 'Screening Tool', icon: '\u{1FA7A}', desc: 'Quick assessment for potential Duane Syndrome' },
  { href: '/tools/one-pager', label: 'My DS Card', icon: '\u{1F4C4}', desc: 'Generate a shareable card about your DS' },
  { href: '/tools/explain-templates', label: 'Explain Templates', icon: '\u{1F4AC}', desc: 'Ready-made templates to explain DS to others' },
  { href: '/tools/emergency-card', label: 'Emergency Card', icon: '\u{1198}', desc: 'Printable card for medical emergencies' },
  { href: '/tools/exercise-tracker', label: 'Exercise Tracker', icon: '\u{1F3CB}\uFE0F', desc: 'Track your eye exercises and progress' },
] as const;

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Tools</h1>
      <p className="mt-4 text-warm-600">
        Interactive tools to help understand, explain, and manage Duane Syndrome in daily life.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-warm-200 bg-card p-6 text-center transition-all hover:border-primary-300 hover:shadow-md"
          >
            <span className="text-3xl">{tool.icon}</span>
            <h2 className="mt-2 text-lg font-semibold text-primary-700">{tool.label}</h2>
            <p className="mt-1 text-sm text-warm-500">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
