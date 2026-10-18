import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db, loadJoin, syncJoin } from "./AdminUI";

export type JoinDef = { key: string; table: string; ownerCol: string; otherCol: string };

/** Load/save one row + its relation join tables. `listPath`/`editPath` drive navigation. */
export function useEntityForm<T extends Record<string, any>>(opts: {
  table: string;
  id: string;
  empty: T;
  joins?: JoinDef[];
  listPath: string;
  editPath: string;
  validate?: (f: T) => string | null;
  toPayload?: (f: T) => Record<string, any>;
}) {
  const isNew = opts.id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<T>(opts.empty);
  const [rel, setRel] = useState<Record<string, string[]>>(
    Object.fromEntries((opts.joins ?? []).map((j) => [j.key, []])),
  );
  const [saving, setSaving] = useState(false);

  const rec = useQuery({
    queryKey: ["entity", opts.table, opts.id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await db.from(opts.table).select("*").eq("id", opts.id).maybeSingle();
      if (error) throw error;
      const joins: Record<string, string[]> = {};
      for (const j of opts.joins ?? [])
        joins[j.key] = await loadJoin(j.table, j.ownerCol, opts.id, j.otherCol);
      return { row: data, joins };
    },
  });

  useEffect(() => {
    if (rec.data?.row) {
      const r: any = { ...opts.empty };
      for (const k of Object.keys(opts.empty))
        if (rec.data.row[k] !== undefined && rec.data.row[k] !== null) r[k] = rec.data.row[k];
      setForm(r);
      setRel(rec.data.joins);
    }
  }, [rec.data]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(override?: Partial<T>) {
    const f = { ...form, ...(override ?? {}) } as T;
    const err = opts.validate?.(f);
    if (err) {
      toast.error(err);
      return false;
    }
    setSaving(true);
    try {
      const payload = opts.toPayload ? opts.toPayload(f) : { ...f };
      for (const k of Object.keys(payload)) if (payload[k] === "") payload[k] = null;
      const res = isNew
        ? await db.from(opts.table).insert(payload).select("id").single()
        : await db.from(opts.table).update(payload).eq("id", opts.id).select("id").single();
      if (res.error) throw res.error;
      const newId = res.data.id as string;
      for (const j of opts.joins ?? [])
        await syncJoin(j.table, j.ownerCol, newId, j.otherCol, rel[j.key] ?? []);
      setForm(f);
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-list", opts.table] });
      if (isNew) navigate({ to: opts.editPath as any, params: { id: newId } as any });
      else rec.refetch();
      return true;
    } catch (e: any) {
      toast.error(
        e?.code === "23505"
          ? "That slug is already in use — choose another."
          : (e?.message ?? "Save failed"),
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const { error } = await db.from(opts.table).delete().eq("id", opts.id);
    if (error) return void toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-list", opts.table] });
    navigate({ to: opts.listPath as any });
  }

  const set = (k: keyof T) => (e: { target: { value: any } }) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const setVal = (k: keyof T, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const setJoin = (k: string) => (v: string[]) => setRel((p) => ({ ...p, [k]: v }));

  return {
    isNew,
    form,
    setForm,
    set,
    setVal,
    rel,
    setJoin,
    save,
    remove,
    saving,
    rec,
    loading: !isNew && rec.isLoading,
    missing: !isNew && rec.isFetched && !rec.data?.row,
  };
}
