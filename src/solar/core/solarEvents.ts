/**
 * Solar event calculations (solar noon, midnight, sunrise, sunset, daylight length, and twilight boundaries) per Umi‑Time Spec §9.6.
 *
 * @module
 */

import { toRad, toDeg } from "../utils/solarMath";
import { getSolarDeclination } from "./declination";
import { getEquationOfTime } from "./equationOfTime";
import { sunriseSunsetHourAngle } from "./hourAngle";

/**
 * Converts a universal Umi‑Time value (`UTᵘ`) into elapsed UTC seconds (`1ᵘ = 240s`).
 *
 * @param umi - Universal Umi‑Time value in umi `[0, 360)`.
 * @returns Elapsed seconds since `00:00:00 UTC`.
 */
export function UTToSeconds(umi: number): number {
  return umi * 240; // 360ᵘ = 86400s → 1ᵘ = 240s
}

/**
 * Converts a universal Umi‑Time value (`UTᵘ`) on the UTC calendar date of `date` into a `Date` object.
 *
 * @param date - Reference UTC `Date` providing the target year, month, and day.
 * @param umi - Universal Umi‑Time value in umi `[0, 360)`.
 * @returns `Date` representing that instant in UTC.
 */
export function UTToDate(date: Date, umi: number): Date {
  const preciseSeconds = UTToSeconds(umi);
  const seconds = Math.floor(preciseSeconds);
  const milliseconds = Math.round((preciseSeconds - seconds) * 1000);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      seconds,
      milliseconds,
    ),
  );
}

/**
 * Computes physical solar noon in universal Umi‑Time (`UTᵘ`) for a given date and longitude.
 *
 * Formula: `UT_noon = (180ᵘ − λ − EoT / 4) mod 360ᵘ`
 *
 * @param date - Reference UTC `Date`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Physical solar noon in `UTᵘ` `[0, 360)`.
 */
export function getSolarNoonUT(date: Date, lon: number): number {
  const eot = getEquationOfTime(date); // minutes
  let utDeg = (180 - lon - eot / 4) % 360;
  if (utDeg < 0) utDeg += 360;
  return utDeg;
}

/**
 * Computes physical solar noon as a UTC `Date` for a given date and longitude.
 *
 * @param date - Reference UTC `Date`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns `Date` of physical solar noon.
 */
export function getSolarNoon(date: Date, lon: number): Date {
  return UTToDate(date, getSolarNoonUT(date, lon));
}

/**
 * Computes physical solar midnight in universal Umi‑Time (`UTᵘ`) for a given date and longitude.
 *
 * Formula: `UT_mid = (−λ − EoT / 4) mod 360ᵘ`
 *
 * @param date - Reference UTC `Date`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Physical solar midnight in `UTᵘ` `[0, 360)`.
 */
export function getSolarMidnightUT(date: Date, lon: number): number {
  const eot = getEquationOfTime(date); // minutes
  let utDeg = (-lon - eot / 4) % 360;
  if (utDeg < 0) utDeg += 360;
  return utDeg;
}

/**
 * Computes physical solar midnight as a UTC `Date` for a given date and longitude.
 *
 * @param date - Reference UTC `Date`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns `Date` of physical solar midnight.
 */
export function getSolarMidnight(date: Date, lon: number): Date {
  return UTToDate(date, getSolarMidnightUT(date, lon));
}

/**
 * Computes the sunrise/sunset hour angle (`H₀`) in degrees for a given date and latitude.
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @returns Sunrise/sunset hour angle in degrees.
 */
export function getSunriseSunsetHourAngle(date: Date, lat: number): number {
  const dec = getSolarDeclination(date);
  return sunriseSunsetHourAngle(lat, dec);
}

/**
 * Computes sunrise in universal Umi‑Time (`UTᵘ`) for a given date, latitude, and longitude.
 *
 * Formula: `UT_sunrise = (UT_noon − H₀) mod 360ᵘ`
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Sunrise time in `UTᵘ` `[0, 360)`.
 */
export function getSunriseUT(date: Date, lat: number, lon: number): number {
  const H0 = getSunriseSunsetHourAngle(date, lat);
  const UT_noon = getSolarNoonUT(date, lon);

  let ut = (UT_noon - H0) % 360;
  if (ut < 0) ut += 360;

  return ut;
}

/**
 * Computes sunrise as a UTC `Date` for a given date, latitude, and longitude.
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns `Date` of sunrise.
 */
export function getSunrise(date: Date, lat: number, lon: number): Date {
  return UTToDate(date, getSunriseUT(date, lat, lon));
}

/**
 * Computes sunset in universal Umi‑Time (`UTᵘ`) for a given date, latitude, and longitude.
 *
 * Formula: `UT_sunset = (UT_noon + H₀) mod 360ᵘ`
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Sunset time in `UTᵘ` `[0, 360)`.
 */
export function getSunsetUT(date: Date, lat: number, lon: number): number {
  const H0 = getSunriseSunsetHourAngle(date, lat);
  const UT_noon = getSolarNoonUT(date, lon);

  let ut = (UT_noon + H0) % 360;
  if (ut < 0) ut += 360;

  return ut;
}

/**
 * Computes sunset as a UTC `Date` for a given date, latitude, and longitude.
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns `Date` of sunset.
 */
export function getSunset(date: Date, lat: number, lon: number): Date {
  return UTToDate(date, getSunsetUT(date, lat, lon));
}

/**
 * Computes the duration of daylight in universal Umi‑Time (`UTᵘ`) for a given date and location.
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Daylight duration in `UTᵘ` `[0, 360)`.
 */
export function getDaylightLengthUT(
  date: Date,
  lat: number,
  lon: number,
): number {
  const sunrise = getSunriseUT(date, lat, lon);
  const sunset = getSunsetUT(date, lat, lon);

  let daylight = sunset - sunrise;
  if (daylight < 0) daylight += 360;

  return daylight;
}

/**
 * Computes the duration of daylight in SI seconds for a given date and location.
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Daylight duration in seconds.
 */
export function getDaylightLengthSeconds(
  date: Date,
  lat: number,
  lon: number,
): number {
  return UTToSeconds(getDaylightLengthUT(date, lat, lon));
}

/**
 * Computes the hour angle `H(h)` in degrees when the Sun reaches altitude threshold `h`.
 *
 * Formula: `H(h) = arccos((sin h − sin φ sin δ) / (cos φ cos δ))`
 *
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param dec - Solar declination (δ) in degrees.
 * @param h - Target solar altitude threshold in degrees (e.g., `-6°` civil, `-12°` nautical, `-18°` astronomical).
 * @returns Hour angle in degrees.
 */
export function twilightHourAngle(lat: number, dec: number, h: number): number {
  const latRad = toRad(lat);
  const decRad = toRad(dec);
  const hRad = toRad(h);

  const numerator = Math.sin(hRad) - Math.sin(latRad) * Math.sin(decRad);

  const denominator = Math.cos(latRad) * Math.cos(decRad);

  const value = numerator / denominator;

  return toDeg(Math.acos(value));
}

/**
 * Computes morning and evening twilight boundary timestamps (`astronomical`, `nautical`, `civil`, `blueHour`, and `goldenHour`).
 *
 * @param date - Reference UTC `Date`.
 * @param lat - Observer latitude in degrees `[-90, 90]`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @returns Object containing `morning` and `evening` maps of twilight boundary `Date` objects.
 */
export function getTwilight(
  date: Date,
  lat: number,
  lon: number,
): {
  morning: Record<string, Date | null>;
  evening: Record<string, Date | null>;
} {
  const dec = getSolarDeclination(date);
  const UT_noon = getSolarNoonUT(date, lon);

  const thresholds = {
    astronomical: -18,
    nautical: -12,
    civil: -6,
    blueHour: -4,
    goldenHour: 6,
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
