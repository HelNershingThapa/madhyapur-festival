import { type GeoPoint } from "firebase/firestore";

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
  tags: string[];
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  score: string | number; // Because "NaN" is string, but it might represent a number.
  radialDistanceInKm: number;
  open: boolean | null;
};

export type Report = {
  id: string;
  latLng: GeoPoint;
  reportType: string;
  downVotes: number;
  downVotedList: string[] | null;
  expiresAt: number;
  myTraces: any[] | null;
  reportSubItemType: string;
  images: string[];
  speedLimit: string;
  reportItemType: string;
  upVotedList: string[] | null;
  deviceId: string;
  comment: string;
  createdAt: number;
  updatedAt: number;
  userEmail: string;
  address: string;
  upVotes: number;
};

export type SearchPlace = {
  placeId: number;
  osmId: number;
  name: string;
  address: string;
  type: string;
  score: number;
  radialDistanceInKm: number;
};
