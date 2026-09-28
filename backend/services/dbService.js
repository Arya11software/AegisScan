import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('backend/data/store.json');

function ensureDbDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const DEFAULT_STORE = {
  assessments: [
    {
      id: 'WM-2026-REAL',
      targetName: 'World Monitor',
      targetUrl: 'https://github.com/koala73/worldmonitor.git',
      environment: 'Authorized Local Sandbox',
      status: 'COMPLETED',
      authorizedBy: 'Demo Security Analyst',
      authorizationConfirmed: true,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      riskIndex: 45,
      riskRating: 'Moderate',
      totalFindingsCount: 1,
      validatedCount: 1,
      retestCount: 0,
      verifiedCount: 0,
      scopes: [
        'Authentication',
        'Authorization',
        'Session Management',
        'API Security',
        'Input Validation',
        'Client Security',
        'Secure Communication',
        'Data Protection'
      ]
    }
  ],
  findings: [],
  evidence: {},
  latestScanResult: null,
  auditLogs: [
    {
      id: 'LOG-0001',
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_INIT',
      actor: 'AegisScan Backend Engine',
      target: 'World Monitor',
      details: 'Backend persistence store initialized.'
    }
  ]
};

export const dbService = {
  read() {
    ensureDbDir();
    if (!fs.existsSync(DB_FILE)) {
      this.write(DEFAULT_STORE);
      return DEFAULT_STORE;
    }
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      this.write(DEFAULT_STORE);
      return DEFAULT_STORE;
    }
  },

  write(data) {
    ensureDbDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  },

  getAssessments() {
    return this.read().assessments || [];
  },

  getAssessment(id) {
    const list = this.getAssessments();
    return list.find(a => a.id === id) || null;
  },

  saveAssessment(assessment) {
    const store = this.read();
    const idx = store.assessments.findIndex(a => a.id === assessment.id);
    if (idx >= 0) {
      store.assessments[idx] = assessment;
    } else {
      store.assessments.unshift(assessment);
    }
    this.write(store);
    return assessment;
  },

  getFindings() {
    return this.read().findings || [];
  },

  getFinding(id) {
    return this.getFindings().find(f => f.id === id) || null;
  },

  saveFinding(finding) {
    const store = this.read();
    finding.updatedAt = new Date().toISOString();
    const idx = store.findings.findIndex(f => f.id === finding.id);
    if (idx >= 0) {
      store.findings[idx] = finding;
    } else {
      store.findings.unshift(finding);
    }
    this.write(store);
    return finding;
  },

  getEvidenceMap() {
    return this.read().evidence || {};
  },

  getEvidence(id) {
    return this.getEvidenceMap()[id] || null;
  },

  saveEvidence(evidenceItem) {
    const store = this.read();
    if (!store.evidence) store.evidence = {};
    store.evidence[evidenceItem.id] = evidenceItem;
    this.write(store);
    return evidenceItem;
  },

  getLatestScanResult() {
    return this.read().latestScanResult || null;
  },

  setLatestScanResult(scanResult) {
    const store = this.read();
    store.latestScanResult = scanResult;
    this.write(store);
  },

  getAuditLogs() {
    return this.read().auditLogs || [];
  },

  addAuditLog(action, actor, target, details) {
    const store = this.read();
    const logItem = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      target,
      details
    };
    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift(logItem);
    this.write(store);
    return logItem;
  }
};
