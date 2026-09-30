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

  // ==========================================
  // Assessment Pipeline APIs
  // ==========================================

  async getAssessments() {
    const res = await fetch('/api/assessments');
    return res.json();
  },

  async createAssessment(assessmentData) {
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    return res.json();
  },

  async getAssessment(id) {
    const res = await fetch(`/api/assessments/${id}`);
    return res.json();
  },

  async authorizeAssessment(id, authorizationData = {}) {
    const res = await fetch(`/api/assessments/${id}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authorizationData)
    });
    return res.json();
  },

  async discoverAssessment(id) {
    const res = await fetch(`/api/assessments/${id}/discover`, {
      method: 'POST'
    });
    return res.json();
  },

  async generateTestPlan(id) {
    const res = await fetch(`/api/assessments/${id}/test-plan`, {
      method: 'POST'
    });
    return res.json();
  },

  async executeAssessment(id) {
    const res = await fetch(`/api/assessments/${id}/start`, {
      method: 'POST'
    });
    return res.json();
  },

  async getAssessmentProgress(id) {
    const res = await fetch(`/api/assessments/${id}/progress`);
    return res.json();
  },

  async getAssessmentFindings(id) {
    const res = await fetch(`/api/assessments/${id}/findings`);
    return res.json();
  },

  async getAssessmentReport(id) {
    const res = await fetch(`/api/assessments/${id}/report`);
    return res.json();
  },

  // Legacy start compatibility
  async startAssessment(targetName = 'World Monitor', scopes = []) {
    const res = await fetch('/api/assessment/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetName, scopes })
    });
    return res.json();
  },

  // ==========================================
  // Findings, Evidence, Validation & Retest
  // ==========================================

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

  async validateFinding(id, validationData = {}) {
    const payload = typeof validationData === 'string'
      ? { validatedBy: validationData, action: 'VALIDATE' }
      : validationData;

    const res = await fetch(`/api/findings/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async updateRemediation(id, { markReadyForRetest = false, recommendation = '', notes = '', actor = 'Developer' }) {
    const res = await fetch(`/api/findings/${id}/remediation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markReadyForRetest, recommendation, notes, actor })
    });
    return res.json();
  },

  async retestFinding(id, options = {}) {
    const payload = typeof options === 'string'
      ? { actor: options }
      : options;

    const res = await fetch(`/api/findings/${id}/retest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
