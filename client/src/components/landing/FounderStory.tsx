import { Link } from "wouter";

export function FounderStory() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            From a Father Who Was Left Behind...
          </h2>
          <img 
            src="https://i.imgur.com/your-founder-photo.png" // Placeholder - replace with your photo
            alt="Founder of ToddlerReads" 
            className="mx-auto rounded-full h-32 w-32 object-cover mb-6"
          />
          <p className="text-lg text-muted-foreground mb-6">
            I struggled with reading my whole life. I built ToddlerReads to ensure my son had the confident start I never did. 
            <Link href="/my-story">
              <a className="text-primary hover:underline ml-1">Read our full story here.</a>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
