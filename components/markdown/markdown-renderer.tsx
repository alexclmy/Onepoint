"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          // Enhanced heading styling with better spacing
          h1({ children }) {
            return (
              <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold mt-6 mb-3 pb-2 border-b">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xl font-semibold mt-5 mb-2">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-lg font-semibold mt-4 mb-2">
                {children}
              </h4>
            );
          },

          // Enhanced paragraph styling
          p({ children }) {
            return (
              <p className="my-3 leading-relaxed text-base">
                {children}
              </p>
            );
          },

          // Enhanced list styling
          ul({ children }) {
            return (
              <ul className="my-4 ml-6 list-disc space-y-2">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-4 ml-6 list-decimal space-y-2">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li className="leading-relaxed">
                {children}
              </li>
            );
          },

          // Code blocks with syntax highlighting style
          code(props: any) {
            const { className, children } = props;
            const isCodeBlock = String(children).includes('\n');

            if (isCodeBlock) {
              return (
                <pre className="bg-muted rounded-lg p-4 my-4 overflow-x-auto border">
                  <code className="text-sm font-mono">
                    {children}
                  </code>
                </pre>
              );
            }

            // Inline code
            return (
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono border">
                {children}
              </code>
            );
          },

          // Enhanced table styling
          table({ children }) {
            return (
              <div className="my-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-border border rounded-lg shadow-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-muted">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-sm font-semibold border-b-2 border-border">
                {children}
              </th>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-border bg-card">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-muted/50 transition-colors">
                {children}
              </tr>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-sm">
                {children}
              </td>
            );
          },

          // Enhanced blockquote styling
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary bg-muted/30 pl-4 pr-4 py-2 my-4 italic rounded-r">
                {children}
              </blockquote>
            );
          },

          // Links with better styling
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
              >
                {children}
              </a>
            );
          },

          // Horizontal rule
          hr() {
            return (
              <hr className="my-8 border-t-2 border-border" />
            );
          },

          // Strong (bold) text
          strong({ children }) {
            return (
              <strong className="font-bold text-foreground">
                {children}
              </strong>
            );
          },

          // Emphasis (italic) text
          em({ children }) {
            return (
              <em className="italic text-muted-foreground">
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
