import { Button } from "@/components/ui/button";
import toddlerReadsLogo from "@/assets/toddler-reads-logo.png";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/AuthContext";
import { AccountManagement } from "@/components/payment";
import { useSubscription } from "@/components/payment";

export function Navigation() {
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const [, setLocation] = useLocation();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <img 
                src={toddlerReadsLogo} 
                alt="ToddlerReads Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                  onClick={() => setLocation("/app")}
                >
                  Go to App
                </Button>
                <AccountManagement 
                  userEmail={user.email || ""}
                  subscriptionStatus={subscription.status}
                  subscriptionPlan={subscription.plan || "monthly"}
                  trialEndsAt={subscription.trialEndsAt}
                  nextBillingDate={subscription.nextBillingDate}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-foreground hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
