"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  Radar,
  Menu,
  X,
  Lightbulb,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";

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
  {
    name: "OneVeille",
    href: "/oneveille",
    icon: Radar,
  },
  {
    name: "OneTip",
    href: "/onetip",
    icon: Lightbulb,
  },
];

const consultingActions: NavSection = {
  title: "Stratégie & Consulting",
  icon: TrendingUp,
  items: [
    { name: "Analyse SWOT", href: "/actions/swot", icon: null },
    { name: "Analyse PESTEL", href: "/actions/pestel", icon: null },
    { name: "5 Forces de Porter", href: "/actions/porter", icon: null },
    { name: "Matrice BCG", href: "/actions/bcg", icon: null },
    { name: "Business Model Canvas", href: "/actions/business-model-canvas", icon: null },
    { name: "Value Proposition Canvas", href: "/actions/value-proposition-canvas", icon: null },
    { name: "Analyse Concurrentielle", href: "/actions/competitive-analysis", icon: null },
    { name: "Market Sizing", href: "/actions/market-sizing", icon: null },
    { name: "Risk Assessment", href: "/actions/risk-assessment", icon: null },
  ],
};

const productManagementActions: NavSection = {
  title: "Product Management",
  icon: Package,
  items: [
    { name: "Product Roadmap", href: "/actions/product-roadmap", icon: null },
    { name: "Feature Prioritization", href: "/actions/feature-prioritization", icon: null },
    { name: "User Journey Mapping", href: "/actions/user-journey-mapping", icon: null },
    { name: "UX Audit", href: "/actions/ux-audit", icon: null },
  ],
};

const configNavigation: NavItem[] = [
  {
    name: "Mes Entreprises",
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-bold">Onepoint AI</span>
            <span className="text-xs text-muted-foreground">Consulting Tool</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 hover:bg-accent"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-screen w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          // Mobile: fixed with slide animation
          "md:relative md:translate-x-0",
          // Mobile closed state
          isMobileMenuOpen ? "fixed z-50 translate-x-0" : "fixed z-50 -translate-x-full md:translate-x-0"
        )}
      >
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
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Thème</span>
            <ThemeToggle />
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Alexandre Coulmy - Onepoint
            </p>
            <p className="mt-1 text-xs font-medium">v0.2.0 - Beta</p>
          </div>
        </div>
      </div>
    </>
  );
}
