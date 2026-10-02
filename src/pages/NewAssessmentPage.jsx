import React, { useState } from 'react';
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
  Shield, 
  Layers, 
  CheckCircle2,
  Crosshair,
  FileCode,
  Terminal,
  Sparkles,
  Server,
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NewAssessmentPage() {
  const navigate = useNavigate();
  const {
    triggerAssessment,
    availableScopes,
    scopeMap,
    loadingSecurityChecks,
    securityChecksError,
    activeAssessmentId
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [targetName, setTargetName] = useState('World Monitor');
  const [targetUrl] = useState('https://github.com/koala73/worldmonitor.git');
  const [environment] = useState('Authorized Local Sandbox');
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [completedAssessmentId, setCompletedAssessmentId] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Scope selection: user picks manually, or defaults to all availableScopes if not yet selected.
  const [userSelectedScopes, setUserSelectedScopes] = useState(null);

  // Derive selectedScopes during render
  const selectedScopes = userSelectedScopes !== null
    ? userSelectedScopes
    : (Array.isArray(availableScopes) && availableScopes.length > 0 ? availableScopes : []);

  const toggleScope = (scope) => {
    const current = Array.isArray(selectedScopes) ? selectedScopes : [];
    if (current.includes(scope)) {
      setUserSelectedScopes(current.filter(s => s !== scope));
    } else {
      setUserSelectedScopes([...current, scope]);
    }
  };

  const handleStartAssessment = async () => {
    if (!isAuthorized || selectedScopes.length === 0) return;
    setExecutionError(null);
    setIsExecuting(true);
    const checkIds = [];
    selectedScopes.forEach(sc => {
      const mapped = scopeMap ? scopeMap[sc] : null;
      if (mapped) checkIds.push(...mapped);
    });

    const res = await triggerAssessment(targetName, selectedScopes, checkIds);
    setIsExecuting(false);

    // Primary: use ID from the response
    const targetAssessmentId = res?.assessmentId || res?.assessment?.id;
    if (res?.success && targetAssessmentId) {
      setCompletedAssessmentId(targetAssessmentId);
      setCurrentStep(6);
      navigate(`/assessments/${targetAssessmentId}`);
      return;
    }

    // If backend or workflow returned an error, DO NOT send user back to Target Definition.
    // Stay on Step 5 and show technical error with Retry option.
    if (!res?.success) {
      setExecutionError(res?.error?.message || 'Assessment execution failed to complete. Please retry.');
      return;
    }

    // Fallback: check localStorage for a persisted assessment ID
    try {
      const persisted = localStorage.getItem('aegis_active_assessment_id');
      if (persisted) {
        setCompletedAssessmentId(persisted);
        setCurrentStep(6);
        navigate(`/assessments/${persisted}`);
        return;
      }
    } catch { /* localStorage not available */ }

    // If completed as demo
    if (res?.assessmentId) {
      setCompletedAssessmentId(res.assessmentId);
      setCurrentStep(6);
    }
  };

  const steps = [
    { step: 1, num: '01', label: 'Target', title: 'Target Definition' },
    { step: 2, num: '02', label: 'Authorization', title: 'Security Authorization' },
    { step: 3, num: '03', label: 'Discovery', title: 'Attack Surface Discovery' },
    { step: 4, num: '04', label: 'Test Plan', title: 'Test Controls & Scopes' },
    { step: 5, num: '05', label: 'Assessment', title: 'Execution & Analysis' },
    { step: 6, num: '06', label: 'Results', title: 'Assessment Results' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Closed-Loop Onboarding Wizard</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
          Create Authorized Assessment Scope
        </h1>
        <p className="text-xs text-[#56655D] mt-0.5">
          Configure target boundaries, non-destructive permissions, and evaluated test domains for World Monitor.
        </p>
      </div>

      {/* Stepper Header (Desktop Horizontal + Mobile Scrollable) */}
      <div className="panel-card p-3 sm:p-4">
        {/* Desktop 6-step horizontal stepper */}
        <div className="hidden md:grid md:grid-cols-6 gap-2">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.step;
            const isActive = currentStep === s.step;
            return (
              <div 
                key={idx}
                onClick={() => {
                  if (isCompleted || isActive) setCurrentStep(s.step);
                }} 
                className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                  isActive ? 'bg-[#EBF5F0]' : isCompleted ? 'cursor-pointer hover:bg-[#F8F9F6]' : 'opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#0A6E4F] text-white shadow-xs'
                      : isCompleted
                      ? 'bg-[#EBF5F0] text-[#0A6E4F] border border-[#B6DEC9]'
                      : 'bg-[#F3F5F1] text-[#85948C] border border-[#DEE5E0]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 text-[#0A6E4F]" /> : s.num}
                </div>
                <div className="min-w-0">
                  <p className={`text-[9px] uppercase font-bold tracking-wider leading-none ${isActive ? 'text-[#0A6E4F]' : 'text-[#85948C]'}`}>
                    Step {s.num}
                  </p>
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#16201B]' : 'text-[#56655D]'}`}>
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Compact Scrollable Stepper */}
        <div className="flex md:hidden overflow-x-auto gap-2 pb-1">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.step;
            const isActive = currentStep === s.step;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  if (isCompleted || isActive) setCurrentStep(s.step);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                  isActive
                    ? 'bg-[#EBF5F0] border-[#0A6E4F] text-[#0A6E4F]'
                    : isCompleted
                    ? 'bg-[#FFFFFF] border-[#DEE5E0] text-[#16201B]'
                    : 'bg-[#F8F9F6] border-[#DEE5E0] text-[#85948C] opacity-70'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-[#0A6E4F] text-white' : isCompleted ? 'text-[#0A6E4F]' : 'text-[#85948C]'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3 text-[#0A6E4F]" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Panels */}
      <div className="panel-card p-6 space-y-6">
        {/* STEP 1: TARGET DEFINITION */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-[#DEE5E0] pb-3">
              <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0A6E4F]" />
                Section 1: Target Definition & Origin
              </h2>
              <p className="text-xs text-[#56655D] mt-0.5">Specify repository metadata and designated evaluation boundary.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="target-name" className="text-xs font-bold text-[#16201B] flex items-center justify-between">
                  <span>Target Application Name</span>
                  <span className="text-[11px] font-normal text-[#85948C]">Required</span>
                </label>
                <input
                  id="target-name"
                  name="targetName"
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="input-field font-semibold"
                  placeholder="e.g. World Monitor"
                  required
                />
                <p className="text-[11px] text-[#85948C]">Used across findings, audit reports, and security verification logs.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="target-url" className="text-xs font-bold text-[#16201B]">
                  Target Repository / URL
                </label>
                <input
                  id="target-url"
                  name="targetUrl"
                  type="text"
                  value={targetUrl}
                  disabled
                  className="input-field font-mono text-[11px]"
                />
                <p className="text-[11px] text-[#85948C]">Target repo mirrored inside isolated local sandbox filesystem.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="target-env" className="text-xs font-bold text-[#16201B]">
                  Evaluation Runtime Environment
                </label>
                <input
                  id="target-env"
                  name="targetEnvironment"
                  type="text"
                  value={environment}
                  disabled
                  className="input-field font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#DEE5E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-primary"
              >
                <span>Continue to Authorization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AUTHORIZATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#DEE5E0] pb-3">
              <div className="w-9 h-9 rounded-md bg-[#EBF5F0] border border-[#B6DEC9] flex items-center justify-center text-[#0A6E4F] shrink-0">
                <Lock className="w-4 h-4 text-[#0A6E4F]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
                  Section 2: Authorization & Non-Destructive Boundary
                </h2>
                <p className="text-xs text-[#56655D]">Explicit target consent required before running AST rule scans.</p>
              </div>
            </div>

            <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-5 space-y-4">
              <div
                onClick={() => setIsAuthorized(!isAuthorized)}
                className="flex items-start space-x-3 cursor-pointer select-none"
                role="checkbox"
                aria-checked={isAuthorized}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsAuthorized(!isAuthorized);
                  }
                }}
              >
                <div className="mt-0.5 text-[#0A6E4F]">
                  {isAuthorized ? <CheckSquare className="w-5 h-5 text-[#0A6E4F]" /> : <Square className="w-5 h-5 text-[#85948C]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#16201B]">
                    I confirm that target {targetName} is authorized for security assessment.
                  </p>
                  <p className="text-[11px] text-[#56655D] mt-1 leading-relaxed">
                    By confirming, you certify that AegisScan is authorized to run deterministic static checks, AST rule analysis, and evidence generation within the local sandbox boundary.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#DEE5E0] pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
                  <span>Sandbox Bound</span>
                </div>
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
                  <span>Non-Destructive AST</span>
                </div>
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
                  <span>Audit Trail Logged</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-[#DEE5E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!isAuthorized}
                className={`btn-primary ${!isAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>Continue to Discovery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DISCOVERY (ATTACK SURFACE & ENDPOINTS) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-[#DEE5E0] pb-3">
              <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#0A6E4F]" />
                Section 3: Target Attack Surface Discovery
              </h2>
              <p className="text-xs text-[#56655D] mt-0.5">Automated asset profiling and surface mapping for {targetName}.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-[#0A6E4F]" />
                  <span className="text-xs font-bold text-[#16201B]">Identified Architecture</span>
                </div>
                <ul className="text-xs text-[#56655D] space-y-1">
                  <li>• Client: React 18, Vite Bundler, Clerk Authentication</li>
                  <li>• Backend: Express API, Target Services, Live Streaming</li>
                  <li>• Repository Mirror: <span className="font-mono text-[10px] text-[#0A6E4F]">koala73/worldmonitor</span></li>
                </ul>
              </div>

              <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#0A6E4F]" />
                  <span className="text-xs font-bold text-[#16201B]">Scanned AST Surface</span>
                </div>
                <ul className="text-xs text-[#56655D] space-y-1">
                  <li>• 7 Local Target Source Modules</li>
                  <li>• 12 API Endpoints Indexed</li>
                  <li>• 6 Security Boundary Tiers Mapped</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DEE5E0] rounded-lg p-3.5 space-y-2">
              <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">
                Discovered Endpoints & Attack Vectors
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="bg-[#F8F9F6] border border-[#DEE5E0] px-2 py-0.5 rounded text-[#16201B]">/api/assessments</span>
                <span className="bg-[#F8F9F6] border border-[#DEE5E0] px-2 py-0.5 rounded text-[#16201B]">/api/findings</span>
                <span className="bg-[#F8F9F6] border border-[#DEE5E0] px-2 py-0.5 rounded text-[#16201B]">/api/retest</span>
                <span className="bg-[#F8F9F6] border border-[#DEE5E0] px-2 py-0.5 rounded text-[#16201B]">/api/evidence</span>
                <span className="bg-[#F8F9F6] border border-[#DEE5E0] px-2 py-0.5 rounded text-[#16201B]">client-storage://credentials</span>
                <span className="bg-[#F8F9F6] border border-[#DEE5E0] px-2 py-0.5 rounded text-[#16201B]">dom://external-navigation</span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-[#DEE5E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-primary"
              >
                <span>Proceed to Test Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TEST PLAN (SCOPE & SECURITY CONTROLS) */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-[#DEE5E0] pb-3">
              <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0A6E4F]" />
                Section 4: Test Plan & Security Controls Matrix
              </h2>
              <p className="text-xs text-[#56655D] mt-0.5">Select active security domains to include in the assessment plan.</p>
            </div>

            {loadingSecurityChecks ? (
              <div className="p-6 text-center text-xs text-[#56655D]">Loading security check catalog...</div>
            ) : securityChecksError ? (
              <div className="p-4 text-xs text-[#C53030] bg-[#FDF2F2] border border-[#FBC4C4] rounded-md">
                Failed to load checks: {securityChecksError.message || 'Server error'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Array.isArray(availableScopes) ? availableScopes : []).map((scope, idx) => {
                  const isSelected = (Array.isArray(selectedScopes) ? selectedScopes : []).includes(scope);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleScope(scope)}
                      className={`p-3.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#EBF5F0] border-[#0A6E4F] text-[#064E3B] font-semibold'
                          : 'bg-[#F8F9F6] border-[#DEE5E0] text-[#56655D] hover:bg-white hover:border-[#CBD5CE]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A6E4F]"></span>
                        <span>{scope}</span>
                      </div>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#0A6E4F] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#85948C] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[#DEE5E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                disabled={!selectedScopes || selectedScopes.length === 0}
                className={`btn-primary ${(!selectedScopes || selectedScopes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>Configure Assessment ({selectedScopes.length} Domains)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ASSESSMENT EXECUTION & REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-[#DEE5E0] pb-3">
              <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-[#0A6E4F] fill-current" />
                Section 5: Assessment Engine & Execution
              </h2>
              <p className="text-xs text-[#56655D] mt-0.5">Validate scope configuration and execute deterministic assessment engine.</p>
            </div>

            {/* Execution Overview Card */}
            <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-5 space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#DEE5E0]">
                <span className="text-[#56655D]">Target Application:</span>
                <span className="font-bold text-[#16201B]">{targetName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DEE5E0]">
                <span className="text-[#56655D]">Runtime Sandbox:</span>
                <span className="font-mono text-[#0A6E4F] font-bold">{environment}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DEE5E0]">
                <span className="text-[#56655D]">Analyst Authorization:</span>
                <span className="font-bold text-[#0A6E4F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed & Logged
                </span>
              </div>
              <div className="py-2 border-b border-[#DEE5E0]">
                <span className="text-[#56655D] block mb-2 font-bold">Configured Test Domains ({selectedScopes?.length || 0}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedScopes) ? selectedScopes : []).map((sc, i) => (
                    <span key={i} className="bg-white border border-[#DEE5E0] px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#0A6E4F]">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#56655D]">Execution Engine:</span>
                <span className="font-semibold text-[#16201B]">Real AST Parser + Predefined Finding Catalog</span>
              </div>
            </div>

            {/* Execution Screen Status */}
            <div className="panel-card p-4 space-y-2 border-l-4 border-l-[#0A6E4F]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16201B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0A6E4F]" />
                  Engine Execution Readiness
                </span>
                <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                  READY TO SCAN
                </span>
              </div>
              <p className="text-xs text-[#56655D]">
                Clicking the button below launches the 6-stage closed-loop assessment pipeline. Real-time operations will profile repository files, parse AST syntax nodes, and record findings in the local audit store.
              </p>
            </div>

            {/* Error Panel if execution failed */}
            {executionError && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between text-[#B91C1C] font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Assessment Execution Failed
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-red-100 px-2 py-0.5 rounded">
                    SAFE RECOVERY
                  </span>
                </div>
                <p className="text-[#7F1D1D] font-mono text-[11px] bg-white p-2.5 rounded border border-[#FECACA] break-words">
                  {executionError}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[#991B1B] text-[11px]">
                    Your configured target and scope selections have been preserved.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartAssessment}
                    className="btn-primary py-1 px-3 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[#DEE5E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-secondary"
                disabled={isExecuting}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStartAssessment}
                disabled={!isAuthorized || selectedScopes.length === 0 || isExecuting}
                className="btn-primary py-2.5 px-5"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Assessment Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: RESULTS */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-[#DEE5E0] pb-3">
              <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A6E4F]" />
                Section 6: Assessment Results & Workspace
              </h2>
              <p className="text-xs text-[#56655D] mt-0.5">Assessment run complete with deterministic audit records generated.</p>
            </div>

            <div className="bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#0A6E4F]">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-sm font-bold text-[#064E3B]">Assessment Successfully Completed</h3>
              </div>
              <p className="text-xs text-[#56655D]">
                The assessment against <strong className="text-[#16201B]">{targetName}</strong> has completed all 6 execution phases. You can inspect all findings, verified resolutions, and generate compliance reports.
              </p>
              {completedAssessmentId && (
                <div className="bg-white border border-[#B6DEC9] rounded p-2.5 font-mono text-xs font-bold text-[#0A6E4F]">
                  Assessment Record ID: {completedAssessmentId}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2 border-t border-[#DEE5E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="btn-secondary"
              >
                Back to Execution Review
              </button>
              <button
                type="button"
                onClick={() => {
                  if (completedAssessmentId) {
                    navigate(`/assessments/${completedAssessmentId}`);
                  } else {
                    navigate('/assessments');
                  }
                }}
                className="btn-primary"
              >
                <span>Open Assessment Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
