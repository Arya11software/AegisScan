import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shield, Server, UserCheck, Plus, RefreshCw, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header({ onToggleMobileMenu }) {
  const navigate = useNavigate();
  const { activeTarget, activeAssessmentId, triggerAssessment, user, userRole, setUserRole, resetDemo } = useApp();

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#DEE5DF] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: Mobile Menu Toggle + Target & Assessment Badges */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-md text-[#56655D] hover:text-[#16201B] hover:bg-[#F3F5F1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A6E4F]"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 bg-[#F8F9F6] border border-[#DEE5E0] px-2.5 sm:px-3 py-1.5 rounded-md text-xs">
          <Server className="w-3.5 h-3.5 text-[#0A6E4F] shrink-0" />
          <span className="hidden sm:inline text-[#56655D] font-medium">Target:</span>
          <span className="font-semibold text-[#16201B] truncate max-w-[110px] sm:max-w-[150px]">{activeTarget}</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-[#F8F9F6] border border-[#DEE5E0] px-2.5 sm:px-3 py-1.5 rounded-md text-xs">
          <Shield className="w-3.5 h-3.5 text-[#0A6E4F] shrink-0" />
          <span className="text-[#56655D] font-medium">Assessment:</span>
          <span className="font-semibold text-[#0A6E4F] font-mono">{activeAssessmentId}</span>
        </div>
      </div>

      {/* Right: Actions, Role Selector & Assessor Info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Start Assessment CTA */}
        <button
          onClick={async () => {
            const res = await triggerAssessment(activeTarget);
            if (res?.success && res?.assessmentId) {
              navigate(`/assessments/${res.assessmentId}`);
            }
          }}
          className="btn-primary"
          title="Start security assessment against target"
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span className="hidden sm:inline">Start Assessment</span>
          <span className="sm:hidden">Run</span>
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={() => resetDemo()}
          className="btn-secondary hidden sm:inline-flex"
          title="Reset findings to baseline demo state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0A6E4F]" />
          <span>Reset Demo</span>
        </button>

        {/* New Scope CTA */}
        <button
          onClick={() => navigate('/assessments/new')}
          className="btn-secondary hidden md:inline-flex"
          title="Define new assessment scope"
        >
          <Plus className="w-3.5 h-3.5 text-[#0A6E4F]" />
          <span>New Scope</span>
        </button>

        <div className="hidden sm:block h-4 w-px bg-[#DEE5E0]"></div>

        {/* Role Selector with Accessibility attributes */}
        <div className="flex items-center space-x-1.5 bg-[#F8F9F6] border border-[#DEE5E0] px-2 sm:px-2.5 py-1 rounded-md text-xs">
          <label htmlFor="user-role-select" className="sr-only">Switch User Role</label>
          <span className="hidden sm:inline text-[11px] font-semibold text-[#85948C]">Role:</span>
          <select
            id="user-role-select"
            name="userRole"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-[#16201B] outline-none cursor-pointer focus:ring-1 focus:ring-[#0A6E4F] rounded"
          >
            <option value="SECURITY_ANALYST">ANALYST</option>
            <option value="DEVELOPER">DEVELOPER</option>
          </select>
        </div>

        {/* Assessor Avatar / Info */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#EBF5F0] border border-[#B6DEC9] flex items-center justify-center text-[#0A6E4F] shrink-0 font-bold text-xs" title={`${user.name} (${userRole})`}>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-[#16201B] leading-tight">{user.name}</p>
            <p className="text-[10px] text-[#0A6E4F] font-medium">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
