import { useEffect } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";

import PlaceDetail from "@/components/place-detail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { osmElementQueryOptions } from "@/lib/queryOptions";
import { useStateDispatchContext } from "@/StateContext";
import { capitalizeFirstLetter } from "@/utils/capitalize";
import { polygonLayer, polygonOutlineLayer } from "@/utils/layers";

export function OsmElementInfo() {
  const params = useParams({ from: "/_layout/_left-detail/place/$osmId/$" });
  const { current: map } = useMap();
  const dispatch = useStateDispatchContext();
  const {
    isLoading,
    data: placeInfo,
    isError,
  } = useSuspenseQuery(osmElementQueryOptions(Number(params.osmId)));

  const placeInfoCoordinates =
    placeInfo?.geometry.type === "Point"
      ? placeInfo.geometry.coordinates
      : placeInfo?.geometry.coordinates[0][0];

  const isParkingArea = [
    "parking",
    "bicycle_parking",
    "underground",
    "multi-storey",
    "parking_space",
    "car_parking",
  ].includes(placeInfo?.type);

  useEffect(() => {
    if (placeInfo && map) {
      map.flyTo({
        center: placeInfoCoordinates,
        padding: {
          left: 420,
        },
      });
      dispatch({
        type: "update_state",
        payload: {
          searchQuery:
            placeInfo.properties?.name ||
            placeInfo.properties?.[
              Object.keys(placeInfo.properties).find((key) =>
                key.startsWith("name"),
              )
            ],
        },
      });
    }
  }, [dispatch, map, placeInfo, placeInfoCoordinates]);

  return (
    <div>
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>An error occured</AlertTitle>
          <AlertDescription>
            Failed to fetch data from the Baato OSM server.
          </AlertDescription>
        </Alert>
      )}
      {!isLoading && placeInfo && (
        <>
          {["boundary", "administrative"].includes(placeInfo.type) && (
            <Source id="maine" type="geojson" data={placeInfo.geometry}>
              <Layer source="maine" {...polygonLayer} />
              <Layer source="maine" {...polygonOutlineLayer} />
            </Source>
          )}
          <PlaceDetail
            title={
              placeInfo.properties?.name ||
              placeInfo.properties?.[
                Object.keys(placeInfo.properties).find((key) =>
                  key.startsWith("name"),
                )
              ]
            }
            description={capitalizeFirstLetter(
              placeInfo.properties?.id.split("/")[0],
            )}
            tags={placeInfo.properties as Record<string, string>}
            position={placeInfoCoordinates}
            isParkingArea={isParkingArea}
          />
        </>
      )}
    </div>
  );
}
