import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shield, Server, UserCheck, Plus, UserCog, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';

export default function Header() {
  const navigate = useNavigate();
  const { activeTarget, activeAssessmentId, triggerAssessment, user, userRole, setUserRole, refreshData, showToast } = useApp();

  return (
    <header className="h-16 bg-white border-b border-[#DDE5DF] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Target & Assessment Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-[#F7F8F5] border border-[#DDE5DF] px-3 py-1.5 rounded-md">
          <Server className="w-3.5 h-3.5 text-[#087F5B]" />
          <span className="text-xs text-[#64746A]">Target:</span>
          <span className="text-xs font-bold text-[#17211B]">{activeTarget}</span>
        </div>

        <div className="flex items-center space-x-2 bg-[#F7F8F5] border border-[#DDE5DF] px-3 py-1.5 rounded-md">
          <Shield className="w-3.5 h-3.5 text-[#064E3B]" />
          <span className="text-xs text-[#64746A]">Assessment:</span>
          <span className="text-xs font-bold text-[#064E3B] font-mono">{activeAssessmentId}</span>
        </div>
      </div>

      {/* Primary Actions, Role Switcher & User info */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => triggerAssessment(activeTarget)}
          className="flex items-center space-x-2 bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>START ASSESSMENT</span>
        </button>

        <button
          onClick={() => {
            storageService.resetToDefault();
            refreshData();
            showToast('Prototype demo data reset to initial baseline state.', 'info');
          }}
          className="flex items-center space-x-1.5 bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          title="Reset findings to baseline demo state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#087F5B]" />
          <span>Reset Demo</span>
        </button>

        <button
          onClick={() => navigate('/assessments/new')}
          className="flex items-center space-x-1.5 bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#087F5B]" />
          <span>New Scope</span>
        </button>

        <div className="h-4 w-px bg-[#DDE5DF]"></div>

        {/* Role Selector Component */}
        <div className="flex items-center space-x-1.5 bg-[#F7F8F5] border border-[#DDE5DF] px-2.5 py-1 rounded-md">
          <UserCog className="w-3.5 h-3.5 text-[#087F5B]" />
          <span className="text-[11px] text-[#64746A] font-bold">Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-[#17211B] outline-none cursor-pointer"
          >
            <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
            <option value="DEVELOPER">DEVELOPER</option>
          </select>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#087F5B]/10 border border-[#087F5B]/20 flex items-center justify-center text-[#087F5B]">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-[#17211B] leading-tight">{user.name}</p>
            <p className="text-[10px] text-[#087F5B] font-bold">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
