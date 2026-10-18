import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { listTreatmentsPage } from "@/lib/public.functions";
import { PageHero, TreatmentCard, EmptyState } from "@/components/site/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/treatments/")({
  validateSearch: z.object({ q: z.string().max(100).optional() }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => listTreatmentsPage({ data: { q: deps.q } }),
  head: () => ({
    meta: [
      { title: "Treatments & Specialties | MedJourney" },
      {
        name: "description",
        content:
          "Find treatment overviews, answers to common questions, and related hospital and doctor profiles.",
      },
      { property: "og:title", content: "Treatments & Specialties | MedJourney" },
      {
        property: "og:description",
        content: "Browse specialties and treatments with plain-language overviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/treatments" }],
  }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const { categories, treatments } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/treatments/" });
  return (
    <>
      <PageHero eyebrow="Treatments" title="Treatments & specialties">
        Read about the treatments you're considering and the questions you may want to ask your
        doctor. These pages are not medical advice.
      </PageHero>
      <div className="container-page py-12">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const v = new FormData(e.currentTarget).get("q")?.toString().trim();
            navigate({ search: { q: v || undefined } });
          }}
          className="flex max-w-lg gap-2"
        >
          <label htmlFor="tq" className="sr-only">
            Search treatments
          </label>
          <input
            id="tq"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search treatments"
            className="h-10 flex-1 rounded-md border bg-card px-3"
          />
          <Button type="submit">Search</Button>
        </form>

        <h2 className="mt-12 text-2xl font-semibold">Specialties</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/treatments/category/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border bg-card px-4 py-2 text-sm hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-semibold">
          {q ? `Results for “${q}”` : "All treatments"}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {treatments.length ? (
            treatments.map((t: any) => <TreatmentCard key={t.id} t={t} />)
          ) : (
            <EmptyState title="No treatments found">
              Try a different search, or{" "}
              <Link to="/contact" className="text-primary underline">
                ask a coordinator
              </Link>
              .
            </EmptyState>
          )}
        </div>
      </div>
    </>
  );
}
