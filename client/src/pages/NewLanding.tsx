import { Button } from "@/components/ui/button";
import { Check, Star, Users, BookOpen, Clock, Trophy, Shield } from "lucide-react";
import FloatingLetters from "@/components/landing/FloatingLetters";

const NewLanding = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingLetters />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">ToddlerReads</div>
          <Button variant="outline" size="sm">Login</Button>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 pb-20">
        {/* Hero Section */}
        <section className="text-center py-12 lg:py-20">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">4.9/5 Stars</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-semibold">12,847+ Happy Parents</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight max-w-5xl mx-auto">
            Turn Your Toddler Into a{' '}
            <span className="text-primary">Reading Superstar</span>{' '}
            in Just 5 Minutes a Day
          </h1>

          {/* Subheadline with Strong Value Prop */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto leading-relaxed">
            The exact step-by-step system that helped <span className="font-bold text-foreground">12,847+ toddlers</span> master phonics without screens, tears, or parent overwhelm.
          </p>

          {/* Urgency & Scarcity */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-destructive font-bold text-lg">
              ⚡ Founder's Pricing Ends Soon: Save 49% Today Only
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Join before we return to full price of $155/year
            </p>
          </div>

          {/* Hero Image/Video Placeholder */}
          <div className="bg-muted/50 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground">Watch: 3-Year-Old Reads First Word</p>
                <p className="text-muted-foreground">(2-minute demo video)</p>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 rounded-full shadow-button transform hover:scale-105 transition-all duration-300 mb-4"
            onClick={() => window.location.href = '/onboarding'}
          >
            Start Your 7-Day FREE Trial →
          </Button>
          
          <p className="text-sm text-muted-foreground">
            No credit card required • Cancel anytime • 100% risk-free
          </p>
        </section>

        {/* Social Proof Results */}
        <section className="py-16 bg-muted/30 rounded-3xl mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real Results from Real Parents
            </h2>
            <p className="text-xl text-muted-foreground">See what happens when toddlers use our system</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[ 
              {
                result: "Reading at age 2.5",
                parent: "Sarah M.",
                quote: "My daughter was reading simple words before her 3rd birthday. The systematic approach made all the difference.",
                timeframe: "After 3 weeks"
              },
              {
                result: "Knows entire alphabet",
                parent: "Mike T.", 
                quote: "We tried everything else. This was the only thing that actually worked. Worth every penny.",
                timeframe: "After 2 weeks"
              },
              {
                result: "Excited about learning",
                parent: "Jessica L.",
                quote: "He asks to do his 'letters' every day. I've never seen him so engaged with learning.",
                timeframe: "After 1 week"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background rounded-xl p-6 shadow-gentle">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{testimonial.result}</h3>
                <p className="text-muted-foreground mb-3 italic">"{testimonial.quote}"</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-foreground">{testimonial.parent}</span>
                  <span className="text-primary font-medium">{testimonial.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Stack */}
        <section className="py-16 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Raise a Reading Superstar
            </h2>
            <p className="text-xl text-muted-foreground">Complete system worth $500+ for just $79/year</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[ 
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "26 Interactive Letter Modules",
                description: "One for each letter, with phonics, writing practice, and fun activities",
                value: "$150 value"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Parent Guidance Videos", 
                description: "Step-by-step instructions so you know exactly what to do",
                value: "$100 value"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Progress Tracking System",
                description: "Watch your child's reading skills grow day by day",
                value: "$75 value"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "5-Minute Daily Lessons",
                description: "Short, effective sessions that fit into any schedule",
                value: "$50 value"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Screen-Free Learning",
                description: "No iPads, no distractions - just pure, focused learning",
                value: "Priceless"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Lifetime Updates",
                description: "New content and improvements added regularly",
                value: "$125 value"
              }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 bg-background rounded-xl p-6 shadow-gentle">
                <div className="text-primary flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-2">{feature.description}</p>
                  <span className="text-primary font-semibold">{feature.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total Value */}
          <div className="text-center mt-12 bg-primary/5 rounded-2xl p-8 max-w-2xl mx-auto border-2 border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">Total Value: $500+</h3>
            <p className="text-muted-foreground mb-4">But you won't pay anywhere near that...</p>
            <div className="text-4xl font-bold text-foreground">
              <span className="line-through text-muted-foreground text-xl">$155</span>{' '}
              <span className="text-primary">$79</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">That's just $6.58/month when billed annually</p>
          </div>
        </section>

        {/* Objection Handling */}
        <section className="py-16 bg-muted/30 rounded-3xl mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              "But My Toddler Won't Sit Still for Learning..."
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've heard every excuse. Here's why ToddlerReads works when everything else fails:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[ 
              {
                objection: "\"My child gets distracted easily\"",
                solution: "Our 5-minute lessons are designed for toddler attention spans. Short bursts = maximum retention."
              },
              {
                objection: "\"I don't have time to teach\"",
                solution: "Each lesson takes less time than changing a diaper. The system does the teaching, you just follow along."
              },
              {
                objection: "\"My child isn't ready yet\"",
                solution: "18+ months is the perfect time. Their brains are wired for language acquisition right now."
              }
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-xl p-6 text-center">
                <p className="text-destructive italic font-medium mb-4">{item.objection}</p>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <p className="text-foreground font-medium">{item.solution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center py-16">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 border-2 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your Child's Reading Future Starts Today
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Every day you wait is another day your child could be building reading confidence. 
              Join 12,847+ parents who chose to give their child this advantage.
            </p>

            <div className="bg-background rounded-xl p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-bold text-lg mb-4">🎁 When You Join Today:</h3>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>7-Day FREE Trial (No Risk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Founder's Pricing: Save 49%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Bonus: Parent Success Guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>100% Money-Back Guarantee</span>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-2xl px-16 py-8 rounded-full shadow-button transform hover:scale-105 transition-all duration-300 mb-6"
              onClick={() => window.location.href = '/onboarding'}
            >
              Yes! Start My FREE Trial →
            </Button>
            
            <p className="text-sm text-muted-foreground mb-4">
              Secure checkout • Cancel anytime • 30-day guarantee
            </p>

            <div className="border-t border-muted pt-6">
              <p className="text-xs text-muted-foreground italic">
                Warning: This founder's pricing expires soon. When we go to full price, 
                this same system will cost $155/year. Secure your spot now.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewLanding;
