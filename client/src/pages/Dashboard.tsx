import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import logoUrl from '../assets/toddler-reads-logo.png';
import whiteLogoUrl from '../assets/toddler-reads-logo-white.png';
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { title: "ABC", href: "/phonics", color: "bg-primary" },
  { title: "123", href: "/numbers", color: "bg-numbers" },
  { title: "Words", href: "/vocab", color: "bg-accent" },
  { title: "Read", href: "/sentences", color: "bg-destructive" },
];

const DigitalPlayshelf = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-2 pb-4 sm:pb-6 md:pb-8 relative gap-y-12 sm:gap-y-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="flex-shrink-0 mt-[-7vh] mb-4">
        <Link href="/story/all" className="pb-[3vh]">
          <img src={isDarkMode ? whiteLogoUrl : logoUrl} alt="ToddlerReads Logo" className="h-24 sm:h-28 select-none cursor-pointer" draggable="false" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </Link>
      </div>
      <div className="w-full max-w-md mx-auto flex flex-col gap-y-4 sm:gap-y-4 md:-mt-16">
        {menuItems.map((item) => (
          <Link 
            key={item.title} 
            href={item.href} 
            className={`w-full p-8 sm:p-4 md:p-6 rounded-2xl text-white text-5xl sm:text-4xl md:text-5xl font-bold text-center shadow-button-strong hover:shadow-button-stronger transition-all transform hover:-translate-y-1 active:scale-95 ${item.color}`}
            style={{ textShadow: `-3px -3px 0 hsl(var(--${item.color.replace('bg-', '')}-darker)), 3px -3px 0 hsl(var(--${item.color.replace('bg-', '')}-darker)), -3px 3px 0 hsl(var(--${item.color.replace('bg-', '')}-darker)), 3px 3px 0 hsl(var(--${item.color.replace('bg-', '')}-darker))` }}
          >
              {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DigitalPlayshelf;
