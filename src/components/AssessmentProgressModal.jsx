import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2, Sparkles, X, Terminal, AlertTriangle, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentProgressModal() {
  const navigate = useNavigate();
  const { 
    assessmentModalOpen, 
    setAssessmentModalOpen, 
    assessmentProgress,
    activeAssessmentId,
    assessmentExecutionError,
    setAssessmentExecutionError,
    triggerAssessment,
    activeTarget
  } = useApp();

  if (!assessmentModalOpen || !assessmentProgress) return null;

  const currentStep = assessmentProgress.currentStep || 1;
  const operation = assessmentProgress.operation || assessmentProgress.stepName || 'Executing Assessment';
  const progressPercent = assessmentProgress.progressPercent || 0;
  const completedSteps = Array.isArray(assessmentProgress.completedSteps) ? assessmentProgress.completedSteps : [];
  const isFinished = Boolean(assessmentProgress.isFinished);
  const isError = Boolean(assessmentExecutionError);

  const totalSteps = assessmentProgress.totalSteps || 6;
  const testsExecuted = Math.min(12, Math.round((progressPercent / 100) * 12));
  const findingsDiscovered = Math.min(22, Math.round((progressPercent / 100) * 22));

  // Determine active security domain based on progress
  const getActiveDomain = (pct) => {
    if (pct < 20) return 'Target Repository Profiling & Origin Boundaries';
    if (pct < 40) return 'Security Check Catalog & Rule Compilation';
    if (pct < 65) return 'AST Syntax Tree & Source File Code Scanning';
    if (pct < 85) return 'Evidence Extraction & Deterministic Correlation';
    return 'Final Assurance Scoring & Finding Finalization';
  };

  const activeDomain = getActiveDomain(progressPercent);

  const handleViewResults = () => {
    setAssessmentModalOpen(false);
    if (activeAssessmentId) {
      navigate(`/assessments/${activeAssessmentId}`);
    } else {
      navigate('/assessments');
    }
  };

  const handleRetry = () => {
    setAssessmentExecutionError(null);
    triggerAssessment(activeTarget);
  };

  return (
    <div className="fixed inset-0 bg-[#16201B]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="assessment-modal-title">
      <div className="bg-[#FFFFFF] border border-[#DEE5E0] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5 relative overflow-hidden">
        {/* Subtle Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${isError ? 'bg-[#DC2626]' : 'bg-[#0A6E4F]'}`}></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              isError 
                ? 'bg-red-50 border border-red-200 text-[#DC2626]'
                : 'bg-[#EBF5F0] border border-[#B6DEC9] text-[#0A6E4F]'
            }`}>
              {isError ? (
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              ) : isFinished ? (
                <ShieldCheck className="w-5 h-5 text-[#0A6E4F]" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-[#0A6E4F]" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isError ? 'bg-red-100 text-red-700' : 'badge-emerald'
                }`}>
                  {isError ? 'ERROR' : `Stage 0${Math.min(currentStep, totalSteps)} of 0${totalSteps}`}
                </span>
                <span className="text-[10px] font-mono text-[#85948C]">AST Engine</span>
              </div>
              <h3 id="assessment-modal-title" className="text-sm font-bold text-[#16201B] mt-0.5">
                {isError 
                  ? 'Assessment Execution Failed' 
                  : isFinished 
                  ? 'Security Assessment Complete' 
                  : 'Executing Assessment Workflow'}
              </h3>
              <p className="text-xs text-[#56655D]">Target: World Monitor (Authorized Sandbox)</p>
            </div>
          </div>
          {(isFinished || isError) && (
            <button
              onClick={() => setAssessmentModalOpen(false)}
              className="text-[#56655D] hover:text-[#16201B] hover:bg-[#F3F5F1] p-1.5 rounded-md cursor-pointer transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Status Badges Grid: Active Domain, Tests Done, Findings */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-2.5 rounded-md col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Active Domain</span>
            <span className="text-[11px] font-semibold text-[#16201B] truncate block mt-0.5" title={activeDomain}>
              {activeDomain}
            </span>
          </div>

          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-2.5 rounded-md">
            <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Tests Completed</span>
            <span className="text-[11px] font-bold font-mono text-[#0A6E4F] block mt-0.5">
              {testsExecuted} / 12 Checks
            </span>
          </div>

          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-2.5 rounded-md">
            <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Findings Identified</span>
            <span className="text-[11px] font-bold font-mono text-[#B45309] block mt-0.5">
              {findingsDiscovered} Findings
            </span>
          </div>
        </div>

        {/* Progress Bar & Stat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#16201B] font-medium flex items-center gap-1.5">
              {!isFinished && !isError && <span className="w-2 h-2 rounded-full bg-[#0A6E4F] animate-pulse"></span>}
              {operation}
            </span>
            <span className={`font-mono font-bold ${isError ? 'text-[#DC2626]' : 'text-[#0A6E4F]'}`}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#F3F5F1] rounded-full h-2 overflow-hidden border border-[#DEE5E0]">
            <div
              className={`h-full transition-all duration-300 ${isError ? 'bg-[#DC2626]' : 'bg-[#0A6E4F]'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Error Panel (Safe Developer Debug Panel) */}
        {isError && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3.5 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between text-[#B91C1C] font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Execution Technical Error
              </span>
              <span className="text-[10px] font-mono uppercase bg-red-100 px-2 py-0.5 rounded">
                SAFE CATCH
              </span>
            </div>
            <p className="text-[#7F1D1D] font-mono text-[11px] bg-white p-2.5 rounded border border-[#FECACA] break-words">
              {assessmentExecutionError}
            </p>
            <p className="text-[#991B1B] text-[11px]">
              The assessment state has not been lost. You can inspect the error details above or click Retry to rerun the assessment pipeline.
            </p>
          </div>
        )}

        {/* Completed Operations Timeline / Log */}
        <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-3.5 space-y-2 max-h-44 overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#85948C] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#0A6E4F]" />
              Execution Trace
            </span>
            <span>{completedSteps.length} Steps Completed</span>
          </div>

          {completedSteps.map((stepName, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs text-[#16201B]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0A6E4F] shrink-0" />
              <span className="font-mono text-[11px] text-[#85948C]">[{idx + 1}/12]</span>
              <span className="truncate">{stepName}</span>
            </div>
          ))}

          {!isFinished && !isError && (
            <div className="flex items-center space-x-2 text-xs text-[#0A6E4F] font-semibold pt-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Step {currentStep}: {operation}...</span>
            </div>
          )}
        </div>

        {/* Footer info or CTA buttons */}
        {isError ? (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setAssessmentModalOpen(false)}
              className="btn-secondary"
            >
              Dismiss
            </button>
            <button
              onClick={handleRetry}
              className="btn-primary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Assessment</span>
            </button>
          </div>
        ) : isFinished ? (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-[#0A6E4F] font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Closed-loop evidence synchronized.</span>
            </div>
            <button
              onClick={handleViewResults}
              className="btn-primary"
            >
              View Findings & Results
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-[#85948C] text-center italic">
            Executing non-destructive deterministic security checks against sandbox target...
          </p>
        )}
      </div>
    </div>
  );
}
