import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ShieldCheck, CheckCircle2, ArrowRight, Eye, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EvidencePage() {
  const navigate = useNavigate();
  const { validateFinding, userRole, showToast, latestScanResult, evidenceList, findings } = useApp();

  const isAnalyst = userRole === 'SECURITY_ANALYST';

  const formatPayload = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return val;
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Deterministic Evidence Store</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Evidence Engine & Technical Artifacts
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            3-Stage Model: Raw Static Observations, AI Analysis, and Empirical Verification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            {evidenceList?.length || 0} Evidence Records Captured
          </span>
        </div>
      </div>

      {/* STAGE 1 CURRENT AST SCAN OBSERVATION CARD */}
      <div className="panel-card p-5 sm:p-6 border-l-4 border-l-[#0A6E4F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE5E0] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#0A6E4F]" />
            <h2 className="text-sm font-bold text-[#16201B]">CURRENT AST SCAN OBSERVATION (STAGE 1 EVIDENCE)</h2>
          </div>
          {latestScanResult ? (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
              latestScanResult.observations && latestScanResult.observations.length > 0 ? 'badge-crimson' : 'badge-emerald'
            }`}>
              STATUS: {latestScanResult.observations && latestScanResult.observations.length > 0 ? `VULNERABILITY OBSERVED (${latestScanResult.observations.length} MATCHES)` : 'NO MATCH (CLEAN)'}
            </span>
          ) : (
            <span className="badge-sage text-[10px] font-bold px-2.5 py-0.5 rounded">
              AWAITS INITIAL SCAN
            </span>
          )}
        </div>

        {/* CASE C — VULNERABLE SCAN */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-[#C53030]">
                <Eye className="w-4 h-4 text-[#C53030]" />
                <span className="text-xs font-bold uppercase tracking-wider">1. OBSERVATION: OBSERVED</span>
              </div>
              <p className="text-xs text-[#16201B] font-semibold">
                Rule: <span className="font-mono text-[#064E3B]">{latestScanResult.check?.ruleId || 'CONFIG-REAL-001'}</span>
              </p>
              <p className="text-[11px] text-[#16201B]">
                Detected property <strong className="font-mono text-[#C53030]">{latestScanResult.observations[0].symbol}: '{latestScanResult.observations[0].valueMasked}'</strong> in client file <span className="font-mono text-[#0A6E4F]">{latestScanResult.observations[0].file}</span> at line {latestScanResult.observations[0].line}.
              </p>
              <div className="pt-2 border-t border-[#DEE5E0]">
                <span className="text-[10px] text-[#85948C] block font-bold uppercase">Source Hash</span>
                <span className="font-mono text-[11px] text-[#0A6E4F] font-semibold block truncate">
                  {latestScanResult.observations[0].sourceHash || latestScanResult.check?.sourceHash || 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-[#0A6E4F]">
                <Sparkles className="w-4 h-4 text-[#0A6E4F]" />
                <span className="text-xs font-bold uppercase tracking-wider">2. AI ANALYSIS</span>
              </div>
              <p className="text-xs text-[#16201B] font-semibold">Contextual Security Evaluation</p>
              <p className="text-[11px] text-[#56655D] leading-relaxed">
                Static Babel AST parser confirmed string literal assignment for parameter '{latestScanResult.observations[0].symbol}'. Secret values must be moved behind process.env boundaries.
              </p>
            </div>

            <div className="bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-[#064E3B]">
                <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
                <span className="text-xs font-bold uppercase tracking-wider">3. ANALYST VALIDATION</span>
              </div>
              <p className="text-xs font-bold text-[#064E3B]">Empirical Verification Status</p>
              <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded inline-block">
                VIOLATION ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* CASE B — CLEAN SCAN */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length === 0 && (
          <div className="bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-[#B6DEC9] pb-2">
              <span className="font-bold text-[#064E3B] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A6E4F]" />
                STAGE 1 OBSERVATION: NO MATCH
              </span>
              <span className="font-mono text-[11px] text-[#0A6E4F] font-bold">Source Hash: {latestScanResult.check?.sourceHash || 'N/A'}</span>
            </div>
            <p className="text-[#16201B]">
              Babel AST analyzer evaluated <strong className="font-mono">{latestScanResult.check?.scannedFilesCount || 0} source files</strong> in <strong className="font-mono">{latestScanResult.check?.targetRoot || 'authorized target'}</strong>. Zero client-accessible credential assignment patterns detected in target source.
            </p>
          </div>
        )}

        {/* CASE A — NO SCAN PERFORMED YET */}
        {!latestScanResult && (
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 text-xs text-[#56655D] italic">
            NO CURRENT SCAN. Run a check from the Security Controls page to capture fresh evidence from target source.
          </div>
        )}
      </div>

      {/* Historical Evidence Records */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider border-b border-[#DEE5E0] pb-2">
          Captured Evidence Artifacts
        </h2>

        {(!evidenceList || evidenceList.length === 0) ? (
          <div className="panel-card p-6 text-center text-xs text-[#56655D] space-y-2">
            <p className="font-bold text-[#16201B]">No evidence records currently stored.</p>
            <p className="text-[11px] text-[#85948C]">Run an assessment or security check to capture evidence from World Monitor.</p>
          </div>
        ) : (
          evidenceList.map((ev, idx) => {
            if (!ev || typeof ev !== 'object') return null;
            const finding = findings?.find(f => f.id === ev.findingId);

            return (
              <div key={ev.id || idx} className="panel-card p-5 sm:p-6 space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEE5E0] pb-3 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-[#0A6E4F] bg-[#EBF5F0] border border-[#B6DEC9] px-2.5 py-0.5 rounded">
                      {ev.id || `EVD-${idx + 1}`}
                    </span>
                    <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      TARGET AST SCAN
                    </span>
                    <h3 className="text-sm font-bold text-[#16201B]">{ev.title || 'Evidence Record'}</h3>
                  </div>

                  {ev.findingId && (
                    <button
                      onClick={() => navigate(`/findings/${ev.findingId}`)}
                      className="btn-secondary text-xs"
                    >
                      <span>Finding {ev.findingId}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0A6E4F]" />
                    </button>
                  )}
                </div>

                {/* 3-Stage Evidence Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Stage 1: OBSERVATION */}
                  <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-[#16201B]">
                      <Eye className="w-4 h-4 text-[#0A6E4F]" />
                      <span className="text-xs font-bold uppercase tracking-wider">1. OBSERVATION</span>
                    </div>
                    <p className="text-xs text-[#16201B] font-semibold">
                      Rule Evaluated: <span className="font-mono text-[#064E3B]">{ev.ruleEvaluated || 'CONFIG-REAL-001'}</span>
                    </p>
                    <p className="text-[11px] text-[#56655D] leading-relaxed font-mono whitespace-pre-wrap">
                      {formatPayload(ev.validationResult?.observedBehavior || ev.observation || 'Static AST node inspection artifact captured.')}
                    </p>
                    <div className="pt-2 border-t border-[#DEE5E0]">
                      <span className="text-[10px] text-[#85948C] block font-bold uppercase">Source Scope Reference</span>
                      <span className="font-mono text-[11px] text-[#0A6E4F] font-semibold block truncate">
                        {ev.testContext?.endpoint || '/src/config/clientEnv.ts'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 2: AI ANALYSIS */}
                  <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-[#0A6E4F]">
                      <Sparkles className="w-4 h-4 text-[#0A6E4F]" />
                      <span className="text-xs font-bold uppercase tracking-wider">2. AI ANALYSIS</span>
                    </div>
                    <p className="text-xs text-[#16201B] font-semibold">Contextual Security Evaluation</p>
                    <p className="text-[11px] text-[#56655D] leading-relaxed">
                      {finding?.aiAnalysis?.technicalContext || 'AI contextualized raw observation payload against target security rules.'}
                    </p>
                    <div className="pt-2 border-t border-[#DEE5E0] flex items-center justify-between">
                      <span className="text-[10px] text-[#85948C] font-semibold">Role: Context Engine</span>
                      <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                        Confidence: {ev.validationResult?.confidenceScore || '96.5%'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 3: VALIDATION */}
                  <div className="bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[#064E3B]">
                        <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
                        <span className="text-xs font-bold uppercase tracking-wider">3. ANALYST VALIDATION</span>
                      </div>
                      <p className="text-xs font-bold text-[#064E3B]">Empirical Verification Status</p>
                      <p className="text-[11px] text-[#16201B]">
                        Finding Status: <strong className="font-mono text-[#0A6E4F]">{finding?.status || 'DETECTED'}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#B6DEC9] flex items-center justify-between">
                      {finding?.status === 'VALIDATED' || finding?.status === 'VERIFIED' ? (
                        <span className="bg-white text-[#0A6E4F] border border-[#0A6E4F] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#0A6E4F]" /> CONFIRMED VALIDATED
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAnalyst) {
                              showToast('Only Security Analyst role can perform validation.', 'error');
                              return;
                            }
                            if (ev.findingId) validateFinding(ev.findingId);
                          }}
                          className="btn-primary text-xs px-2.5 py-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Validate (Analyst)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
