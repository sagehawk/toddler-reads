import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SubscriptionData {
  isSubscribed: boolean;
  plan: "monthly" | "annual" | null;
  status: "active" | "trial" | "cancelled" | "past_due";
  trialEndsAt?: string;
  nextBillingDate?: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  updateSubscription: (data: Partial<SubscriptionData>) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    isSubscribed: false,
    plan: null,
    status: "trial",
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to check subscription status
      // In a real app, this would call your backend or Stripe API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock subscription data - replace with real API call
      const mockData: SubscriptionData = {
        isSubscribed: true,
        plan: "annual",
        status: "trial",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      setSubscription(mockData);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = (data: Partial<SubscriptionData>) => {
    setSubscription(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        refreshSubscription,
        updateSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}