// declination.ts — fully decomposed per-spec formulas

import { toRad, toDeg, normalizeDegrees } from "../utils/solarMath";
import { getJulianCentury } from "./julian";

// 9.5.3 — Solar Mean Longitude
export function solarMeanLongitude(T: number): number {
  return normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
}

// 9.5.4 — Solar Mean Anomaly
export function solarMeanAnomaly(T: number): number {
  return normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
}

// 9.5.5 — Earth Orbit Eccentricity
export function earthOrbitEccentricity(T: number): number {
  return (
    0.016708634 -
    0.000042037 * T -
    0.0000001267 * T * T
  );
}

// 9.5.6 — Sun’s Equation of Center
export function equationOfCenter(M: number, T: number): number {
  const Mr = toRad(M);
  return (
    Math.sin(Mr) * (1.914602 - 0.004817 * T - 0.000014 * T * T) +
    Math.sin(2 * Mr) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * Mr) * 0.000289
  );
}

// 9.5.7 — Ecliptic Longitude λ⊙
export function eclipticLongitude(L0: number, C: number): number {
  return normalizeDegrees(L0 + C);
}

// 9.5.8 — True Anomaly ν
export function trueAnomaly(M: number, C: number): number {
  return M + C;
}

// 9.5.10 — Apparent Longitude λ_sun
export function apparentLongitude(lambda: number, T: number): number {
  return normalizeDegrees(
    lambda -
    0.00569 -
    0.00478 * Math.sin(toRad(125.04 - 1934.136 * T))
  );
}

// 9.5.11 — Mean Obliquity ε₀
export function meanObliquity(T: number): number {
  return (
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 * T +
      0.00059 * T * T -
      0.001813 * T * T * T) /
      3600
  );
}

// 9.5.12 — Obliquity Correction ε
export function obliquityCorrection(eps0: number, T: number): number {
  return eps0 + 0.00256 * Math.cos(toRad(125.04 - 1934.136 * T));
}

// 9.5.14 — Solar Declination δ
export function solarDeclination(eps: number, lambdaSun: number): number {
  return toDeg(
    Math.asin(Math.sin(toRad(eps)) * Math.sin(toRad(lambdaSun)))
  );
}

// High-level wrapper
export function getSolarDeclination(date: Date): number {
  const T = getJulianCentury(date);

  const L0 = solarMeanLongitude(T);
  const M = solarMeanAnomaly(T);
  const e = earthOrbitEccentricity(T);
  const C = equationOfCenter(M, T);
  const lambda = eclipticLongitude(L0, C);
  const lambdaSun = apparentLongitude(lambda, T);
  const eps0 = meanObliquity(T);
  const eps = obliquityCorrection(eps0, T);

  return solarDeclination(eps, lambdaSun);
}
