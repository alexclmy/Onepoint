import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onepoint AI Consulting Tool",
  description: "AI-powered consulting tool for strategic analysis and business intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
