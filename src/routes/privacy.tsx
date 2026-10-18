import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Cards";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | MedJourney" },
      {
        name: "description",
        content:
          "How we collect, use and protect the information you share with us when you send an enquiry.",
      },
      { property: "og:title", content: "Privacy Policy | MedJourney" },
      { property: "og:description", content: "How we handle and protect enquiry information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy">
        Template text — have it reviewed by a legal professional before launch.
      </PageHero>
      <div className="container-page max-w-3xl py-12 prose-med">
        <h2>What we collect</h2>
        <p>
          When you submit an enquiry we collect your name, country, email, optional phone/WhatsApp
          number, the treatment you are interested in, your message and your preferred contact
          method.
        </p>
        <h2>What we don't ask for</h2>
        <p>
          We do not require medical records for an initial enquiry. If records are needed later, a
          coordinator will explain how to share them securely.
        </p>
        <h2>How we use it</h2>
        <p>
          Only to respond to your enquiry and coordinate with hospitals you agree to be introduced
          to. We do not sell your data.
        </p>
        <h2>Who can access it</h2>
        <p>
          Enquiry data is accessible only to authorised staff through a secured admin system. It is
          never displayed on public pages.
        </p>
        <h2>Your rights</h2>
        <p>
          You can ask us to access, correct or delete your information at any time using the contact
          details in the footer.
        </p>
      </div>
    </>
  );
}
