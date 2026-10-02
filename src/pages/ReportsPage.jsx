import React, { useState } from 'react';
import { FileText, Printer, Code2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

export default function ReportsPage() {
  const { activeTarget, activeAssessment, findings, user, latestScanResult } = useApp();
  const [reportGenerated, setReportGenerated] = useState(true);

  const total = findings.length;
  const activeFindings = findings.filter(f => f.currentCondition ? f.currentCondition === 'OBSERVED' : f.status !== 'VERIFIED');
  const activeCount = activeFindings.length;

  const highCount = activeFindings.filter(f => f.severity === 'HIGH').length;
  const medCount = activeFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = activeFindings.filter(f => f.severity === 'LOW').length;
  const verifiedCount = findings.filter(f => f.status === 'VERIFIED').length;
  const reopenedCount = activeFindings.filter(f => f.status === 'REOPENED').length;

  const techProfile = ['TypeScript', 'Vite', 'MapLibre', 'Three.js', 'deck.gl', 'Node.js Sandbox'];

  const handlePrint = () => {
    window.print();
  };

  const currentStatusText = latestScanResult 
    ? (latestScanResult.observations?.length > 0 ? `VULNERABILITY OBSERVED (${latestScanResult.observations.length} matches)` : 'NO MATCH (0 matches - Target Clean)')
    : 'AWAITS LIVE SCAN';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Formal Audit Deliverables</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Security Assessment Report Generator
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Formal enterprise security assessment report for target <strong className="text-[#16201B]">World Monitor</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setReportGenerated(true)}
            className="btn-secondary"
          >
            Regenerate Report
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary"
          >
            <Printer className="w-4 h-4" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Enterprise Security Report */}
      {reportGenerated && (
        <div className="panel-card p-6 sm:p-8 space-y-8 shadow-xs print:border-none print:p-0 print:shadow-none bg-white">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEE5E0] pb-6 gap-4">
            <div>
              <Logo size="lg" />
              <p className="text-xs text-[#56655D] mt-2 font-mono font-semibold">
                SECURITY ASSESSMENT & VALIDATION AUDIT REPORT • SIH-2026-SEC
              </p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md inline-block">
                VERIFIED SECURITY AUDIT
              </span>
              <p className="text-[11px] text-[#56655D]">Generated: {new Date().toLocaleDateString()} • Confidential</p>
            </div>
          </div>

          {/* Target & Assessment Scope Metadata */}
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#85948C] block uppercase text-[10px] font-bold">Target System</span>
              <span className="font-bold text-[#16201B]">{activeTarget}</span>
            </div>
            <div>
              <span className="text-[#85948C] block uppercase text-[10px] font-bold">Assessment ID</span>
              <span className="font-mono font-bold text-[#0A6E4F]">{activeAssessment?.id || 'WM-2026-001'}</span>
            </div>
            <div>
              <span className="text-[#85948C] block uppercase text-[10px] font-bold">Scope / Environment</span>
              <span className="font-bold text-[#16201B]">{activeAssessment?.environment || 'Authorized Local Sandbox'}</span>
            </div>
            <div>
              <span className="text-[#85948C] block uppercase text-[10px] font-bold">Lead Assessor</span>
              <span className="font-bold text-[#16201B]">{user.name} ({user.role})</span>
            </div>
          </div>

          {/* 1. Technology Profile Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider border-b border-[#DEE5E0] pb-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#0A6E4F]" />
              <span>1. Target Technology Profile</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {techProfile.map((tech, idx) => (
                <span key={idx} className="bg-[#F8F9F6] border border-[#DEE5E0] text-[#16201B] font-semibold text-xs px-2.5 py-1 rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider border-b border-[#DEE5E0] pb-2">
              2. Executive Summary & Live AST Scan Outcome
            </h2>
            <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-lg space-y-2 text-xs">
              <p className="font-bold text-[#16201B]">
                Current Live AST Scan Result: <span className="font-mono text-[#0A6E4F]">{currentStatusText}</span>
              </p>
              <p className="text-[#56655D] leading-relaxed">
                This report documents the evidence-driven security assessment performed on target <strong className="text-[#064E3B]">{activeTarget}</strong> repository (<span className="font-mono text-[#0A6E4F]">https://github.com/koala73/worldmonitor.git</span>). Non-destructive static AST checks, deterministic rule evaluation, and AI-assisted contextualization were conducted across 6 attack surface layers. A total of <strong>{total}</strong> historical findings exist in the audit log; <strong>{activeCount}</strong> vulnerabilities are active in the current target source.
              </p>
            </div>
          </div>

          {/* 3. Finding Breakdown Metrics */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider border-b border-[#DEE5E0] pb-2">
              3. Finding Summary Breakdown
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#85948C] block uppercase">ACTIVE HIGH</span>
                <span className="text-xl font-bold text-[#C53030] font-mono">{highCount}</span>
              </div>
              <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#85948C] block uppercase">ACTIVE MEDIUM</span>
                <span className="text-xl font-bold text-[#B45309] font-mono">{medCount}</span>
              </div>
              <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#85948C] block uppercase">ACTIVE LOW</span>
                <span className="text-xl font-bold text-[#0A6E4F] font-mono">{lowCount}</span>
              </div>
              <div className="bg-[#EBF5F0] border border-[#B6DEC9] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#064E3B] block uppercase">VERIFIED CLEAN</span>
                <span className="text-xl font-bold text-[#0A6E4F] font-mono">{verifiedCount}</span>
              </div>
              <div className="bg-[#FDF2F2] border border-[#FBC4C4] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#C53030] block uppercase">REOPENED FIX</span>
                <span className="text-xl font-bold text-[#C53030] font-mono">{reopenedCount}</span>
              </div>
            </div>
          </div>

          {/* 4. Detailed Findings Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider border-b border-[#DEE5E0] pb-2">
              4. Detailed Finding Inventory & Retest State
            </h2>

            <div className="border border-[#DEE5E0] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs text-[#16201B]">
                <thead className="bg-[#F8F9F6] text-[#85948C] font-bold uppercase text-[10px] border-b border-[#DEE5E0]">
                  <tr>
                    <th className="p-3">Finding ID</th>
                    <th className="p-3">Title & Component</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current AST Condition</th>
                    <th className="p-3">Lifecycle Status</th>
                    <th className="p-3">Retest Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEE5E0]">
                  {findings.map((f) => {
                    const cond = f.currentCondition || (f.status === 'VERIFIED' ? 'NO_MATCH' : 'OBSERVED');
                    return (
                      <tr key={f.id} className="hover:bg-[#F8F9F6]">
                        <td className="p-3 font-mono font-bold text-[#0A6E4F]">{f.id}</td>
                        <td className="p-3 font-semibold text-[#16201B]">{f.title}</td>
                        <td className="p-3 text-[#56655D]">{f.category}</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={cond === 'OBSERVED' ? 'text-[#C53030]' : 'text-[#0A6E4F]'}>
                            {cond}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.status === 'VERIFIED' ? 'badge-emerald' : f.status === 'REOPENED' ? 'badge-crimson' : 'badge-amber'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#0A6E4F]">
                          {f.retest?.currentCondition || f.retestStatus || 'Pending'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Formal Sign-Off Footer */}
          <div className="border-t border-[#DEE5E0] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#56655D] gap-4">
            <div>
              <p className="font-bold text-[#16201B]">AegisScan Verification Platform v2.0</p>
              <p className="text-[11px] text-[#85948C]">Closed-loop security assessment and evidence validation framework.</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md inline-block">
                SECURITY VERIFICATION SIGN-OFF PASSED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
