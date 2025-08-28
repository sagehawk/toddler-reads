import { FloatingLetters } from "@/components/landing/FloatingLetters";
import { Navigation } from "@/components/landing/Navigation";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { FounderStory } from "@/components/landing/FounderStory";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingLetters />
      <div className="relative z-10">
        <Navigation />
        <SocialProofBar />
        <Hero />
        <Features />
        <FounderStory />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
