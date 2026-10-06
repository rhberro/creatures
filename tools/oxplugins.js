import { eslintCompatPlugin } from "@oxlint/plugins";

import noDestructuringInParams from "./oxlint-plugins/no-destructuring-in-params.js";
import noInlineFunctionsObjectsArrays from "./oxlint-plugins/no-inline-functions-objects-arrays.js";
import noJsxInlineComputation from "./oxlint-plugins/no-jsx-inline-computation.js";

const plugin = {
  meta: { name: "oxplugins" },
  rules: {
    "no-destructuring-in-params": noDestructuringInParams,
    "no-inline-functions-objects-arrays": noInlineFunctionsObjectsArrays,
    "no-jsx-inline-computation": noJsxInlineComputation,
  },
};

export default eslintCompatPlugin(plugin);
