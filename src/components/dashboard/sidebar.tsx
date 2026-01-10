"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Syringe,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Ingresos", href: "/ingresos", icon: TrendingUp },
  { title: "Gastos", href: "/gastos", icon: TrendingDown },
  { title: "Tratamientos", href: "/tratamientos", icon: Syringe },
  { title: "Pacientes", href: "/pacientes", icon: Users },
  { title: "Informes", href: "/informes", icon: FileText },
  { title: "Configuración", href: "/configuracion", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  user?: { email?: string; name?: string } | null;
  onSignOut?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  isDark,
  onThemeToggle,
  user,
  onSignOut,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r glass transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-white/10 dark:border-slate-800/50 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <span className="text-lg font-bold text-white">V</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                VioletaGest
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="icon"
                          className={cn(
                            "w-full transition-all duration-200",
                            isActive && "bg-primary text-white shadow-md shadow-primary/20",
                            !isActive && "hover:bg-primary/10"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transiton-all duration-200",
                      isActive && "bg-primary text-white shadow-md shadow-primary/20",
                      !isActive && "hover:bg-primary/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-white/10 dark:bg-slate-800/50" />

        {/* Footer */}
        <div className="p-3">
          {/* Theme Toggle */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full hover:bg-white/10 dark:hover:bg-slate-800/50"
                  onClick={onThemeToggle}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-secondary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isDark ? "Modo claro" : "Modo oscuro"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-white/10 dark:hover:bg-slate-800/50"
              onClick={onThemeToggle}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-secondary" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
              {isDark ? "Modo claro" : "Modo oscuro"}
            </Button>
          )}

          {/* User & Logout */}
          {user && (
            <>
              <Separator className="my-2 bg-white/10 dark:bg-slate-800/50" />
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={onSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Cerrar sesión</TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <div className="mb-2 truncate px-3 text-sm text-muted-foreground">
                    {user.email ?? user.name}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border glass hover:bg-primary hover:text-white transition-colors"
          onClick={onToggle}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  );
}
