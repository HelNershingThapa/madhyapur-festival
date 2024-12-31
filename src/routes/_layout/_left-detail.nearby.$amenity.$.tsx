import * as React from "react";
import {
  Layer,
  type LngLatBoundsLike,
  Source,
  useMap,
} from "react-map-gl/maplibre";
import { uid } from "react-uid";

import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import * as turf from "@turf/turf";
import axios from "axios";
import GeoJSON from "geojson";

import PoiListItem from "@/components/PoiListItem";
import { TypographyH4 } from "@/components/typography";
import { amenities } from "@/config";
import { StateDispatchContext } from "@/StateContext";
import { Place } from "@/types/place";

export const Route = createFileRoute("/_layout/_left-detail/nearby/$amenity/$")(
  {
    component: RouteComponent,
  },
);

const getNearbyPlaces = async ({
  amenity,
  latitude,
  longitude,
}: {
  amenity: string;
  latitude: number;
  longitude: number;
}) => {
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
  const { amenity } = useParams({
    from: "/_layout/_left-detail/nearby/$amenity/$",
  });
  const dispatch = React.useContext(StateDispatchContext);
  const { current: map } = useMap();
  const navigate = useNavigate();
  const [hoveredPoiIndex, setHoveredPoiIndex] = React.useState<number>(-1);
  const [viewportCenter] = React.useState(map!.getCenter());

  const { isLoading, data: pois } = useQuery({
    queryKey: [
      "nearby",
      {
        latitude: viewportCenter?.lat,
        longitude: viewportCenter?.lng,
        amenity: amenity,
      },
    ],
    queryFn: async () =>
      await getNearbyPlaces({
        latitude: viewportCenter?.lat,
        longitude: viewportCenter?.lng,
        amenity: amenity,
      }),
    enabled: !!amenity,
  });

  React.useEffect(() => {
    map?.on("mouseenter", `points`, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map?.on("mouseleave", `points`, () => {
      map.getCanvas().style.cursor = "";
    });
    map?.on("click", "points", (e) => {
      const placeId = e.features?.[0].properties.placeId;
      if (placeId)
        navigate({
          to: "/places/$placeId",
          params: {
            placeId,
          },
        });
    });
  }, [dispatch, map, navigate, pois]);

  React.useEffect(() => {
    dispatch({
      type: "update_state",
      payload: {
        searchQuery:
          amenities.find((places) => places.value === amenity)?.label ??
          "Unknown",
      },
    });
  }, [dispatch, amenity]);

  React.useEffect(() => {
    dispatch({
      type: "update_state",
      payload: {
        nearbyLoading: isLoading,
      },
    });
  }, [dispatch, isLoading]);

  React.useEffect(() => {
    if (!pois) return;
    dispatch({
      type: "update_state",
      payload: {
        isClearSearchShown: true,
      },
    });
    // fit map bounds to amenity markers
    const coordinates = pois.map((poi) => [poi.centroid.lon, poi.centroid.lat]);
    const line = turf.lineString(coordinates);

    const bounds = turf.bbox(line) as LngLatBoundsLike;
    map?.fitBounds(bounds, {
      padding: { top: 100, bottom: 50, left: 450, right: 50 },
    });
  }, [dispatch, map, pois]);

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
            "icon-image": `marker-${amenity}`,
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
      <div>
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
    </>
  );
}
