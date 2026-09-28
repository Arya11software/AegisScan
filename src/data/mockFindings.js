export const initialFindings = [
  {
    id: 'F-001',
    assessmentId: 'WM-2026-001',
    targetId: 'world-monitor',
    targetName: 'World Monitor',
    title: 'Authorization Boundary Bypass on User Metrics Endpoint',
    category: 'Authorization',
    severity: 'HIGH',
    status: 'VALIDATED', // DETECTED | EVIDENCE_COLLECTED | AI_ANALYZED | VALIDATED | REMEDIATION_OPEN | READY_FOR_RETEST | RETESTED | VERIFIED | REOPENED
    component: 'User API & Dashboard Boundary',
    description: 'Server-side authorization controls fail to validate granular user role privileges when requesting sensitive metrics endpoints.',
    impact: 'An authenticated user with standard tier access can access administrator analytics resources by manipulating resource IDs.',
    technicalImpact: 'Broken Object Level Authorization (BOLA / IDOR) allows unauthorized data readout.',
    businessImpact: 'Exposure of high-value internal monitoring data to unauthorized internal standard-role accounts.',
    rootCause: 'Authorization is not consistently enforced at the server-side resource boundary. Access checks rely on client-side state flags.',
    
    evidence: [
      {
        id: 'EVD-001-A',
        ruleEvaluated: 'AZ-002',
        source: 'World Monitor (/src/api/metrics.ts)',
        observation: 'Endpoint /api/v1/metrics/admin-summary accepts standard analyst bearer tokens without HTTP 403 response.',
        request: 'GET /api/v1/metrics/admin-summary HTTP/1.1\nAuthorization: Bearer standard-analyst-token\nHost: worldmonitor.local',
        response: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"adminMetrics": {"activeAlerts": 14, "clusterLoad": "84%"}}',
        timestamp: '2026-09-27T08:32:10.000Z'
      }
    ],

    validation: {
      status: 'CONFIRMED',
      confidence: 'High (98%)',
      validatedBy: 'Demo Security Analyst',
      validatedAt: '2026-09-27T08:35:00.000Z'
    },

    aiAnalysis: {
      technicalContext: 'Static AST & HTTP log trace inspection identified client-side entitlement check pattern instead of server middleware enforcement.',
      businessImpact: 'Operational risk level evaluated as HIGH. Recommending response SLA within current release cycle.',
      remediationGuidance: 'Enforce server-side role permission matrix on API endpoint controllers before querying metrics data.'
    },

    remediation: {
      status: 'OPEN',
      recommendation: 'Enforce server-side authorization before returning protected resources.',
      implementationSteps: [
        '1. Resolve authenticated identity from secure session token.',
        '2. Query user role and active permission matrix on API endpoint middleware.',
        '3. Verify resource ownership or explicit authorization scope prior to fetching data.',
        '4. Deny unauthorized requests with 403 Forbidden status code.',
        '5. Add regression test suite for cross-role resource boundary validation.'
      ],
      assignedRole: 'DEVELOPER',
      updatedAt: '2026-09-27T08:36:00.000Z'
    },

    retest: {
      status: 'PENDING',
      previousCondition: 'Condition Detected (HTTP 200 OK with admin summary payload)',
      currentCondition: null,
      executedBy: null,
      executedAt: null
    },

    verification: {
      status: 'PENDING',
      finalNote: null
    },

    auditTrail: [
      {
        timestamp: '2026-09-27T08:32:10.000Z',
        action: 'DETECTED',
        actor: 'Rule Scanner (AZ-002)',
        details: 'Initial security signal detected on /api/v1/metrics/admin-summary'
      },
      {
        timestamp: '2026-09-27T08:33:15.000Z',
        action: 'EVIDENCE_COLLECTED',
        actor: 'Evidence Collector Engine',
        details: 'Recorded HTTP request and response payload (EVD-001-A)'
      },
      {
        timestamp: '2026-09-27T08:34:00.000Z',
        action: 'AI_ANALYZED',
        actor: 'AI Security Analyzer',
        details: 'Generated technical context and business impact evaluation'
      },
      {
        timestamp: '2026-09-27T08:35:00.000Z',
        action: 'VALIDATED',
        actor: 'Demo Security Analyst',
        details: 'Analyst validated evidence and confirmed vulnerability status'
      }
    ]
  },
  {
    id: 'F-002',
    assessmentId: 'WM-2026-001',
    targetId: 'world-monitor',
    targetName: 'World Monitor',
    title: 'Client-Side Configuration Secret Exposure',
    category: 'Configuration',
    severity: 'HIGH',
    status: 'READY_FOR_RETEST',
    component: 'Client Bundle & Telemetry Boundary',
    description: 'Exported client configuration object contains raw API key in browser bundle scope.',
    impact: 'Allows arbitrary client callers to read internal telemetry configuration params.',
    technicalImpact: 'Client environment variable leakage.',
    businessImpact: 'Unnecessary exposure of internal telemetry API keys.',
    rootCause: 'Raw API key string exported in client-accessible TypeScript file.',

    evidence: [
      {
        id: 'EVD-002-A',
        ruleEvaluated: 'CONFIG-001',
        source: 'World Monitor (/src/config/clientEnv.ts)',
        observation: 'Exported client configuration object contains raw API key in browser bundle scope.',
        request: 'GET /api/config/telemetry HTTP/1.1\nHost: worldmonitor.local',
        response: 'HTTP/1.1 200 OK\n\n{"clientConfig":{"apiKey":"wm_live_key_99812"}}',
        timestamp: '2026-09-27T08:33:00.000Z'
      }
    ],

    validation: {
      status: 'CONFIRMED',
      confidence: 'High (95%)',
      validatedBy: 'Demo Security Analyst',
      validatedAt: '2026-09-27T08:35:10.000Z'
    },

    aiAnalysis: {
      technicalContext: 'Static rule inspection identified client-side export of sensitive API secret key.',
      businessImpact: 'Internal telemetry key parameters exposed in public script context.',
      remediationGuidance: 'Move secret key values to server-side process.env boundaries.'
    },

    remediation: {
      status: 'READY_FOR_RETEST',
      recommendation: 'Move sensitive configuration from client-accessible context to a secure server-side environment.',
      implementationSteps: [
        '1. Remove raw API key string from clientEnv.ts',
        '2. Expose proxy endpoint for client telemetry',
        '3. Inject public key at build time'
      ],
      assignedRole: 'DEVELOPER',
      updatedAt: '2026-09-27T08:38:00.000Z'
    },

    retest: {
      status: 'READY',
      previousCondition: 'Condition Detected (HTTP 200 OK with raw API key string)',
      currentCondition: null,
      executedBy: null,
      executedAt: null
    },

    verification: {
      status: 'PENDING',
      finalNote: null
    },

    auditTrail: [
      {
        timestamp: '2026-09-27T08:33:00.000Z',
        action: 'DETECTED',
        actor: 'Rule Scanner (CONFIG-001)',
        details: 'Finding detected in clientEnv.ts'
      },
      {
        timestamp: '2026-09-27T08:34:00.000Z',
        action: 'EVIDENCE_COLLECTED',
        actor: 'Evidence Engine',
        details: 'Captured response payload with raw API key'
      },
      {
        timestamp: '2026-09-27T08:35:10.000Z',
        action: 'VALIDATED',
        actor: 'Demo Security Analyst',
        details: 'Finding validated by Security Analyst'
      },
      {
        timestamp: '2026-09-27T08:38:00.000Z',
        action: 'READY_FOR_RETEST',
        actor: 'Developer Lead',
        details: 'Developer marked fix ready for retest execution'
      }
    ]
  },
  {
    id: 'F-003',
    assessmentId: 'WM-2026-001',
    targetId: 'world-monitor',
    targetName: 'World Monitor',
    title: 'Excessive API Data Exposure in Node Telemetry Response',
    category: 'API Security',
    severity: 'MEDIUM',
    status: 'VERIFIED',
    component: 'Data REST API',
    description: 'API endpoint `/api/v1/monitor/nodes` previously returned full diagnostic payload including internal IP ranges.',
    impact: 'Resolved: Endpoint DTO filter verified operational.',
    technicalImpact: 'Internal infrastructure disclosure assisting attack surface mapping.',
    businessImpact: 'Unnecessary exposure of internal network topology details.',
    rootCause: 'API DTO models directly serialized underlying database entities.',

    evidence: [
      {
        id: 'EVD-003-A',
        ruleEvaluated: 'DATA-001',
        source: 'World Monitor (/src/api/nodes.ts)',
        observation: 'Initial scan revealed internal IP address fields in response DTO.',
        request: 'GET /api/v1/monitor/nodes HTTP/1.1',
        response: 'HTTP/1.1 200 OK\n\n{"nodes": [{"name": "Node-1", "internalIp": "10.0.4.12"}]}',
        timestamp: '2026-09-26T14:00:00.000Z'
      }
    ],

    validation: {
      status: 'CONFIRMED',
      confidence: 'High (99%)',
      validatedBy: 'Demo Security Analyst',
      validatedAt: '2026-09-26T14:15:00.000Z'
    },

    aiAnalysis: {
      technicalContext: 'DTO serializer lacked view boundary filtering.',
      businessImpact: 'Internal IP range disclosure.',
      remediationGuidance: 'Strip internal IP fields for non-admin callers.'
    },

    remediation: {
      status: 'READY_FOR_RETEST',
      recommendation: 'Implement response DTO filtering to omit internal IP fields.',
      implementationSteps: ['1. Applied RestrictedNodeDTO.'],
      assignedRole: 'DEVELOPER',
      updatedAt: '2026-09-26T16:00:00.000Z'
    },

    retest: {
      status: 'PASSED',
      previousCondition: 'Condition Detected (Internal IP payload returned)',
      currentCondition: 'Condition Not Detected (Verified Clean Restricted Payload)',
      executedBy: 'Retest Engine',
      executedAt: '2026-09-27T07:00:00.000Z'
    },

    verification: {
      status: 'VERIFIED',
      finalNote: 'Vulnerability verified resolved via automated retest runner.'
    },

    auditTrail: [
      {
        timestamp: '2026-09-26T14:00:00.000Z',
        action: 'DETECTED',
        actor: 'Rule Scanner (DATA-001)',
        details: 'Initial detection'
      },
      {
        timestamp: '2026-09-27T07:00:00.000Z',
        action: 'VERIFIED',
        actor: 'Retest Engine',
        details: 'Retest PASSED. Finding status set to VERIFIED.'
      }
    ]
  }
];
