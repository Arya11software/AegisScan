export const initialEvidence = {
  'EVD-001-A': {
    id: 'EVD-001-A',
    findingId: 'F-001',
    title: 'BOLA Authorization Bypass HTTP Evidence',
    testContext: {
      target: 'World Monitor Sandbox',
      endpoint: '/api/v1/metrics/admin-summary',
      method: 'GET',
      tester: 'Demo Security Analyst',
      timestamp: '2026-09-27T08:32:05.000Z',
      authorizationState: 'Authorized Standard Account Token (Role: Standard Analyst)'
    },
    request: {
      url: 'https://worldmonitor.internal.sandbox/api/v1/metrics/admin-summary?targetId=WM-GLOBAL-01',
      headers: {
        'Host': 'worldmonitor.internal.sandbox',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sub123_Role_Standard',
        'User-Agent': 'AegisScan-Validation-Engine/2.0 (Authorized Audit)',
        'Accept': 'application/json'
      },
      body: null
    },
    response: {
      status: 200,
      statusText: '200 OK (UNEXPECTED PERMISSION PASS)',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Powered-By': 'Express',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        scope: 'GLOBAL_ADMINISTRATIVE_METRICS',
        sensitiveMetrics: {
          totalMonitoredAssets: 1420,
          privilegedNodeCredentialsActive: 48,
          internalSubnetsMapped: ['10.240.0.0/16', '172.16.4.0/24'],
          adminAuditTokens: ['ADM-8831', 'ADM-9920']
        }
      }, null, 2)
    },
    validationResult: {
      expectedBehavior: '403 Forbidden - Access Denied for standard analyst token on global admin resource.',
      observedBehavior: '200 OK - HTTP payload returned global administrative metrics to standard token.',
      ruleEvaluated: 'AUTH_RULE_04: Server-side RBAC validation on /api/v1/metrics/admin-*',
      ruleResult: 'VIOLATION_CONFIRMED',
      confidenceScore: '99.4% (Deterministic Controlled Match)'
    }
  },
  'EVD-001-B': {
    id: 'EVD-001-B',
    findingId: 'F-001',
    title: 'Secondary IDOR Resource Access Proof',
    testContext: {
      target: 'World Monitor Sandbox',
      endpoint: '/api/v1/reports/export/raw',
      method: 'POST',
      tester: 'Demo Security Analyst',
      timestamp: '2026-09-27T08:32:09.000Z',
      authorizationState: 'Authorized Standard Account Token'
    },
    request: {
      url: 'https://worldmonitor.internal.sandbox/api/v1/reports/export/raw',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sub123'
      },
      body: JSON.stringify({ reportId: 'RP-ADMIN-9901', format: 'json' }, null, 2)
    },
    response: {
      status: 200,
      statusText: '200 OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: 'RP-ADMIN-9901', owner: 'root@internal', content: 'SYSTEM_AUDIT_DUMP' }, null, 2)
    },
    validationResult: {
      expectedBehavior: '403 Forbidden',
      observedBehavior: '200 OK with admin report body',
      ruleEvaluated: 'RESOURCE_OWNERSHIP_RULE_01',
      ruleResult: 'VIOLATION_CONFIRMED',
      confidenceScore: '100%'
    }
  },
  'EVD-002-A': {
    id: 'EVD-002-A',
    findingId: 'F-002',
    title: 'Session Cookie Header Inspection',
    testContext: {
      target: 'World Monitor Sandbox',
      endpoint: '/api/v1/auth/login',
      method: 'POST',
      tester: 'Demo Security Analyst',
      timestamp: '2026-09-27T08:33:00.000Z',
      authorizationState: 'Unauthenticated -> Login Attempt'
    },
    request: {
      url: 'https://worldmonitor.internal.sandbox/api/v1/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo_analyst', password: '***' })
    },
    response: {
      status: 200,
      statusText: '200 OK',
      headers: {
        'Set-Cookie': 'wm_session=sess_9938102381; Path=/; HttpOnly',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'authenticated' })
    },
    validationResult: {
      expectedBehavior: 'Set-Cookie header must include `Secure` and `SameSite=Strict`',
      observedBehavior: 'Set-Cookie missing `Secure` and `SameSite` parameters',
      ruleEvaluated: 'COOKIE_SEC_RULE_02',
      ruleResult: 'FLAGGED_MISSING_ATTRIBUTES',
      confidenceScore: '100%'
    }
  }
};
