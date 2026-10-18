import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { listDoctors } from "@/lib/public.functions";
import { PageHero, DoctorCard, EmptyState, Pager } from "@/components/site/Cards";
import { Button } from "@/components/ui/button";

const search = z.object({
  q: z.string().max(100).optional(),
  specialty: z.string().max(120).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/doctors/")({
  validateSearch: search,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listDoctors({ data: deps }),
  head: () => ({
    meta: [
      { title: "Doctors & Specialists | MedJourney" },
      {
        name: "description",
        content:
          "Browse specialist profiles including qualifications, experience, languages and hospital affiliations.",
      },
      { property: "og:title", content: "Doctors & Specialists | MedJourney" },
      {
        property: "og:description",
        content: "Browse specialist profiles, qualifications and hospital affiliations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/doctors" }],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const data = Route.useLoaderData();
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/doctors/" });
  return (
    <>
      <PageHero eyebrow="Directory" title="Doctors">
        Get to know the specialists, their experience and the languages they speak. Please confirm
        their credentials directly with the hospital.
      </PageHero>
      <div className="container-page py-12">
        <form
          role="search"
          className="grid gap-3 border-y py-4 md:grid-cols-[minmax(0,1fr)_220px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            navigate({
              search: {
                q: f.get("q")?.toString().trim() || undefined,
                specialty: f.get("specialty")?.toString() || undefined,
                page: undefined,
              },
            });
          }}
        >
          <label className="sr-only" htmlFor="dq">
            Doctor name
          </label>
          <input
            id="dq"
            name="q"
            defaultValue={s.q ?? ""}
            placeholder="Search by name"
            className="h-10 rounded-md border bg-background px-3"
          />
          <label className="sr-only" htmlFor="ds">
            Specialty
          </label>
          <select
            id="ds"
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
          {data.total} doctor{data.total === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {data.items.length ? (
            data.items.map((d) => <DoctorCard key={d.id} d={d} />)
          ) : (
            <EmptyState title="No doctors match these filters" />
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
