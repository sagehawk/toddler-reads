import { FloatingLetters } from "./components/FloatingLetters";
import { LoginForm } from "./components/LoginForm";

export function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
      <FloatingLetters />
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;