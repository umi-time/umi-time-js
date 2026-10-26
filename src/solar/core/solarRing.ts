// solarRing.ts — Umi‑Time spec ring-angle mapping

import { normalizeDegrees } from "../utils/solarMath";
import { getSolarMidnightUT } from "./solarEvents";

/* -------------------------------------------------------
 *  Normalize angle to [0, 360)
 * ----------------------------------------------------- */
export function normalizeAngle(deg: number): number {
  return normalizeDegrees(deg);
}

/* -------------------------------------------------------
 *  9.6.x — Solar Ring Angle Mapping
 *
 *  angle = (Umi-Time umi_event − Umi-Time umi_midnight) mod 360ᵘ
 *
 *  This maps any solar event to its position on the
 *  Umi‑Time ring, where solar midnight = 0ᵘ.
 * ----------------------------------------------------- */
export function mapEventToRingAngle(
  eventUT: number,
  midnightUT: number
): number {
  return normalizeAngle(eventUT - midnightUT);
}

/* -------------------------------------------------------
 *  Convenience wrapper:
 *  mapEventToRingAngleForDate(date, lon, eventUT)
 *
 *  Computes solar midnight UTᵘ automatically.
 * ----------------------------------------------------- */
export function mapEventToRingAngleForDate(
  date: Date,
  lon: number,
  eventUT: number
): number {
  const midnightUT = getSolarMidnightUT(date, lon);
  return mapEventToRingAngle(eventUT, midnightUT);
}

/* -------------------------------------------------------
 *  Convenience: map multiple events at once
 * ----------------------------------------------------- */
export function mapEventsToRingAngles(
  date: Date,
  lon: number,
  events: Record<string, number>
): Record<string, number> {
  const midnightUT = getSolarMidnightUT(date, lon);
  const result: Record<string, number> = {};

  for (const [key, ut] of Object.entries(events)) {
    result[key] = mapEventToRingAngle(ut, midnightUT);
  }

  return result;
}
