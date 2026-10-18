export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

export function suggestSeoTitle(title: string, siteName: string): string {
  const base = title.trim();
  const withBrand = `${base} | ${siteName}`;
  return withBrand.length <= 60 ? withBrand : truncate(base, 60);
}

export function suggestMetaDescription(excerpt: string, content: string): string {
  const source = excerpt.trim() || stripMarkdown(content);
  return truncate(source, 155);
}

export function wordCount(md: string): number {
  const t = stripMarkdown(md);
  return t ? t.split(" ").length : 0;
}

export type SeoCheck = { id: string; ok: boolean; label: string; hint: string };

export function seoChecklist(p: {
  title: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  slugTaken: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  content: string;
  relatedCount: number;
}): SeoCheck[] {
  const words = wordCount(p.content);
  const effTitle = p.seoTitle || p.title;
  const hasHeadings = /^#{2,3}\s+\S/m.test(p.content);
  const hasInternalLink = p.relatedCount > 0 || /\]\(\/[^)]+\)/.test(p.content);
  return [
    {
      id: "title",
      ok: !!effTitle.trim() && effTitle.length <= 65,
      label: "SEO title present (≤ 60–65 chars)",
      hint: effTitle ? `${effTitle.length} characters` : "Add a title",
    },
    {
      id: "desc",
      ok: p.seoDescription.length >= 50 && p.seoDescription.length <= 160,
      label: "Meta description 50–160 chars",
      hint: `${p.seoDescription.length} characters`,
    },
    {
      id: "slug",
      ok: !!p.slug && !p.slugTaken,
      label: "Unique, clean slug",
      hint: p.slugTaken
        ? "Another post already uses this slug"
        : p.slug
          ? `/blog/${p.slug}`
          : "Add a slug",
    },
    {
      id: "img",
      ok: !!p.featuredImage,
      label: "Featured image set",
      hint: p.featuredImage ? "OK" : "Used for social previews",
    },
    {
      id: "alt",
      ok: !p.featuredImage || !!p.featuredImageAlt.trim(),
      label: "Featured image has alt text",
      hint: "Describe the image for screen readers",
    },
    { id: "len", ok: words >= 300, label: "Content length ≥ 300 words", hint: `${words} words` },
    {
      id: "h",
      ok: hasHeadings,
      label: "Uses sub-headings (## / ###)",
      hint: "Break content into sections",
    },
    {
      id: "links",
      ok: hasInternalLink,
      label: "Internal links to treatments/hospitals",
      hint: "Select related items or link to /treatments/…",
    },
  ];
}
