import { createLazyFileRoute } from "@tanstack/react-router";

import PlaceInfo from "@/components/PlaceInfo";

export const Route = createLazyFileRoute(
  "/_layout/_left-detail/places/$placeId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <PlaceInfo />;
}
