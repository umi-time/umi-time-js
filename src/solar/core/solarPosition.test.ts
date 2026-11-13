import { describe, expect, test, it } from "vitest";
import {
  utUmiFromDate,
  solarAltitude,
  solarAzimuth,
  getSolarPosition
} from "./solarPosition";

import { getSolarDeclination } from "./declination";
import { getEquationOfTime } from "./equationOfTime";
import { getHourAngle } from "./hourAngle";

describe("Solar position calculations", () => {

  // -----------------------------------------------------
  // Reference fixtures
  // -----------------------------------------------------
  const equinox2020Noon = new Date(Date.UTC(2020, 2, 20, 12, 0, 0)); // Mar 20 2020
  const equinoxDeclination = getSolarDeclination(equinox2020Noon); // ≈ 0°
  const equinoxEOT = getEquationOfTime(equinox2020Noon);           // ≈ -7.44 min

  // -----------------------------------------------------
  // utUmiFromDate
  // -----------------------------------------------------
  describe("utUmiFromDate", () => {
    test("converts UTC time to UTᵘ correctly", () => {
      // 12:00 UTC → 12*3600 = 43200 seconds → 43200/240 = 180ᵘ
      expect(utUmiFromDate(equinox2020Noon)).toBeCloseTo(180);
    });

    test("UTᵘ wraps correctly at midnight", () => {
      const midnight = new Date(Date.UTC(2020, 2, 20, 0, 0, 0));
      expect(utUmiFromDate(midnight)).toBeCloseTo(0);
    });

    test("UTᵘ increases smoothly minute-to-minute", () => {
      const t1 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0));
      const t2 = new Date(Date.UTC(2020, 2, 20, 12, 1, 0));

      const ut1 = utUmiFromDate(t1);
      const ut2 = utUmiFromDate(t2);

      expect(ut2 - ut1).toBeCloseTo(0.25); // 360ᵘ / 1440 min
    });
  });

  // -----------------------------------------------------
  // solarAltitude
  // -----------------------------------------------------
  describe("solarAltitude", () => {
    test("altitude reflects the fixture declination at solar noon on the equator", () => {
      const H = 0; // solar noon
      const alt = solarAltitude(0, equinoxDeclination, H);
      expect(alt).toBeCloseTo(90 - Math.abs(equinoxDeclination), 6);
    });

    test("altitude decreases at higher latitudes", () => {
      const H = 0;
      const altEq = solarAltitude(0, equinoxDeclination, H);
      const alt45 = solarAltitude(45, equinoxDeclination, H);

      expect(alt45).toBeLessThan(altEq);
    });

    test("altitude is symmetric around solar noon", () => {
      const Hm = -15; // 1 hour before noon
      const He = 15;  // 1 hour after noon

      const altM = solarAltitude(0, equinoxDeclination, Hm);
      const altE = solarAltitude(0, equinoxDeclination, He);

      expect(altM).toBeCloseTo(altE, 2);
    });
  });

  // -----------------------------------------------------
  // solarAzimuth
  // -----------------------------------------------------
  describe("solarAzimuth", () => {
    test("azimuth points north when declination is positive at equatorial solar noon", () => {
      const H = 0;
      const alt = solarAltitude(0, equinoxDeclination, H);
      const az = solarAzimuth(0, equinoxDeclination, alt, H);

      expect(az).toBeCloseTo(0, 3);
    });

    test("azimuth flips east/west depending on hour angle sign", () => {
      const alt = solarAltitude(0, equinoxDeclination, 15);

      const azMorning = solarAzimuth(0, equinoxDeclination, alt, -15);
      const azEvening = solarAzimuth(0, equinoxDeclination, alt, 15);

      expect(azMorning).not.toBeCloseTo(azEvening);
    });

    test("azimuth stays within [0, 360)", () => {
      const alt = solarAltitude(40, equinoxDeclination, 30);
      const az = solarAzimuth(40, equinoxDeclination, alt, 30);

      expect(az).toBeGreaterThanOrEqual(0);
      expect(az).toBeLessThanOrEqual(360);
    });
  });

  // -----------------------------------------------------
  // getSolarPosition (full pipeline)
  // -----------------------------------------------------
  describe("getSolarPosition", () => {
    test("solar position at 12:00 UTC on the equator is near overhead", () => {
      const pos = getSolarPosition(equinox2020Noon, 0, 0);

      expect(pos.altitude).toBeGreaterThan(88);
      expect(pos.altitude).toBeLessThan(90);
      expect(pos.azimuth).toBeGreaterThanOrEqual(0);
      expect(pos.azimuth).toBeLessThanOrEqual(360);
    });

    test("solar position changes smoothly minute-to-minute", () => {
      const t1 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0));
      const t2 = new Date(Date.UTC(2020, 2, 20, 12, 1, 0));

      const p1 = getSolarPosition(t1, 40, -105);
      const p2 = getSolarPosition(t2, 40, -105);

      expect(Math.abs(p2.altitude - p1.altitude)).toBeLessThan(1);
      expect(Math.abs(p2.azimuth - p1.azimuth)).toBeLessThan(5);
    });

    test("solar position behaves correctly at mid-latitudes", () => {
      const localNoon = new Date(Date.UTC(2020, 2, 20, 19, 0, 0));
      const pos = getSolarPosition(localNoon, 40, -105);

      expect(pos.altitude).toBeGreaterThan(40);
      expect(pos.altitude).toBeLessThan(90);
    });

    it("reflects the equation of time offset at clock noon on the prime meridian", () => {
      const pos = getSolarPosition(equinox2020Noon, 0, 0);
      const umi = utUmiFromDate(equinox2020Noon);
      const expectedHA = getHourAngle(umi, 0, equinoxEOT);
      const solarAlt = solarAltitude(0, equinoxDeclination, expectedHA);
      const solarAz = solarAzimuth(0, equinoxDeclination, solarAlt, expectedHA);

      // At 12:00 UTC on 0° longitude, EOT (≈ -7.3 min) means solar noon hasn't occurred yet
      expect(expectedHA).toBeCloseTo(equinoxEOT / 4, 1);
      expect(pos.altitude).toBeCloseTo(solarAlt, 5);
      expect(pos.azimuth).toBeCloseTo(solarAz, 5);
    });

    it("matches getHourAngle at non-zero longitudes", () => {
      const lon = -120.64;
      const lat = 35.14;
      const pos = getSolarPosition(equinox2020Noon, lat, lon);
      const umi = utUmiFromDate(equinox2020Noon);
      const expectedHA = getHourAngle(umi, lon, equinoxEOT);
      const decl = getSolarDeclination(equinox2020Noon);
      const solarAlt = solarAltitude(lat, decl, expectedHA);
      const solarAz = solarAzimuth(lat, decl, solarAlt, expectedHA);

      expect(pos.altitude).toBeCloseTo(solarAlt, 5);
      expect(pos.azimuth).toBeCloseTo(solarAz, 5);
    });
  });
});
