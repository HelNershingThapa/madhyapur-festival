import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

import { useParams } from "@tanstack/react-router";

import { PoiMarker } from "@/components/markers";
import PlaceDetail from "@/components/place-detail";
import { useStateDispatchContext } from "@/StateContext";
import { getInDMS } from "@/utils/miscellaneous";

export function PositionInfo() {
  const { placeId: coordinatesInParams } = useParams({
    from: "/_layout/_left-detail/places/$placeId",
  });
  const { current: map } = useMap();
  const dispatch = useStateDispatchContext();
  const coordinates = coordinatesInParams.split(",").map(Number).reverse();
  const coordinatesDms = getInDMS(coordinates[1], coordinates[0]);

  useEffect(() => {
    if (map) {
      map.flyTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 14,
        padding: {
          left: 420,
        },
      });
      dispatch({
        type: "update_state",
        payload: {
          searchQuery: coordinatesDms,
        },
      });
    }
  }, [coordinates, coordinatesDms, dispatch, map]);

  return (
    <div>
      <PoiMarker latitude={coordinates[1]} longitude={coordinates[0]} />
      <PlaceDetail
        title={coordinatesDms}
        description={`${coordinates[1].toFixed(6)},${coordinates[0].toFixed(6)}`}
        position={coordinates}
      />
    </div>
  );
}
