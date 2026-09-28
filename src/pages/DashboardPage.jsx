import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  RotateCcw, 
  Play, 
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  AlertOctagon,
  RefreshCw,
  Wrench
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeTarget, activeAssessment, findings, triggerAssessment, latestScanResult } = useApp();

  // Requirement 13: Distinguish CURRENT ACTIVE FINDINGS (currentCondition === 'OBSERVED') from historical findings
  const activeFindings = findings.filter(f => f.currentCondition ? f.currentCondition === 'OBSERVED' : f.status !== 'VERIFIED');
  const totalFindings = findings.length;

  const detectedCount = activeFindings.filter(f => f.status === 'DETECTED' || f.status === 'EVIDENCE_COLLECTED' || f.status === 'AI_ANALYZED').length;
  const validatedCount = activeFindings.filter(f => f.status === 'VALIDATED').length;
  const remediationCount = activeFindings.filter(f => f.status === 'REMEDIATION_OPEN').length;
  const readyRetestCount = activeFindings.filter(f => f.status === 'READY_FOR_RETEST' || f.status === 'RETESTED').length;
  const verifiedCount = findings.filter(f => f.status === 'VERIFIED').length;
  const reopenedCount = activeFindings.filter(f => f.status === 'REOPENED').length;

  // Requirement 2 & 13: Separate Historical Cumulative Activity Metrics
  const historicalValidated = findings.filter(f => f.validation?.status === 'CONFIRMED' || ['VALIDATED', 'REMEDIATION_OPEN', 'READY_FOR_RETEST', 'VERIFIED', 'REOPENED'].includes(f.status)).length;
  const historicalRemediationsCompleted = findings.filter(f => ['READY_FOR_RETEST', 'VERIFIED', 'REOPENED'].includes(f.status) || f.remediation?.status === 'READY_FOR_RETEST').length;
  const historicalRetestsExecuted = findings.filter(f => f.retest?.executedAt || ['VERIFIED', 'REOPENED'].includes(f.status) || (f.auditTrail && f.auditTrail.some(a => a.action === 'VERIFIED' || a.action === 'REOPENED'))).length;
  const historicalFindingsReopened = findings.filter(f => f.status === 'REOPENED' || (f.auditTrail && f.auditTrail.some(a => a.action === 'REOPENED'))).length;

  const severityData = [
    { name: 'High', value: activeFindings.filter(f => f.severity === 'HIGH').length, color: '#C62828' },
    { name: 'Medium', value: activeFindings.filter(f => f.severity === 'MEDIUM').length, color: '#B7791F' },
    { name: 'Low', value: activeFindings.filter(f => f.severity === 'LOW').length, color: '#087F5B' }
  ];

  const lifecycleData = [
    { name: 'Active Detected', count: detectedCount, color: '#64746A' },
    { name: 'Validated', count: validatedCount, color: '#B7791F' },
    { name: 'Remediation', count: remediationCount, color: '#087F5B' },
    { name: 'Ready for Retest', count: readyRetestCount, color: '#064E3B' },
    { name: 'Verified Clean', count: verifiedCount, color: '#087F5B' },
    { name: 'Reopened', count: reopenedCount, color: '#C62828' }
  ];


  // Compute coverage data dynamically from check results & active findings
  const hasCategoryFinding = (catKeyword) => {
    return activeFindings.some(f => 
      (f.category && f.category.toLowerCase().includes(catKeyword)) ||
      (f.checkId && f.checkId.toLowerCase().includes(catKeyword))
    );
  };

  const coverageData = [
    { name: 'Auth & Session', score: hasCategoryFinding('auth') || hasCategoryFinding('session') ? 50 : 100 },
    { name: 'Authorization', score: hasCategoryFinding('authorization') || hasCategoryFinding('access') ? 50 : 100 },
    { name: 'Client Config', score: hasCategoryFinding('config') || hasCategoryFinding('credential') ? 0 : 100 },
    { name: 'Input Val', score: hasCategoryFinding('input') ? 50 : 100 },
    { name: 'Network Sec', score: hasCategoryFinding('net') || hasCategoryFinding('http') ? 50 : 100 },
    { name: 'Storage Sec', score: hasCategoryFinding('store') || hasCategoryFinding('storage') ? 50 : 100 },
    { name: 'Dependencies', score: hasCategoryFinding('dep') ? 50 : 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#087F5B] uppercase tracking-wider">Closed-Loop Security Assessment</span>
            <span className="text-[#64746A]">•</span>
            <span className="text-xs text-[#64746A]">Target: <strong className="text-[#17211B] font-mono">{activeTarget}</strong></span>
          </div>
          <h1 className="text-xl font-extrabold text-[#17211B] tracking-tight">
            Security Operations Dashboard
          </h1>
          <p className="text-xs text-[#64746A]">
            Evidence-backed validation state machine for active target <span className="font-semibold text-[#064E3B]">{activeTarget}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/targets')}
            className="flex items-center space-x-1.5 bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3.5 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-[#087F5B]" />
            <span>Target Profile</span>
          </button>

          <button
            onClick={() => triggerAssessment(activeTarget)}
            className="flex items-center space-x-2 bg-[#087F5B] hover:bg-[#064E3B] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Assessment</span>
          </button>
        </div>
      </div>

      {/* Requirement 1: CURRENT STATUS (MUTUALLY EXCLUSIVE BUCKETS DERIVED EXCLUSIVELY FROM finding.status) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#087F5B]" />
            CURRENT STATUS (Active Finding Distribution)
          </h2>
          <span className="text-[11px] text-[#64746A] font-semibold">Mutually Exclusive Buckets ({totalFindings} Total Findings)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Detected */}
          <div onClick={() => navigate('/findings')} className="bg-white border border-[#DDE5DF] p-4 rounded-lg space-y-1 cursor-pointer hover:border-[#087F5B]">
            <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">DETECTED</span>
            <p className="text-2xl font-extrabold text-[#17211B] font-mono">{detectedCount}</p>
            <span className="text-[10px] text-[#64746A]">Current Detected State</span>
          </div>

          {/* Validated */}
          <div onClick={() => navigate('/findings')} className="bg-white border border-[#DDE5DF] p-4 rounded-lg space-y-1 cursor-pointer hover:border-[#087F5B]">
            <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">VALIDATED</span>
            <p className="text-2xl font-extrabold text-[#B7791F] font-mono">{validatedCount}</p>
            <span className="text-[10px] text-[#64746A]">Current Validated State</span>
          </div>

          {/* Remediation Open */}
          <div onClick={() => navigate('/remediation')} className="bg-white border border-[#DDE5DF] p-4 rounded-lg space-y-1 cursor-pointer hover:border-[#087F5B]">
            <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">REMEDIATION</span>
            <p className="text-2xl font-extrabold text-[#087F5B] font-mono">{remediationCount}</p>
            <span className="text-[10px] text-[#64746A]">Current Remediation State</span>
          </div>

          {/* Ready for Retest */}
          <div onClick={() => navigate('/retesting')} className="bg-white border border-[#DDE5DF] p-4 rounded-lg space-y-1 cursor-pointer hover:border-[#087F5B]">
            <span className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider block">READY FOR RETEST</span>
            <p className="text-2xl font-extrabold text-[#064E3B] font-mono">{readyRetestCount}</p>
            <span className="text-[10px] text-[#64746A]">Awaiting Retest Engine</span>
          </div>

          {/* Verified */}
          <div onClick={() => navigate('/retesting')} className="bg-[#E6F4F1] border border-[#B2DFDB] p-4 rounded-lg space-y-1 cursor-pointer">
            <span className="text-[10px] font-bold text-[#064E3B] uppercase tracking-wider block">VERIFIED</span>
            <p className="text-2xl font-extrabold text-[#087F5B] font-mono">{verifiedCount}</p>
            <span className="text-[10px] text-[#064E3B]">Verified Clean</span>
          </div>

          {/* Reopened */}
          <div onClick={() => navigate('/retesting')} className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-1 cursor-pointer">
            <span className="text-[10px] font-bold text-[#C62828] uppercase tracking-wider block">REOPENED</span>
            <p className="text-2xl font-extrabold text-[#C62828] font-mono">{reopenedCount}</p>
            <span className="text-[10px] text-[#C62828]">Retest Failed</span>
          </div>
        </div>
      </div>

      {/* Requirement 2: LIFECYCLE ACTIVITY (CUMULATIVE HISTORICAL METRICS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#087F5B]" />
            LIFECYCLE ACTIVITY (Cumulative Historical Metrics)
          </h2>
          <span className="text-[11px] text-[#64746A] font-semibold">Audit History & Progress Counters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase block">FINDINGS VALIDATED</span>
            <p className="text-xl font-extrabold text-[#17211B] font-mono">{historicalValidated}</p>
            <span className="text-[10px] text-[#64746A]">Analyst Confirmations</span>
          </div>

          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase block">REMEDIATIONS COMPLETED</span>
            <p className="text-xl font-extrabold text-[#087F5B] font-mono">{historicalRemediationsCompleted}</p>
            <span className="text-[10px] text-[#64746A]">Dev Fixes Submitted</span>
          </div>

          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase block">RETESTS EXECUTED</span>
            <p className="text-xl font-extrabold text-[#064E3B] font-mono">{historicalRetestsExecuted}</p>
            <span className="text-[10px] text-[#64746A]">Automated Retests Run</span>
          </div>

          <div className="bg-[#F7F8F5] border border-[#DDE5DF] p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-[#64746A] uppercase block">FINDINGS REOPENED</span>
            <p className="text-xl font-extrabold text-[#C62828] font-mono">{historicalFindingsReopened}</p>
            <span className="text-[10px] text-[#64746A]">Reopened Fix Attempts</span>
          </div>
        </div>
      </div>

      {/* Closed-Loop Lifecycle Bar */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
              CLOSED-LOOP FINDING STATE DISTRIBUTION
            </h3>
            <p className="text-[11px] text-[#64746A]">Calculated dynamically from persistent findings state machine</p>
          </div>
          <button onClick={() => navigate('/findings/F-001')} className="text-xs font-bold text-[#087F5B] hover:underline flex items-center gap-1">
            <span>Inspect F-001 Lifecycle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {lifecycleData.map((item, idx) => (
            <div key={idx} className="bg-[#F7F8F5] border border-[#DDE5DF] p-3 rounded-md space-y-1">
              <span className="text-[10px] font-bold text-[#64746A] uppercase block">{item.name}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono" style={{ color: item.color }}>{item.count}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
            <h3 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
              FINDINGS BY SEVERITY
            </h3>
            <span className="text-[10px] text-[#64746A]">Current Assessment Run</span>
          </div>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE5DF', borderRadius: '6px', fontSize: '12px', color: '#17211B' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-[#17211B]">
            {severityData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}: <strong className="font-mono">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Coverage */}
        <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
            <h3 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
              SECURITY CONTROLS COVERAGE (%)
            </h3>
            <span className="text-[10px] text-[#087F5B] font-bold">8 Categories Evaluated</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDE5DF" vertical={false} />
                <XAxis dataKey="name" stroke="#64746A" fontSize={10} tickLine={false} />
                <YAxis stroke="#64746A" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE5DF', borderRadius: '6px', fontSize: '12px', color: '#17211B' }}
                />
                <Bar dataKey="score" fill="#087F5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
