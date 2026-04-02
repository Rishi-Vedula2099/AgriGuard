"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";

// Pages that don't require authentication
const PUBLIC_PATHS = ["/welcome", "/auth"];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth();
    setChecked(true);
  }, [checkAuth]);

  useEffect(() => {
    if (!checked) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

    if (!isAuthenticated) {
      if (!isPublic) {
        router.replace("/welcome");
      }
      return;
    }

    // Logged in — handle routing
    if (isPublic && pathname !== "/welcome") {
      // Redirect away from auth pages if already logged in
      if (!user?.role_selected) {
        router.replace("/auth/role-select");
      } else {
        router.replace(user.role === "STUDENT" ? "/student" : "/");
      }
      return;
    }

    // If role not selected, always push to role-select (unless already there)
    if (
      isAuthenticated &&
      !user?.role_selected &&
      !pathname?.startsWith("/auth/role-select") &&
      !isPublic
    ) {
      router.replace("/auth/role-select");
    }
  }, [checked, isAuthenticated, user, pathname, router]);

  // Show nothing while doing first auth check
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agri-bg">
        <div className="w-10 h-10 rounded-full border-2 border-agri-green border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>{children}</AuthGuard>
    </QueryClientProvider>
  );
}
