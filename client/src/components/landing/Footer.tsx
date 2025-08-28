import toddlerReadsLogo from "@/assets/toddler-reads-logo.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <img 
              src={toddlerReadsLogo} 
              alt="ToddlerReads Logo" 
              className="h-8 w-auto filter brightness-0 invert"
            />
          </div>
          
          <div className="text-center mb-6 md:mb-0">
            <p className="text-lg font-medium">
              Get started and see the progress.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#about" 
              className="text-background/80 hover:text-background transition-colors"
            >
              About
            </a>
            <a 
              href="#privacy" 
              className="text-background/80 hover:text-background transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#terms" 
              className="text-background/80 hover:text-background transition-colors"
            >
              Terms
            </a>
            <a 
              href="#contact" 
              className="text-background/80 hover:text-background transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/60">
            © 2024 ToddlerReads. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};