// -----------------------------------------------------------------------------
// Imports from core
// -----------------------------------------------------------------------------

import type { ApproximateValue } from "./core/types/ApproximateValue";
import { UmiTimeError, ParseError } from "./core/utils/errors";

// -----------------------------------------------------------------------------
// Imports from solar
// -----------------------------------------------------------------------------

import { getSolarDeclination } from "./solar/core/declination";
import { getEquationOfTime } from "./solar/core/equationOfTime";
import { getSolarPosition } from "./solar/core/solarPosition";
import { getSunriseUT, getSunsetUT, UTToDate } from "./solar/core/solarEvents";

/**
 * Represents a moment in Umi-Time.
 *
 * Umi-Time divides a day into 360 "umis", with each umi containing
 * 240 seconds. An instance stores an exact UTC timestamp together
 * with approximate geographic coordinates that may be used for
 * solar calculations and local solar segmentation.
 */
export class UmiTime {
  readonly utc: Date;
  readonly latitude: ApproximateValue;
  readonly longitude: ApproximateValue;

  /**
   * Creates a new UmiTime instance.
   *
   * @param utc - UTC timestamp represented by this instance.
   * @param latitude - Approximate latitude in degrees.
   * @param longitude - Approximate longitude in degrees.
   */
  constructor(
    utc: Date,
    latitude: ApproximateValue = { value: 0, uncertainty: 90 },
    longitude: ApproximateValue = { value: 0, uncertainty: 180 },
  ) {
    this.utc = utc;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // ---------------------------------------------------------------------------
  // Derived Umi-time values (from UTC)
  // ---------------------------------------------------------------------------

  /**
   * UTC year component.
   */
  get year(): number {
    return this.utc.getUTCFullYear();
  }

  /**
   * UTC month component (1-12).
   */
  get month(): number {
    return this.utc.getUTCMonth() + 1;
  }

  /**
   * UTC day of month component (1-31).
   */
  get day(): number {
    return this.utc.getUTCDate();
  }

  /**
   * Umi-Time umi value (0-359).
   *
   * One umi corresponds to four UTC minutes.
   */
  get umi(): number {
    const hours = this.utc.getUTCHours();
    const minutes = this.utc.getUTCMinutes();
    return hours * 15 + Math.floor(minutes / 4);
  }

  /**
   * Second within the current umi (0-239).
   */
  get second(): number {
    const minutes = this.utc.getUTCMinutes();
    const seconds = this.utc.getUTCSeconds();
    return (minutes % 4) * 60 + seconds; // 0–239
  }

  /**
   * Millisecond component of the UTC timestamp.
   */
  get millisecond(): number {
    return this.utc.getUTCMilliseconds();
  }

  // ---------------------------------------------------------------------------
  // Immutability helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns a new instance with a different UTC timestamp.
   *
   * @param utc - New UTC timestamp.
   * @returns New UmiTime instance.
   */
  withUTC(utc: Date): UmiTime {
    return new UmiTime(utc, this.latitude, this.longitude);
  }

  /**
   * Returns a new instance with a different latitude.
   *
   * @param value - Latitude in degrees.
   * @param uncertainty - Latitude uncertainty in degrees.
   * @returns New UmiTime instance.
   */
  withLatitude(value: number, uncertainty: number = 0): UmiTime {
    return new UmiTime(this.utc, { value, uncertainty }, this.longitude);
  }

  /**
   * Returns a new instance with a different longitude.
   *
   * @param value - Longitude in degrees.
   * @param uncertainty - Longitude uncertainty in degrees.
   * @returns New UmiTime instance.
   */
  withLongitude(value: number, uncertainty: number = 0): UmiTime {
    return new UmiTime(this.utc, this.latitude, { value, uncertainty });
  }

  // ---------------------------------------------------------------------------
  // Segment helpers (best‑estimate, not stored)
  // ---------------------------------------------------------------------------

  /**
   * Calculates which segment of a circular partition contains
   * the current local solar time.
   *
   * @param total - Number of equal segments.
   * @returns Zero-based segment index.
   */
  segmentIndex(total: number): number {
    const width = 360 / total;
    const localSolarTime = this.umi + this.longitude.value;
    return Math.floor((((localSolarTime % 360) + 360) % 360) / width);
  }

  /**
   * Calculates the offset within the current segment.
   *
   * @param total - Number of equal segments.
   * @returns Distance from the start of the segment in degrees.
   */
  segmentRefinement(total: number): number {
    const width = 360 / total;
    const index = this.segmentIndex(total);
    const localSolarTime = this.umi + this.longitude.value;
    const offset = (((localSolarTime % 360) + 360) % 360) - index * width;
    return offset;
  }

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  /**
   * Formats the instance using a Umi-Time format string.
   *
   * Supported tokens include:
   * - yyyy, yy, y
   * - MM, M
   * - dd, d
   * - uuu, u
   * - sss, s
   * - SSS, SS, S
   * - o (Umi symbol)
   * - G<n> (segment notation)
   * - + (segment refinement)
   *
   * @param spec - Format specification.
   * @returns Formatted string.
   */
  format(spec: string): string {
    let out = spec;

    // -------------------------------------------------------
    // Date tokens
    // -------------------------------------------------------
    const year = this.utc.getUTCFullYear();
    const month = this.utc.getUTCMonth() + 1;
    const day = this.utc.getUTCDate();

    out = out.replace(/yyyy/g, String(year).padStart(4, "0"));
    out = out.replace(/yy/g, String(year % 100).padStart(2, "0"));
    out = out.replace(/y/g, String(year));

    out = out.replace(/MM/g, String(month).padStart(2, "0"));
    out = out.replace(/M/g, String(month));

    out = out.replace(/dd/g, String(day).padStart(2, "0"));
    out = out.replace(/d/g, String(day));

    // -------------------------------------------------------
    // Umi-time tokens
    // -------------------------------------------------------

    out = out.replace(/uuu/g, String(this.umi).padStart(3, "0"));
    out = out.replace(/u/g, String(this.umi));

    out = out.replace(/sss/g, String(this.second).padStart(3, "0"));
    out = out.replace(/s/g, String(this.second));

    // Fractional seconds
    const fractional = this.millisecond / 1000;
    let frac = fractional.toFixed(3).slice(1); // "XYZ"

    // Trim any trailing zeros in the fractional part
    frac = frac.replace(/0+$/, ""); // remove trailing zeros
    if (frac === ".") {
      frac = "";
    }
    out = out.replace(/SSS/g, frac);
    out = out.replace(/SS/g, frac.slice(0, 3));
    out = out.replace(/S/g, frac.slice(0, 2));

    // Umi symbol
    out = out.replace(/o/g, "ᵘ");

    // -------------------------------------------------------
    // Segment tokens: Gx
    // -------------------------------------------------------
    out = out.replace(/G(\d+)/g, (_, totalStr) => {
      const total = Math.floor(Number(totalStr));
      const index = Math.floor(this.segmentIndex(total));
      return `S${index}/${total}`;
    });

    // -------------------------------------------------------
    // Refinement suffix: +
    // -------------------------------------------------------
    out = out.replace(/\+/g, () => {
      const total = 24; // default refinement resolution
      const offset = Math.floor(this.segmentRefinement(total));

      const sign = offset >= 0 ? "+" : "-";
      const abs = Math.abs(offset);

      // zero-pad to 2 or 3 digits depending on magnitude
      const width = abs < 100 ? 2 : 3;
      const padded = String(abs).padStart(width, "0");

      return `${sign}${padded}`;
    });

    return out;
  }

  // ---------------------------------------------------------------------------
  // Solar precision guards
  // ---------------------------------------------------------------------------

  private requireLongitudePrecision(threshold: number = 0): void {
    if (this.longitude.uncertainty > threshold) {
      throw new UmiTimeError("Longitude is too uncertain for this operation.");
    }
  }

  private requireLatitudePrecision(threshold: number = 0): void {
    if (this.latitude.uncertainty > threshold) {
      throw new UmiTimeError("Latitude is too uncertain for this operation.");
    }
  }

  // ---------------------------------------------------------------------------
  // Solar geometry
  // ---------------------------------------------------------------------------

  /**
   * Solar declination angle for the current timestamp.
   *
   * @returns Solar declination in degrees.
   */
  get solarDeclination(): number {
    return getSolarDeclination(this.utc);
  }

  /**
   * Equation of time for the current timestamp.
   *
   * @returns Equation of time value.
   */
  get equationOfTime(): number {
    return getEquationOfTime(this.utc);
  }

  /**
   * Apparent solar position at the stored coordinates.
   *
   * Requires exact latitude and longitude.
   *
   * @returns Solar altitude and azimuth.
   * @throws {UmiTimeError} If coordinate uncertainty exceeds limits.
   */
  get solarPosition(): { altitude: number; azimuth: number } {
    this.requireLongitudePrecision(0);
    this.requireLatitudePrecision(0);

    return getSolarPosition(
      this.utc,
      this.latitude.value,
      this.longitude.value,
    );
  }

  /**
   * Sunrise Umi-Time value for the stored coordinates.
   *
   * Requires exact latitude and longitude.
   *
   * @returns Sunrise UTᵘ.
   * @throws {UmiTimeError} If coordinate uncertainty exceeds limits.
   */
  get sunrise(): number {
    this.requireLongitudePrecision(0);
    this.requireLatitudePrecision(0);

    return getSunriseUT(this.utc, this.latitude.value, this.longitude.value);
  }

  /**
   * Sunset Umi-Time value for the stored coordinates.
   *
   * Requires exact latitude and longitude.
   *
   * @returns Sunset UTᵘ.
   * @throws {UmiTimeError} If coordinate uncertainty exceeds limits.
   */
  get sunset(): number {
    this.requireLongitudePrecision(0);
    this.requireLatitudePrecision(0);

    return getSunsetUT(this.utc, this.latitude.value, this.longitude.value);
  }

  // ---------------------------------------------------------------------------
  // Static: Parse Umi‑Time string
  // ---------------------------------------------------------------------------

  /**
   * Validates parsed Umi-Time components.
   *
   * @param umi - Umi value.
   * @param second - Umi-second value.
   * @param raw - Original source string.
   * @throws {ParseError} If values are outside valid ranges.
   */
  private static validateUmiTime(
    umi: number,
    second: number,
    raw: string,
  ): void {
    if (umi < 0 || umi >= 360) {
      throw new ParseError(`Umi-Time umi out of range in "${raw}"`);
    }
    if (second < 0 || second >= 240) {
      throw new ParseError(`Umi-Time second out of range in "${raw}"`);
    }
  }

  /**
   * Parses a Umi-Time string into a UmiTime instance.
   *
   * Supported forms include:
   *
   * - U123
   * - U123:045
   * - U123:045.5
   * - 2025-06-01U123:045
   * - U123+120
   * - U123P8
   * - U123P8+3
   * - U123S4/24
   * - U123S4/24+2
   *
   * When longitude information is omitted, an approximate longitude
   * is inferred from any segment or phase information present.
   *
   * @param input - Umi-Time string to parse.
   * @param opts - Optional coordinate overrides.
   * @param opts.latitude - Explicit latitude.
   * @param opts.longitude - Explicit longitude.
   * @returns Parsed UmiTime instance.
   * @throws {ParseError} If the input cannot be parsed.
   *
   * @example
   * const t = UmiTime.parse("2025-06-01U180:120");
   *
   * console.log(t.umi);      // 180
   * console.log(t.second);   // 120
   * console.log(t.format("yyyy-MM-dd Uuuu:sss"));
   */
  static parse(
    input: string,
    opts?: { latitude?: number; longitude?: number },
  ): UmiTime {
    let str = input.trim();

    // -------------------------------------------------------
    // Extract date prefix
    // -------------------------------------------------------
    const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
    let date: { year: number; month?: number; day?: number } | undefined;

    const dateMatch = str.match(DATE_RE);
    if (dateMatch) {
      const [year, month, day] = dateMatch[0].split("-").map(Number);
      date = { year, month, day };
      str = str.slice(dateMatch[0].length);

      // Since we have extracted a date prefix, the remaining string should start with the Umi-Time portion
      // Ensure the remaining string starts with 'U'
      if (!str.startsWith("U")) {
        throw new ParseError(
          `Expected Umi-Time portion after date in "${input}"`,
        );
      }
    }

    // Remove the 'U' prefix from the Umi-Time portion if it is present
    if (str.startsWith("U")) {
      str = str.slice(1);
    }

    let second: number = 0;
    let fractionalSecond: number = 0;
    let fractionalLength: number = 0;
    let explicitLongitude: number | undefined;
    let maxRefinement: number = 0;
    let segment: { index: number; total: number } | undefined;
    let phase: number | undefined;
    let refinement: number | undefined;

    // The next three digits represent the Umi-Time umi portion (UUU)
    const UMI_RE = /^(\d{3})/;
    const umiMatch = str.match(UMI_RE);
    if (!umiMatch) {
      throw new ParseError(`Expected Umi-Time umi portion in "${input}"`);
    }
    const umi = Number(umiMatch[1]);
    str = str.slice(umiMatch[0].length);

    // Remove the optional ':' if present (for extended format)
    if (str.startsWith(":")) {
      str = str.slice(1);
    }

    // The next three digits (if present) represent the Umi-Time second portion (SSS)
    const SECOND_RE = /^(\d{3})/;
    const secondMatch = str.match(SECOND_RE);
    if (secondMatch) {
      second = Number(secondMatch[1]);
      str = str.slice(secondMatch[0].length);
    }

    // Perform validation of the basic Umi-Time components (umi and second)
    UmiTime.validateUmiTime(umi, second, str);

    // There may be a fractional part following the second portion
    const FRAC_RE = /^\.(\d+)/;
    const fracMatch = str.match(FRAC_RE);
    if (fracMatch) {
      fractionalSecond = Number(fracMatch[1]);
      fractionalLength = fracMatch[1].length;
      str = str.slice(fracMatch[0].length);
    }

    // The next character will determine which type of suffix is present (if any)
    if (str.length > 0) {
      const nextChar = str.charAt(0);
      const SEG_RE = /S(\d+\/\d+)/;
      const PHASE_RE = /P(\d+)/;
      const LON_RE = /([+-]\d{1,3})$/;

      switch (nextChar) {
        case "-":
        case "+":
          {
            // -------------------------------------------------------
            // Extract longitude suffix (+123 or -045)
            // -------------------------------------------------------

            const lonMatch = str.match(LON_RE);
            if (lonMatch) {
              explicitLongitude = Number(lonMatch[1]);
            }
          }
          break;

        case "P":
          {
            // -------------------------------------------------------
            // Extract day phase suffix
            // -------------------------------------------------------
            const phaseMatch = str.match(PHASE_RE);
            if (phaseMatch) {
              phase = Number(phaseMatch[1]);
              if (phase < 0 || phase > 23) {
                throw new ParseError(
                  `Invalid day phase "${phase}" in "${input}"`,
                );
              }
              maxRefinement = 15;
              str = str.slice(phaseMatch[0].length);
            }
          }
          break;

        case "S":
          {
            // -------------------------------------------------------
            // Extract segment suffix
            // -------------------------------------------------------
            const segMatch = str.match(SEG_RE);
            if (segMatch) {
              const [indexStr, totalStr] = segMatch[1].split("/");
              segment = { index: Number(indexStr), total: Number(totalStr) };
              if (segment.index < 0 || segment.index >= segment.total) {
                throw new ParseError(
                  `Invalid segment "${segment.index}/${segment.total}" in "${input}"`,
                );
              }
              if (segment.total < 2 || 360 % segment.total !== 0) {
                throw new ParseError(
                  `Invalid segment total "${segment.total}" in "${input}"`,
                );
              }
              maxRefinement = 360 / segment.total;
              str = str.slice(segMatch[0].length);
            }
          }
          break;

        default:
          // No recognized suffix
          throw new ParseError(
            `Unrecognized suffix "${nextChar}" in "${input}"`,
          );
      }

      if (str.length > 0 && maxRefinement > 0) {
        // -------------------------------------------------------
        // Extract refinement suffix (+12)
        // -------------------------------------------------------
        const REF_RE = /\+(\d{1,3})$/;
        const refMatch = str.match(REF_RE);
        if (refMatch) {
          refinement = Number(refMatch[1]);
          if (refinement >= maxRefinement) {
            throw new ParseError(
              `Invalid refinement "${refinement}" in "${input}"`,
            );
          }
        }
      }
    }

    // -------------------------------------------------------
    // Build UTC date using solarEvents helpers
    // -------------------------------------------------------

    // Determine the date to anchor UTᵘ to
    const baseYear = date?.year ?? 1970;
    const baseMonth = date?.month ?? 1;
    const baseDay = date?.day ?? 1;

    const baseDate = new Date(Date.UTC(baseYear, baseMonth - 1, baseDay));

    // Use the solarEvents helper to convert UTᵘ → UTC timestamp
    let preciseUmi = umi + second / 240;
    if (fractionalLength > 0) {
      preciseUmi += fractionalSecond / (240 * Math.pow(10, fractionalLength));
    }
    const utcDate = UTToDate(baseDate, preciseUmi);

    // -------------------------------------------------------
    // Infer longitude
    // -------------------------------------------------------
    let longitude: ApproximateValue;

    if (opts?.longitude !== undefined) {
      longitude = { value: opts.longitude, uncertainty: 0 };
    } else if (explicitLongitude !== undefined) {
      longitude = { value: explicitLongitude, uncertainty: 0 };
    } else {
      let width: number;
      let midpoint: number;

      if (segment) {
        const { index, total } = segment;
        const segmentWidth = 360 / total;
        if (refinement) {
          width = 1;
          midpoint = index * segmentWidth + refinement + width / 2;
        } else {
          width = segmentWidth;
          midpoint = index * width + width / 2;
        }
      } else if (phase) {
        const phaseWidth = 15;
        if (refinement) {
          width = 1;
          midpoint = phase * phaseWidth + refinement + width / 2;
        } else {
          width = phaseWidth;
          midpoint = phase * width + width / 2;
        }
      } else {
        width = 360;
        midpoint = 0;
      }

      longitude = {
        value: midpoint - (umi + second / 240),
        uncertainty: width / 2,
      };
    }

    // -------------------------------------------------------
    // Infer latitude (never encoded)
    // -------------------------------------------------------
    const latitude: ApproximateValue =
      opts?.latitude !== undefined
        ? { value: opts.latitude, uncertainty: 0 }
        : { value: 0, uncertainty: 90 };

    return new UmiTime(utcDate, latitude, longitude);
  }
}
