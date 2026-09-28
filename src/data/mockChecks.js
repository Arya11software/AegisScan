export const initialChecks = [
  {
    category: 'AUTHENTICATION',
    description: 'Verify login mechanisms, password rules, token generation, and expiry policy.',
    items: [
      { id: 'CHK-AUTH-01', name: 'Session Token Expiry Policy', status: 'PASSED', evidenceId: 'EVD-AUTH-01', findingId: null },
      { id: 'CHK-AUTH-02', name: 'Password Complexity Validation', status: 'PASSED', evidenceId: 'EVD-AUTH-02', findingId: null },
      { id: 'CHK-AUTH-03', name: 'Authentication Rate Limiting', status: 'PASSED', evidenceId: 'EVD-AUTH-03', findingId: null },
      { id: 'CHK-AUTH-04', name: 'Multi-Factor Session Enforcement', status: 'PASSED', evidenceId: 'EVD-AUTH-04', findingId: null }
    ]
  },
  {
    category: 'AUTHORIZATION',
    description: 'Verify role separation, permission checks, BOLA/IDOR protection, and object boundaries.',
    items: [
      { id: 'CHK-AZ-01', name: 'Granular Role Permission Check', status: 'FLAGGED', evidenceId: 'EVD-001-A', findingId: 'F-001' },
      { id: 'CHK-AZ-02', name: 'Horizontal Privilege Escalation', status: 'FLAGGED', evidenceId: 'EVD-001-B', findingId: 'F-001' },
      { id: 'CHK-AZ-03', name: 'Vertical Admin API Boundary', status: 'PASSED', evidenceId: 'EVD-AZ-03', findingId: null }
    ]
  },
  {
    category: 'SESSION MANAGEMENT',
    description: 'Verify cookie security flags, session revocation, token signatures, and timeout.',
    items: [
      { id: 'CHK-SESS-01', name: 'Cookie Security Flags (SameSite / Secure)', status: 'FLAGGED', evidenceId: 'EVD-002-A', findingId: 'F-002' },
      { id: 'CHK-SESS-02', name: 'Session Invalidation on Logout', status: 'PASSED', evidenceId: 'EVD-SESS-02', findingId: null }
    ]
  },
  {
    category: 'API SECURITY',
    description: 'Verify payload sanitization, field level filtering, CORS configuration, and REST boundaries.',
    items: [
      { id: 'CHK-API-01', name: 'DTO Response Object Serialization', status: 'FLAGGED', evidenceId: 'EVD-003-A', findingId: 'F-003' },
      { id: 'CHK-API-02', name: 'API HTTP Verb Authorization', status: 'PASSED', evidenceId: 'EVD-API-02', findingId: null }
    ]
  },
  {
    category: 'INPUT VALIDATION',
    description: 'Verify SQL/NoSQL injection, XSS filtering, path traversal, and structured schema checks.',
    items: [
      { id: 'CHK-INP-01', name: 'Query String Parameter Sanitization', status: 'FLAGGED', evidenceId: 'EVD-004-A', findingId: 'F-004' },
      { id: 'CHK-INP-02', name: 'JSON Schema Request Body Validation', status: 'PASSED', evidenceId: 'EVD-INP-02', findingId: null }
    ]
  },
  {
    category: 'CLIENT SECURITY',
    description: 'Verify CSP rules, frame options, local storage hygiene, and client JS integrity.',
    items: [
      { id: 'CHK-CLI-01', name: 'HTTP Security Headers (CSP & X-Frame)', status: 'FLAGGED', evidenceId: 'EVD-005-A', findingId: 'F-005' },
      { id: 'CHK-CLI-02', name: 'Browser Local Storage Data Sanitization', status: 'POTENTIAL', evidenceId: 'EVD-006-A', findingId: 'F-006' }
    ]
  },
  {
    category: 'DATA PROTECTION',
    description: 'Verify server header banner leaks, TLS transport suite, and sensitive data masking.',
    items: [
      { id: 'CHK-DAT-01', name: 'HTTP Response Banner Information Disclosure', status: 'FLAGGED', evidenceId: 'EVD-007-A', findingId: 'F-007' },
      { id: 'CHK-DAT-02', name: 'TLS 1.3 Cipher Suite Transport Protection', status: 'PASSED', evidenceId: 'EVD-DAT-02', findingId: null }
    ]
  }
];
