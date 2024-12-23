import * as React from "react";

import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { CircleX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { StateDispatchContext } from "@/StateContext";

export function SwipeableDrawer({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const dispatch = React.useContext(StateDispatchContext);
  const params = useParams({ strict: false });
  const pathname = useLocation().pathname;
  const [open, setOpen] = React.useState(true);

  const snapPoints = pathname.startsWith("/events")
    ? ["132px", "310px", "600px"]
    : ["124px", "485px", 1];
  const [snap, setSnap] = React.useState<number | string | null>(snapPoints[0]);

  return (
    <Drawer
      modal={false}
      open={open}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      onOpenChange={(open) => {
        if (!open) {
          setOpen(false);
          navigate({
            to: "/$",
            params: {
              _splat: params._splat,
            },
          });
          dispatch({
            type: "update_state",
            payload: {
              searchQuery: "",
            },
          });
        }
      }}
    >
      <DrawerContent className="max-h-[97%]">
        <DrawerClose className="absolute right-0 top-0 z-10 mt-3" asChild>
          <Button variant="ghost">
            <CircleX className="size-4" />
          </Button>
        </DrawerClose>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Baato swipeable drawer</DrawerTitle>
          <DrawerDescription>Baato swipeable drawer</DrawerDescription>
        </DrawerHeader>
        <ScrollArea
          className={cn(
            "h-full pb-0 pt-4",
            (pathname.startsWith("/events") && snap === "600px") || snap === 1
              ? "overflow-y-auto"
              : "overflow-y-hidden",
          )}
        >
          {children}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
