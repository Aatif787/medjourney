import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  db,
  PageHeader,
  ConfirmDelete,
  LoadingBlock,
  SampleTag,
  selectCls,
  fmtDate,
} from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin/categories")({ component: Categories });

const ICONS = ["heart", "bone", "ribbon", "baby", "eye", "smile", ""];

function Categories() {
  const [kind, setKind] = useState<"specialty" | "blog">("specialty");
  const list = useQuery({
    queryKey: ["admin-list", "categories", kind],
    queryFn: async () => {
      const { data, error } = await db
        .from("categories")
        .select("*")
        .eq("kind", kind)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });
  const [draft, setDraft] = useState({ name: "", description: "" });

  async function add() {
    if (!draft.name.trim()) return toast.error("Name is required");
    const { error } = await db.from("categories").insert({
      name: draft.name.trim(),
      slug: slugify(draft.name),
      description: draft.description || null,
      kind,
      sort_order: (list.data?.length ?? 0) + 1,
    });
    if (error)
      return toast.error(
        error.code === "23505" ? "A category with that slug already exists" : error.message,
      );
    setDraft({ name: "", description: "" });
    toast.success("Category added");
    list.refetch();
  }

  return (
    <div>
      <PageHeader title="Categories" />
      <div className="mb-6 inline-flex rounded-lg border bg-card p-1">
        {(["specialty", "blog"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={"rounded-md px-3 py-1.5 text-sm " + (kind === k ? "bg-secondary" : "")}
          >
            {k === "specialty" ? "Specialties (treatments)" : "Blog categories"}
          </button>
        ))}
      </div>
      <div className="mb-6 grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-[1fr_2fr_auto]">
        <Input
          aria-label="New category name"
          placeholder="Name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Input
          aria-label="Description"
          placeholder="Description (optional)"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <Button onClick={add}>
          <Plus />
          Add
        </Button>
      </div>
      {list.isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="space-y-3">
          {list.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          )}
          {list.data?.map((c) => (
            <Row key={c.id} c={c} kind={kind} onChange={() => list.refetch()} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ c, kind, onChange }: { c: any; kind: string; onChange: () => void }) {
  const [v, setV] = useState({
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    icon: c.icon ?? "",
    sort_order: c.sort_order,
  });
  async function save() {
    if (!v.name.trim() || !v.slug) return toast.error("Name and slug are required");
    const { error } = await db
      .from("categories")
      .update({
        ...v,
        slug: slugify(v.slug),
        description: v.description || null,
        icon: v.icon || null,
        sort_order: Number(v.sort_order) || 0,
      })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onChange();
  }
  return (
    <div className="grid items-center gap-2 rounded-xl border bg-card p-3 md:grid-cols-[1fr_1fr_2fr_110px_70px_auto]">
      <div className="flex items-center">
        <Input
          aria-label="Name"
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
        />
        <SampleTag show={c.is_sample} />
      </div>
      <Input
        aria-label="Slug"
        value={v.slug}
        onChange={(e) => setV({ ...v, slug: e.target.value })}
      />
      <Input
        aria-label="Description"
        value={v.description}
        onChange={(e) => setV({ ...v, description: e.target.value })}
      />
      {kind === "specialty" ? (
        <select
          aria-label="Icon"
          className={selectCls}
          value={v.icon}
          onChange={(e) => setV({ ...v, icon: e.target.value })}
        >
          {ICONS.map((i) => (
            <option key={i} value={i}>
              {i || "default"}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-muted-foreground">{fmtDate(c.updated_at)}</span>
      )}
      <Input
        aria-label="Sort order"
        type="number"
        value={v.sort_order}
        onChange={(e) => setV({ ...v, sort_order: e.target.value })}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>
          <Save />
          Save
        </Button>
        <ConfirmDelete
          what={`“${c.name}”`}
          label=""
          onConfirm={async () => {
            const { error } = await db.from("categories").delete().eq("id", c.id);
            if (error) toast.error(error.message);
            else {
              toast.success("Deleted");
              onChange();
            }
          }}
        />
      </div>
    </div>
  );
}
