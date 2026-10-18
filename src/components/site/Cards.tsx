import { Link } from "@tanstack/react-router";
import { MapPin, Languages, ShieldCheck, ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { VERIFICATION_LABEL } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { editorialImage } from "@/lib/editorial-images";
import { Button } from "@/components/ui/button";

export function VerificationBadge({ status, className }: { status: string; className?: string }) {
  const Icon = status === "verified" ? ShieldCheck : status === "pending" ? Clock : ShieldAlert;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "verified"
          ? "bg-success/15 text-success"
          : status === "pending"
            ? "bg-warning/20 text-warning-foreground"
            : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {VERIFICATION_LABEL[status] ?? status}
    </span>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/\[.*?\]/g, "")
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center rounded-full bg-secondary font-display text-secondary-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function HospitalCard({ h }: { h: any }) {
  const image = editorialImage(h.cover_url);
  return (
    <Link
      to="/hospitals/$slug"
      params={{ slug: h.slug }}
      className="motion-card group block overflow-hidden rounded-2xl border border-border/50 bg-card p-3 shadow-xs hover:border-primary/40 transition-all"
    >
      <div className="motion-card-image aspect-[3/2] overflow-hidden rounded-xl bg-muted">
        {image && (
          <img
            src={image.url}
            alt={image.alt ?? `${h.name} building`}
            loading="lazy"
            width={1200}
            height={800}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        {image?.illustrative && (
          <p className="mb-1.5 text-xs text-muted-foreground">
            Illustrative photograph · sample listing
          </p>
        )}
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{h.name}</h3>
        {(h.city || h.country) && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden />
            {[h.city, h.country].filter(Boolean).join(", ")}
          </p>
        )}
        {h.overview && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{h.overview}</p>
        )}
      </div>
    </Link>
  );
}

export function DoctorCard({ d }: { d: any }) {
  return (
    <Link
      to="/doctors/$slug"
      params={{ slug: d.slug }}
      className="motion-card group flex flex-col justify-between rounded-2xl border border-border/50 bg-card p-5 shadow-xs hover:border-primary/40 transition-all"
    >
      <div>
        <div className="flex items-center gap-4">
          {d.photo_url ? (
            <img
              src={d.photo_url}
              alt={`Portrait of ${d.name}`}
              loading="lazy"
              className="h-16 w-16 rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Initials name={d.name} className="h-16 w-16 text-xl transition-transform duration-500 group-hover:scale-105" />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">{d.name}</h3>
            {d.title && <p className="text-sm text-muted-foreground">{d.title}</p>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {d.experience_years != null && <span>{d.experience_years}+ yrs experience</span>}
          {d.languages?.length > 0 && (
            <span className="flex items-center gap-1">
              <Languages className="h-3.5 w-3.5" aria-hidden />
              {d.languages.join(", ")}
            </span>
          )}
        </div>
      </div>
      <VerificationBadge status={d.verification_status} className="mt-4 self-start" />
    </Link>
  );
}

export function TreatmentCard({ t }: { t: any }) {
  return (
    <Link
      to="/treatments/$slug"
      params={{ slug: t.slug }}
      className="motion-card group flex flex-col justify-between rounded-2xl border border-border/50 bg-card p-6 shadow-xs hover:border-primary/40 transition-all"
    >
      <div>
        {t.category?.name && <p className="eyebrow">{t.category.name}</p>}
        <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{t.name}</h3>
        {t.summary && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.summary}</p>
        )}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
        About this treatment <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

export function PostCard({ p }: { p: any }) {
  const image = editorialImage(p.featured_image);
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: p.slug }}
      className="motion-card group block overflow-hidden rounded-2xl border border-border/50 bg-card p-3 shadow-xs hover:border-primary/40 transition-all"
    >
      <div className="motion-card-image aspect-[16/10] overflow-hidden rounded-xl bg-muted">
        {image && (
          <img
            src={image.url}
            alt={image.alt ?? p.featured_image_alt ?? ""}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <p className="eyebrow">{p.category?.name ?? "Guide"}</p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
        {p.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
        )}
        {p.published_at && (
          <p className="mt-3 text-xs text-muted-foreground">
            <time dateTime={p.published_at}>
              {new Date(p.published_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </p>
        )}
      </div>
    </Link>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-surface p-10 text-center">
      <p className="font-display text-lg">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b bg-surface">
      <div className="container-page py-14 md:py-20" data-reveal="fade-up">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
          {title}
        </h1>
        {children && <div className="mt-4 max-w-2xl text-lg text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}

export function Crumbs({ items }: { items: { label: string; to?: string; params?: any }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {it.to ? (
              <Link to={it.to as any} params={it.params} className="hover:text-foreground">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Pager({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="px-2 text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </nav>
  );
}
