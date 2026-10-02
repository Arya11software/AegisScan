import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Play, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Code2, 
  Database,
  ArrowRight,
  Activity,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TargetsListPage() {
  const navigate = useNavigate();
  const { triggerAssessment, targetProfile } = useApp();
  const [profile, setProfile] = useState(targetProfile || null);
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileStep, setProfileStep] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/target');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/target')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.profile) {
          setProfile(data.profile);
        }
      })
      .catch(err => {
        console.error(err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const profilingChecklist = [
    'Repository structure & commit tree detected',
    'Project entrypoints and build config analyzed',
    'Technology stack identified from package.json',
    'API surface & client-side HTTP bindings mapped',
    'Server components & backend worker boundaries identified',
    'Package dependencies & lockfiles audited',
    'External integration & data flow boundaries mapped'
  ];

  const handleStartProfiling = () => {
    setIsProfiling(true);
    setProfileStep(0);
    const interval = setInterval(() => {
      setProfileStep((prev) => {
        if (prev >= profilingChecklist.length - 1) {
          clearInterval(interval);
          fetchProfile();
          setTimeout(() => setIsProfiling(false), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
  };

  const handleStartAssessment = async (targetName) => {
    const res = await triggerAssessment(targetName || 'World Monitor');
    if (res?.success && res?.assessmentId) {
      navigate(`/assessments/${res.assessmentId}`);
    }
  };

  const p = profile || {
    targetName: 'World Monitor',
    targetPath: 'Authorized Sandbox',
    environment: 'Authorized Local Sandbox',
    type: 'Web Application & Telemetry Platform',
    status: 'Ready for Assessment',
    techStack: ['TypeScript', 'React', 'Vite', 'MapLibre', 'Three.js', 'deck.gl'],
    fileCounts: { totalFiles: 0, sourceFiles: 0, configFiles: 0, envFiles: 0 },
    dependenciesCount: 0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>Target Governance & Onboarding</span>
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
              Target Onboarding & Profiling
            </h1>
            <span className="badge-emerald text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A6E4F] animate-pulse"></span>
              Controlled Target
            </span>
          </div>
          <p className="text-xs text-[#56655D] mt-0.5">
            Authorized target repositories and static profiling workflow engine.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleStartProfiling}
            disabled={isProfiling}
            className="btn-secondary"
          >
            <Sparkles className="w-4 h-4 text-[#0A6E4F]" />
            <span>{isProfiling ? 'Profiling Target...' : 'Refresh Profile'}</span>
          </button>

          <button
            onClick={() => handleStartAssessment(p.targetName)}
            className="btn-primary"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Assessment</span>
          </button>
        </div>
      </div>

      {/* Profiling Progress Banner */}
      {isProfiling && (
        <div className="panel-card p-5 border-l-4 border-l-[#0A6E4F] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#0A6E4F] animate-spin" />
              <h3 className="font-bold text-sm text-[#16201B]">TARGET PROFILING IN PROGRESS</h3>
            </div>
            <span className="text-xs font-semibold text-[#0A6E4F]">
              Step {profileStep + 1} of {profilingChecklist.length}
            </span>
          </div>

          <div className="w-full bg-[#F3F5F1] rounded-full h-2 overflow-hidden border border-[#DEE5E0]">
            <div 
              className="bg-[#0A6E4F] h-full transition-all duration-300"
              style={{ width: `${((profileStep + 1) / profilingChecklist.length) * 100}%` }}
            ></div>
          </div>

          <div className="space-y-1.5 pt-2">
            {profilingChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                {idx <= profileStep ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0A6E4F] shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#DEE5E0] shrink-0"></div>
                )}
                <span className={idx <= profileStep ? 'font-semibold text-[#16201B]' : 'text-[#85948C]'}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Target Onboarding Card + Detailed Profiling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="panel-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-[#85948C] uppercase">Authorized Assessment Target</span>
                <h2 className="text-base sm:text-lg font-bold text-[#16201B] flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#0A6E4F]" />
                  {p.targetName}
                </h2>
              </div>
              <span className="badge-emerald text-xs font-bold px-2 py-0.5 rounded-md">
                {p.status || 'ACCESSIBLE'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-[#DEE5E0]">
              <div>
                <span className="text-[#85948C] block text-[11px]">Authorized Target Path</span>
                <span className="font-mono text-[#0A6E4F] font-semibold truncate block mt-0.5">
                  {p.targetPath}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F8F9F6]">
                <span className="text-[#56655D]">Environment:</span>
                <span className="font-semibold text-[#16201B]">{p.environment}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F8F9F6]">
                <span className="text-[#56655D]">Total Files:</span>
                <span className="font-bold text-[#0A6E4F] font-mono">{p.fileCounts?.totalFiles || 0}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F8F9F6]">
                <span className="text-[#56655D]">Source Files:</span>
                <span className="font-bold text-[#0A6E4F] font-mono">{p.fileCounts?.sourceFiles || 0}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F8F9F6]">
                <span className="text-[#56655D]">Dependencies:</span>
                <span className="font-bold text-[#0A6E4F] font-mono">{p.dependenciesCount || 0}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#85948C] uppercase tracking-wider block mb-2">Detected Tech Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {(p.techStack || []).map((tech, idx) => (
                  <span key={idx} className="bg-[#F8F9F6] border border-[#DEE5E0] text-[#16201B] font-semibold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-[#0A6E4F]" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DEE5E0]">
              <button
                onClick={() => navigate('/attack-surface')}
                className="w-full btn-secondary text-xs"
              >
                <span>View Attack Surface</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0A6E4F]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Target Profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="panel-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#16201B] uppercase tracking-wider">Target Profile Summary</h3>
                <p className="text-xs text-[#56655D]">Architectural profiling results derived from World Monitor inspection</p>
              </div>
              <span className="badge-emerald text-xs font-semibold px-2.5 py-0.5 rounded-md">
                Profile Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-bold text-xs">
                  <Globe className="w-4 h-4" />
                  <h4>FRONTEND LAYER</h4>
                </div>
                <p className="text-xs text-[#16201B]">Single Page Web Application with React, Vite, and TypeScript.</p>
                <div className="text-[11px] text-[#56655D] pt-1">
                  <strong>Key Modules:</strong> Map visualization, spatial layers, client environment configuration.
                </div>
              </div>

              <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <h4>API & DATA LAYER</h4>
                </div>
                <p className="text-xs text-[#16201B]">RESTful endpoints and external telemetry data streams.</p>
                <div className="text-[11px] text-[#56655D] pt-1">
                  <strong>Security Focus:</strong> Input validation, client secret exposure bounds.
                </div>
              </div>

              <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <h4>DEPENDENCY GRAPH</h4>
                </div>
                <p className="text-xs text-[#16201B]">Audited npm package dependencies and lockfiles.</p>
                <div className="text-[11px] text-[#56655D] pt-1">
                  <strong>Status:</strong> {p.dependenciesCount || 0} packages cataloged.
                </div>
              </div>

              <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#0A6E4F] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <h4>SECURITY CONTROLS SCOPE</h4>
                </div>
                <p className="text-xs text-[#16201B]">7 core security check rules active across essential categories.</p>
                <div className="text-[11px] text-[#56655D] pt-1">
                  <strong>Target ID:</strong> <span className="font-mono text-[#064E3B]">WM-SANDBOX-01</span>
                </div>
              </div>
            </div>

            <div className="bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg p-4 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#0A6E4F] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#064E3B]">Authorized Assessment Sandbox Contract</p>
                <p className="text-[#16201B]">
                  AegisScan executes non-destructive static rules, Babel AST checks, and AI-assisted analysis against the authorized World Monitor repository at <span className="font-mono text-[#064E3B]">{p.targetPath}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
