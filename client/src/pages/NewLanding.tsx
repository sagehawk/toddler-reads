import { Link } from "wouter";
import { Bus, Palette, Shapes } from "lucide-react";
import fishImage from '../assets/animals/fish.png';
import appleImage from '../assets/animals/apple.png';
import logoUrl from '../assets/toddler-reads-logo.png';

const blocks = [
  {
    title: "First Letters",
    icon: <div className="w-full h-full object-contain select-none flex items-center justify-center text-7xl md:text-8xl font-bold text-red-500">A</div>,
    href: "/phonics",
  },
  {
    title: "Animals",
    icon: <img src={fishImage} alt="Fish" className="w-full h-full object-contain select-none" draggable="false" />,
    href: "/animals",
  },
  {
    title: "Foods",
    icon: <img src={appleImage} alt="Apple" className="w-full h-full object-contain select-none p-4" draggable="false" />,
    href: "#",
  },
  { title: "Things That Go", icon: <Bus className="w-full h-full object-contain select-none text-primary p-4" />, href: "#" },
  { title: "Colors", icon: <Palette className="w-full h-full object-contain select-none text-primary p-4" />, href: "#" },
  { title: "Shapes", icon: <Shapes className="w-full h-full object-contain select-none text-primary p-4" />, href: "#" },
];

const HomePageIcon = ({ icon, href }: { icon: React.ReactNode; href: string; }) => {
  const isPlaceholder = href === "#";
  const content = (
    <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 p-2 rounded-3xl bg-card shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:scale-95 ${isPlaceholder ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  );

  if (isPlaceholder) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
};

const DigitalPlayshelf = () => {
  return (
    <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-around pt-16 sm:pt-20 gap-10">
      <div className="flex-shrink-0">
        <img src={logoUrl} alt="ToddlerReads Logo" className="h-16 sm:h-20 select-none" draggable="false" />
      </div>
      <div className="w-full max-w-lg mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 p-2 place-items-center">
          {blocks.map((block, index) => (
            <HomePageIcon key={index} icon={block.icon} href={block.href} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalPlayshelf;
