import { createLazyFileRoute } from "@tanstack/react-router";

import { MyContributions } from "@/components/MyContributions";

export const Route = createLazyFileRoute("/_layout/contributions")({
  component: MyContributions,
});
