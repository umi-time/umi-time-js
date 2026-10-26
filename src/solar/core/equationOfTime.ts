// equationOfTime.ts — fully decomposed per-spec formulas

import { toRad, toDeg } from "../utils/solarMath";
import { getJulianCentury } from "./julian";
import {
  solarMeanLongitude,
  solarMeanAnomaly,
  earthOrbitEccentricity,
  meanObliquity,
  obliquityCorrection
} from "./declination";

// 9.5.15 — Obliquity Coefficient Y
export function obliquityCoefficient(eps: number): number {
  return Math.tan(toRad(eps) / 2) ** 2;
}

// 9.5.16 — Equation of Time (EoT)
export function equationOfTimeRaw(
  Y: number,
  e: number,
  M: number,
  L0: number
): number {
  const Mr = toRad(M);
  const L0r = toRad(L0);

  return 4 * toDeg(
    Y * Math.sin(2 * L0r) -
    2 * e * Math.sin(Mr) +
    4 * e * Y * Math.sin(Mr) * Math.cos(2 * L0r) -
    0.5 * Y * Y * Math.sin(4 * L0r) -
    1.25 * e * e * Math.sin(2 * Mr)
  );
}

// High-level wrapper
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
