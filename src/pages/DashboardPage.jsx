import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  RotateCcw, 
  Play, 
  Server, 
  ArrowRight,
  ShieldCheck,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeTarget, findings, triggerAssessment, latestScanResult, assessments } = useApp();

  // Distinguish active findings from historical findings
  const activeFindings = findings.filter(f => f.currentCondition ? f.currentCondition === 'OBSERVED' : f.status !== 'VERIFIED');
  const totalFindings = findings.length;

  const detectedCount = activeFindings.filter(f => f.status === 'DETECTED' || f.status === 'EVIDENCE_COLLECTED' || f.status === 'AI_ANALYZED').length;
  const validatedCount = activeFindings.filter(f => f.status === 'VALIDATED').length;
  const remediationCount = activeFindings.filter(f => f.status === 'REMEDIATION_OPEN').length;
  const readyRetestCount = activeFindings.filter(f => f.status === 'READY_FOR_RETEST' || f.status === 'RETESTED').length;
  const verifiedCount = findings.filter(f => f.status === 'VERIFIED').length;
  const reopenedCount = activeFindings.filter(f => f.status === 'REOPENED').length;

  // Cumulative Historical Activity Metrics
  const historicalValidated = findings.filter(f => f.validation?.status === 'CONFIRMED' || ['VALIDATED', 'REMEDIATION_OPEN', 'READY_FOR_RETEST', 'VERIFIED', 'REOPENED'].includes(f.status)).length;
  const historicalRemediationsCompleted = findings.filter(f => ['READY_FOR_RETEST', 'VERIFIED', 'REOPENED'].includes(f.status) || f.remediation?.status === 'READY_FOR_RETEST').length;
  const historicalRetestsExecuted = findings.filter(f => f.retest?.executedAt || ['VERIFIED', 'REOPENED'].includes(f.status) || (f.auditTrail && f.auditTrail.some(a => a.action === 'VERIFIED' || a.action === 'REOPENED'))).length;
  const historicalFindingsReopened = findings.filter(f => f.status === 'REOPENED' || (f.auditTrail && f.auditTrail.some(a => a.action === 'REOPENED'))).length;

  const highSeverityCount = activeFindings.filter(f => f.severity === 'HIGH').length;
  const medSeverityCount = activeFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowSeverityCount = activeFindings.filter(f => f.severity === 'LOW').length;

  const severityData = [
    { name: 'High', value: highSeverityCount, color: '#EA580C' },
    { name: 'Medium', value: medSeverityCount, color: '#B45309' },
    { name: 'Low', value: lowSeverityCount, color: '#0A6E4F' }
  ];

  const lifecycleData = [
    { name: 'Detected', count: detectedCount, color: '#56655D', bg: '#F3F5F1', border: '#DEE5E0', path: '/findings' },
    { name: 'Validated', count: validatedCount, color: '#B45309', bg: '#FEF7EA', border: '#FDE5B5', path: '/findings' },
    { name: 'Remediation', count: remediationCount, color: '#0D9488', bg: '#EDFAF8', border: '#B2EBE4', path: '/remediation' },
    { name: 'Ready for Retest', count: readyRetestCount, color: '#0A6E4F', bg: '#EBF5F0', border: '#B6DEC9', path: '/retesting' },
    { name: 'Verified Clean', count: verifiedCount, color: '#064E3B', bg: '#EBF5F0', border: '#B6DEC9', path: '/retesting' },
    { name: 'Reopened', count: reopenedCount, color: '#C53030', bg: '#FDF2F2', border: '#FBC4C4', path: '/retesting' }
  ];

  // Dynamic coverage
  const hasCategoryFinding = (catKeyword) => {
    return activeFindings.some(f => 
      (f.category && f.category.toLowerCase().includes(catKeyword)) ||
      (f.checkId && f.checkId.toLowerCase().includes(catKeyword))
    );
  };

  const coverageData = [
    { name: 'Auth & Session', score: hasCategoryFinding('auth') || hasCategoryFinding('session') ? 60 : 100 },
    { name: 'RBAC Access', score: hasCategoryFinding('authorization') || hasCategoryFinding('access') ? 50 : 100 },
    { name: 'Client Config', score: hasCategoryFinding('config') || hasCategoryFinding('credential') ? (latestScanResult?.observations?.length > 0 ? 30 : 100) : 100 },
    { name: 'Input Validation', score: hasCategoryFinding('input') ? 50 : 100 },
    { name: 'Network & API', score: hasCategoryFinding('net') || hasCategoryFinding('http') || hasCategoryFinding('api') ? 70 : 100 },
    { name: 'Storage Hygiene', score: hasCategoryFinding('store') || hasCategoryFinding('storage') ? 80 : 100 },
    { name: 'Dependencies', score: hasCategoryFinding('dep') ? 75 : 100 }
  ];

  const overallPostureLabel = activeFindings.length === 0 
    ? 'Compliant & Verified' 
    : highSeverityCount > 0 
      ? 'Elevated Risk' 
      : 'Moderate Risk';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Quick Actions */}
      <div className="panel-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-[#0A6E4F] tracking-wide uppercase">Security Operations</span>
            <span className="text-[#DEE5E0]">•</span>
            <span className="text-[#56655D]">Target: <strong className="text-[#16201B] font-mono">{activeTarget}</strong></span>
            <span className="text-[#DEE5E0]">•</span>
            <span className="text-[#56655D] hidden sm:inline">AST Parser Engine Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Security Posture & Assurance Overview
          </h1>
          <p className="text-xs text-[#56655D]">
            Evidence-backed validation state machine tracking live security conditions against authorized local runtime.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => navigate('/targets')}
            className="btn-secondary"
            title="Inspect target surface details"
          >
            <Server className="w-3.5 h-3.5 text-[#0A6E4F]" />
            <span>Target Profile</span>
          </button>

          <button
            onClick={async () => {
              const res = await triggerAssessment(activeTarget);
              if (res?.success && res?.assessmentId) {
                navigate(`/assessments/${res.assessmentId}`);
              }
            }}
            className="btn-primary"
            title="Run complete assessment workflow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Assessment</span>
          </button>
        </div>
      </div>

      {/* 2. Security Posture Summary Bar (Visual Storytelling) */}
      <div className="panel-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE5E0] pb-3">
          <div>
            <div className="text-[10px] font-bold text-[#85948C] tracking-wider uppercase">Executive Assessment</div>
            <h2 className="text-sm font-bold text-[#16201B] flex items-center gap-2">
              Overall Security Posture: 
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                activeFindings.length === 0 ? 'badge-emerald' : highSeverityCount > 0 ? 'badge-crimson' : 'badge-amber'
              }`}>
                {overallPostureLabel}
              </span>
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="text-[#56655D]">Active Findings: <strong className="text-[#16201B] font-mono">{activeFindings.length}</strong> of {totalFindings}</span>
            <span className="text-[#DEE5E0]">•</span>
            <span className="text-[#56655D]">Verified Resolutions: <strong className="text-[#0A6E4F] font-mono">{verifiedCount}</strong></span>
          </div>
        </div>

        {/* Severity Indicator Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C53030]"></span>
              <span className="text-xs font-medium text-[#56655D]">Critical</span>
            </div>
            <span className="text-base font-bold font-mono text-[#C53030]">0</span>
          </div>

          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
              <span className="text-xs font-medium text-[#56655D]">High Priority</span>
            </div>
            <span className="text-base font-bold font-mono text-[#EA580C]">{highSeverityCount}</span>
          </div>

          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
              <span className="text-xs font-medium text-[#56655D]">Medium</span>
            </div>
            <span className="text-base font-bold font-mono text-[#B45309]">{medSeverityCount}</span>
          </div>

          <div className="bg-[#F8F9F6] border border-[#DEE5E0] p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0A6E4F]"></span>
              <span className="text-xs font-medium text-[#56655D]">Low / Info</span>
            </div>
            <span className="text-base font-bold font-mono text-[#0A6E4F]">{lowSeverityCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Recent Assessments Section (Visual Hierarchy) */}
      <div className="panel-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DEE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[#0A6E4F]" />
              <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
                Recent Security Assessments
              </h2>
            </div>
            <p className="text-xs text-[#56655D]">Historical audit runs and runtime AST scans for World Monitor</p>
          </div>
          <button
            onClick={() => navigate('/assessments')}
            className="text-xs font-semibold text-[#0A6E4F] hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Assessments ({assessments?.length || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9F6] border-b border-[#DEE5E0] text-[10px] font-bold text-[#85948C] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Assessment ID</th>
                <th className="px-4 py-3">Target Application</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Risk Rating</th>
                <th className="px-4 py-3">Findings</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE5E0]">
              {(Array.isArray(assessments) ? assessments : []).slice(0, 4).map((a) => (
                <tr key={a.id} className="hover:bg-[#F8F9F6] transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#0A6E4F]">{a.id}</td>
                  <td className="px-4 py-3 font-semibold text-[#16201B]">{a.targetName}</td>
                  <td className="px-4 py-3">
                    <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                      {a.environment || 'Sandbox'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center space-x-1 text-[#0A6E4F] font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0A6E4F]" />
                      <span>{a.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-[#B45309]">
                    {a.riskIndex || 0} ({a.riskRating || 'Evaluated'})
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#16201B] font-bold">{a.totalFindingsCount || 0} Total</span>{' '}
                    <span className="text-[#0A6E4F] font-medium text-[11px]">({a.verifiedCount || 0} Verified)</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/assessments/${a.id}`)}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0A6E4F]" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!assessments || assessments.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-xs text-[#56655D]">
                    No historical assessments found. Click 'Start Assessment' above to initiate one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Closed-Loop Finding State Distribution (Mutually Exclusive Buckets) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#0A6E4F]" />
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
              Finding State Distribution
            </h2>
          </div>
          <span className="text-[11px] text-[#85948C]">Real-time state machine lifecycle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {lifecycleData.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(item.path)}
              className="panel-card-interactive p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider truncate">{item.name}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              </div>
              <p className="text-xl font-bold font-mono" style={{ color: item.color }}>{item.count}</p>
              <span className="text-[10px] text-[#85948C] block truncate">Click to view &rarr;</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Lifecycle Velocity (Cumulative Historical Metrics) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-[#0A6E4F]" />
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
              Audit Progress & Verification Velocity
            </h2>
          </div>
          <span className="text-[11px] text-[#85948C]">Historical Cumulative Audit Trail</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FFFFFF] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-[#85948C] uppercase block">Analyst Validations</span>
            <p className="text-xl font-bold text-[#16201B] font-mono">{historicalValidated}</p>
            <span className="text-[10px] text-[#56655D]">Confirmed by assessor</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-[#85948C] uppercase block">Fixes Submitted</span>
            <p className="text-xl font-bold text-[#0A6E4F] font-mono">{historicalRemediationsCompleted}</p>
            <span className="text-[10px] text-[#56655D]">Remediations staged</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-[#85948C] uppercase block">Retests Executed</span>
            <p className="text-xl font-bold text-[#064E3B] font-mono">{historicalRetestsExecuted}</p>
            <span className="text-[10px] text-[#56655D]">Deterministic verification</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DEE5E0] p-3.5 rounded-lg space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-[#85948C] uppercase block">Reopened Attempts</span>
            <p className="text-xl font-bold text-[#C53030] font-mono">{historicalFindingsReopened}</p>
            <span className="text-[10px] text-[#56655D]">Defects re-detected</span>
          </div>
        </div>
      </div>

      {/* 5. Charts Grid (Severity Donut & Coverage Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Severity Distribution */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
            <div>
              <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
                Active Findings by Severity
              </h3>
              <p className="text-[11px] text-[#56655D]">Current live findings distribution</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#16201B]">{activeFindings.length} Total</span>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DEE5E0', borderRadius: '6px', fontSize: '11px', color: '#16201B', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-[#16201B] border-t border-[#DEE5E0] pt-3">
            {severityData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs font-medium text-[#56655D]">{item.name}: <strong className="font-mono text-[#16201B]">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls Coverage */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
            <div>
              <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
                Security Controls Coverage (%)
              </h3>
              <p className="text-[11px] text-[#56655D]">Evaluation score per security domain</p>
            </div>
            <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
              7 Domains Evaluated
            </span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF0EC" vertical={false} />
                <XAxis dataKey="name" stroke="#85948C" fontSize={10} tickLine={false} />
                <YAxis stroke="#85948C" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DEE5E0', borderRadius: '6px', fontSize: '11px', color: '#16201B', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="score" fill="#0A6E4F" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-[#DEE5E0] pt-3 text-right">
            <button
              onClick={() => navigate('/security-checks')}
              className="text-xs font-semibold text-[#0A6E4F] hover:underline inline-flex items-center gap-1"
            >
              <span>Inspect Security Checks Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Active Findings Summary Table */}
      <div className="panel-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DEE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
              Priority Findings Requiring Action
            </h3>
            <p className="text-xs text-[#56655D]">Direct links to verification & remediation workspace</p>
          </div>
          <button
            onClick={() => navigate('/findings')}
            className="text-xs font-semibold text-[#0A6E4F] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All {findings.length} Findings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9F6] border-b border-[#DEE5E0] text-[10px] font-bold text-[#85948C] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Finding Title</th>
                <th className="px-4 py-3">Component / Scope</th>
                <th className="px-4 py-3">Lifecycle State</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE5E0]">
              {activeFindings.slice(0, 5).map((f) => (
                <tr key={f.id} className="hover:bg-[#F8F9F6] transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#0A6E4F]">{f.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.severity === 'HIGH' ? 'badge-orange' : f.severity === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#16201B] max-w-xs truncate">{f.title}</td>
                  <td className="px-4 py-3 text-[#56655D] font-mono text-[11px] truncate">{f.component}</td>
                  <td className="px-4 py-3">
                    <span className="badge-sage text-[10px] font-bold px-2 py-0.5 rounded">
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/findings/${f.id}`)}
                      className="text-[#0A6E4F] hover:text-[#064E3B] font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {activeFindings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#56655D]">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <ShieldCheck className="w-6 h-6 text-[#0A6E4F]" />
                      <p className="font-semibold text-[#16201B]">No Active Unresolved Findings</p>
                      <p className="text-[11px] text-[#85948C]">Target is currently verified clean or awaiting next assessment run.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
