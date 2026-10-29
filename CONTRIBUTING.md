# Contributing to umi‑time‑js

Thank you for contributing to the official TypeScript reference implementation of Umi‑Time.  
This repository contains the core library for solar geometry, formatting, parsing, and time calculations.

The code is licensed under **MIT**.

---

## Getting Started

Clone the repository and install dependencies using a clean lockfile installation:

```bash
git clone https://github.com/umi-time/umi-time-js.git
cd umi-time-js
npm ci
```

Build the library:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run linter checks:

```bash
npm run lint
```

---

## Development Guidelines

- All core logic is written in TypeScript  
- Solar geometry functions should be pure and deterministic  
- `UmiTime` objects are immutable — methods return new instances  
- Public methods must be documented with clear intent and units  
- Add tests for all new functionality  
- Keep formatting and parsing behavior aligned with the Umi‑Time Standard  

---

## Pull Requests

Before submitting a PR:
- Ensure the project builds cleanly without errors 
- Ensure all tests pass  
- Ensure code passes all style checking and linting steps (`npm run lint`)
- Add or update documentation as needed  
- Reference related issues  
- Keep changes small and focused  

---

## Issues

When reporting a bug, please include:
- Input values  
- Expected vs actual output  
- Node version  
- Browser (if applicable)  
- Steps to reproduce  

---

## Publishing

Only maintainers publish new versions to npm.  
The `dist/` directory contains the compiled output; all development happens in `src/`.

---

## Licensing

All contributions to this repository are licensed under **MIT**.

---

## Thank You

Your contributions help improve the accuracy, performance, and usability of the Umi‑Time reference implementation.
