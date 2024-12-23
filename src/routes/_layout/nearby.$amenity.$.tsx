import * as React from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import { uid } from "react-uid";

import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { bbox, lineString } from "@turf/turf";
import axios from "axios";
import GeoJSON from "geojson";

import PoiListItem from "@/components/PoiListItem";
import { TypographyH4 } from "@/components/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { amenities } from "@/config";
import { StateContext, StateDispatchContext } from "@/StateContext";
import { Place } from "@/types/place";

export const Route = createFileRoute("/_layout/nearby/$amenity/$")({
  component: RouteComponent,
});

const getNearbyPlaces = async ({ amenity, latitude, longitude }) => {
  const res = await axios.get(
    `${import.meta.env.VITE_BAATO_API_URL}/v1/search/nearby`,
    {
      params: {
        key: import.meta.env.VITE_BAATO_ACCESS_TOKEN,
        lat: latitude,
        lon: longitude,
        type: amenity,
        radius: 15,
        limit: 20,
        sortBy: "distance",
      },
    },
  );
  return res.data.data as Place[];
};

function RouteComponent() {
  const navigate = useNavigate();
  const params = useParams({ from: "/_layout/nearby/$amenity/$" });
  const state = React.useContext(StateContext);
  const dispatch = React.useContext(StateDispatchContext);
  const { current: map } = useMap();

  const { userLocation, lat, lng } = state;
  const viewportLatLng = [lat, lng];
  const { isLoading, data: pois } = useQuery({
    queryKey: [
      "nearby",
      {
        latitude: userLocation?.[0] || viewportLatLng[0],
        longitude: userLocation?.[1] || viewportLatLng[1],
        amenity: params.amenity,
      },
    ],
    queryFn: async () =>
      await getNearbyPlaces({
        latitude: userLocation?.[0] || viewportLatLng[0],
        longitude: userLocation?.[1] || viewportLatLng[1],
        amenity: params.amenity,
      }),
    enabled: !!params.amenity,
  });

  const [hoveredPoiIndex, setHoveredPoiIndex] = React.useState(null);

  React.useEffect(() => {
    map?.on("mouseenter", `points`, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map?.on("mouseleave", `points`, () => {
      map.getCanvas().style.cursor = "";
    });

    map?.on("click", "points", (e) => {
      const clickedPoi = pois.find(
        (feature) => feature.name === e.features[0].properties.name,
      );
      dispatch({
        type: "nearby_poi_clicked",
        payload: {
          poi: clickedPoi,
        },
      });
    });
  }, []);

  React.useEffect(() => {
    dispatch({
      type: "update_state",
      payload: {
        searchQuery:
          amenities.find((places) => places.value === params.amenity)?.label ||
          "Unknown",
      },
    });
  }, []);

  React.useEffect(() => {
    dispatch({
      type: "update_state",
      payload: {
        nearbyLoading: isLoading,
      },
    });
  }, [isLoading]);

  React.useEffect(() => {
    if (!pois) return;
    dispatch({
      type: "update_state",
      payload: {
        isClearSearchShown: true,
      },
    });
    // fit map bounds to amenity markers
    const line = lineString(
      pois.map((poi) => [poi.centroid.lon, poi.centroid.lat]),
    );

    const bounds = bbox(line);
    map?.fitBounds(bounds, {
      padding: { top: 100, bottom: 50, left: 450, right: 50 },
    });
  }, [pois]);

  const getPoisGeojson = React.useCallback(() => {
    const geojson = GeoJSON.parse(pois, {
      Point: ["centroid.lat", "centroid.lon"],
    });
    // adding markerIndex inside feature property to change icon size on hover
    geojson.features.forEach(
      (feature, index) => (feature.properties.markerIndex = index),
    );
    return geojson;
  }, [pois]);

  if (!pois) return null;

  return (
    <>
      <Source id="points" type="geojson" data={getPoisGeojson()}>
        <Layer
          id="points"
          type="symbol"
          source="points"
          layout={{
            "icon-image": `marker-${params.amenity}`,
            "icon-size": [
              "case",
              ["==", ["get", "markerIndex"], hoveredPoiIndex],
              0.6,
              0.4,
            ],
            "icon-allow-overlap": true,
            "icon-ignore-placement": false,
            "icon-keep-upright": true,
            "icon-padding": 0,
            // get the title name from the source's "title" property
            "text-optional": true,
            "text-field": ["get", "name"],
            "text-font": ["OpenSans"],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            // "text-offset": [1.5, 0.25],
            "text-variable-anchor": ["right", "left"],
            "text-radial-offset": [
              "case",
              ["==", ["get", "markerIndex"], hoveredPoiIndex],
              2.0,
              1.4,
            ],
            "text-size": 13,
          }}
          paint={{
            "text-halo-color": "rgba(255, 255, 255, 1)",
            "text-halo-width": 2,
          }}
        />
      </Source>
      <div className="fixed bottom-0 left-0 top-0 z-[1] hidden w-[428px] bg-background pt-[70px] md:block">
        <ScrollArea className="h-full">
          <div className="w-full max-w-full py-0">
            <TypographyH4 className="mb-1 px-3">Results</TypographyH4>
            {pois.map((poi, index) => (
              <PoiListItem
                key={uid(poi, index)}
                poi={poi}
                setHoveredPoiIndex={setHoveredPoiIndex}
                poiIndex={index}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
