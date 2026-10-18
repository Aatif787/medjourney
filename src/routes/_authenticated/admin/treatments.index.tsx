import { createFileRoute } from "@tanstack/react-router";
import { EntityList, StatusPill, SampleTag, fmtDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/treatments/")({
  component: () => (
    <EntityList
      title="Treatments & Specialties"
      table="treatments"
      select="*, category:categories(name)"
      searchColumn="name"
      statusColumn="status"
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ]}
      newLink={{ to: "/admin/treatments/$id", params: { id: "new" } }}
      rowLink={(r) => ({ to: "/admin/treatments/$id", params: { id: r.id } })}
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
        { key: "category", label: "Specialty", render: (r) => r.category?.name ?? "—" },
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
