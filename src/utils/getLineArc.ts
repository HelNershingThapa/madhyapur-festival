import {
  bearing,
  destination,
  distance,
  length,
  lineArc,
  midpoint,
  projection,
} from "@turf/turf";
import type { LineString, Position } from "geojson";

export const getLineArc = (
  startCoordinate: Position,
  endCoordinate: Position,
) => {
  let route: LineString = {
    type: "LineString",
    coordinates: [startCoordinate, endCoordinate],
  };

  route = projection.toWgs84(route);
  const lineD = length(route, { units: "kilometers" });
  const mp = midpoint(route.coordinates[0], route.coordinates[1]);
  const center = destination(
    mp,
    lineD,
    bearing(route.coordinates[0], route.coordinates[1]) - 90,
  );
  const lA = lineArc(
    center,
    distance(center, route.coordinates[0]),
    bearing(center, route.coordinates[1]),
    bearing(center, route.coordinates[0]),
  );

  return projection.toMercator(lA);
};
