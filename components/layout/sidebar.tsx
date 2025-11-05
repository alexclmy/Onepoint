"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Settings,
  History,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    name: "Nouvelle Analyse",
    href: "/",
    icon: Home,
  },
  {
    name: "Gestion des Experts",
    href: "/experts",
    icon: Users,
  },
  {
    name: "Configuration LLM",
    href: "/config",
    icon: Settings,
  },
  {
    name: "Historique",
    href: "/history",
    icon: History,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <div className="flex flex-col">
          <span className="text-lg font-bold">Onepoint AI</span>
          <span className="text-xs text-muted-foreground">Consulting Tool</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Propulsé par OpenAI GPT-4
          </p>
          <p className="mt-1 text-xs font-medium">v0.1.0 - MVP</p>
        </div>
      </div>
    </div>
  );
}
