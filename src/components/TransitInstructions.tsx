import React, { Fragment } from "react";
import { uid } from "react-uid";

import { ArrowLeft } from "lucide-react";

import { TypographyH4 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  transitModeColorMap,
  transitModeSignMap,
} from "@/utils/publicTransitConfig";

function TransitInstructions({ instructions, setShowTransitInstructions }) {
  return (
    <div className="fixed bottom-0 left-0 top-0 z-[3] max-h-screen w-[428px] overflow-y-auto bg-background pt-2.5">
      <div className="flex h-full flex-col p-[6px]">
        <div className="flex gap-[0.7rem]">
          <Button
            className="h-10 w-10 rounded-full"
            variant="ghost"
            onClick={() => setShowTransitInstructions(false)}
          >
            <ArrowLeft />
          </Button>
          <div className="destinations-ctr">
            <div className="origin">
              <span className="text-muted-foreground">from</span>
              <span className="text-base font-medium">&nbsp; Origin</span>
            </div>
            <div className="destination">
              <span className="text-muted-foreground">to</span>
              <span className="text-base font-medium">&nbsp; Destination</span>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <TypographyH4 className="text-2xl text-secondary-foreground">
          Transit Itinerary
        </TypographyH4>
        <Separator className="my-4" />
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto pb-2">
          {instructions.legs.map((instruction) => {
            const Icon = transitModeSignMap[instruction.mode];
            return (
              <Fragment key={uid(instruction)}>
                <div className="flex gap-4">
                  <Icon />
                  <Separator
                    orientation="vertical"
                    className="w-2.5"
                    style={{
                      backgroundColor:
                        instruction.mode === "WALK"
                          ? transitModeColorMap[instruction.mode]
                          : transitModeColorMap[instruction.agencyName],
                    }}
                  />
                  <div className="flex flex-col text-base">
                    <span className="font-semibold">
                      {instruction.from.name} - {instruction.to.name}
                    </span>
                    <br />
                    <span className="font-light">
                      {(
                        instruction.agencyName || instruction.mode
                      ).toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(instruction.duration / 60).toFixed(2)} minute
                    </span>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(TransitInstructions);
