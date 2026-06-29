import * as THREE from 'three';
import type { GeoPoint } from '@/data/ScenarioData';
import { EARTH_RADIUS_UNITS } from '@/data/ScenarioData';

const DEG = Math.PI / 180;

/**
 * Convert geographic lon/lat to a 3D Cartesian point on a sphere of the given
 * radius. +Y is up (north pole). Texture mapping assumes standard equirectangular.
 */
export function geoToWorld(
  lon: number,
  lat: number,
  radius = EARTH_RADIUS_UNITS,
  height = 0,
): THREE.Vector3 {
  const phi = (90 - lat) * DEG; // polar angle from +Y
  const theta = (lon + 180) * DEG; // azimuth
  const r = radius + height;
  // Align so that lon=-66 (impact) sits on the +Z hemisphere facing default camera.
  const x = -r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

/** World position -> surface normal (unit). */
export function worldNormal(p: GeoPoint): THREE.Vector3 {
  return geoToWorld(p.lon, p.lat, 1).normalize();
}

/** Great-circle distance between two points (Haversine), in km. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371; // km
  const dLat = (b.lat - a.lat) * DEG;
  const dLon = (b.lon - a.lon) * DEG;
  const sLat = Math.sin(dLat / 2);
  const sLon = Math.sin(dLon / 2);
  const h =
    sLat * sLat + Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * sLon * sLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Destination-point formula: starting from `from`, travel `distKm` along the
 * initial bearing `bearingDeg`. Returns the resulting geographic point.
 * Used to trace geodesic wave rings that hug the sphere's curvature.
 */
export function destinationPoint(
  from: GeoPoint,
  distKm: number,
  bearingDeg: number,
): GeoPoint {
  const R = 6371;
  const d = distKm / R;
  const b = bearingDeg * DEG;
  const lat1 = from.lat * DEG;
  const lon1 = from.lon * DEG;

  const sinLat2 =
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b);
  const lat2 = Math.asin(Math.max(-1, Math.min(1, sinLat2)));
  const y = Math.sin(b) * Math.sin(d) * Math.cos(lat1);
  const x = Math.cos(d) - Math.sin(lat1) * sinLat2;
  const lon2 = lon1 + Math.atan2(y, x);

  return {
    lat: (lat2 / DEG + 540) % 360 - 180,
    lon: (((lon2 / DEG + 540) % 360) - 180),
  };
}

/**
 * Build a closed polyline (array of world points) for a geodesic circle of
 * `radiusKm` centered at `center`. Each vertex sits slightly above the surface
 * so the ring renders cleanly over the globe (avoids z-fighting).
 */
export function geodesicRing(
  center: GeoPoint,
  radiusKm: number,
  segments = 128,
  height = 0.004,
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const bearing = (i / segments) * 360;
    const p = destinationPoint(center, radiusKm, bearing);
    pts.push(geoToWorld(p.lon, p.lat, EARTH_RADIUS_UNITS, height));
  }
  return pts;
}

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothstep easing. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Clamp. */
export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Normalize a value into [0,1] across a range. */
export const norm = (v: number, lo: number, hi: number) =>
  hi === lo ? 0 : clamp((v - lo) / (hi - lo), 0, 1);
