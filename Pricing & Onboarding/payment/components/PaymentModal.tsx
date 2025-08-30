import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onPaymentSuccess: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  period: string;
  buyButtonId: string;
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "annual",
    name: "Annual Plan",
    price: "$79",
    originalPrice: "$155.88",
    savings: "Save 49%",
    period: "for 12 months",
    buyButtonId: "buy_btn_1S1ckfJ10cc84vpxBNDghzqC",
    isPopular: true,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "$12.99",
    period: "per month",
    buyButtonId: "buy_btn_1S1cXlJ10cc84vpx3EfWUVFT",
  },
];

export function PaymentModal({ isOpen, onClose, userEmail, onPaymentSuccess }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Stripe script
    if (isOpen && !document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [isOpen]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleStartTrial = () => {
    setIsLoading(true);
    const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan);
    
    if (selectedPlanData) {
      // Set a flag to indicate payment completion for onboarding
      sessionStorage.setItem('just_completed_payment', 'true');
      
      // Create and click the Stripe buy button programmatically
      const stripeButton = document.createElement('stripe-buy-button');
      stripeButton.setAttribute('buy-button-id', selectedPlanData.buyButtonId);
      stripeButton.setAttribute('publishable-key', 'pk_live_51R1C8FJ10cc84vpxhVLrGWZXz10Jlf3NKPhwXeIs2OLOm273LQ16XOxlapZWjkjzObruDihiHP1gBsm4RKiWqKO500WJ5qPoK0');
      
      // Hide the button and trigger click
      stripeButton.style.display = 'none';
      document.body.appendChild(stripeButton);
      
      // Simulate click after a brief delay
      setTimeout(() => {
        const button = stripeButton.shadowRoot?.querySelector('button');
        if (button) {
          button.click();
        }
        document.body.removeChild(stripeButton);
        setIsLoading(false);
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-8 bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-foreground">
            Your Risk-Free Trial Awaits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-foreground">
              You won't be charged today. Your 7-day free trial begins now.
            </p>
            <p className="text-muted-foreground">
              If you don't love it, you can cancel with one click at any time. We'll even send you a reminder 2 days before your trial ends.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${plan.isPopular ? "ring-2 ring-primary ring-opacity-20" : ""}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-foreground">
                      {plan.price}
                      <span className="text-base font-normal text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through">{plan.originalPrice}</span>
                        <span className="text-green-600 font-medium ml-2">{plan.savings}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedPlan === plan.id && (
                    <div className="flex justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">What's included:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Complete alphabet learning system
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Interactive phonics lessons
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Progress tracking tools
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Parent guidance videos
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                7-day money-back guarantee
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartTrial}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start My Free Trial & Unlock All Lessons"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Account for {userEmail}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}