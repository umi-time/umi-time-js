/**
 * Julian Date and Julian Century helpers for astronomical calculations (Umi‑Time Spec §9.5).
 *
 * @module
 */

/**
 * Computes the Julian Date (JD) for a given UTC `Date` instant (Spec §9.5.1).
 *
 * @param date - UTC `Date` instant.
 * @returns Continuous count of days since the beginning of the Julian Period.
 */
export function getJulianDate(date: Date): number {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let Yp = Y;
  let Mp = M;

  if (M <= 2) {
    Yp = Y - 1;
    Mp = M + 12;
  }

  const A = Math.floor(Yp / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (Yp + 4716)) +
    Math.floor(30.6001 * (Mp + 1)) +
    D +
    B -
    1524.5
  );
}

/**
 * Computes Julian centuries (T) elapsed since the J2000.0 epoch (`JD 2451545.0`) (Spec §9.5.2).
 *
 * @param date - UTC `Date` instant.
 * @returns Julian centuries since J2000.0.
 */
export function getJulianCentury(date: Date): number {
  const JD = getJulianDate(date);
  return (JD - 2451545.0) / 36525;
}
