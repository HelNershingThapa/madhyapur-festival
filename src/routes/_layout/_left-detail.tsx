import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SwipeableDrawer } from "@/components/Drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";

export const Route = createFileRoute("/_layout/_left-detail")({
  component: RouteComponent,
});

function RouteComponent() {
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  if (!isSmallScreen) {
    return (
      <div className="fixed bottom-0 left-0 top-0 z-[9] hidden max-h-screen w-[428px] bg-background pt-14 md:block">
        <ScrollArea className="h-full w-full">
          <Outlet />
        </ScrollArea>
      </div>
    );
  }

  return (
    <SwipeableDrawer>
      <Outlet />
    </SwipeableDrawer>
  );
}
