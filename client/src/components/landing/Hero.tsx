import { Button } from "@/components/ui/button";
// import heroImage from "@/assets/landing.png"; // Original image, consider replacing with a local asset that meets transparency and cropping requirements

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Attention Grabber */}
          <div className="mb-6">
            <span className="inline-block bg-destructive/10 text-destructive px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide">
              ATTENTION: Parents of Toddlers (18-36 months)
            </span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Finally, Watch Your Toddler{' '}
            <span className="text-primary">Master Phonics</span>{' '}
            in 5 Minutes a Day...
          </h1>
          
          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            ...Without Distracting Cartoons or Guilt-Inducing Screen Time for Just{' '}
            <span className="line-through text-muted-foreground">$155</span>{' '}
            <span className="text-destructive font-bold text-3xl">$79</span> a Year
          </p>
          
          {/* Hero Image */}
          <div className="mb-12">
            <img 
              src="https://i.imgur.com/KiYZVoC.png" // Using external URL from example, replace with local asset if available
              alt="ToddlerReads App in Action" 
              className="mx-auto rounded-2xl shadow-gentle max-w-full h-auto"
            />
          </div>
          
          {/* Video CTA */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <div className="bg-muted/50 rounded-xl p-8 text-center max-w-sm">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">See It In Action</h3>
              <p className="text-muted-foreground">Watch The 2-Min Story</p>
            </div>
          </div>
          
          {/* Guarantee */}
          <div className="mb-8">
            <p className="text-lg font-semibold text-foreground">
              100% "They'll Love Learning" Guarantee or Your Money Back
            </p>
          </div>
          
          {/* Primary CTA */}
          <div className="mb-8">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 rounded-full shadow-button transform hover:scale-105 transition-all duration-300"
            >
              Start Your 7-Day Free Trial
            </Button>
          </div>
          
          {/* Payment Icons */}
          <div className="flex items-center justify-center gap-4 opacity-60">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <span>VISA</span>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <span>MasterCard</span>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <span>Discover</span>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <span>American Express</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}