import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-gray-900">Simple, All-Access Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">
            One plan. Every feature. Unlimited learning.
          </p>
        </div>
        <div className="mt-16 flex justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <p className="text-lg font-medium text-jive-teal">Founders Plan</p>
            <p className="mt-2 text-5xl font-bold text-gray-900">$79<span className="text-lg font-medium text-gray-500">/year</span></p>
            <p className="text-gray-500 mt-2">Billed annually. Cancel anytime.</p>
            <ul className="mt-8 space-y-4 text-left">
              <li className="flex items-center"><Check className="h-5 w-5 text-jive-green mr-2" /> Unlimited access to all decks</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-jive-green mr-2" /> Parent-led Drill Mode</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-jive-green mr-2" /> Child-led Play Mode</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-jive-green mr-2" /> Progress tracking</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-jive-green mr-2" /> Premium support</li>
            </ul>
            <Button size="lg" className="w-full mt-8 bg-jive-teal hover:bg-jive-teal/90 text-white text-lg py-6 rounded-full shadow-lg">
              Start Your 7-Day Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
