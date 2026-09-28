import { initialAssessments } from '../data/mockAssessments';
import { initialFindings } from '../data/mockFindings';
import { initialEvidence } from '../data/mockEvidence';
import { initialChecks } from '../data/mockChecks';
import { initialAttackSurface } from '../data/mockAttackSurface';
import { initialAuditLogs } from '../data/mockAuditLogs';
import { transitionFinding, LIFECYCLE_STATES } from './findingStateMachine';

const STORAGE_KEYS = {
  ASSESSMENTS: 'aegisscan_assessments',
  FINDINGS: 'aegisscan_findings',
  EVIDENCE: 'aegisscan_evidence',
  CHECKS: 'aegisscan_checks',
  ATTACK_SURFACE: 'aegisscan_attack_surface',
  AUDIT_LOGS: 'aegisscan_audit_logs',
  LATEST_SCAN: 'aegisscan_latest_scan_result'
};

const listeners = new Set();

function notifyListeners() {
  listeners.forEach(cb => cb());
}

export const storageService = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(initialAssessments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINDINGS)) {
      localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(initialFindings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVIDENCE)) {
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(initialEvidence));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKS)) {
      localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(initialChecks));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTACK_SURFACE)) {
      localStorage.setItem(STORAGE_KEYS.ATTACK_SURFACE, JSON.stringify(initialAttackSurface));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    }
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(initialAssessments));
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(initialFindings));
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(initialEvidence));
    localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(initialChecks));
    localStorage.setItem(STORAGE_KEYS.ATTACK_SURFACE, JSON.stringify(initialAttackSurface));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    localStorage.removeItem(STORAGE_KEYS.LATEST_SCAN);
    notifyListeners();
  },

  // Latest Scan Management
  getLatestScanResult() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LATEST_SCAN);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setLatestScanResult(scanResult) {
    if (!scanResult) {
      localStorage.removeItem(STORAGE_KEYS.LATEST_SCAN);
    } else {
      localStorage.setItem(STORAGE_KEYS.LATEST_SCAN, JSON.stringify(scanResult));
      this.syncFindingWithScanResult(scanResult);
    }
    notifyListeners();
  },

  clearLatestScanResult() {
    localStorage.removeItem(STORAGE_KEYS.LATEST_SCAN);
    notifyListeners();
  },

  // Finding Synchronization (Requirement 3 & 4)
  syncFindingWithScanResult(scanResult) {
    if (!scanResult || !scanResult.check) return;
    const findingsList = this.getFindings();
    const isClean = !scanResult.observations || scanResult.observations.length === 0;

    if (!isClean && scanResult.findings && Array.isArray(scanResult.findings)) {
      scanResult.findings.forEach(newFinding => {
        const idx = findingsList.findIndex(f => f.id === newFinding.id || f.checkId === newFinding.checkId);
        newFinding.currentCondition = 'OBSERVED';
        newFinding.latestScan = {
          scannedAt: scanResult.check.timestamp,
          matchesCount: scanResult.observations.length,
          conditionStatus: 'OBSERVED',
          sourceHash: scanResult.check.sourceHash || 'N/A',
          scannedFilesCount: scanResult.check.scannedFilesCount
        };
        if (idx >= 0) {
          findingsList[idx] = {
            ...findingsList[idx],
            ...newFinding,
            status: findingsList[idx].status || newFinding.status,
            auditTrail: findingsList[idx].auditTrail || newFinding.auditTrail
          };
        } else {
          findingsList.unshift(newFinding);
        }
      });
    } else if (isClean) {
      // Mark all real check findings' currentCondition as NO_MATCH without deleting historical finding
      findingsList.forEach(f => {
        if (f.id.startsWith('F-REAL-') || f.isRealCheck || f.checkId === 'REAL-CHK-001') {
          f.currentCondition = 'NO_MATCH';
          f.latestScan = {
            scannedAt: scanResult.check.timestamp,
            matchesCount: 0,
            conditionStatus: 'NO_MATCH',
            sourceHash: scanResult.check.sourceHash || 'N/A',
            scannedFilesCount: scanResult.check.scannedFilesCount
          };
          if (f.retest) {
            f.retest.currentCondition = 'Condition Not Detected (Target Source Clean)';
          }
        }
      });
    }

    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(findingsList));
  },

  // Assessments
  getAssessments() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) || [];
    } catch {
      return initialAssessments;
    }
  },

  getAssessment(id) {
    const list = this.getAssessments();
    return list.find(a => a.id === id) || list[0];
  },

  saveAssessment(assessment) {
    const list = this.getAssessments();
    const idx = list.findIndex(a => a.id === assessment.id);
    if (idx >= 0) {
      list[idx] = assessment;
    } else {
      list.unshift(assessment);
    }
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(list));
    notifyListeners();
    return assessment;
  },

  // Findings
  getFindings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FINDINGS)) || [];
    } catch {
      return initialFindings;
    }
  },

  getFinding(id) {
    const list = this.getFindings();
    return list.find(f => f.id === id);
  },

  saveFinding(finding) {
    const list = this.getFindings();
    const idx = list.findIndex(f => f.id === finding.id);
    finding.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      list[idx] = finding;
    } else {
      list.unshift(finding);
    }
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(list));
    this.recalculateAssessmentStats(finding.assessmentId);
    notifyListeners();
    return finding;
  },

  updateFindingStatus(findingId, targetStatus, actor = 'System Engine', note = '') {
    const finding = this.getFinding(findingId);
    if (!finding) return null;

    transitionFinding(finding, targetStatus, actor, note);
    this.saveFinding(finding);
    this.addAuditLog(targetStatus, actor, findingId, note || `Transitioned ${findingId} state to ${targetStatus}`);
    return finding;
  },

  recalculateAssessmentStats(assessmentId) {
    const findings = this.getFindings().filter(f => f.assessmentId === assessmentId);
    const assessment = this.getAssessment(assessmentId);
    if (!assessment) return;

    const total = findings.length;
    const validated = findings.filter(f => f.status === LIFECYCLE_STATES.VALIDATED || f.validation?.status === 'CONFIRMED').length;
    const verified = findings.filter(f => f.status === LIFECYCLE_STATES.VERIFIED).length;
    const retest = findings.filter(f => f.status === LIFECYCLE_STATES.READY_FOR_RETEST || f.status === LIFECYCLE_STATES.RETESTED || f.status === LIFECYCLE_STATES.VERIFIED || f.status === LIFECYCLE_STATES.REOPENED).length;

    const high = findings.filter(f => f.severity === 'HIGH' && f.status !== LIFECYCLE_STATES.VERIFIED).length;
    const med = findings.filter(f => f.severity === 'MEDIUM' && f.status !== LIFECYCLE_STATES.VERIFIED).length;
    const low = findings.filter(f => f.severity === 'LOW' && f.status !== LIFECYCLE_STATES.VERIFIED).length;

    const rawScore = (high * 25) + (med * 10) + (low * 2);
    const riskIndex = Math.max(10, Math.min(98, rawScore));
    const riskRating = riskIndex > 75 ? 'High' : riskIndex > 45 ? 'Moderate' : 'Low';

    assessment.totalFindingsCount = total;
    assessment.validatedCount = validated;
    assessment.verifiedCount = verified;
    assessment.retestCount = retest;
    assessment.riskIndex = riskIndex;
    assessment.riskRating = riskRating;

    const list = this.getAssessments();
    const idx = list.findIndex(a => a.id === assessmentId);
    if (idx >= 0) {
      list[idx] = assessment;
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(list));
    }
  },

  // Evidence
  getEvidenceMap() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVIDENCE)) || {};
    } catch {
      return initialEvidence;
    }
  },

  getEvidence(evidenceId) {
    const map = this.getEvidenceMap();
    return map[evidenceId] || null;
  },

  // Security Checks & Attack Surface
  getChecks() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKS)) || [];
    } catch {
      return initialChecks;
    }
  },

  getAttackSurface() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTACK_SURFACE)) || initialAttackSurface;
    } catch {
      return initialAttackSurface;
    }
  },

  // Audit Logs
  getAuditLogs() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || [];
    } catch {
      return initialAuditLogs;
    }
  },

  addAuditLog(action, actor, target, details) {
    const logs = this.getAuditLogs();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      target,
      details
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    notifyListeners();
    return newLog;
  }
};

