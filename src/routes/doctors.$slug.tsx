import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Languages, Briefcase } from "lucide-react";
import { getDoctor } from "@/lib/public.functions";
import {
  Crumbs,
  HospitalCard,
  EmptyState,
  VerificationBadge,
  Initials,
} from "@/components/site/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/doctors/$slug")({
  loader: ({ params }) => getDoctor({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const d = loaderData?.doctor;
    const title =
      d?.seo_title ||
      (d ? `${d.name}${d.title ? `, ${d.title}` : ""} | MedJourney` : "Doctor | MedJourney");
    const desc =
      d?.seo_description || (d?.profile ? String(d.profile).slice(0, 155) : "Doctor profile.");
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        ...(d?.photo_url?.startsWith("https://")
          ? [
              { property: "og:image", content: d.photo_url },
              { name: "twitter:image", content: d.photo_url },
            ]
          : []),
        ...(d ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/doctors/${params.slug}` }],
      scripts: d
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Physician",
                name: d.name,
                description: desc,
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <EmptyState title="Doctor not found">
        <Link to="/doctors" className="text-primary underline">
          Back to doctors
        </Link>
      </EmptyState>
    </div>
  ),
  component: DoctorPage,
});

function DoctorPage() {
  const { doctor: d, specialties, hospitals, treatments } = Route.useLoaderData();
  return (
    <div className="container-page py-12">
      <Crumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Doctors", to: "/doctors" },
          { label: d.name },
        ]}
      />
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {d.photo_url ? (
              <img
                src={d.photo_url}
                alt={`Portrait of ${d.name}`}
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <Initials name={d.name} className="h-32 w-32 text-4xl" />
            )}
            <div>
              <h1 className="text-3xl font-semibold text-ink md:text-4xl">{d.name}</h1>
              {d.title && <p className="mt-1 text-lg text-muted-foreground">{d.title}</p>}
              <VerificationBadge status={d.verification_status} className="mt-3" />
            </div>
          </div>
          {specialties.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {specialties.map((s: any) => (
                <Link
                  key={s.slug}
                  to="/treatments/category/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
          {d.profile && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Profile</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {d.profile}
              </p>
            </section>
          )}
          {treatments.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Treatments</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {treatments.map((t: any) => (
                  <li key={t.slug}>
                    <Link
                      to="/treatments/$slug"
                      params={{ slug: t.slug }}
                      className="rounded-md border px-3 py-1.5 text-sm hover:border-primary"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {hospitals.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Hospital affiliations</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {hospitals.map((h: any) => (
                  <HospitalCard key={h.id} h={h} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 text-sm">
            <ul className="space-y-4">
              {d.qualifications?.length > 0 && (
                <li className="flex gap-3">
                  <GraduationCap className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>{d.qualifications.join(", ")}</span>
                </li>
              )}
              {d.experience_years != null && (
                <li className="flex gap-3">
                  <Briefcase className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  {d.experience_years}+ years experience
                </li>
              )}
              {d.languages?.length > 0 && (
                <li className="flex gap-3">
                  <Languages className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  {d.languages.join(", ")}
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl bg-secondary p-6">
            <h2 className="text-lg font-semibold">Consultation</h2>
            <p className="mt-2 text-sm text-secondary-foreground">
              {d.consultation_details || "Consultations can be arranged through our coordinators."}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/contact" search={{ treatment: d.name }}>
                Request a consultation
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
