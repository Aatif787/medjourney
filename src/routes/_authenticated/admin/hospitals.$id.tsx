import { createFileRoute } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import {
  PageHeader,
  Section,
  F,
  textareaCls,
  selectCls,
  ConfirmDelete,
  LoadingBlock,
  LinesInput,
  MultiPick,
  ImageField,
  useOptions,
  fmtDate,
} from "@/components/admin/AdminUI";
import { useEntityForm } from "@/components/admin/useEntityForm";
import { NameSlug, PublishBox, SaveButton, SeoBox } from "@/components/admin/EditorBits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/hospitals/$id")({
  component: HospitalEdit,
});

const empty = {
  name: "",
  slug: "",
  logo_url: "",
  cover_url: "",
  gallery: [] as string[],
  overview: "",
  country: "",
  city: "",
  address: "",
  facilities: [] as string[],
  accreditations: [] as { name: string; status: string }[],
  international_services: [] as string[],
  phone: "",
  email: "",
  website: "",
  status: "draft",
  is_featured: false,
  is_sample: false,
  seo_title: "",
  seo_description: "",
};

function HospitalEdit() {
  const { id } = Route.useParams();
  const specialties = useOptions("categories", (q) => q.eq("kind", "specialty"));
  const treatments = useOptions("treatments");
  const e = useEntityForm({
    table: "hospitals",
    id,
    empty,
    listPath: "/admin/hospitals",
    editPath: "/admin/hospitals/$id",
    joins: [
      {
        key: "specialties",
        table: "hospital_specialties",
        ownerCol: "hospital_id",
        otherCol: "category_id",
      },
      {
        key: "treatments",
        table: "hospital_treatments",
        ownerCol: "hospital_id",
        otherCol: "treatment_id",
      },
    ],
    validate: (f) =>
      !f.name.trim()
        ? "Name is required"
        : !f.slug
          ? "Slug is required"
          : f.website && !/^https?:\/\//.test(f.website)
            ? "Website must start with http(s)://"
            : null,
    toPayload: (f) => ({ ...f, accreditations: f.accreditations.filter((a) => a.name.trim()) }),
  });
  if (e.loading) return <LoadingBlock />;
  if (e.missing) return <p>Hospital not found.</p>;
  const f = e.form;
  const acc = f.accreditations;
  const setAcc = (v: typeof acc) => e.setVal("accreditations", v);

  return (
    <div>
      <PageHeader
        title={e.isNew ? "New hospital" : f.name}
        back={{ to: "/admin/hospitals", label: "Hospitals" }}
      >
        {!e.isNew && f.status === "published" && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/hospitals/${f.slug}`} target="_blank" rel="noreferrer">
              View live
            </a>
          </Button>
        )}
        {!e.isNew && <ConfirmDelete what="this hospital" onConfirm={e.remove} />}
        <SaveButton saving={e.saving} onClick={() => e.save()} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <Section title="Basics">
            <NameSlug
              name={f.name}
              slug={f.slug}
              onName={(v) => e.setVal("name", v)}
              onSlug={(v) => e.setVal("slug", v)}
              prefix="/hospitals/"
            />
            <F label="Overview" htmlFor="ov">
              <textarea
                id="ov"
                rows={6}
                className={textareaCls}
                value={f.overview}
                onChange={e.set("overview")}
              />
            </F>
          </Section>
          <Section title="Location & contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Country" htmlFor="co">
                <Input id="co" value={f.country} onChange={e.set("country")} />
              </F>
              <F label="City" htmlFor="ci">
                <Input id="ci" value={f.city} onChange={e.set("city")} />
              </F>
              <F label="Address" htmlFor="ad" className="sm:col-span-2">
                <Input id="ad" value={f.address} onChange={e.set("address")} />
              </F>
              <F label="Phone" htmlFor="ph">
                <Input id="ph" value={f.phone} onChange={e.set("phone")} />
              </F>
              <F label="Email" htmlFor="em">
                <Input id="em" type="email" value={f.email} onChange={e.set("email")} />
              </F>
              <F label="Website" htmlFor="we" className="sm:col-span-2">
                <Input
                  id="we"
                  value={f.website}
                  onChange={e.set("website")}
                  placeholder="https://"
                />
              </F>
            </div>
          </Section>
          <Section title="Departments, specialties & treatments">
            <MultiPick
              label="Specialties / departments"
              options={specialties.data ?? []}
              value={e.rel.specialties ?? []}
              onChange={e.setJoin("specialties")}
            />
            <MultiPick
              label="Treatments offered"
              options={treatments.data ?? []}
              value={e.rel.treatments ?? []}
              onChange={e.setJoin("treatments")}
            />
          </Section>
          <Section title="Facilities & services">
            <F label="Facilities (one per line)" htmlFor="fa">
              <LinesInput
                id="fa"
                value={f.facilities}
                onChange={(v) => e.setVal("facilities", v)}
              />
            </F>
            <F label="International patient services (one per line)" htmlFor="is">
              <LinesInput
                id="is"
                value={f.international_services}
                onChange={(v) => e.setVal("international_services", v)}
              />
            </F>
          </Section>
          <Section title="Accreditations">
            <p className="text-xs text-muted-foreground">
              Only mark “verified” after checking with the accrediting body.
            </p>
            {acc.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  aria-label="Accreditation name"
                  value={a.name}
                  onChange={(ev) =>
                    setAcc(acc.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))
                  }
                />
                <select
                  aria-label="Verification status"
                  className={selectCls + " max-w-40"}
                  value={a.status}
                  onChange={(ev) =>
                    setAcc(acc.map((x, j) => (j === i ? { ...x, status: ev.target.value } : x)))
                  }
                >
                  <option value="unverified">Unverified</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => setAcc(acc.filter((_, j) => j !== i))}
                >
                  <X />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setAcc([...acc, { name: "", status: "unverified" }])}
            >
              <Plus />
              Add accreditation
            </Button>
          </Section>
          <Section title="Images">
            <ImageField
              id="cover"
              label="Cover image"
              value={f.cover_url}
              onChange={(v) => e.setVal("cover_url", v)}
            />
            <ImageField
              id="logo"
              label="Logo"
              value={f.logo_url}
              onChange={(v) => e.setVal("logo_url", v)}
            />
            <F label="Gallery image URLs (one per line)" htmlFor="ga">
              <LinesInput id="ga" value={f.gallery} onChange={(v) => e.setVal("gallery", v)} />
            </F>
          </Section>
        </div>
        <div className="grid content-start gap-6">
          <PublishBox
            status={f.status}
            onStatus={(v) => e.setVal("status", v)}
            isSample={f.is_sample}
            onSample={(v) => e.setVal("is_sample", v)}
            featured={f.is_featured}
            onFeatured={(v) => e.setVal("is_featured", v)}
            meta={
              !e.isNew && (
                <>
                  Created {fmtDate(e.rec.data?.row?.created_at)}
                  <br />
                  Updated {fmtDate(e.rec.data?.row?.updated_at)}
                </>
              )
            }
          />
          <SeoBox
            title={f.seo_title}
            desc={f.seo_description}
            onTitle={(v) => e.setVal("seo_title", v)}
            onDesc={(v) => e.setVal("seo_description", v)}
          />
        </div>
      </div>
    </div>
  );
}
