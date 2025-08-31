import { FloatingLetters } from "@/components/landing/FloatingLetters";
import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { ProductMockup } from "@/components/landing/ProductMockup";
import { FounderStory } from "@/components/landing/FounderStory";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { StickyCTA } from "@/components/landing/StickyCTA";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingLetters />
      <div className="relative z-10">
        <Navigation />
        <Hero />
        <ProductMockup />
        <FounderStory />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
      <StickyCTA />
    </div>
  );
}
