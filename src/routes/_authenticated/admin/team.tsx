import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  db,
  PageHeader,
  ConfirmDelete,
  LoadingBlock,
  StatusPill,
  selectCls,
  fmtDate,
} from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/team")({ component: Team });

function Team() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("coordinator");
  const list = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await db.rpc("list_staff");
      if (error) throw error;
      return data as any[];
    },
  });

  async function grant() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return toast.error("Enter a valid email");
    const { error } = await db.rpc("grant_staff_role", { _email: email.trim(), _role: role });
    if (error) return toast.error(error.message);
    toast.success("Access granted");
    setEmail("");
    list.refetch();
  }

  return (
    <div>
      <PageHeader title="Team & access" />
      <p className="mb-4 text-sm text-muted-foreground">
        Coordinators can manage content and patient records. Admins can also delete patient records,
        change settings and manage the team. The person must sign up at /auth first.
      </p>
      <div className="mb-6 grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-[1fr_180px_auto]">
        <Input
          aria-label="Email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          aria-label="Role"
          className={selectCls}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="coordinator">Coordinator</option>
          <option value="admin">Admin</option>
        </select>
        <Button onClick={grant}>
          <UserPlus />
          Grant access
        </Button>
      </div>
      {list.isLoading ? (
        <LoadingBlock />
      ) : list.error ? (
        <p className="text-sm text-destructive">Only admins can view the team.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          {list.data?.map((s) => (
            <div
              key={s.user_id + s.role}
              className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 last:border-0"
            >
              <span className="font-medium">{s.email}</span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                <StatusPill value={s.role} />
                since {fmtDate(s.created_at)}
                <ConfirmDelete
                  what={`${s.role} access for ${s.email}`}
                  label="Remove"
                  onConfirm={async () => {
                    const { error } = await db.rpc("revoke_staff_role", {
                      _user_id: s.user_id,
                      _role: s.role,
                    });
                    if (error) toast.error(error.message);
                    else {
                      toast.success("Access removed");
                      list.refetch();
                    }
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
