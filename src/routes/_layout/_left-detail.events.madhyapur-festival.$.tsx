import React, { useEffect, useMemo, useState } from "react";
import {
  Layer,
  type LngLatBoundsLike,
  Source,
  useMap,
} from "react-map-gl/maplibre";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as turf from "@turf/turf";
import type { FeatureCollection, Position } from "geojson";
import { Bike, Car } from "lucide-react";
import { LngLat } from "maplibre-gl";

import { Icons } from "@/components/icons";
import { foodStalls, jatradata, parkings } from "@/components/jatra";
import { TypographyH4 } from "@/components/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StateDispatchContext } from "@/StateContext";
import BaatoService from "@/utils/baatoService";

export const Route = createFileRoute(
  "/_layout/_left-detail/events/madhyapur-festival/$",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const baatoService = useMemo(
    () => new BaatoService(import.meta.env.VITE_BAATO_API_URL),
    [],
  );
  const dispatch = React.useContext(StateDispatchContext);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [tabValue, setTabValue] = useState<string>("programs");
  const [activeSelectionIdentifier, setActiveSelectionIdentifier] =
    useState<string>("");
  const { current: map } = useMap();

  const routingPoints = jatradata.features.map((feature) => ({
    query: "baalho",
    coordinates: feature.geometry.coordinates as Position,
  }));

  const { data: routes } = useQuery({
    queryKey: ["directions", routingPoints, "foot"],
    queryFn: async () => await baatoService.routing(routingPoints, "foot"),
  });

  useEffect(() => {
    dispatch({
      type: "update_state",
      payload: {
        searchQuery: "Madhyapur Festival",
      },
    });
    const bbox = turf.bbox(jatradata as FeatureCollection) as LngLatBoundsLike;
    const padding = !isSmallScreen
      ? {
          left: 540,
          top: 100,
          right: 100,
          bottom: 100,
        }
      : {
          top: 100,
          bottom: 200,
        };
    map?.fitBounds(bbox, { zoom: 14, padding });
  }, [dispatch, isSmallScreen, map]);

  const tabList = [
    {
      value: "programs",
      label: "Programs",
    },
    {
      value: "stalls",
      label: "Food Stalls",
    },
    {
      value: "parking",
      label: "Parking",
    },
    {
      value: "toilet",
      label: "Toilet",
    },
  ];

  const flyToCoordinates = (coordinates: Position) => {
    map?.flyTo({
      center: new LngLat(coordinates[0], coordinates[1]),
      zoom: 17,
      padding: !isSmallScreen
        ? {
            left: 540,
            top: 100,
            right: 100,
            bottom: 100,
          }
        : {
            top: 100,
            bottom: 650,
          },
    });
  };

  const handleDirectionsClick = (coordinates: Position) => {
    navigate({
      to: "/directions/$locations/$mode/$",
      from: "/events/madhyapur-festival/$",
      params: {
        locations: `,,${coordinates[1]},${coordinates[0]}`,
        mode: "car",
      },
    });
  };

  return (
    <div>
      <div className="flex flex-col-reverse md:flex-col">
        <img
          className="md:block"
          src="/img/neel-barahi-naach.jpg"
          width="100%"
          alt="madhyapur thimi festival poster"
        />
        <div className="mb-4 px-2 pt-0 md:my-4">
          <TypographyH4 className="font-medium">
            Madhyapur Festival
          </TypographyH4>
          <span className="text-sm text-muted-foreground">
            Things to do &#x2022; Dec 27, 28 and 29{" "}
          </span>
        </div>
      </div>
      <Separator />
      <Tabs
        defaultValue="programs"
        className="mt-1 w-full"
        value={tabValue}
        onValueChange={(value) => {
          setTabValue(value);
          setActiveSelectionIdentifier("");
        }}
      >
        <div className="flex items-center justify-between border-b border-gray-300 pt-2">
          <TabsList className="grid w-full translate-y-[6px] grid-cols-4 bg-transparent">
            {tabList.map((tabOption) => (
              <TabsTrigger
                key={tabOption.value}
                value={tabOption.value}
                className="rounded-none border-b-[3px] border-transparent bg-transparent p-0 pb-1.5 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-primary"
              >
                {tabOption.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="programs">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            onValueChange={(value) => setActiveSelectionIdentifier(value)}
          >
            {jatradata.features.map((event) => (
              <AccordionItem
                value={event.properties.title}
                key={event.properties.title}
                className="px-2"
                onClick={() =>
                  flyToCoordinates(event.geometry.coordinates as Position)
                }
              >
                <AccordionTrigger className="text-left text-sm">
                  <div className="flex flex-col">
                    <div>{event.properties.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.properties.place}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Button
                    size="sm"
                    className="rounded-full py-0"
                    variant="outline"
                    onClick={() =>
                      handleDirectionsClick(
                        event.geometry.coordinates as Position,
                      )
                    }
                  >
                    <Icons.directions className="size-5 fill-blue-500 group-hover:fill-blue-600" />{" "}
                    Directions
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="stalls">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            onValueChange={(value) => setActiveSelectionIdentifier(value)}
          >
            {foodStalls.features.map((event) => (
              <AccordionItem
                value={event.properties.identifier}
                key={event.properties.identifier}
                className="px-2"
                onClick={() => {
                  setActiveSelectionIdentifier(event.properties.identifier);
                  flyToCoordinates(event.geometry.coordinates as Position);
                }}
              >
                <AccordionTrigger className="text-left text-sm">
                  <div className="flex flex-col">
                    <div>{event.properties.title}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Button
                    size="sm"
                    className="rounded-full py-0"
                    variant="outline"
                    onClick={() =>
                      handleDirectionsClick(
                        event.geometry.coordinates as Position,
                      )
                    }
                  >
                    <Icons.directions className="size-5 fill-blue-500 group-hover:fill-blue-600" />{" "}
                    Directions
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="parking">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            onValueChange={(value) => setActiveSelectionIdentifier(value)}
          >
            {parkings.features.map((event) => (
              <AccordionItem
                value={event.properties.identifier}
                key={event.properties.identifier}
                className="px-2"
                onClick={() => {
                  setActiveSelectionIdentifier(event.properties.identifier);
                  flyToCoordinates(event.geometry.coordinates as Position);
                }}
              >
                <AccordionTrigger className="text-left text-sm">
                  <div className="flex gap-1.5">
                    {event.properties.category === "bike" && (
                      <div className="mt-1 flex size-[26px] items-center justify-center rounded-full border-2 border-[#e30811]">
                        <Bike className="size-4" />
                      </div>
                    )}
                    {event.properties.category === "car" && (
                      <div className="mt-1 flex size-[26px] items-center justify-center rounded-full border-2 border-[#e30811]">
                        <Car className="size-4" />
                      </div>
                    )}
                    {event.properties.category === "both" && (
                      <div className="space-y-0.5">
                        <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#e30811]">
                          <Bike className="size-3" />
                        </div>
                        <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#e30811]">
                          <Car className="size-3" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div>{event.properties.title}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Button
                    size="sm"
                    className="rounded-full py-0"
                    variant="outline"
                    onClick={() =>
                      handleDirectionsClick(
                        event.geometry.coordinates as Position,
                      )
                    }
                  >
                    <Icons.directions className="size-5 fill-blue-500 group-hover:fill-blue-600" />{" "}
                    Directions
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="toilet">COMING SOON...</TabsContent>
      </Tabs>
      <Source id="venues" type="geojson" data={jatradata}>
        <Layer
          id="venues"
          type="symbol"
          layout={{
            "icon-image": [
              "case",
              ["==", ["get", "title"], activeSelectionIdentifier],
              "selected-marker",
              "jatra-marker",
            ],
            "icon-size": [
              "case",
              ["==", ["get", "title"], activeSelectionIdentifier],
              0.6,
              1,
            ],
            "text-field": ["get", "englishTitle"],
            "icon-allow-overlap": true,
            "text-font": ["OpenSans"],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-optional": true,
            "text-variable-anchor": ["right", "left"],
            "text-radial-offset": 1.4,
            "text-size": 14,
          }}
          paint={{
            "text-halo-color": "rgba(255, 255, 255, 1)",
            "text-color": "#e85d1c",
            "text-halo-width": 2,
          }}
        />
      </Source>
      <Source id="stalls" type="geojson" data={foodStalls}>
        <Layer
          id="stalls"
          type="symbol"
          layout={{
            "icon-image": [
              "case",
              ["==", ["get", "identifier"], activeSelectionIdentifier],
              "selected-marker",
              "stall-marker",
            ],
            "icon-size": [
              "case",
              ["==", ["get", "identifier"], activeSelectionIdentifier],
              0.6,
              0.6,
            ],
            "icon-allow-overlap": true,
            visibility: tabValue === "stalls" ? "visible" : "none",
          }}
        />
      </Source>
      <Source id="parking" type="geojson" data={parkings}>
        <Layer
          id="parking"
          type="symbol"
          layout={{
            "icon-image": [
              "case",
              ["==", ["get", "identifier"], activeSelectionIdentifier],
              "selected-marker",
              "parking-marker",
            ],
            "icon-size": [
              "case",
              ["==", ["get", "identifier"], activeSelectionIdentifier],
              0.6,
              0.6,
            ],
            "icon-allow-overlap": true,
            visibility: tabValue === "parking" ? "visible" : "none",
          }}
        />
      </Source>
      {routes && (
        <Source
          id={`route`}
          type="geojson"
          data={{
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routes[0].geojson.coordinates,
            },
          }}
        >
          <Layer
            id={`route`}
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "#cad8eb",
              "line-width": 1,
            }}
            beforeId="Poi-other"
          />
          <Layer
            id={`route-border`}
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "#eb5d33",
              "line-width": 3,
              "line-dasharray": [2, 3],
              "line-opacity": 0.3,
            }}
          />
        </Source>
      )}
    </div>
  );
}
