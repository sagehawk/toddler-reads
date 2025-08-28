import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FounderStory() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border shadow-gentle">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  "From a Father Who Was Left Behind..."
                </h2>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-4xl">👨‍👧</span>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    I struggled with reading my whole life. I built ToddlerReads to ensure my son had the confident start I never did. Every feature, every lesson, every moment in this app comes from a father's love and determination.
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Read Our Full Story →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
