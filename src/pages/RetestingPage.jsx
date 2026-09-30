import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, Loader2, Play, AlertTriangle, Sparkles, ArrowRight, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RetestingPage() {
  const { findings, executeRetest } = useApp();
  const [selectedFindingId, setSelectedFindingId] = useState('F-001');

  const [retestProgress, setRetestProgress] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const targetFinding = findings.find(f => f.id === selectedFindingId) || findings[0];

  const handleRunRetest = async (simulateOutcome = 'PASSED') => {
    if (!targetFinding) return;
    setIsRunning(true);

    await executeRetest(targetFinding.id, simulateOutcome, (progress) => {
      setRetestProgress(progress);
    });

    setIsRunning(false);
  };

  const retestChecklist = [
    'Assessment scope and target endpoint verified',
    'Original vulnerability condition evaluated',
    'Remediation security control evaluated against AST rules',
    'Evidence regenerated and verified clean'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#087F5B]" />
            Closed-Loop Retesting & Verification Runner
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Empirical before/after verification proving vulnerability remediation on target <strong className="text-[#17211B]">World Monitor</strong>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            Supports PASSED & REOPENED Demo Outcomes
          </span>
        </div>
      </div>

      {/* Select Finding Card */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-3 shadow-2xs">
        <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
          SELECT FINDING TO RETEST & VERIFY
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {findings.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFindingId(f.id)}
              className={`p-3.5 rounded-md border text-xs cursor-pointer transition-all ${
                selectedFindingId === f.id
                  ? 'bg-[#E6F4F1] border-[#087F5B] ring-2 ring-[#087F5B]/20 shadow-2xs'
                  : 'bg-[#F7F8F5] border-[#DDE5DF] hover:bg-white hover:border-[#087F5B]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#087F5B]">{f.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  (f.status || '').toLowerCase() === 'verified'
                    ? 'badge-emerald'
                    : ((f.status || '').toLowerCase() === 'reopened' || (f.status || '').toLowerCase() === 'regression')
                    ? 'badge-crimson'
                    : 'badge-amber'
                }`}>
                  {f.status}
                </span>
              </div>
              <p className="font-bold text-[#17211B] mt-1.5 truncate">{f.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Retest Workspace */}
      {targetFinding && (
        <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-6 shadow-2xs">
          {/* Header Info & Dual Outcome Execution Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#087F5B] bg-[#E6F4F1] border border-[#B2DFDB] px-2 py-0.5 rounded">
                  {targetFinding.id}
                </span>
                <span className="text-xs text-[#64746A] font-semibold">{targetFinding.category}</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#17211B] mt-1">{targetFinding.title}</h2>
              <p className="text-xs text-[#64746A]">Component: {targetFinding.component}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRunRetest('PASSED')}
                disabled={isRunning}
                className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                  isRunning
                    ? 'bg-[#DDE5DF] text-[#64746A] cursor-not-allowed'
                    : 'bg-[#087F5B] hover:bg-[#064E3B] text-white'
                }`}
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>VERIFY REMEDIATION (PASS)</span>
              </button>

              <button
                onClick={() => handleRunRetest('FAILED')}
                disabled={isRunning}
                className="bg-white hover:bg-red-50 border border-red-200 text-[#C62828] px-3.5 py-2 rounded-md text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <span>TEST REGRESSION (STILL FAILS)</span>
              </button>
            </div>
          </div>

          {/* Retest Verification Checklist */}
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">RETEST VERIFICATION CHECKLIST</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {retestChecklist.map((item, idx) => {
                const isVerified = (targetFinding.status || '').toLowerCase() === 'verified';
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className={`w-4 h-4 ${isVerified ? 'text-[#087F5B]' : 'text-[#64746A]'}`} />
                    <span className={isVerified ? 'font-bold text-[#17211B]' : 'text-[#64746A]'}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before & After State Evaluation (Master Prompt Section 17 & Requirement 8) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BEFORE: PREVIOUS STATE */}
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                <span className="text-xs font-extrabold text-[#17211B]">PREVIOUS ASSESSMENT CONDITION</span>
                <span className="badge-crimson text-[10px] font-bold px-2.5 py-0.5 rounded">
                  DETECTED
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[#64746A] block text-[11px]">Evaluated Security Rule:</span>
                  <span className="text-[#17211B] font-bold">{targetFinding.category} Baseline Rule</span>
                </div>
                <div>
                  <span className="text-[#64746A] block text-[11px]">Observed Baseline Condition:</span>
                  <span className="text-[#C62828] font-bold">{targetFinding.retest?.previousCondition || 'Vulnerability Condition Detected'}</span>
                </div>
                <p className="text-[11px] font-sans text-[#64746A] bg-white p-2.5 rounded border border-[#DDE5DF]">
                  {targetFinding.description}
                </p>
              </div>
            </div>

            {/* AFTER: CURRENT STATE */}
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                <span className="text-xs font-extrabold text-[#17211B]">CURRENT RETEST CONDITION</span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  (targetFinding.status || '').toLowerCase() === 'verified'
                    ? 'badge-emerald'
                    : ((targetFinding.status || '').toLowerCase() === 'reopened' || (targetFinding.status || '').toLowerCase() === 'regression')
                    ? 'badge-crimson'
                    : 'badge-amber'
                }`}>
                  {(targetFinding.status || '').toLowerCase() === 'verified'
                    ? 'CONDITION NOT DETECTED' 
                    : ((targetFinding.status || '').toLowerCase() === 'reopened' || (targetFinding.status || '').toLowerCase() === 'regression')
                    ? 'CONDITION STILL DETECTED'
                    : 'AWAITING RETEST'}
                </span>
              </div>

              {isRunning && retestProgress && (
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between text-xs text-[#087F5B] font-bold">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {retestProgress.stepName}
                    </span>
                    <span className="font-mono">{retestProgress.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#F7F8F5] rounded-full h-2 border border-[#DDE5DF] overflow-hidden">
                    <div className="bg-[#087F5B] h-full transition-all duration-300" style={{ width: `${retestProgress.progressPercent}%` }}></div>
                  </div>
                </div>
              )}

              {(targetFinding.status || '').toLowerCase() === 'verified' && !isRunning && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#64746A] block text-[11px]">Observed Current Condition:</span>
                    <span className="text-[#087F5B] font-bold">Condition Not Detected (Verified Clean)</span>
                  </div>

                  <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-3.5 rounded-md text-[#064E3B] text-xs font-sans space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
                      FINAL STATUS: <span className="text-[#087F5B] font-mono">VERIFIED</span>
                    </p>
                    <p className="text-[11px] text-[#17211B]">
                      Remediation logic verified clean. Vulnerability successfully resolved in World Monitor target scope.
                    </p>
                  </div>
                </div>
              )}

              {targetFinding.status === 'REOPENED' && !isRunning && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#64746A] block text-[11px]">Observed Current Condition:</span>
                    <span className="text-[#C62828] font-bold">Condition Still Detected (Vulnerability Persists)</span>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-md text-[#C62828] text-xs font-sans space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 text-sm">
                      <XCircle className="w-4 h-4 text-[#C62828]" />
                      FINAL STATUS: <span className="text-[#C62828] font-mono">REOPENED</span>
                    </p>
                    <p className="text-[11px] text-[#17211B]">
                      Retest failed. Vulnerability condition persisted during retest execution. Finding reopened for developer remediation.
                    </p>
                  </div>
                </div>
              )}

              {targetFinding.status !== 'VERIFIED' && targetFinding.status !== 'REOPENED' && !isRunning && (
                <p className="text-xs text-[#64746A] italic text-center py-4">
                  Click 'Run Retest (Simulate Fix)' or 'Run Retest (Simulate Fail)' to test both state machine demo outcomes.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
