import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Jessica M.",
    text: "I was honestly shocked. Within a week, my 22-month-old was pointing to letters and making the right sounds. We do our 'letter time' every morning now, and he loves it. This is the first app that doesn't feel like a guilty distraction.",
    image: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    name: "David R.",
    text: "The best part is the simplicity. No confusing games or characters, just pure, focused learning. My son's preschool teacher asked what we were doing at home because his phonemic awareness is so far ahead of his peers. Worth every penny.",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sarah P.",
    text: "As a mom who struggled with reading as a kid, finding ToddlerReads felt like a gift. The founder's story hit home, and the app delivered. It's calm, effective, and something we both enjoy doing together.",
    image: "https://randomuser.me/api/portraits/women/45.jpg"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Parents Are Saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from real families seeing real results
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border shadow-gentle hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    <div className="flex text-yellow-500 text-sm">
                      ★★★★★
                    </div>
                  </div>
                </div>
                <blockquote className="text-muted-foreground leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};