"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

// Initialize Mermaid
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "inherit",
  });
}

interface MermaidProps {
  chart: string;
}

function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        ref.current.innerHTML = `<div class="mermaid" id="${id}">${chart}</div>`;
        mermaid.run({
          nodes: [document.getElementById(id)!],
        });
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        ref.current.innerHTML = `<pre class="text-red-500">Error rendering diagram</pre>`;
      }
    }
  }, [chart]);

  return <div ref={ref} className="my-4" />;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block renderer for Mermaid
          code(props: any) {
            const {className, children} = props;
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isCodeBlock = String(children).includes('\n');

            if (isCodeBlock && language === "mermaid") {
              return <Mermaid chart={String(children).trim()} />;
            }

            // Regular code block with syntax highlighting
            return (
              <code
                className={`${className || ""} ${
                  isCodeBlock ? "block rounded-lg bg-muted p-4 my-2 overflow-x-auto" : "bg-muted px-1.5 py-0.5 rounded"
                }`}
              >
                {children}
              </code>
            );
          },

          // Enhanced table styling
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-border border rounded-lg">
                  {children}
                </table>
              </div>
            );
          },

          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },

          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-sm font-semibold">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="px-4 py-3 text-sm border-t">
                {children}
              </td>
            );
          },

          // Enhanced blockquote styling
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                {children}
              </blockquote>
            );
          },

          // Links open in new tab
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
