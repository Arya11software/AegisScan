import React from 'react';
import { Settings, ShieldCheck, RefreshCw, ScrollText, AlertTriangle, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { auditLogs, showToast, refreshData, resetDemo, user } = useApp();

  const handleResetData = async () => {
    await resetDemo();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#087F5B]" />
            System Settings & Audit Governance
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Sandbox policy controls, audit event logging, and demonstration state management
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#087F5B]" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Mandatory Prototype Disclaimer Notice */}
      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-5 space-y-1 text-[#B7791F] text-xs">
        <div className="flex items-center space-x-2 font-bold text-[#B7791F]">
          <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
          <span>PROTOTYPE SECURITY EVALUATION NOTICE</span>
        </div>
        <p className="text-[#17211B] text-[11px] leading-relaxed font-medium">
          Prototype assessment data is synthetic and intended for authorized security testing demonstrations against target World Monitor.
        </p>
      </div>

      {/* Sandbox Configuration Policy Card */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-4 shadow-2xs">
        <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
          Authorized Sandbox Engine Policy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase">Execution Policy</span>
            <p className="font-extrabold text-[#087F5B]">NON-DESTRUCTIVE STATIC VALIDATION</p>
          </div>
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase">Scope Boundaries</span>
            <p className="font-extrabold text-[#064E3B]">WORLD MONITOR LOCAL SANDBOX</p>
          </div>
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-4 rounded-md space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase">Lead Assessor Context</span>
            <p className="font-bold text-[#17211B]">{user.name} ({user.role})</p>
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#087F5B]" />
            System Audit Log Trail ({auditLogs.length} Events)
          </h2>
          <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
            Audit Active
          </span>
        </div>

        <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-4 max-h-80 overflow-y-auto space-y-3 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DDE5DF] pb-2 gap-1">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-[#64746A]">{log.timestamp}</span>
                  <span className="font-bold text-[#087F5B]">{log.action}</span>
                </div>
                <p className="text-[11px] text-[#17211B] font-sans font-medium">{log.details}</p>
              </div>
              <div className="text-right text-[10px] text-[#64746A]">
                Actor: <span className="font-bold text-[#17211B]">{log.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
