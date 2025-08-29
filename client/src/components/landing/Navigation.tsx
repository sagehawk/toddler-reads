import { Button } from "@/components/ui/button";
import toddlerReadsLogo from "@/assets/toddler-reads-logo.png";
import { Link } from "wouter"; // Import Link

export function Navigation() {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/"> {/* Wrap with Link */}
              <img 
                src={toddlerReadsLogo} 
                alt="ToddlerReads Logo" 
                className="h-10 w-auto"
              />
            </Link> {/* Close Link */}
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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
