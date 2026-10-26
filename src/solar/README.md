# `@umi-time/solar`

This folder contains the solar‑geometry subsystem used by the Umi‑Time JavaScript implementation. These modules compute solar positions, solar events, and UTᵘ values derived from astronomical geometry.

The solar subsystem is intentionally separated from the core UTᵘ logic so that:

- UTᵘ math remains portable to non‑solar contexts  
- solar geometry can evolve independently  
- the library remains modular and testable  

---

## Contents

### `core/`
This folder contains the primary solar‑geometry algorithms:

- `solarPosition.ts` — computes solar altitude and azimuth  
- `hourAngle.ts` — computes hour angle from longitude and UTᵘ  
- `solarEvents.ts` — computes sunrise, sunset, solar noon, and related UTᵘ values  
- `UTToSeconds()` and `UTToDate()` — canonical UTᵘ → UTC conversion helpers

These functions are used by `UmiTime.ts` when converting UTᵘ values into UTC timestamps or when computing solar‑derived UTᵘ values.

### `utils/`
Utility functions used by the solar subsystem:

- math helpers  
- angle conversions  
- internal utilities used by the solar event algorithms  

These utilities are not part of the public API.

---

## Relationship to `UmiTime.ts`

The `UmiTime` class uses the solar subsystem for:

- converting UTᵘ → UTC  
- converting UTC → UTᵘ  
- computing solar‑event UTᵘ values (optional)  
- ensuring UTᵘ math is consistent with solar geometry

The solar subsystem is **not** required for basic UTᵘ parsing or formatting, but it is required for correct UTᵘ ↔ UTC conversion.

---

## When to use this folder

You will interact with this folder if you:

- work on solar geometry  
- improve sunrise/sunset accuracy  
- add new solar event types  
- port Umi‑Time to another language  
- validate UTᵘ ↔ UTC conversion logic  
- contribute to astronomical correctness

Consumers of the library typically do **not** use this folder directly.

---

## Unit Tests

The solar subsystem includes its own unit tests to ensure:

- correctness of solar geometry  
- stability of UTᵘ conversions  
- consistency with the Umi‑Time specification’s test vectors

These tests complement the main `UmiTime.test.ts` suite.
