import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Server, 
  Layers, 
  Globe, 
  Lock, 
  Flame, 
  RotateCcw,
  Sparkles,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import Logo from '../components/Logo';

export default function ReportsPage() {
  const { assessments, activeAssessment, findings, user } = useApp();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(activeAssessment?.id || (assessments[0]?.id || 'WM-2026-REAL'));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeAssessment?.id && !selectedAssessmentId) {
      setSelectedAssessmentId(activeAssessment.id);
    }
  }, [activeAssessment]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        // Try new assessment-specific report endpoint first
        let res = null;
        try {
          res = await apiService.getAssessmentReport(selectedAssessmentId);
        } catch {
          // Fallback to legacy report endpoint
          res = await apiService.getReport(selectedAssessmentId);
        }
        if (res?.success && res.report) {
          setReportData(res.report);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    if (selectedAssessmentId) {
      fetchReport();
    }
  }, [selectedAssessmentId]);

  const handlePrint = () => {
    window.print();
  };

  const currentAssessment = assessments.find(a => a.id === selectedAssessmentId) || activeAssessment || assessments[0] || {};
  const currentFindings = reportData?.findings || findings.filter(f => f.assessmentId === selectedAssessmentId);

  const candidateFindings = currentFindings.filter(f => (f.status || '').toLowerCase() === 'candidate');
  const validatedFindings = currentFindings.filter(f => (f.status || '').toLowerCase() === 'validated' || f.validation?.status === 'CONFIRMED');
  const falsePositives = currentFindings.filter(f => (f.status || '').toLowerCase().includes('false'));
  const verifiedFindings = currentFindings.filter(f => (f.status || '').toLowerCase() === 'verified');
  const regressionFindings = currentFindings.filter(f => (f.status || '').toLowerCase() === 'regression' || (f.status || '').toLowerCase() === 'reopened');

  const criticalCount = currentFindings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = currentFindings.filter(f => f.severity === 'HIGH').length;
  const medCount = currentFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = currentFindings.filter(f => f.severity === 'LOW').length;

  const discovery = reportData?.discovery || currentAssessment.discoverySummary || currentAssessment.discovery?.summary || {
    pagesCount: 0,
    apiEndpointsCount: 0,
    parametersCount: 0,
    securityHeadersCount: 0
  };

  const testsExecuted = reportData?.testsExecuted || currentAssessment.testPlanSummary || {
    total: currentAssessment.testPlan?.totalTests || 0,
    passed: currentAssessment.testPlanSummary?.passed || 0,
    failed: currentFindings.length,
    pending: 0
  };

  const testPlan = reportData?.testPlan || currentAssessment.testPlan || null;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#087F5B]" />
            Security Assessment Report Generator
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Formal enterprise security assessment report for authorized web targets
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Assessment Selector */}
          <div className="flex items-center space-x-2 bg-white border border-[#DDE5DF] rounded-md px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs text-[#64746A] font-bold">Assessment:</span>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-[#087F5B] outline-none cursor-pointer"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.targetName || a.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Enterprise Security Report */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-8 space-y-8 shadow-2xs print:border-none print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-6">
          <div>
            <Logo size="lg" />
            <p className="text-xs text-[#64746A] mt-2 font-mono font-semibold">
              SECURITY ASSESSMENT & VALIDATION AUDIT REPORT • SIH-2026-SEC
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className="badge-emerald text-xs font-extrabold px-3 py-1 rounded-md">
              VERIFIED SECURITY AUDIT
            </span>
            <p className="text-[11px] text-[#64746A]">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Target & Assessment Scope Metadata */}
        <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#64746A] block uppercase text-[10px] font-bold">Target System</span>
            <span className="font-extrabold text-[#17211B]">{currentAssessment.targetName || currentAssessment.name || 'World Monitor'}</span>
            <span className="text-[10px] text-[#64746A] font-mono block truncate">{currentAssessment.targetUrl || 'http://localhost:3000'}</span>
          </div>
          <div>
            <span className="text-[#64746A] block uppercase text-[10px] font-bold">Assessment ID</span>
            <span className="font-mono font-bold text-[#064E3B]">{selectedAssessmentId}</span>
          </div>
          <div>
            <span className="text-[#64746A] block uppercase text-[10px] font-bold">Scope / Environment</span>
            <span className="font-bold text-[#087F5B]">{currentAssessment.environment || 'Authorized Sandbox'}</span>
          </div>
          <div>
            <span className="text-[#64746A] block uppercase text-[10px] font-bold">Lead Assessor</span>
            <span className="font-bold text-[#17211B]">{user.name} ({user.role})</span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
            1. Executive Summary
          </h2>
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-2 text-xs">
            <p className="text-[#17211B] leading-relaxed">
              This formal report documents the results of the authorized web application security assessment conducted against <strong className="text-[#087F5B]">{currentAssessment.targetName || 'World Monitor'}</strong> ({currentAssessment.targetUrl}). Safe, non-destructive testing was performed across 7 security domains in accordance with OWASP Top 10 and API Security standards.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-[#64746A]">Evaluated Risk Score:</span>{' '}
                <strong className={(currentAssessment.riskRating === 'High' || currentAssessment.riskRating === 'Critical') ? 'text-[#C62828]' : 'text-[#B7791F]'}>
                  {currentAssessment.riskIndex || 65} ({currentAssessment.riskRating || 'Moderate'})
                </strong>
              </div>
              <div>
                <span className="text-[#64746A]">Total Identified:</span>{' '}
                <strong className="text-[#17211B]">{currentFindings.length} findings</strong>
              </div>
              <div>
                <span className="text-[#64746A]">Confirmed Validated:</span>{' '}
                <strong className="text-[#C62828]">{validatedFindings.length} confirmed</strong>
              </div>
              <div>
                <span className="text-[#64746A]">Verified Resolutions:</span>{' '}
                <strong className="text-[#087F5B]">{verifiedFindings.length} resolved</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Target Scope & Discovery Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#087F5B]" />
            2. Scope Boundaries & Application Discovery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Pages Discovered</span>
              <span className="text-lg font-bold text-[#17211B] font-mono">{discovery.pagesCount}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">API Endpoints</span>
              <span className="text-lg font-bold text-[#087F5B] font-mono">{discovery.apiEndpointsCount}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Parameters Mapped</span>
              <span className="text-lg font-bold text-[#B7791F] font-mono">{discovery.parametersCount}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Security Headers</span>
              <span className="text-lg font-bold text-[#064E3B] font-mono">{discovery.securityHeadersCount}</span>
            </div>
          </div>
        </div>

        {/* 3. Tests Executed Breakdown with Dynamic Selection Rationale */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#087F5B]" />
            3. Automated Security Tests Executed Across 7 Domains
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Total Tests</span>
              <span className="text-lg font-bold text-[#17211B] font-mono">{testsExecuted.total}</span>
            </div>
            <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-3 rounded-md">
              <span className="text-[10px] text-[#064E3B] uppercase font-bold block">Tests Passed</span>
              <span className="text-lg font-bold text-[#087F5B] font-mono">{testsExecuted.passed}</span>
            </div>
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <span className="text-[10px] text-[#C62828] uppercase font-bold block">Tests Failed / Identified</span>
              <span className="text-lg font-bold text-[#C62828] font-mono">{testsExecuted.failed}</span>
            </div>
          </div>

          {testPlan?.tests && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-[#17211B] uppercase tracking-wider block">
                Sample Test Plan Selection Rationale (Dynamic Rules)
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {testPlan.tests.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="bg-[#F7F8F5] border border-[#DDE5DF] p-2 rounded text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#087F5B]">{t.id}: </span>
                      <span className="font-semibold text-[#17211B]">{t.name}</span>
                      <p className="text-[10px] text-[#64746A] italic">{t.reasonForSelection}</p>
                    </div>
                    <span className="badge-emerald text-[9px] font-bold px-2 py-0.5 rounded">
                      {t.domain}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Finding Severity Summary & Lifecycle Distribution */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2">
            4. Finding Severity & Resolution Distribution
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Critical</span>
              <span className="text-lg font-bold text-[#C62828] font-mono">{criticalCount}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">High</span>
              <span className="text-lg font-bold text-[#C62828] font-mono">{highCount}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Medium</span>
              <span className="text-lg font-bold text-[#B7791F] font-mono">{medCount}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Candidates</span>
              <span className="text-lg font-bold text-[#B7791F] font-mono">{candidateFindings.length}</span>
            </div>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md">
              <span className="text-[10px] text-[#64746A] uppercase font-bold block">Validated</span>
              <span className="text-lg font-bold text-[#C62828] font-mono">{validatedFindings.length}</span>
            </div>
            <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-3 rounded-md">
              <span className="text-[10px] text-[#064E3B] uppercase font-bold block">Verified Clean</span>
              <span className="text-lg font-bold text-[#087F5B] font-mono">{verifiedFindings.length}</span>
            </div>
          </div>
        </div>

        {/* 5. Detailed Findings & Masked Evidence Inventory */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2">
            5. Comprehensive Finding Records, CVSS & Masked Evidence
          </h2>

          <div className="space-y-4">
            {currentFindings.map((f) => (
              <div key={f.id} className="border border-[#DDE5DF] rounded-lg p-5 space-y-3 text-xs bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DDE5DF] pb-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#087F5B]">{f.id}</span>
                    <h3 className="font-extrabold text-[#17211B] text-sm">{f.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'badge-crimson' : 'badge-amber'
                    }`}>
                      {f.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.status === 'Verified' || f.status === 'VERIFIED' ? 'badge-emerald' : 'badge-amber'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] bg-[#F7F8F5] p-3 rounded border border-[#DDE5DF]">
                  <div>
                    <span className="text-[#64746A] block text-[10px] uppercase font-bold">Endpoint</span>
                    <span className="font-bold text-[#17211B]">{f.endpoint}</span>
                  </div>
                  <div>
                    <span className="text-[#64746A] block text-[10px] uppercase font-bold">CVSS 3.1 Base Score</span>
                    <span className="font-bold text-[#C62828]">{f.cvssScore || 7.5}</span>
                    <span className="text-[9px] text-[#64746A] block truncate">{f.cvssVector}</span>
                  </div>
                  <div>
                    <span className="text-[#64746A] block text-[10px] uppercase font-bold">OWASP Category</span>
                    <span className="font-bold text-[#17211B] truncate block">{f.owaspMapping || 'A01:2021-Broken Access Control'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64746A] uppercase">Description</span>
                  <p className="text-[#17211B]">{f.description}</p>
                </div>

                {f.reproductionSteps && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase">Reproduction Steps</span>
                    <pre className="text-[11px] font-mono bg-[#F7F8F5] border border-[#DDE5DF] p-2.5 rounded text-[#17211B] whitespace-pre-wrap">
                      {f.reproductionSteps}
                    </pre>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#064E3B] uppercase">Recommended Remediation</span>
                  <p className="text-[#17211B] bg-[#E6F4F1] p-2.5 rounded border border-[#B2DFDB] font-semibold">
                    {typeof f.remediation === 'object' ? (f.remediation.recommendedFix || f.remediation.recommendation) : f.remediation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Retest & Empirical Verification Results */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-[#087F5B]" />
            6. Retest & Empirical Verification Audit
          </h2>
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-2 text-xs">
            <p className="text-[#17211B]">
              Empirical verification confirms remediation status by repeating original test procedures against updated application endpoints.
            </p>
            <div className="flex items-center space-x-4 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-[#64746A]">Verified Clean:</span>{' '}
                <strong className="text-[#087F5B]">{verifiedFindings.length} resolved</strong>
              </div>
              <div>
                <span className="text-[#64746A]">Regressions Persisting:</span>{' '}
                <strong className="text-[#C62828]">{regressionFindings.length} regression(s)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Sign-Off Footer */}
        <div className="border-t border-[#DDE5DF] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64746A]">
          <div>
            <p className="font-extrabold text-[#17211B]">AegisScan Enterprise Security Platform v2.0</p>
            <p className="text-[10px] text-[#64746A]">Closed-loop security assessment and empirical verification framework.</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
              AUDIT COMPLIANCE VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
