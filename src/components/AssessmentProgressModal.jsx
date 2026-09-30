import React from 'react';
import { ShieldCheck, CheckCircle, Loader2, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentProgressModal() {
  const { assessmentModalOpen, setAssessmentModalOpen, assessmentProgress } = useApp();

  if (!assessmentModalOpen || !assessmentProgress) return null;

  const currentStep = assessmentProgress.currentStep || 1;
  const totalSteps = assessmentProgress.totalSteps || 4;
  const operation = assessmentProgress.operation || assessmentProgress.stepName || 'Executing Assessment';
  const progressPercent = assessmentProgress.progressPercent || 0;
  const completedSteps = Array.isArray(assessmentProgress.completedSteps) ? assessmentProgress.completedSteps : [];
  const isFinished = Boolean(assessmentProgress.isFinished);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Scan Line Animation */}
        {!isFinished && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-400 to-purple-600 animate-pulse"></div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
              {isFinished ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <Loader2 className="w-6 h-6 animate-spin text-blue-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isFinished ? 'Assessment Complete' : 'Executing Security Assessment'}
              </h3>
              <p className="text-xs text-slate-400">Target: World Monitor (WM-2026-001)</p>
            </div>
          </div>
          {isFinished && (
            <button
              onClick={() => setAssessmentModalOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar & Stat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              {!isFinished && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>}
              {operation}
            </span>
            <span className="font-mono text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isFinished ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Completed Operations Timeline / Log */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Step Log</p>
          {completedSteps.map((stepName, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="font-mono text-[11px] text-slate-400">[{idx + 1}/12]</span>
              <span>{stepName}</span>
            </div>
          ))}
          {!isFinished && (
            <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold animate-pulse pt-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              <span>Step {currentStep}: {operation}...</span>
            </div>
          )}
        </div>

        {/* Footer info or dismiss button */}
        {isFinished ? (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Closed-loop finding evidence updated.</span>
            </div>
            <button
              onClick={() => setAssessmentModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md text-xs font-semibold cursor-pointer"
            >
              View Findings & Results
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 text-center italic">
            Executing non-destructive deterministic security evaluation...
          </p>
        )}
      </div>
    </div>
  );
}
