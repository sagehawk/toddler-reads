import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import logoUrl from '../assets/toddler-reads-logo.png';
import whiteLogoUrl from '../assets/toddler-reads-logo-white.png';
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { title: "Phonics", href: "/phonics", color: "bg-red-500" },
  { title: "Vocab", href: "/vocab", color: "bg-blue-500" },
  { title: "Sentences", href: "/sentences", color: "bg-green-500" },
];

const DigitalPlayshelf = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-evenly p-4 sm:p-6 md:p-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="flex-shrink-0">
        <img src={isDarkMode ? whiteLogoUrl : logoUrl} alt="ToddlerReads Logo" className="h-20 sm:h-24 select-none" draggable="false" />
      </div>
      <div className="w-full max-w-md mx-auto flex flex-col gap-y-4 sm:gap-y-6">
        {menuItems.map((item) => (
          <Link key={item.title} href={item.href} className={`w-full p-8 sm:p-10 rounded-2xl text-white text-4xl sm:text-5xl font-bold text-center shadow-lg transition-transform transform hover:-translate-y-1 active:scale-95 ${item.color}`}>
              {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DigitalPlayshelf;
