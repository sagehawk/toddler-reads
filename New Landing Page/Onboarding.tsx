import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, Clock, Users } from "lucide-react";
import FloatingLetters from "@/components/FloatingLetters";

const Onboarding = () => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  useEffect(() => {
    // Load Stripe script
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleStartTrial = () => {
    const stripeLinks = {
      monthly: 'https://buy.stripe.com/cNi14o2f21qq6kNaLS9fW01',
      annual: 'https://buy.stripe.com/bIY28s6viaYS7oR28b'
    };

    // Open Stripe checkout in a new tab
    window.open(stripeLinks[selectedPlan], '_blank');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingLetters />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">Step 1 of 2: Choose Your Plan</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              You're Almost Ready to Transform Your Child's Reading!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-2">
              Choose your plan and start your <span className="font-bold text-foreground">7-day FREE trial</span> today.
            </p>
            
            <p className="text-sm text-muted-foreground">
              No charges today • Cancel anytime • 100% money-back guarantee
            </p>
          </div>

          {/* Social Proof */}
          <div className="bg-muted/30 rounded-2xl p-6 mb-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-lg font-semibold">4.9/5 Stars</span>
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold">12,847+ Parents</span>
            </div>
            
            <p className="text-muted-foreground italic">
              "The best investment we've made in our daughter's education. She's reading at 2.5!" - Sarah M.
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Annual Plan */}
            <div 
              className={`relative border-2 rounded-2xl p-8 cursor-pointer transition-all ${
                selectedPlan === 'annual' 
                  ? 'border-primary bg-primary/5 shadow-button' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan('annual')}
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR - SAVE 49%
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Annual Plan</h3>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-foreground">
                    $79
                    <span className="text-lg font-normal text-muted-foreground">/year</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="line-through">$155</span> 
                    <span className="text-primary font-bold ml-2">Save $76!</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Just $6.58/month</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">7-Day FREE Trial</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">All 26 Letter Modules</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">Parent Guidance Videos</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-primary">BONUS: Success Guide</span>
                  </div>
                </div>

                {selectedPlan === 'annual' && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Plan */}
            <div 
              className={`border-2 rounded-2xl p-8 cursor-pointer transition-all ${
                selectedPlan === 'monthly' 
                  ? 'border-primary bg-primary/5 shadow-button' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Monthly Plan</h3>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-foreground">
                    $12.99
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">7-Day FREE Trial</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">All 26 Letter Modules</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">Parent Guidance Videos</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm">Progress Tracking</span>
                  </div>
                </div>

                {selectedPlan === 'monthly' && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guarantee Section */}
          <div className="bg-muted/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">100% Risk-Free Guarantee</h3>
                <p className="text-muted-foreground">
                  Try ToddlerReads for 7 days completely free. If you're not amazed by your child's progress, 
                  cancel with one click. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/20">
            <h3 className="font-bold text-lg text-foreground mb-4 text-center">
              🎉 What Happens After You Click "Start FREE Trial":
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">1</span>
                </div>
                <p className="text-sm font-medium">Secure Stripe Checkout</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">2</span>
                </div>
                <p className="text-sm font-medium">Instant Access to App</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">3</span>
                </div>
                <p className="text-sm font-medium">Start First Lesson</p>
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <Button
              onClick={handleStartTrial}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-16 py-6 rounded-full shadow-button transform hover:scale-105 transition-all duration-300 mb-4"
            >
              Start My 7-Day FREE Trial →
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Setup takes less than 2 minutes</span>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground mb-4">Trusted by thousands of parents worldwide</p>
            
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="bg-background rounded-lg p-3 shadow-sm">
                <div className="w-12 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
              </div>
              <div className="bg-background rounded-lg p-3 shadow-sm">
                <div className="w-12 h-6 bg-gradient-to-r from-red-600 to-orange-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MC</span>
                </div>
              </div>
              <div className="bg-background rounded-lg p-3 shadow-sm">
                <div className="w-12 h-6 bg-gradient-to-r from-green-600 to-green-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AMEX</span>
                </div>
              </div>
              <div className="bg-background rounded-lg p-3 shadow-sm">
                <div className="w-12 h-6 bg-gradient-to-r from-purple-600 to-purple-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔒</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;