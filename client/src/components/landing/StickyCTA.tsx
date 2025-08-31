import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";

export function StickyCTA() {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 400px
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border transition-transform duration-300 z-50 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link href="/register">
        <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-button">
          Start Your 7-Day Free Trial
        </Button>
      </Link>
    </div>
  );
}
