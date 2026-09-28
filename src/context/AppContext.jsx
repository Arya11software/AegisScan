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

      const [targetRes, surfaceRes, findingsRes, evidenceRes] = await Promise.all([
        apiService.getTargetProfile().catch(() => null),
        apiService.getAttackSurface().catch(() => null),
        apiService.getFindings().catch(() => null),
        apiService.getEvidence().catch(() => null)
      ]);

      if (targetRes?.success) setTargetProfile(targetRes.profile);
      if (surfaceRes?.success) setAttackSurface(surfaceRes.surface);
      if (findingsRes?.success) setFindings(findingsRes.findings || []);
      if (evidenceRes?.success) setEvidenceList(evidenceRes.evidence || []);

      // Generate default assessment entry if list is empty
      if (findingsRes?.findings) {
        const activeCount = findingsRes.findings.filter(f => f.currentCondition === 'OBSERVED').length;
        setAssessments([
          {
            id: 'WM-2026-REAL',
            targetName: 'World Monitor',
            targetUrl: 'C:\\Users\\HP\\worldmonitor',
            environment: 'Authorized Local Sandbox',
            status: 'COMPLETED',
            authorizedBy: 'Security Analyst',
            authorizationConfirmed: true,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            riskIndex: activeCount > 0 ? 85 : 0,
            riskRating: activeCount > 0 ? 'High' : 'Clean',
            totalFindingsCount: findingsRes.findings.length,
            validatedCount: findingsRes.findings.filter(f => f.validation?.status === 'CONFIRMED').length,
            verifiedCount: findingsRes.findings.filter(f => f.status === 'VERIFIED').length,
            retestCount: findingsRes.findings.filter(f => f.status === 'READY_FOR_RETEST' || f.status === 'VERIFIED' || f.status === 'REOPENED').length,
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
        ]);
      }
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

  const triggerAssessment = async (targetName = 'World Monitor', scopes = []) => {
    setAssessmentModalOpen(true);
    setAssessmentProgress({ stepName: 'INITIALIZING', progressPercent: 10 });
    showToast('Initializing target assessment against World Monitor...', 'info');

    try {
      setAssessmentProgress({ stepName: 'PROFILING TARGET REPOSITORY', progressPercent: 30 });
      await new Promise(r => setTimeout(r, 400));

      setAssessmentProgress({ stepName: 'SCANNING SOURCE FILES & AST NODES', progressPercent: 60 });
      const res = await apiService.startAssessment(targetName, scopes);

      setAssessmentProgress({ stepName: 'ANALYZING SECURITY FINDINGS & AI EVIDENCE', progressPercent: 90 });
      await new Promise(r => setTimeout(r, 400));

      if (res.success) {
        setLatestScanResultState(res.scanResult);
        setActiveAssessmentId(res.assessmentId);
        await refreshData();
        setAssessmentProgress({ stepName: 'COMPLETED', progressPercent: 100, isFinished: true });
        showToast(`Assessment completed successfully against C:\\Users\\HP\\worldmonitor.`, 'success');
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

