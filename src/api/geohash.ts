import axios from "axios";

export const encodeGeohash = async ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const res = await axios.get(
    `https://explore.baato.io/geohash/encode?lat=${latitude}&lng=${longitude}`,
  );
  return res.data;
};

export const decodeGeohash = async (geohashQuery: string) => {
  const res = await axios.get(
    `https://explore.baato.io/geohash/decode?code=${geohashQuery}`,
  );
  return res.data;
};
