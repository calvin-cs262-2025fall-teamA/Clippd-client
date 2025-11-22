import js from "@eslint/js";
import globals from "globals";
import { configs as tseslintConfigs } from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  js.configs.recommended,
  ...tseslintConfigs.recommended,
];