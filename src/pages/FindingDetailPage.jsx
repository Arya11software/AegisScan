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
import { storageService } from '../services/storageService';
import AISecurityAssistant from '../components/AISecurityAssistant';
import { LIFECYCLE_STATES } from '../services/findingStateMachine';

export default function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    findings, 
    userRole, 
    validateFinding, 
    openRemediation, 
    markReadyForRetest,
    showToast
  } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');

  const finding = findings.find(f => f.id === id) || findings[0];
  const evidenceList = finding?.evidence || (finding?.evidenceIds?.map(evId => storageService.getEvidence(evId)).filter(Boolean)) || [];

  if (!finding) return null;

  const isAnalyst = userRole === 'SECURITY_ANALYST';
  const isDeveloper = userRole === 'DEVELOPER';

  // Normalize finding status for comparison
  const rawStatus = (finding.status || '').toLowerCase().replace(/[\s_-]+/g, '');
  const isStatus = (target) => rawStatus === target.toLowerCase().replace(/[\s_-]+/g, '');

  // Master Prompt Section 15 Finding Lifecycle Stages
  const lifecycleStages = [
    { key: 'detected', label: 'Detected' },
    { key: 'evidence_collected', label: 'Evidence Collected' },
    { key: 'ai_analyzed', label: 'AI Analyzed' },
    { key: 'validated', label: 'Validated' },
    { key: 'remediation_open', label: 'Remediation' },
    { key: 'ready_for_retest', label: 'Ready for Retest' },
    { key: 'verified', label: 'Verified' }
  ];

  const getStageStatus = (stageKey) => {
    if (isStatus('verified')) return 'completed';
    if (isStatus('reopened') || isStatus('regression')) {
      if (stageKey === 'verified') return 'failed';
      return 'completed';
    }
    const order = [
      'candidate',
      'detected',
      'evidencecollected',
      'aianalyzed',
      'validated',
      'remediationopen',
      'readyforretest',
      'retested',
      'verified'
    ];
    // Map stageKey to normalized key
    const cleanStageKey = stageKey.toLowerCase().replace(/[\s_-]+/g, '');
    const currentStatusKey = isStatus('candidate') ? 'candidate' : rawStatus;
    const currentIndex = order.indexOf(currentStatusKey);
    const stageIndex = order.indexOf(cleanStageKey);

    if (currentIndex >= 0 && stageIndex >= 0) {
      if (stageIndex < currentIndex) return 'completed';
      if (stageIndex === currentIndex) return 'active';
      return 'pending';
    }
    if (stageKey === 'detected' && isStatus('candidate')) return 'active';
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
          {(isStatus('candidate') || isStatus('detected') || isStatus('evidencecollected') || isStatus('aianalyzed')) && (
            <>
              <button
                onClick={() => handleAnalystAction(() => validateFinding(finding.id, { action: 'VALIDATE', confidence: 'High' }))}
                className={`px-4 py-2 rounded-md text-xs font-bold cursor-pointer transition-all ${
                  isAnalyst ? 'bg-[#087F5B] hover:bg-[#064E3B] text-white shadow-sm' : 'bg-[#F7F8F5] border border-[#DDE5DF] text-[#64746A]'
                }`}
              >
                Validate Finding (Analyst)
              </button>
              <button
                onClick={() => handleAnalystAction(() => validateFinding(finding.id, { action: 'MARK_FALSE_POSITIVE', confidence: 'High' }))}
                className="bg-white hover:bg-red-50 border border-red-200 text-[#C62828] px-3.5 py-2 rounded-md text-xs font-bold cursor-pointer transition-all"
              >
                Mark False Positive
              </button>
            </>
          )}

          {isStatus('validated') && (
            <button
              onClick={() => openRemediation(finding.id)}
              className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold cursor-pointer shadow-sm transition-all"
            >
              Open Remediation
            </button>
          )}

          {(isStatus('reopened') || isStatus('regression')) && (
            <button
              onClick={() => openRemediation(finding.id)}
              className="bg-[#B7791F] hover:bg-[#925F18] text-white px-4 py-2 rounded-md text-xs font-bold cursor-pointer shadow-sm transition-all"
            >
              Re-open Remediation (Dev)
            </button>
          )}

          {(isStatus('remediationopen') || isStatus('reopened') || isStatus('regression')) && (
            <button
              onClick={() => {
                markReadyForRetest(finding.id);
                navigate('/retesting');
              }}
              className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Ready for Retest (Dev)</span>
            </button>
          )}

          {(isStatus('readyforretest') || isStatus('retested')) && (
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

          {isStatus('verified') && (
            <span className="badge-emerald text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
              <span>Verified Resolved</span>
            </span>
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

              <div className="border-t border-[#DDE5DF] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#F7F8F5] p-3 rounded-md border border-[#DDE5DF]">
                  <span className="text-[#64746A] block text-[10px] uppercase font-bold">CVSS 3.1 Base Score</span>
                  <span className="font-bold text-sm text-[#C62828]">{finding.cvssScore || (finding.severity === 'HIGH' ? 8.1 : 5.4)}</span>
                  <span className="text-[10px] text-[#64746A] block truncate mt-0.5">{finding.cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N'}</span>
                </div>
                <div className="bg-[#F7F8F5] p-3 rounded-md border border-[#DDE5DF]">
                  <span className="text-[#64746A] block text-[10px] uppercase font-bold">OWASP Mapping</span>
                  <span className="font-bold text-[#17211B] text-xs block truncate mt-1">{finding.owaspMapping || 'A01:2021-Broken Access Control'}</span>
                </div>
                <div className="bg-[#F7F8F5] p-3 rounded-md border border-[#DDE5DF]">
                  <span className="text-[#64746A] block text-[10px] uppercase font-bold">Analyst Confidence</span>
                  <span className="font-bold text-[#087F5B] text-sm block mt-1">{finding.confidence || 'High'}</span>
                </div>
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
