import { memo } from "react";
import { uid } from "react-uid";

import {
  ArrowLeft,
  CircleAlert,
  CircleDot,
  CornerUpLeft,
  CornerUpRight,
  Goal,
  MapPin,
  MoveDownLeft,
  MoveDownRight,
  MoveUp,
  Redo2,
  Undo2,
} from "lucide-react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getDistance } from "@/utils/distanceInKm";

const signMap = {
  "-98": "make U turn",
  "-8": "make U turn from left",
  "-7": "keep left",
  "-6": "leave roundabout",
  "-3": "turn sharp left",
  "-2": "turn left",
  "-1": "turn slight left",
  0: "continue",
  1: "turn slight right",
  2: "turn right",
  3: "turn sharp right",
  4: "finish",
  5: "reached via point",
  6: "enter roundabout",
  7: "keep right",
  8: "make U turn from right",
};

const signIconMap = {
  "-8": <Undo2 className="size-6 -rotate-90" />,
  "-7": <MoveDownLeft className="size-6" />,
  "-6": <CircleDot className="size-6" />,
  "-3": <CornerUpLeft className="size-6" />, // TODO - sharp right
  "-2": <CornerUpLeft className="size-6" />,
  "-1": <Icons.slightLeft className="size-6" />,
  0: <MoveUp className="size-6" />,
  1: <Icons.slightLeft className="size-6 -scale-x-100 scale-y-100" />,
  2: <CornerUpRight className="size-6" />,
  3: <CornerUpRight className="size-6" />, // TODO - sharp right
  4: <Goal className="size-6" />,
  5: <MapPin className="size-6" />,
  6: <CircleDot className="size-6" />,
  7: <MoveDownRight className="size-6" />,
  8: <Redo2 className="size-6 rotate-90" />,
};

function RoutingInstructions({
  instructions,
  points,
  activeRoute,
  setShowInstructions,
  hideBackButton = false,
}) {
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div className="fixed bottom-0 left-0 top-0 z-[3] max-h-screen w-[428px] overflow-y-auto bg-background pt-2.5">
      <div className="flex h-full flex-col">
        <div className="flex gap-3 pl-1.5 pr-4">
          {!hideBackButton && (
            <Button
              className="h-10 w-10 rounded-full"
              variant="ghost"
              onClick={() => setShowInstructions(false)}
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <div className="destinations-ctr">
            <div className="origin">
              <span className="text-muted-foreground">from</span>
              <span className="text-base font-medium">
                &nbsp;{points[0].query}
              </span>
            </div>
            <div className="destination">
              <span className="text-muted-foreground">to</span>
              <span className="text-base font-medium">
                &nbsp;{points[points.length - 1].query}
              </span>
            </div>
          </div>
        </div>
        <Separator className="my-4 w-auto" />
        <div className="px-4 text-xl">
          <span className="font-medium">
            {Math.ceil(activeRoute.timeInMs / 60000)}&nbsp;min
          </span>
          <span className="text-muted-foreground">
            &nbsp;({getDistance(activeRoute.distanceInMeters)})
          </span>
        </div>
        <Separator className="my-4 w-auto" />
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2 px-4 pb-4">
            {instructions.map((path) => (
              <div className="flex gap-4 text-base" key={uid(path)}>
                <div className="pt-1.5">
                  {signIconMap[path.sign as keyof typeof signIconMap] || (
                    <CircleAlert className="size-6 shrink-0" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span>
                    {signMap[path.sign as keyof typeof signMap] &&
                      capitalizeFirstLetter(
                        signMap[path.sign as keyof typeof signMap],
                      )}
                    {path.name && ` onto ${path.name}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.ceil(path.time / 60000)}&nbsp;min&nbsp;(
                    {getDistance(path.distance)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default memo(RoutingInstructions);
