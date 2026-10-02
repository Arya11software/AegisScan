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
  Server,
  X,
  ChevronRight
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Target & Surface',
      items: [
        { label: 'Target System', path: '/targets', icon: Server },
        { label: 'Assessments', path: '/assessments', icon: Target },
        { label: 'Attack Surface', path: '/attack-surface', icon: Crosshair },
        { label: 'Security Controls', path: '/security-checks', icon: Layers }
      ]
    },
    {
      group: 'Evidence & Findings',
      items: [
        { label: 'Findings', path: '/findings', icon: ShieldAlert },
        { label: 'Evidence Engine', path: '/evidence', icon: Flame }
      ]
    },
    {
      group: 'Closed Loop Verification',
      items: [
        { label: 'Remediation Hub', path: '/remediation', icon: CheckCircle2 },
        { label: 'Retesting & Verify', path: '/retesting', icon: RotateCcw }
      ]
    },
    {
      group: 'Governance',
      items: [
        { label: 'Audit Reports', path: '/reports', icon: FileText },
        { label: 'System Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-[#16201B]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-64 bg-[#FFFFFF] border-r border-[#DEE5E0] flex flex-col justify-between transition-transform duration-250 ease-out select-none ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-[#DEE5E0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
            <Logo size="md" />
            <button 
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 rounded-md text-[#56655D] hover:text-[#16201B] hover:bg-[#F3F5F1] transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden" aria-label="Main Navigation">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-[#85948C] tracking-wider uppercase">
                  {group.group}
                </div>
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={idx}
                      to={item.path}
                      onClick={() => {
                        if (onClose) onClose();
                      }}
                      className={`group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#EBF5F0] text-[#0A6E4F] font-semibold shadow-2xs border-l-3 border-[#0A6E4F]'
                          : 'text-[#56655D] hover:text-[#16201B] hover:bg-[#F3F5F1]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#0A6E4F]' : 'text-[#85948C] group-hover:text-[#56655D]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0A6E4F] shrink-0" />}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sandbox & Operational Status Widget */}
          <div className="p-3 border-t border-[#DEE5E0] bg-[#F8F9F6] shrink-0">
            <div className="bg-[#FFFFFF] border border-[#DEE5E0] rounded-lg p-2.5 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-[#EBF5F0] border border-[#B6DEC9] flex items-center justify-center text-[#0A6E4F] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#16201B] truncate">WORLD MONITOR</p>
                    <span className="text-[9px] font-mono text-[#85948C]">SANDBOX</span>
                  </div>
                  <p className="text-[10px] text-[#0A6E4F] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A6E4F] animate-pulse"></span>
                    <span>Local Target Active</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
