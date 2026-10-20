import { common } from "lowlight";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Root, RootContent } from "mdast";
import { bash, groovy, text, tree } from "@/lib/highlight-languages";
import { Mermaid } from "./mermaid";

// Code fences are colored on the server (no client JS); token colors live in globals.css.
const highlight: [typeof rehypeHighlight, Parameters<typeof rehypeHighlight>[0]] = [
  rehypeHighlight,
  { languages: { ...common, groovy, tree, bash, plaintext: text }, plainText: ["mermaid"] },
];

// Fences without a language get the light `text` grammar instead of none.
function defaultCodeLang() {
  const visit = (node: Root | RootContent) => {
    if (node.type === "code") node.lang ??= "text";
    if ("children" in node) node.children.forEach(visit);
  };
  return visit;
}

// Raw HTML is never enabled (no rehype-raw): stored content cannot inject markup.
// ```mermaid fences are the one exception, rendered by Mermaid in strict mode.
export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-invert prose-note reading max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, defaultCodeLang]}
        rehypePlugins={[highlight]}
        skipHtml
        components={{
          // Wide tables scroll inside their own box instead of widening the page on mobile.
          table: (props) => (
            <div className="table-scroll my-8">
              <table {...props} />
            </div>
          ),
          pre: ({ node, ...props }) => {
            const code = node?.children[0];
            if (
              code?.type === "element" &&
              code.tagName === "code" &&
              String(code.properties.className ?? "").includes("language-mermaid")
            ) {
              const text = code.children.map((c) => (c.type === "text" ? c.value : "")).join("");
              return <Mermaid chart={text.trim()} />;
            }
            return <pre {...props} />;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
