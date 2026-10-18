import { createFileRoute } from "@tanstack/react-router";
import { publicClient } from "@/lib/public-client.server";

function originOf(request: Request) {
  const url = new URL(request.url);
  const fwd = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
  return fwd ? `https://${fwd}` : url.origin;
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Built on every request from published records only (RLS hides drafts and future-scheduled posts).
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = originOf(request);
        const sb = publicClient();
        const [h, d, t, c, p] = await Promise.all([
          sb.from("hospitals").select("slug,updated_at"),
          sb.from("doctors").select("slug,updated_at"),
          sb.from("treatments").select("slug,updated_at"),
          sb.from("categories").select("slug,updated_at").eq("kind", "specialty"),
          sb.from("posts").select("slug,updated_at").lte("published_at", new Date().toISOString()),
        ]);
        const err = [h, d, t, c, p].find((r) => r.error);
        if (err) return new Response("Sitemap unavailable", { status: 503 });
        const urls: { loc: string; lastmod?: string }[] = [
          ...[
            "/",
            "/treatments",
            "/hospitals",
            "/doctors",
            "/blog",
            "/about",
            "/contact",
            "/privacy",
          ].map((loc) => ({ loc })),
          ...(c.data ?? []).map((r) => ({
            loc: `/treatments/category/${r.slug}`,
            lastmod: r.updated_at,
          })),
          ...(t.data ?? []).map((r) => ({ loc: `/treatments/${r.slug}`, lastmod: r.updated_at })),
          ...(h.data ?? []).map((r) => ({ loc: `/hospitals/${r.slug}`, lastmod: r.updated_at })),
          ...(d.data ?? []).map((r) => ({ loc: `/doctors/${r.slug}`, lastmod: r.updated_at })),
          ...(p.data ?? []).map((r) => ({ loc: `/blog/${r.slug}`, lastmod: r.updated_at })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map(
            (u) =>
              `  <url><loc>${esc(origin + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`,
          )
          .join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
