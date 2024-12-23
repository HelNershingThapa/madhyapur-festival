import React, { useEffect } from "react";
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
      <Tabs defaultValue="programs" className="mt-1 w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="stalls">Food Stalls</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
          <TabsTrigger value="toilet">Toilet</TabsTrigger>
        </TabsList>
        <TabsContent value="programs">
          <Accordion type="single" collapsible className="w-full">
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
          <Accordion type="single" collapsible className="w-full">
            {foodStalls.features.map((event) => (
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
      <Source type="geojson" data={jatradata}>
        <Layer
          type="symbol"
          layout={{
            "icon-image": "jatra-marker",
            "icon-size": 1,
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
      <Source type="geojson" data={foodStalls}>
        <Layer
          type="symbol"
          layout={{
            "icon-image": "jatra-food",
            "icon-size": 0.04,
            "text-field": ["get", "title"],
            "icon-allow-overlap": true,
            "text-font": ["OpenSans"],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-optional": true,
            "text-variable-anchor": ["right", "left"],
            "text-radial-offset": 1.4,
            "text-size": 13,
          }}
          paint={{
            "text-halo-color": "rgba(255, 255, 255, 1)",
            "text-color": "#101640",
            "text-halo-width": 2,
          }}
        />
      </Source>
    </div>
  );
}
