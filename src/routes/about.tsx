import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | MedJourney" },
      {
        name: "description",
        content:
          "What MedJourney does, how enquiries are handled, and why treatment decisions belong with you and your doctor.",
      },
      { property: "og:title", content: "About Us | MedJourney" },
      {
        property: "og:description",
        content: "Learn about our coordination service for treatment abroad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="About MedJourney" title="Help with the practical side of treatment abroad">
        Choosing care in another country brings a lot of questions. Our role is to help you find
        information and speak with hospitals. Your doctor remains the right person to advise you
        about treatment.
      </PageHero>
      <div className="container-page grid gap-12 py-16 md:grid-cols-3">
        {[
          {
            t: "Know what has been checked",
            d: "Profiles show whether credentials or accreditation details have been checked. You should also confirm them directly with the hospital.",
          },
          {
            t: "Take your time",
            d: "Asking a question or requesting an estimate does not commit you to treatment. You decide whether to go ahead.",
          },
          {
            t: "Start with a simple enquiry",
            d: "Tell us what you're considering and how to reach you. There is no need to send medical records at this stage.",
          },
        ].map((x) => (
          <div key={x.t}>
            <h2 className="text-xl font-semibold">{x.t}</h2>
            <p className="mt-2 text-muted-foreground">{x.d}</p>
          </div>
        ))}
      </div>
      <div className="container-page">
        <Button asChild size="lg">
          <Link to="/contact">Talk to a coordinator</Link>
        </Button>
      </div>
    </>
  );
}
