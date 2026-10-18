import { createFileRoute } from "@tanstack/react-router";
import { EntityList, StatusPill, SampleTag, fmtDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/doctors/")({
  component: () => (
    <EntityList
      title="Doctors"
      table="doctors"
      searchColumn="name"
      statusColumn="status"
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ]}
      newLink={{ to: "/admin/doctors/$id", params: { id: "new" } }}
      rowLink={(r) => ({ to: "/admin/doctors/$id", params: { id: r.id } })}
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
        { key: "title", label: "Title" },
        {
          key: "verification_status",
          label: "Verification",
          render: (r) => <StatusPill value={r.verification_status} />,
        },
        { key: "status", label: "Status", render: (r) => <StatusPill value={r.status} /> },
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
