/**
 * Solar position formulas (universal Umi‑Time conversion, solar altitude, and solar azimuth) per Umi‑Time Spec §9.5.
 *
 * @module
 */

import { toRad, toDeg } from "../utils/solarMath";
import { getSolarDeclination } from "./declination";
import { getEquationOfTime } from "./equationOfTime";
import { getHourAngle } from "./hourAngle";

/**
 * Converts a UTC `Date` into its fractional universal Umi‑Time value (`UTᵘ`).
 *
 * Formula: `UTᵘ = (UTC seconds) / 240`
 *
 * @param date - UTC `Date` instant.
 * @returns Fractional universal Umi‑Time value in umi `[0, 360)`.
 */
export function utUmiFromDate(date: Date): number {
  const seconds =
    date.getUTCHours() * 3600 +
    date.getUTCMinutes() * 60 +
    date.getUTCSeconds();
  return (seconds / 240) % 360;
}

/**
 * Computes the solar altitude angle above the horizon in degrees (Spec §9.5).
 *
 * Formula: `sin(alt) = sin φ sin δ + cos φ cos δ cos H`
 *
 * @param latitude - Observer latitude in degrees `[-90, 90]`.
 * @param declination - Solar declination (δ) in degrees.
 * @param hourAngleDeg - Solar hour angle (H) in degrees.
 * @returns Solar altitude in degrees `[-90, 90]`.
 */
export function solarAltitude(
  latitude: number,
  declination: number,
  hourAngleDeg: number,
): number {
  const latRad = toRad(latitude);
  const decRad = toRad(declination);
  const haRad = toRad(hourAngleDeg);

  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);

  return toDeg(Math.asin(sinAlt));
}

/**
 * Computes the solar azimuth angle clockwise from true north in degrees (Spec §9.5).
 *
 * Formula: `cos(A) = (sin δ − sin φ sin alt) / (cos φ cos alt)` (with `A = 360° − A` when `H > 0`).
 *
 * @param latitude - Observer latitude in degrees `[-90, 90]`.
 * @param declination - Solar declination (δ) in degrees.
 * @param altitudeDeg - Solar altitude angle in degrees.
 * @param hourAngleDeg - Solar hour angle (H) in degrees.
 * @returns Solar azimuth in degrees `[0, 360)`.
 */
export function solarAzimuth(
  latitude: number,
  declination: number,
  altitudeDeg: number,
  hourAngleDeg: number,
): number {
  const latRad = toRad(latitude);
  const decRad = toRad(declination);
  const altRad = toRad(altitudeDeg);

  const numerator = Math.sin(decRad) - Math.sin(latRad) * Math.sin(altRad);

  const denominator = Math.cos(latRad) * Math.cos(altRad);

  const cosAz = numerator / denominator;

  // Clamp to avoid NaN at extreme latitudes
  const clamped = Math.max(-1, Math.min(1, cosAz));

  let az = toDeg(Math.acos(clamped));

  // Hour angle sign determines east/west
  if (hourAngleDeg > 0) {
    az = 360 - az;
  }

  return az;
}

/**
 * Computes both solar altitude and azimuth in degrees for a given UTC `Date` and geographic coordinates.
 *
 * @param date - UTC `Date` instant.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Object containing `altitude` and `azimuth` in degrees.
 */
export function getSolarPosition(
  date: Date,
  lat: number,
  lon: number,
): { altitude: number; azimuth: number } {
  const declination = getSolarDeclination(date);
  const eot = getEquationOfTime(date);

  const utUmi = utUmiFromDate(date);
  const hourAngleDeg = getHourAngle(utUmi, lon, eot);

  const altitude = solarAltitude(lat, declination, hourAngleDeg);
  const azimuth = solarAzimuth(lat, declination, altitude, hourAngleDeg);

  return { altitude, azimuth };
}
