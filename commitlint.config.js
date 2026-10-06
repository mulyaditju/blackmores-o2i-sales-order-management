// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 1. Maintain your specialized SAP CAP scope definitions
    'scope-enum': [2, 'always', ['db', 'srv', 'app', 'cds', 'package', 'deps']],

    // 2. Adjust header constraints (<type>(<scope>): <summary>)
    'header-max-length': [2, 'always', 72],             // Enforce max 72 chars for summary line
    'subject-case': [2, 'always', 'lower-case'],   // Forces lowercase imperative verbs (e.g., "add", not "added")

    // 3. Adjust body lines constraints
    'body-max-line-length': [2, 'always', 100],         // Restrict body lines to 100 chars max

    // 4. Require and validate structural Jira reference footprint
    'footer-leading-blank': [2, 'always'],              // Guarantees blank space ahead of footer
    'references-empty': [2, 'never'],                   // Demands that footer metadata contains a valid reference
  },
  parserPreset: {
    parserOpts: {
      // 1. Point this strictly to your tracking identifier code sequence
      issuePrefixes: ['CAP-'],
      // 2. Set this to null so it doesn't strictly force GitHub keywords (like close/fix)
      referenceActions: null 
    }
  }    
};
