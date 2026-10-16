import { defineConfig } from "oxfmt";

// Declared as a variable instead of an inline argument to `defineConfig(...)`:
// our own no-inline-functions-objects-arrays rule rejects an object literal
// passed straight into a call.
const config = {
  ignorePatterns: ["*.md"],
  sortImports: true,
};

export default defineConfig(config);
