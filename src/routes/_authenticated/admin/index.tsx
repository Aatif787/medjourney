import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db, PageHeader, LoadingBlock, fmtDate, StatusPill } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

async function count(table: string, f?: (q: any) => any) {
  let q = db.from(table).select("id", { count: "exact", head: true });
  if (f) q = f(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [enq, newEnq, hosp, docs, treat, pub, drafts, recent] = await Promise.all([
        count("enquiries"),
        count("enquiries", (q) => q.eq("status", "new")),
        count("hospitals"),
        count("doctors"),
        count("treatments"),
        count("posts", (q) => q.eq("status", "published")),
        count("posts", (q) => q.eq("status", "draft")),
        db
          .from("enquiries")
          .select("id,full_name,country,treatment_interest,status,created_at,is_sample")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);
      return { enq, newEnq, hosp, docs, treat, pub, drafts, recent: recent.data ?? [] };
    },
  });
  if (stats.isLoading) return <LoadingBlock />;
  if (stats.error)
    return (
      <p className="text-destructive">Couldn't load dashboard: {(stats.error as Error).message}</p>
    );
  const s = stats.data!;
  const cards = [
    { label: "Patients / enquiries", value: s.enq, sub: `${s.newEnq} new`, to: "/admin/enquiries" },
    { label: "Hospitals", value: s.hosp, to: "/admin/hospitals" },
    { label: "Doctors", value: s.docs, to: "/admin/doctors" },
    { label: "Treatments", value: s.treat, to: "/admin/treatments" },
    { label: "Published posts", value: s.pub, to: "/admin/posts" },
    { label: "Draft posts", value: s.drafts, to: "/admin/posts" },
  ];
  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to as any}
            className="rounded-xl border bg-card p-5 transition hover:border-primary/40"
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-4xl">{c.value}</p>
            {c.sub && <p className="mt-1 text-xs text-primary">{c.sub}</p>}
          </Link>
        ))}
      </div>
      <h2 className="mt-10 font-display text-xl font-semibold">Latest enquiries</h2>
      <div className="mt-3 overflow-hidden rounded-xl border bg-card">
        {s.recent.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No enquiries yet.</p>
        ) : (
          <ul>
            {s.recent.map((e: any) => (
              <li key={e.id} className="border-b last:border-0">
                <Link
                  to="/admin/enquiries/$id"
                  params={{ id: e.id }}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-muted/40"
                >
                  <span>
                    <span className="font-medium">{e.full_name}</span>{" "}
                    <span className="text-sm text-muted-foreground">
                      · {e.country} · {e.treatment_interest ?? "—"}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <StatusPill value={e.status} />
                    {fmtDate(e.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
