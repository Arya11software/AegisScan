export const initialAuditLogs = [
  {
    id: 'LOG-1001',
    timestamp: '2026-09-27T08:30:00.000Z',
    action: 'ASSESSMENT_CREATED',
    actor: 'Demo Security Analyst',
    target: 'World Monitor',
    details: 'Created assessment WM-2026-001 in Authorized Sandbox mode.'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-09-27T08:30:15.000Z',
    action: 'AUTHORIZATION_CONFIRMED',
    actor: 'Demo Security Analyst',
    target: 'World Monitor',
    details: 'Scope enforcement & non-destructive validation rules active.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-09-27T08:31:00.000Z',
    action: 'ATTACK_SURFACE_MAPPED',
    actor: 'Assessment Engine v2',
    target: 'World Monitor',
    details: 'Discovered 4 Application views, 4 API groups, 3 Security Boundaries.'
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-09-27T08:32:05.000Z',
    action: 'FINDING_VALIDATED',
    actor: 'Validation Engine',
    target: 'F-001 Authorization Weakness',
    details: 'Confirmed BOLA HTTP response anomaly with 99.4% confidence.'
  },
  {
    id: 'LOG-1005',
    timestamp: '2026-09-27T08:36:12.000Z',
    action: 'ASSESSMENT_COMPLETED',
    actor: 'Assessment Engine v2',
    target: 'World Monitor',
    details: 'Assessment WM-2026-001 completed. Risk Index calculated: 78 (Moderate).'
  }
];
