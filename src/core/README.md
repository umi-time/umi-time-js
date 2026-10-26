# `@umi-time/core`

This folder contains the core, language‑agnostic building blocks of the Umi‑Time JavaScript implementation. These modules implement the fundamental rules of the Umi‑Time standard: UTᵘ math, parsing, formatting, error handling, and type definitions.

Although the public API is exposed through `UmiTime.ts` at the package root, the files in this folder provide the underlying logic used by the high‑level class.

---

## Contents

### `format/constants.ts`
Defines the canonical Umi‑Time textual formats used by the library:

- `UMI_COMPACT`
- `UMI_COMPACT_BARE`
- `UMI_EXTENDED`
- `UMI_EXTENDED_BARE`
- `UMI_DATE_TIME`
- `UMI_DATE_TIME_EXT`
- `UMI_CANONICAL_FULL`
- `UMI_CANONICAL_FULL_EXT`

These constants correspond to the normative formats described in the Umi‑Time specification.  
They are used by `UmiTime.format()` and by the test suite.

### `types/ApproximateValue.ts`
Defines the `ApproximateValue` type used for representing values with uncertainty (e.g., solar event times).  
This type is used internally by the solar subsystem and by any code that needs to express approximate UTᵘ values.

### `utils/errors.ts`
Defines the error types thrown by the library:

- `UmiTimeError` — general errors
- `ParseError` — errors encountered during textual parsing

These errors are used throughout the parser and formatting logic.

---

## Relationship to `UmiTime.ts`

The `UmiTime` class (located at the package root) is the **public API**.  
It imports:

- formatting constants  
- parsing helpers  
- UTᵘ math utilities  
- error types  

The `core` folder should be considered **internal implementation**, even though it is visible in the repo. Only `UmiTime.ts` is intended for direct use by consumers.

---

## When to use this folder

You will interact with this folder if you:

- contribute to the Umi‑Time JS implementation  
- modify parsing or formatting rules  
- add new canonical formats  
- extend error handling  
- work on UTᵘ math or type definitions

Consumers of the library should use the `UmiTime` class instead.
