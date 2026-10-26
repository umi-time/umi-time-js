import { defineConfig } from 'tsup';

export default defineConfig([
  // Pass 1: Build the standard index files (ESM & CJS)
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    minify: true,
  },
  // Pass 2: Build the standalone client file (IIFE)
  {
    entry: { 'umi-time': 'src/index.ts' }, // Changes the base filename to 'umi-time'
    format: ['iife'],
    globalName: 'UmiTime',
    minify: true,
    outExtension() {
      return {
        js: '.min.js', // Changes the extension from '.global.js' to '.min.js'
      };
    },
  },
]);
