import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentsListPage() {
  const navigate = useNavigate();
  const { assessments, triggerAssessment, latestScanResult, findings } = useApp();

  const realCheckFinding = findings.find(f => f.id.startsWith('F-REAL-') || f.isRealCheck);
  const activeObsCount = latestScanResult ? (latestScanResult.observations?.length || 0) : (realCheckFinding?.currentCondition === 'OBSERVED' ? 1 : 0);

  const liveAssessment = {
    id: 'WM-2026-LIVE',
    targetName: 'World Monitor (Authorized Local Target)',
    targetUrl: 'C:\\Users\\HP\\worldmonitor',
    environment: 'Authorized Sandbox',
    status: latestScanResult ? 'COMPLETED' : 'READY',
    authorizedBy: 'Security Analyst',
    createdAt: latestScanResult?.check?.timestamp || new Date().toISOString(),
    scannedFilesCount: latestScanResult?.check?.scannedFilesCount || 887,
    matchesCount: activeObsCount,
    sourceHash: latestScanResult?.check?.sourceHash || 'N/A',
    riskIndex: activeObsCount > 0 ? 85 : 0,
    riskRating: activeObsCount > 0 ? 'High' : 'Clean'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#087F5B]" />
            Authorized Security Assessments
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Manage target assessment routines, scopes, and verification audits for World Monitor
          </p>
        </div>

        <button
          onClick={() => {
            triggerAssessment('World Monitor');
            navigate('/dashboard');
          }}
          className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Live Assessment</span>
        </button>
      </div>

      {/* LIVE REAL SCAN ASSESSMENT CARD */}
      <div className="bg-white border border-[#087F5B] rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
          <span className="font-extrabold text-[#17211B] flex items-center gap-1.5 text-xs">
            <Shield className="w-4 h-4 text-[#087F5B]" />
            LIVE TARGET ASSESSMENT (C:\Users\HP\worldmonitor)
          </span>
          <span className="badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded">
            REAL AST SCAN ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <span className="text-[#64746A] block text-[11px]">Assessment ID:</span>
            <span className="text-[#087F5B] font-bold">{liveAssessment.id}</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Current Scan Status:</span>
            <span className={activeObsCount > 0 ? 'text-[#C62828] font-bold' : 'text-[#087F5B] font-bold'}>
              {activeObsCount > 0 ? `OBSERVED (${activeObsCount} MATCH)` : 'NO MATCH (CLEAN)'}
            </span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Files Scanned:</span>
            <span className="text-[#17211B] font-bold">{liveAssessment.scannedFilesCount} source files</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Source Hash:</span>
            <span className="text-[#064E3B] font-bold">{liveAssessment.sourceHash}</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Evaluated Risk Rating:</span>
            <span className={liveAssessment.riskRating === 'High' ? 'text-[#C62828] font-bold' : 'text-[#087F5B] font-bold'}>
              {liveAssessment.riskIndex} ({liveAssessment.riskRating})
            </span>
          </div>
        </div>
      </div>

      {/* ASSESSMENTS TABLE */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg overflow-hidden shadow-2xs space-y-1">
        <div className="p-3 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider">
            ASSESSMENT AUDIT RECORDS
          </span>
          <span className="text-[10px] text-[#64746A]">Audit Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#17211B]">
            <thead className="bg-[#F7F8F5] text-[#64746A] font-extrabold border-b border-[#DDE5DF] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Assessment ID</th>
                <th className="p-3.5">Target Name</th>
                <th className="p-3.5">Environment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Risk Index</th>
                <th className="p-3.5">Findings Summary</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#087F5B]">{item.id}</td>
                  <td className="p-3.5 font-extrabold text-[#17211B]">{item.targetName}</td>
                  <td className="p-3.5">
                    <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.environment}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="flex items-center space-x-1 text-[#087F5B] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#B7791F]">{item.riskIndex} ({item.riskRating})</td>
                  <td className="p-3.5">
                    <span className="text-[#17211B] font-extrabold">{item.totalFindingsCount} Total</span>{' '}
                    <span className="text-[#087F5B] font-bold">({item.verifiedCount} Verified)</span>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => navigate(`/assessments/${item.id}`)}
                      className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3 py-1 rounded-md text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#087F5B]" />
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
