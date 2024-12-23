import { queryOptions } from "@tanstack/react-query";
import osmtogeojson from "osmtogeojson";

import { fetchElement } from "@/api/osm";

export const osmElementQueryOptions = (osmId: number) =>
  queryOptions({
    queryKey: ["osm", osmId],
    queryFn: async () => await fetchElement(osmId),
    enabled: !!osmId,
    select: (data) => {
      const geojson = osmtogeojson(data);
      return geojson.features[0];
    },
  });
