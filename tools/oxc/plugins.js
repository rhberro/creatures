import { eslintCompatPlugin } from "@oxlint/plugins";

import noDestructuringInParams from "./rules/no-destructuring-in-params.js";
import noInlineFunctionsObjectsArrays from "./rules/no-inline-functions-objects-arrays.js";
import noJsxInlineComputation from "./rules/no-jsx-inline-computation.js";

const plugin = {
  meta: { name: "oxlint-plugins" },
  rules: {
    "no-destructuring-in-params": noDestructuringInParams,
    "no-inline-functions-objects-arrays": noInlineFunctionsObjectsArrays,
    "no-jsx-inline-computation": noJsxInlineComputation,
  },
};

export default eslintCompatPlugin(plugin);
