import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders article markdown. Any H1 inside content is demoted to H2 so the page keeps a single H1. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-med">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node: _n, ...p }) => <h2 {...p} />,
          img: ({ node: _n, alt, ...p }) => <img {...p} alt={alt ?? ""} loading="lazy" />,
          a: ({ node: _n, href, ...p }) => {
            const external = href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...p}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              />
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
