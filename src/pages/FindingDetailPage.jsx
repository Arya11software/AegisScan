import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  Clock, 
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
      <div className="panel-card p-8 text-center space-y-3">
        <h2 className="text-sm font-bold text-[#16201B]">Finding Record Not Found</h2>
        <p className="text-xs text-[#56655D]">Finding ID <strong className="font-mono text-[#0A6E4F]">{id}</strong> was not found in the active finding store.</p>
        <button
          onClick={() => navigate('/findings')}
          className="btn-primary"
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

  // Finding Lifecycle Stages
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="panel-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <button
            onClick={() => navigate('/findings')}
            className="p-2 rounded-md bg-[#FFFFFF] border border-[#DEE5E0] text-[#16201B] hover:bg-[#F8F9F6] cursor-pointer shrink-0 transition-colors"
            aria-label="Back to findings list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0A6E4F] bg-[#EBF5F0] border border-[#B6DEC9] px-2 py-0.5 rounded">
                {finding.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                finding.severity === 'HIGH' ? 'badge-crimson' : 'badge-amber'
              }`}>
                {finding.severity} SEVERITY
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                finding.status === 'VERIFIED' ? 'badge-emerald' : finding.status === 'REOPENED' ? 'badge-crimson' : 'badge-amber'
              }`}>
                {finding.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#16201B] tracking-tight truncate">{finding.title}</h1>
            <p className="text-xs text-[#56655D]">Category: {finding.category} • Component: {finding.component}</p>
          </div>
        </div>

        {/* State Machine Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(finding.status === LIFECYCLE_STATES.AI_ANALYZED || finding.status === LIFECYCLE_STATES.DETECTED || finding.status === LIFECYCLE_STATES.EVIDENCE_COLLECTED) && (
            <button
              onClick={() => handleAnalystAction(() => validateFinding(finding.id))}
              className={isAnalyst ? 'btn-primary' : 'btn-secondary opacity-60'}
            >
              Validate Finding (Analyst)
            </button>
          )}

          {finding.status === LIFECYCLE_STATES.VALIDATED && (
            <button
              onClick={() => openRemediation(finding.id)}
              className="btn-primary"
            >
              Open Remediation
            </button>
          )}

          {finding.status === LIFECYCLE_STATES.REOPENED && (
            <button
              onClick={() => openRemediation(finding.id)}
              className="btn-secondary text-[#B45309] border-[#FDE5B5] bg-[#FEF7EA]"
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
              className="btn-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Ready for Retest (Dev)</span>
            </button>
          )}

          {(finding.status === LIFECYCLE_STATES.READY_FOR_RETEST || finding.status === LIFECYCLE_STATES.RETESTED) && (
            <button
              onClick={() => handleAnalystAction(() => navigate('/retesting'))}
              className={isAnalyst ? 'btn-primary' : 'btn-secondary opacity-60'}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Execute Retest (Analyst)</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Finding Lifecycle Timeline Bar */}
      <div className="panel-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-2">
          <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0A6E4F]" />
            Closed-Loop Lifecycle State Machine
          </h2>
          <span className="text-[11px] font-semibold text-[#0A6E4F]">Deterministic Verification</span>
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
                className={`p-2 rounded-md border text-center space-y-1 transition-all ${
                  isCompleted 
                    ? 'bg-[#EBF5F0] border-[#B6DEC9] text-[#0A6E4F]' 
                    : isActive 
                    ? 'bg-white border-[#0A6E4F] ring-1 ring-[#0A6E4F] text-[#16201B] shadow-xs' 
                    : isFailed
                    ? 'bg-[#FDF2F2] border-[#FBC4C4] text-[#C53030]'
                    : 'bg-[#F8F9F6] border-[#DEE5E0] text-[#85948C]'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0A6E4F]" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#0A6E4F] animate-pulse"></span>
                  ) : isFailed ? (
                    <AlertOctagon className="w-3.5 h-3.5 text-[#C53030]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#DEE5E0]"></span>
                  )}
                  <span className="text-[10px] font-bold uppercase truncate">{stage.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Details Tabs (Left) + AI Security Copilot (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tabs Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#FFFFFF] border border-[#DEE5E0] rounded-lg">
            {['Overview', 'Evidence', 'Impact', 'Remediation', 'Retest', 'Timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#0A6E4F] text-white shadow-xs'
                    : 'text-[#56655D] hover:text-[#16201B] hover:bg-[#F8F9F6]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="panel-card p-6 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider mb-1">Finding Description</h3>
                <p className="text-xs text-[#16201B] leading-relaxed font-normal">{finding.description}</p>
              </div>

              <div className="border-t border-[#DEE5E0] pt-4 space-y-2">
                <h4 className="text-xs font-bold text-[#16201B]">Root Cause Evaluation</h4>
                <p className="text-xs text-[#16201B] bg-[#F8F9F6] p-3.5 rounded-md border border-[#DEE5E0] font-mono leading-relaxed">
                  {finding.rootCause || 'Root cause analyzed during AST static parser pass.'}
                </p>
              </div>

              <div className="border-t border-[#DEE5E0] pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#85948C] block text-[11px]">Validation State:</span>
                  <span className="font-bold text-[#0A6E4F]">{finding.validation?.status || 'CONFIRMED'}</span>
                </div>
                <div>
                  <span className="text-[#85948C] block text-[11px]">Current Retest Outcome:</span>
                  <span className="font-bold text-[#064E3B]">{finding.retest?.status || 'PENDING'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {activeTab === 'Evidence' && (
            <div className="panel-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
                <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#0A6E4F]" />
                  <span>Captured Repository & HTTP Evidence ({evidenceList.length})</span>
                </h3>
              </div>

              {evidenceList.map((ev, idx) => (
                <div key={idx} className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0A6E4F]">{ev.id || `EVD-00${idx+1}`}</span>
                    <span className="text-[10px] text-[#85948C]">{ev.timestamp || '2026-09-27'}</span>
                  </div>

                  <h4 className="text-xs font-bold text-[#16201B]">Rule: {ev.ruleEvaluated || 'AZ-002'}</h4>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#85948C] uppercase">Observation</span>
                    <p className="text-xs text-[#16201B] bg-white p-2.5 rounded border border-[#DEE5E0]">
                      {typeof ev.observation === 'string' ? ev.observation : JSON.stringify(ev.observation, null, 2)}
                    </p>
                  </div>

                  {ev.request && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#85948C] uppercase">HTTP / Target Request Artifact</span>
                      <pre className="bg-white border border-[#DEE5E0] p-3 rounded-md text-[11px] font-mono text-[#16201B] overflow-x-auto">
{typeof ev.request === 'string' ? ev.request : JSON.stringify(ev.request, null, 2)}
                      </pre>
                    </div>
                  )}

                  {ev.response && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#85948C] uppercase">HTTP / Target Response Artifact</span>
                      <pre className="bg-white border border-[#DEE5E0] p-3 rounded-md text-[11px] font-mono text-[#C53030] overflow-x-auto">
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
            <div className="panel-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">Impact & Exploitability Analysis</h3>
              
              <div className="space-y-3">
                <div className="bg-[#FDF2F2] border border-[#FBC4C4] p-4 rounded-md space-y-1">
                  <h4 className="text-xs font-bold text-[#C53030]">Technical Impact</h4>
                  <p className="text-xs text-[#16201B] leading-relaxed">{finding.technicalImpact || finding.impact}</p>
                </div>

                <div className="bg-[#FEF7EA] border border-[#FDE5B5] p-4 rounded-md space-y-1">
                  <h4 className="text-xs font-bold text-[#B45309]">Business & Compliance Impact</h4>
                  <p className="text-xs text-[#16201B] leading-relaxed">{finding.businessImpact || finding.impact}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMEDIATION */}
          {activeTab === 'Remediation' && (
            <div className="panel-card p-6 space-y-5">
              <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">Recommended Fix & Developer Guidance</h3>

              <div className="bg-[#EBF5F0] border border-[#B6DEC9] p-4 rounded-md space-y-1.5">
                <h4 className="text-xs font-bold text-[#064E3B]">Recommended Fix</h4>
                <p className="text-xs text-[#16201B] font-semibold leading-relaxed">
                  {typeof finding.remediation === 'object' && finding.remediation !== null
                    ? finding.remediation.recommendation || 'Remediation guidance pending.'
                    : finding.remediation || 'Remediation guidance pending.'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#16201B]">Implementation Steps</h4>
                <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-md space-y-2 font-mono text-xs text-[#16201B]">
                  {(finding.remediation?.implementationSteps || finding.implementationSteps || ['Isolate configuration values', 'Inject server-only process env', 'Verify clean state via retest runner']).map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-[#0A6E4F] font-bold">•</span>
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
                  className="btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Ready for Retest (Dev)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: RETEST */}
          {activeTab === 'Retest' && (
            <div className="panel-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
                <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">Retesting & Verification Center</h3>
                <span className="text-xs font-mono font-bold text-[#0A6E4F]">{finding.retest?.status || 'PENDING'}</span>
              </div>

              <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-md space-y-2 text-xs">
                <div>
                  <span className="text-[#85948C] block text-[11px]">Previous Baseline Condition:</span>
                  <span className="font-bold text-[#C53030] font-mono">{finding.retest?.previousCondition || 'Condition Detected'}</span>
                </div>
                {finding.retest?.currentCondition && (
                  <div>
                    <span className="text-[#85948C] block text-[11px]">Current Retest Condition:</span>
                    <span className="font-bold text-[#0A6E4F] font-mono">{finding.retest?.currentCondition}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/retesting')}
                className="btn-primary"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Open Retest Runner</span>
              </button>
            </div>
          )}

          {/* TAB 6: TIMELINE & AUDIT TRAIL */}
          {activeTab === 'Timeline' && (
            <div className="panel-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">Lifecycle Audit Trail</h3>
              <div className="space-y-3 font-mono text-xs">
                {(finding.auditTrail || []).map((entry, idx) => (
                  <div key={idx} className="border-l-2 border-[#0A6E4F] pl-4 py-1 space-y-0.5">
                    <p className="text-[#85948C] text-[10px]">{new Date(entry.timestamp).toLocaleString()}</p>
                    <p className="text-[#16201B] font-bold">{entry.action} — Actor: <span className="text-[#0A6E4F]">{entry.actor}</span></p>
                    <p className="text-[#56655D] text-[11px] font-sans">{entry.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Security Copilot */}
        <div className="space-y-6">
          <AISecurityAssistant finding={finding} />
        </div>
      </div>
    </div>
  );
}
