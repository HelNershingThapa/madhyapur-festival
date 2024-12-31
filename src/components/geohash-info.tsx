import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";

import { decodeGeohash } from "@/api/geohash";
import { PoiMarker } from "@/components/markers";
import PlaceDetail from "@/components/place-detail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStateDispatchContext } from "@/StateContext";

export function GeohashInfo() {
  const { placeId: geohashQuery } = useParams({
    from: "/_layout/_left-detail/places/$placeId",
  });
  const { current: map } = useMap();
  const dispatch = useStateDispatchContext();
  const {
    isLoading,
    data: geohashInfo,
    isError,
  } = useQuery({
    queryKey: ["geohash", geohashQuery],
    queryFn: async () => await decodeGeohash(geohashQuery),
    enabled: !!geohashQuery,
  });

  useEffect(() => {
    if (geohashInfo && map) {
      map.flyTo({
        center: geohashInfo.geometry.coordinates,
        padding: {
          left: 420,
        },
      });
      dispatch({
        type: "update_state",
        payload: {
          searchQuery: geohashQuery,
        },
      });
    }
  }, [dispatch, map, geohashInfo, geohashQuery]);

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
      {!isLoading && geohashInfo && (
        <>
          <PoiMarker
            latitude={geohashInfo.geometry.coordinates[1]}
            longitude={geohashInfo.geometry.coordinates[0]}
          />
          <PlaceDetail
            title={geohashQuery}
            description={`${geohashInfo.geometry.coordinates[1].toFixed(6)}, ${geohashInfo.geometry.coordinates[1].toFixed(6)}`}
            position={geohashInfo.geometry.coordinates}
          />
        </>
      )}
    </div>
  );
}
