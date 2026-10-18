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
  useOptions,
  fmtDate,
} from "@/components/admin/AdminUI";
import { useEntityForm } from "@/components/admin/useEntityForm";
import { NameSlug, PublishBox, SaveButton, SeoBox } from "@/components/admin/EditorBits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/treatments/$id")({
  component: TreatmentEdit,
});

const empty = {
  name: "",
  slug: "",
  category_id: "",
  summary: "",
  overview: "",
  procedures: [] as string[],
  faqs: [] as { q: string; a: string }[],
  show_price: false,
  price_from: "" as any,
  price_currency: "USD",
  price_note: "",
  disclaimer:
    "This page is general information only and not medical advice. Treatment decisions must be made with qualified medical professionals.",
  status: "draft",
  is_sample: false,
  seo_title: "",
  seo_description: "",
};

function TreatmentEdit() {
  const { id } = Route.useParams();
  const categories = useOptions("categories", (q) => q.eq("kind", "specialty"));
  const hospitals = useOptions("hospitals");
  const doctors = useOptions("doctors");
  const e = useEntityForm({
    table: "treatments",
    id,
    empty,
    listPath: "/admin/treatments",
    editPath: "/admin/treatments/$id",
    joins: [
      {
        key: "hospitals",
        table: "hospital_treatments",
        ownerCol: "treatment_id",
        otherCol: "hospital_id",
      },
      {
        key: "doctors",
        table: "doctor_treatments",
        ownerCol: "treatment_id",
        otherCol: "doctor_id",
      },
    ],
    validate: (f) => {
      if (!f.name.trim()) return "Name is required";
      if (!f.slug) return "Slug is required";
      if (
        f.show_price &&
        (f.price_from === "" || Number(f.price_from) < 0 || isNaN(Number(f.price_from)))
      )
        return "Enter a valid indicative price or untick “Show price”";
      return null;
    },
    toPayload: (f) => ({
      ...f,
      price_from: f.price_from === "" ? null : Number(f.price_from),
      faqs: f.faqs.filter((x) => x.q.trim() && x.a.trim()),
    }),
  });
  if (e.loading) return <LoadingBlock />;
  if (e.missing) return <p>Treatment not found.</p>;
  const f = e.form;
  const setFaqs = (v: typeof f.faqs) => e.setVal("faqs", v);
  return (
    <div>
      <PageHeader
        title={e.isNew ? "New treatment" : f.name}
        back={{ to: "/admin/treatments", label: "Treatments" }}
      >
        {!e.isNew && f.status === "published" && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/treatments/${f.slug}`} target="_blank" rel="noreferrer">
              View live
            </a>
          </Button>
        )}
        {!e.isNew && <ConfirmDelete what="this treatment" onConfirm={e.remove} />}
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
              prefix="/treatments/"
            />
            <F label="Specialty / category" htmlFor="cat">
              <select
                id="cat"
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
            <F label="Short summary" htmlFor="su">
              <textarea
                id="su"
                rows={2}
                className={textareaCls}
                value={f.summary}
                onChange={e.set("summary")}
              />
            </F>
            <F label="Overview" htmlFor="ov">
              <textarea
                id="ov"
                rows={6}
                className={textareaCls}
                value={f.overview}
                onChange={e.set("overview")}
              />
            </F>
            <F label="Procedures (one per line)" htmlFor="pr">
              <LinesInput
                id="pr"
                value={f.procedures}
                onChange={(v) => e.setVal("procedures", v)}
              />
            </F>
            <F label="Medical disclaimer" htmlFor="di">
              <textarea
                id="di"
                rows={3}
                className={textareaCls}
                value={f.disclaimer}
                onChange={e.set("disclaimer")}
              />
            </F>
          </Section>
          <Section title="FAQ">
            {f.faqs.map((x, i) => (
              <div key={i} className="grid gap-2 rounded-md border p-3">
                <div className="flex gap-2">
                  <Input
                    aria-label="Question"
                    placeholder="Question"
                    value={x.q}
                    onChange={(ev) =>
                      setFaqs(f.faqs.map((y, j) => (j === i ? { ...y, q: ev.target.value } : y)))
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove question"
                    onClick={() => setFaqs(f.faqs.filter((_, j) => j !== i))}
                  >
                    <X />
                  </Button>
                </div>
                <textarea
                  aria-label="Answer"
                  placeholder="Answer"
                  rows={2}
                  className={textareaCls}
                  value={x.a}
                  onChange={(ev) =>
                    setFaqs(f.faqs.map((y, j) => (j === i ? { ...y, a: ev.target.value } : y)))
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setFaqs([...f.faqs, { q: "", a: "" }])}
            >
              <Plus />
              Add question
            </Button>
          </Section>
          <Section title="Related hospitals & doctors">
            <MultiPick
              label="Hospitals"
              options={hospitals.data ?? []}
              value={e.rel.hospitals ?? []}
              onChange={e.setJoin("hospitals")}
            />
            <MultiPick
              label="Doctors"
              options={doctors.data ?? []}
              value={e.rel.doctors ?? []}
              onChange={e.setJoin("doctors")}
            />
          </Section>
        </div>
        <div className="grid content-start gap-6">
          <PublishBox
            status={f.status}
            onStatus={(v) => e.setVal("status", v)}
            isSample={f.is_sample}
            onSample={(v) => e.setVal("is_sample", v)}
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
          <Section title="Indicative price">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={f.show_price}
                onChange={(ev) => e.setVal("show_price", ev.target.checked)}
              />
              Show price publicly
            </label>
            <div className="grid grid-cols-[1fr_90px] gap-2">
              <F label="From" htmlFor="pf">
                <Input
                  id="pf"
                  type="number"
                  min={0}
                  value={f.price_from}
                  onChange={e.set("price_from")}
                />
              </F>
              <F label="Currency" htmlFor="pc">
                <Input
                  id="pc"
                  value={f.price_currency}
                  onChange={e.set("price_currency")}
                  maxLength={3}
                />
              </F>
            </div>
            <F label="Price note" htmlFor="pn">
              <Input
                id="pn"
                value={f.price_note}
                onChange={e.set("price_note")}
                placeholder="What's included / excluded"
              />
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
