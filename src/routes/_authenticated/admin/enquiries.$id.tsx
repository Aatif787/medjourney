import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  db,
  PageHeader,
  Section,
  F,
  textareaCls,
  selectCls,
  ConfirmDelete,
  LoadingBlock,
  fmtDate,
  SampleTag,
} from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ENQUIRY_STATUSES } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/enquiries/$id")({
  component: EnquiryEdit,
});

const empty = {
  full_name: "",
  country: "",
  email: "",
  phone: "",
  treatment_interest: "",
  treatment_id: "",
  message: "",
  preferred_contact: "email",
  consent: true,
  status: "new",
  assigned_coordinator: "",
  internal_notes: "",
  next_follow_up: "",
  source: "admin",
  is_sample: false,
};
const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(150),
  country: z.string().trim().min(1, "Country is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
});

function EnquiryEdit() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const rec = useQuery({
    queryKey: ["enquiry", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await db.from("enquiries").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const treatments = useQuery({
    queryKey: ["admin-options", "treatments"],
    queryFn: async () => (await db.from("treatments").select("id,name").order("name")).data ?? [],
  });
  useEffect(() => {
    if (rec.data)
      setForm({
        ...empty,
        ...Object.fromEntries(Object.entries(rec.data).map(([k, v]) => [k, v ?? ""])),
      });
  }, [rec.data]);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    const v = schema.safeParse(form);
    if (!v.success) return toast.error(v.error.issues[0]?.message ?? "Invalid input");
    setSaving(true);
    const payload: any = { ...form };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    for (const k of [
      "phone",
      "treatment_interest",
      "treatment_id",
      "message",
      "assigned_coordinator",
      "internal_notes",
      "next_follow_up",
    ])
      if (!payload[k]) payload[k] = null;
    const res = isNew
      ? await db.from("enquiries").insert(payload).select("id").single()
      : await db.from("enquiries").update(payload).eq("id", id).select("id").single();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin-list", "enquiries"] });
    if (isNew) navigate({ to: "/admin/enquiries/$id", params: { id: res.data.id } });
    else rec.refetch();
  }

  if (!isNew && rec.isLoading) return <LoadingBlock />;
  if (!isNew && !rec.data) return <p>Enquiry not found.</p>;

  return (
    <div>
      <PageHeader
        title={isNew ? "New patient record" : form.full_name}
        back={{ to: "/admin/enquiries", label: "Enquiries" }}
      >
        <SampleTag show={form.is_sample} />
        {!isNew && (
          <ConfirmDelete
            what="this patient record"
            onConfirm={async () => {
              const { error } = await db.from("enquiries").delete().eq("id", id);
              if (error)
                return void toast.error(
                  error.message.includes("permission")
                    ? "Only admins can delete patient records"
                    : error.message,
                );
              toast.success("Deleted");
              navigate({ to: "/admin/enquiries" });
            }}
          />
        )}
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}Save
        </Button>
      </PageHeader>
      {!isNew && (
        <p className="mb-4 text-xs text-muted-foreground">
          Received {fmtDate(rec.data?.created_at)} · Updated {fmtDate(rec.data?.updated_at)} ·
          Source: {form.source} · Consent: {form.consent ? "yes" : "no"}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Patient & contact">
          <F label="Patient name" htmlFor="n">
            <Input id="n" value={form.full_name} onChange={set("full_name")} />
          </F>
          <F label="Country" htmlFor="c">
            <Input id="c" value={form.country} onChange={set("country")} />
          </F>
          <F label="Email" htmlFor="e">
            <Input id="e" type="email" value={form.email} onChange={set("email")} />
          </F>
          <F label="Phone / WhatsApp" htmlFor="p">
            <Input id="p" value={form.phone} onChange={set("phone")} />
          </F>
          <F label="Preferred contact" htmlFor="pc">
            <select
              id="pc"
              className={selectCls}
              value={form.preferred_contact}
              onChange={set("preferred_contact")}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </F>
        </Section>
        <Section title="Case management">
          <F label="Enquiry status" htmlFor="s">
            <select id="s" className={selectCls} value={form.status} onChange={set("status")}>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </F>
          <F label="Assigned coordinator" htmlFor="ac">
            <Input
              id="ac"
              value={form.assigned_coordinator}
              onChange={set("assigned_coordinator")}
            />
          </F>
          <F label="Next follow-up date" htmlFor="nf">
            <Input
              id="nf"
              type="date"
              value={form.next_follow_up}
              onChange={set("next_follow_up")}
            />
          </F>
          <F label="Internal notes" htmlFor="in" hint="Visible to staff only.">
            <textarea
              id="in"
              rows={6}
              className={textareaCls}
              value={form.internal_notes}
              onChange={set("internal_notes")}
            />
          </F>
        </Section>
        <Section title="Request">
          <F label="Linked treatment" htmlFor="t">
            <select
              id="t"
              className={selectCls}
              value={form.treatment_id}
              onChange={set("treatment_id")}
            >
              <option value="">—</option>
              {(treatments.data ?? []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </F>
          <F label="Requested treatment (as entered)" htmlFor="ti">
            <Input id="ti" value={form.treatment_interest} onChange={set("treatment_interest")} />
          </F>
          <F label="Patient message / Clinical intake assessment" htmlFor="m">
            {form.message?.includes("[PATIENT INTAKE ASSESSMENT") ? (
              <div className="mb-2.5 rounded-lg border bg-surface/80 p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                {form.message}
              </div>
            ) : null}
            <textarea
              id="m"
              rows={6}
              className={`${textareaCls} font-mono text-xs`}
              value={form.message}
              onChange={set("message")}
            />
          </F>
        </Section>
      </div>
    </div>
  );
}
