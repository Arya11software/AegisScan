import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentsListPage() {
  const navigate = useNavigate();
  const { assessments, triggerAssessment, latestScanResult, findings, targetProfile } = useApp();

  const realCheckFinding = findings.find(f => f.id.startsWith('F-REAL-') || f.isRealCheck);
  const activeObsCount = latestScanResult ? (latestScanResult.observations?.length || 0) : (realCheckFinding?.currentCondition === 'OBSERVED' ? 1 : 0);

  const liveAssessment = {
    id: 'WM-2026-LIVE',
    targetName: 'World Monitor (Authorized Target)',
    targetUrl: targetProfile?.targetPath || 'Authorized Sandbox',
    environment: 'Authorized Sandbox',
    status: latestScanResult ? 'COMPLETED' : 'READY',
    authorizedBy: 'Security Analyst',
    createdAt: latestScanResult?.check?.timestamp || new Date().toISOString(),
    scannedFilesCount: latestScanResult?.check?.scannedFilesCount || 0,
    matchesCount: activeObsCount,
    sourceHash: latestScanResult?.check?.sourceHash || 'N/A',
    riskIndex: activeObsCount > 0 ? 85 : 0,
    riskRating: activeObsCount > 0 ? 'High' : 'Clean'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Authorized Evaluation Scope</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Authorized Security Assessments
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Manage target assessment routines, scopes, and verification audits for World Monitor.
          </p>
        </div>

        <button
          onClick={async () => {
            const res = await triggerAssessment('World Monitor');
            if (res?.success && res?.assessmentId) {
              navigate(`/assessments/${res.assessmentId}`);
            }
          }}
          className="btn-primary"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Live Assessment</span>
        </button>
      </div>

      {/* LIVE REAL SCAN ASSESSMENT CARD */}
      <div className="panel-card p-5 sm:p-6 border-l-4 border-l-[#0A6E4F] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE5E0] pb-2">
          <span className="font-bold text-[#16201B] flex items-center gap-1.5 text-xs">
            <Shield className="w-4 h-4 text-[#0A6E4F]" />
            LIVE TARGET ASSESSMENT ({targetProfile?.targetPath || 'Authorized Sandbox'})
          </span>
          <span className="badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded">
            REAL AST SCAN ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <span className="text-[#85948C] block text-[10px]">Assessment ID:</span>
            <span className="text-[#0A6E4F] font-bold">{liveAssessment.id}</span>
          </div>
          <div>
            <span className="text-[#85948C] block text-[10px]">Current Scan Status:</span>
            <span className={activeObsCount > 0 ? 'text-[#C53030] font-bold' : 'text-[#0A6E4F] font-bold'}>
              {activeObsCount > 0 ? `OBSERVED (${activeObsCount} MATCH)` : 'NO MATCH (CLEAN)'}
            </span>
          </div>
          <div>
            <span className="text-[#85948C] block text-[10px]">Files Scanned:</span>
            <span className="text-[#16201B] font-bold">{liveAssessment.scannedFilesCount} source files</span>
          </div>
          <div>
            <span className="text-[#85948C] block text-[10px]">Source Hash:</span>
            <span className="text-[#064E3B] font-bold truncate block">{liveAssessment.sourceHash}</span>
          </div>
          <div>
            <span className="text-[#85948C] block text-[10px]">Evaluated Risk Rating:</span>
            <span className={liveAssessment.riskRating === 'High' ? 'text-[#C53030] font-bold' : 'text-[#0A6E4F] font-bold'}>
              {liveAssessment.riskIndex} ({liveAssessment.riskRating})
            </span>
          </div>
        </div>
      </div>

      {/* ASSESSMENTS TABLE */}
      <div className="panel-card overflow-hidden">
        <div className="p-3.5 border-b border-[#DEE5E0] bg-[#F8F9F6] flex items-center justify-between">
          <span className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
            Assessment Audit Records ({assessments.length})
          </span>
          <span className="text-[11px] text-[#85948C]">Historical Assessment Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16201B]">
            <thead className="bg-[#F8F9F6] text-[#85948C] font-bold border-b border-[#DEE5E0] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Assessment ID</th>
                <th className="p-3.5">Target Name</th>
                <th className="p-3.5">Environment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Risk Index</th>
                <th className="p-3.5">Findings Summary</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE5E0]">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F9F6] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#0A6E4F]">{item.id}</td>
                  <td className="p-3.5 font-semibold text-[#16201B]">{item.targetName}</td>
                  <td className="p-3.5">
                    <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.environment}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="flex items-center space-x-1 text-[#0A6E4F] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0A6E4F]" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#B45309]">{item.riskIndex} ({item.riskRating})</td>
                  <td className="p-3.5">
                    <span className="text-[#16201B] font-bold">{item.totalFindingsCount} Total</span>{' '}
                    <span className="text-[#0A6E4F] font-medium">({item.verifiedCount} Verified)</span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => navigate(`/assessments/${item.id}`)}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0A6E4F]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
