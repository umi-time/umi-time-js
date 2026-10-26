// Shared math utilities for umi-solar-js

// Degrees → radians
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Radians → degrees
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Normalize degrees to [0, 360) without returning JavaScript's -0.
export function normalizeDegrees(deg: number): number {
  const normalized = ((deg % 360) + 360) % 360;
  return Object.is(normalized, -0) ? 0 : normalized;
}

// Day of year (UTC)
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return Math.floor((now - start) / 86400000) + 1;
}
