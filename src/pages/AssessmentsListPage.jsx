import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play, Shield, CheckCircle2, ArrowRight, Plus, ExternalLink, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentsListPage() {
  const navigate = useNavigate();
  const { assessments, activeAssessment, triggerAssessment, latestScanResult, findings } = useApp();

  const realCheckFinding = findings.find(f => f.id.startsWith('F-REAL-') || f.isRealCheck);
  const activeObsCount = latestScanResult ? (latestScanResult.observations?.length || 0) : (realCheckFinding?.currentCondition === 'OBSERVED' ? 1 : 0);

  const primaryAssessment = activeAssessment || assessments[0] || {
    id: 'ASM-2026-LIVE',
    targetName: 'Authorized Web Application',
    targetUrl: 'http://localhost:3000',
    environment: 'Authorized Sandbox',
    status: 'READY',
    riskIndex: 0,
    riskRating: 'Clean'
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
            Manage target assessment routines, scopes, and verification audits for authorized applications
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/assessments/new')}
            className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Assessment</span>
          </button>

          <button
            onClick={() => {
              triggerAssessment(primaryAssessment.targetName || 'World Monitor');
              navigate('/dashboard');
            }}
            className="bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-2xs flex items-center space-x-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#087F5B] fill-current" />
            <span>Execute Scan</span>
          </button>
        </div>
      </div>

      {/* ACTIVE TARGET ASSESSMENT CARD */}
      <div className="bg-white border border-[#087F5B] rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
          <span className="font-extrabold text-[#17211B] flex items-center gap-1.5 text-xs">
            <Shield className="w-4 h-4 text-[#087F5B]" />
            ACTIVE ASSESSMENT: {primaryAssessment.targetName} ({primaryAssessment.targetUrl})
          </span>
          <span className="badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded">
            {primaryAssessment.environment || 'Sandbox'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <span className="text-[#64746A] block text-[11px]">Assessment ID:</span>
            <span className="text-[#087F5B] font-bold">{primaryAssessment.id}</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Lifecycle Status:</span>
            <span className="text-[#17211B] font-bold">{primaryAssessment.status || 'CONFIGURED'}</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Total Findings:</span>
            <span className="text-[#17211B] font-bold">{primaryAssessment.totalFindingsCount || findings.length} items</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Verified Resolved:</span>
            <span className="text-[#064E3B] font-bold">{primaryAssessment.verifiedCount || 0} findings</span>
          </div>
          <div>
            <span className="text-[#64746A] block text-[11px]">Evaluated Risk Rating:</span>
            <span className={(primaryAssessment.riskRating === 'High' || primaryAssessment.riskRating === 'Critical') ? 'text-[#C62828] font-bold' : 'text-[#087F5B] font-bold'}>
              {primaryAssessment.riskIndex || 0} ({primaryAssessment.riskRating || 'Clean'})
            </span>
          </div>
        </div>
      </div>

      {/* ASSESSMENTS TABLE */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg overflow-hidden shadow-2xs space-y-1">
        <div className="p-3 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider">
            ASSESSMENT AUDIT RECORDS ({assessments.length})
          </span>
          <span className="text-[10px] text-[#64746A]">Database Persisted</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#17211B]">
            <thead className="bg-[#F7F8F5] text-[#64746A] font-extrabold border-b border-[#DDE5DF] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Assessment ID</th>
                <th className="p-3.5">Target Name & URL</th>
                <th className="p-3.5">Environment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Findings Summary</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#087F5B]">{item.id}</td>
                  <td className="p-3.5">
                    <div className="font-extrabold text-[#17211B]">{item.targetName || item.name}</div>
                    <div className="text-[11px] font-mono text-[#64746A] truncate max-w-xs">{item.targetUrl}</div>
                  </td>
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
                  <td className="p-3.5 font-mono font-bold text-[#B7791F]">
                    {item.riskIndex || 0} ({item.riskRating || 'Clean'})
                  </td>
                  <td className="p-3.5">
                    <span className="text-[#17211B] font-extrabold">{item.totalFindingsCount || 0} Total</span>{' '}
                    <span className="text-[#087F5B] font-bold">({item.verifiedCount || 0} Verified)</span>
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
