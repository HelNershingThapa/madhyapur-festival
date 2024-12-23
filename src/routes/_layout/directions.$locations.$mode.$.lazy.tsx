import { createLazyFileRoute } from "@tanstack/react-router";

import Directions from "@/components/Directions";

export const Route = createLazyFileRoute(
  "/_layout/directions/$locations/$mode/$",
)({
  component: Directions,
});
