export const isPosition = (query: string): boolean =>
  /^((\-?|\+?)?\d+(\.\d+)?),\s*((\-?|\+?)?\d+(\.\d+)?)$/gi.test(query);

export const isGeohash = (query: string): boolean =>
  /^[a-zA-Z]+-[a-zA-Z]+-\d+-[a-zA-Z0-9]+$/i.test(query);

export const getInDMS = (lat: number, lng: number) => {
  const convertToDMS = (coordinate: number, type: string) => {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    return `${degrees}°${minutes}'${seconds}"${type}`;
  };

  const latitude = convertToDMS(lat, lat >= 0 ? "N" : "S");
  const longitude = convertToDMS(lng, lng >= 0 ? "E" : "W");

  return [latitude, longitude].join(", ");
};
