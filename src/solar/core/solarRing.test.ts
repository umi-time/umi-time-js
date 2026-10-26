import {
  normalizeAngle,
  mapEventToRingAngle,
  mapEventToRingAngleForDate,
  mapEventsToRingAngles
} from "./solarRing";

import {
  getSolarMidnightUT,
  getSunriseUT,
  getSunsetUT
} from "./solarEvents";

describe("Solar ring angle mapping", () => {

  // -----------------------------------------------------
  // Reference fixtures
  // -----------------------------------------------------
  const equinox2020 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0)); // Mar 20 2020

  // -----------------------------------------------------
  // normalizeAngle
  // -----------------------------------------------------
  describe("normalizeAngle", () => {
    test("keeps angles within [0, 360)", () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(359)).toBe(359);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(720)).toBe(0);
    });

    test("wraps negative angles correctly", () => {
      expect(normalizeAngle(-1)).toBe(359);
      expect(normalizeAngle(-360)).toBe(0);
      expect(normalizeAngle(-361)).toBe(359);
    });

    test("handles large positive and negative values", () => {
      expect(normalizeAngle(1080)).toBe(0);
      expect(normalizeAngle(-1080)).toBe(0);
    });
  });

  // -----------------------------------------------------
  // mapEventToRingAngle
  // -----------------------------------------------------
  describe("mapEventToRingAngle", () => {
    test("event at midnight maps to 0ᵘ", () => {
      expect(mapEventToRingAngle(10, 10)).toBe(0);
    });

    test("event after midnight maps to positive angle", () => {
      expect(mapEventToRingAngle(20, 10)).toBe(10);
    });

    test("event before midnight wraps correctly", () => {
      expect(mapEventToRingAngle(5, 355)).toBe(10);
    });

    test("mapping is symmetric", () => {
      const a = mapEventToRingAngle(200, 100);
      const b = mapEventToRingAngle(100, 200);
      expect(a).toBeCloseTo(360 - b);
    });
  });

  // -----------------------------------------------------
  // mapEventToRingAngleForDate
  // -----------------------------------------------------
  describe("mapEventToRingAngleForDate", () => {
    test("sunrise maps to correct ring angle relative to solar midnight", () => {
      const midnightUT = getSolarMidnightUT(equinox2020, 0);
      const sunriseUT = getSunriseUT(equinox2020, 0, 0);

      const angle = mapEventToRingAngleForDate(equinox2020, 0, sunriseUT);
      const expected = normalizeAngle(sunriseUT - midnightUT);

      expect(angle).toBeCloseTo(expected, 5);
    });

    test("sunset maps to correct ring angle relative to solar midnight", () => {
      const midnightUT = getSolarMidnightUT(equinox2020, 0);
      const sunsetUT = getSunsetUT(equinox2020, 0, 0);

      const angle = mapEventToRingAngleForDate(equinox2020, 0, sunsetUT);
      const expected = normalizeAngle(sunsetUT - midnightUT);

      expect(angle).toBeCloseTo(expected, 5);
    });
  });

  // -----------------------------------------------------
  // mapEventsToRingAngles
  // -----------------------------------------------------
  describe("mapEventsToRingAngles", () => {
    test("maps multiple events consistently", () => {
      const midnightUT = getSolarMidnightUT(equinox2020, 0);
      const sunriseUT = getSunriseUT(equinox2020, 0, 0);
      const sunsetUT = getSunsetUT(equinox2020, 0, 0);

      const events = {
        sunrise: sunriseUT,
        sunset: sunsetUT
      };

      const mapped = mapEventsToRingAngles(equinox2020, 0, events);

      expect(mapped.sunrise).toBeCloseTo(normalizeAngle(sunriseUT - midnightUT), 5);
      expect(mapped.sunset).toBeCloseTo(normalizeAngle(sunsetUT - midnightUT), 5);
    });

    test("mapping preserves ordering (sunrise < sunset)", () => {
      const mapped = mapEventsToRingAngles(equinox2020, 0, {
        sunrise: getSunriseUT(equinox2020, 0, 0),
        sunset: getSunsetUT(equinox2020, 0, 0)
      });

      expect(mapped.sunrise).toBeLessThan(mapped.sunset);
    });
  });
});
