const applyToArray = (func, array) => func.apply(Math, array);

export const getCorners = (coordinates) => {
  const pointsLong = coordinates.map((point) => point[0]);
  const pointsLat = coordinates.map((point) => point[1]);
  const corners = [
    [applyToArray(Math.min, pointsLong), applyToArray(Math.min, pointsLat)],
    [applyToArray(Math.max, pointsLong), applyToArray(Math.max, pointsLat)],
  ];
  return corners;
};
