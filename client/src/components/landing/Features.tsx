import icon1 from "@/assets/feature-1.svg";
import icon2 from "@/assets/feature-2.svg";
import icon3 from "@/assets/feature-3.svg";

const steps = [
  {
    number: "01",
    title: "Start a Session",
    description: "Launch a guided lesson in seconds. No complex menus, no distractions.",
    icon: icon1
  },
  {
    number: "02", 
    title: "Guide Their Discovery",
    description: "Use our simple Drill Mode and Magic Letter Tray to practice the exact sounds your child needs.",
    icon: icon2
  },
  {
    number: "03",
    title: "Reinforce with Play", 
    description: "Switch to our calm, automated Play Mode for guilt-free practice while you get things done.",
    icon: icon3
  }
];

export function Features() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            More Learning, Less Fuss.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our simple 3-step process makes phonics mastery effortless
          </p>
        </div>
        
        {/* Updated grid layout */}
        <div className="grid md:grid-cols-3 gap-x-8 gap-y-16 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4 p-2">
                <img src={step.icon} alt={step.title} className="h-12 w-12" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-black text-foreground mb-3">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};