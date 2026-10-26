import {
  trueSolarTimeMinutes,
  hourAngleFromTrueSolarTime,
  getHourAngle,
  sunriseSunsetHourAngle
} from "./hourAngle";

import { getEquationOfTime } from "./equationOfTime";
import { getSolarDeclination } from "./declination";

describe("Hour angle calculations", () => {

  // -----------------------------------------------------
  // Reference fixtures
  // -----------------------------------------------------
  const equinox2020Noon = new Date(Date.UTC(2020, 2, 20, 12, 0, 0)); // Mar 20 2020
  const eotEquinox = getEquationOfTime(equinox2020Noon); // ~ -7.44 min
  const decEquinox = getSolarDeclination(equinox2020Noon); // ~ 0°

  // -----------------------------------------------------
  // trueSolarTimeMinutes
  // -----------------------------------------------------
  describe("trueSolarTimeMinutes", () => {
    test("computes correct TST for simple Umi-time umi", () => {
      // Umi-time umi = 180ᵘ → 12:00 UT → TST = 720 min + EoT + 4*lon
      const tst = trueSolarTimeMinutes(180, 0, 0);
      expect(tst).toBeCloseTo(720);
    });

    test("includes equation of time", () => {
      const tst = trueSolarTimeMinutes(180, eotEquinox, 0);
      expect(tst).toBeCloseTo(720 + eotEquinox);
    });

    test("includes longitude correction", () => {
      const tst = trueSolarTimeMinutes(180, 0, -30); // 30° W
      expect(tst).toBeCloseTo(720 - 120); // 4 min per degree
    });

    test("TST changes smoothly with Umi-time", () => {
      const t1 = trueSolarTimeMinutes(100, 0, 0);
      const t2 = trueSolarTimeMinutes(101, 0, 0);
      expect(t2 - t1).toBeCloseTo(4); // 4 minutes per degree
    });
  });

  // -----------------------------------------------------
  // hourAngleFromTrueSolarTime
  // -----------------------------------------------------
  describe("hourAngleFromTrueSolarTime", () => {
    test("hour angle is 0° at solar noon (TST = 720 min)", () => {
      expect(hourAngleFromTrueSolarTime(720)).toBeCloseTo(0);
    });

    test("hour angle is -15° one hour before noon", () => {
      expect(hourAngleFromTrueSolarTime(660)).toBeCloseTo(-15);
    });

    test("hour angle is +15° one hour after noon", () => {
      expect(hourAngleFromTrueSolarTime(780)).toBeCloseTo(15);
    });

    test("hour angle changes smoothly with TST", () => {
      const h1 = hourAngleFromTrueSolarTime(700);
      const h2 = hourAngleFromTrueSolarTime(701);
      expect(h2 - h1).toBeCloseTo(0.25); // 15° per hour → 0.25° per minute
    });
  });

  // -----------------------------------------------------
  // getHourAngle
  // -----------------------------------------------------
  describe("getHourAngle", () => {
    test("hour angle is near 0° at equinox noon, lon=0", () => {
      const utDeg = 180 - eotEquinox / 4;
      const H = getHourAngle(utDeg, 0, eotEquinox);
      expect(H).toBeCloseTo(0, 2);
    });

    test("hour angle is symmetric around solar noon", () => {
      const utNoon = 180 - eotEquinox / 4;
      const utMorning = utNoon - 15;
      const utEvening = utNoon + 15;

      const Hm = getHourAngle(utMorning, 0, eotEquinox);
      const He = getHourAngle(utEvening, 0, eotEquinox);

      expect(He).toBeCloseTo(-Hm, 1);
    });

    test("longitude shifts solar noon", () => {
      const ut = (12 * 3600) / 240; // 180ᵘ
      const H = getHourAngle(ut, -30, 0); // 30° W
      expect(H).toBeCloseTo(-30);
    });
  });

  // -----------------------------------------------------
  // sunriseSunsetHourAngle
  // -----------------------------------------------------
  describe("sunriseSunsetHourAngle", () => {
    test("H0 includes refraction at the equator", () => {
      const H0 = sunriseSunsetHourAngle(0, decEquinox);
      expect(H0).toBeCloseTo(90.833, 3);
    });

    test("H0 increases at higher latitudes near the equinox with refraction", () => {
      const H0eq = sunriseSunsetHourAngle(0, decEquinox);
      const H0mid = sunriseSunsetHourAngle(45, decEquinox);
      expect(H0mid).toBeGreaterThan(H0eq);
    });

    test("H0 clamps correctly near polar circle", () => {
      const H0 = sunriseSunsetHourAngle(89, decEquinox);
      expect(H0).toBeGreaterThan(0);
      expect(H0).toBeLessThan(180);
    });

    test("H0 changes smoothly with declination", () => {
      const H1 = sunriseSunsetHourAngle(0, -1);
      const H2 = sunriseSunsetHourAngle(0, 1);
      expect(Math.abs(H2 - H1)).toBeLessThan(5);
    });
  });
});
