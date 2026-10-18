import { createFileRoute } from "@tanstack/react-router";
import { publicClient } from "@/lib/public-client.server";

// Serves website images from the private "media" bucket (only website media lives there — never patient files).
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });
        const { data, error } = await publicClient().storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
