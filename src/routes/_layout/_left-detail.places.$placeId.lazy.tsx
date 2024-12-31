import { createLazyFileRoute, useParams } from "@tanstack/react-router";

import { GeohashInfo } from "@/components/geohash-info";
import { PlaceInfo } from "@/components/PlaceInfo";
import { PositionInfo } from "@/components/position-info";
import { isGeohash, isPosition } from "@/utils/miscellaneous";

export const Route = createLazyFileRoute(
  "/_layout/_left-detail/places/$placeId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { placeId: query } = useParams({
    from: "/_layout/_left-detail/places/$placeId",
  });
  const parsedQuery = decodeURIComponent(query);
  const isCoordinates = isPosition(parsedQuery);
  const isQueryGeohash = isGeohash(parsedQuery);

  if (isCoordinates) {
    return <PositionInfo />;
  }

  if (isQueryGeohash) {
    return <GeohashInfo />;
  }

  return <PlaceInfo />;
}
