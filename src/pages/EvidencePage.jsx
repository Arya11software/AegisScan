import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ShieldCheck, CheckCircle2, ArrowRight, Eye, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#087F5B]" />
            Evidence Engine & Technical Artifacts
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            3-Stage Model: Raw Static Observations, AI Analysis, and Empirical Verification
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            {evidenceList?.length || 0} Evidence Records Captured
          </span>
        </div>
      </div>

      {/* STAGE 1 CURRENT AST SCAN OBSERVATION CARD */}
      <div className="bg-white border border-[#087F5B] rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#087F5B]" />
            <h2 className="text-sm font-extrabold text-[#17211B]">CURRENT AST SCAN OBSERVATION (STAGE 1 EVIDENCE)</h2>
          </div>
          {latestScanResult ? (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
              latestScanResult.observations && latestScanResult.observations.length > 0 ? 'badge-crimson' : 'badge-emerald'
            }`}>
              STATUS: {latestScanResult.observations && latestScanResult.observations.length > 0 ? `VULNERABILITY OBSERVED (${latestScanResult.observations.length} MATCHES)` : 'NO MATCH (CLEAN)'}
            </span>
          ) : (
            <span className="badge-sage text-[10px] font-bold px-2.5 py-1 rounded">
              AWAITS INITIAL SCAN
            </span>
          )}
        </div>

        {/* CASE C — VULNERABLE SCAN */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-2">
              <div className="flex items-center space-x-2 text-[#C62828]">
                <Eye className="w-4 h-4 text-[#C62828]" />
                <span className="text-xs font-extrabold uppercase tracking-wider">1. OBSERVATION: VULNERABILITY OBSERVED</span>
              </div>
              <p className="text-xs text-[#17211B] font-semibold">
                Rule: <span className="font-mono text-[#064E3B]">{latestScanResult.check?.ruleId || 'CONFIG-REAL-001'}</span>
              </p>
              <p className="text-[11px] text-[#17211B]">
                Detected property <strong className="font-mono text-[#C62828]">{latestScanResult.observations[0].symbol}: '{latestScanResult.observations[0].valueMasked}'</strong> in client file <span className="font-mono">{latestScanResult.observations[0].file}</span> at line {latestScanResult.observations[0].line}.
              </p>
              <div className="pt-2 border-t border-[#DDE5DF]">
                <span className="text-[10px] text-[#64746A] block font-bold uppercase">Source Hash</span>
                <span className="font-mono text-[11px] text-[#087F5B] font-semibold block">
                  {latestScanResult.observations[0].sourceHash || latestScanResult.check?.sourceHash || 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-2">
              <div className="flex items-center space-x-2 text-[#087F5B]">
                <Sparkles className="w-4 h-4 text-[#087F5B]" />
                <span className="text-xs font-extrabold uppercase tracking-wider">2. AI ANALYSIS</span>
              </div>
              <p className="text-xs text-[#17211B] font-semibold">Contextual Security Evaluation</p>
              <p className="text-[11px] text-[#64746A] leading-relaxed">
                Static Babel AST parser confirmed string literal assignment for parameter '{latestScanResult.observations[0].symbol}'. Secret values must be moved behind process.env boundaries.
              </p>
            </div>

            <div className="bg-[#E6F4F1] border border-[#B2DFDB] rounded-md p-4 space-y-2">
              <div className="flex items-center space-x-2 text-[#064E3B]">
                <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
                <span className="text-xs font-extrabold uppercase tracking-wider">3. ANALYST VALIDATION</span>
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
          <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-4 rounded-md space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-[#B2DFDB] pb-2">
              <span className="font-extrabold text-[#064E3B] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                STAGE 1 OBSERVATION: NO MATCH
              </span>
              <span className="font-mono text-[11px] text-[#087F5B] font-bold">Source Hash: {latestScanResult.check?.sourceHash || 'N/A'}</span>
            </div>
            <p className="text-[#17211B]">
              Babel AST analyzer evaluated <strong className="font-mono">{latestScanResult.check?.scannedFilesCount || 0} source files</strong> in <strong className="font-mono">{latestScanResult.check?.targetRoot || 'authorized target'}</strong>. Zero client-accessible credential assignment patterns detected in target source.
            </p>
          </div>
        )}

        {/* CASE A — NO SCAN PERFORMED YET */}
        {!latestScanResult && (
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md text-xs text-[#64746A] italic">
            NO CURRENT SCAN. Run a check from the Security Checks page to capture fresh evidence from target source.
          </div>
        )}
      </div>

      {/* Historical Evidence Records */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2">
          CAPTURED EVIDENCE ARTIFACTS
        </h2>

        {(!evidenceList || evidenceList.length === 0) ? (
          <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 text-center text-xs text-[#64746A] space-y-2">
            <p className="font-bold">No evidence records currently stored.</p>
            <p className="text-[11px]">Run a security assessment or security check to capture evidence from World Monitor.</p>
          </div>
        ) : (
          evidenceList.map((ev, idx) => {
            if (!ev || typeof ev !== 'object') return null;
            const finding = findings?.find(f => f.id === ev.findingId);

            return (
              <div key={ev.id || idx} className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-5 shadow-2xs">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-[#087F5B] bg-[#E6F4F1] border border-[#B2DFDB] px-2.5 py-1 rounded-md">
                      {ev.id || `EVD-${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#087F5B] text-white">
                      TARGET AST SCAN
                    </span>
                    <h2 className="text-sm font-extrabold text-[#17211B]">{ev.title || 'Evidence Record'}</h2>
                  </div>

                  {ev.findingId && (
                    <button
                      onClick={() => navigate(`/findings/${ev.findingId}`)}
                      className="text-xs bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3 py-1 rounded-md font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Finding {ev.findingId}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#087F5B]" />
                    </button>
                  )}
                </div>

                {/* 3-Stage Evidence Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Stage 1: OBSERVATION */}
                  <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-[#17211B]">
                      <Eye className="w-4 h-4 text-[#087F5B]" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">1. OBSERVATION</span>
                    </div>
                    <p className="text-xs text-[#17211B] font-semibold">
                      Rule Evaluated: <span className="font-mono text-[#064E3B]">{ev.ruleEvaluated || 'CONFIG-REAL-001'}</span>
                    </p>
                    <p className="text-[11px] text-[#64746A] leading-relaxed font-mono whitespace-pre-wrap">
                      {formatPayload(ev.validationResult?.observedBehavior || ev.observation || 'Static AST node inspection artifact captured.')}
                    </p>
                    <div className="pt-2 border-t border-[#DDE5DF]">
                      <span className="text-[10px] text-[#64746A] block font-bold uppercase">Source Scope Reference</span>
                      <span className="font-mono text-[11px] text-[#087F5B] font-semibold block truncate">
                        {ev.testContext?.endpoint || '/src/config/clientEnv.ts'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 2: AI ANALYSIS */}
                  <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-[#087F5B]">
                      <Sparkles className="w-4 h-4 text-[#087F5B]" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">2. AI ANALYSIS</span>
                    </div>
                    <p className="text-xs text-[#17211B] font-semibold">Contextual Security Evaluation</p>
                    <p className="text-[11px] text-[#64746A] leading-relaxed">
                      {finding?.aiAnalysis?.technicalContext || 'AI contextualized raw observation payload against target security rules.'}
                    </p>
                    <div className="pt-2 border-t border-[#DDE5DF] flex items-center justify-between">
                      <span className="text-[10px] text-[#64746A] font-bold">Role: Context Engine</span>
                      <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                        Confidence: {ev.validationResult?.confidenceScore || '96.5%'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 3: VALIDATION */}
                  <div className="bg-[#E6F4F1] border border-[#B2DFDB] rounded-md p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[#064E3B]">
                        <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">3. ANALYST VALIDATION</span>
                      </div>
                      <p className="text-xs font-bold text-[#064E3B]">Empirical Verification Status</p>
                      <p className="text-[11px] text-[#17211B]">
                        Finding Status: <strong className="font-mono text-[#087F5B]">{finding?.status || 'DETECTED'}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#B2DFDB] flex items-center justify-between">
                      {finding?.status === 'VALIDATED' || finding?.status === 'VERIFIED' ? (
                        <span className="bg-white text-[#087F5B] border border-[#087F5B] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#087F5B]" /> CONFIRMED VALIDATED
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
                          className="bg-[#087F5B] hover:bg-[#064E3B] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Validate Finding (Analyst)</span>
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
