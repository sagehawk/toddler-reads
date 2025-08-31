import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative py-10 lg:py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Don't just entertain them. Empower them.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            The simple, parent-led system to give your child a 5-year head start by mastering phonics in just 5 minutes a day.
          </p>
          
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 rounded-full shadow-button transform hover:scale-105 transition-all duration-300"
            >
              Start Your 7-Day Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}