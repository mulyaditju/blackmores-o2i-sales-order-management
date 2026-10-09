import cdsPlugin from '@sap/eslint-plugin-cds';
import globals from 'globals';
import js from '@eslint/js';
import cdsEslint from '@sap/eslint-plugin-cds';

export default [
  // 1. Global Ignores (SAP recommended directory list)
  {
    ignores: [
      'node_modules/',
      '_out/',
      'mta_archives/',
      'gen/',
      'db/src/gen/',
      '@cds-models/*', // Ignore typed proxies if generated
    ],
  },

  // 2. Base Javascript Configuration
  js.configs.recommended,

  // 3. Official SAP CAP Rules Configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.vitest,
        // Runtime Framework Globals
        cds: 'readonly',
        SELECT: 'readonly',
        INSERT: 'readonly',
        UPDATE: 'readonly',
        DELETE: 'readonly',
        CREATE: 'readonly',
        DROP: 'readonly',
      },
    },
    plugins: {
      '@sap/cds': cdsPlugin,
    },
    // Merges recommended SAP Rules with your strict rules
    rules: {
      ...cdsPlugin.configs.recommended.rules,
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-await-in-loop': 'error',
      'require-await': 'warn',
      'no-return-await': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      complexity: ['error', 12],
      'max-lines-per-function': ['warn', 210],
      'max-depth': ['error', 3],
      camelcase: ['error', { properties: 'never', allow: ['^[a-z]+_[a-z]+$'] }],
      'quotes': 'off', 
      // Optional: Turn on specialized SAP Editor rules via the CLI
      '@sap/cds/valid-csv-header': ['warn', 'show'],
    },
  },

  // 4. OWASP A01 & A05: SAP CDS Security Architecture Ruleset
  // This automatically scans all .cds files for unauthenticated endpoints
  cdsEslint.configs.recommended
];