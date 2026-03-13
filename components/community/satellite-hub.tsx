import { platformConfig, platformBorderColors } from './platform-icons';

interface CommunityLink {
  _id: string;
  name: string;
  url: string;
  platform?: string;
  description?: string;
  memberCount?: number;
}

interface SatelliteHubProps {
  links: CommunityLink[];
}

export function SatelliteHub({ links }: SatelliteHubProps) {
  return (
    <section id="groups">
      <h2 className="text-2xl font-bold text-warm-900">Communities &amp; Groups</h2>
      <p className="mt-2 text-warm-500">Join the global Duane Syndrome community across platforms.</p>

      <div className="mt-6 grid gap-4">
        {links.map((link) => {
          const platform = link.platform || 'other';
          const borderColor = platformBorderColors[platform] || platformBorderColors.other;
          const cfg = platformConfig[platform];

          return (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group rounded-xl border border-warm-200 border-l-4 ${borderColor} bg-card p-5 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                {cfg && (
                  <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${cfg.bg}`}>
                    {cfg.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-warm-900 group-hover:text-primary-700">{link.name}</h3>
                  {link.description && (
                    <p className="mt-1 text-sm text-warm-500 line-clamp-2">{link.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    {link.memberCount && (
                      <span className="text-xs text-warm-400">{link.memberCount.toLocaleString()} members</span>
                    )}
                    <span className="text-xs font-medium text-primary-600 group-hover:underline">Join &rarr;</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
