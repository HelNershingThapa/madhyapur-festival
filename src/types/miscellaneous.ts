import type { Position } from "geojson";

export type RoutingPoint = {
  query: string;
  coordinates: null | Position;
};
