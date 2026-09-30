// AegisScan API Service for Express Backend Communication

async function safeFetchJson(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${res.status}`,
          message: `Backend API returned HTTP ${res.status}: ${res.statusText}`
        }
      };
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE_TYPE',
          message: `Backend API returned non-JSON content-type (${contentType})`
        }
      };
    }
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to AegisScan backend'
      }
    };
  }
}

export const apiService = {
  async getHealth() {
    return safeFetchJson('/api/health');
  },

  async getTargetProfile() {
    return safeFetchJson('/api/target');
  },

  async reProfileTarget() {
    return safeFetchJson('/api/target/profile', { method: 'POST' });
  },

  async getAttackSurface() {
    return safeFetchJson('/api/attack-surface');
  },

  async getSecurityChecks() {
    return safeFetchJson('/api/security-checks');
  },

  async runSecurityCheck(checkId = 'REAL-CHK-001') {
    return safeFetchJson('/api/security-checks/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkId })
    });
  },

  async startAssessment(targetName = 'World Monitor', scopes = [], checkIds = []) {
    return safeFetchJson('/api/assessment/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetName, scopes, checkIds })
    });
  },

  async getAssessments() {
    return safeFetchJson('/api/assessments');
  },

  async getAssessment(id) {
    return safeFetchJson(`/api/assessment/${id}`);
  },

  async resetDemo() {
    return safeFetchJson('/api/reset-demo', { method: 'POST' });
  },

  async getFindings() {
    return safeFetchJson('/api/findings');
  },

  async getFinding(id) {
    return safeFetchJson(`/api/findings/${id}`);
  },

  async getEvidence() {
    return safeFetchJson('/api/evidence');
  },

  async getEvidenceItem(id) {
    return safeFetchJson(`/api/evidence/${id}`);
  },

  async validateFinding(id, validatedBy = 'Security Analyst') {
    return safeFetchJson(`/api/findings/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validatedBy })
    });
  },

  async updateRemediation(id, { markReadyForRetest = false, recommendation = '', actor = 'Developer' }) {
    return safeFetchJson(`/api/findings/${id}/remediation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markReadyForRetest, recommendation, actor })
    });
  },

  async retestFinding(id, actor = 'Retest Engine') {
    return safeFetchJson(`/api/findings/${id}/retest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor })
    });
  },

  async analyzeAI(findingId, observation = {}) {
    return safeFetchJson('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ findingId, observation })
    });
  },

  async getReport(assessmentId = 'WM-2026-REAL') {
    return safeFetchJson(`/api/reports/${assessmentId}`);
  }
};
