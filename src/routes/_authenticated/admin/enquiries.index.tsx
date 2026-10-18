import { createFileRoute } from "@tanstack/react-router";
import { EntityList, StatusPill, SampleTag, fmtDate } from "@/components/admin/AdminUI";
import { ENQUIRY_STATUSES } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/enquiries/")({
  component: () => (
    <EntityList
      title="Patients / Enquiries"
      table="enquiries"
      searchColumn="full_name"
      orderBy="created_at"
      statusColumn="status"
      statusOptions={ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
      newLink={{ to: "/admin/enquiries/$id", params: { id: "new" } }}
      rowLink={(r) => ({ to: "/admin/enquiries/$id", params: { id: r.id } })}
      columns={[
        {
          key: "full_name",
          label: "Patient",
          render: (r) => (
            <>
              {r.full_name}
              <SampleTag show={r.is_sample} />
            </>
          ),
        },
        { key: "country", label: "Country" },
        { key: "treatment_interest", label: "Requested treatment" },
        { key: "status", label: "Status", render: (r) => <StatusPill value={r.status} /> },
        { key: "assigned_coordinator", label: "Coordinator" },
        { key: "next_follow_up", label: "Follow-up" },
        {
          key: "created_at",
          label: "Received",
          render: (r) => fmtDate(r.created_at),
          className: "whitespace-nowrap",
        },
      ]}
    />
  ),
});
