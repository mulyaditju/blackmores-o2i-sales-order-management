// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 1. Maintain your specialized SAP CAP scope definitions
    'scope-enum': [2, 'always', ['db', 'srv', 'app', 'cds', 'package', 'deps']],

    // 2. Adjust header constraints (<type>(<scope>): <summary>)
    'header-max-length': [2, 'always', 72],             // Enforce max 72 chars for summary line
    'subject-case': [2, 'always', 'imperative-node'],   // Forces lowercase imperative verbs (e.g., "add", not "added")

    // 3. Adjust body lines constraints
    'body-max-line-length': [2, 'always', 100],         // Restrict body lines to 100 chars max

    // 4. Require and validate structural Jira reference footprint
    'footer-leading-blank': [2, 'always'],              // Guarantees blank space ahead of footer
    'references-empty': [2, 'never'],                   // Demands that footer metadata contains a valid reference
  },
  parserPreset: {
    parserOpts: {
      // Configures parser to pick up "Refs:" as the explicit issue prefix
      issuePrefixes: ['Refs: ']
    }
  }    
};
