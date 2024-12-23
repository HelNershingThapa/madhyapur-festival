import { useContext } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { auth } from "@/firebase-config";
import { StateDispatchContext } from "@/StateContext";

export function AppDrawer({ isAppDrawerOpen, setIsAppDrawerOpen }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const dispatch = useContext(StateDispatchContext);

  const handleAddMissingPlaceClick = () => {
    setIsAppDrawerOpen(false);
    if (!auth.currentUser) {
      dispatch({
        type: "update_state",
        payload: {
          isDisplaySignInPrompt: true,
        },
      });
      return;
    }
    navigate({
      to: "/add-place/$",
    });
  };

  const handleMyContributionsClick = () => {
    setIsAppDrawerOpen(false);
    if (!auth.currentUser) {
      dispatch({
        type: "update_state",
        payload: {
          isDisplaySignInPrompt: true,
        },
      });
      return;
    }
    navigate({
      to: "/contributions/$",
      params: {
        _splat: params._splat,
      },
    });
  };

  const handleReportIncidentClick = () => {
    setIsAppDrawerOpen(false);
    navigate({
      to: "/report-incident/$",
    });
  };

  const menuItems = [
    {
      label: "Add a Missing Place",
      onClick: handleAddMissingPlaceClick,
    },
    {
      label: "My Contributions",
      onClick: handleMyContributionsClick,
    },
    {
      label: "Report an Incident",
      onClick: handleReportIncidentClick,
    },
  ];

  return (
    <Sheet
      open={isAppDrawerOpen}
      onOpenChange={(open) => !open && setIsAppDrawerOpen(false)}
    >
      <SheetContent side="left" className="p-0">
        <SheetHeader>
          <SheetTitle>
            <div className="px-3.5 py-2.5">
              <img src={"/img/BaatoLogo.png"} alt="baato logo" width={110} />
            </div>
          </SheetTitle>
          <SheetDescription className="hidden">
            Navigation Menu
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="py-2">
          {menuItems.map((menu) => (
            <Button
              key={menu.label}
              variant="ghost"
              className="w-full justify-start rounded-none py-6 text-base font-normal hover:bg-muted"
              onClick={menu.onClick}
            >
              {menu.label}
            </Button>
          ))}
        </div>
        <Separator />
      </SheetContent>
    </Sheet>
  );
}
