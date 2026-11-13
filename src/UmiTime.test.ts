import { describe, expect, test } from "vitest";
import { UmiTime } from "./UmiTime";
import {
  UMI_COMPACT,
  UMI_COMPACT_BARE,
  UMI_EXTENDED,
  UMI_EXTENDED_BARE,
  UMI_DATE_TIME,
  UMI_DATE_TIME_EXT,
  UMI_CANONICAL_FULL,
  UMI_CANONICAL_FULL_EXT,
} from "./core/format/constants";

describe("UmiTime (strict spec)", () => {
  const FIXED_UTC = new Date(Date.UTC(2026, 8, 8, 12, 34, 56));
  const umi = new UmiTime(FIXED_UTC);

  // ---------------------------------------------------------------------------
  // Construction
  // ---------------------------------------------------------------------------

  test("constructs with default latitude/longitude uncertainty", () => {
    expect(umi.latitude).toEqual({ value: 0, uncertainty: 90 });
    expect(umi.longitude).toEqual({ value: 0, uncertainty: 180 });
  });

  test("withUTC returns a new instance", () => {
    const newUTC = new Date(Date.UTC(2030, 0, 1));
    const updated = umi.withUTC(newUTC);
    expect(updated.utc).toEqual(newUTC);
    expect(updated).not.toBe(umi);
  });

  test("withLatitude and withLongitude preserve immutability", () => {
    const updatedLat = umi.withLatitude(35, 1);
    expect(updatedLat.latitude).toEqual({ value: 35, uncertainty: 1 });
    expect(updatedLat.longitude).toEqual(umi.longitude);

    const updatedLon = umi.withLongitude(-120, 2);
    expect(updatedLon.longitude).toEqual({ value: -120, uncertainty: 2 });
    expect(updatedLon.latitude).toEqual(umi.latitude);
  });

  // ---------------------------------------------------------------------------
  // Raw UT parsing (strict spec)
  // ---------------------------------------------------------------------------

  test("parses raw UT compact UUUSSS", () => {
    const parsed = UmiTime.parse("123231");
    expect(parsed.umi).toBe(123);
    expect(parsed.second).toBe(231);
  });

  test("parses raw UT extended UUU:SSS", () => {
    const parsed = UmiTime.parse("123:231");
    expect(parsed.umi).toBe(123);
    expect(parsed.second).toBe(231);
  });

  // ---------------------------------------------------------------------------
  // Formatting (canonical formats)
  // ---------------------------------------------------------------------------

  test("formats using UMI_COMPACT", () => {
    const s = umi.format(UMI_COMPACT);
    expect(/^U\d{3}\d{3}$/.test(s)).toBe(true);
  });

  test("formats using UMI_COMPACT_BARE", () => {
    const s = umi.format(UMI_COMPACT_BARE);
    expect(/^\d{3}\d{3}$/.test(s)).toBe(true);
  });

  test("formats using UMI_EXTENDED", () => {
    const s = umi.format(UMI_EXTENDED);
    expect(/^U\d{3}:\d{3}$/.test(s)).toBe(true);
  });

  test("formats using UMI_EXTENDED_BARE", () => {
    const s = umi.format(UMI_EXTENDED_BARE);
    expect(/^\d{3}:\d{3}$/.test(s)).toBe(true);
  });

  test("formats using UMI_DATE_TIME", () => {
    const s = umi.format(UMI_DATE_TIME);
    expect(s.startsWith("2026-09-08U")).toBe(true);
  });

  test("formats using UMI_DATE_TIME_EXT", () => {
    const s = umi.format(UMI_DATE_TIME_EXT);
    expect(s.startsWith("2026-09-08U")).toBe(true);
    expect(s.includes(":")).toBe(true);
  });

  test("formats using UMI_CANONICAL_FULL", () => {
    const s = umi.format(UMI_CANONICAL_FULL);
    expect(s.includes("S")).toBe(true);
    expect(s.includes("+")).toBe(true);
  });

  test("formats using UMI_CANONICAL_FULL_EXT", () => {
    const s = umi.format(UMI_CANONICAL_FULL_EXT);
    expect(s.includes("S")).toBe(true);
    expect(s.includes("+")).toBe(true);
    expect(s.includes(":")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Parsing (canonical formats)
  // ---------------------------------------------------------------------------

  const DATE_FORMATS = [
    UMI_DATE_TIME,
    UMI_DATE_TIME_EXT,
    UMI_CANONICAL_FULL,
    UMI_CANONICAL_FULL_EXT,
  ];

  const TIME_ONLY_FORMATS = [
    UMI_COMPACT,
    UMI_COMPACT_BARE,
    UMI_EXTENDED,
    UMI_EXTENDED_BARE,
  ];

  test("round‑trips date-bearing canonical formats (full UTC)", () => {
    for (const fmt of DATE_FORMATS) {
      const s = umi.format(fmt);
      const parsed = UmiTime.parse(s);
      expect(parsed.utc.getTime()).toBe(umi.utc.getTime());
    }
  });

  test("round‑trips time-only canonical formats (UT components)", () => {
    for (const fmt of TIME_ONLY_FORMATS) {
      const s = umi.format(fmt);
      const parsed = UmiTime.parse(s);
      expect(parsed.umi).toBe(umi.umi);
      expect(parsed.second).toBe(umi.second);
    }
  });

  // ---------------------------------------------------------------------------
  // Segment + refinement inference (strict spec)
  // ---------------------------------------------------------------------------

  test("parses segment suffix and infers longitude midpoint", () => {
    // umi = 2026-09-08U188:176
    const s = umi.format("yyyy-MM-ddUuuu:sssG24"); // canonical extended
    const parsed = UmiTime.parse(s);

    // Since longitude defaults to 0, and a 24 segment division is used, the segment index will be 12
    const index = 12;
    const width = 15;
    const expectedMidpoint = index * width + width / 2 - (188 + 176 / 240);

    expect(parsed.longitude.value).toBeCloseTo(expectedMidpoint);
    expect(parsed.longitude.uncertainty).toBeCloseTo(width / 2);
  });

  test("parses refinement suffix and adjusts longitude", () => {
    // umi = 2026-09-08U188:176
    const s = umi.format(UMI_CANONICAL_FULL_EXT);
    const parsed = UmiTime.parse(s);

    // Since longitude defaults to 0, and a 24 segment division is used, with a one umi resolution refinement,
    // the segment index will be 12 and the refinement portion will be 8.
    const index = 12;
    const segmentWidth = 15;
    const refinement = 8;
    const width = 1;
    const expectedMidpoint =
      index * segmentWidth + refinement + width / 2 - (188 + 176 / 240);

    expect(parsed.longitude.value).toBeCloseTo(expectedMidpoint);
    expect(parsed.longitude.uncertainty).toBeCloseTo(width / 2);
  });

  // ---------------------------------------------------------------------------
  // Explicit longitude suffix
  // ---------------------------------------------------------------------------

  test("parses explicit longitude suffix", () => {
    const s = "2026-09-08U" + umi.format("uuu:sss") + "+123";
    const parsed = UmiTime.parse(s);
    expect(parsed.longitude.value).toBe(123);
    expect(parsed.longitude.uncertainty).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // opts override
  // ---------------------------------------------------------------------------

  test("opts override longitude", () => {
    const s = umi.format(UMI_COMPACT);
    const parsed = UmiTime.parse(s, { longitude: 42 });
    expect(parsed.longitude.value).toBe(42);
    expect(parsed.longitude.uncertainty).toBe(0);
  });

  test("opts override latitude", () => {
    const s = umi.format(UMI_COMPACT);
    const parsed = UmiTime.parse(s, { latitude: 12 });
    expect(parsed.latitude.value).toBe(12);
    expect(parsed.latitude.uncertainty).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Solar precision guards
  // ---------------------------------------------------------------------------

  test("solarPosition throws when longitude uncertainty > 0", () => {
    expect(() => umi.solarPosition).toThrow();
  });

  test("solarPosition succeeds when uncertainty = 0", () => {
    const precise = umi.withLatitude(35, 0).withLongitude(-120, 0);
    const pos = precise.solarPosition;
    expect(typeof pos.altitude).toBe("number");
    expect(typeof pos.azimuth).toBe("number");
  });

  // ---------------------------------------------------------------------------
  // segmentIndex() and segmentRefinement()
  // ---------------------------------------------------------------------------

  describe("segmentIndex() and segmentRefinement()", () => {
    const FIXED_UTC2 = new Date(Date.UTC(2026, 8, 8, 12, 0, 0));
    const base = new UmiTime(FIXED_UTC2);

    test("segmentIndex() computes correct segment for known longitude", () => {
      const umi = base.withLongitude(105, 0);
      const width = 360 / 24;
      const lst = (base.umi + 105 + 360) % 360;
      const expected = Math.floor(lst / width);
      expect(umi.segmentIndex(24)).toBe(expected);
    });

    test("segmentIndex() wraps correctly around 360ᵘ", () => {
      const umi = base.withLongitude(400, 0);
      const width = 360 / 24;
      const lst = (base.umi + 400) % 360;
      const expected = Math.floor(lst / width);
      expect(umi.segmentIndex(24)).toBe(expected);
    });

    test("segmentRefinement() returns offset within segment", () => {
      const umi = base.withLongitude(154, 0);
      const width = 360 / 24;
      const lst = (base.umi + 154 + 360) % 360;
      const index = Math.floor(lst / width);
      const expectedOffset = lst - index * width;
      expect(umi.segmentRefinement(24)).toBeCloseTo(expectedOffset);
    });

    test("segmentRefinement() handles negative offsets correctly", () => {
      const umi = base.withLongitude(-1, 0);
      const width = 360 / 24;
      const lst = (base.umi - 1 + 360) % 360;
      const index = Math.floor(lst / width);
      const expectedOffset = lst - index * width;
      expect(umi.segmentRefinement(24)).toBeCloseTo(expectedOffset);
    });
  });
});

// Helper: parse UTC date easily
const utc = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number = 0
): Date => {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
};

describe("Umi‑Time Spec Test Vectors", () => {

  // -------------------------------------------------------------
  // UTC → Umi conversion vectors
  // -------------------------------------------------------------
  test("UTC → Umi conversion vectors", () => {
    const cases = [
      {
        utc: utc(2026, 8, 24, 15, 40, 38),
        expected: "235:038", // 
      },
      {
        utc: utc(2026, 8, 24, 15, 40, 38, 250),
        expected: "235:038.25", // 
      },
      {
        utc: utc(2026, 8, 24, 8, 0, 0),
        expected: "120:000", // 
      },
      {
        utc: utc(2026, 8, 24, 23, 59, 59, 900),
        expected: "359:239.9", // 
      },
    ];

    for (const { utc, expected } of cases) {
      const umi = new UmiTime(utc);
      expect(umi.format("uuu:sssSS")).toBe(expected);
    }
  });

  // -------------------------------------------------------------
  // Round‑trip example from spec
  // -------------------------------------------------------------
  test("Round‑trip example from spec", () => {
    const utcTime = utc(2026, 8, 24, 15, 40, 38, 250); // 
    const umi = new UmiTime(utcTime);
    const s = umi.format("yyyy-MM-ddUuuu:sssSS");
    expect(s).toBe("2026-08-24U235:038.25");

    const parsed = UmiTime.parse(s);

    const s2 = parsed.format("yyyy-MM-ddUuuu:sssSS");
    expect(s2).toBe(s);

    expect(parsed.utc.getTime()).toBe(utcTime.getTime());
  });

  // -------------------------------------------------------------
  // Greenwich 2026‑06‑21 solar event vectors
  // -------------------------------------------------------------
  test("Greenwich solar event vectors", () => {
    const noon = UmiTime.parse("180:109"); // 
    expect(noon.umi).toBe(180);
    expect(noon.second).toBe(109);

    const sunrise = UmiTime.parse("055:164"); // 
    expect(sunrise.umi).toBe(55);
    expect(sunrise.second).toBe(164);

    const sunset = UmiTime.parse("305:054"); // 
    expect(sunset.umi).toBe(305);
    expect(sunset.second).toBe(54);
  });

  // -------------------------------------------------------------
  // New York 2026‑03‑20 solar event vectors
  // -------------------------------------------------------------
  test("New York solar event vectors", () => {
    const noon = UmiTime.parse("255:204"); // 
    expect(noon.umi).toBe(255);
    expect(noon.second).toBe(204);

    const sunrise = UmiTime.parse("164:197"); // 
    expect(sunrise.umi).toBe(164);
    expect(sunrise.second).toBe(197);

    const sunset = UmiTime.parse("347:012"); // 
    expect(sunset.umi).toBe(347);
    expect(sunset.second).toBe(12);
  });

  // -------------------------------------------------------------
  // Tokyo 2026‑12‑21 solar event vectors
  // -------------------------------------------------------------
  test("Tokyo solar event vectors", () => {
    const noon = UmiTime.parse("039:187"); // 
    expect(noon.umi).toBe(39);
    expect(noon.second).toBe(187);

    const sunrise = UmiTime.parse("326:204"); // 
    expect(sunrise.umi).toBe(326);
    expect(sunrise.second).toBe(204);

    const sunset = UmiTime.parse("112:200"); // 
    expect(sunset.umi).toBe(112);
    expect(sunset.second).toBe(200);
  });

  // -------------------------------------------------------------
  // Tromsø solar event vectors (no sunrise/sunset cases)
  // -------------------------------------------------------------
  test("Tromsø solar event vectors", () => {
    const noonSummer = UmiTime.parse("161:120"); // 
    expect(noonSummer.umi).toBe(161);
    expect(noonSummer.second).toBe(120);

    const noonWinter = UmiTime.parse("160:134"); // 
    expect(noonWinter.umi).toBe(160);
    expect(noonWinter.second).toBe(134);
  });
});
