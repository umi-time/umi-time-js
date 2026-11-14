/**
 * Per-spec equation of time formulas (Umi‑Time Spec §9.5).
 *
 * @module
 */

import { toRad, toDeg } from "../utils/solarMath";
import { getJulianCentury } from "./julian";
import {
  solarMeanLongitude,
  solarMeanAnomaly,
  earthOrbitEccentricity,
  meanObliquity,
  obliquityCorrection,
} from "./declination";

/**
 * Computes the obliquity coefficient (Y) from corrected ecliptic obliquity (Spec §9.5.15).
 *
 * @param eps - Corrected obliquity of the ecliptic in degrees.
 * @returns Dimensionless obliquity coefficient `tan²(ε / 2)`.
 */
export function obliquityCoefficient(eps: number): number {
  return Math.tan(toRad(eps) / 2) ** 2;
}

/**
 * Computes the Equation of Time (EoT) in minutes from orbital parameters (Spec §9.5.16).
 *
 * @param Y - Obliquity coefficient `tan²(ε / 2)`.
 * @param e - Eccentricity of Earth's orbit.
 * @param M - Solar mean anomaly in degrees.
 * @param L0 - Solar mean longitude in degrees.
 * @returns Equation of Time in minutes (typically within ±16.5 minutes).
 */
export function equationOfTimeRaw(
  Y: number,
  e: number,
  M: number,
  L0: number,
): number {
  const Mr = toRad(M);
  const L0r = toRad(L0);

  return (
    4 *
    toDeg(
      Y * Math.sin(2 * L0r) -
        2 * e * Math.sin(Mr) +
        4 * e * Y * Math.sin(Mr) * Math.cos(2 * L0r) -
        0.5 * Y * Y * Math.sin(4 * L0r) -
        1.25 * e * e * Math.sin(2 * Mr),
    )
  );
}

/**
 * High-level helper that computes the Equation of Time (EoT) in minutes for a given UTC `Date`.
 *
 * @param date - UTC `Date` instant.
 * @returns Equation of Time in minutes.
 */
export function getEquationOfTime(date: Date): number {
  const T = getJulianCentury(date);

  const L0 = solarMeanLongitude(T);
  const M = solarMeanAnomaly(T);
  const e = earthOrbitEccentricity(T);

  const eps0 = meanObliquity(T);
  const eps = obliquityCorrection(eps0, T);

  const Y = obliquityCoefficient(eps);

  return equationOfTimeRaw(Y, e, M, L0);
}
