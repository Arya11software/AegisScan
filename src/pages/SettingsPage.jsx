import React from 'react';
import { Settings, ShieldCheck, RefreshCw, ScrollText, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { auditLogs, resetDemo, user } = useApp();

  const handleResetData = async () => {
    await resetDemo();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Governance & Policy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            System Settings & Audit Governance
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Sandbox policy controls, audit event logging, and demonstration state management.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="btn-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0A6E4F]" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Mandatory Prototype Disclaimer Notice */}
      <div className="bg-[#FEF7EA] border border-[#FDE5B5] rounded-lg p-5 space-y-1 text-[#B45309] text-xs">
        <div className="flex items-center space-x-2 font-bold text-[#B45309]">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
          <span>PROTOTYPE SECURITY EVALUATION NOTICE</span>
        </div>
        <p className="text-[#16201B] text-[11px] leading-relaxed font-normal">
          Prototype assessment data is synthetic and intended for authorized security testing demonstrations against target World Monitor in the local sandbox.
        </p>
      </div>

      {/* Sandbox Configuration Policy Card */}
      <div className="panel-card p-5 sm:p-6 space-y-4">
        <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
          Authorized Sandbox Engine Policy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#85948C] uppercase">Execution Policy</span>
            <p className="font-bold text-[#0A6E4F]">NON-DESTRUCTIVE STATIC VALIDATION</p>
          </div>
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#85948C] uppercase">Scope Boundaries</span>
            <p className="font-bold text-[#064E3B]">WORLD MONITOR LOCAL SANDBOX</p>
          </div>
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#85948C] uppercase">Lead Assessor Context</span>
            <p className="font-bold text-[#16201B]">{user.name} ({user.role})</p>
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="panel-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
          <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#0A6E4F]" />
            System Audit Log Trail ({auditLogs.length} Events)
          </h2>
          <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
            Audit Active
          </span>
        </div>

        <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 max-h-80 overflow-y-auto space-y-3 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEE5E0] pb-2 gap-1 last:border-b-0 last:pb-0">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-[#85948C]">{log.timestamp}</span>
                  <span className="font-bold text-[#0A6E4F]">{log.action}</span>
                </div>
                <p className="text-[11px] text-[#16201B] font-sans font-normal">{log.details}</p>
              </div>
              <div className="text-left sm:text-right text-[10px] text-[#85948C]">
                Actor: <span className="font-bold text-[#16201B]">{log.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
