import { Fragment } from "react";
import { uid } from "react-uid";

import { Bike, BusFront, CarFront, Footprints } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getDistance } from "@/utils/distanceInKm";

export function RouteDetails({
  modeOfTravel,
  setShowInstructions,
  routes,
  activeRouteIndex,
  setActiveRouteIndex,
}) {
  const onRouteBoxClick = (index: number) => {
    setActiveRouteIndex(index);
  };

  const getIconForModeOfTravel = () => {
    if (modeOfTravel === "foot") {
      return <Footprints />;
    } else if (modeOfTravel === "bike") {
      return <Bike />;
    } else if (modeOfTravel === "car") {
      return <CarFront />;
    } else if (modeOfTravel === "transit") {
      return <BusFront />;
    }
  };

  return (
    <div className="flex flex-col">
      {routes.map((route, index) => (
        <Fragment key={uid(route, index)}>
          {modeOfTravel && (
            <div
              className={cn(
                "flex gap-2 border-l-4 border-transparent py-6 pr-4 hover:cursor-pointer",
                activeRouteIndex === index && "border-primary",
              )}
              onClick={() => onRouteBoxClick(index)}
            >
              <div className="ml-4">{getIconForModeOfTravel()}</div>
              <div className="flex flex-1 flex-col items-start">
                <span className="pl-4 text-base font-light">
                  via
                  <span className="pl-1 font-medium">
                    {route.instructionList
                      .sort((a, b) => b.distance - a.distance)
                      .find(
                        (item) => item.name !== "" && item.name !== undefined,
                      )?.name || "Unknown"}
                  </span>
                </span>
                {activeRouteIndex === index && (
                  <Button
                    className="text-primary hover:text-primary/80"
                    variant="ghost"
                    onClick={() => setShowInstructions(true)}
                  >
                    Details
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-right font-medium">
                  {getDistance(route.distanceInMeters)}
                </span>
                <span className="text-right text-xs text-muted-foreground">
                  {Math.ceil(route.timeInMs / 60000)}&nbsp;min
                </span>
              </div>
            </div>
          )}
          <Separator />
        </Fragment>
      ))}
    </div>
  );
}
