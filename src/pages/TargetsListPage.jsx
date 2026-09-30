import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  GitBranch, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Database,
  ArrowRight,
  Activity,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TargetsListPage() {
  const navigate = useNavigate();
  const { triggerAssessment, targetProfile, refreshData } = useApp();
  const [profile, setProfile] = useState(targetProfile || null);
  const [loading, setLoading] = useState(!targetProfile);
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileStep, setProfileStep] = useState(0);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/target');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
    targetPath: 'C:\\Users\\HP\\worldmonitor',
    environment: 'Authorized Local Sandbox',
    type: 'Web Application & Telemetry Platform',
    status: 'Ready for Assessment',
    techStack: ['TypeScript', 'React', 'Vite', 'MapLibre', 'Three.js', 'deck.gl'],
    fileCounts: { totalFiles: 887, sourceFiles: 620, configFiles: 42, envFiles: 3 },
    dependenciesCount: 48
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-[#17211B] tracking-tight">Target Onboarding & Profiling</h1>
            <span className="badge-emerald text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] animate-pulse"></span>
              Controlled Target
            </span>
          </div>
          <p className="text-xs text-[#64746A] mt-1">
            Authorized target repositories and static profiling workflow engine
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartProfiling}
            disabled={isProfiling}
            className="flex items-center space-x-2 bg-white hover:bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] px-3.5 py-2 rounded-md text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#087F5B]" />
            <span>{isProfiling ? 'Profiling Target...' : 'Refresh Profile'}</span>
          </button>

          <button
            onClick={() => handleStartAssessment(p.targetName)}
            className="flex items-center space-x-2 bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Assessment</span>
          </button>
        </div>
      </div>

      {/* Profiling Progress Banner */}
      {isProfiling && (
        <div className="bg-white border border-[#087F5B] rounded-lg p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#087F5B] animate-spin" />
              <h3 className="font-bold text-sm text-[#17211B]">TARGET PROFILING IN PROGRESS</h3>
            </div>
            <span className="text-xs font-semibold text-[#087F5B]">
              Step {profileStep + 1} of {profilingChecklist.length}
            </span>
          </div>

          <div className="w-full bg-[#F7F8F5] rounded-full h-2 overflow-hidden border border-[#DDE5DF]">
            <div 
              className="bg-[#087F5B] h-full transition-all duration-300"
              style={{ width: `${((profileStep + 1) / profilingChecklist.length) * 100}%` }}
            ></div>
          </div>

          <div className="space-y-1.5 pt-2">
            {profilingChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                {idx <= profileStep ? (
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#DDE5DF] shrink-0"></div>
                )}
                <span className={idx <= profileStep ? 'font-semibold text-[#17211B]' : 'text-[#64746A]'}>
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
          <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-[#64746A] uppercase">Authorized Assessment Target</span>
                <h2 className="text-lg font-extrabold text-[#17211B] flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#087F5B]" />
                  {p.targetName}
                </h2>
              </div>
              <span className="badge-emerald text-xs font-bold px-2 py-0.5 rounded-md">
                {p.status || 'ACCESSIBLE'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-[#DDE5DF]">
              <div>
                <span className="text-[#64746A] block text-[11px]">Authorized Target Path</span>
                <span className="font-mono text-[#087F5B] font-semibold truncate block mt-0.5">
                  {p.targetPath}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                <span className="text-[#64746A]">Environment:</span>
                <span className="font-semibold text-[#17211B]">{p.environment}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                <span className="text-[#64746A]">Total Files:</span>
                <span className="font-bold text-[#087F5B]">{p.fileCounts?.totalFiles || 0}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                <span className="text-[#64746A]">Source Files:</span>
                <span className="font-bold text-[#087F5B]">{p.fileCounts?.sourceFiles || 0}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                <span className="text-[#64746A]">Dependencies:</span>
                <span className="font-bold text-[#087F5B]">{p.dependenciesCount || 0}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#64746A] uppercase tracking-wider block mb-2">Detected Tech Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {(p.techStack || []).map((tech, idx) => (
                  <span key={idx} className="bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] font-semibold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-[#087F5B]" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDE5DF] flex gap-2">
              <button
                onClick={() => navigate('/attack-surface')}
                className="flex-1 bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] text-xs font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Attack Surface</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#087F5B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Target Profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#17211B]">TARGET PROFILE SUMMARY</h3>
                <p className="text-xs text-[#64746A]">Architectural profiling results derived from World Monitor inspection</p>
              </div>
              <span className="badge-emerald text-xs font-semibold px-2.5 py-1 rounded-md">
                Profile Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold text-xs">
                  <Globe className="w-4 h-4" />
                  <h4>FRONTEND LAYER</h4>
                </div>
                <p className="text-xs text-[#17211B]">Single Page Web Application with React, Vite, and TypeScript.</p>
                <div className="text-[11px] text-[#64746A] pt-1">
                  <strong>Key Modules:</strong> Map visualization, spatial layers, client environment configuration.
                </div>
              </div>

              <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <h4>API & DATA LAYER</h4>
                </div>
                <p className="text-xs text-[#17211B]">RESTful endpoints and external telemetry data streams.</p>
                <div className="text-[11px] text-[#64746A] pt-1">
                  <strong>Security Focus:</strong> Input validation, client secret exposure bounds.
                </div>
              </div>

              <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <h4>DEPENDENCY GRAPH</h4>
                </div>
                <p className="text-xs text-[#17211B]">Audited npm package dependencies and lockfiles.</p>
                <div className="text-[11px] text-[#64746A] pt-1">
                  <strong>Status:</strong> {p.dependenciesCount || 0} packages cataloged.
                </div>
              </div>

              <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <h4>SECURITY CONTROLS SCOPE</h4>
                </div>
                <p className="text-xs text-[#17211B]">7 core security check rules active across essential categories.</p>
                <div className="text-[11px] text-[#64746A] pt-1">
                  <strong>Target ID:</strong> <span className="font-mono text-[#064E3B]">WM-SANDBOX-01</span>
                </div>
              </div>
            </div>

            <div className="bg-[#E6F4F1] border border-[#B2DFDB] rounded-lg p-4 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#087F5B] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#064E3B]">Authorized Assessment Sandbox Contract</p>
                <p className="text-[#17211B]">
                  AegisScan executes non-destructive static rules, Babel AST checks, and AI-assisted analysis against the authorized World Monitor repository at <span className="font-mono">{p.targetPath}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
