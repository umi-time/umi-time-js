import { describe, expect, test } from "vitest";
import { toRad, toDeg, dayOfYear } from "./solarMath";

describe("solarMath utilities", () => {

  // -----------------------------
  // toRad
  // -----------------------------
  describe("toRad", () => {
    test("converts degrees to radians", () => {
      expect(toRad(0)).toBe(0);
      expect(toRad(180)).toBe(Math.PI);
      expect(toRad(90)).toBeCloseTo(Math.PI / 2);
      expect(toRad(360)).toBeCloseTo(2 * Math.PI);
    });

    test("handles negative degrees", () => {
      expect(toRad(-90)).toBeCloseTo(-Math.PI / 2);
      expect(toRad(-180)).toBeCloseTo(-Math.PI);
    });

    test("handles large degree values", () => {
      expect(toRad(720)).toBeCloseTo(4 * Math.PI);
      expect(toRad(-720)).toBeCloseTo(-4 * Math.PI);
    });
  });

  // -----------------------------
  // toDeg
  // -----------------------------
  describe("toDeg", () => {
    test("converts radians to degrees", () => {
      expect(toDeg(0)).toBe(0);
      expect(toDeg(Math.PI)).toBe(180);
      expect(toDeg(Math.PI / 2)).toBe(90);
      expect(toDeg(2 * Math.PI)).toBe(360);
    });

    test("handles negative radians", () => {
      expect(toDeg(-Math.PI / 2)).toBe(-90);
      expect(toDeg(-Math.PI)).toBe(-180);
    });

    test("handles large radian values", () => {
      expect(toDeg(4 * Math.PI)).toBe(720);
      expect(toDeg(-4 * Math.PI)).toBe(-720);
    });
  });

  // -----------------------------
  // dayOfYear
  // -----------------------------
  describe("dayOfYear", () => {
    test("computes correct day for non-leap year", () => {
      expect(dayOfYear(new Date(Date.UTC(2023, 0, 1)))).toBe(1);   // Jan 1
      expect(dayOfYear(new Date(Date.UTC(2023, 0, 31)))).toBe(31); // Jan 31
      expect(dayOfYear(new Date(Date.UTC(2023, 1, 1)))).toBe(32);  // Feb 1
      expect(dayOfYear(new Date(Date.UTC(2023, 11, 31)))).toBe(365);
    });

    test("computes correct day for leap year", () => {
      expect(dayOfYear(new Date(Date.UTC(2024, 0, 1)))).toBe(1);
      expect(dayOfYear(new Date(Date.UTC(2024, 1, 29)))).toBe(60); // Feb 29
      expect(dayOfYear(new Date(Date.UTC(2024, 11, 31)))).toBe(366);
    });

    test("ignores time-of-day (UTC)", () => {
      const morning = new Date(Date.UTC(2024, 5, 15, 8, 30, 0));
      const night = new Date(Date.UTC(2024, 5, 15, 23, 59, 59));
      expect(dayOfYear(morning)).toBe(dayOfYear(night));
    });

    test("handles year boundaries", () => {
      expect(dayOfYear(new Date(Date.UTC(2024, 0, 1)))).toBe(1);
      expect(dayOfYear(new Date(Date.UTC(2024, 11, 31)))).toBe(366);
      expect(dayOfYear(new Date(Date.UTC(2025, 0, 1)))).toBe(1);
    });

    test("handles random dates for stability", () => {
      expect(dayOfYear(new Date(Date.UTC(2025, 5, 10)))).toBe(161);
      expect(dayOfYear(new Date(Date.UTC(2025, 9, 20)))).toBe(293);
    });
  });
});
