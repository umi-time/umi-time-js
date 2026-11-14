/**
 * Solar ring angle mapping helpers per Umi‑Time Spec §9.6.
 *
 * Maps universal Umi‑Time (`UTᵘ`) solar events onto a local 360° analog dial where solar midnight sits at `0°`.
 *
 * @module
 */

import { normalizeDegrees } from "../utils/solarMath";
import { getSolarMidnightUT } from "./solarEvents";

/**
 * Normalizes any angle in degrees into the canonical `[0, 360)` range.
 *
 * @param deg - Angle in degrees.
 * @returns Normalized angle in degrees `[0, 360)`.
 */
export function normalizeAngle(deg: number): number {
  return normalizeDegrees(deg);
}

/**
 * Maps a solar event's universal Umi‑Time (`UTᵘ`) onto the local solar ring relative to solar midnight (Spec §9.6).
 *
 * Formula: `angle = (UT_event − UT_midnight) mod 360ᵘ`
 *
 * @param eventUT - Solar event time in `UTᵘ` `[0, 360)`.
 * @param midnightUT - Local solar midnight in `UTᵘ` `[0, 360)`.
 * @returns Dial angle in degrees `[0, 360)` where `0°` is solar midnight and `180°` is solar noon.
 */
export function mapEventToRingAngle(
  eventUT: number,
  midnightUT: number,
): number {
  return normalizeAngle(eventUT - midnightUT);
}

/**
 * Computes solar midnight for the given date and longitude and maps a single `UTᵘ` event onto the solar ring.
 *
 * @param date - Reference UTC `Date`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @param eventUT - Solar event time in `UTᵘ` `[0, 360)`.
 * @returns Dial angle in degrees `[0, 360)`.
 */
export function mapEventToRingAngleForDate(
  date: Date,
  lon: number,
  eventUT: number,
): number {
  const midnightUT = getSolarMidnightUT(date, lon);
  return mapEventToRingAngle(eventUT, midnightUT);
}

/**
 * Maps a dictionary of named `UTᵘ` solar events onto local solar ring angles for a given date and longitude.
 *
 * @param date - Reference UTC `Date`.
 * @param lon - Observer longitude in degrees (east positive, west negative).
 * @param events - Record mapping event names (e.g., `"sunrise"`, `"sunset"`) to `UTᵘ` values `[0, 360)`.
 * @returns Record mapping each event name to its dial angle in degrees `[0, 360)`.
 */
export function mapEventsToRingAngles(
  date: Date,
  lon: number,
  events: Record<string, number>,
): Record<string, number> {
  const midnightUT = getSolarMidnightUT(date, lon);
  const result: Record<string, number> = {};

  for (const [key, ut] of Object.entries(events)) {
    result[key] = mapEventToRingAngle(ut, midnightUT);
  }

  return result;
}
