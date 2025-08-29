import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import toddlerReadsLogo from '@/assets/toddler-reads-logo.png';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 shadow-md backdrop-blur-lg' : 'bg-transparent'}`}>
      <nav className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <img src={toddlerReadsLogo} alt="ToddlerReads Logo" className="h-10" />
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/about" className="font-medium text-gray-600 hover:text-jive-teal">About Us</Link>
          <Link href="/contact" className="font-medium text-gray-600 hover:text-jive-teal">Contact Us</Link>
        </div>
        <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-jive-teal hover:bg-jive-teal/90 text-white" asChild>
                <Link href="/signup">Try Now $79/yr</Link>
            </Button>
        </div>
      </nav>
    </header>
  );
}
