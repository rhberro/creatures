import { oxsome } from "@rhberro/oxsome";
import { type OxlintConfig, defineConfig } from "oxlint";

const config: OxlintConfig = {
  categories: {
    correctness: "error",
    nursery: "error",
    pedantic: "error",
    restriction: "error",
    // style: "error",
    suspicious: "error",
  },
  extends: [oxsome.recommended],
  globals: {
    document: "readonly",
  },
  ignorePatterns: ["*.d.ts"],
  jsPlugins: ["@rhberro/oxsome/plugin"],
  overrides: [
    {
      files: ["**/*.{ts,tsx,jsx}"],
      rules: {
        "react/jsx-filename-extension": "off",
        "react/jsx-no-literals": "off",
        "react/react-in-jsx-scope": "off",
      },
    },
    {
      files: ["**/*.{ts,tsx,js,jsx}"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
  plugins: ["eslint", "import", "oxc", "react", "react-perf", "typescript", "unicorn"],
  rules: {
    "eslint/curly": ["error", "all"],
    "eslint/func-style": ["error", "declaration"],
    "eslint/sort-keys": "error",
    "eslint/sort-vars": "error",
  },
};

export default defineConfig(config);
