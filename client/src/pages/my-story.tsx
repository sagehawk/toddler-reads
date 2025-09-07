import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

const MyStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="py-4">
        <div className="container mx-auto px-6">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </header>
      
      <main className="py-10 md:py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              My Story: From Struggle to Solution
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              How a father's reading struggles led to creating ToddlerReads
            </p>
          </div>

          <Card className="bg-card border-border shadow-gentle mb-12">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-5xl">👨‍👧</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      The Father Who Was Left Behind
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      I struggled with reading my entire childhood. While other kids effortlessly decoded words, I felt lost and frustrated. The shame of being called on to read aloud in class still haunts me today.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-muted-foreground">
                  <p className="text-lg leading-relaxed">
                    As an adult, I learned that I had missed critical phonemic awareness skills that most children develop naturally between ages 2-4. By the time formal reading instruction began in kindergarten, I was already behind—and I never caught up.
                  </p>

                  <p className="text-lg leading-relaxed">
                    When my son was born, I made a promise: he would never experience the shame and frustration I felt. I researched everything I could about early reading development and discovered the crucial importance of phonics instruction during the toddler years.
                  </p>

                  <p className="text-lg leading-relaxed">
                    But when I looked for tools to help teach my 20-month-old son, I found nothing but flashy games, distracting cartoons, and apps that prioritized entertainment over education. I knew there had to be a better way.
                  </p>

                  <p className="text-lg leading-relaxed">
                    That's when I decided to build ToddlerReads—a simple, focused, parent-led system that gives toddlers the phonemic awareness foundation they need to become confident readers. No distractions, no guilt, just pure learning in 5 minutes a day.
                  </p>

                  <p className="text-lg leading-relaxed font-medium text-foreground">
                    Today, my son reads confidently and joyfully. And now, I want to give your child that same gift—the gift of a strong start that will serve them for life.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button">
                Start Your Child's Reading Journey
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyStory;