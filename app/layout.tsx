import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onepoint AI Consulting Tool",
  description: "AI-powered consulting tool for strategic analysis and business intelligence",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
