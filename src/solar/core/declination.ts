/**
 * Per-spec solar declination and orbital geometry formulas (Umi‑Time Spec §9.5).
 *
 * @module
 */

import { toRad, toDeg, normalizeDegrees } from "../utils/solarMath";
import { getJulianCentury } from "./julian";

/**
 * Computes the geometric mean longitude of the Sun (L₀), in degrees (Spec §9.5.3).
 *
 * @param T - Julian centuries since J2000.0.
 * @returns Solar mean longitude in degrees `[0, 360)`.
 */
export function solarMeanLongitude(T: number): number {
  return normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
}

/**
 * Computes the geometric mean anomaly of the Sun (M), in degrees (Spec §9.5.4).
 *
 * @param T - Julian centuries since J2000.0.
 * @returns Solar mean anomaly in degrees `[0, 360)`.
 */
export function solarMeanAnomaly(T: number): number {
  return normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
}

/**
 * Computes the eccentricity of Earth's orbit (e) (Spec §9.5.5).
 *
 * @param T - Julian centuries since J2000.0.
 * @returns Dimensionless orbital eccentricity.
 */
export function earthOrbitEccentricity(T: number): number {
  return 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
}

/**
 * Computes the Sun's equation of center (C), in degrees (Spec §9.5.6).
 *
 * @param M - Solar mean anomaly in degrees.
 * @param T - Julian centuries since J2000.0.
 * @returns Equation of center in degrees.
 */
export function equationOfCenter(M: number, T: number): number {
  const Mr = toRad(M);
  return (
    Math.sin(Mr) * (1.914602 - 0.004817 * T - 0.000014 * T * T) +
    Math.sin(2 * Mr) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * Mr) * 0.000289
  );
}

/**
 * Computes the true ecliptic longitude of the Sun (λ⊙), in degrees (Spec §9.5.7).
 *
 * @param L0 - Solar mean longitude in degrees.
 * @param C - Sun's equation of center in degrees.
 * @returns Ecliptic longitude in degrees `[0, 360)`.
 */
export function eclipticLongitude(L0: number, C: number): number {
  return normalizeDegrees(L0 + C);
}

/**
 * Computes the true anomaly of the Sun (ν), in degrees (Spec §9.5.8).
 *
 * @param M - Solar mean anomaly in degrees.
 * @param C - Sun's equation of center in degrees.
 * @returns True anomaly in degrees.
 */
export function trueAnomaly(M: number, C: number): number {
  return M + C;
}

/**
 * Computes the apparent ecliptic longitude of the Sun (λ_sun) corrected for nutation and aberration, in degrees (Spec §9.5.10).
 *
 * @param lambda - True ecliptic longitude in degrees.
 * @param T - Julian centuries since J2000.0.
 * @returns Apparent solar longitude in degrees `[0, 360)`.
 */
export function apparentLongitude(lambda: number, T: number): number {
  return normalizeDegrees(
    lambda - 0.00569 - 0.00478 * Math.sin(toRad(125.04 - 1934.136 * T)),
  );
}

/**
 * Computes the mean obliquity of the ecliptic (ε₀), in degrees (Spec §9.5.11).
 *
 * @param T - Julian centuries since J2000.0.
 * @returns Mean obliquity in degrees.
 */
export function meanObliquity(T: number): number {
  return (
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600
  );
}

/**
 * Computes the corrected obliquity of the ecliptic (ε) accounting for nutation, in degrees (Spec §9.5.12).
 *
 * @param eps0 - Mean obliquity of the ecliptic in degrees.
 * @param T - Julian centuries since J2000.0.
 * @returns Corrected obliquity in degrees.
 */
export function obliquityCorrection(eps0: number, T: number): number {
  return eps0 + 0.00256 * Math.cos(toRad(125.04 - 1934.136 * T));
}

/**
 * Computes the solar declination (δ), in degrees (Spec §9.5.14).
 *
 * @param eps - Corrected obliquity of the ecliptic in degrees.
 * @param lambdaSun - Apparent solar longitude in degrees.
 * @returns Solar declination in degrees `[-23.44, +23.44]`.
 */
export function solarDeclination(eps: number, lambdaSun: number): number {
  return toDeg(Math.asin(Math.sin(toRad(eps)) * Math.sin(toRad(lambdaSun))));
}

/**
 * High-level helper that computes the solar declination (δ) in degrees for a given UTC `Date`.
 *
 * @param date - UTC `Date` instant.
 * @returns Solar declination in degrees.
 */
export function getSolarDeclination(date: Date): number {
  const T = getJulianCentury(date);

  const L0 = solarMeanLongitude(T);
  const M = solarMeanAnomaly(T);
  const C = equationOfCenter(M, T);
  const lambda = eclipticLongitude(L0, C);
  const lambdaSun = apparentLongitude(lambda, T);
  const eps0 = meanObliquity(T);
  const eps = obliquityCorrection(eps0, T);

  return solarDeclination(eps, lambdaSun);
}
