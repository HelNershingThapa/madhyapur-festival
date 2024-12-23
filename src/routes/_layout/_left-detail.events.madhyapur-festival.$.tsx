import React, { useEffect, useState } from "react";
import {
  Layer,
  type LngLatBoundsLike,
  Source,
  useMap,
} from "react-map-gl/maplibre";

import { createFileRoute } from "@tanstack/react-router";
import * as turf from "@turf/turf";
import type { FeatureCollection } from "geojson";
import { LngLat } from "maplibre-gl";

import { foodStalls, jatradata } from "@/components/jatra";
import { TypographyH4 } from "@/components/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StateDispatchContext } from "@/StateContext";

export const Route = createFileRoute(
  "/_layout/_left-detail/events/madhyapur-festival/$",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const dispatch = React.useContext(StateDispatchContext);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [activeSelectionIdentifier, setActiveSelectionIdentifier] =
    useState<string>("");
  const { current: map } = useMap();

  useEffect(() => {
    dispatch({
      type: "update_state",
      payload: {
        searchQuery: "Madhyapur Festival",
      },
    });
    const bbox = turf.bbox(jatradata as FeatureCollection) as LngLatBoundsLike;
    map?.fitBounds(
      bbox,
      !isSmallScreen
        ? {
            zoom: 14,
            padding: {
              left: 540,
              top: 100,
              right: 100,
              bottom: 100,
            },
          }
        : {
            zoom: 14,
            padding: {
              top: 100,
              left: 50,
              right: 50,
              bottom: 887,
            },
          },
    );
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
        onValueChange={() => setActiveSelectionIdentifier("")}
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
                  map?.flyTo({
                    center: new LngLat(
                      event.geometry.coordinates[0],
                      event.geometry.coordinates[1],
                    ),
                    zoom: 17,
                    padding: {
                      left: 450,
                    },
                  })
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
                <AccordionContent>[DETAILED INFO GOES HERE]</AccordionContent>
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
                  map?.flyTo({
                    center: new LngLat(
                      event.geometry.coordinates[0],
                      event.geometry.coordinates[1],
                    ),
                    zoom: 17,
                    padding: {
                      left: 450,
                    },
                  });
                }}
              >
                <AccordionTrigger className="text-left text-sm">
                  <div className="flex flex-col">
                    <div>{event.properties.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.properties.title}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>[DETAILED INFO GOES HERE]</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
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
            "text-field": ["get", "title"],
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
          }}
        />
      </Source>
    </div>
  );
}
