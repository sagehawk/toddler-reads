import { Link } from "wouter";
import { BookOpen, Cat, Apple, Bus, Palette, Shapes } from "lucide-react";

type CardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  status: "Functional" | "Placeholder"; // adjust as needed
};

const blocks: CardProps[] = [
  { title: "First Letters", icon: BookOpen, href: "/phonics", status: "Functional" },
  { title: "Animals", icon: Cat, href: "/animals", status: "Functional" },
  { title: "Foods", icon: Apple, href: "#", status: "Placeholder" },
  { title: "Things That Go", icon: Bus, href: "#", status: "Placeholder" },
  { title: "Colors", icon: Palette, href: "#", status: "Placeholder" },
  { title: "Shapes", icon: Shapes, href: "#", status: "Placeholder" },
];


const LearningBlock = ({ icon, title, href, status }: CardProps) => {
  const Icon = icon;
  const isPlaceholder = status === "Placeholder";

  const content = (
    <div
      className={`
        aspect-square rounded-3xl bg-white shadow-lg
        flex flex-col items-center justify-center
        p-4 sm:p-6
        transition-all duration-200 ease-in-out
        transform hover:-translate-y-2 hover:shadow-2xl
        active:scale-95
        ${isPlaceholder ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      <Icon className="w-16 h-16 sm:w-24 sm:h-24 text-primary mb-4" />
      <h3 className="text-lg sm:text-2xl font-bold text-center text-foreground">
        {title}
      </h3>
    </div>
  );

  if (isPlaceholder) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
};

const DigitalPlayshelf = () => {
  const blocks = [
    {
      title: "First Letters",
      icon: BookOpen,
      href: "/phonics",
      status: "Functional",
    },
    { title: "Animals", icon: Cat, href: "/animals", status: "Functional" },
    { title: "Foods", icon: Apple, href: "#", status: "Placeholder" },
    { title: "Things That Go", icon: Bus, href: "#", status: "Placeholder" },
    { title: "Colors", icon: Palette, href: "#", status: "Placeholder" },
    { title: "Shapes", icon: Shapes, href: "#", status: "Placeholder" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-muted/30 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {blocks.map((block, index) => (
            <LearningBlock key={index} {...block} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalPlayshelf;