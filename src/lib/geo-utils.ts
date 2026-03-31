import { UI_CONSTANTS } from './constants';

/**
 * Calculate the distance between two points in km using the haversine formula.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = UI_CONSTANTS.EARTH_RADIUS_KM;
  const HALF_CIRCLE_DEG = 180;
  const dLat = (lat2 - lat1) * (Math.PI / HALF_CIRCLE_DEG);
  const dLon = (lon2 - lon1) * (Math.PI / HALF_CIRCLE_DEG);
  const HALF = 0.5;
  const TWO = 2;
  const a =
    Math.sin(dLat * HALF) * Math.sin(dLat * HALF) +
    Math.cos(lat1 * (Math.PI / HALF_CIRCLE_DEG)) * Math.cos(lat2 * (Math.PI / HALF_CIRCLE_DEG)) *
    Math.sin(dLon * HALF) * Math.sin(dLon * HALF);
  const c = TWO * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
