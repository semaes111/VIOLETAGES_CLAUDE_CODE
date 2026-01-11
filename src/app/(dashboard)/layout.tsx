"use client";

import { MainLayout } from "@/components/dashboard/main-layout";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

export const dynamic = "force-dynamic";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <MainLayout user={user} onSignOut={signOut}>
      {children}
    </MainLayout>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </AuthProvider>
    </QueryProvider>
  );
}
