/**
 * Per-spec solar hour angle and true solar time formulas (Umi‑Time Spec §9.6).
 *
 * @module
 */

import { toRad, toDeg } from "../utils/solarMath";

/**
 * Computes True Solar Time (TST) in minutes from Umi‑Time, Equation of Time, and longitude (Spec §9.6).
 *
 * Formula: `TST_minutes = utUmi * 4 + EoT + 4 * longitude`
 *
 * @param utUmi - Universal Umi‑Time value in umi `[0, 360)`.
 * @param eotMinutes - Equation of Time in minutes.
 * @param longitude - Observer longitude in degrees (east positive, west negative).
 * @returns True Solar Time in minutes.
 */
export function trueSolarTimeMinutes(
  utUmi: number,
  eotMinutes: number,
  longitude: number,
): number {
  return utUmi * 4 + eotMinutes + 4 * longitude;
}

/**
 * Computes the solar hour angle (H) in degrees from True Solar Time (Spec §9.6).
 *
 * Formula: `H = 15° * (TST_hours − 12)`
 *
 * @param tstMinutes - True Solar Time in minutes.
 * @returns Solar hour angle in degrees (negative before solar noon, positive after).
 */
export function hourAngleFromTrueSolarTime(tstMinutes: number): number {
  const tstHours = tstMinutes / 60;
  return 15 * (tstHours - 12);
}

/**
 * Computes the solar hour angle (H) in degrees directly from Umi‑Time, longitude, and Equation of Time (Spec §9.6).
 *
 * @param utUmi - Universal Umi‑Time value in umi `[0, 360)`.
 * @param longitude - Observer longitude in degrees (east positive, west negative).
 * @param eotMinutes - Equation of Time in minutes.
 * @returns Solar hour angle in degrees.
 */
export function getHourAngle(
  utUmi: number,
  longitude: number,
  eotMinutes: number,
): number {
  const tst = trueSolarTimeMinutes(utUmi, eotMinutes, longitude);
  return hourAngleFromTrueSolarTime(tst);
}

/**
 * Computes the sunrise/sunset hour angle (H₀) in degrees for a given latitude and solar declination (Spec §9.6.1).
 *
 * Formula: `H₀ = arccos((sin(h₀) − sin φ sin δ) / (cos φ cos δ))`
 *
 * @param latitude - Observer latitude in degrees `[-90, 90]`.
 * @param declination - Solar declination (δ) in degrees.
 * @param h0 - Solar altitude threshold in degrees (defaults to `-0.833°` for standard refraction and solar radius).
 * @returns Sunrise/sunset hour angle in degrees `[0, 180]`.
 */
export function sunriseSunsetHourAngle(
  latitude: number,
  declination: number,
  h0: number = -0.833,
): number {
  const latRad = toRad(latitude);
  const decRad = toRad(declination);
  const h0Rad = toRad(h0);

  const numerator = Math.sin(h0Rad) - Math.sin(latRad) * Math.sin(decRad);

  const denominator = Math.cos(latRad) * Math.cos(decRad);

  const value = numerator / denominator;

  return toDeg(Math.acos(value));
}
