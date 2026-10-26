// hourAngle.ts — decomposed per Umi‑Time spec formulas

import { toRad, toDeg } from "../utils/solarMath";

/**
 * 9.6 — True Solar Time (TST)
 * TST_minutes = Umi-time umi * 4 + EoT + 4 * longitude
 *
 * Umi-time umi = Umi-Time seconds / 240
 */
export function trueSolarTimeMinutes(
  utUmi: number,
  eotMinutes: number,
  longitude: number
): number {
  return utUmi * 4 + eotMinutes + 4 * longitude;
}

/**
 * 9.6 — Hour Angle (H)
 * H = 15° * (TST_hours − 12)
 */
export function hourAngleFromTrueSolarTime(tstMinutes: number): number {
  const tstHours = tstMinutes / 60;
  return 15 * (tstHours - 12);
}

/**
 * 9.6 — Combined Hour Angle Function
 * Given Umi-Time, longitude, and EoT → hour angle (degrees)
 */
export function getHourAngle(
  utUmi: number,
  longitude: number,
  eotMinutes: number
): number {
  const tst = trueSolarTimeMinutes(utUmi, eotMinutes, longitude);
  return hourAngleFromTrueSolarTime(tst);
}

/**
 * 9.6.1 — Sunrise/Sunset Hour Angle (H0)
 *
 * H0 = arccos( (sin(h0) − sin φ sin δ) / (cos φ cos δ) )
 *
 * h0 = −0.833° (standard refraction + solar radius)
 */
export function sunriseSunsetHourAngle(
  latitude: number,
  declination: number,
  h0: number = -0.833
): number {
  const latRad = toRad(latitude);
  const decRad = toRad(declination);
  const h0Rad = toRad(h0);

  const numerator =
    Math.sin(h0Rad) -
    Math.sin(latRad) * Math.sin(decRad);

  const denominator =
    Math.cos(latRad) * Math.cos(decRad);

  const value = numerator / denominator;

  return toDeg(Math.acos(value));
}
