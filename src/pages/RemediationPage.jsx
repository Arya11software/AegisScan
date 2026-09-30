import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RemediationPage() {
  const navigate = useNavigate();
  const { findings, markReadyForRetest } = useApp();

  const activeRemediations = findings;

  const getRemediationStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="badge-emerald text-[11px] font-bold px-2.5 py-1 rounded-md">VERIFIED</span>;
      case 'REMEDIATION':
      case 'RETEST_PENDING':
        return <span className="badge-amber text-[11px] font-bold px-2.5 py-1 rounded-md">READY FOR RETEST</span>;
      default:
        return <span className="badge-crimson text-[11px] font-bold px-2.5 py-1 rounded-md">OPEN</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#087F5B]" />
            Remediation Hub
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Developer remediation guidance and fix confirmation prior to retest evaluation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            {activeRemediations.length} Active Remediation Items
          </span>
        </div>
      </div>

      {/* Remediation Items */}
      <div className="space-y-6">
        {activeRemediations.map((item) => (
          <div key={item.id} className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DDE5DF] pb-3 gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-[#087F5B] bg-[#E6F4F1] border border-[#B2DFDB] px-2.5 py-1 rounded-md">
                  {item.id}
                </span>
                <h2 className="text-sm font-extrabold text-[#17211B]">{item.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                  item.severity === 'HIGH' ? 'badge-crimson' : 'badge-amber'
                }`}>
                  {item.severity} PRIORITY
                </span>
                {getRemediationStatusBadge(item.status)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-1">
                <h3 className="text-xs font-bold text-[#64746A] uppercase tracking-wider">Root Cause Analysis</h3>
                <p className="text-xs text-[#17211B] font-mono">{item.rootCause}</p>
              </div>

              <div className="bg-[#E6F4F1] border border-[#B2DFDB] p-4 rounded-md space-y-1">
                <h3 className="text-xs font-bold text-[#064E3B] uppercase tracking-wider">Recommended Remediation</h3>
                <p className="text-xs text-[#17211B] font-semibold">
                  {typeof item.remediation === 'object' && item.remediation !== null
                    ? item.remediation.recommendation || 'Remediation recommendation pending.'
                    : item.remediation || 'Remediation recommendation pending.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3 border-t border-[#DDE5DF]">
              <span className="text-xs text-[#64746A]">
                Remediation Lifecycle Status: <strong className="text-[#087F5B] font-mono">{item.status}</strong>
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    markReadyForRetest(item.id);
                    navigate('/retesting');
                  }}
                  className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold shadow-sm flex items-center space-x-2 cursor-pointer transition-all"
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
