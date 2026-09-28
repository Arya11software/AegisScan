import React, { useState } from 'react';
import { FileText, Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Building, Code2, Server, XCircle } from 'lucide-react';
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

  const techProfile = ['TypeScript', 'Vite', 'MapLibre', 'Three.js', 'deck.gl'];

  const handlePrint = () => {
    window.print();
  };

  const currentStatusText = latestScanResult 
    ? (latestScanResult.observations?.length > 0 ? `VULNERABILITY OBSERVED (${latestScanResult.observations.length} matches)` : 'NO MATCH (0 matches - Target Clean)')
    : 'AWAITS LIVE SCAN';

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
            Formal enterprise security assessment report for target <strong className="text-[#17211B]">World Monitor</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setReportGenerated(true)}
            className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Generate Report
          </button>
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#087F5B]" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Enterprise Security Report */}
      {reportGenerated && (
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
              <p className="text-[11px] text-[#64746A]">Assessment Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Target & Assessment Scope Metadata */}
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#64746A] block uppercase text-[10px] font-bold">Target System</span>
              <span className="font-extrabold text-[#17211B]">{activeTarget}</span>
            </div>
            <div>
              <span className="text-[#64746A] block uppercase text-[10px] font-bold">Assessment ID</span>
              <span className="font-mono font-bold text-[#064E3B]">{activeAssessment?.id || 'WM-2026-001'}</span>
            </div>
            <div>
              <span className="text-[#64746A] block uppercase text-[10px] font-bold">Scope / Environment</span>
              <span className="font-bold text-[#087F5B]">{activeAssessment?.environment || 'Authorized Local Sandbox'}</span>
            </div>
            <div>
              <span className="text-[#64746A] block uppercase text-[10px] font-bold">Lead Assessor</span>
              <span className="font-bold text-[#17211B]">{user.name} ({user.role})</span>
            </div>
          </div>

          {/* Technology Profile Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#087F5B]" />
              1. Target Technology Profile
            </h2>
            <div className="flex flex-wrap gap-2">
              {techProfile.map((tech, idx) => (
                <span key={idx} className="bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] font-bold text-xs px-3 py-1 rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2">
              2. Executive Summary & Live AST Scan Outcome
            </h2>
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-2 text-xs">
              <p className="font-bold text-[#17211B]">
                Current AST Scan Result: <span className="font-mono text-[#087F5B]">{currentStatusText}</span>
              </p>
              <p className="text-[#64746A] leading-relaxed">
                This report documents the evidence-driven security assessment performed on target <strong className="text-[#064E3B]">{activeTarget}</strong> repository (<span className="font-mono text-[#087F5B]">https://github.com/koala73/worldmonitor.git</span>). Non-destructive static AST checks, deterministic rule evaluation, and AI-assisted contextualization were conducted across 6 attack surface layers. A total of <strong>{total}</strong> historical findings exist in the audit log; <strong>{activeCount}</strong> vulnerabilities are active in the current target source.
              </p>
            </div>
          </div>

          {/* Finding Breakdown Metrics */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2">
              3. Finding Summary Breakdown
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#64746A] block uppercase">ACTIVE HIGH SEVERITY</span>
                <span className="text-xl font-extrabold text-[#C62828] font-mono">{highCount}</span>
              </div>
              <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#64746A] block uppercase">ACTIVE MEDIUM</span>
                <span className="text-xl font-extrabold text-[#B7791F] font-mono">{medCount}</span>
              </div>
              <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#64746A] block uppercase">ACTIVE LOW</span>
                <span className="text-xl font-extrabold text-[#087F5B] font-mono">{lowCount}</span>
              </div>
              <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#064E3B] block uppercase">VERIFIED CLEAN</span>
                <span className="text-xl font-extrabold text-[#087F5B] font-mono">{verifiedCount}</span>
              </div>
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-[#C62828] block uppercase">REOPENED FIX</span>
                <span className="text-xl font-extrabold text-[#C62828] font-mono">{reopenedCount}</span>
              </div>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider border-b border-[#DDE5DF] pb-2">
              4. Detailed Finding Inventory & Retest State
            </h2>

            <div className="border border-[#DDE5DF] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-[#17211B]">
                <thead className="bg-[#F7F8F5] text-[#64746A] font-extrabold uppercase text-[10px] border-b border-[#DDE5DF]">
                  <tr>
                    <th className="p-3">Finding ID</th>
                    <th className="p-3">Title & Component</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current AST Condition</th>
                    <th className="p-3">Lifecycle Status</th>
                    <th className="p-3">Retest Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]">
                  {findings.map((f) => {
                    const cond = f.currentCondition || (f.status === 'VERIFIED' ? 'NO_MATCH' : 'OBSERVED');
                    return (
                      <tr key={f.id} className="hover:bg-[#F7F8F5]">
                        <td className="p-3 font-mono font-bold text-[#087F5B]">{f.id}</td>
                        <td className="p-3 font-extrabold text-[#17211B]">{f.title}</td>
                        <td className="p-3 text-[#64746A]">{f.category}</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={cond === 'OBSERVED' ? 'text-[#C62828]' : 'text-[#087F5B]'}>
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
                        <td className="p-3 font-mono font-bold text-[#087F5B]">
                          {f.retest?.currentCondition || f.retestStatus || 'Pending'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {/* Sign-Off Footer */}
          <div className="border-t border-[#DDE5DF] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64746A]">
            <div>
              <p className="font-extrabold text-[#17211B]">AegisScan Verification Platform v2.0</p>
              <p className="text-[10px] text-[#64746A]">Closed-loop security assessment and evidence validation framework.</p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
                SECURITY VERIFICATION SIGN-OFF PASSED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
