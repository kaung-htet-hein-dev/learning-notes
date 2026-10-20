"use client";

import { useEffect, useId, useState } from "react";

// Renders a ```mermaid fence on the client. The library loads only on pages that
// have a diagram; until it renders (or if it fails) the source shows as code.
export function Mermaid({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        // Strict sanitizes labels and disables click handlers in stored content.
        securityLevel: "strict",
        theme: "base",
        look: "classic",
        flowchart: { wrappingWidth: 320, curve: "basis" },
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        themeVariables: {
          darkMode: true,
          background: "#141414",
          primaryColor: "#1c1c1c",
          primaryTextColor: "#f2f2f2",
          primaryBorderColor: "#3a3a3a",
          lineColor: "#a8a8a8",
          secondaryColor: "#1c1c1c",
          tertiaryColor: "#141414",
          fontSize: "15px",
        },
      });
      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(svg);
      } catch {
        // Invalid syntax: keep showing the source.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, chart]);

  if (!svg) {
    return (
      <pre>
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      className="mermaid-diagram"
      role="img"
      // Mermaid's own output, sanitized by securityLevel "strict".
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
