import { Link } from "wouter";
import { Bus, Palette, Shapes } from "lucide-react";
import fishImage from '../assets/animals/fish.png';
import appleImage from '../assets/animals/apple.png';
import logoUrl from '../assets/toddler-reads-logo.png';
import { useRef, useEffect } from "react";

type CardProps = {
  icon: React.ReactNode;
  title: string;
  href: string;
  status: "Functional" | "Placeholder";
};

const iconBaseClassName = "w-full h-full object-contain select-none";

const blocks: CardProps[] = [
  {
    title: "First Letters",
    icon: <div className={`${iconBaseClassName} flex items-center justify-center text-7xl md:text-8xl font-bold text-red-500`}>A</div>,
    href: "/phonics",
    status: "Functional"
  },
  {
    title: "Animals",
    icon: <img src={fishImage} alt="Fish" className={iconBaseClassName} draggable="false" />,
    href: "/animals",
    status: "Functional"
  },
  {
    title: "Foods",
    icon: <img src={appleImage} alt="Apple" className={`${iconBaseClassName} p-4`} draggable="false" />,
    href: "#",
    status: "Placeholder"
  },
  { title: "Things That Go", icon: <Bus className={`${iconBaseClassName} text-primary p-4`} />, href: "#", status: "Placeholder" },
  { title: "Colors", icon: <Palette className={`${iconBaseClassName} text-primary p-4`} />, href: "#", status: "Placeholder" },
  { title: "Shapes", icon: <Shapes className={`${iconBaseClassName} text-primary p-4`} />, href: "#", status: "Placeholder" },
];


const LearningBlock = ({ icon, title, href, status }: CardProps) => {
  const isPlaceholder = status === "Placeholder";

  const content = (
    <div
      className={`
        aspect-square rounded-3xl bg-white shadow-lg
        flex flex-col p-2 sm:p-3 h-full w-full
        transition-all duration-200 ease-in-out
        transform hover:-translate-y-1 hover:shadow-xl
        active:scale-95
        ${isPlaceholder ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">{icon}</div>
      <div className="flex-shrink-0 h-[2.5rem] sm:h-[3rem] flex items-center justify-center">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-foreground">
          {title}
        </h3>
      </div>
    </div>
  );

  if (isPlaceholder) {
    return content;
  }

  return <Link href={href} draggable="false">{content}</Link>;
};

const DigitalPlayshelf = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-dvh w-full bg-muted/30 flex flex-col items-center justify-start pt-16 sm:pt-20 gap-10 overflow-hidden">
        <div className="flex-shrink-0">
            <img src={logoUrl} alt="ToddlerReads Logo" className="h-16 sm:h-20 select-none" draggable="false" />
        </div>
        <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-6 custom-scrollbar cursor-grab active:cursor-grabbing">
            <div className="flex flex-nowrap gap-6 w-max mx-auto px-4 sm:px-8">
            {blocks.map((block, index) => (
                <div key={index} className="w-60 sm:w-72 flex-shrink-0">
                  <LearningBlock {...block} />
                </div>
            ))}
            </div>
        </div>
    </div>
  );
};

export default DigitalPlayshelf;
