import { createFileRoute, Link } from "@tanstack/react-router";
import { getSpecialty } from "@/lib/public.functions";
import {
  PageHero,
  TreatmentCard,
  HospitalCard,
  DoctorCard,
  EmptyState,
  Crumbs,
} from "@/components/site/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/treatments/category/$slug")({
  loader: ({ params }) => getSpecialty({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const name = loaderData?.category.name ?? "Specialty";
    const desc =
      loaderData?.category.description ?? `Treatments, hospitals and doctors for ${name}.`;
    return {
      meta: [
        { title: `${name} Treatment Abroad | MedJourney` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} | MedJourney` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/treatments/category/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <EmptyState title="Specialty not found">
        <Link to="/treatments" className="text-primary underline">
          Browse all treatments
        </Link>
      </EmptyState>
    </div>
  ),
  component: SpecialtyPage,
});

function SpecialtyPage() {
  const { category, treatments, hospitals, doctors } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow="Specialty" title={category.name}>
        {category.description}
      </PageHero>
      <div className="container-page py-12">
        <Crumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Treatments", to: "/treatments" },
            { label: category.name },
          ]}
        />
        <h2 className="mt-10 text-2xl font-semibold">Treatments</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.length ? (
            treatments.map((t: any) => <TreatmentCard key={t.id} t={t} />)
          ) : (
            <EmptyState title="No treatments listed yet" />
          )}
        </div>
        {hospitals.length > 0 && (
          <>
            <h2 className="mt-14 text-2xl font-semibold">
              Hospitals offering {category.name.toLowerCase()}
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              {hospitals.map((h: any) => (
                <HospitalCard key={h.id} h={h} />
              ))}
            </div>
          </>
        )}
        {doctors.length > 0 && (
          <>
            <h2 className="mt-14 text-2xl font-semibold">Specialists</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((d: any) => (
                <DoctorCard key={d.id} d={d} />
              ))}
            </div>
          </>
        )}
        <div className="mt-14">
          <Button asChild>
            <Link to="/contact" search={{ treatment: category.name }}>
              Ask about {category.name}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
