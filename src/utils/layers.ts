import type { FillLayer, LineLayer } from "react-map-gl/maplibre";

export const polygonLayer: Omit<FillLayer, "id" | "source"> = {
  type: "fill",
  paint: {
    "fill-color": "#0080ff", // blue color fill
    "fill-opacity": 0.08,
  },
};

export const polygonOutlineLayer: Omit<FillLayer, "id" | "source"> = {
  type: "fill",
  paint: {
    "fill-color": "#0080ff", // blue color fill
    "fill-opacity": 0.08,
  },
};

export const dottedLayer: Omit<LineLayer, "id" | "source"> = {
  type: "line",
  paint: {
    "line-color": "gray",
    "line-width": 6,
    "line-dasharray": [2, 1],
    "line-opacity": 0.5,
  },
};
