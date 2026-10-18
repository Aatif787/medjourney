import { createFileRoute } from "@tanstack/react-router";
import { EntityList, StatusPill, SampleTag, fmtDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/hospitals/")({
  component: () => (
    <EntityList
      title="Hospitals"
      table="hospitals"
      searchColumn="name"
      statusColumn="status"
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ]}
      newLink={{ to: "/admin/hospitals/$id", params: { id: "new" } }}
      rowLink={(r) => ({ to: "/admin/hospitals/$id", params: { id: r.id } })}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => (
            <>
              {r.name}
              <SampleTag show={r.is_sample} />
            </>
          ),
        },
        {
          key: "country",
          label: "Location",
          render: (r) => [r.city, r.country].filter(Boolean).join(", ") || "—",
        },
        { key: "status", label: "Status", render: (r) => <StatusPill value={r.status} /> },
        {
          key: "created_at",
          label: "Created",
          render: (r) => fmtDate(r.created_at),
          className: "whitespace-nowrap",
        },
        {
          key: "updated_at",
          label: "Updated",
          render: (r) => fmtDate(r.updated_at),
          className: "whitespace-nowrap",
        },
      ]}
    />
  ),
});
