import { useAuth } from "@/hooks/AuthContext";
import { FloatingLetters } from "./components/FloatingLetters";
import { RegisterForm } from "./components/RegisterForm";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function RegisterPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return <div>Loading...</div>;
  }

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