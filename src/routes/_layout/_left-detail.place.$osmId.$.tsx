import { createFileRoute } from "@tanstack/react-router";

import { OsmElementInfo } from "@/components/osm-element-info";
import { osmElementQueryOptions } from "@/lib/queryOptions";

export const Route = createFileRoute("/_layout/_left-detail/place/$osmId/$")({
  loader: ({ params: { osmId }, context: { queryClient } }) => {
    queryClient.ensureQueryData(osmElementQueryOptions(Number(osmId)));
  },
  component: OsmElementInfo,
});
