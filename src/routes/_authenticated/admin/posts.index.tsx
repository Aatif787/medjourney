import { createFileRoute } from "@tanstack/react-router";
import { EntityList, StatusPill, SampleTag, fmtDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/posts/")({
  component: () => (
    <EntityList
      title="Blog posts"
      table="posts"
      select="id,title,slug,status,published_at,updated_at,created_at,is_sample,author_name,category:categories(name)"
      searchColumn="title"
      statusColumn="status"
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published / scheduled" },
      ]}
      newLink={{ to: "/admin/posts/$id", params: { id: "new" } }}
      rowLink={(r) => ({ to: "/admin/posts/$id", params: { id: r.id } })}
      columns={[
        {
          key: "title",
          label: "Title",
          render: (r) => (
            <>
              {r.title}
              <SampleTag show={r.is_sample} />
            </>
          ),
        },
        { key: "category", label: "Category", render: (r) => r.category?.name ?? "—" },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <StatusPill
              value={
                r.status === "published" && r.published_at && new Date(r.published_at) > new Date()
                  ? "scheduled"
                  : r.status
              }
            />
          ),
        },
        {
          key: "published_at",
          label: "Publish date",
          render: (r) => fmtDate(r.published_at),
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
