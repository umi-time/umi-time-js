// solarPosition.ts — Umi‑Time spec solar altitude & azimuth formulas

import { toRad, toDeg } from "../utils/solarMath";
import { getSolarDeclination } from "./declination";
import { getEquationOfTime } from "./equationOfTime";
import { getHourAngle } from "./hourAngle";

/* -------------------------------------------------------
 *  UTᵘ from Date
 *  UTᵘ = (UTC seconds) / 240
 * ----------------------------------------------------- */
export function utUmiFromDate(date: Date): number {
  const seconds =
    date.getUTCHours() * 3600 +
    date.getUTCMinutes() * 60 +
    date.getUTCSeconds();
  return (seconds / 240) % 360;
}

/* -------------------------------------------------------
 *  9.5.x — Solar Altitude
 *
 *  sin(alt) = sin φ sin δ + cos φ cos δ cos H
 * ----------------------------------------------------- */
export function solarAltitude(
  latitude: number,
  declination: number,
  hourAngleDeg: number
): number {
  const latRad = toRad(latitude);
  const decRad = toRad(declination);
  const haRad = toRad(hourAngleDeg);

  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);

  return toDeg(Math.asin(sinAlt));
}

/* -------------------------------------------------------
 *  9.5.x — Solar Azimuth
 *
 *  cos(A) = (sin δ − sin φ sin alt) / (cos φ cos alt)
 *
 *  If H > 0 → A = 360° − A
 * ----------------------------------------------------- */
export function solarAzimuth(
  latitude: number,
  declination: number,
  altitudeDeg: number,
  hourAngleDeg: number
): number {
  const latRad = toRad(latitude);
  const decRad = toRad(declination);
  const altRad = toRad(altitudeDeg);

  const numerator =
    Math.sin(decRad) - Math.sin(latRad) * Math.sin(altRad);

  const denominator =
    Math.cos(latRad) * Math.cos(altRad);

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

/* -------------------------------------------------------
 *  High-level wrapper: getSolarPosition(date, lat, lon)
 *
 *  Steps:
 *    1. Compute declination δ
 *    2. Compute EoT
 *    3. Compute UTᵘ
 *    4. Compute hour angle H
 *    5. Compute altitude
 *    6. Compute azimuth
 * ----------------------------------------------------- */
export function getSolarPosition(
  date: Date,
  lat: number,
  lon: number
): { altitude: number; azimuth: number } {
  const declination = getSolarDeclination(date);
  const eot = getEquationOfTime(date);

  const utUmi = utUmiFromDate(date);
  const hourAngleDeg = getHourAngle(utUmi, lon, eot);

  const altitude = solarAltitude(lat, declination, hourAngleDeg);
  const azimuth = solarAzimuth(lat, declination, altitude, hourAngleDeg);

  return { altitude, azimuth };
}
