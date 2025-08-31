import { PlayCircle, BookOpen, Zap } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            More learning, less shucking.
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <PlayCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Start a Session</h3>
              <p className="text-muted-foreground">
                Launch a guided lesson in seconds. No complex menus, no distractions.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Guide Their Discovery</h3>
              <p className="text-muted-foreground">
                Use our simple Drill Mode and Magic Letter Tray to practice the exact sounds your child needs.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Reinforce with Play</h3>
              <p className="text-muted-foreground">
                Switch to our calm, automated Play Mode for guilt-free practice while you get things done.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
