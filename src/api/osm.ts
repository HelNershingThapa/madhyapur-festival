import axios, { AxiosError } from "axios";

import { OsmData } from "@/types/element";
import { ElementType } from "@/types/osm";

export const fetchOsmElement = async (
  elementType: ElementType,
  id: string | number,
) => {
  const res = await axios.get<OsmData>(
    `https://osm.klldev.org/api/0.6/${elementType}/${id}${elementType === "node" ? "" : "/full"}.json`,
  );
  return res.data;
};

export async function fetchElement(sourceId: number) {
  try {
    return await fetchOsmElement("node", sourceId);
  } catch (err) {
    const nodeError = err as AxiosError;
    if (nodeError.response?.status === 404) {
      try {
        return await fetchOsmElement("way", sourceId);
      } catch (wayErr) {
        const wayError = wayErr as AxiosError;
        if (wayError.response?.status === 404) {
          return await fetchOsmElement("relation", sourceId);
        }
        throw wayError;
      }
    }
    throw nodeError;
  }
}
