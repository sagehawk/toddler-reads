import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation, useRoute } from "wouter";
import NewLanding from "./pages/NewLanding";
import Onboarding from "./pages/Onboarding";
import PhonicsApp from "./components/PhonicsApp";
import MyStory from "./pages/my-story"; // Import MyStory
import NotFound from "./pages/not-found";
import LoginPage from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth, AuthProvider } from "./hooks/AuthContext";
import { SubscriptionProvider } from "@/components/payment";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SubscriptionProvider>
            <AppContent />
          </SubscriptionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={NewLanding} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <ProtectedRoute path="/app" component={PhonicsApp} />
      <Route path="/my-story" component={MyStory} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;

