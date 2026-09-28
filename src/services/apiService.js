// AegisScan API Service for Express Backend Communication

export const apiService = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getTargetProfile() {
    const res = await fetch('/api/target');
    return res.json();
  },

  async reProfileTarget() {
    const res = await fetch('/api/target/profile', { method: 'POST' });
    return res.json();
  },

  async getAttackSurface() {
    const res = await fetch('/api/attack-surface');
    return res.json();
  },

  async getSecurityChecks() {
    const res = await fetch('/api/security-checks');
    return res.json();
  },

  async runSecurityCheck(checkId = 'REAL-CHK-001') {
    const res = await fetch('/api/security-checks/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkId })
    });
    return res.json();
  },

  async startAssessment(targetName = 'World Monitor', scopes = []) {
    const res = await fetch('/api/assessment/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetName, scopes })
    });
    return res.json();
  },

  async getAssessment(id) {
    const res = await fetch(`/api/assessment/${id}`);
    return res.json();
  },

  async getFindings() {
    const res = await fetch('/api/findings');
    return res.json();
  },

  async getFinding(id) {
    const res = await fetch(`/api/findings/${id}`);
    return res.json();
  },

  async getEvidence() {
    const res = await fetch('/api/evidence');
    return res.json();
  },

  async getEvidenceItem(id) {
    const res = await fetch(`/api/evidence/${id}`);
    return res.json();
  },

  async validateFinding(id, validatedBy = 'Security Analyst') {
    const res = await fetch(`/api/findings/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validatedBy })
    });
    return res.json();
  },

  async updateRemediation(id, { markReadyForRetest = false, recommendation = '', actor = 'Developer' }) {
    const res = await fetch(`/api/findings/${id}/remediation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markReadyForRetest, recommendation, actor })
    });
    return res.json();
  },

  async retestFinding(id, actor = 'Retest Engine') {
    const res = await fetch(`/api/findings/${id}/retest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor })
    });
    return res.json();
  },

  async analyzeAI(findingId, observation = {}) {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ findingId, observation })
    });
    return res.json();
  },

  async getReport(assessmentId = 'WM-2026-REAL') {
    const res = await fetch(`/api/reports/${assessmentId}`);
    return res.json();
  }
};
