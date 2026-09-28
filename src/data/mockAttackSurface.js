export const initialAttackSurface = {
  target: 'World Monitor',
  applications: [
    { id: 'APP-01', name: 'Frontend Single Page App', component: 'React Single Page App', status: 'Assessed', boundary: 'Public', evidenceAvailable: true },
    { id: 'APP-02', name: 'Authentication Portal', component: 'OAuth2 / Session Gateway', status: 'Assessed', boundary: 'Public / Auth Gateway', evidenceAvailable: true },
    { id: 'APP-03', name: 'Operations Dashboard', component: 'Security Ops Console', status: 'Assessed', boundary: 'Authenticated', evidenceAvailable: true },
    { id: 'APP-04', name: 'Map & Data Layer', component: 'GIS / Interactive Map Engine', status: 'Assessed', boundary: 'Authenticated', evidenceAvailable: true }
  ],
  apis: [
    { id: 'API-01', name: 'Authentication API', endpoint: '/api/v1/auth/*', status: 'Assessed', boundary: 'Public', evidenceAvailable: true, findingsCount: 1 },
    { id: 'API-02', name: 'User Management API', endpoint: '/api/v1/users/*', status: 'Assessed', boundary: 'Authenticated', evidenceAvailable: true, findingsCount: 1 },
    { id: 'API-03', name: 'Metrics & Analytics API', endpoint: '/api/v1/metrics/*', status: 'Assessed', boundary: 'Privileged / Admin', evidenceAvailable: true, findingsCount: 1 },
    { id: 'API-04', name: 'Reporting Engine API', endpoint: '/api/v1/reports/*', status: 'Assessed', boundary: 'Authenticated', evidenceAvailable: true, findingsCount: 1 }
  ],
  securityBoundaries: [
    { id: 'BND-01', name: 'Public Perimeter Gateway', exposure: 'Internet Facing', status: 'Discovered & Assessed', riskLevel: 'Low' },
    { id: 'BND-02', name: 'Authenticated Session Perimeter', exposure: 'Role-Gated Access', status: 'Assessed - Vulnerability Found', riskLevel: 'High' },
    { id: 'BND-03', name: 'Internal Data Tier Boundary', exposure: 'VPC Internal Subnet', status: 'Assessed - Boundary Integrity Validated', riskLevel: 'Medium' }
  ]
};
