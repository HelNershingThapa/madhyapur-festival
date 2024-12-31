import { useEffect } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";

import { PoiMarker } from "@/components/markers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStateDispatchContext } from "@/StateContext";
import BaatoService from "@/utils/baatoService";
import { capitalizeFirstLetter } from "@/utils/capitalize";
import { polygonLayer, polygonOutlineLayer } from "@/utils/layers";

import PlaceDetail from "./place-detail";

export function PlaceInfo() {
  const baatoService = new BaatoService(import.meta.env.VITE_BAATO_API_URL);
  const params = useParams({ from: "/_layout/_left-detail/places/$placeId" });
  const { current: map } = useMap();
  const dispatch = useStateDispatchContext();
  const {
    isLoading,
    data: placeInfo,
    isError,
  } = useQuery({
    queryKey: ["place", params.placeId],
    queryFn: async () => await baatoService.places(params.placeId),
    enabled: !!params.placeId,
  });

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
        center: [placeInfo.centroid.lon, placeInfo.centroid.lat],
        padding: {
          left: 420,
        },
      });
      dispatch({
        type: "update_state",
        payload: {
          searchQuery: placeInfo.name,
        },
      });
    }
  }, [dispatch, map, placeInfo]);

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
          <Source id="maine" type="geojson" data={placeInfo.geometry}>
            {["boundary", "administrative"].includes(placeInfo.type) && (
              <>
                <Layer source="maine" {...polygonLayer} />
                <Layer source="maine" {...polygonOutlineLayer} />
              </>
            )}
          </Source>
          <PoiMarker
            latitude={placeInfo.centroid.lat}
            longitude={placeInfo.centroid.lon}
          />
          <PlaceDetail
            title={placeInfo.name}
            description={capitalizeFirstLetter(placeInfo.type)}
            position={[placeInfo.centroid.lon, placeInfo.centroid.lat]}
            tags={placeInfo.tags}
            isParkingArea={isParkingArea}
          />
        </>
      )}
    </div>
  );
}
