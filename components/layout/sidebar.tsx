"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Settings,
  History,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Building2,
  TrendingUp,
  Package,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

interface NavSection {
  title: string;
  icon: any;
  items: NavItem[];
}

const mainNavigation: NavItem[] = [
  {
    name: "Nouvelle Analyse",
    href: "/",
    icon: Home,
  },
];

const consultingActions: NavSection = {
  title: "Stratégie & Consulting",
  icon: TrendingUp,
  items: [
    { name: "Analyse SWOT", href: "/?action=swot", icon: null },
    { name: "Analyse PESTEL", href: "/?action=pestel", icon: null },
    { name: "5 Forces de Porter", href: "/?action=porter", icon: null },
    { name: "Matrice BCG", href: "/?action=bcg", icon: null },
    { name: "Business Model Canvas", href: "/?action=business-model-canvas", icon: null },
    { name: "Value Proposition Canvas", href: "/?action=value-proposition-canvas", icon: null },
    { name: "Analyse Concurrentielle", href: "/?action=competitive-analysis", icon: null },
    { name: "Market Sizing", href: "/?action=market-sizing", icon: null },
    { name: "Risk Assessment", href: "/?action=risk-assessment", icon: null },
  ],
};

const productManagementActions: NavSection = {
  title: "Product Management",
  icon: Package,
  items: [
    { name: "Product Roadmap", href: "/?action=product-roadmap", icon: null },
    { name: "Feature Prioritization", href: "/?action=feature-prioritization", icon: null },
    { name: "User Journey Mapping", href: "/?action=user-journey-mapping", icon: null },
    { name: "UX Audit", href: "/?action=ux-audit", icon: null },
  ],
};

const configNavigation: NavItem[] = [
  {
    name: "Mon Entreprise",
    href: "/company",
    icon: Building2,
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

function NavSection({ section }: { section: NavSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center gap-3">
          <section.icon className="h-5 w-5" />
          {section.title}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-4">
          {section.items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavigation.map((item) => {
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
          </div>

          <Separator />

          {/* Consulting Actions */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions Rapides
            </p>
            <div className="space-y-1">
              <NavSection section={consultingActions} />
              <NavSection section={productManagementActions} />
            </div>
          </div>

          <Separator />

          {/* Configuration */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Configuration
            </p>
            <div className="space-y-1">
              {configNavigation.map((item) => {
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
            </div>
          </div>
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Propulsé par OpenAI GPT-4
          </p>
          <p className="mt-1 text-xs font-medium">v0.2.0 - Beta</p>
        </div>
      </div>
    </div>
  );
}
