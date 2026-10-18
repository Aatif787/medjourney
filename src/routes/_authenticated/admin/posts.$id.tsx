import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Pencil,
  Wand2,
  Bold,
  Heading2,
  Heading3,
  List,
  Link2,
  Send,
  Undo2,
} from "lucide-react";
import {
  db,
  PageHeader,
  Section,
  F,
  textareaCls,
  selectCls,
  ConfirmDelete,
  LoadingBlock,
  MultiPick,
  ImageField,
  useOptions,
  fmtDate,
  StatusPill,
} from "@/components/admin/AdminUI";
import { useEntityForm } from "@/components/admin/useEntityForm";
import { SaveButton } from "@/components/admin/EditorBits";
import { ArticleView } from "@/components/site/ArticleView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugify, suggestSeoTitle, suggestMetaDescription, seoChecklist } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/posts/$id")({ component: PostEditor });

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  featured_image_alt: "",
  category_id: "",
  tags: [] as string[],
  author_name: "",
  status: "draft",
  published_at: "",
  seo_title: "",
  seo_description: "",
  is_sample: false,
};

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PostEditor() {
  const { id } = Route.useParams();
  const categories = useOptions("categories", (q) => q.eq("kind", "blog"));
  const treatments = useOptions("treatments");
  const hospitals = useOptions("hospitals");
  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      (await db.from("site_settings").select("site_name").eq("id", 1).maybeSingle()).data,
  });
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [slugTouched, setSlugTouched] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);

  const e = useEntityForm({
    table: "posts",
    id,
    empty,
    listPath: "/admin/posts",
    editPath: "/admin/posts/$id",
    joins: [
      {
        key: "treatments",
        table: "post_treatments",
        ownerCol: "post_id",
        otherCol: "treatment_id",
      },
      { key: "hospitals", table: "post_hospitals", ownerCol: "post_id", otherCol: "hospital_id" },
    ],
    validate: (f) =>
      !f.title.trim()
        ? "Title is required"
        : !f.slug
          ? "Slug is required"
          : f.status === "published" && !f.published_at
            ? "Set a publish date"
            : null,
    toPayload: (f) => ({
      ...f,
      published_at: f.published_at ? new Date(f.published_at).toISOString() : null,
    }),
  });

  const f = e.form;
  const slugCheck = useQuery({
    queryKey: ["slug-check", f.slug, id],
    enabled: !!f.slug,
    queryFn: async () => {
      let q = db.from("posts").select("id", { count: "exact", head: true }).eq("slug", f.slug);
      if (id !== "new") q = q.neq("id", id);
      return ((await q).count ?? 0) > 0;
    },
  });

  if (e.loading) return <LoadingBlock />;
  if (e.missing) return <p>Post not found.</p>;

  const siteName = settings.data?.site_name ?? "MedJourney";
  const sugTitle = f.title ? suggestSeoTitle(f.title, siteName) : "";
  const sugDesc = f.title || f.content ? suggestMetaDescription(f.excerpt, f.content) : "";
  const checks = seoChecklist({
    title: f.title,
    seoTitle: f.seo_title || sugTitle,
    seoDescription: f.seo_description || sugDesc,
    slug: f.slug,
    slugTaken: !!slugCheck.data,
    featuredImage: f.featured_image,
    featuredImageAlt: f.featured_image_alt,
    content: f.content,
    relatedCount: (e.rel.treatments?.length ?? 0) + (e.rel.hospitals?.length ?? 0),
  });
  const isLive =
    f.status === "published" && f.published_at && new Date(f.published_at) <= new Date();
  const isScheduled =
    f.status === "published" && f.published_at && new Date(f.published_at) > new Date();
  const savedSlug = e.rec.data?.row?.slug;

  function insert(before: string, after = "", placeholder = "") {
    const el = ta.current;
    if (!el) return;
    const s = el.selectionStart,
      en = el.selectionEnd;
    const sel = f.content.slice(s, en) || placeholder;
    const next = f.content.slice(0, s) + before + sel + after + f.content.slice(en);
    e.setVal("content", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  const fillSeo = () =>
    e.setForm((p) => ({
      ...p,
      seo_title: p.seo_title || sugTitle,
      seo_description: p.seo_description || sugDesc,
    }));
  const publish = () =>
    e.save({
      status: "published",
      published_at: f.published_at || toLocalInput(new Date().toISOString()),
      seo_title: f.seo_title || sugTitle,
      seo_description: f.seo_description || sugDesc,
    });
  const unpublish = () => e.save({ status: "draft" });

  const relTreatments = (treatments.data ?? [])
    .filter((t) => e.rel.treatments?.includes(t.id))
    .map((t) => ({ ...t, slug: "#", summary: "" }));
  const relHospitals = (hospitals.data ?? [])
    .filter((h) => e.rel.hospitals?.includes(h.id))
    .map((h) => ({ ...h, slug: "#" }));

  return (
    <div>
      <PageHeader
        title={e.isNew ? "New post" : f.title || "Untitled"}
        back={{ to: "/admin/posts", label: "Posts" }}
      >
        <StatusPill value={isScheduled ? "scheduled" : f.status} />
        {isLive && savedSlug && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/blog/${savedSlug}`} target="_blank" rel="noreferrer">
              View live
            </a>
          </Button>
        )}
        {!e.isNew && <ConfirmDelete what="this post" onConfirm={e.remove} />}
        <SaveButton saving={e.saving} onClick={() => e.save()} />
        {f.status === "published" ? (
          <Button variant="secondary" onClick={unpublish} disabled={e.saving}>
            <Undo2 />
            Unpublish
          </Button>
        ) : (
          <Button variant="secondary" onClick={publish} disabled={e.saving}>
            <Send />
            {f.published_at && new Date(f.published_at) > new Date() ? "Schedule" : "Publish"}
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 inline-flex rounded-lg border bg-card p-1" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "edit"}
          onClick={() => setTab("edit")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
            tab === "edit" && "bg-secondary",
          )}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button
          role="tab"
          aria-selected={tab === "preview"}
          onClick={() => setTab("preview")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
            tab === "preview" && "bg-secondary",
          )}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {tab === "preview" ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <p className="border-b bg-warning/20 px-4 py-2 text-xs text-warning-foreground">
            Preview — this is how the article will look once published. Related cards are not
            clickable here.
          </p>
          <ArticleView
            preview
            post={{
              ...f,
              published_at: f.published_at
                ? new Date(f.published_at).toISOString()
                : new Date().toISOString(),
              category: (categories.data ?? []).find((c) => c.id === f.category_id) ?? null,
            }}
            treatments={relTreatments}
            hospitals={relHospitals}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid content-start gap-6">
            <Section title="Content">
              <F label="Title" htmlFor="title">
                <Input
                  id="title"
                  value={f.title}
                  onChange={(ev) => {
                    const v = ev.target.value;
                    e.setForm((p) => ({
                      ...p,
                      title: v,
                      slug: slugTouched && p.slug ? p.slug : slugify(v),
                    }));
                  }}
                />
              </F>
              <F
                label="Slug"
                htmlFor="slug"
                hint={
                  slugCheck.data
                    ? "⚠ This slug is already used by another post"
                    : `/blog/${f.slug || "…"}`
                }
              >
                <Input
                  id="slug"
                  value={f.slug}
                  aria-invalid={!!slugCheck.data}
                  onChange={(ev) => {
                    setSlugTouched(true);
                    e.setVal("slug", slugify(ev.target.value));
                  }}
                />
              </F>
              <F label="Excerpt" htmlFor="ex">
                <textarea
                  id="ex"
                  rows={2}
                  className={textareaCls}
                  value={f.excerpt}
                  onChange={e.set("excerpt")}
                />
              </F>
              <div>
                <label htmlFor="body" className="text-sm font-medium">
                  Body (Markdown)
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-muted/50 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Heading 2"
                    onClick={() => insert("\n## ", "\n", "Section heading")}
                  >
                    <Heading2 />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Heading 3"
                    onClick={() => insert("\n### ", "\n", "Sub-heading")}
                  >
                    <Heading3 />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Bold"
                    onClick={() => insert("**", "**", "bold text")}
                  >
                    <Bold />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Bullet list"
                    onClick={() => insert("\n- ", "", "List item")}
                  >
                    <List />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Link"
                    onClick={() => insert("[", "](/treatments/)", "link text")}
                  >
                    <Link2 />
                  </Button>
                </div>
                <textarea
                  id="body"
                  ref={ta}
                  rows={20}
                  className={textareaCls + " rounded-t-none font-mono text-[13px]"}
                  value={f.content}
                  onChange={e.set("content")}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use ## and ### for headings — the post title is the page's only H1.
                </p>
              </div>
            </Section>
            <Section title="Featured image">
              <ImageField
                id="fi"
                label="Image"
                value={f.featured_image}
                onChange={(v) => e.setVal("featured_image", v)}
              />
              <F
                label="Alt text"
                htmlFor="alt"
                hint="Describe the image for people using screen readers."
              >
                <Input
                  id="alt"
                  value={f.featured_image_alt}
                  onChange={e.set("featured_image_alt")}
                />
              </F>
            </Section>
            <Section title="Internal links (related content)">
              <MultiPick
                label="Related treatments"
                options={treatments.data ?? []}
                value={e.rel.treatments ?? []}
                onChange={e.setJoin("treatments")}
              />
              <MultiPick
                label="Related hospitals"
                options={hospitals.data ?? []}
                value={e.rel.hospitals ?? []}
                onChange={e.setJoin("hospitals")}
              />
            </Section>
          </div>

          <div className="grid content-start gap-6">
            <Section title="Publishing">
              <F label="Status" htmlFor="st">
                <select id="st" className={selectCls} value={f.status} onChange={e.set("status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </F>
              <F
                label="Publish date"
                htmlFor="pd"
                hint="Set a future date to schedule. The post goes live automatically at that time."
              >
                <Input
                  id="pd"
                  type="datetime-local"
                  value={toLocalInput(f.published_at)}
                  onChange={(ev) => e.setVal("published_at", ev.target.value)}
                />
              </F>
              <F label="Author" htmlFor="au">
                <Input id="au" value={f.author_name} onChange={e.set("author_name")} />
              </F>
              <F label="Category" htmlFor="ca">
                <select
                  id="ca"
                  className={selectCls}
                  value={f.category_id}
                  onChange={e.set("category_id")}
                >
                  <option value="">—</option>
                  {(categories.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </F>
              <F label="Tags (comma separated)" htmlFor="tg">
                <Input
                  id="tg"
                  value={f.tags.join(", ")}
                  onChange={(ev) =>
                    e.setVal(
                      "tags",
                      ev.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </F>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={f.is_sample}
                  onChange={(ev) => e.setVal("is_sample", ev.target.checked)}
                />
                Sample / demo record
              </label>
              {!e.isNew && (
                <p className="text-xs text-muted-foreground">
                  Created {fmtDate(e.rec.data?.row?.created_at)} · Updated{" "}
                  {fmtDate(e.rec.data?.row?.updated_at)}
                </p>
              )}
            </Section>
            <Section title="SEO">
              <F
                label="SEO title"
                htmlFor="seot"
                hint={`${(f.seo_title || sugTitle).length}/60${!f.seo_title && sugTitle ? " · using suggestion" : ""}`}
              >
                <Input
                  id="seot"
                  value={f.seo_title}
                  placeholder={sugTitle}
                  onChange={e.set("seo_title")}
                />
              </F>
              <F
                label="Meta description"
                htmlFor="seod"
                hint={`${(f.seo_description || sugDesc).length}/160${!f.seo_description && sugDesc ? " · using suggestion" : ""}`}
              >
                <textarea
                  id="seod"
                  rows={3}
                  className={textareaCls}
                  value={f.seo_description}
                  placeholder={sugDesc}
                  onChange={e.set("seo_description")}
                />
              </F>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={fillSeo}
              >
                <Wand2 />
                Fill empty fields with suggestions
              </Button>
            </Section>
            <Section title="SEO checklist">
              <ul className="space-y-2.5">
                {checks.map((c) => (
                  <li key={c.id} className="flex gap-2 text-sm">
                    {c.ok ? (
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-success"
                        aria-label="Pass"
                      />
                    ) : (
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                        aria-label="Suggestion"
                      />
                    )}
                    <span>
                      <span className={c.ok ? "" : "font-medium"}>{c.label}</span>
                      <span className="block text-xs text-muted-foreground">{c.hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                These are basic on-page suggestions. They don't guarantee search rankings.
              </p>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
