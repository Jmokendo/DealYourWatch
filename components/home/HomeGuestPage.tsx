import HomeNavbar from "./HomeNavbar";
import HeroSection from "./HeroSection";
import BrandStrip from "./BrandStrip";
import NewArrivalsSection from "./NewArrivalsSection";
import LiveNegotiationsSection from "./LiveNegotiationsSection";
import HowItWorksSection from "./HowItWorksSection";
import TrustBar from "./TrustBar";
import SellCtaSection from "./SellCtaSection";
import HomeFooter from "./HomeFooter";

export default function HomeGuestPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5f2] text-[#111111]">
      <HomeNavbar />
      <main className="flex-1">
        <HeroSection />
        <BrandStrip />
        <NewArrivalsSection />
        <LiveNegotiationsSection />
        <HowItWorksSection />
        <SellCtaSection />
        <TrustBar />
      </main>
      <HomeFooter />
    </div>
  );
}
