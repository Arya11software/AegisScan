import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Settings, 
  Crosshair, 
  RotateCcw,
  ShieldCheck,
  Flame,
  Layers,
  Server
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const location = useLocation();

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'TARGET & SCOPE',
      items: [
        { label: 'Targets', path: '/targets', icon: Server },
        { label: 'Assessments', path: '/assessments', icon: Target },
        { label: 'Attack Surface', path: '/attack-surface', icon: Crosshair },
        { label: 'Security Checks', path: '/security-checks', icon: Layers }
      ]
    },
    {
      group: 'EVIDENCE & FINDINGS',
      items: [
        { label: 'Findings', path: '/findings', icon: ShieldAlert },
        { label: 'Evidence', path: '/evidence', icon: Flame }
      ]
    },
    {
      group: 'VERIFICATION',
      items: [
        { label: 'Remediation', path: '/remediation', icon: CheckCircle2 },
        { label: 'Retesting', path: '/retesting', icon: RotateCcw }
      ]
    },
    {
      group: 'GOVERNANCE',
      items: [
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#DDE5DF] flex flex-col justify-between h-screen sticky top-0 select-none z-30 shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#DDE5DF] flex items-center justify-between">
          <Logo size="md" />
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h2 className="px-3 text-[10px] font-bold text-[#64746A] tracking-wider uppercase mb-1">
                {group.group}
              </h2>
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={idx}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#087F5B]/10 text-[#087F5B] border-l-3 border-[#087F5B]'
                        : 'text-[#64746A] hover:text-[#17211B] hover:bg-[#F7F8F5]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#087F5B]' : 'text-[#64746A]'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Target & Environment Status Pill */}
      <div className="p-3 border-t border-[#DDE5DF] bg-[#F7F8F5]">
        <div className="flex items-center space-x-2.5 bg-white border border-[#DDE5DF] rounded-lg p-2.5 shadow-2xs">
          <div className="w-7 h-7 rounded-md bg-[#087F5B]/10 border border-[#087F5B]/20 flex items-center justify-center text-[#087F5B]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-[#17211B] truncate tracking-wider">WORLD MONITOR</p>
            <p className="text-[9px] text-[#087F5B] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] animate-pulse"></span>
              Local Sandbox Active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
