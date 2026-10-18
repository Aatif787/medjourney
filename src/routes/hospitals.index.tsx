import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { listHospitals } from "@/lib/public.functions";
import { PageHero, HospitalCard, EmptyState, Pager } from "@/components/site/Cards";
import { Button } from "@/components/ui/button";

const search = z.object({
  q: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  specialty: z.string().max(120).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/hospitals/")({
  validateSearch: search,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listHospitals({ data: deps }),
  head: () => ({
    meta: [
      { title: "Hospital Directory | MedJourney" },
      {
        name: "description",
        content:
          "Browse hospitals abroad by country and specialty. See facilities, international patient services and accreditation information.",
      },
      { property: "og:title", content: "Hospital Directory | MedJourney" },
      { property: "og:description", content: "Browse hospitals abroad by country and specialty." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/hospitals" }],
  }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const data = Route.useLoaderData();
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/hospitals/" });
  return (
    <>
      <PageHero eyebrow="Directory" title="Hospitals">
        Look through the profiles by country or specialty. Check credentials, facilities and
        treatment details directly with the hospital before deciding.
      </PageHero>
      <div className="container-page py-12">
        <form
          role="search"
          className="grid gap-3 border-y py-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const v = (k: string) => f.get(k)?.toString().trim() || undefined;
            navigate({
              search: {
                q: v("q"),
                country: v("country"),
                specialty: v("specialty"),
                page: undefined,
              },
            });
          }}
        >
          <label className="sr-only" htmlFor="hq">
            Hospital name
          </label>
          <input
            id="hq"
            name="q"
            defaultValue={s.q ?? ""}
            placeholder="Search by name"
            className="h-10 rounded-md border bg-background px-3"
          />
          <label className="sr-only" htmlFor="hc">
            Country
          </label>
          <select
            id="hc"
            name="country"
            defaultValue={s.country ?? ""}
            className="h-10 rounded-md border bg-background px-3"
          >
            <option value="">All countries</option>
            {data.countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="hs">
            Specialty
          </label>
          <select
            id="hs"
            name="specialty"
            defaultValue={s.specialty ?? ""}
            className="h-10 rounded-md border bg-background px-3"
          >
            <option value="">All specialties</option>
            {data.specialties.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-10">
            Filter
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {data.total} hospital{data.total === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.length ? (
            data.items.map((h) => <HospitalCard key={h.id} h={h} />)
          ) : (
            <EmptyState title="No hospitals match these filters" />
          )}
        </div>
        <Pager
          page={data.page}
          total={data.total}
          pageSize={data.pageSize}
          onPage={(p) => navigate({ search: { ...s, page: p } })}
        />
      </div>
    </>
  );
}
