import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  db,
  PageHeader,
  Section,
  F,
  textareaCls,
  LoadingBlock,
  ImageField,
} from "@/components/admin/AdminUI";
import { SaveButton } from "@/components/admin/EditorBits";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

const empty = {
  site_name: "",
  tagline: "",
  contact_email: "",
  contact_phone: "",
  whatsapp: "",
  address: "",
  logo_url: "",
  footer_note: "",
};

function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const q = useQuery({
    queryKey: ["settings-full"],
    queryFn: async () =>
      (await db.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  useEffect(() => {
    if (q.data)
      setForm(
        Object.fromEntries(Object.keys(empty).map((k) => [k, q.data[k] ?? ""])) as typeof empty,
      );
  }, [q.data]);
  if (q.isLoading) return <LoadingBlock />;
  const set = (k: keyof typeof empty) => (e: any) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    if (!form.site_name.trim()) return toast.error("Site name is required");
    if (form.contact_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contact_email))
      return toast.error("Enter a valid email");
    setSaving(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const { data, error } = await db.from("site_settings").update(payload).eq("id", 1).select("id");
    setSaving(false);
    if (error) return toast.error(error.message);
    if (!data?.length) return toast.error("Only admins can change settings");
    toast.success("Settings saved");
    router.invalidate();
  }

  return (
    <div>
      <PageHeader title="Website settings">
        <SaveButton saving={saving} onClick={save} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Brand">
          <F label="Site name" htmlFor="sn">
            <Input id="sn" value={form.site_name} onChange={set("site_name")} />
          </F>
          <F label="Tagline" htmlFor="tl">
            <Input id="tl" value={form.tagline} onChange={set("tagline")} />
          </F>
          <ImageField
            id="logo"
            label="Logo"
            value={form.logo_url}
            onChange={(v) => setForm({ ...form, logo_url: v })}
          />
          <F label="Footer note / disclaimer" htmlFor="fn">
            <textarea
              id="fn"
              rows={3}
              className={textareaCls}
              value={form.footer_note}
              onChange={set("footer_note")}
            />
          </F>
        </Section>
        <Section title="Contact details">
          <F label="Email" htmlFor="ce">
            <Input
              id="ce"
              type="email"
              value={form.contact_email}
              onChange={set("contact_email")}
            />
          </F>
          <F label="Phone" htmlFor="cp">
            <Input id="cp" value={form.contact_phone} onChange={set("contact_phone")} />
          </F>
          <F label="WhatsApp" htmlFor="wa">
            <Input id="wa" value={form.whatsapp} onChange={set("whatsapp")} />
          </F>
          <F label="Address" htmlFor="ad">
            <textarea
              id="ad"
              rows={2}
              className={textareaCls}
              value={form.address}
              onChange={set("address")}
            />
          </F>
        </Section>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Brand colours and fonts are defined in the site's design tokens and can be changed on
        request.
      </p>
    </div>
  );
}
