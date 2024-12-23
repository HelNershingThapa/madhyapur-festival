import { Fragment } from "react";
import { useMap } from "react-map-gl/maplibre";
import { uid } from "react-uid";

import {
  Bike,
  BusFront,
  CarFront,
  ChevronRight,
  Footprints,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStateContext, useStateDispatchContext } from "@/StateContext";
import { transitModeColorMap } from "@/utils/publicTransitConfig";

function TransitDetails({
  modeOfTravel,
  setShowTransitInstructions,
  transitInstructions,
}) {
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const { current: map } = useMap();
  const { activeTransitInstruction } = state;

  const fitMapToTransitInstructionBounds = (transitInstructionIndex) => {
    if (map?.getSource(`transitinstruction-${transitInstructionIndex}`)) {
      const { features } = map?.getSource(
        `transitinstruction-${transitInstructionIndex}`,
      )._data;
      const { itineraryBounds } = features[0].properties; // itinerarybounds is present in every itinerary leg feature as well.
      map?.fitBounds(itineraryBounds, {
        padding: {
          left: 450,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });
    }
  };

  const onTransitInstructionBoxClick = (index) => {
    dispatch({
      type: "active_transit_instruction_changed",
      payload: {
        newIndex: index,
      },
    });
    transitInstructions.plan.itineraries.forEach((_, i) => {
      map
        ?.getMap()
        .setPaintProperty(
          `transitinstruction-${i}`,
          "line-color",
          i === index ? ["get", "color"] : "#808080",
        );
    });
    map?.moveLayer(`transitinstruction-${index}`);
    fitMapToTransitInstructionBounds(index);
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

  // filter non walking modes for a itenerary
  const getModesOtherThanWalking = (itinerary) =>
    itinerary.legs.filter((leg) => leg.mode !== "WALK");

  return (
    <div className="flex flex-col">
      {transitInstructions?.plan?.itineraries?.length && (
        <Fragment>
          {transitInstructions.plan.itineraries.map((itinerary, index) => (
            <Fragment key={uid(itinerary, index)}>
              {modeOfTravel && (
                <div
                  className={cn(
                    "flex gap-2 border-l-4 border-transparent px-0 py-6 pr-4 hover:cursor-pointer",
                    activeTransitInstruction === index && "border-primary",
                  )}
                  onClick={() => onTransitInstructionBoxClick(index)}
                >
                  <div className="ml-4">{getIconForModeOfTravel()}</div>
                  <div className="flex flex-col items-start gap-2.5">
                    <span className="text-muted-foreground">
                      {
                        getModesOtherThanWalking(itinerary).length ? (
                          <Fragment>
                            via&nbsp;
                            {itinerary.legs.map((leg, index) => (
                              <Fragment key={uid(leg)}>
                                {["Origin", "Destination"].includes(
                                  leg.from.name,
                                )
                                  ? ""
                                  : leg.from.name}
                                {index < itinerary.legs.length - 1 &&
                                leg.mode !== "WALK"
                                  ? ", "
                                  : ""}
                              </Fragment>
                            ))}
                          </Fragment>
                        ) : (
                          "Walk"
                        ) // basically we get walking itinerary by filtering non walking itineraries for a non-zero itinerary instructions.
                      }
                      &nbsp;(about {(itinerary.duration / 60).toFixed(2)} min)
                    </span>
                    <div className="flex items-center gap-1">
                      {itinerary.legs.map((leg, legindex) => (
                        <Fragment key={uid(leg)}>
                          <Tooltip>
                            <TooltipTrigger>
                              {leg.mode === "WALK" ? (
                                <Footprints
                                  style={{
                                    color:
                                      activeTransitInstruction === index
                                        ? transitModeColorMap["WALK"]
                                        : undefined,
                                  }}
                                />
                              ) : (
                                <BusFront
                                  style={{
                                    color:
                                      activeTransitInstruction === index
                                        ? transitModeColorMap[leg.agencyName]
                                        : undefined,
                                  }}
                                />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {(leg.agencyName || leg.mode).toUpperCase()}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          {legindex < itinerary.legs.length - 1 && (
                            <ChevronRight className="size-4" />
                          )}
                        </Fragment>
                      ))}
                    </div>
                    {activeTransitInstruction === index && (
                      <Button
                        className="text-primary hover:text-primary/80"
                        variant="ghost"
                        onClick={() => setShowTransitInstructions(true)}
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <Separator />
            </Fragment>
          ))}
        </Fragment>
      )}
      {transitInstructions?.error?.id === 404 && (
        <p className="ml-4 mt-2.5 justify-self-start text-sm font-medium">
          Sorry, we couldn't find any transit routes. Please try again by
          changing route options.
        </p>
      )}
    </div>
  );
}

export default TransitDetails;
