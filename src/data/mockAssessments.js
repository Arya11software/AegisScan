export const initialAssessments = [
  {
    id: 'WM-2026-001',
    targetName: 'World Monitor',
    targetUrl: 'https://worldmonitor.internal.sandbox',
    environment: 'Authorized Sandbox',
    status: 'COMPLETED',
    authorizedBy: 'Demo Security Analyst',
    authorizationConfirmed: true,
    createdAt: '2026-09-27T08:30:00.000Z',
    completedAt: '2026-09-27T08:36:12.000Z',
    riskIndex: 78,
    riskRating: 'Moderate',
    totalFindingsCount: 12,
    validatedCount: 9,
    retestCount: 6,
    verifiedCount: 4,
    scopes: [
      'Authentication',
      'Authorization',
      'Session Management',
      'API Security',
      'Input Validation',
      'Client Security',
      'Secure Communication',
      'Data Protection'
    ],
    coverageMetrics: {
      Authentication: 95,
      Authorization: 88,
      SessionManagement: 90,
      APISecurity: 84,
      InputValidation: 92,
      ClientSecurity: 86,
      SecureCommunication: 100,
      DataProtection: 80
    }
  }
];
