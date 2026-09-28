import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Play, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assessments, triggerAssessment } = useApp();

  const assessment = assessments.find(a => a.id === id) || assessments[0];

  if (!assessment) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-[#DDE5DF] pb-4">
        <button
          onClick={() => navigate('/assessments')}
          className="p-1.5 rounded-md bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] hover:bg-[#DDE5DF]/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            Assessment <span className="font-mono text-[#087F5B]">{assessment.id}</span>
          </h1>
          <p className="text-xs text-[#64746A]">Target: {assessment.targetName} ({assessment.environment})</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">Risk Score</span>
          <p className="text-2xl font-extrabold text-[#B7791F] font-mono">{assessment.riskIndex} ({assessment.riskRating})</p>
        </div>
        <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">Total Findings</span>
          <p className="text-2xl font-extrabold text-[#17211B] font-mono">{assessment.totalFindingsCount}</p>
        </div>
        <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">Verified Resolutions</span>
          <p className="text-2xl font-extrabold text-[#087F5B] font-mono">{assessment.verifiedCount}</p>
        </div>
      </div>

      {/* Scopes Covered */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-4 shadow-2xs">
        <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">Assessment Scopes Checked</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {assessment.scopes?.map((scope, idx) => (
            <div key={idx} className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-3 text-xs font-bold text-[#17211B] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
              <span>{scope}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#DDE5DF] flex justify-end">
          <button
            onClick={() => triggerAssessment(assessment.targetName, assessment.scopes)}
            className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Re-Run Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
