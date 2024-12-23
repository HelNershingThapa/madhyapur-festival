import * as React from "react";

import { useNavigate } from "@tanstack/react-router";
import type { Position } from "geojson";
import { toast } from "sonner";

type ContextMenuProps = {
  coordinates: Position;
  closeContextMenu: () => void;
  displayReverseToast: ({ lat, lng }: { lat: number; lng: number }) => void;
};

export function ContextMenu({
  closeContextMenu,
  coordinates,
  displayReverseToast,
}: ContextMenuProps) {
  const navigate = useNavigate();

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${coordinates[1]}, ${coordinates[0]}`);
    toast.success("Coordinates copied to clipboard");
    closeContextMenu();
  };

  const handleReverseGeocode = () => {
    displayReverseToast({ lat: coordinates[1], lng: coordinates[0] });
    closeContextMenu();
  };

  const handleDirectionsFromHere = () => {
    closeContextMenu();
    navigate({
      to: "/directions/$locations/$mode/$",
      params: {
        locations: coordinates[1] + "," + coordinates[0] + ",,",
        mode: "car",
      },
    });
  };

  const handleDirectionsToHere = () => {
    closeContextMenu();
    navigate({
      to: "/directions/$locations/$mode/$",
      params: {
        locations: ",," + coordinates[1] + "," + coordinates[0],
        mode: "car",
      },
    });
  };

  const handleAddMissingPlace = () => {
    closeContextMenu();
    navigate({
      to: "/add-place/$",
      state: {
        initialView: coordinates,
      },
    });
  };

  return (
    <div className="flex flex-col py-2 text-sm">
      <ContextMenuItem onClick={handleCopyCoordinates}>
        {coordinates[1].toFixed(5)}, {coordinates[0].toFixed(5)}
      </ContextMenuItem>
      <ContextMenuItem onClick={handleReverseGeocode}>
        What's here?
      </ContextMenuItem>
      <ContextMenuItem onClick={handleDirectionsFromHere}>
        Directions from here
      </ContextMenuItem>
      <ContextMenuItem onClick={handleDirectionsToHere}>
        Directions to here
      </ContextMenuItem>
      <ContextMenuItem onClick={handleAddMissingPlace}>
        Add a missing place
      </ContextMenuItem>
    </div>
  );
}

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      {...props}
    >
      {children}
    </div>
  );
});
