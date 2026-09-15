import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * ESLint flat config.
 *
 * eslint-config-next 16 ships native flat configs, so there is no FlatCompat
 * shim here. Do not reintroduce one: the eslintrc compatibility layer throws a
 * circular-structure error against ESLint 10.
 */
const config = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "data/ph-map.json", "scripts/**"],
  },
];

export default config;
