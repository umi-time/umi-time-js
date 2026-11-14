# Umi‑Time JavaScript Library

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24184935.svg)](https://doi.org/10.5281/zenodo.24184935)
[![npm version](https://img.shields.io/npm/v/umi-time.svg)](https://npmjs.com/package/umi-time)
[![JSR](https://jsr.io/badges/@umi-time/umi-time)](https://jsr.io/@umi-time/umi-time)
[![JSR Score](https://jsr.io/badges/@umi-time/umi-time/score)](https://jsr.io/@umi-time/umi-time)

`umi-time-js` is the official JavaScript reference implementation of **Umi‑Time**, a presentation layer based on the UTC time-standard.  
It provides:

- A high‑level `UmiTime` class for working with UTᵘ values  
- Parsing and formatting of all canonical Umi‑Time textual formats  
- Conversion between UTC ↔ UTᵘ  
- Solar‑geometry utilities (sunrise, sunset, solar noon, etc.)  
- A small, well‑structured internal core for UTᵘ math and error handling  

The umi-time library is designed to be readable, testable, and easy to port to other languages.

## Installation

Install from **npm**:

```bash
npm install umi-time
```

Or install from **JSR** (Deno, Node.js, Bun, Cloudflare Workers):

```bash
npx jsr add @umi-time/umi-time
```

## Building

Build the library distribution:

```bash
npm run build
```

This compiles the TypeScript source into the `dist/` directory, producing:

- ES module output (`index.js`)
- CommonJS output (`index.cjs`)
- TypeScript declaration files (`index.d.ts`)
- Minified global build for browsers and CDNs (`umi-time.min.js`)

This library is published to npm under the name `umi-time`.

## Usage

### Basic UTC → Umi‑Time

```ts
import { UmiTime } from "umi-time";

const utc = new Date(Date.UTC(2026, 10, 1, 9, 34, 56));
const umi = new UmiTime(utc);

console.log(umi.umi);     // UTᵘ degrees (0–359)
console.log(umi.second);  // UTᵘ seconds (0–239)
```

### Formatting

```ts
umi.format("uuu:sss");                 // "143:176"
umi.format("uuu:sssSS");               // "143:176.25"
umi.format("yyyy-MM-ddUuuu:sss");      // "2026-11-01U143:176"
umi.format("yyyy-MM-ddUuuu:sssSS");    // "2026-11-01U143:176.25"
```

#### Format Tokens
This DSL is **library‑specific** and not part of the Umi‑Time specification.

### Parsing

```ts
const parsed = UmiTime.parse("2026-11-01U143:176.25");

parsed.utc;     // Date object
parsed.umi;     // UTᵘ degrees
parsed.second;  // UTᵘ seconds (integer + fractional)
```

The parser supports:

- All canonical formats

- Compact formats

- Extended formats

- Date‑prefixed formats

- Fractional UT seconds

- Segment and refinement suffixes

UT‑only formats (e.g., `"235:038"`) are anchored to a stable epoch (`1970-01-01`) for deterministic parsing.

### Solar Geometry

The library exports solar-geometry helpers for computing UTᵘ values, solar altitude, and hour angles directly from the package root:

```ts
import { utUmiFromDate, solarAltitude, getHourAngle } from "umi-time";

const date = new Date(Date.UTC(2026, 5, 21, 12, 0, 0));
const utUmi = utUmiFromDate(date);                  // 270ᵘ
const hourAngle = getHourAngle(utUmi, -120.6435, 0); // Pismo Beach, CA longitude
const altitude = solarAltitude(date, 35.1387, -120.6435); // Pismo Beach, CA
const altitude = solarAltitude(35.1387, 23.44, hourAngle);



```

### Project Structure

```text
umi-time-js/
  src/
    index.ts              ← Public entry point & package exports
    UmiTime.ts            ← Main UmiTime class
    UmiTime.test.ts       ← Main test suite

    core/                 ← UTᵘ math, formatting constants, errors
      format/constants.ts
      types/ApproximateValue.ts
      utils/errors.ts

    solar/                ← Solar geometry subsystem
      core/
      utils/

  README.md               ← (this file)
```

Consumers should import from the package root (`umi-time`), which re-exports `UmiTime` along with public constants, types, error classes, and solar utilities from `src/index.ts`.
Internal modules inside `core/` and `solar/` are not intended for direct deep imports.

### Test Vectors
The library includes a full suite of:

- Unit tests

- Spec test vectors

- Solar event validation

- Round‑trip tests

- Parsing/formatting conformance tests

Run the tests:

```bash
npm test
```

### Contributing

Contributions are welcome.

Areas of interest include:

- Additional test vectors

- Performance improvements

- Solar‑geometry refinements

- Porting Umi‑Time to other languages

- Documentation improvements

### License

MIT License  
© 2026 Daniel Brannon and Umi-Time Contributors