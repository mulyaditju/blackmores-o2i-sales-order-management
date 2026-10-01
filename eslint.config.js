import cdsPlugin from "@sap/eslint-plugin-cds";
import globals from "globals";
import js from "@eslint/js";

export default [
  // 1. Global Ignores (SAP recommended directory list)
  {
    ignores: [
      "node_modules/",
      "_out/",
      "mta_archives/",
      "gen/",
      "db/src/gen/",
      "@cds-models/*" // Ignore typed proxies if generated
    ]
  },
  
  // 2. Base Javascript Configuration
  js.configs.recommended,
  
  // 3. Official SAP CAP Rules Configuration
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
        // Runtime Framework Globals
        cds: "readonly",
        SELECT: "readonly",
        INSERT: "readonly",
        UPDATE: "readonly",
        DELETE: "readonly",
        CREATE: "readonly",
        DROP: "readonly"
      },
    },
    plugins: {
      "@sap/cds": cdsPlugin,
    },
    // Merges recommended SAP Rules with your strict rules
    rules: {
      ...cdsPlugin.configs.recommended.rules, 
      "no-console": "warn",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "eqeqeq": "error",
      
      // Optional: Turn on specialized SAP Editor rules via the CLI
      "@sap/cds/valid-csv-header": ["warn", "show"]
    },
  }
];