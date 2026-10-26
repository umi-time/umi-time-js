import {
  solarMeanLongitude,
  solarMeanAnomaly,
  earthOrbitEccentricity,
  equationOfCenter,
  eclipticLongitude,
  trueAnomaly,
  apparentLongitude,
  meanObliquity,
  obliquityCorrection,
  solarDeclination,
  getSolarDeclination
} from "./declination";

import { getJulianCentury } from "./julian";
import { normalizeDegrees } from "../utils/solarMath";

describe("Solar declination and related formulas", () => {

  // -----------------------------------------------------
  // Reference fixtures
  // -----------------------------------------------------
  const equinox2020 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0)); // Mar 20 2020
  const T = getJulianCentury(equinox2020);

  // Known declination values (NOAA / SPA)
  const decEquinox2020 = 0.133610694; // Mar 20 2020 12:00 UTC is after the equinox instant

  // -----------------------------------------------------
  // solarMeanLongitude
  // -----------------------------------------------------
  describe("solarMeanLongitude", () => {
    test("computes expected mean longitude", () => {
      const L0 = solarMeanLongitude(T);
      // Rough expected range for this date
      expect(L0).toBeGreaterThan(0);
      expect(L0).toBeLessThan(360);
    });

    test("is continuous across small changes in T", () => {
      const L1 = solarMeanLongitude(T);
      const L2 = solarMeanLongitude(T + 0.00001);
      expect(Math.abs(L2 - L1)).toBeLessThan(1);
    });
  });

  // -----------------------------------------------------
  // solarMeanAnomaly
  // -----------------------------------------------------
  describe("solarMeanAnomaly", () => {
    test("computes expected mean anomaly", () => {
      const M = solarMeanAnomaly(T);
      expect(M).toBeGreaterThan(0);
      expect(M).toBeLessThan(360);
    });

    test("is continuous across small changes in T", () => {
      const M1 = solarMeanAnomaly(T);
      const M2 = solarMeanAnomaly(T + 0.00001);
      expect(Math.abs(M2 - M1)).toBeLessThan(1);
    });
  });

  // -----------------------------------------------------
  // earthOrbitEccentricity
  // -----------------------------------------------------
  describe("earthOrbitEccentricity", () => {
    test("eccentricity is near expected value (~0.0167)", () => {
      const e = earthOrbitEccentricity(T);
      expect(e).toBeCloseTo(0.0167, 3);
    });

    test("eccentricity decreases slowly over time", () => {
      const e1 = earthOrbitEccentricity(0);
      const e2 = earthOrbitEccentricity(1);
      expect(e2).toBeLessThan(e1);
    });
  });

  // -----------------------------------------------------
  // equationOfCenter
  // -----------------------------------------------------
  describe("equationOfCenter", () => {
    test("equation of center is within expected range", () => {
      const M = solarMeanAnomaly(T);
      const C = equationOfCenter(M, T);
      expect(C).toBeGreaterThan(-5);
      expect(C).toBeLessThan(5);
    });
  });

  // -----------------------------------------------------
  // eclipticLongitude
  // -----------------------------------------------------
  describe("eclipticLongitude", () => {
    test("λ = L0 + C", () => {
      const L0 = solarMeanLongitude(T);
      const M = solarMeanAnomaly(T);
      const C = equationOfCenter(M, T);
      const lambda = eclipticLongitude(L0, C);
      expect(lambda).toBeCloseTo(normalizeDegrees(L0 + C), 6);
    });
  });

  // -----------------------------------------------------
  // trueAnomaly
  // -----------------------------------------------------
  describe("trueAnomaly", () => {
    test("ν = M + C", () => {
      const M = solarMeanAnomaly(T);
      const C = equationOfCenter(M, T);
      const nu = trueAnomaly(M, C);
      expect(nu).toBeCloseTo(M + C, 6);
    });
  });

  // -----------------------------------------------------
  // apparentLongitude
  // -----------------------------------------------------
  describe("apparentLongitude", () => {
    test("apparent longitude applies nutation correction", () => {
      const L0 = solarMeanLongitude(T);
      const M = solarMeanAnomaly(T);
      const C = equationOfCenter(M, T);
      const lambda = eclipticLongitude(L0, C);
      const lambdaSun = apparentLongitude(lambda, T);

      expect(lambdaSun).not.toBeCloseTo(lambda); // correction applied
    });
  });

  // -----------------------------------------------------
  // meanObliquity
  // -----------------------------------------------------
  describe("meanObliquity", () => {
    test("mean obliquity is near expected value (~23.44°)", () => {
      const eps0 = meanObliquity(T);
      expect(eps0).toBeCloseTo(23.44, 1);
    });
  });

  // -----------------------------------------------------
  // obliquityCorrection
  // -----------------------------------------------------
  describe("obliquityCorrection", () => {
    test("corrected obliquity differs slightly from mean obliquity", () => {
      const eps0 = meanObliquity(T);
      const eps = obliquityCorrection(eps0, T);
      expect(Math.abs(eps - eps0)).toBeGreaterThan(0);
    });
  });

  // -----------------------------------------------------
  // solarDeclination
  // -----------------------------------------------------
  describe("solarDeclination", () => {
    test("declination matches expected value for the fixture instant", () => {
      const L0 = solarMeanLongitude(T);
      const M = solarMeanAnomaly(T);
      const C = equationOfCenter(M, T);
      const lambda = eclipticLongitude(L0, C);
      const lambdaSun = apparentLongitude(lambda, T);
      const eps0 = meanObliquity(T);
      const eps = obliquityCorrection(eps0, T);

      const dec = solarDeclination(eps, lambdaSun);
      expect(dec).toBeCloseTo(decEquinox2020, 1);
    });
  });

  // -----------------------------------------------------
  // getSolarDeclination (full pipeline)
  // -----------------------------------------------------
  describe("getSolarDeclination", () => {
    test("full declination pipeline matches expected fixture value", () => {
      const dec = getSolarDeclination(equinox2020);
      expect(dec).toBeCloseTo(decEquinox2020, 6);
    });

    test("declination changes smoothly day-to-day", () => {
      const d1 = new Date(Date.UTC(2020, 2, 19, 12, 0, 0));
      const d2 = new Date(Date.UTC(2020, 2, 20, 12, 0, 0));
      const d3 = new Date(Date.UTC(2020, 2, 21, 12, 0, 0));

      const dec1 = getSolarDeclination(d1);
      const dec2 = getSolarDeclination(d2);
      const dec3 = getSolarDeclination(d3);

      expect(Math.abs(dec2 - dec1)).toBeLessThan(1);
      expect(Math.abs(dec3 - dec2)).toBeLessThan(1);
    });
  });
});
