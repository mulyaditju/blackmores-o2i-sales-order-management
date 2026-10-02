// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Optional: Add custom rules or specific CAP scopes here
    'scope-enum': [2, 'always', ['db', 'srv', 'app', 'cds', 'package', 'deps']],
  },
};
