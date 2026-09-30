import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { LIFECYCLE_STATES } from '../services/findingStateMachine';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTarget, setActiveTarget] = useState('World Monitor');
  const [activeAssessmentId, setActiveAssessmentId] = useState('WM-2026-REAL');

  // Role separation support
  const [userRole, setUserRole] = useState('SECURITY_ANALYST'); // 'SECURITY_ANALYST' | 'DEVELOPER'

  const user = {
    name: userRole === 'SECURITY_ANALYST' ? 'Demo Security Analyst' : 'Lead Application Developer',
    email: userRole === 'SECURITY_ANALYST' ? 'analyst@aegisscan.internal' : 'dev@worldmonitor.internal',
    role: userRole === 'SECURITY_ANALYST' ? 'Security Product Lead' : 'Lead Developer'
  };

  const [targetProfile, setTargetProfile] = useState(null);
  const [attackSurface, setAttackSurface] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [findings, setFindings] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [latestScanResult, setLatestScanResultState] = useState(null);
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState('CONNECTING');

  // Live Assessment progress modal state
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      const health = await apiService.getHealth().catch(() => null);
      if (health && health.status === 'OK') {
        setBackendStatus('CONNECTED');
      } else {
        setBackendStatus('DISCONNECTED');
      }

      const [assessmentsRes, targetRes, surfaceRes, findingsRes, evidenceRes] = await Promise.all([
        apiService.getAssessments().catch(() => null),
        apiService.getTargetProfile().catch(() => null),
        apiService.getAttackSurface().catch(() => null),
        apiService.getFindings().catch(() => null),
        apiService.getEvidence().catch(() => null)
      ]);

      if (assessmentsRes?.success && assessmentsRes.assessments?.length > 0) {
        setAssessments(assessmentsRes.assessments);
      }
      if (targetRes?.success) setTargetProfile(targetRes.profile);
      if (surfaceRes?.success) setAttackSurface(surfaceRes.surface);
      if (findingsRes?.success) setFindings(findingsRes.findings || []);
      if (evidenceRes?.success) setEvidenceList(evidenceRes.evidence || []);

      // Also refresh audit logs
      const logsRes = await fetch('/api/audit-logs').then(r => r.json()).catch(() => null);
      if (logsRes?.success) setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to sync backend state:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const createAssessment = async (assessmentData) => {
    try {
      const res = await apiService.createAssessment(assessmentData);
      if (res.success) {
        showToast(`Assessment ${res.assessment.id} configured successfully.`, 'success');
        setActiveAssessmentId(res.assessment.id);
        setActiveTarget(res.assessment.targetName || res.assessment.name);
        await refreshData();
        return res.assessment;
      } else {
        showToast(res.error?.message || 'Failed to create assessment', 'error');
        return null;
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
      return null;
    }
  };

  const triggerAssessment = async (targetName = 'World Monitor', scopes = [], options = {}) => {
    setAssessmentModalOpen(true);
    setAssessmentProgress({ stepName: 'INITIALIZING', progressPercent: 10 });
    showToast(`Initializing target assessment for ${targetName}...`, 'info');

    try {
      setAssessmentProgress({ stepName: 'APPLICATION DISCOVERY', progressPercent: 25 });
      await new Promise(r => setTimeout(r, 300));

      setAssessmentProgress({ stepName: 'GENERATING TEST PLAN', progressPercent: 45 });
      await new Promise(r => setTimeout(r, 300));

      setAssessmentProgress({ stepName: 'EXECUTING SECURITY CHECKS (7 DOMAINS)', progressPercent: 70 });

      let res;
      if (options.assessmentId) {
        res = await apiService.executeAssessment(options.assessmentId);
      } else {
        // Create and execute in one flow
        const created = await apiService.createAssessment({
          name: targetName,
          targetUrl: options.targetUrl || 'http://localhost:3000',
          environment: options.environment || 'Authorized Local Sandbox',
          authorizationConfirmed: true,
          scopes
        });
        if (created.success) {
          res = await apiService.executeAssessment(created.assessment.id);
        } else {
          res = await apiService.startAssessment(targetName, scopes);
        }
      }

      setAssessmentProgress({ stepName: 'MAPPING CVSS RISK & OWASP FINDINGS', progressPercent: 90 });
      await new Promise(r => setTimeout(r, 300));

      if (res.success) {
        if (res.assessment) {
          setActiveAssessmentId(res.assessment.id);
          setActiveTarget(res.assessment.targetName || targetName);
        }
        await refreshData();
        setAssessmentProgress({ stepName: 'COMPLETED', progressPercent: 100, isFinished: true });
        showToast(`Security assessment completed successfully with ${res.findings?.length || 0} findings.`, 'success');
      } else {
        showToast(`Assessment failed: ${res.error?.message}`, 'error');
      }
    } catch (err) {
      showToast(`Assessment failed: ${err.message}`, 'error');
    } finally {
      setTimeout(() => {
        setAssessmentModalOpen(false);
      }, 1200);
    }
  };

  const runRealCheck = async (onProgress) => {
    showToast('Executing REAL security check against target...', 'info');
    if (onProgress) onProgress({ stepName: 'Parsing TS/JSX AST nodes...', progressPercent: 50 });

    try {
      const res = await apiService.runSecurityCheck('REAL-CHK-001');
      if (onProgress) onProgress({ stepName: 'Finalizing observations...', progressPercent: 100 });

      if (res.success) {
        setLatestScanResultState(res);
        await refreshData();
        const obsCount = res.observations ? res.observations.length : 0;
        if (obsCount > 0) {
          showToast(`Real check completed: ${obsCount} observation(s) detected in target source.`, 'warning');
        } else {
          showToast('Real check completed: 0 observations detected in target source (Condition clean).', 'success');
        }
        return res;
      } else {
        showToast(`Check failed: ${res.error?.message}`, 'error');
        return null;
      }
    } catch (err) {
      showToast(`Check failed: ${err.message}`, 'error');
      return null;
    }
  };

  const validateFinding = async (findingId, validationData = {}) => {
    if (userRole !== 'SECURITY_ANALYST') {
      showToast('Action Restricted: Only Security Analyst role can validate findings.', 'error');
      return null;
    }
    try {
      const payload = typeof validationData === 'string'
        ? { validatedBy: validationData || user.name, action: 'VALIDATE' }
        : { validatedBy: user.name, action: 'VALIDATE', ...validationData };

      const res = await apiService.validateFinding(findingId, payload);
      if (res.success) {
        const isFalsePositive = payload.action === 'MARK_FALSE_POSITIVE';
        const actionLabel = isFalsePositive ? 'marked as False Positive' : 'validated as confirmed vulnerability';
        showToast(`Finding ${findingId} ${actionLabel}.`, isFalsePositive ? 'info' : 'success');
        await refreshData();
        return res.finding;
      } else {
        showToast(res.error?.message || 'Validation failed', 'error');
      }
    } catch (err) {
      showToast(`Validation failed: ${err.message}`, 'error');
    }
    return null;
  };

  const openRemediation = async (findingId) => {
    try {
      const res = await apiService.updateRemediation(findingId, { markReadyForRetest: false, actor: user.name });
      if (res.success) {
        showToast(`Remediation opened for finding ${findingId}.`, 'info');
        await refreshData();
        return res.finding;
      }
    } catch (err) {
      showToast(`Remediation update failed: ${err.message}`, 'error');
    }
    return null;
  };

  const markReadyForRetest = async (findingId, notes = '') => {
    try {
      const res = await apiService.updateRemediation(findingId, { markReadyForRetest: true, notes, actor: user.name });
      if (res.success) {
        showToast(`Finding ${findingId} marked READY FOR RETEST.`, 'success');
        await refreshData();
        return res.finding;
      }
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
    return null;
  };

  const executeRetest = async (findingId, simulateOutcome, onStep) => {
    showToast(`Executing retest for ${findingId}...`, 'info');
    if (onStep) onStep({ stepName: 'Re-evaluating target security boundaries...', progressPercent: 40 });

    try {
      const res = await apiService.retestFinding(findingId, {
        actor: user.name,
        simulatedFix: simulateOutcome !== 'FAILED'
      });
      if (onStep) onStep({ stepName: 'Finalizing retest outcome...', progressPercent: 100 });

      if (res.success) {
        setLatestScanResultState(res.scanResult);
        await refreshData();
        const outcomeStatus = (res.finding?.status || '').toLowerCase();
        if (outcomeStatus === 'verified') {
          showToast(`Retest PASSED! Remediation verified. Finding ${findingId} → VERIFIED.`, 'success');
        } else {
          showToast(`Retest FAILED! Vulnerability still detected. Finding ${findingId} → REGRESSION.`, 'error');
        }
        return res.finding;
      } else {
        showToast(res.error?.message || 'Retest failed', 'error');
      }
    } catch (err) {
      showToast(`Retest execution failed: ${err.message}`, 'error');
    }
    return null;
  };

  const analyzeWithAI = async (findingId, observation) => {
    try {
      const res = await apiService.analyzeAI(findingId, observation);
      if (res.success) {
        await refreshData();
        return res.analysis;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const clearLatestScan = () => {
    setLatestScanResultState(null);
    showToast('Current scan result cleared from view.', 'info');
  };

  const activeAssessment = assessments.find(a => a.id === activeAssessmentId) || assessments[0] || null;

  return (
    <AppContext.Provider
      value={{
        activeTarget,
        setActiveTarget,
        activeAssessmentId,
        setActiveAssessmentId,
        activeAssessment,
        user,
        userRole,
        setUserRole,
        targetProfile,
        attackSurface,
        assessments,
        findings,
        evidenceList,
        auditLogs,
        toast,
        showToast,
        backendStatus,
        createAssessment,
        triggerAssessment,
        runRealCheck,
        latestScanResult,
        clearLatestScan,
        assessmentModalOpen,
        setAssessmentModalOpen,
        assessmentProgress,
        validateFinding,
        openRemediation,
        markReadyForRetest,
        executeRetest,
        analyzeWithAI,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
