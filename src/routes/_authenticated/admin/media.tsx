import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Copy, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  db,
  PageHeader,
  ConfirmDelete,
  LoadingBlock,
  uploadMedia,
  fmtDate,
} from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/media")({ component: Media });

function Media() {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const list = useQuery({
    queryKey: ["admin-list", "media"],
    queryFn: async () => {
      const { data, error } = await db
        .from("media")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div>
      <PageHeader title="Media library">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setBusy(true);
            for (const f of files) {
              try {
                await uploadMedia(f);
              } catch (err) {
                toast.error(`${f.name}: ${(err as Error).message}`);
              }
            }
            setBusy(false);
            e.target.value = "";
            list.refetch();
            toast.success("Upload finished");
          }}
        />
        <Button onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}Upload images
        </Button>
      </PageHeader>
      <p className="mb-6 text-sm text-muted-foreground">
        Website images only (logos, photos, article images). Never upload patient documents here.
      </p>
      {list.isLoading ? (
        <LoadingBlock />
      ) : list.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No uploads yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.data?.map((m) => (
            <MediaCard key={m.id} m={m} onChange={() => list.refetch()} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({ m, onChange }: { m: any; onChange: () => void }) {
  const [alt, setAlt] = useState(m.alt ?? "");
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <img
        src={m.url}
        alt={m.alt ?? ""}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-2 p-3">
        <p className="truncate text-xs text-muted-foreground" title={m.file_name}>
          {m.file_name} · {fmtDate(m.created_at)}
        </p>
        <Input
          aria-label="Alt text"
          placeholder="Alt text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={async () => {
            if (alt !== (m.alt ?? "")) {
              const { error } = await db.from("media").update({ alt }).eq("id", m.id);
              if (error) toast.error(error.message);
              else toast.success("Alt text saved");
            }
          }}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(m.url);
              toast.success("URL copied");
            }}
          >
            <Copy />
            Copy URL
          </Button>
          <ConfirmDelete
            what="this image"
            label=""
            onConfirm={async () => {
              if (m.storage_path) await supabase.storage.from("media").remove([m.storage_path]);
              const { error } = await db.from("media").delete().eq("id", m.id);
              if (error) toast.error(error.message);
              else {
                toast.success("Deleted");
                onChange();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
