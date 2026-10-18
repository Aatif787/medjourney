import { Markdown } from "./Markdown";
import { Crumbs, HospitalCard, TreatmentCard } from "./Cards";
import { editorialImage } from "@/lib/editorial-images";

export type ArticleData = {
  title: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  author_name?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  tags?: string[];
  category?: { name: string } | null;
};

/** Shared by the public blog page and the admin preview so preview matches the live page. */
export function ArticleView({
  post,
  treatments,
  hospitals,
  preview,
}: {
  post: ArticleData;
  treatments: any[];
  hospitals: any[];
  preview?: boolean;
}) {
  const image = editorialImage(post.featured_image);
  return (
    <article className="container-page max-w-3xl py-12">
      {!preview && (
        <Crumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Guides", to: "/blog" },
            { label: post.title },
          ]}
        />
      )}
      <header className="mt-8">
        {post.category?.name && <p className="eyebrow">{post.category.name}</p>}
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink md:text-5xl">
          {post.title || "Untitled"}
        </h1>
        {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
        <p className="mt-5 text-sm text-muted-foreground">
          {post.author_name && <span>By {post.author_name}</span>}
          {post.author_name && post.published_at && <span aria-hidden> · </span>}
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
        </p>
      </header>
      {image && (
        <figure className="mt-8">
          <img
            src={image.url}
            alt={image.alt ?? post.featured_image_alt ?? ""}
            className="aspect-[16/9] w-full object-cover"
          />
        </figure>
      )}
      <div className="mt-10">
        <Markdown>{post.content}</Markdown>
      </div>
      {post.tags && post.tags.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              #{t}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10 border-t pt-4 text-sm text-muted-foreground">
        This is general information. Please talk to a qualified doctor about your own circumstances.
      </p>
      {(treatments.length > 0 || hospitals.length > 0) && (
        <aside className="mt-12" aria-labelledby="related-h">
          <h2 id="related-h" className="text-2xl font-semibold">
            Related
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {treatments.map((t) => (
              <TreatmentCard key={t.id} t={t} />
            ))}
            {hospitals.map((h) => (
              <HospitalCard key={h.id} h={h} />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
