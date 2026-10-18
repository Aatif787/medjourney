import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { listPosts } from "@/lib/public.functions";
import { PageHero, PostCard, EmptyState, Pager } from "@/components/site/Cards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  validateSearch: z.object({
    page: z.number().int().min(1).optional(),
    category: z.string().max(120).optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listPosts({ data: deps }),
  head: () => ({
    meta: [
      { title: "Guides to Treatment Abroad | MedJourney" },
      {
        name: "description",
        content:
          "Questions to ask, things to prepare, and information to read when considering treatment abroad.",
      },
      { property: "og:title", content: "Guides to Treatment Abroad | MedJourney" },
      {
        property: "og:description",
        content: "Reading for people considering treatment in another country.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const data = Route.useLoaderData();
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/blog/" });
  return (
    <>
      <PageHero eyebrow="The journal" title="Before you travel">
        Things to read, questions to ask, and details worth thinking through. For advice about your
        own health, speak with your doctor.
      </PageHero>
      <div className="container-page py-12">
        <div className="flex flex-wrap gap-2" role="list">
          <Link
            to="/blog"
            search={{}}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              !s.category && "border-primary bg-primary text-primary-foreground",
            )}
          >
            All
          </Link>
          {data.categories.map((c) => (
            <Link
              key={c.id}
              to="/blog"
              search={{ category: c.slug }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm",
                s.category === c.slug && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {data.items.length ? (
            data.items.map((p) => <PostCard key={p.id} p={p} />)
          ) : (
            <EmptyState title="No articles published yet" />
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
