import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <Link href="/register">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 rounded-full shadow-button transform hover:scale-105 transition-all duration-300"
          >
            Start Your 7-Day Free Trial
          </Button>
        </Link>
        <p className="text-muted-foreground mt-4">
          Cancel anytime. 100% risk-free.
        </p>
      </div>
    </section>
  );
}