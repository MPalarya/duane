import { HeroSection } from '@/components/home/hero-section';
import { FourPaths } from '@/components/home/four-paths';
import { WallOfStars } from '@/components/home/wall-of-stars';
import { HackWidget } from '@/components/home/hack-widget';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FourPaths />
      <WallOfStars />
      <HackWidget />
    </div>
  );
}
