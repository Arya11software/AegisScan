import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Wrench, ShieldCheck, ArrowRight, FileCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RemediationPage() {
  const navigate = useNavigate();
  const { findings, markReadyForRetest } = useApp();

  const activeRemediations = findings;

  const getRemediationStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="badge-emerald text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A6E4F]" />
            VERIFIED
          </span>
        );
      case 'READY_FOR_RETEST':
      case 'RETESTED':
      case 'REMEDIATION':
      case 'RETEST_PENDING':
        return (
          <span className="badge-teal text-[11px] font-bold px-2.5 py-0.5 rounded-md">
            READY FOR RETEST
          </span>
        );
      default:
        return (
          <span className="badge-amber text-[11px] font-bold px-2.5 py-0.5 rounded-md">
            REMEDIATION OPEN
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Developer Remediation Workflow</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Remediation Hub
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Developer remediation guidance and fix confirmation prior to automated retest verification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            {activeRemediations.length} Remediation Items
          </span>
        </div>
      </div>

      {/* Remediation Cards */}
      <div className="space-y-4">
        {activeRemediations.map((item) => (
          <div key={item.id} className="panel-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEE5E0] pb-3 gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-[#0A6E4F] bg-[#EBF5F0] border border-[#B6DEC9] px-2.5 py-0.5 rounded">
                  {item.id}
                </span>
                <h2 className="text-sm font-bold text-[#16201B]">{item.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.severity === 'HIGH' ? 'badge-crimson' : 'badge-amber'
                }`}>
                  {item.severity} PRIORITY
                </span>
                {getRemediationStatusBadge(item.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-lg space-y-1">
                <h3 className="text-xs font-bold text-[#85948C] uppercase tracking-wider">Root Cause Analysis</h3>
                <p className="text-xs text-[#16201B] font-mono leading-relaxed">{item.rootCause || 'Root cause analyzed during AST parser pass.'}</p>
              </div>

              <div className="bg-[#EBF5F0] border border-[#B6DEC9] p-4 rounded-lg space-y-1">
                <h3 className="text-xs font-bold text-[#064E3B] uppercase tracking-wider">Recommended Fix Guidance</h3>
                <p className="text-xs text-[#16201B] font-medium leading-relaxed">
                  {typeof item.remediation === 'object' && item.remediation !== null
                    ? item.remediation.recommendation || 'Remediation guidance pending.'
                    : item.remediation || 'Remediation guidance pending.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3 border-t border-[#DEE5E0]">
              <div className="flex items-center space-x-2 text-xs text-[#56655D]">
                <FileCode className="w-3.5 h-3.5 text-[#0A6E4F]" />
                <span>Lifecycle State: <strong className="text-[#0A6E4F] font-mono">{item.status}</strong></span>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => navigate(`/findings/${item.id}`)}
                  className="btn-secondary text-xs"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A6E4F]" />
                </button>

                <button
                  onClick={() => {
                    markReadyForRetest(item.id);
                    navigate('/retesting');
                  }}
                  className="btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Ready for Retest</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
