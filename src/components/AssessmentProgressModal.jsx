import React from 'react';
import { ShieldCheck, CheckCircle2, Loader2, Sparkles, X, Target, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentProgressModal() {
  const { assessmentModalOpen, setAssessmentModalOpen, assessmentProgress } = useApp();

  if (!assessmentModalOpen || !assessmentProgress) return null;

  const { progressPercent = 0, stepName, isFinished, domains = [] } = assessmentProgress;

  return (
    <div className="fixed inset-0 bg-[#17211B]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#DDE5DF] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Top Scan Line Animation */}
        {!isFinished && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#087F5B] via-[#064E3B] to-[#20C997] animate-pulse"></div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#E6F4F1] border border-[#B2DFDB] flex items-center justify-center text-[#087F5B]">
              {isFinished ? <ShieldCheck className="w-6 h-6 text-[#087F5B]" /> : <Loader2 className="w-6 h-6 animate-spin text-[#087F5B]" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#17211B]">
                {isFinished ? 'Security Assessment Complete' : 'Executing Security Assessment'}
              </h3>
              <p className="text-xs text-[#64746A]">
                Evaluating safe non-destructive security checks across 7 core domains
              </p>
            </div>
          </div>
          {isFinished && (
            <button
              onClick={() => setAssessmentModalOpen(false)}
              className="text-[#64746A] hover:text-[#17211B] p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar & Stat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#17211B] font-bold flex items-center gap-1.5">
              {!isFinished && <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-ping"></span>}
              {stepName || 'Running security tests...'}
            </span>
            <span className="font-mono text-[#087F5B] font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#F7F8F5] rounded-full h-2.5 overflow-hidden border border-[#DDE5DF]">
            <div
              className={`h-full transition-all duration-300 ${
                isFinished ? 'bg-[#087F5B]' : 'bg-[#087F5B]'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Live Domain Progress List */}
        {domains.length > 0 ? (
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-3 space-y-1.5 max-h-48 overflow-y-auto">
            <p className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider mb-2">Security Domain Execution Status (7 Domains)</p>
            {domains.filter(d => !d.isPrep).map((dom) => (
              <div key={dom.id} className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-white transition-colors">
                <span className="font-bold text-[#17211B] flex items-center gap-2">
                  {dom.status === 'Passed' && <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />}
                  {dom.status === 'Findings Detected' && <XCircle className="w-3.5 h-3.5 text-[#C62828]" />}
                  {dom.status === 'Running' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087F5B]" />}
                  {dom.status === 'Pending' && <span className="w-2 h-2 rounded-full bg-[#DDE5DF]"></span>}
                  <span>{dom.name}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  dom.status === 'Passed'
                    ? 'badge-emerald'
                    : dom.status === 'Findings Detected'
                    ? 'badge-crimson'
                    : dom.status === 'Running'
                    ? 'badge-amber'
                    : 'text-[#64746A]'
                }`}>
                  {dom.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-4 text-center space-y-1">
            <p className="text-xs text-[#17211B] font-bold">Automated Security Testing In Progress</p>
            <p className="text-[11px] text-[#64746A]">Executing checks across 7 domains against target endpoint</p>
          </div>
        )}

        {/* Footer info or dismiss button */}
        {isFinished ? (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-[#087F5B] font-semibold">
              <Sparkles className="w-4 h-4 text-[#087F5B]" />
              <span>Closed-loop finding evidence persisted.</span>
            </div>
            <button
              onClick={() => setAssessmentModalOpen(false)}
              className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2 rounded-md text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              View Findings & Results
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-[#64746A] text-center italic">
            Executing safe non-destructive security evaluation...
          </p>
        )}
      </div>
    </div>
  );
}
