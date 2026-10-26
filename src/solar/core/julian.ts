// Julian Date and Julian Century

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

export function getJulianCentury(date: Date): number {
  const JD = getJulianDate(date);
  return (JD - 2451545.0) / 36525;
}
