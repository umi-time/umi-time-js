import { describe, expect, test } from "vitest";
import { getJulianDate, getJulianCentury } from "./julian";

describe("Julian date and century calculations", () => {

  // -----------------------------------------------------
  // Reference fixtures
  // -----------------------------------------------------
  const equinox2020 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0)); // Mar 20 2020 12:00 UTC
  const jdEquinox2020 = 2458929.0; // NOAA / USNO reference

  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0)); // J2000 epoch
  const jdJ2000 = 2451545.0;

  // -----------------------------------------------------
  // getJulianDate
  // -----------------------------------------------------
  describe("getJulianDate", () => {
    test("computes JD for J2000 epoch exactly", () => {
      expect(getJulianDate(j2000)).toBeCloseTo(jdJ2000, 6);
    });

    test("computes JD for 2020 equinox (NOAA reference)", () => {
      expect(getJulianDate(equinox2020)).toBeCloseTo(jdEquinox2020, 3);
    });

    test("JD increases by exactly 1 per UTC day", () => {
      const d1 = new Date(Date.UTC(2024, 5, 10, 0, 0, 0));
      const d2 = new Date(Date.UTC(2024, 5, 11, 0, 0, 0));

      const jd1 = getJulianDate(d1);
      const jd2 = getJulianDate(d2);

      expect(jd2 - jd1).toBeCloseTo(1, 6);
    });

    test("JD handles leap years correctly", () => {
      const feb28 = new Date(Date.UTC(2024, 1, 28, 12, 0, 0));
      const feb29 = new Date(Date.UTC(2024, 1, 29, 12, 0, 0));

      const jd1 = getJulianDate(feb28);
      const jd2 = getJulianDate(feb29);

      expect(jd2 - jd1).toBeCloseTo(1, 6);
    });

    test("JD is continuous across year boundaries", () => {
      const dec31 = new Date(Date.UTC(2023, 11, 31, 12, 0, 0));
      const jan1 = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));

      const jd1 = getJulianDate(dec31);
      const jd2 = getJulianDate(jan1);

      expect(jd2 - jd1).toBeCloseTo(1, 6);
    });

    test("JD uses the UTC instant regardless of Date construction", () => {
      const utc = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));
      const sameInstant = new Date("2024-06-15T12:00:00.000Z");

      expect(getJulianDate(utc)).toBeCloseTo(getJulianDate(sameInstant), 6);
    });
  });

  // -----------------------------------------------------
  // getJulianCentury
  // -----------------------------------------------------
  describe("getJulianCentury", () => {
    test("T = 0 at J2000 epoch", () => {
      expect(getJulianCentury(j2000)).toBeCloseTo(0, 10);
    });

    test("T for 2020 equinox ≈ 0.202 centuries", () => {
      expect(getJulianCentury(equinox2020)).toBeCloseTo(0.202, 3);
    });

    test("T increases by 1/36525 per day", () => {
      const d1 = new Date(Date.UTC(2024, 5, 10, 0, 0, 0));
      const d2 = new Date(Date.UTC(2024, 5, 11, 0, 0, 0));

      const t1 = getJulianCentury(d1);
      const t2 = getJulianCentury(d2);

      expect(t2 - t1).toBeCloseTo(1 / 36525, 10);
    });

    test("T is stable across leap years", () => {
      const feb28 = new Date(Date.UTC(2024, 1, 28, 12, 0, 0));
      const feb29 = new Date(Date.UTC(2024, 1, 29, 12, 0, 0));

      const t1 = getJulianCentury(feb28);
      const t2 = getJulianCentury(feb29);

      expect(t2 - t1).toBeCloseTo(1 / 36525, 10);
    });

    test("T is continuous across year boundaries", () => {
      const dec31 = new Date(Date.UTC(2023, 11, 31, 12, 0, 0));
      const jan1 = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));

      const t1 = getJulianCentury(dec31);
      const t2 = getJulianCentury(jan1);

      expect(t2 - t1).toBeCloseTo(1 / 36525, 10);
    });
  });
});
