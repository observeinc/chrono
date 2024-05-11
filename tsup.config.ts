import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  sourcemap: true,
  dts: true,
  format: ["cjs", "esm"],
  tsconfig: "tsconfig.build.json",
});