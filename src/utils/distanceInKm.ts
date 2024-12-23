export function getDistance(distanceInMeters) {
  const distance = Math.round(distanceInMeters);
  if (distance < 1000) {
    return `${distance} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
}
