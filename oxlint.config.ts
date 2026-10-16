import { oxsomePluginEntry, oxsomeRules } from "@rhberro/oxsome";
import { defineConfig } from "oxlint";

// Declared as a variable instead of an inline argument to
// `defineConfig(...)`: our own no-inline-functions-objects-arrays rule
// rejects an object literal passed straight into a call.
const config = {
  categories: {
    correctness: "error",
    nursery: "error",
    pedantic: "error",
    restriction: "error",
    // style: "error",
    suspicious: "error",
  },
  extends: [oxsomeRules],
  globals: {
    document: "readonly",
  },
  ignorePatterns: ["*.d.ts"],
  jsPlugins: [oxsomePluginEntry],
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
