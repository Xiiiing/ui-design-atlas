import { ArchiveBridge } from "@/archive/bridge";
import { Toaster } from "@/components/ui/sonner";
import { type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: () => (
      <>
        <ArchiveBridge />
        <Outlet />
        <Toaster />
      </>
    ),
  },
);
