import { BusFront, Footprints } from "lucide-react";

export const transitModeColorMap = {
  WALK: "#27A1F2",
  Bus: "#800980",
  "Sajha Yatayat": "#D27827",
  Tempo: "#2c3e50",
  Microbus: "#c0392b",
};

export const transitModeSignMap = {
  WALK: Footprints,
  BUS: BusFront,
};

export function getStartoftheLeg(geoJson) {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      coordinates: [geoJson.coordinates[0][0], geoJson.coordinates[0][1]],
      type: "Point",
    },
  };
}

export function getEndoftheLeg(geoJson) {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      coordinates: [
        geoJson.coordinates[geoJson.coordinates.length - 1][0],
        geoJson.coordinates[geoJson.coordinates.length - 1][1],
      ],
      type: "Point",
    },
  };
}
