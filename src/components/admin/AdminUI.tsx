import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Trash2, Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Generic, loosely-typed DB handle for the CMS. RLS on every table enforces staff-only writes.
export const db = supabase as any;

export function PageHeader({
  title,
  children,
  back,
}: {
  title: string;
  children?: React.ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link to={back.to as any} className="text-sm text-muted-foreground hover:text-foreground">
            ← {back.label}
          </Link>
        )}
        <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const map: Record<string, string> = {
    published: "bg-success/15 text-success",
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-warning/20 text-warning-foreground",
    new: "bg-primary/15 text-primary",
    closed: "bg-muted text-muted-foreground",
    verified: "bg-success/15 text-success",
    pending: "bg-warning/20 text-warning-foreground",
    unverified: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        map[value] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function SampleTag({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
      Sample
    </span>
  );
}

export function ConfirmDelete({
  onConfirm,
  label = "Delete",
  what,
}: {
  onConfirm: () => Promise<void> | void;
  label?: string;
  what: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2 />
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {what}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the record and its links. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async (e) => {
              e.preventDefault();
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
          >
            {busy && <Loader2 className="animate-spin" />}Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function fmtDate(v?: string | null) {
  return v
    ? new Date(v).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}

/* ---------- Generic list page ---------- */
export type Column = {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  className?: string;
};

export function EntityList(props: {
  table: string;
  select?: string;
  searchColumn: string;
  columns: Column[];
  statusColumn?: string;
  statusOptions?: { value: string; label: string }[];
  extraFilter?: (q: any) => any;
  rowLink: (row: any) => { to: string; params: any };
  newLink?: { to: string; params: any };
  title: string;
  orderBy?: string;
}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const size = 15;
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const query = useQuery({
    queryKey: ["admin-list", props.table, debounced, status, page],
    queryFn: async () => {
      let qb = db
        .from(props.table)
        .select(props.select ?? "*", { count: "exact" })
        .order(props.orderBy ?? "updated_at", { ascending: false });
      if (debounced) qb = qb.ilike(props.searchColumn, `%${debounced}%`);
      if (status && props.statusColumn) qb = qb.eq(props.statusColumn, status);
      if (props.extraFilter) qb = props.extraFilter(qb);
      const { data, error, count } = await qb.range((page - 1) * size, page * size - 1);
      if (error) throw error;
      return { rows: data as any[], count: count ?? 0 };
    },
  });
  const pages = Math.max(1, Math.ceil((query.data?.count ?? 0) / size));

  return (
    <div>
      <PageHeader title={props.title}>
        {props.newLink && (
          <Button asChild>
            <Link to={props.newLink.to as any} params={props.newLink.params}>
              <Plus />
              New
            </Link>
          </Button>
        )}
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        {props.statusOptions && (
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border bg-card px-3 text-sm"
          >
            <option value="">All statuses</option>
            {props.statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {props.columns.map((c) => (
                <th key={c.key} scope="col" className={cn("px-4 py-3 font-medium", c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {query.isLoading && (
              <tr>
                <td
                  colSpan={props.columns.length}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto animate-spin" />
                </td>
              </tr>
            )}
            {query.error && (
              <tr>
                <td
                  colSpan={props.columns.length}
                  className="px-4 py-10 text-center text-destructive"
                >
                  Couldn't load: {(query.error as Error).message}
                </td>
              </tr>
            )}
            {query.data?.rows.length === 0 && (
              <tr>
                <td
                  colSpan={props.columns.length}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Nothing here yet.
                </td>
              </tr>
            )}
            {query.data?.rows.map((row) => {
              const l = props.rowLink(row);
              return (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/40">
                  {props.columns.map((c, i) => (
                    <td key={c.key} className={cn("px-4 py-3", c.className)}>
                      {i === 0 ? (
                        <Link
                          to={l.to as any}
                          params={l.params}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {c.render ? c.render(row) : row[c.key]}
                        </Link>
                      ) : c.render ? (
                        c.render(row)
                      ) : (
                        (row[c.key] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{query.data?.count ?? 0} total</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            {page} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Form helpers ---------- */
export function F({
  label,
  htmlFor,
  children,
  hint,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const textareaCls =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
export const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

/** One item per line <-> string[] */
export function LinesInput({
  id,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  id?: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [text, setText] = useState(value.join("\n"));
  useEffect(() => {
    setText(value.join("\n"));
  }, [value.join("\n")]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <textarea
      id={id}
      rows={rows}
      placeholder={placeholder}
      className={textareaCls}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

export function MultiPick({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: string; name: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      {options.length === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">No options yet.</p>
      ) : (
        <div className="mt-2 grid max-h-56 gap-1.5 overflow-auto rounded-md border p-3 sm:grid-cols-2">
          {options.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={value.includes(o.id)}
                onChange={(e) =>
                  onChange(e.target.checked ? [...value, o.id] : value.filter((v) => v !== o.id))
                }
              />
              {o.name}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export async function uploadMedia(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > 10 * 1024 * 1024) throw new Error("Max file size is 10MB");
  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  const url = `/media/${path}`;
  await db.from("media").insert({ url, storage_path: path, file_name: file.name, alt: "" });
  return url;
}

export function ImageField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <F label={label} htmlFor={id} hint="Paste an image URL or upload a file.">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/media/… or https://…"
        />
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              onChange(await uploadMedia(f));
              toast.success("Image uploaded");
            } catch (err) {
              toast.error((err as Error).message);
            }
            setBusy(false);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => ref.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}Upload
        </Button>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-24 rounded-md border object-cover" />}
    </F>
  );
}

/** Replace all rows of a join table for one owner id. */
export async function syncJoin(
  table: string,
  ownerCol: string,
  ownerId: string,
  otherCol: string,
  ids: string[],
) {
  const del = await db.from(table).delete().eq(ownerCol, ownerId);
  if (del.error) throw del.error;
  if (ids.length) {
    const ins = await db
      .from(table)
      .insert(ids.map((id) => ({ [ownerCol]: ownerId, [otherCol]: id })));
    if (ins.error) throw ins.error;
  }
}

export async function loadJoin(
  table: string,
  ownerCol: string,
  ownerId: string,
  otherCol: string,
): Promise<string[]> {
  const { data, error } = await db.from(table).select(otherCol).eq(ownerCol, ownerId);
  if (error) throw error;
  return (data as any[]).map((r) => r[otherCol]);
}

export function useOptions(table: string, filter?: (q: any) => any) {
  return useQuery({
    queryKey: ["admin-options", table],
    queryFn: async () => {
      let q = db.from(table).select("id,name").order("name");
      if (filter) q = filter(q);
      const { data, error } = await q;
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });
}

export function LoadingBlock() {
  return (
    <div className="grid place-items-center py-20 text-muted-foreground">
      <Loader2 className="animate-spin" />
    </div>
  );
}
