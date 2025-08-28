import { Card, CardContent } from "@/components/ui/card";
import icon1 from "@/assets/1.png";
import icon2 from "@/assets/2.png";
import icon3 from "@/assets/3.png";

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
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            More Learning, Less Fuss.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our simple 3-step process makes phonics mastery effortless
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="relative bg-card border-border shadow-gentle hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm overflow-hidden">
                    <img src={step.icon} alt={step.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div classNameName="text-4xl mb-6 mt-4">
                  {/* Removed the separate div for the icon, as it's now in the circle */}
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};