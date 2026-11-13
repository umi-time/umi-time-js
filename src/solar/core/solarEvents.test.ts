import { describe, expect, test } from "vitest";
import {
  UTToSeconds,
  UTToDate,
  getSolarNoonUT,
  getSolarMidnightUT,
  getSunriseSunsetHourAngle,
  getSunriseUT,
  getSunsetUT,
  getSunrise,
  getSunset,
  getDaylightLengthUT,
  getDaylightLengthSeconds,
  twilightHourAngle,
  getTwilight,
} from "./solarEvents";

import { getSolarDeclination } from "./declination";
import { getEquationOfTime } from "./equationOfTime";

describe("Solar event calculations", () => {
  // -----------------------------------------------------
  // Reference fixtures
  // -----------------------------------------------------
  const equinox2020 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0)); // Mar 20 2020
  const decEquinox = getSolarDeclination(equinox2020); // ≈ 0°
  const eotEquinox = getEquationOfTime(equinox2020); // ≈ -7.44 min

  // -----------------------------------------------------
  // UTToSeconds
  // -----------------------------------------------------
  describe("utUmiToSeconds", () => {
    test("converts Umi-time umi to seconds correctly", () => {
      expect(UTToSeconds(0)).toBe(0);
      expect(UTToSeconds(1)).toBe(240);
      expect(UTToSeconds(180)).toBe(43200);
    });
  });

  // -----------------------------------------------------
  // UTToDate
  // -----------------------------------------------------
  describe("utUmiToDate", () => {
    test("converts Umi-time umi to correct UTC time", () => {
      const d = UTToDate(equinox2020, 180);
      expect(d.getUTCHours()).toBe(12);
      expect(d.getUTCMinutes()).toBe(0);
    });

    test("wraps correctly at midnight", () => {
      const d = UTToDate(equinox2020, 0);
      expect(d.getUTCHours()).toBe(0);
    });
  });

  // -----------------------------------------------------
  // getSolarNoonUT
  // -----------------------------------------------------
  describe("getSolarNoonUT", () => {
    test("solar noon UT at equinox lon=0 follows EoT", () => {
      const ut = getSolarNoonUT(equinox2020, 0);
      expect(ut).toBeCloseTo(180 - eotEquinox / 4, 5);
    });

    test("longitude shifts solar noon", () => {
      const ut = getSolarNoonUT(equinox2020, -30);
      expect(ut).toBeCloseTo(180 + 30 - eotEquinox / 4, 5);
    });
  });

  // -----------------------------------------------------
  // getSolarMidnightUT
  // -----------------------------------------------------
  describe("getSolarMidnightUT", () => {
    test("solar midnight Umi-Time umi at equinox lon=0 follows EoT", () => {
      const ut = getSolarMidnightUT(equinox2020, 0);
      expect(ut).toBeCloseTo(-eotEquinox / 4, 5);
    });

    test("longitude shifts solar midnight", () => {
      const ut = getSolarMidnightUT(equinox2020, -30);
      expect(ut).toBeCloseTo(30 - eotEquinox / 4, 5);
    });
  });

  // -----------------------------------------------------
  // getSunriseSunsetHourAngle
  // -----------------------------------------------------
  describe("getSunriseSunsetHourAngle", () => {
    test("H0 includes refraction at the equator", () => {
      const H0 = getSunriseSunsetHourAngle(equinox2020, 0);
      expect(H0).toBeCloseTo(90.833, 3);
    });

    test("H0 increases at higher latitudes near the equinox with refraction", () => {
      const H0eq = getSunriseSunsetHourAngle(equinox2020, 0);
      const H045 = getSunriseSunsetHourAngle(equinox2020, 45);
      expect(H045).toBeGreaterThan(H0eq);
    });
  });

  // -----------------------------------------------------
  // getSunriseUT
  // -----------------------------------------------------
  describe("getSunriseUT", () => {
    test("sunrise Umi-Time umi is solar noon minus H0", () => {
      const ut = getSunriseUT(equinox2020, 0, 0);
      expect(ut).toBeCloseTo(getSolarNoonUT(equinox2020, 0) - getSunriseSunsetHourAngle(equinox2020, 0), 10);
    });

    test("sunrise occurs later in UTC at western longitudes", () => {
      const ut = getSunriseUT(equinox2020, 0, -30);
      expect(ut).toBeGreaterThan(getSunriseUT(equinox2020, 0, 0));
    });
  });

  // -----------------------------------------------------
  // getSunsetUT
  // -----------------------------------------------------
  describe("getSunsetUT", () => {
    test("sunset Umi-Time umi is solar noon plus H0", () => {
      const ut = getSunsetUT(equinox2020, 0, 0);
      expect(ut).toBeCloseTo(getSolarNoonUT(equinox2020, 0) + getSunriseSunsetHourAngle(equinox2020, 0), 10);
    });

    test("sunset occurs later at western longitudes", () => {
      const ut = getSunsetUT(equinox2020, 0, -30);
      expect(ut).toBeGreaterThan(277 - 30);
    });
  });

  // -----------------------------------------------------
  // getSunrise / getSunset (Date wrappers)
  // -----------------------------------------------------
  describe("getSunrise / getSunset", () => {
    test("sunrise returns a Date object", () => {
      const d = getSunrise(equinox2020, 0, 0);
      expect(d instanceof Date).toBe(true);
    });

    test("sunset returns a Date object", () => {
      const d = getSunset(equinox2020, 0, 0);
      expect(d instanceof Date).toBe(true);
    });
  });

  // -----------------------------------------------------
  // getDaylightLengthUT
  // -----------------------------------------------------
  describe("getDaylightLengthUT", () => {
    test("daylight length at equinox includes refraction", () => {
      const daylight = getDaylightLengthUT(equinox2020, 0, 0);
      expect(daylight).toBeCloseTo(2 * getSunriseSunsetHourAngle(equinox2020, 0), 10);
    });

    test("daylight increases at higher latitudes near the equinox with refraction", () => {
      const eq = getDaylightLengthUT(equinox2020, 0, 0);
      const mid = getDaylightLengthUT(equinox2020, 45, 0);
      expect(mid).toBeGreaterThan(eq);
    });
  });

  // -----------------------------------------------------
  // getDaylightLengthSeconds
  // -----------------------------------------------------
  describe("getDaylightLengthSeconds", () => {
    test("daylight length at equator ≈ 12 hours", () => {
      const sec = getDaylightLengthSeconds(equinox2020, 0, 0);
      expect(sec).toBeGreaterThan(43200);
      expect(sec).toBeLessThan(45000);
    });
  });

  // -----------------------------------------------------
  // twilightHourAngle
  // -----------------------------------------------------
  describe("twilightHourAngle", () => {
    test("astronomical twilight hour angle > civil twilight hour angle", () => {
      const Hastro = twilightHourAngle(0, decEquinox, -18);
      const Hcivil = twilightHourAngle(0, decEquinox, -6);
      expect(Hastro).toBeGreaterThan(Hcivil);
    });

    test("twilight hour angle increases at higher latitudes near the equinox", () => {
      const H0 = twilightHourAngle(0, decEquinox, -6);
      const H45 = twilightHourAngle(45, decEquinox, -6);
      expect(H45).toBeGreaterThan(H0);
    });
  });

  // -----------------------------------------------------
  // getTwilight
  // -----------------------------------------------------
  describe("getTwilight", () => {
    test("returns morning and evening twilight objects", () => {
      const tw = getTwilight(equinox2020, 0, 0);
      expect(tw.morning).toBeDefined();
      expect(tw.evening).toBeDefined();
    });

    test("astronomical twilight occurs before civil twilight (morning, when both exist)", () => {
      const tw = getTwilight(equinox2020, 0, 0);

      const morning = tw.morning;
      if (!morning) {
        // If morning twilight is null at this lat/date, just assert that fact.
        expect(morning).toBeNull();
        return;
      }

      const { astronomical, civil } = morning;

      // If either phase is missing, we can't assert ordering.
      if (!astronomical || !civil) {
        expect(astronomical === null || civil === null).toBe(true);
        return;
      }

      expect(astronomical.getTime()).toBeLessThan(civil.getTime());
    });

    test("astronomical twilight occurs after civil twilight (evening, when both exist)", () => {
      const tw = getTwilight(equinox2020, 0, 0);

      const evening = tw.evening;
      if (!evening) {
        expect(evening).toBeNull();
        return;
      }

      const { astronomical, civil } = evening;

      if (!astronomical || !civil) {
        expect(astronomical === null || civil === null).toBe(true);
        return;
      }

      expect(astronomical.getTime()).toBeGreaterThan(civil.getTime());
    });
  });
});
