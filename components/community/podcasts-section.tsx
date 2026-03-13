interface Podcast {
  title: string;
  platform: string;
  embedUrl: string;
}

interface PodcastsSectionProps {
  podcasts: Podcast[];
}

export function PodcastsSection({ podcasts }: PodcastsSectionProps) {
  return (
    <section id="podcasts">
      <h2 className="text-2xl font-bold text-warm-900">Podcasts</h2>
      <p className="mt-2 text-warm-500">Listen to discussions about Duane Syndrome from experts and advocates.</p>

      <div className="mt-6 grid gap-4">
        {podcasts.map((podcast) => (
          <div key={podcast.embedUrl} className="overflow-hidden rounded-xl border border-warm-200 bg-card">
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-warm-400">{podcast.platform}</p>
              <p className="mt-0.5 text-sm font-semibold text-warm-900">{podcast.title}</p>
            </div>
            <iframe
              src={podcast.embedUrl}
              height="175"
              width="100%"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="border-0"
              title={`${podcast.title} on ${podcast.platform}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
