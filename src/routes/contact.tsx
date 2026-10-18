import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Lock } from "lucide-react";
import { listTreatmentOptions } from "@/lib/public.functions";
import { PageHero } from "@/components/site/Cards";
import { Button } from "@/components/ui/button";
import { PatientIntakeForm } from "@/components/site/PatientIntakeForm";

export const Route = createFileRoute("/contact")({
  validateSearch: z.object({ treatment: z.string().max(200).optional() }),
  loader: () => listTreatmentOptions(),
  head: () => ({
    meta: [
      { title: "Contact & Request an Estimate | MedJourney" },
      {
        name: "description",
        content:
          "Complete an adaptive medical intake or request an estimate from accredited international hospitals.",
      },
      { property: "og:title", content: "Request an Estimate | MedJourney" },
      {
        property: "og:description",
        content:
          "Send a clinical assessment — a coordinator will reply with hospital and price options.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const treatments = Route.useLoaderData();
  const { treatment } = Route.useSearch();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="container-page max-w-xl py-24 text-center" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h1 className="mt-6 text-3xl font-semibold">Thank you for getting in touch.</h1>
        <p className="mt-3 text-muted-foreground">
          We've received your assessment. A coordinator will reply via your chosen channel within
          2-4 hours.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHero eyebrow="Clinical Assessment" title="Personalized Medical Travel Triage">
        Tell us about your medical condition. Our clinical coordinators will evaluate your case and
        prepare options with accredited hospitals.
      </PageHero>
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <PatientIntakeForm
          treatments={treatments}
          presetTreatment={treatment}
          onDone={() => setDone(true)}
        />
        <aside className="space-y-4 text-sm text-muted-foreground">
          <div className="flex gap-3 border-t pt-5">
            <Lock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p>
              Only authorised staff can read your enquiry. Your details are not shown on the
              website.
            </p>
          </div>
          <p>
            Emergencies: this service is not for urgent medical needs. Please contact your local
            emergency services.
          </p>
        </aside>
      </div>
    </>
  );
}
