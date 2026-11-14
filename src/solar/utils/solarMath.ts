/**
 * Shared math utilities for umi-solar-js.
 *
 */

/**
 * Converts an angle from degrees to radians.
 *
 * @param deg - The angle in degrees.
 * @returns The angle in radians.
 */
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Converts an angle from radians to degrees.
 *
 * @param rad - The angle in radians.
 * @returns The angle in degrees.
 */
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Normalizes an angle in degrees to the half-open interval `[0, 360)`.
 * Ensures positive zero (`0`) is returned instead of JavaScript's `-0`.
 *
 * @param deg - The angle in degrees to normalize.
 * @returns The normalized angle in the range `[0, 360)`.
 */
export function normalizeDegrees(deg: number): number {
  const normalized = ((deg % 360) + 360) % 360;
  return Object.is(normalized, -0) ? 0 : normalized;
}

/**
 * Calculates the 1-based ordinal day of the year in UTC for a given date.
 *
 * @param date - The `Date` object to evaluate.
 * @returns The UTC day of the year (`1` through `365`, or `366` in a leap year).
 */
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor((now - start) / 86400000) + 1;
}
