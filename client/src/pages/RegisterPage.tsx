import { useState } from "react";
import { PaymentFlow } from "@/components/payment/components/PaymentFlow";

export function RegisterPage() {
  const [isPaymentFlowOpen, setIsPaymentFlowOpen] = useState(true);

  return (
    <div>
      <PaymentFlow
        isOpen={isPaymentFlowOpen}
        onClose={() => setIsPaymentFlowOpen(false)}
      />
    </div>
  );
}

export default RegisterPage;
