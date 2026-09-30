import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Activity, 
  FileCode, 
  Layers, 
  ShieldCheck,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  AlertOctagon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AISecurityAssistant from '../components/AISecurityAssistant';
import { LIFECYCLE_STATES } from '../services/findingStateMachine';

export default function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    findings, 
    evidenceList: globalEvidenceList,
    userRole, 
    validateFinding, 
    openRemediation, 
    markReadyForRetest,
    showToast
  } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');

  const finding = findings.find(f => f.id === id) || (id ? null : findings[0]);

  if (!finding) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-8 text-center space-y-3 shadow-2xs">
        <h2 className="text-sm font-extrabold text-[#17211B]">Finding Record Not Found</h2>
        <p className="text-xs text-[#64746A]">Finding ID <strong className="font-mono text-[#087F5B]">{id}</strong> was not found in the active finding store.</p>
        <button
          onClick={() => navigate('/findings')}
          className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Back to Findings List
        </button>
      </div>
    );
  }

  const evidenceList = (finding.evidence && finding.evidence.length > 0) 
    ? finding.evidence 
    : (globalEvidenceList || []).filter(ev => ev.findingId === finding.id || (finding.evidenceIds && finding.evidenceIds.includes(ev.id)));

  const isAnalyst = userRole === 'SECURITY_ANALYST';
  const isDeveloper = userRole === 'DEVELOPER';

  // Master Prompt Section 15 Finding Lifecycle Stages
  const lifecycleStages = [
    { key: LIFECYCLE_STATES.DETECTED, label: 'Detected' },
    { key: LIFECYCLE_STATES.EVIDENCE_COLLECTED, label: 'Evidence Collected' },
    { key: LIFECYCLE_STATES.AI_ANALYZED, label: 'AI Analyzed' },
    { key: LIFECYCLE_STATES.VALIDATED, label: 'Validated' },
    { key: LIFECYCLE_STATES.REMEDIATION_OPEN, label: 'Remediation' },
    { key: LIFECYCLE_STATES.READY_FOR_RETEST, label: 'Ready for Retest' },
    { key: LIFECYCLE_STATES.VERIFIED, label: 'Verified' }
  ];

  const getStageStatus = (stageKey) => {
    if (finding.status === LIFECYCLE_STATES.VERIFIED) return 'completed';
    if (finding.status === LIFECYCLE_STATES.REOPENED) {
      if (stageKey === LIFECYCLE_STATES.VERIFIED) return 'failed';
      return 'completed';
    }
    const order = [
      LIFECYCLE_STATES.DETECTED,
      LIFECYCLE_STATES.EVIDENCE_COLLECTED,
      LIFECYCLE_STATES.AI_ANALYZED,
      LIFECYCLE_STATES.VALIDATED,
      LIFECYCLE_STATES.REMEDIATION_OPEN,
      LIFECYCLE_STATES.READY_FOR_RETEST,
      LIFECYCLE_STATES.RETESTED,
      LIFECYCLE_STATES.VERIFIED
    ];
    const currentIndex = order.indexOf(finding.status);
    const stageIndex = order.indexOf(stageKey);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const handleAnalystAction = (actionFn) => {
    if (!isAnalyst) {
      showToast('Action Restricted: Only Security Analyst role can perform validation or retest execution.', 'error');
      return;
    }
    actionFn();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate('/findings')}
            className="p-2 rounded-md bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] hover:bg-[#DDE5DF]/50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs font-bold text-[#087F5B] bg-[#E6F4F1] border border-[#B2DFDB] px-2.5 py-1 rounded-md">
                {finding.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                finding.severity === 'HIGH' ? 'badge-crimson' : 'badge-amber'
              }`}>
                {finding.severity} SEVERITY
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                finding.status === 'VERIFIED' ? 'badge-emerald' : finding.status === 'REOPENED' ? 'badge-crimson' : 'badge-amber'
              }`}>
                {finding.status}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-[#17211B]">{finding.title}</h1>
            <p className="text-xs text-[#64746A]">Category: {finding.category} • Component: {finding.component}</p>
          </div>
        </div>

        {/* State Machine Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {(finding.status === LIFECYCLE_STATES.AI_ANALYZED || finding.status === LIFECYCLE_STATES.DETECTED || finding.status === LIFECYCLE_STATES.EVIDENCE_COLLECTED) && (
            <button
              onClick={() => handleAnalystAction(() => validateFinding(finding.id))}
              className={`px-4 py-2 rounded-md text-xs font-bold cursor-pointer transition-all ${
                isAnalyst ? 'bg-[#087F5B] hover:bg-[#064E3B] text-white shadow-sm' : 'bg-[#F7F8F5] border border-[#DDE5DF] text-[#64746A]'
              }`}
            >
              Validate Finding (Analyst)
            </button>
          )}

          {finding.status === LIFECYCLE_STATES.VALIDATED && (
            <button
              onClick={() => openRemediation(finding.id)}
              className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
            >
              Open Remediation
            </button>
          )}

          {finding.status === LIFECYCLE_STATES.REOPENED && (
            <button
              onClick={() => openRemediation(finding.id)}
              className="bg-[#B7791F] hover:bg-[#925F18] text-white px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
            >
              Re-open Remediation (Dev)
            </button>
          )}

          {(finding.status === LIFECYCLE_STATES.REMEDIATION_OPEN || finding.status === LIFECYCLE_STATES.REOPENED) && (
            <button
              onClick={() => {
                markReadyForRetest(finding.id);
                navigate('/retesting');
              }}
              className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Ready for Retest (Dev)</span>
            </button>
          )}

          {(finding.status === LIFECYCLE_STATES.READY_FOR_RETEST || finding.status === LIFECYCLE_STATES.RETESTED) && (
            <button
              onClick={() => handleAnalystAction(() => navigate('/retesting'))}
              className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all ${
                isAnalyst ? 'bg-[#087F5B] hover:bg-[#064E3B] text-white shadow-sm' : 'bg-[#F7F8F5] border border-[#DDE5DF] text-[#64746A]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Execute Retest (Analyst)</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Finding Lifecycle Timeline Bar (Master Prompt Section 15) */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
          <h3 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#087F5B]" />
            CLOSED-LOOP FINDING LIFECYCLE TIMELINE
          </h3>
          <span className="text-[11px] font-bold text-[#087F5B]">State Machine Governed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {lifecycleStages.map((stage, idx) => {
            const st = getStageStatus(stage.key);
            const isCompleted = st === 'completed';
            const isActive = st === 'active';
            const isFailed = st === 'failed';
            return (
              <div 
                key={idx} 
                className={`p-2.5 rounded-md border text-center space-y-1 ${
                  isCompleted 
                    ? 'bg-[#E6F4F1] border-[#B2DFDB] text-[#064E3B]' 
                    : isActive 
                    ? 'bg-white border-[#087F5B] ring-1 ring-[#087F5B] text-[#17211B]' 
                    : isFailed
                    ? 'bg-red-50 border-red-200 text-[#C62828]'
                    : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#64746A]'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-pulse"></span>
                  ) : isFailed ? (
                    <AlertOctagon className="w-3.5 h-3.5 text-[#C62828]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#DDE5DF]"></span>
                  )}
                  <span className="text-[10px] font-extrabold uppercase">{stage.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Details Tabs (Left) + AI Security Assistant (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tabs Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#DDE5DF] space-x-2 bg-white p-1.5 rounded-lg border shadow-2xs">
            {['Overview', 'Evidence', 'Impact', 'Remediation', 'Retest', 'Timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#087F5B] text-white shadow-2xs'
                    : 'text-[#64746A] hover:text-[#17211B] hover:bg-[#F7F8F5]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-5 shadow-2xs">
              <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">Finding Summary</h2>
              <p className="text-xs text-[#17211B] leading-relaxed font-medium">{finding.description}</p>

              <div className="border-t border-[#DDE5DF] pt-4 space-y-2">
                <h3 className="text-xs font-bold text-[#17211B]">Root Cause</h3>
                <p className="text-xs text-[#17211B] bg-[#F7F8F5] p-3.5 rounded-md border border-[#DDE5DF] font-mono">
                  {finding.rootCause}
                </p>
              </div>

              <div className="border-t border-[#DDE5DF] pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#64746A] block text-[11px]">Validation State:</span>
                  <span className="font-bold text-[#087F5B]">{finding.validation?.status || 'CONFIRMED'}</span>
                </div>
                <div>
                  <span className="text-[#64746A] block text-[11px]">Current Retest Outcome:</span>
                  <span className="font-bold text-[#064E3B]">{finding.retest?.status || 'PENDING'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {activeTab === 'Evidence' && (
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
                <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#087F5B]" />
                  Captured HTTP & Repository Evidence ({evidenceList.length})
                </h2>
              </div>

              {evidenceList.map((ev, idx) => (
                <div key={idx} className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#087F5B]">{ev.id || `EVD-00${idx+1}`}</span>
                    <span className="text-[10px] text-[#64746A]">{ev.timestamp || '2026-09-27'}</span>
                  </div>

                  <h3 className="text-xs font-bold text-[#17211B]">Rule: {ev.ruleEvaluated || 'AZ-002'}</h3>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#64746A] uppercase">Observation</span>
                    <p className="text-xs text-[#17211B] bg-white p-2.5 rounded border border-[#DDE5DF]">
                      {typeof ev.observation === 'string' ? ev.observation : JSON.stringify(ev.observation, null, 2)}
                    </p>
                  </div>

                  {ev.request && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#64746A] uppercase">HTTP / Target Request Artifact</span>
                      <pre className="bg-white border border-[#DDE5DF] p-3 rounded-md text-[11px] font-mono text-[#17211B] overflow-x-auto">
{typeof ev.request === 'string' ? ev.request : JSON.stringify(ev.request, null, 2)}
                      </pre>
                    </div>
                  )}

                  {ev.response && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#64746A] uppercase">HTTP / Target Response Artifact</span>
                      <pre className="bg-white border border-[#DDE5DF] p-3 rounded-md text-[11px] font-mono text-[#C62828] overflow-x-auto">
{typeof ev.response === 'string' ? ev.response : JSON.stringify(ev.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: IMPACT */}
          {activeTab === 'Impact' && (
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-4 shadow-2xs">
              <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">Impact & Exploitability Analysis</h2>
              
              <div className="space-y-3">
                <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-1">
                  <h3 className="text-xs font-bold text-[#C62828]">Technical Impact</h3>
                  <p className="text-xs text-[#17211B]">{finding.technicalImpact || finding.impact}</p>
                </div>

                <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-1">
                  <h3 className="text-xs font-bold text-[#B7791F]">Business Impact</h3>
                  <p className="text-xs text-[#17211B]">{finding.businessImpact || finding.impact}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMEDIATION */}
          {activeTab === 'Remediation' && (
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-5 shadow-2xs">
              <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">Recommended Fix & Developer Guidance</h2>

              <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-4 rounded-md space-y-1.5">
                <h3 className="text-xs font-bold text-[#064E3B]">Recommended Fix</h3>
                <p className="text-xs text-[#17211B] font-semibold">{finding.remediation?.recommendation || finding.remediation}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#17211B]">Implementation Steps</h3>
                <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-2 font-mono text-xs text-[#17211B]">
                  {(finding.remediation?.implementationSteps || finding.implementationSteps)?.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-[#087F5B] font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    markReadyForRetest(finding.id);
                    navigate('/retesting');
                  }}
                  className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-md text-xs font-bold shadow-sm flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MARK READY FOR RETEST</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: RETEST */}
          {activeTab === 'Retest' && (
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
                <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">Retesting & Verification Center</h2>
                <span className="text-xs font-mono font-bold text-[#087F5B]">{finding.retest?.status || 'PENDING'}</span>
              </div>

              <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-2 text-xs">
                <div>
                  <span className="text-[#64746A] block text-[11px]">Previous Baseline Condition:</span>
                  <span className="font-bold text-[#C62828] font-mono">{finding.retest?.previousCondition || 'Condition Detected'}</span>
                </div>
                {finding.retest?.currentCondition && (
                  <div>
                    <span className="text-[#64746A] block text-[11px]">Current Retest Condition:</span>
                    <span className="font-bold text-[#087F5B] font-mono">{finding.retest?.currentCondition}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/retesting')}
                className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>GO TO RETEST RUNNER</span>
              </button>
            </div>
          )}

          {/* TAB 6: TIMELINE & AUDIT TRAIL */}
          {activeTab === 'Timeline' && (
            <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-4 shadow-2xs">
              <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">Lifecycle Audit Trail</h2>
              <div className="space-y-3 font-mono text-xs">
                {(finding.auditTrail || []).map((entry, idx) => (
                  <div key={idx} className="border-l-2 border-[#087F5B] pl-4 py-1 space-y-0.5">
                    <p className="text-[#64746A] text-[10px]">{new Date(entry.timestamp).toLocaleString()}</p>
                    <p className="text-[#17211B] font-bold">{entry.action} — Actor: <span className="text-[#087F5B]">{entry.actor}</span></p>
                    <p className="text-[#64746A] text-[11px]">{entry.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Security Assistant Sidebar */}
        <div className="space-y-6">
          <AISecurityAssistant finding={finding} />
        </div>
      </div>
    </div>
  );
}
