import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  target: 'es2022',
  banner: { js: '"use client";' },
});
