import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { F, Section, selectCls, textareaCls } from "./AdminUI";
import { slugify } from "@/lib/seo";

export function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} disabled={saving}>
      {saving ? <Loader2 className="animate-spin" /> : <Save />}Save
    </Button>
  );
}

export function NameSlug({
  name,
  slug,
  onName,
  onSlug,
  nameLabel = "Name",
  prefix,
}: {
  name: string;
  slug: string;
  onName: (v: string) => void;
  onSlug: (v: string) => void;
  nameLabel?: string;
  prefix: string;
}) {
  return (
    <>
      <F label={nameLabel} htmlFor="name">
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            const auto = !slug || slug === slugify(name);
            onName(v);
            if (auto) onSlug(slugify(v));
          }}
        />
      </F>
      <F label="Slug" htmlFor="slug" hint={`${prefix}${slug || "…"}`}>
        <Input id="slug" value={slug} onChange={(e) => onSlug(slugify(e.target.value))} />
      </F>
    </>
  );
}

export function PublishBox({
  status,
  onStatus,
  isSample,
  onSample,
  featured,
  onFeatured,
  meta,
}: {
  status: string;
  onStatus: (v: string) => void;
  isSample: boolean;
  onSample: (v: boolean) => void;
  featured?: boolean;
  onFeatured?: (v: boolean) => void;
  meta?: React.ReactNode;
}) {
  return (
    <Section title="Publishing">
      <F label="Status" htmlFor="status">
        <select
          id="status"
          className={selectCls}
          value={status}
          onChange={(e) => onStatus(e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </F>
      {onFeatured && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-primary"
            checked={!!featured}
            onChange={(e) => onFeatured(e.target.checked)}
          />
          Feature on homepage
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="accent-primary"
          checked={isSample}
          onChange={(e) => onSample(e.target.checked)}
        />
        Sample / demo record
      </label>
      {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
    </Section>
  );
}

export function SeoBox({
  title,
  desc,
  onTitle,
  onDesc,
}: {
  title: string;
  desc: string;
  onTitle: (v: string) => void;
  onDesc: (v: string) => void;
}) {
  return (
    <Section title="SEO (optional overrides)">
      <F label="SEO title" htmlFor="seot" hint={`${title.length}/60`}>
        <Input id="seot" value={title} onChange={(e) => onTitle(e.target.value)} />
      </F>
      <F label="Meta description" htmlFor="seod" hint={`${desc.length}/160`}>
        <textarea
          id="seod"
          rows={3}
          className={textareaCls}
          value={desc}
          onChange={(e) => onDesc(e.target.value)}
        />
      </F>
    </Section>
  );
}
