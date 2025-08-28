import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Give Your Child the Gift of Confident Reading
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join hundreds of families who've already discovered the ToddlerReads difference. 
            Start your 7-day free trial today.
          </p>
          
          <div className="mb-6">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 rounded-full shadow-button transform hover:scale-105 transition-all duration-300"
            >
              Start Your 7-Day Free Trial
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Cancel anytime. 100% risk-free.
          </p>
          
          <div className="mt-8">
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80 underline text-lg"
            >
              Claim Your Spot Now Before The Founders' Price Ends!
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};