import { createFileRoute, Link } from "@tanstack/react-router";
import { getPost } from "@/lib/public.functions";
import { getRequestOrigin } from "@/lib/origin.functions";
import { ArticleView } from "@/components/site/ArticleView";
import { EmptyState } from "@/components/site/Cards";
import { editorialImage } from "@/lib/editorial-images";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const [data, origin] = await Promise.all([
      getPost({ data: { slug: params.slug } }),
      getRequestOrigin(),
    ]);
    return { ...data, origin };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Article unavailable | MedJourney" },
          { name: "description", content: "This MedJourney article could not be found." },
          { property: "og:title", content: "Article unavailable | MedJourney" },
          { property: "og:description", content: "This MedJourney article could not be found." },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
          { name: "robots", content: "noindex" },
        ],
      };
    const { post: p, origin } = loaderData;
    const url = `${origin}/blog/${params.slug}`;
    const title = p.seo_title || `${p.title} | MedJourney`;
    const desc = p.seo_description || p.excerpt || "";
    const image = editorialImage(p.featured_image);
    const img = image?.url.startsWith("https://") ? image.url : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: p.published_at },
        { property: "article:modified_time", content: p.updated_at },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(img
          ? [
              { property: "og:image", content: img },
              { name: "twitter:image", content: img },
              { property: "og:image:alt", content: image?.alt ?? p.featured_image_alt ?? p.title },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            description: desc,
            image: img ? [img] : undefined,
            datePublished: p.published_at,
            dateModified: p.updated_at,
            author: p.author_name ? { "@type": "Person", name: p.author_name } : undefined,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            keywords: p.tags?.join(", ") || undefined,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
              { "@type": "ListItem", position: 2, name: "Guides", item: `${origin}/blog` },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <EmptyState title="Article not found">
        <Link to="/blog" className="text-primary underline">
          Browse guides
        </Link>
      </EmptyState>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post, treatments, hospitals } = Route.useLoaderData();
  return <ArticleView post={post} treatments={treatments} hospitals={hospitals} />;
}
