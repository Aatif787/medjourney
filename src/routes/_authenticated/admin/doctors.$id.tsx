import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_authenticated/admin/doctors/$id")({
  component: DoctorEdit,
});

const empty = {
  name: "",
  slug: "",
  photo_url: "",
  title: "",
  qualifications: [] as string[],
  experience_years: "" as any,
  languages: [] as string[],
  profile: "",
  consultation_details: "",
  verification_status: "unverified",
  status: "draft",
  is_featured: false,
  is_sample: false,
  seo_title: "",
  seo_description: "",
};

function DoctorEdit() {
  const { id } = Route.useParams();
  const specialties = useOptions("categories", (q) => q.eq("kind", "specialty"));
  const hospitals = useOptions("hospitals");
  const treatments = useOptions("treatments");
  const e = useEntityForm({
    table: "doctors",
    id,
    empty,
    listPath: "/admin/doctors",
    editPath: "/admin/doctors/$id",
    joins: [
      {
        key: "hospitals",
        table: "doctor_hospitals",
        ownerCol: "doctor_id",
        otherCol: "hospital_id",
      },
      {
        key: "specialties",
        table: "doctor_specialties",
        ownerCol: "doctor_id",
        otherCol: "category_id",
      },
      {
        key: "treatments",
        table: "doctor_treatments",
        ownerCol: "doctor_id",
        otherCol: "treatment_id",
      },
    ],
    validate: (f) => {
      if (!f.name.trim()) return "Name is required";
      if (!f.slug) return "Slug is required";
      const y = f.experience_years === "" ? null : Number(f.experience_years);
      if (y !== null && (!Number.isInteger(y) || y < 0 || y > 80))
        return "Experience must be a whole number 0–80";
      return null;
    },
    toPayload: (f) => ({
      ...f,
      experience_years: f.experience_years === "" ? null : Number(f.experience_years),
    }),
  });
  if (e.loading) return <LoadingBlock />;
  if (e.missing) return <p>Doctor not found.</p>;
  const f = e.form;
  return (
    <div>
      <PageHeader
        title={e.isNew ? "New doctor" : f.name}
        back={{ to: "/admin/doctors", label: "Doctors" }}
      >
        {!e.isNew && f.status === "published" && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/doctors/${f.slug}`} target="_blank" rel="noreferrer">
              View live
            </a>
          </Button>
        )}
        {!e.isNew && <ConfirmDelete what="this doctor" onConfirm={e.remove} />}
        <SaveButton saving={e.saving} onClick={() => e.save()} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <Section title="Profile">
            <NameSlug
              name={f.name}
              slug={f.slug}
              onName={(v) => e.setVal("name", v)}
              onSlug={(v) => e.setVal("slug", v)}
              prefix="/doctors/"
            />
            <F label="Title / role" htmlFor="ti">
              <Input
                id="ti"
                value={f.title}
                onChange={e.set("title")}
                placeholder="e.g. Consultant Cardiologist"
              />
            </F>
            <ImageField
              id="photo"
              label="Photo"
              value={f.photo_url}
              onChange={(v) => e.setVal("photo_url", v)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Years of experience" htmlFor="ex">
                <Input
                  id="ex"
                  type="number"
                  min={0}
                  max={80}
                  value={f.experience_years}
                  onChange={e.set("experience_years")}
                />
              </F>
              <F label="Languages (one per line)" htmlFor="la">
                <LinesInput
                  id="la"
                  rows={3}
                  value={f.languages}
                  onChange={(v) => e.setVal("languages", v)}
                />
              </F>
            </div>
            <F label="Qualifications (one per line)" htmlFor="qu">
              <LinesInput
                id="qu"
                value={f.qualifications}
                onChange={(v) => e.setVal("qualifications", v)}
              />
            </F>
            <F label="Profile" htmlFor="pr">
              <textarea
                id="pr"
                rows={6}
                className={textareaCls}
                value={f.profile}
                onChange={e.set("profile")}
              />
            </F>
            <F label="Consultation details" htmlFor="cd">
              <textarea
                id="cd"
                rows={3}
                className={textareaCls}
                value={f.consultation_details}
                onChange={e.set("consultation_details")}
              />
            </F>
          </Section>
          <Section title="Relationships">
            <MultiPick
              label="Hospital affiliations"
              options={hospitals.data ?? []}
              value={e.rel.hospitals ?? []}
              onChange={e.setJoin("hospitals")}
            />
            <MultiPick
              label="Specialties"
              options={specialties.data ?? []}
              value={e.rel.specialties ?? []}
              onChange={e.setJoin("specialties")}
            />
            <MultiPick
              label="Treatments"
              options={treatments.data ?? []}
              value={e.rel.treatments ?? []}
              onChange={e.setJoin("treatments")}
            />
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
          <Section title="Verification">
            <F
              label="Verification status"
              htmlFor="vs"
              hint="Only mark verified after checking credentials."
            >
              <select
                id="vs"
                className={selectCls}
                value={f.verification_status}
                onChange={e.set("verification_status")}
              >
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
              </select>
            </F>
          </Section>
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
