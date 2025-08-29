import { FloatingLetters } from "./components/FloatingLetters";
import { RegisterForm } from "./components/RegisterForm";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
      <FloatingLetters />
      <div className="relative z-10 w-full max-w-md px-4">
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage;