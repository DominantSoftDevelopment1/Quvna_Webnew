import { HomeBanner } from "@/components/home/HomeBanner";
import { HomeDonate } from "@/components/home/HomeDonate";
import { HomeTournamentList } from "@/components/home/HomeTournamentList";
import { HomeGameClubs } from "@/components/home/HomeGameClubs";
import { HomeMiniApps } from "@/components/home/HomeMiniApps";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Banner - Live Streams */}
      <HomeBanner />

      {/* Donate Section */}
      <div className="home-section">
        <SectionTitle
          title="Donat qilish"
          href="/donate"
          icon="/icons/money.svg"
        />
        <HomeDonate />
      </div>

      {/* Tournament CTA */}
      <div className="home-section">
        <HomeTournamentList />
      </div>

      {/* Mini Apps Section */}
      <div className="home-section">
        <SectionTitle
          title="Mini App"
          href="/miniapp"
          icon="/icons/game.svg"
        />
        <HomeMiniApps />
      </div>

      {/* Game Clubs Section */}
      <div className="home-section">
        <SectionTitle
          title="Game Klublar"
          href="/game-clubs"
          icon="/icons/location.svg"
        />
        <HomeGameClubs />
      </div>
    </div>
  );
}
