import type { Geometry, LineString } from "geojson";

export type Place = {
  placeId: number;
  osmId: number;
  license: string;
  name: string;
  address: string;
  type: string;
  centroid: {
    lat: number;
    lon: number;
  };
  tags: Record<string, string>;
  geometry: Geometry;
  score: number;
};

export type NearbyPlace = Place & {
  radialDistanceInKm: number;
  open: null | boolean;
};

export type ReverseGeocodingResult = {
  timestamp: string;
  status: number;
  message: string;
  data: ReverseGeocodingResponse[];
};

export type ReverseGeocodingResponse = {
  placeId: number;
  osmId: number;
  license: string;
  name: string;
  address: string;
  type: string;
  centroid: Coordinates;
  tags: string[];
  geometry: Geometry;
  score: string;
};

type Coordinates = {
  lat: number;
  lon: number;
};

export type DirectionsMode = "foot" | "bike" | "car" | "transit";

type Instruction = {
  points: {
    size: number;
    intervalString: string;
    immutable: boolean;
    "3D": boolean;
    dimension: number;
    empty: boolean;
  };
  annotation: {
    empty: boolean;
    importance: number;
    message: string;
  };
  sign: number;
  name: string;
  distance: number;
  time: number;
  extraInfoJSON: {
    heading?: number;
    landmark?: string;
    landmark_centroid?: [number, number];
    last_heading?: number;
  };
  length: number;
};

export type Route = {
  geojson: LineString;
  distanceInMeters: number;
  timeInMs: number;
  instructionList: Instruction[];
};
