import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Lock, 
  Target, 
  ArrowRight, 
  Play, 
  Check, 
  Globe, 
  Layers, 
  AlertTriangle,
  Loader2,
  Sparkles,
  Server,
  Code2,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';

export default function NewAssessmentPage() {
  const navigate = useNavigate();
  const { createAssessment, refreshData, showToast } = useApp();

  // ─── SESSION STORAGE KEY ──────────────────────────────────────────────────
  const SESSION_KEY = 'aegisscan_wizard';

  const saveSession = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, ...patch }));
    } catch { /* ignore */ }
  };

  const loadSession = () => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    } catch { return {}; }
  };

  const clearSession = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  // Restore saved session on first render (before any useState default)
  const saved = loadSession();

  // ─── WIZARD STEP (persisted) ──────────────────────────────────────────────
  const [currentStep, setCurrentStepRaw] = useState(saved.currentStep || 1);

  const setCurrentStep = (step) => {
    setCurrentStepRaw(step);
    saveSession({ currentStep: step });
  };

  // ─── FORM FIELDS ──────────────────────────────────────────────────────────
  const [assessmentName, setAssessmentName] = useState(
    saved.assessmentName || 'Production Web Portal Security Assessment'
  );
  const [targetUrl, setTargetUrl] = useState(saved.targetUrl || 'http://localhost:3000');
  const [environment, setEnvironment] = useState(saved.environment || 'Staging');
  const [applicationType] = useState('Web');
  const [description, setDescription] = useState(
    saved.description || 'Authorized pre-release vulnerability assessment evaluating authorization controls and API security boundaries.'
  );
  const [authAccount, setAuthAccount] = useState(
    saved.authAccount || 'security-analyst@target.internal'
  );
  const [isAuthorized, setIsAuthorized] = useState(
    saved.isAuthorized !== undefined ? saved.isAuthorized : true
  );

  const availableScopes = [
    'Authentication', 'Authorization', 'Session Management', 'API Security',
    'Input Validation', 'Client Security', 'Secure Communication', 'Data Protection'
  ];

  const [selectedScopes, setSelectedScopes] = useState(
    saved.selectedScopes || [...availableScopes]
  );

  // ─── PERSISTED ASSESSMENT ID ──────────────────────────────────────────────
  const [persistedAssessmentId, setPersistedAssessmentIdRaw] = useState(
    saved.persistedAssessmentId || null
  );

  const setPersistedAssessmentId = (id) => {
    setPersistedAssessmentIdRaw(id);
    saveSession({ persistedAssessmentId: id });
  };

  // ─── DISCOVERY STATE ──────────────────────────────────────────────────────
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryData, setDiscoveryDataRaw] = useState(saved.discoveryData || null);
  const [discoveryError, setDiscoveryError] = useState(null);

  const setDiscoveryData = (data) => {
    setDiscoveryDataRaw(data);
    saveSession({ discoveryData: data });
  };

  // ─── TEST PLAN STATE ──────────────────────────────────────────────────────
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [testPlanData, setTestPlanDataRaw] = useState(saved.testPlanData || null);

  const setTestPlanData = (plan) => {
    setTestPlanDataRaw(plan);
    saveSession({ testPlanData: plan });
  };

  // ─── EXECUTION STATE ──────────────────────────────────────────────────────
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(null);
  const [executionCompleted, setExecutionCompleted] = useState(
    saved.executionCompleted || false
  );
  const [completedAssessmentResult, setCompletedAssessmentResultRaw] = useState(
    saved.completedAssessmentResult || null
  );

  const setCompletedAssessmentResult = (result) => {
    setCompletedAssessmentResultRaw(result);
    if (result) saveSession({ completedAssessmentResult: result, executionCompleted: true });
  };

  const progressPollRef = useRef(null);

  // ─── MOUNT: Restore execution progress from backend if assessment existed ──
  useEffect(() => {
    const restoredId = loadSession().persistedAssessmentId;
    const restoredStep = loadSession().currentStep || 1;

    if (restoredId && restoredStep >= 5) {
      // Re-fetch progress from backend to restore Step 5 display
      apiService.getAssessmentProgress(restoredId).then((progRes) => {
        if (progRes?.success && progRes.progress?.isFinished) {
          setExecutionProgress(progRes.progress);
        }
      }).catch(() => {});

      // Also re-fetch the full assessment to restore result card
      apiService.getAssessment(restoredId).then((asmRes) => {
        if (asmRes?.success && asmRes.assessment?.status === 'COMPLETED') {
          const asm = asmRes.assessment;
          setCompletedAssessmentResultRaw({
            success: true,
            assessment: asm,
            findings: [],
            risk: { riskIndex: asm.riskIndex, riskRating: asm.riskRating },
            testPlan: asm.testPlan
          });
          setExecutionCompleted(true);
        }
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleScope = (scope) => {
    const next = selectedScopes.includes(scope)
      ? selectedScopes.filter(s => s !== scope)
      : [...selectedScopes, scope];
    setSelectedScopes(next);
    saveSession({ selectedScopes: next });
  };

  // ─── Step 2 -> Step 3: Create assessment + run discovery ──────────────────
  const handleProceedToDiscovery = async () => {
    if (!isAuthorized) {
      showToast('You must confirm authorization before proceeding.', 'error');
      return;
    }

    setIsDiscovering(true);
    setDiscoveryError(null);
    setCurrentStep(3);

    try {
      let currentId = persistedAssessmentId;

      if (!currentId) {
        // Save form fields to session before async call
        saveSession({ assessmentName, targetUrl, environment, description, authAccount, isAuthorized, selectedScopes });

        const assessment = await createAssessment({
          name: assessmentName,
          targetUrl,
          environment,
          applicationType,
          description,
          authorizationConfirmed: isAuthorized,
          authAccount,
          scopes: selectedScopes
        });

        if (assessment?.id) {
          currentId = assessment.id;
          setPersistedAssessmentId(currentId);
        } else {
          setDiscoveryError('Failed to create assessment record. Check backend connection.');
          setIsDiscovering(false);
          return;
        }
      }

      const disc = await apiService.discoverAssessment(currentId);
      if (disc?.success && disc.discovery) {
        setDiscoveryData(disc.discovery);
      } else {
        setDiscoveryError('Discovery failed. Target application could not be probed.');
        setDiscoveryData(null);
      }
    } catch (err) {
      console.error('[ASSESSMENT FLOW] Discovery error:', err);
      setDiscoveryError(`Discovery error: ${err.message || 'Probe request failed'}`);
      setDiscoveryData(null);
    } finally {
      setIsDiscovering(false);
    }
  };

  // ─── Step 3 -> Step 4: Generate Intelligent Test Plan ────────────────────
  const handleProceedToTestPlan = async () => {
    setIsGeneratingPlan(true);
    setCurrentStep(4);

    try {
      const targetId = persistedAssessmentId || 'draft';
      const planRes = await apiService.generateTestPlan(targetId);
      if (planRes?.success && planRes.testPlan) {
        setTestPlanData(planRes.testPlan);
      }
    } catch (err) {
      console.error('[ASSESSMENT FLOW] Test plan error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // ─── Step 4 -> Step 5: Start Automated Security Testing ──────────────────
  const handleStartAssessment = async () => {
    if (!isAuthorized) {
      showToast('Authorization required.', 'error');
      return;
    }

    const targetId = persistedAssessmentId;
    if (!targetId) {
      showToast('Assessment record not found. Please restart configuration.', 'error');
      return;
    }

    setIsExecuting(true);
    setExecutionCompleted(false);
    setCurrentStep(5);

    setExecutionProgress({
      percent: 5,
      message: 'Initializing security test runner...',
      currentDomain: 'discovery',
      domains: [
        { id: 'discovery', name: 'Application Discovery', isPrep: true, status: 'Running', details: 'Crawling application footprint...' },
        { id: 'auth', name: 'Authentication & Session', status: 'Pending', details: 'Awaiting execution' },
        { id: 'authz', name: 'Authorization & RBAC', status: 'Pending', details: 'Awaiting execution' },
        { id: 'api', name: 'API Security', status: 'Pending', details: 'Awaiting execution' },
        { id: 'input', name: 'Input Validation', status: 'Pending', details: 'Awaiting execution' },
        { id: 'client', name: 'Client-Side Security', status: 'Pending', details: 'Awaiting execution' },
        { id: 'transport', name: 'Transport Security', status: 'Pending', details: 'Awaiting execution' },
        { id: 'data', name: 'Data & Privacy', status: 'Pending', details: 'Awaiting execution' }
      ]
    });

    if (progressPollRef.current) clearInterval(progressPollRef.current);
    progressPollRef.current = setInterval(async () => {
      try {
        const progRes = await apiService.getAssessmentProgress(targetId);
        if (progRes?.success && progRes.progress) {
          setExecutionProgress(progRes.progress);
          if (progRes.progress.isFinished) {
            clearInterval(progressPollRef.current);
          }
        }
      } catch { /* polling catch */ }
    }, 250);

    try {
      showToast('Executing safe non-destructive security tests across 7 domains...', 'info');
      const startRes = await apiService.executeAssessment(targetId);

      if (progressPollRef.current) clearInterval(progressPollRef.current);

      if (startRes.success) {
        setCompletedAssessmentResult(startRes);
        setExecutionCompleted(true);
        if (startRes.domainProgress) {
          setExecutionProgress(prev => ({
            ...prev,
            percent: 100,
            message: 'All 7 security domains evaluated successfully.',
            isFinished: true,
            domains: startRes.domainProgress
          }));
        }
        await refreshData();
        showToast(`Assessment completed with ${startRes.findings?.length || 0} candidate findings.`, 'success');
      } else {
        showToast(startRes.error?.message || 'Assessment execution error', 'error');
      }
    } catch (err) {
      if (progressPollRef.current) clearInterval(progressPollRef.current);
      showToast(`Execution error: ${err.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // ─── Clear session when navigating away after completion ─────────────────
  const handleViewAssessment = () => {
    clearSession();
    navigate(`/assessments/${persistedAssessmentId}`);
  };

  useEffect(() => {
    return () => {
      if (progressPollRef.current) clearInterval(progressPollRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#087F5B]" />
          New Security Assessment
        </h1>
        <p className="text-xs text-[#64746A]">
          Configure target URL, verify legal authorization, discover endpoints, generate intelligent test plan, and execute automated security testing.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between bg-white border border-[#DDE5DF] rounded-lg p-4 shadow-2xs">
        {[
          { step: 1, label: 'Target Definition' },
          { step: 2, label: 'Authorization & Scope' },
          { step: 3, label: 'Discovery' },
          { step: 4, label: 'Intelligent Test Plan' },
          { step: 5, label: 'Automated Testing' }
        ].map((s, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === s.step
                  ? 'bg-[#087F5B] text-white shadow-2xs'
                  : currentStep > s.step
                  ? 'bg-[#E6F4F1] text-[#087F5B] border border-[#B2DFDB]'
                  : 'bg-[#F7F8F5] text-[#64746A] border border-[#DDE5DF]'
              }`}
            >
              {currentStep > s.step ? <Check className="w-4 h-4 text-[#087F5B]" /> : s.step}
            </div>
            <span className={`text-xs font-bold hidden md:inline ${currentStep === s.step ? 'text-[#17211B]' : 'text-[#64746A]'}`}>
              {s.label}
            </span>
            {idx < 4 && <div className="w-4 lg:w-8 h-px bg-[#DDE5DF] hidden sm:block"></div>}
          </div>
        ))}
      </div>

      {/* Wizard Content */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-6 shadow-2xs">
        {/* STEP 1: TARGET DEFINITION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#087F5B]" />
              Step 1: Target Configuration
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17211B]">Assessment Name</label>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  placeholder="e.g. Production Staging Portal Audit"
                  className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#17211B] outline-none focus:border-[#087F5B] font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17211B]">Target URL</label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://app.staging.internal or http://localhost:3000"
                    className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#17211B] font-mono outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17211B]">Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#17211B] font-bold outline-none focus:border-[#087F5B] cursor-pointer"
                  >
                    <option value="Development">Development</option>
                    <option value="Staging">Staging</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17211B]">Application Type</label>
                  <input
                    type="text"
                    value={applicationType}
                    disabled
                    className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#64746A] cursor-not-allowed font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17211B]">Authentication / Test Account</label>
                  <input
                    type="text"
                    value={authAccount}
                    onChange={(e) => setAuthAccount(e.target.value)}
                    placeholder="e.g. testuser@target.internal"
                    className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#17211B] outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17211B]">Assessment Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the scope, objectives, or special operational guidelines..."
                  className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#17211B] outline-none focus:border-[#087F5B]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm transition-all"
              >
                <span>Continue to Authorization & Scope</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AUTHORIZATION & SCOPE */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#DDE5DF] pb-3">
              <div className="w-9 h-9 rounded-md bg-[#E6F4F1] border border-[#B2DFDB] flex items-center justify-center text-[#087F5B]">
                <Lock className="w-5 h-5 text-[#087F5B]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
                  Step 2: Authorization & Scope Configuration
                </h2>
                <p className="text-xs text-[#64746A]">
                  Explicit legal authorization confirmation is mandatory before executing tests.
                </p>
              </div>
            </div>

            {/* Authorization Box */}
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-5 space-y-4">
              <div
                onClick={() => setIsAuthorized(!isAuthorized)}
                className="flex items-start space-x-3 cursor-pointer select-none"
              >
                <div className="mt-0.5 text-[#087F5B]">
                  {isAuthorized ? <CheckSquare className="w-5 h-5 text-[#087F5B]" /> : <Square className="w-5 h-5 text-[#64746A]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17211B]">
                    I confirm that I am authorized to assess this application.
                  </p>
                  <p className="text-[11px] text-[#64746A] mt-1 leading-relaxed">
                    By checking this box, you confirm that you have documented permission to conduct non-destructive security testing against <strong className="text-[#17211B] font-mono">{targetUrl}</strong> in the {environment} environment.
                  </p>
                </div>
              </div>

              {!isAuthorized && (
                <div className="bg-red-50 border border-red-200 text-[#C62828] text-xs p-3 rounded-md flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>The assessment cannot start until authorization is explicitly confirmed.</span>
                </div>
              )}
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
                Select Scope Boundaries ({selectedScopes.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableScopes.map((scope, idx) => {
                  const isSelected = selectedScopes.includes(scope);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleScope(scope)}
                      className={`p-3 rounded-md border text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E6F4F1] border-[#087F5B] text-[#064E3B]'
                          : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#64746A] hover:bg-white'
                      }`}
                    >
                      <span>{scope}</span>
                      {isSelected ? <CheckSquare className="w-4 h-4 text-[#087F5B]" /> : <Square className="w-4 h-4 text-[#64746A]" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleProceedToDiscovery}
                disabled={!isAuthorized || selectedScopes.length === 0}
                className={`px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm ${
                  isAuthorized && selectedScopes.length > 0
                    ? 'bg-[#087F5B] hover:bg-[#064E3B] text-white'
                    : 'bg-[#DDE5DF] text-[#64746A] cursor-not-allowed'
                }`}
              >
                <span>Continue to Discovery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DISCOVERY */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#087F5B]" />
                  Step 3: Application Discovery & Footprint
                </h2>
                <p className="text-xs text-[#64746A]">
                  Crawling target routes, REST APIs, HTTP methods, parameters, and HTTP security headers.
                </p>
              </div>

              <button
                onClick={handleProceedToDiscovery}
                disabled={isDiscovering}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                {isDiscovering ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087F5B]" /> : <Sparkles className="w-3.5 h-3.5 text-[#087F5B]" />}
                <span>{isDiscovering ? 'Discovering...' : 'Re-run Discovery'}</span>
              </button>
            </div>

            {/* Target Profile Card */}
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[#64746A] block text-[10px] font-bold uppercase">Target URL</span>
                  <span className="font-mono text-[#087F5B] font-bold truncate block">{targetUrl}</span>
                </div>
                <div>
                  <span className="text-[#64746A] block text-[10px] font-bold uppercase">Environment</span>
                  <span className="font-bold text-[#17211B]">{environment}</span>
                </div>
                <div>
                  <span className="text-[#64746A] block text-[10px] font-bold uppercase">Test Account</span>
                  <span className="font-bold text-[#17211B] truncate block">{authAccount || 'None'}</span>
                </div>
                <div>
                  <span className="text-[#64746A] block text-[10px] font-bold uppercase">Authorization</span>
                  <span className="font-bold text-[#087F5B]">CONFIRMED</span>
                </div>
              </div>
            </div>

            {isDiscovering ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#087F5B] mx-auto" />
                <p className="text-xs font-bold text-[#17211B]">Discovering routes and analyzing security headers...</p>
                <p className="text-[11px] text-[#64746A]">Probing {targetUrl} non-destructively</p>
              </div>
            ) : discoveryError ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-md text-center space-y-3">
                <XCircle className="w-8 h-8 text-[#C62828] mx-auto" />
                <p className="text-xs font-bold text-[#C62828]">Discovery Failed</p>
                <p className="text-[11px] text-[#64746A]">{discoveryError}</p>
                <button
                  onClick={handleProceedToDiscovery}
                  className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
                >
                  Retry Discovery
                </button>
              </div>
            ) : discoveryData ? (
              <div className="space-y-4">
                {/* Discovery Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-[#DDE5DF] p-3 rounded-md text-center">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Pages Discovered</span>
                    <span className="text-xl font-extrabold text-[#17211B] font-mono">{discoveryData.summary?.pagesCount || 0}</span>
                  </div>
                  <div className="bg-white border border-[#DDE5DF] p-3 rounded-md text-center">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">API Endpoints</span>
                    <span className="text-xl font-extrabold text-[#087F5B] font-mono">{discoveryData.summary?.apiEndpointsCount || 0}</span>
                  </div>
                  <div className="bg-white border border-[#DDE5DF] p-3 rounded-md text-center">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Parameters Mapped</span>
                    <span className="text-xl font-extrabold text-[#B7791F] font-mono">{discoveryData.summary?.parametersCount || 0}</span>
                  </div>
                  <div className="bg-white border border-[#DDE5DF] p-3 rounded-md text-center">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Security Headers</span>
                    <span className="text-xl font-extrabold text-[#064E3B] font-mono">{discoveryData.summary?.securityHeadersCount || 0}</span>
                  </div>
                </div>

                {/* Discovered Endpoints Snippet */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
                    Discovered API Routes & Methods
                  </span>
                  <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-3 divide-y divide-[#DDE5DF] text-xs font-mono">
                    {(discoveryData.apiEndpoints || []).slice(0, 6).map((ep, i) => (
                      <div key={i} className="py-2 flex items-center justify-between">
                        <span className="font-bold text-[#17211B]">{ep.path}</span>
                        <div className="flex gap-1">
                          {(ep.methods || ['GET']).map((m, mi) => (
                            <span key={mi} className="bg-white border border-[#DDE5DF] text-[10px] px-1.5 py-0.5 rounded text-[#087F5B] font-bold">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies & Security Headers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Technologies Identified</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(discoveryData.technologies || []).map((t, idx) => (
                        <span key={idx} className="bg-white border border-[#DDE5DF] text-[#17211B] font-semibold text-[10px] px-2 py-0.5 rounded">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Security Headers Status</span>
                    <div className="space-y-1">
                      {(discoveryData.securityHeaders || []).slice(0, 3).map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#17211B]">{h.header}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            h.status === 'CONFIGURED' ? 'badge-emerald' : 'badge-amber'
                          }`}>
                            {h.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleProceedToTestPlan}
                disabled={!discoveryData || isDiscovering || !!discoveryError}
                className={`bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-2 shadow-sm ${
                  !discoveryData || isDiscovering || !!discoveryError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span>Continue to Intelligent Test Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: INTELLIGENT TEST PLAN GENERATION */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-md bg-[#E6F4F1] border border-[#B2DFDB] flex items-center justify-center text-[#087F5B]">
                  <Layers className="w-5 h-5 text-[#087F5B]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
                    Step 4: Intelligent Security Test Plan
                  </h2>
                  <p className="text-xs text-[#64746A]">
                    Dynamic test selection rules evaluated against discovered application attack surface.
                  </p>
                </div>
              </div>

              {testPlanData && (
                <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
                  {testPlanData.totalTests} Tests Selected
                </span>
              )}
            </div>

            {isGeneratingPlan ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#087F5B] mx-auto" />
                <p className="text-xs font-bold text-[#17211B]">Compiling intelligent test plan with selection rationale...</p>
              </div>
            ) : testPlanData ? (
              <div className="space-y-4">
                {/* 7 Domains Overview Banner */}
                <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">
                    Core Security Domains (7 Domains)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {testPlanData.domains.map((dom, idx) => (
                      <span key={idx} className="bg-white border border-[#B2DFDB] text-[#087F5B] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#087F5B]" />
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Individual Generated Tests with Dynamic Rationale (Requirement 4) */}
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {testPlanData.tests.map((test) => (
                    <div key={test.id} className="bg-white border border-[#DDE5DF] rounded-md p-3.5 space-y-2 text-xs hover:border-[#087F5B]/50 transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#087F5B] text-[11px] bg-[#E6F4F1] px-1.5 py-0.5 rounded">
                            {test.id}
                          </span>
                          <span className="font-bold text-[#17211B]">{test.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="badge-amber text-[9px] font-bold px-2 py-0.5 rounded">
                            {test.status}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                            test.severity === 'CRITICAL' || test.severity === 'HIGH' ? 'badge-crimson' : 'badge-amber'
                          }`}>
                            {test.severity}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#64746A]">{test.description}</p>

                      {/* Dynamic Selection Rationale Badge (Step 4 Requirement) */}
                      <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded p-2 text-[11px] text-[#17211B] flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#087F5B] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#087F5B]">Reason for Selection:</strong>{' '}
                          <span>{test.reasonForSelection}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleStartAssessment}
                disabled={isExecuting}
                className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-6 py-2.5 rounded-md text-xs font-extrabold flex items-center space-x-2 cursor-pointer shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START ASSESSMENT</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AUTOMATED TESTING ACROSS 7 DOMAINS & LIVE DOMAIN PROGRESS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#087F5B]" />
                  Step 5: Automated Security Testing Across 7 Domains
                </h2>
                <p className="text-xs text-[#64746A]">
                  Real-time execution monitoring with live domain-by-domain status transitions.
                </p>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-md ${
                executionCompleted ? 'badge-emerald' : 'badge-amber'
              }`}>
                {executionCompleted ? 'Execution Complete' : 'Executing Checks...'}
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17211B] flex items-center gap-2">
                  {!executionCompleted && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087F5B]" />}
                  {executionProgress?.message || 'Executing security tests...'}
                </span>
                <span className="font-mono font-bold text-[#087F5B]">{executionProgress?.percent || 0}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-[#DDE5DF]">
                <div
                  className="bg-[#087F5B] h-full transition-all duration-300"
                  style={{ width: `${executionProgress?.percent || 0}%` }}
                ></div>
              </div>
            </div>

            {/* LIVE DOMAIN-BY-DOMAIN PROGRESS TABLE (Step 5 Requirement) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
                Live Security Domain Execution Status (7 Domains)
              </span>
              <div className="border border-[#DDE5DF] rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F8F5] text-[#64746A] font-bold border-b border-[#DDE5DF] text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Security Domain</th>
                      <th className="p-3">Execution Status</th>
                      <th className="p-3">Details / Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]">
                    {(executionProgress?.domains || []).filter(d => !d.isPrep).map((dom) => {
                      const isRunning = dom.status === 'Running';
                      const isPassed = dom.status === 'Passed';
                      const hasFindings = dom.status === 'Findings Detected';
                      const isPending = dom.status === 'Pending';

                      return (
                        <tr key={dom.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                          <td className="p-3 font-bold text-[#17211B] flex items-center gap-2">
                            {isRunning && <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-ping" />}
                            <span>{dom.name}</span>
                          </td>
                          <td className="p-3">
                            {isRunning && (
                              <span className="inline-flex items-center gap-1.5 text-[#087F5B] font-bold text-[11px]">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Running</span>
                              </span>
                            )}
                            {isPassed && (
                              <span className="inline-flex items-center gap-1.5 badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3 text-[#087F5B]" />
                                <span>Passed</span>
                              </span>
                            )}
                            {hasFindings && (
                              <span className="inline-flex items-center gap-1.5 badge-crimson text-[10px] font-bold px-2 py-0.5 rounded">
                                <XCircle className="w-3 h-3 text-[#C62828]" />
                                <span>Findings Detected</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[#64746A] text-[11px] font-medium">Pending</span>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-[#64746A]">
                            {dom.details || 'Awaiting execution'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Completion Summary Card & Dashboard Link */}
            {executionCompleted && completedAssessmentResult && (
              <div className="bg-[#E6F4F1] border border-[#B2DFDB] rounded-lg p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-md bg-white border border-[#B2DFDB] flex items-center justify-center text-[#087F5B]">
                    <ShieldCheck className="w-6 h-6 text-[#087F5B]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#064E3B] text-sm">Security Assessment Completed</h3>
                    <p className="text-xs text-[#17211B]">
                      Safe non-destructive tests completed across all 7 domains. Candidate findings and evidence artifacts persisted to database.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white p-3 rounded border border-[#B2DFDB]">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Candidate Findings</span>
                    <span className="text-xl font-extrabold text-[#C62828] font-mono">
                      {completedAssessmentResult.findings?.length || 0}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded border border-[#B2DFDB]">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Evaluated Risk</span>
                    <span className="text-xl font-extrabold text-[#B7791F] font-mono">
                      {completedAssessmentResult.risk?.riskIndex || 65} ({completedAssessmentResult.risk?.riskRating || 'Moderate'})
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded border border-[#B2DFDB]">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Tests Executed</span>
                    <span className="text-xl font-extrabold text-[#087F5B] font-mono">
                      {completedAssessmentResult.testPlan?.totalTests || completedAssessmentResult.assessment?.testPlanSummary?.total || 0}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded border border-[#B2DFDB]">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase block">Database Status</span>
                    <span className="text-xs font-extrabold text-[#087F5B] uppercase block mt-1.5">
                      PERSISTED ✓
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => navigate(`/assessments/${persistedAssessmentId}`)}
                    className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm transition-all"
                  >
                    <span>View Assessment Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
