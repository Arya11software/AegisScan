import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Crosshair, 
  ShieldAlert, 
  FileText,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assessments, triggerAssessment } = useApp();

  // Context-derived assessment (re-computed on every render when assessments updates).
  // This is the primary source: context is always up-to-date once React flushes setAssessments.
  const ctxAssessment = (Array.isArray(assessments) ? assessments : []).find(a => a.id === id)
    || (id ? null : (assessments && assessments[0]));

  // Async API-fetch state — used only as a fallback when context doesn't have the assessment yet.
  // fetchLoading starts true (when there's no ctxAssessment) so we don't need to
  // call setFetchLoading(true) synchronously inside the effect.
  const [fetchedAssessment, setFetchedAssessment] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(!ctxAssessment && Boolean(id));
  const [fetchError, setFetchError] = useState(null);

  // ── CORE FIX: Derive the displayed assessment during render (no setState-in-effect needed).
  // ctxAssessment takes priority — when React flushes the setAssessments update
  // (which may happen after navigate), the component automatically re-renders and uses
  // the context value, resolving the race condition without any extra setState calls.
  const assessment = ctxAssessment || fetchedAssessment;
  const loading = !ctxAssessment && fetchLoading;
  const error = (!assessment && !fetchLoading)
    ? (fetchError || (!id ? 'No assessment ID specified.' : null))
    : null;

  // Fetch from API only when context doesn't have the assessment.
  useEffect(() => {
    if (ctxAssessment) return; // Context has it — no API call needed
    if (!id) return;

    // fetchLoading was already initialized to true above, so no synchronous
    // setState needed here — we just update on async callbacks.
    let isMounted = true;
    apiService.getAssessment(id)
      .then(res => {
        if (!isMounted) return;
        if (res?.success && res?.assessment) {
          setFetchedAssessment(res.assessment);
        } else {
          setFetchError(res?.error?.message || 'Assessment record not found');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setFetchError(err.message || 'Failed to fetch assessment record');
      })
      .finally(() => {
        if (isMounted) setFetchLoading(false);
      });

    return () => { isMounted = false; };
  }, [id, ctxAssessment]);

  const workflowSteps = [
    { num: '01', label: 'Target', path: '/targets', status: 'completed' },
    { num: '02', label: 'Authorization', path: '/assessments/new', status: 'completed' },
    { num: '03', label: 'Discovery', path: '/attack-surface', status: 'completed' },
    { num: '04', label: 'Test Plan', path: '/security-checks', status: 'completed' },
    { num: '05', label: 'Assessment', path: `/assessments/${id}`, status: 'active' },
    { num: '06', label: 'Findings', path: '/findings', status: 'next' },
    { num: '07', label: 'Retest', path: '/retesting', status: 'next' },
    { num: '08', label: 'Report', path: '/reports', status: 'next' }
  ];

  if (loading) {
    return (
      <div className="panel-card p-12 text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="w-6 h-6 text-[#0A6E4F] animate-spin" />
        <p className="text-xs text-[#56655D] font-medium">Loading assessment details for <strong className="font-mono text-[#0A6E4F]">{id}</strong>...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="panel-card p-8 text-center space-y-3">
        <h2 className="text-sm font-bold text-[#16201B]">Assessment Record Not Found</h2>
        <p className="text-xs text-[#56655D]">Assessment ID <strong className="font-mono text-[#0A6E4F]">{id}</strong> was not found in the backend persistent store.</p>
        <button
          onClick={() => navigate('/assessments')}
          className="btn-primary"
        >
          Back to Assessments List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/assessments')}
            className="p-2 rounded-md bg-[#FFFFFF] border border-[#DEE5E0] text-[#16201B] hover:bg-[#F8F9F6] transition-colors cursor-pointer"
            aria-label="Back to assessments"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider">Assessment Execution Record</span>
              <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">LIVE RUN</span>
            </div>
            <h1 className="text-xl font-bold text-[#16201B] flex items-center gap-2">
              Assessment <span className="font-mono text-[#0A6E4F]">{assessment.id}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/findings')}
            className="btn-secondary text-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#0A6E4F]" />
            <span>View Findings</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="btn-secondary text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#0A6E4F]" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Modern Visual Stepper (Requirement 6) */}
      <div className="panel-card p-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#85948C] uppercase tracking-wider px-1">
          <span>Closed-Loop Workflow Progress</span>
          <span className="text-[#0A6E4F]">Phase 05 of 08 Active</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {workflowSteps.map((s, idx) => {
            const isCompleted = s.status === 'completed';
            const isActive = s.status === 'active';
            return (
              <div
                key={idx}
                onClick={() => navigate(s.path)}
                className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#EBF5F0] border-[#0A6E4F] ring-2 ring-[#0A6E4F]/20'
                    : isCompleted
                    ? 'bg-[#FFFFFF] border-[#DEE5E0] hover:bg-[#F8F9F6]'
                    : 'bg-[#F8F9F6] border-[#EBF0EC] opacity-60'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-[#EBF5F0] text-[#0A6E4F] flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 text-[#0A6E4F]" />
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#0A6E4F]' : 'text-[#85948C]'}`}>
                      {s.num}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] font-bold truncate ${isActive ? 'text-[#0A6E4F]' : isCompleted ? 'text-[#16201B]' : 'text-[#85948C]'}`}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="panel-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Risk Rating & Index</span>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-[#B45309] font-mono">{assessment.riskIndex || 0}</p>
            <span className="text-xs font-semibold text-[#56655D]">({assessment.riskRating || 'Evaluated'})</span>
          </div>
          <span className="text-[10px] text-[#85948C] block">Deterministic assessment score</span>
        </div>

        <div className="panel-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Total Findings Captured</span>
          <p className="text-2xl font-bold text-[#16201B] font-mono">{assessment.totalFindingsCount || 0}</p>
          <span className="text-[10px] text-[#85948C] block">Across 6 attack surface tiers</span>
        </div>

        <div className="panel-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Verified Resolutions</span>
          <p className="text-2xl font-bold text-[#0A6E4F] font-mono">{assessment.verifiedCount || 0}</p>
          <span className="text-[10px] text-[#0A6E4F] font-medium block">Closed-loop verified clean</span>
        </div>
      </div>

      {/* Scopes Covered & Actions */}
      <div className="panel-card p-6 space-y-5">
        <div className="border-b border-[#DEE5E0] pb-3">
          <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
            Assessment Scopes Evaluated
          </h2>
          <p className="text-xs text-[#56655D]">Security controls and boundary constraints executed in this assessment run.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(assessment.scopes || ['Client Config', 'Auth & Session', 'Authorization', 'API Security']).map((scope, idx) => (
            <div key={idx} className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-md p-3 text-xs font-semibold text-[#16201B] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#0A6E4F] shrink-0" />
              <span className="truncate">{scope}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#DEE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#56655D]">
            Target: <strong className="text-[#16201B]">{assessment.targetName}</strong> ({assessment.environment})
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/attack-surface')}
              className="btn-secondary"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#0A6E4F]" />
              <span>Inspect Attack Surface</span>
            </button>

            <button
              onClick={async () => {
                const res = await triggerAssessment(assessment.targetName, assessment.scopes, assessment.checkIds);
                if (res?.success && res?.assessmentId) {
                  navigate(`/assessments/${res.assessmentId}`);
                }
              }}
              className="btn-primary"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Re-Run Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
