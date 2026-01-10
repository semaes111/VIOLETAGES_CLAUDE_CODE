"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  user?: { email?: string; name?: string } | null;
  onSignOut?: () => void;
}

export function MainLayout({ children, user, onSignOut }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }

    const darkSaved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = darkSaved === "dark" || (!darkSaved && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const handleToggle = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newValue));
  };

  const handleThemeToggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        user={user}
        onSignOut={onSignOut}
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
