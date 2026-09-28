import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, CheckCircle2, AlertTriangle, Lock, ArrowRight, Flame, Shield, Play, Loader2, Sparkles, Server } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SecurityChecksPage() {
  const navigate = useNavigate();
  const { runRealCheck, findings, latestScanResult, clearLatestScan, resetDemo } = useApp();

  const [isRunningRealCheck, setIsRunningRealCheck] = useState(false);
  const [realCheckProgress, setRealCheckProgress] = useState(null);

  const realFinding = findings.find(f => f.id.startsWith('F-REAL-') || f.isRealCheck);

  const handleExecuteRealCheck = async () => {
    setIsRunningRealCheck(true);
    try {
      await runRealCheck((progress) => {
        setRealCheckProgress(progress);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningRealCheck(false);
    }
  };

  // Determine current check status from latestScanResult
  let checkStatus = 'NOT ASSESSED';
  if (latestScanResult) {
    checkStatus = latestScanResult.observations && latestScanResult.observations.length > 0 ? 'FAILED' : 'PASS';
  } else if (realFinding && realFinding.currentCondition === 'OBSERVED') {
    checkStatus = 'FAILED';
  } else if (realFinding && realFinding.currentCondition === 'NO_MATCH') {
    checkStatus = 'PASS';
  }

  const securityControls = [
    {
      category: 'Authentication',
      description: 'Session handling, client-token transport, and credential boundaries',
      checks: [
        { id: 'AUTH-001', name: 'Stateless Client Session Token Transport', status: 'PASS', confidence: 'High (95%)', evidenceId: 'EVD-001-A', findingId: null },
        { id: 'AUTH-002', name: 'Brute-force Throttling & Rate Limiting', status: 'PASS', confidence: 'High (92%)', evidenceId: null, findingId: null }
      ]
    },
    {
      category: 'Authorization',
      description: 'Access control boundaries and privilege separation',
      checks: [
        { id: 'AZ-001', name: 'Role-Based Access Control Scope Enforcement', status: 'PASS', confidence: 'High (90%)', evidenceId: null, findingId: null },
        { id: 'AZ-002', name: 'Indirect Object Reference & Context Bounds', status: 'REVIEW', confidence: 'Medium (85%)', evidenceId: 'EVD-001-A', findingId: 'F-001' }
      ]
    },
    {
      category: 'Configuration',
      description: 'Client-side vs server-side environment boundary and config hygiene',
      checks: [
        { id: 'REAL-CHK-001', name: 'Client-Accessible Environment Secret Exposure Check (REAL CHECK)', status: checkStatus, confidence: 'High (96.5%)', evidenceId: realFinding ? (realFinding.evidenceIds?.[0] || 'EVD-REAL-001') : null, findingId: realFinding?.id || null, isRealCheck: true },
        { id: 'CONFIG-001', name: 'Production Build Minification & Debug Flag Isolation', status: 'PASS', confidence: 'High (98%)', evidenceId: null, findingId: null }
      ]
    },
    {
      category: 'Dependencies',
      description: 'Third-party package audit and known CVE vulnerability scanning',
      checks: [
        { id: 'DEP-001', name: 'Lockfile CVE Known Vulnerability Audit', status: 'PASS', confidence: 'High (99%)', evidenceId: null, findingId: null }
      ]
    },
    {
      category: 'API Security',
      description: 'RESTful endpoint security controls, CORS, and header enforcement',
      checks: [
        { id: 'API-001', name: 'CORS Wildcard Policy & Origin Validation', status: 'PASS', confidence: 'High (93%)', evidenceId: null, findingId: null },
        { id: 'API-002', name: 'DTO Serialization Field Filtering Check', status: 'REVIEW', confidence: 'High (99%)', evidenceId: 'EVD-003-A', findingId: 'F-003' }
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="badge-emerald text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" /> PASS
          </span>
        );
      case 'REVIEW':
        return (
          <span className="badge-amber text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" /> REVIEW
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge-crimson text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#C62828]" /> FAILED
          </span>
        );
      default:
        return (
          <span className="badge-sage text-xs font-bold px-2.5 py-1 rounded-md">
            NOT ASSESSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#087F5B]" />
            Security Controls & Real Security Check Runner
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Non-destructive static rule evaluations and controlled security check execution against target <strong className="text-[#17211B]">World Monitor</strong>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {latestScanResult && (
            <button
              onClick={clearLatestScan}
              className="text-xs bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-3 py-1.5 rounded-md font-bold cursor-pointer"
            >
              Clear Current Scan
            </button>
          )}
          <button
            onClick={resetDemo}
            className="text-xs bg-white hover:bg-red-50 border border-red-200 text-[#C62828] px-3 py-1.5 rounded-md font-bold cursor-pointer"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* STEP 2 & 7: REAL CONTROLLED SECURITY CHECK EXECUTION CARD */}
      <div className="bg-white border border-[#087F5B] rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="badge-emerald text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
                REAL CONTROLLED SECURITY CHECK
              </span>
              <span className="text-xs text-[#64746A]">Target: <strong className="font-mono text-[#17211B]">World Monitor Sandbox</strong></span>
            </div>
            <h2 className="text-lg font-extrabold text-[#17211B]">
              REAL-CHK-001: Client-Accessible Environment Secret Exposure Check
            </h2>
            <p className="text-xs text-[#64746A]">
              Executes genuine AST static node parsing against World Monitor configuration scope (<span className="font-mono text-[#087F5B]">/src/config/clientEnv.ts</span>).
            </p>
          </div>

          <button
            onClick={handleExecuteRealCheck}
            disabled={isRunningRealCheck}
            className={`px-5 py-2.5 rounded-md text-xs font-bold flex items-center space-x-2 transition-all shadow-sm cursor-pointer ${
              isRunningRealCheck
                ? 'bg-[#DDE5DF] text-[#64746A] cursor-not-allowed'
                : 'bg-[#087F5B] hover:bg-[#064E3B] text-white'
            }`}
          >
            {isRunningRealCheck ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunningRealCheck ? 'Running Real Check...' : 'RUN REAL CONTROLLED CHECK'}</span>
          </button>
        </div>

        {/* Execution Progress */}
        {isRunningRealCheck && realCheckProgress && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs text-[#087F5B] font-bold">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {realCheckProgress.stepName}
              </span>
              <span className="font-mono">{realCheckProgress.progressPercent}%</span>
            </div>
            <div className="w-full bg-[#F7F8F5] rounded-full h-2 border border-[#DDE5DF] overflow-hidden">
              <div className="bg-[#087F5B] h-full transition-all duration-300" style={{ width: `${realCheckProgress.progressPercent}%` }}></div>
            </div>
          </div>
        )}

        {/* STRUCTURED OBSERVATION RESULT DISPLAY - OBSERVED MATCH CASE */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length > 0 && !isRunningRealCheck && (
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2 font-sans">
              <span className="font-extrabold text-[#17211B] flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-[#087F5B]" />
                CURRENT SCAN RESULT: VULNERABILITY OBSERVED
              </span>
              <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded">
                STATUS: OBSERVED ({latestScanResult.observations.length} MATCH{latestScanResult.observations.length > 1 ? 'ES' : ''})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-[#64746A] block text-[11px]">Check ID & Name:</span>
                <span className="text-[#087F5B] font-bold">REAL-CHK-001 (Client Secret Exposure)</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Source File:</span>
                <span className="text-[#17211B] font-bold">{latestScanResult.observations[0].file} (Line {latestScanResult.observations[0].line})</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Matched Parameter:</span>
                <span className="text-[#C62828] font-bold">{latestScanResult.observations[0].symbol}: '{latestScanResult.observations[0].valueMasked}'</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Source File Hash:</span>
                <span className="text-[#064E3B] font-bold">{latestScanResult.observations[0].sourceHash || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 font-sans">
              {latestScanResult.evidence && latestScanResult.evidence.length > 0 && (
                <button
                  onClick={() => navigate('/evidence')}
                  className="text-xs bg-white hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3.5 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#087F5B]" />
                  <span>View Evidence ({latestScanResult.evidence[0].id})</span>
                </button>
              )}

              {latestScanResult.findings && latestScanResult.findings.length > 0 && (
                <button
                  onClick={() => navigate(`/findings/${latestScanResult.findings[0].id}`)}
                  className="text-xs bg-[#087F5B] hover:bg-[#064E3B] text-white px-3.5 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>View Finding ({latestScanResult.findings[0].id})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STRUCTURED OBSERVATION RESULT DISPLAY - NO MATCH CLEAN CASE */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length === 0 && !isRunningRealCheck && (
          <div className="bg-[#E6F4F1] border border-[#B2DFDB] rounded-md p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#B2DFDB] pb-2">
              <span className="font-extrabold text-[#064E3B] flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                CURRENT SCAN RESULT: NO MATCH
              </span>
              <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                STATUS: NO MATCH (0 MATCHES)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[#64746A] block text-[11px]">Check ID & Name:</span>
                <span className="text-[#087F5B] font-bold">REAL-CHK-001 (Client Secret Exposure)</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Scanned Files Count:</span>
                <span className="text-[#17211B] font-bold">{latestScanResult.check?.scannedFilesCount || 0} source files</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Target Scope:</span>
                <span className="text-[#17211B] font-bold">World Monitor Sandbox</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Condition Evaluation:</span>
                <span className="text-[#087F5B] font-bold">Not detected in current source</span>
              </div>
            </div>

            {realFinding && (
              <div className="pt-2 border-t border-[#B2DFDB] flex items-center justify-between font-sans">
                <span className="text-[11px] text-[#64746A]">
                  Historical Finding Record: <strong className="font-mono text-[#17211B]">{realFinding.id}</strong> ({realFinding.status})
                </span>
                <button
                  onClick={() => navigate(`/findings/${realFinding.id}`)}
                  className="text-xs bg-white hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3.5 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Historical Finding Record</span>
                  <ArrowRight className="w-3 h-3 text-[#087F5B]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fallback display before first live execution */}
        {!latestScanResult && realFinding && !isRunningRealCheck && (
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2 font-sans">
              <span className="font-extrabold text-[#17211B] flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-[#087F5B]" />
                INITIAL TARGET BASELINE FINDING
              </span>
              <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded">
                STATUS: {realFinding.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-[#64746A] block text-[11px]">Check ID & Name:</span>
                <span className="text-[#087F5B] font-bold">REAL-CHK-001 (Client Secret Exposure)</span>
              </div>
              <div>
                <span className="text-[#64746A] block text-[11px]">Registered Finding ID:</span>
                <span className="text-[#17211B] font-bold">{realFinding.id}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 font-sans">
              <button
                onClick={() => navigate(`/findings/${realFinding.id}`)}
                className="text-xs bg-[#087F5B] hover:bg-[#064E3B] text-white px-3.5 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>View Finding ({realFinding.id})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Grid */}
      <div className="space-y-5">
        {securityControls.map((group, idx) => (
          <div key={idx} className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#087F5B] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#087F5B]" />
                  {group.category}
                </h2>
                <p className="text-[11px] text-[#64746A] mt-0.5">{group.description}</p>
              </div>
              <span className="text-[10px] font-mono bg-[#F7F8F5] text-[#17211B] px-2.5 py-1 rounded border border-[#DDE5DF] font-semibold">
                {group.checks.length} Checks Evaluated
              </span>
            </div>

            <div className="divide-y divide-[#DDE5DF]">
              {group.checks.map((check) => (
                <div key={check.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] text-[#064E3B] font-bold">{check.id}</span>
                      <h3 className="text-xs font-bold text-[#17211B]">{check.name}</h3>
                    </div>
                    <p className="text-[10px] text-[#64746A]">Confidence: {check.confidence}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(check.status)}

                    {check.evidenceId && (
                      <button
                        onClick={() => navigate('/evidence')}
                        className="text-[11px] text-[#087F5B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Flame className="w-3 h-3 text-[#087F5B]" />
                        <span>Evidence ({check.evidenceId})</span>
                      </button>
                    )}

                    {check.findingId && (
                      <button
                        onClick={() => navigate(`/findings/${check.findingId}`)}
                        className="text-[11px] bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Finding {check.findingId}</span>
                        <ArrowRight className="w-3 h-3 text-[#087F5B]" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
