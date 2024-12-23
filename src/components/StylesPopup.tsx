import { useState } from "react";
import { uid } from "react-uid";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, Layers, Map, MinusIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { incidentReports } from "@/config";
import { cn } from "@/lib/utils";
import { useStateContext, useStateDispatchContext } from "@/StateContext";

export const StylesHoverCard = () => {
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const [showMoreLayers, setShowMoreLayers] = useState(false);
  const { selectedIncidentTypes } = state;
  const { VITE_BAATO_API_URL, VITE_MAPTILER_API_KEY, VITE_BAATO_ACCESS_TOKEN } =
    import.meta.env;

  const isChecked = selectedIncidentTypes.length === incidentReports.length;
  const isIndeterminate =
    selectedIncidentTypes.length > 0 &&
    selectedIncidentTypes.length < incidentReports.length;

  const handleChange = (checked) => {
    dispatch({
      type: "update_selected_incident_types",
      payload: {
        selectedIncidentTypes: checked
          ? incidentReports.map((incident) => incident.label)
          : [],
      },
    });
  };

  return (
    <HoverCard onOpenChange={(open) => !open && setShowMoreLayers(false)}>
      <HoverCardTrigger className="fixed bottom-5 left-[10px] z-[1] hidden sm:block">
        <div className="style-layers">
          <img
            src={"/img/map-styles/breeze.png"}
            height="75px"
            width="75px"
            className="h-[75px] w-[75px] rounded-[8px]"
            alt=""
          />
          <div className="absolute -top-0.5 bottom-0.5 left-0.5 right-0.5 flex h-full items-end justify-center rounded-lg bg-gradient-to-b from-[rgba(13,24,41,0)] to-[rgba(13,24,41,0.4)] pb-0.5 text-white hover:bottom-[4px] hover:left-[4px] hover:right-[4px] hover:top-[-4px]">
            <div className="flex items-center gap-0.5">
              <Map className="size-4" />
              <span className="font-medium">Styles</span>
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-max px-2 py-2 transition-all duration-300 ease-in-out"
        align="end"
        side="right"
      >
        {!showMoreLayers && (
          <div className="flex gap-2">
            {["dark", "boundaries", "retro", "breeze", "satellite"].map(
              (style) => {
                const iconPath = `/img/map-styles/${style}.png`;
                return (
                  <div
                    key={uid(style)}
                    className="group flex flex-col items-center hover:cursor-pointer"
                    onClick={() => {
                      let mapStyle;
                      if (style === "satellite") {
                        mapStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${VITE_MAPTILER_API_KEY}`;
                      } else if (style === "breeze") {
                        mapStyle = `https://tileboundaries.baato.io/admin_boundary/${style}.json?key=${VITE_BAATO_ACCESS_TOKEN}`;
                      } else {
                        mapStyle = `${VITE_BAATO_API_URL}/v1/styles/${style}?key=${VITE_BAATO_ACCESS_TOKEN}`;
                      }
                      dispatch({
                        type: "update_state",
                        payload: {
                          mapStyle,
                        },
                      });
                    }}
                  >
                    <img
                      className="size-11 rounded-lg group-hover:outline group-hover:outline-2 group-hover:-outline-offset-2 group-hover:outline-blue-500"
                      src={new URL(iconPath, import.meta.url).href}
                      alt=""
                    />
                    <span className="text-[11px] capitalize group-hover:text-blue-500">
                      {style}
                    </span>
                  </div>
                );
              },
            )}
            <div
              className="group flex flex-col items-center hover:cursor-pointer hover:text-blue-500"
              onClick={() => setShowMoreLayers(true)}
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-gray-200 group-hover:outline group-hover:outline-2 group-hover:-outline-offset-2 group-hover:outline-blue-500">
                <Layers className="size-5" />
              </div>
              <span className="text-[11px] capitalize group-hover:text-blue-500">
                More
              </span>
            </div>
            <div className="flex items-center space-x-2 self-start">
              <Checkbox
                id="mapillary-overlay"
                checked={state?.isMapillaryEnabled}
                onCheckedChange={() =>
                  dispatch({ type: "toggle_mapillary_overlay" })
                }
              />
              <Label htmlFor="mapillary-overlay">Mapillary Overlay</Label>
            </div>
          </div>
        )}
        {showMoreLayers && (
          <div>
            <div className="mb-3 flex items-center space-x-2">
              <CheckboxPrimitive.Root
                id="incidents"
                className={cn(
                  "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                )}
                checked={
                  isChecked ? true : isIndeterminate ? "indeterminate" : false
                }
                onCheckedChange={handleChange}
              >
                <CheckboxPrimitive.Indicator
                  className={cn(
                    "flex items-center justify-center text-current",
                  )}
                >
                  {isChecked && <CheckIcon className="size-4" />}
                  {isIndeterminate && <MinusIcon className="size-4" />}
                </CheckboxPrimitive.Indicator>
              </CheckboxPrimitive.Root>
              <Label htmlFor="incidents">Reported Incidents</Label>
            </div>
            <div className="grid grid-cols-3">
              {incidentReports.map((incident) => (
                <div
                  key={uid(incident)}
                  className="flex flex-col items-center gap-1"
                  onClick={() => {
                    const newSelectedIncidentTypes =
                      selectedIncidentTypes.includes(incident.label)
                        ? selectedIncidentTypes.filter(
                            (label) => label !== incident.label,
                          )
                        : [...selectedIncidentTypes, incident.label];
                    dispatch({
                      type: "update_selected_incident_types",
                      payload: {
                        selectedIncidentTypes: newSelectedIncidentTypes,
                      },
                    });
                  }}
                >
                  <img
                    className={cn(
                      "relative rounded-[8px] hover:cursor-pointer hover:outline hover:outline-2 hover:-outline-offset-2 hover:outline-blue-500",
                      selectedIncidentTypes.includes(incident.label) &&
                        "border-2 border-blue-500 p-0.5",
                    )}
                    src={new URL(incident.path, import.meta.url).href}
                    height="36"
                    width="36"
                    alt=""
                  />
                  <span
                    className={cn(
                      "text-[11px] capitalize group-hover:text-blue-500",
                      selectedIncidentTypes.includes(incident.label) &&
                        "text-blue-500",
                    )}
                  >
                    {incident.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
