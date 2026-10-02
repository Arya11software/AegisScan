import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  Flame, 
  Shield, 
  Play, 
  Loader2, 
  Sparkles, 
  KeyRound, 
  ShieldCheck, 
  Server, 
  ShieldAlert, 
  Database,
  FileCheck
} from 'lucide-react';
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
  let realCheckStatus = 'NOT ASSESSED';
  if (latestScanResult) {
    realCheckStatus = latestScanResult.observations && latestScanResult.observations.length > 0 ? 'FAILED' : 'PASS';
  } else if (realFinding && realFinding.currentCondition === 'OBSERVED') {
    realCheckStatus = 'FAILED';
  } else if (realFinding && realFinding.currentCondition === 'NO_MATCH') {
    realCheckStatus = 'PASS';
  }

  // Section 9: The 7 Security Domains
  const securityDomains = [
    {
      id: 'domain-auth',
      name: 'Authentication & Session',
      icon: KeyRound,
      description: 'Session transport, stateless JWT tokens, and token storage boundaries',
      status: 'PASS',
      testsCount: 2,
      testsPassed: 2,
      findingsCount: 0,
      checks: [
        { id: 'AUTH-001', name: 'Stateless Client Session Token Transport', status: 'PASS', confidence: 'High (95%)', evidenceId: 'EVD-001-A' },
        { id: 'AUTH-002', name: 'Brute-force Throttling & Rate Limiting', status: 'PASS', confidence: 'High (92%)', evidenceId: null }
      ]
    },
    {
      id: 'domain-rbac',
      name: 'Authorization & RBAC',
      icon: ShieldCheck,
      description: 'Role-based access boundaries and indirect object reference enforcement',
      status: 'REVIEW',
      testsCount: 2,
      testsPassed: 1,
      findingsCount: 1,
      checks: [
        { id: 'AZ-001', name: 'Role-Based Access Control Scope Enforcement', status: 'PASS', confidence: 'High (90%)', evidenceId: null },
        { id: 'AZ-002', name: 'Indirect Object Reference & Context Bounds', status: 'REVIEW', confidence: 'Medium (85%)', evidenceId: 'EVD-001-A', findingId: 'F-001' }
      ]
    },
    {
      id: 'domain-api',
      name: 'API Security',
      icon: Server,
      description: 'RESTful endpoint sanitization, CORS wildcard limits, and DTO filtering',
      status: 'REVIEW',
      testsCount: 2,
      testsPassed: 1,
      findingsCount: 1,
      checks: [
        { id: 'API-001', name: 'CORS Wildcard Policy & Origin Validation', status: 'PASS', confidence: 'High (93%)', evidenceId: null },
        { id: 'API-002', name: 'DTO Serialization Field Filtering Check', status: 'REVIEW', confidence: 'High (99%)', evidenceId: 'EVD-003-A', findingId: 'F-003' }
      ]
    },
    {
      id: 'domain-input',
      name: 'Input Validation',
      icon: FileCheck,
      description: 'Client-side parameter encoding, schema type checks, and XSS sanitization',
      status: 'PASS',
      testsCount: 2,
      testsPassed: 2,
      findingsCount: 0,
      checks: [
        { id: 'INP-001', name: 'Strict Schema Input Sanitization', status: 'PASS', confidence: 'High (94%)', evidenceId: null },
        { id: 'INP-002', name: 'DOM Template String Escaping Rules', status: 'PASS', confidence: 'High (96%)', evidenceId: null }
      ]
    },
    {
      id: 'domain-client',
      name: 'Client-Side Security',
      icon: Shield,
      description: 'Runtime environment boundaries, client secrets exposure, and debug flags',
      status: realCheckStatus,
      testsCount: 2,
      testsPassed: realCheckStatus === 'PASS' ? 2 : 1,
      findingsCount: realCheckStatus === 'FAILED' ? 1 : 0,
      checks: [
        { id: 'REAL-CHK-001', name: 'Client-Accessible Environment Secret Exposure Check', status: realCheckStatus, confidence: 'High (96.5%)', evidenceId: realFinding?.evidenceIds?.[0] || 'EVD-REAL-001', findingId: realFinding?.id, isRealCheck: true },
        { id: 'CONFIG-001', name: 'Production Build Minification & Debug Flag Isolation', status: 'PASS', confidence: 'High (98%)', evidenceId: null }
      ]
    },
    {
      id: 'domain-transport',
      name: 'Transport Security',
      icon: ShieldAlert,
      description: 'TLS configuration, HTTP Strict Transport Security, and cipher restrictions',
      status: 'PASS',
      testsCount: 2,
      testsPassed: 2,
      findingsCount: 0,
      checks: [
        { id: 'TLS-001', name: 'Strict Transport Security (HSTS) Header', status: 'PASS', confidence: 'High (97%)', evidenceId: null },
        { id: 'TLS-002', name: 'Secure Cookie Flags (Secure, HttpOnly, SameSite)', status: 'PASS', confidence: 'High (95%)', evidenceId: null }
      ]
    },
    {
      id: 'domain-data',
      name: 'Data & Privacy',
      icon: Database,
      description: 'Lockfile CVE vulnerabilities, PII protection, and local storage safety',
      status: 'PASS',
      testsCount: 2,
      testsPassed: 2,
      findingsCount: 0,
      checks: [
        { id: 'DEP-001', name: 'Lockfile CVE Known Vulnerability Audit', status: 'PASS', confidence: 'High (99%)', evidenceId: null },
        { id: 'DATA-001', name: 'Local Storage Credential Persistence Audit', status: 'PASS', confidence: 'High (93%)', evidenceId: null }
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="badge-emerald text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#0A6E4F]" /> PASS
          </span>
        );
      case 'REVIEW':
        return (
          <span className="badge-amber text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#B45309]" /> REVIEW
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge-crimson text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#C53030]" /> FAILED
          </span>
        );
      default:
        return (
          <span className="badge-sage text-[11px] font-bold px-2 py-0.5 rounded-md">
            NOT ASSESSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Intelligent Test Plan & Security Controls</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Security Controls & AST Check Runner
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Structured 7-domain test plan and live deterministic check execution for <strong className="text-[#16201B]">World Monitor</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {latestScanResult && (
            <button
              onClick={clearLatestScan}
              className="btn-secondary text-xs"
            >
              Clear Current Scan
            </button>
          )}
          <button
            onClick={resetDemo}
            className="btn-secondary text-xs text-[#C53030] hover:text-[#9B2C2C] hover:bg-[#FDF2F2]"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* REAL CONTROLLED SECURITY CHECK RUNNER (REAL-CHK-001) */}
      <div className="panel-card p-5 sm:p-6 border-l-4 border-l-[#0A6E4F] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="badge-emerald text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                LIVE DETERMINISTIC CHECK
              </span>
              <span className="text-xs text-[#56655D]">Target: <strong className="font-mono text-[#16201B]">World Monitor Sandbox</strong></span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#16201B]">
              REAL-CHK-001: Client-Accessible Environment Secret Exposure Check
            </h2>
            <p className="text-xs text-[#56655D]">
              Executes live Babel AST static syntax tree parsing on configuration file (<span className="font-mono text-[#0A6E4F]">/src/config/clientEnv.ts</span>).
            </p>
          </div>

          <button
            onClick={handleExecuteRealCheck}
            disabled={isRunningRealCheck}
            className="btn-primary shrink-0"
          >
            {isRunningRealCheck ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunningRealCheck ? 'Evaluating AST Rules...' : 'Run Real Controlled Check'}</span>
          </button>
        </div>

        {/* Real Check Progress */}
        {isRunningRealCheck && realCheckProgress && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs text-[#0A6E4F] font-bold">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {realCheckProgress.stepName}
              </span>
              <span className="font-mono">{realCheckProgress.progressPercent}%</span>
            </div>
            <div className="w-full bg-[#F3F5F1] rounded-full h-2 border border-[#DEE5E0] overflow-hidden">
              <div className="bg-[#0A6E4F] h-full transition-all duration-300" style={{ width: `${realCheckProgress.progressPercent}%` }}></div>
            </div>
          </div>
        )}

        {/* OBSERVED MATCH CARD */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length > 0 && !isRunningRealCheck && (
          <div className="bg-[#FDF2F2] border border-[#FBC4C4] rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#FBC4C4] pb-2">
              <span className="font-bold text-[#C53030] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C53030]" />
                CURRENT AST SCAN RESULT: VULNERABILITY OBSERVED
              </span>
              <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded">
                OBSERVED ({latestScanResult.observations.length} MATCH)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-[#85948C] block text-[10px]">Check ID:</span>
                <span className="text-[#16201B] font-bold">REAL-CHK-001</span>
              </div>
              <div>
                <span className="text-[#85948C] block text-[10px]">Target File:</span>
                <span className="text-[#16201B] font-bold">{latestScanResult.observations[0].file} (Line {latestScanResult.observations[0].line})</span>
              </div>
              <div>
                <span className="text-[#85948C] block text-[10px]">Exposed Symbol:</span>
                <span className="text-[#C53030] font-bold">{latestScanResult.observations[0].symbol}: '{latestScanResult.observations[0].valueMasked}'</span>
              </div>
              <div>
                <span className="text-[#85948C] block text-[10px]">File Hash:</span>
                <span className="text-[#0A6E4F] font-bold">{latestScanResult.observations[0].sourceHash || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#FBC4C4] flex items-center justify-end space-x-2">
              {latestScanResult.evidence && latestScanResult.evidence.length > 0 && (
                <button
                  onClick={() => navigate('/evidence')}
                  className="btn-secondary text-xs"
                >
                  <Flame className="w-3.5 h-3.5 text-[#0A6E4F]" />
                  <span>Inspect Evidence ({latestScanResult.evidence[0].id})</span>
                </button>
              )}

              {latestScanResult.findings && latestScanResult.findings.length > 0 && (
                <button
                  onClick={() => navigate(`/findings/${latestScanResult.findings[0].id}`)}
                  className="btn-primary text-xs"
                >
                  <span>Review Finding ({latestScanResult.findings[0].id})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* NO MATCH (CLEAN) CARD */}
        {latestScanResult && latestScanResult.observations && latestScanResult.observations.length === 0 && !isRunningRealCheck && (
          <div className="bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#B6DEC9] pb-2">
              <span className="font-bold text-[#0A6E4F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A6E4F]" />
                CURRENT AST SCAN RESULT: NO MATCH (CLEAN)
              </span>
              <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                0 MATCHES DETECTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-[#85948C] block text-[10px]">Check Evaluated:</span>
                <span className="text-[#0A6E4F] font-bold">REAL-CHK-001</span>
              </div>
              <div>
                <span className="text-[#85948C] block text-[10px]">Files Scanned:</span>
                <span className="text-[#16201B] font-bold">{latestScanResult.check?.scannedFilesCount || 0} source files</span>
              </div>
              <div>
                <span className="text-[#85948C] block text-[10px]">Verification State:</span>
                <span className="text-[#0A6E4F] font-bold">Clean - No Exposure Found</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7 SECURITY DOMAINS GRID (Section 9) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#DEE5E0] pb-2">
          <div>
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
              Intelligent Test Plan — 7 Security Domains
            </h2>
            <p className="text-xs text-[#56655D]">Comprehensive coverage across all security assurance categories.</p>
          </div>
          <span className="text-[11px] text-[#85948C]">7 Domains Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityDomains.map((domain) => {
            const Icon = domain.icon;
            const progressPct = Math.round((domain.testsPassed / domain.testsCount) * 100);
            return (
              <div key={domain.id} className="panel-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-md bg-[#EBF5F0] border border-[#B6DEC9] flex items-center justify-center text-[#0A6E4F] shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-[#16201B] leading-tight">{domain.name}</h3>
                    </div>
                    {getStatusBadge(domain.status)}
                  </div>

                  <p className="text-[11px] text-[#56655D] leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#DEE5E0]">
                  {/* Progress & Metrics */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#56655D]">Tests: <strong className="text-[#16201B] font-mono">{domain.testsPassed}/{domain.testsCount}</strong></span>
                    <span className={`font-semibold ${domain.findingsCount > 0 ? 'text-[#C53030]' : 'text-[#0A6E4F]'}`}>
                      {domain.findingsCount > 0 ? `${domain.findingsCount} Active Finding` : '0 Findings'}
                    </span>
                  </div>

                  <div className="w-full bg-[#F3F5F1] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${domain.status === 'FAILED' ? 'bg-[#C53030]' : domain.status === 'REVIEW' ? 'bg-[#B45309]' : 'bg-[#0A6E4F]'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {/* Micro list of checks */}
                  <div className="space-y-1 pt-1">
                    {domain.checks.map((chk, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] text-[#56655D] bg-[#F8F9F6] p-1.5 rounded">
                        <span className="font-mono font-semibold text-[#16201B] truncate max-w-[170px]">{chk.id}: {chk.name}</span>
                        <span className={`font-bold ${chk.status === 'FAILED' ? 'text-[#C53030]' : chk.status === 'REVIEW' ? 'text-[#B45309]' : 'text-[#0A6E4F]'}`}>
                          {chk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
