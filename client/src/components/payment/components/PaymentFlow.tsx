import { useState } from "react";
import { SignupModal } from "@/components/payment/components/SignupModal";
import { PaymentModal } from "@/components/payment/components/PaymentModal";

interface PaymentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

interface UserData {
  email: string;
  password: string;
}

export function PaymentFlow({ isOpen, onClose, onPaymentSuccess }: PaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState<"signup" | "payment">("signup");
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleContinueToPayment = (data: UserData) => {
    setUserData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = () => {
    onPaymentSuccess?.();
    onClose();
    // Reset flow for next time
    setCurrentStep("signup");
    setUserData(null);
  };

  const handleCloseFlow = () => {
    onClose();
    // Reset flow
    setCurrentStep("signup");
    setUserData(null);
  };

  return (
    <>
      <SignupModal
        isOpen={isOpen && currentStep === "signup"}
        onClose={handleCloseFlow}
        onContinueToPayment={handleContinueToPayment}
      />
      
      <PaymentModal
        isOpen={isOpen && currentStep === "payment"}
        onClose={handleCloseFlow}
        userEmail={userData?.email || ""}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}