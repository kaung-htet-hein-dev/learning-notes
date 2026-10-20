import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Raw HTML is never enabled (no rehype-raw): stored content cannot inject markup.
export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-invert prose-note reading max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          // Wide tables scroll inside their own box instead of widening the page on mobile.
          table: (props) => (
            <div className="table-scroll my-8">
              <table {...props} />
            </div>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
