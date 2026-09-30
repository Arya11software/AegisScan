import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [securityChecks, setSecurityChecks] = useState([]);
  const [availableScopes, setAvailableScopes] = useState([]);
  const [scopeMap, setScopeMap] = useState({});
  const [loadingSecurityChecks, setLoadingSecurityChecks] = useState(true);
  const [securityChecksError, setSecurityChecksError] = useState(null);
  const [latestScanResult, setLatestScanResultState] = useState(null);
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState('CONNECTING');

  // Live Assessment progress modal state
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState(null);

  // Guard ref to prevent modal dismissal from causing a racing refreshData call right after assessment completion
  const skipNextModalCloseRefreshRef = useRef(false);

  const refreshData = useCallback(async () => {
    try {
      const health = await apiService.getHealth().catch(() => null);
      if (health && health.status === 'OK') {
        setBackendStatus('CONNECTED');
      } else {
        setBackendStatus('DISCONNECTED');
      }

      const [targetRes, surfaceRes, assessmentsRes, findingsRes, evidenceRes, checksRes] = await Promise.all([
        apiService.getTargetProfile().catch(() => null),
        apiService.getAttackSurface().catch(() => null),
        apiService.getAssessments().catch(() => null),
        apiService.getFindings().catch(() => null),
        apiService.getEvidence().catch(() => null),
        apiService.getSecurityChecks().catch(() => null)
      ]);

      if (targetRes?.success) setTargetProfile(targetRes.profile);
      if (surfaceRes?.success) setAttackSurface(surfaceRes.surface);

      if (assessmentsRes?.success) {
        const incomingAssessments = assessmentsRes.assessments || [];
        setAssessments(prev => {
          const incomingIds = new Set(incomingAssessments.map(a => a.id));
          const missingLocal = Array.isArray(prev)
            ? prev.filter(a => a && a.id && !incomingIds.has(a.id))
            : [];
          if (missingLocal.length === 0) return incomingAssessments;
          return [...missingLocal, ...incomingAssessments];
        });
      }

      if (findingsRes?.success) {
        const incomingFindings = findingsRes.findings || [];
        setFindings(prev => {
          const incomingIds = new Set(incomingFindings.map(f => f.id));
          const missingLocal = Array.isArray(prev)
            ? prev.filter(f => f && f.id && !incomingIds.has(f.id))
            : [];
          if (missingLocal.length === 0) return incomingFindings;
          return [...missingLocal, ...incomingFindings];
        });
      }

      if (evidenceRes?.success) {
        const incomingEvidence = evidenceRes.evidence || [];
        setEvidenceList(prev => {
          const incomingIds = new Set(incomingEvidence.map(e => e.id));
          const missingLocal = Array.isArray(prev)
            ? prev.filter(e => e && e.id && !incomingIds.has(e.id))
            : [];
          if (missingLocal.length === 0) return incomingEvidence;
          return [...missingLocal, ...incomingEvidence];
        });
      }

      if (checksRes?.success) {
        setSecurityChecks(checksRes.checks || []);
        setAvailableScopes(checksRes.scopes || Object.keys(checksRes.scopeMap || {}));
        setScopeMap(checksRes.scopeMap || {});
        setLoadingSecurityChecks(false);
        setSecurityChecksError(null);
      } else {
        setLoadingSecurityChecks(false);
        setSecurityChecksError(checksRes?.error || { message: 'Failed to load security checks from backend' });
      }
    } catch (err) {
      console.error('Failed to sync backend state:', err);
      setLoadingSecurityChecks(false);
      setSecurityChecksError({ message: err.message });
    }
  }, []);

  useEffect(() => {
    if (assessmentModalOpen) return;
    if (skipNextModalCloseRefreshRef.current) {
      skipNextModalCloseRefreshRef.current = false;
    } else {
      refreshData();
    }
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData, assessmentModalOpen]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const triggerAssessment = async (targetName = 'World Monitor', scopes = [], checkIds = []) => {
    setAssessmentModalOpen(true);
    setAssessmentProgress({
      currentStep: 1,
      totalSteps: 4,
      operation: 'INITIALIZING TARGET ASSESSMENT',
      stepName: 'INITIALIZING TARGET ASSESSMENT',
      progressPercent: 10,
      completedSteps: [],
      isFinished: false
    });
    showToast('Initializing target assessment against World Monitor...', 'info');

    try {
      setAssessmentProgress(prev => ({
        ...prev,
        currentStep: 2,
        operation: 'PROFILING TARGET REPOSITORY',
        stepName: 'PROFILING TARGET REPOSITORY',
        progressPercent: 30,
        completedSteps: ['INITIALIZING TARGET ASSESSMENT']
      }));
      await new Promise(r => setTimeout(r, 400));

      setAssessmentProgress(prev => ({
        ...prev,
        currentStep: 3,
        operation: 'SCANNING SOURCE FILES & AST NODES',
        stepName: 'SCANNING SOURCE FILES & AST NODES',
        progressPercent: 60,
        completedSteps: ['INITIALIZING TARGET ASSESSMENT', 'PROFILING TARGET REPOSITORY']
      }));

      const res = await apiService.startAssessment(targetName, scopes, checkIds);

      setAssessmentProgress(prev => ({
        ...prev,
        currentStep: 4,
        operation: 'ANALYZING SECURITY FINDINGS & AI EVIDENCE',
        stepName: 'ANALYZING SECURITY FINDINGS & AI EVIDENCE',
        progressPercent: 90,
        completedSteps: ['INITIALIZING TARGET ASSESSMENT', 'PROFILING TARGET REPOSITORY', 'SCANNING SOURCE FILES & AST NODES']
      }));
      await new Promise(r => setTimeout(r, 400));

      const resolvedId = res?.assessmentId || res?.assessment?.id;

      if (res?.success && resolvedId) {
        skipNextModalCloseRefreshRef.current = true;
        setLatestScanResultState(res.scanResult || null);
        setActiveAssessmentId(resolvedId);

        if (res.assessment) {
          setAssessments(prev => [
            res.assessment,
            ...(Array.isArray(prev) ? prev.filter(a => a && a.id !== res.assessment.id) : [])
          ]);
        }

        setAssessmentProgress(prev => ({
          ...prev,
          operation: 'COMPLETED',
          stepName: 'COMPLETED',
          progressPercent: 100,
          completedSteps: [
            'INITIALIZING TARGET ASSESSMENT',
            'PROFILING TARGET REPOSITORY',
            'SCANNING SOURCE FILES & AST NODES',
            'ANALYZING SECURITY FINDINGS & AI EVIDENCE'
          ],
          isFinished: true
        }));

        showToast(`Assessment completed successfully against ${targetName}.`, 'success');

        // Trigger background data sync without blocking navigation
        refreshData().catch(err => console.error('Background refresh error:', err));

        return {
          ...res,
          success: true,
          assessmentId: resolvedId
        };
      } else {
        showToast(`Assessment failed: ${res?.error?.message || 'Invalid assessment response from backend'}`, 'error');
        return {
          ...res,
          success: false
        };
      }
    } catch (err) {
      showToast(`Assessment failed: ${err.message}`, 'error');
      return { success: false, error: { message: err.message } };
    } finally {
      setTimeout(() => {
        setAssessmentModalOpen(false);
      }, 1200);
    }
  };

  const runRealCheck = async (onProgress) => {
    showToast('Executing REAL security check against World Monitor target...', 'info');
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

  const validateFinding = async (findingId) => {
    if (userRole !== 'SECURITY_ANALYST') {
      showToast('Action Restricted: Only Security Analyst role can validate findings.', 'error');
      return null;
    }
    try {
      const res = await apiService.validateFinding(findingId, user.name);
      if (res.success) {
        showToast(`Finding ${findingId} validated by Security Analyst.`, 'success');
        await refreshData();
        return res.finding;
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

  const markReadyForRetest = async (findingId) => {
    try {
      const res = await apiService.updateRemediation(findingId, { markReadyForRetest: true, actor: user.name });
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
    showToast(`Executing retest against target filesystem for ${findingId}...`, 'info');
    if (onStep) onStep({ stepName: 'Re-evaluating target source files...', progressPercent: 40 });

    try {
      const res = await apiService.retestFinding(findingId, user.name);
      if (onStep) onStep({ stepName: 'Finalizing retest outcome...', progressPercent: 100 });

      if (res.success) {
        setLatestScanResultState(res.scanResult);
        await refreshData();
        if (res.finding.status === 'VERIFIED') {
          showToast(`Retest PASSED! Source clean. Finding ${findingId} set to VERIFIED.`, 'success');
        } else {
          showToast(`Retest FAILED! Vulnerability still detected. Status set to REOPENED.`, 'error');
        }
        return res.finding;
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

  const resetDemo = async () => {
    try {
      const res = await apiService.resetDemo();
      if (res.success) {
        setLatestScanResultState(null);
        await refreshData();
        showToast('Backend persistent store reset to baseline state.', 'info');
      }
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    }
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
        securityChecks,
        availableScopes,
        scopeMap,
        loadingSecurityChecks,
        securityChecksError,
        toast,
        showToast,
        backendStatus,
        triggerAssessment,
        runRealCheck,
        latestScanResult,
        clearLatestScan,
        resetDemo,
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

