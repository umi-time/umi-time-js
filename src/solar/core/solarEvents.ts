// solarEvents.ts — Umi‑Time spec sections 9.6.x implemented formula-by-formula

import { toRad, toDeg } from "../utils/solarMath";
import { getSolarDeclination } from "./declination";
import { getEquationOfTime } from "./equationOfTime";
import { sunriseSunsetHourAngle } from "./hourAngle";

/* -------------------------------------------------------
 *  UTᵘ ↔ seconds ↔ Date conversion helpers
 * ----------------------------------------------------- */

export function UTToSeconds(umi: number): number {
  return umi * 240; // 360ᵘ = 86400s → 1ᵘ = 240s
}

export function UTToDate(date: Date, umi: number): Date {
  const preciseSeconds = UTToSeconds(umi);
  const seconds = Math.floor(preciseSeconds);
  const milliseconds = Math.round((preciseSeconds - seconds) * 1000);
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, seconds, milliseconds
  ));
}

/* -------------------------------------------------------
 *  Solar Noon (UTᵘ)
 *  UT_noon = (180ᵘ − λ − EoT/4) mod 360ᵘ
 * ----------------------------------------------------- */

export function getSolarNoonUT(date: Date, lon: number): number {
  const eot = getEquationOfTime(date); // minutes
  let utDeg = (180 - lon - eot / 4) % 360;
  if (utDeg < 0) utDeg += 360;
  return utDeg;
}

export function getSolarNoon(date: Date, lon: number): Date {
  return UTToDate(date, getSolarNoonUT(date, lon));
}

/* -------------------------------------------------------
 *  Solar Midnight (UTᵘ)
 *  UT_mid = (−λ − EoT/4) mod 360ᵘ
 * ----------------------------------------------------- */

export function getSolarMidnightUT(date: Date, lon: number): number {
  const eot = getEquationOfTime(date); // minutes
  let utDeg = (-lon - eot / 4) % 360;
  if (utDeg < 0) utDeg += 360;
  return utDeg;
}

export function getSolarMidnight(date: Date, lon: number): Date {
  return UTToDate(date, getSolarMidnightUT(date, lon));
}

/* -------------------------------------------------------
 *  Sunrise / Sunset Hour Angle (H0)
 *  H0 = arccos((sin(h0) − sin φ sin δ) / (cos φ cos δ))
 * ----------------------------------------------------- */

export function getSunriseSunsetHourAngle(date: Date, lat: number): number {
  const dec = getSolarDeclination(date);
  return sunriseSunsetHourAngle(lat, dec);
}

/* -------------------------------------------------------
 *  Sunrise UTᵘ
 *  UT_sunrise = (UT_noon − H0) mod 360ᵘ
 * ----------------------------------------------------- */

export function getSunriseUT(date: Date, lat: number, lon: number): number {
  const H0 = getSunriseSunsetHourAngle(date, lat);
  const UT_noon = getSolarNoonUT(date, lon);

  let ut = (UT_noon - H0) % 360;
  if (ut < 0) ut += 360;

  return ut;
}

export function getSunrise(date: Date, lat: number, lon: number): Date {
  return UTToDate(date, getSunriseUT(date, lat, lon));
}

/* -------------------------------------------------------
 *  Sunset UTᵘ
 *  UT_sunset = (UT_noon + H0) mod 360ᵘ
 * ----------------------------------------------------- */

export function getSunsetUT(date: Date, lat: number, lon: number): number {
  const H0 = getSunriseSunsetHourAngle(date, lat);
  const UT_noon = getSolarNoonUT(date, lon);

  let ut = (UT_noon + H0) % 360;
  if (ut < 0) ut += 360;

  return ut;
}

export function getSunset(date: Date, lat: number, lon: number): Date {
  return UTToDate(date, getSunsetUT(date, lat, lon));
}

/* -------------------------------------------------------
 *  Daylight Length
 *  Daylight = UT_sunset − UT_sunrise  (mod 360ᵘ)
 *  or equivalently Daylight = 2H0
 * ----------------------------------------------------- */

export function getDaylightLengthUT(date: Date, lat: number, lon: number): number {
  const sunrise = getSunriseUT(date, lat, lon);
  const sunset = getSunsetUT(date, lat, lon);

  let daylight = sunset - sunrise;
  if (daylight < 0) daylight += 360;

  return daylight;
}

export function getDaylightLengthSeconds(date: Date, lat: number, lon: number): number {
  return UTToSeconds(getDaylightLengthUT(date, lat, lon));
}

/* -------------------------------------------------------
 *  Twilight Boundaries (AM/PM)
 *
 *  H(h) = arccos((sin h − sin φ sin δ) / (cos φ cos δ))
 *
 *  Morning: UT = UT_noon − H(h)
 *  Evening: UT = UT_noon + H(h)
 *
 *  h thresholds:
 *    Astronomical: −18°
 *    Nautical:     −12°
 *    Civil:         −6°
 *    Blue Hour:     −4° (approx)
 *    Golden Hour:    6° (approx)
 * ----------------------------------------------------- */

export function twilightHourAngle(
  lat: number,
  dec: number,
  h: number
): number {
  const latRad = toRad(lat);
  const decRad = toRad(dec);
  const hRad = toRad(h);

  const numerator =
    Math.sin(hRad) -
    Math.sin(latRad) * Math.sin(decRad);

  const denominator =
    Math.cos(latRad) * Math.cos(decRad);

  const value = numerator / denominator;

  return toDeg(Math.acos(value));
}

export function getTwilight(date: Date, lat: number, lon: number) {
  const dec = getSolarDeclination(date);
  const UT_noon = getSolarNoonUT(date, lon);

  const thresholds = {
    astronomical: -18,
    nautical: -12,
    civil: -6,
    blueHour: -4,
    goldenHour: 6
  };

  const morning: Record<string, Date | null> = {};
  const evening: Record<string, Date | null> = {};

  for (const [key, h] of Object.entries(thresholds)) {
    const Hh = twilightHourAngle(lat, dec, h);

    let utMorning = (UT_noon - Hh) % 360;
    if (utMorning < 0) utMorning += 360;

    let utEvening = (UT_noon + Hh) % 360;
    if (utEvening < 0) utEvening += 360;

    morning[key] = UTToDate(date, utMorning);
    evening[key] = UTToDate(date, utEvening);
  }

  return { morning, evening };
}
