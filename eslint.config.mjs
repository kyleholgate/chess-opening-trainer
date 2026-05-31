import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", ".open-next/**", ".wrangler/**", "tsconfig.tsbuildinfo"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
