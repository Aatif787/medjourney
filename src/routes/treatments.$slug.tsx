import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Info } from "lucide-react";
import { getTreatment } from "@/lib/public.functions";
import { PageHero, HospitalCard, DoctorCard, EmptyState, Crumbs } from "@/components/site/Cards";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/treatments/$slug")({
  loader: ({ params }) => getTreatment({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const t = loaderData?.treatment;
    const title = t?.seo_title || (t ? `${t.name} Abroad | MedJourney` : "Treatment | MedJourney");
    const desc = t?.seo_description || t?.summary || "Treatment overview, procedures and FAQs.";
    const faqs: { q: string; a: string }[] = Array.isArray(t?.faqs) ? t.faqs : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(t ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/treatments/${params.slug}` }],
      scripts: t
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MedicalProcedure",
                name: t.name,
                description: desc,
              }),
            },
            ...(faqs.length
              ? [
                  {
                    type: "application/ld+json",
                    children: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: faqs.map((f) => ({
                        "@type": "Question",
                        name: f.q,
                        acceptedAnswer: { "@type": "Answer", text: f.a },
                      })),
                    }),
                  },
                ]
              : []),
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <EmptyState title="Treatment not found">
        <Link to="/treatments" className="text-primary underline">
          Browse treatments
        </Link>
      </EmptyState>
    </div>
  ),
  component: TreatmentPage,
});

function TreatmentPage() {
  const { treatment: t, hospitals, doctors } = Route.useLoaderData();
  const faqs: { q: string; a: string }[] = Array.isArray(t.faqs) ? t.faqs : [];
  return (
    <>
      <PageHero eyebrow={t.category?.name ?? "Treatment"} title={t.name}>
        {t.summary}
      </PageHero>
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <Crumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Treatments", to: "/treatments" },
              ...(t.category
                ? [
                    {
                      label: t.category.name,
                      to: "/treatments/category/$slug",
                      params: { slug: t.category.slug },
                    },
                  ]
                : []),
              { label: t.name },
            ]}
          />
          {t.overview && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Overview</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {t.overview}
              </p>
            </section>
          )}
          {t.procedures?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">What it may involve</h2>
              <ul className="mt-4 space-y-2">
                {t.procedures.map((p: string) => (
                  <li key={p} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
              <Accordion type="single" collapsible className="mt-4">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`f${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
          {hospitals.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Hospitals offering this treatment</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {hospitals.map((h: any) => (
                  <HospitalCard key={h.id} h={h} />
                ))}
              </div>
            </section>
          )}
          {doctors.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Related specialists</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {doctors.map((d: any) => (
                  <DoctorCard key={d.id} d={d} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            {t.show_price && t.price_from != null ? (
              <>
                <p className="text-sm text-muted-foreground">Indicative starting price</p>
                <p className="mt-1 font-display text-3xl">
                  {t.price_currency ?? "USD"} {Number(t.price_from).toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.price_note ||
                    "Indicative only. Final costs depend on medical assessment and the hospital's quotation."}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Costs depend on your medical assessment. Request a personalised estimate from the
                hospital via our coordinators.
              </p>
            )}
            <Button asChild className="mt-5 w-full">
              <Link to="/contact" search={{ treatment: t.name }}>
                Request an estimate
              </Link>
            </Button>
          </div>
          <div className="flex gap-3 rounded-2xl bg-surface p-5 text-sm text-muted-foreground">
            <Info className="h-5 w-5 shrink-0" aria-hidden />
            <p>{t.disclaimer || "This page is general information only and not medical advice."}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
