import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What age is ToddlerReads for?",
    answer: "ToddlerReads is designed for children aged 18 to 36 months who are beginning their reading journey.",
  },
  {
    question: "Is this another app I just hand to my child?",
    answer: "No. ToddlerReads is a parent-led system. You are the guide, and the app is your tool. We believe in active, engaged learning, not passive screen time.",
  },
  {
    question: "How long should we use it each day?",
    answer: "Just 5 minutes a day is all it takes to build a strong phonetic foundation. Consistency is more important than duration.",
  },
  {
    question: "What if my child doesn't like it?",
    answer: "We offer a 100% 'They'll Love Learning' guarantee. If you or your child aren't completely satisfied within the first 30 days, we'll refund your entire purchase.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-screen-md mx-auto px-6">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
