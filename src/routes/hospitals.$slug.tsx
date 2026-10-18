import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Globe, Phone, Mail, CheckCircle2 } from "lucide-react";
import { getHospital } from "@/lib/public.functions";
import {
  Crumbs,
  DoctorCard,
  TreatmentCard,
  EmptyState,
  VerificationBadge,
} from "@/components/site/Cards";
import { Button } from "@/components/ui/button";
import { editorialImage } from "@/lib/editorial-images";

export const Route = createFileRoute("/hospitals/$slug")({
  loader: ({ params }) => getHospital({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const h = loaderData?.hospital;
    const title =
      h?.seo_title ||
      (h
        ? `${h.name} — ${[h.city, h.country].filter(Boolean).join(", ")} | MedJourney`
        : "Hospital | MedJourney");
    const desc =
      h?.seo_description || (h?.overview ? String(h.overview).slice(0, 155) : "Hospital profile.");
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(h?.cover_url?.startsWith("https://")
          ? [
              { property: "og:image", content: h.cover_url },
              { name: "twitter:image", content: h.cover_url },
            ]
          : []),
        ...(h ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/hospitals/${params.slug}` }],
      scripts: h
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Hospital",
                name: h.name,
                description: desc,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: h.address,
                  addressLocality: h.city,
                  addressCountry: h.country,
                },
                url: h.website || undefined,
                telephone: h.phone || undefined,
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <EmptyState title="Hospital not found">
        <Link to="/hospitals" className="text-primary underline">
          Back to directory
        </Link>
      </EmptyState>
    </div>
  ),
  component: HospitalPage,
});

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((i) => (
        <li key={i} className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          {i}
        </li>
      ))}
    </ul>
  );
}

function HospitalPage() {
  const { hospital: h, specialties, treatments, doctors } = Route.useLoaderData();
  const accreditations: { name: string; status: string }[] = Array.isArray(h.accreditations)
    ? h.accreditations
    : [];
  const image = editorialImage(h.cover_url);
  const gallery = (h.gallery ?? []).filter(
    (source: string) => !editorialImage(source)?.illustrative,
  );
  return (
    <>
      <section className="relative">
        <div className="h-72 w-full overflow-hidden bg-muted md:h-96">
          {image && (
            <img
              src={image.url}
              alt={image.alt ?? `${h.name} building`}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="container-page relative">
          {image?.illustrative && (
            <p className="mt-3 text-xs text-muted-foreground">
              Illustrative photograph. This is a fictional sample listing, not a partner hospital.
            </p>
          )}
          <div className="border-b py-6 md:py-8">
            <Crumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Hospitals", to: "/hospitals" },
                { label: h.name },
              ]}
            />
            <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                {h.logo_url && (
                  <img
                    src={h.logo_url}
                    alt={`${h.name} logo`}
                    className="h-14 w-14 rounded-lg border object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-semibold text-ink md:text-4xl">{h.name}</h1>
                  {(h.city || h.country) && (
                    <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" aria-hidden />
                      {[h.address, h.city, h.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <Button asChild size="lg">
                <Link to="/contact" search={{ treatment: h.name }}>
                  Enquire about this hospital
                </Link>
              </Button>
            </div>
            {specialties.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
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
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          {h.overview && (
            <section>
              <h2 className="text-2xl font-semibold">Overview</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {h.overview}
              </p>
            </section>
          )}
          {gallery.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map((g: string, i: number) => (
                  <img
                    key={i}
                    src={g}
                    alt={`${h.name} photo ${i + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </section>
          )}
          {h.facilities?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Facilities</h2>
              <List items={h.facilities} />
            </section>
          )}
          {h.international_services?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">International patient services</h2>
              <List items={h.international_services} />
            </section>
          )}
          {treatments.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Treatments</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {treatments.map((t: any) => (
                  <TreatmentCard key={t.id} t={t} />
                ))}
              </div>
            </section>
          )}
          {doctors.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Affiliated doctors</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {doctors.map((d: any) => (
                  <DoctorCard key={d.id} d={d} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Accreditation</h2>
            {accreditations.length ? (
              <ul className="mt-3 space-y-3">
                {accreditations.map((a, i) => (
                  <li key={i}>
                    <p className="text-sm">{a.name}</p>
                    <VerificationBadge status={a.status} className="mt-1" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No accreditation information provided.
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              “Verified” means our team has checked the claim against the accrediting body. Please
              confirm independently.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 text-sm">
            <h2 className="text-lg font-semibold">Contact</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {h.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" aria-hidden />
                  {h.phone}
                </li>
              )}
              {h.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden />
                  {h.email}
                </li>
              )}
              {h.website && (
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" aria-hidden />
                  <a
                    href={h.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Website
                  </a>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
