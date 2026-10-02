import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, Loader2, Play, XCircle } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Closed-Loop Verification Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Retesting & Verification Runner
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Empirical before/after verification proving vulnerability remediation on target <strong className="text-[#16201B]">World Monitor</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            PASSED & REOPENED Verification
          </span>
        </div>
      </div>

      {/* Select Finding Card */}
      <div className="panel-card p-5 space-y-3">
        <label className="text-xs font-bold text-[#16201B] uppercase tracking-wider block">
          Select Finding to Retest & Verify
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {findings.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFindingId(f.id)}
              className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                selectedFindingId === f.id
                  ? 'bg-[#EBF5F0] border-[#0A6E4F] ring-2 ring-[#0A6E4F]/20 shadow-xs'
                  : 'bg-[#F8F9F6] border-[#DEE5E0] hover:bg-white hover:border-[#CBD5CE]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#0A6E4F]">{f.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  f.status === 'VERIFIED' ? 'badge-emerald' : f.status === 'REOPENED' ? 'badge-crimson' : 'badge-amber'
                }`}>
                  {f.status}
                </span>
              </div>
              <p className="font-bold text-[#16201B] mt-1.5 truncate">{f.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Retest Workspace */}
      {targetFinding && (
        <div className="panel-card p-5 sm:p-6 space-y-6">
          {/* Header Info & Dual Outcome Execution Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#0A6E4F] bg-[#EBF5F0] border border-[#B6DEC9] px-2 py-0.5 rounded">
                  {targetFinding.id}
                </span>
                <span className="text-xs text-[#56655D] font-semibold">{targetFinding.category}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#16201B] mt-1">{targetFinding.title}</h2>
              <p className="text-xs text-[#56655D]">Component: {targetFinding.component}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRunRetest(null)}
                disabled={isRunning}
                className="btn-primary"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{targetFinding.id.startsWith('F-REAL-') || targetFinding.isRealCheck ? 'Run Real Retest on Target Source' : 'Run Automated Retest'}</span>
              </button>
            </div>
          </div>

          {/* Retest Verification Checklist */}
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">Retest Verification Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {retestChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-4 h-4 ${targetFinding.status === 'VERIFIED' ? 'text-[#0A6E4F]' : 'text-[#85948C]'}`} />
                  <span className={targetFinding.status === 'VERIFIED' ? 'font-bold text-[#16201B]' : 'text-[#56655D]'}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Before & After State Evaluation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BEFORE: PREVIOUS STATE */}
            <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-2">
                <span className="text-xs font-bold text-[#16201B]">PREVIOUS ASSESSMENT CONDITION</span>
                <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded">
                  DETECTED
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[#85948C] block text-[10px]">Evaluated Security Rule:</span>
                  <span className="text-[#16201B] font-bold">{targetFinding.category} Baseline Rule</span>
                </div>
                <div>
                  <span className="text-[#85948C] block text-[10px]">Observed Baseline Condition:</span>
                  <span className="text-[#C53030] font-bold">{targetFinding.retest?.previousCondition || 'Vulnerability Condition Detected'}</span>
                </div>
                <p className="text-[11px] font-sans text-[#56655D] bg-white p-2.5 rounded border border-[#DEE5E0]">
                  {targetFinding.description}
                </p>
              </div>
            </div>

            {/* AFTER: CURRENT STATE */}
            <div className="bg-white border border-[#DEE5E0] rounded-lg p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-2">
                <span className="text-xs font-bold text-[#16201B]">CURRENT RETEST CONDITION</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  targetFinding.status === 'VERIFIED'
                    ? 'badge-emerald'
                    : targetFinding.status === 'REOPENED'
                    ? 'badge-crimson'
                    : 'badge-amber'
                }`}>
                  {targetFinding.status === 'VERIFIED' 
                    ? 'CONDITION NOT DETECTED' 
                    : targetFinding.status === 'REOPENED'
                    ? 'CONDITION STILL DETECTED'
                    : 'AWAITING RETEST'}
                </span>
              </div>

              {isRunning && retestProgress && (
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between text-xs text-[#0A6E4F] font-bold">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {retestProgress.stepName}
                    </span>
                    <span className="font-mono">{retestProgress.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#F8F9F6] rounded-full h-2 border border-[#DEE5E0] overflow-hidden">
                    <div className="bg-[#0A6E4F] h-full transition-all duration-300" style={{ width: `${retestProgress.progressPercent}%` }}></div>
                  </div>
                </div>
              )}

              {targetFinding.status === 'VERIFIED' && !isRunning && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#85948C] block text-[10px]">Observed Current Condition:</span>
                    <span className="text-[#0A6E4F] font-bold">Condition Not Detected (Verified Clean)</span>
                  </div>

                  <div className="bg-[#EBF5F0] border border-[#B6DEC9] p-3.5 rounded-md text-[#064E3B] text-xs font-sans space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
                      FINAL STATUS: <span className="text-[#0A6E4F] font-mono">VERIFIED</span>
                    </p>
                    <p className="text-[11px] text-[#16201B]">
                      Remediation logic verified clean. Vulnerability successfully resolved in World Monitor target scope.
                    </p>
                  </div>
                </div>
              )}

              {targetFinding.status === 'REOPENED' && !isRunning && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#85948C] block text-[10px]">Observed Current Condition:</span>
                    <span className="text-[#C53030] font-bold">Condition Still Detected (Vulnerability Persists)</span>
                  </div>

                  <div className="bg-[#FDF2F2] border border-[#FBC4C4] p-3.5 rounded-md text-[#C53030] text-xs font-sans space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      <XCircle className="w-4 h-4 text-[#C53030]" />
                      FINAL STATUS: <span className="text-[#C53030] font-mono">REOPENED</span>
                    </p>
                    <p className="text-[11px] text-[#16201B]">
                      Retest failed. Vulnerability condition persisted during retest execution. Finding reopened for developer remediation.
                    </p>
                  </div>
                </div>
              )}

              {targetFinding.status !== 'VERIFIED' && targetFinding.status !== 'REOPENED' && !isRunning && (
                <p className="text-xs text-[#56655D] italic text-center py-4">
                  Click 'Run Real Retest on Target Source' to execute verification against target code.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
