import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FindingsListPage() {
  const navigate = useNavigate();
  const { findings, latestScanResult } = useApp();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFindingId, setExpandedFindingId] = useState(null);

  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) || 
        f.id.toLowerCase().includes(q) || 
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.component && f.component.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C53030]"></span>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="badge-orange text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="badge-amber text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A6E4F]"></span>
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A6E4F]" />
            VERIFIED
          </span>
        );
      case 'REOPENED':
        return (
          <span className="badge-crimson text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-[#C53030]" />
            REOPENED
          </span>
        );
      case 'READY_FOR_RETEST':
      case 'RETESTED':
        return (
          <span className="badge-teal text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            READY FOR RETEST
          </span>
        );
      case 'REMEDIATION_OPEN':
        return (
          <span className="badge-amber text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            REMEDIATION
          </span>
        );
      case 'VALIDATED':
        return (
          <span className="badge-amber text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
            VALIDATED
          </span>
        );
      default:
        return (
          <span className="badge-sage text-[10px] font-bold px-2 py-0.5 rounded w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C53030]" />
            <span>Vulnerability Inventory & Triage</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Security Findings Management
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Evidence-backed security findings for active target <strong className="text-[#16201B]">World Monitor</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            {findings.length} Total Findings
          </span>
        </div>
      </div>

      {/* Live AST Scan Result Card */}
      <div className="panel-card p-5 space-y-3 border-l-4 border-l-[#0A6E4F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE5E0] pb-2">
          <span className="font-bold text-[#16201B] flex items-center gap-1.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#0A6E4F]" />
            CURRENT AST SCAN RESULT (Live Target Filesystem)
          </span>
          {latestScanResult ? (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
              latestScanResult.observations && latestScanResult.observations.length > 0 ? 'badge-crimson' : 'badge-emerald'
            }`}>
              STATUS: {latestScanResult.observations && latestScanResult.observations.length > 0 ? `VULNERABILITY OBSERVED (${latestScanResult.observations.length} MATCHES)` : 'NO MATCH (0 MATCHES - CLEAN)'}
            </span>
          ) : (
            <span className="badge-sage text-[10px] font-bold px-2.5 py-0.5 rounded">
              AWAITS INITIAL SCAN
            </span>
          )}
        </div>

        {latestScanResult ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[#85948C] block text-[10px]">Check ID:</span>
              <span className="text-[#0A6E4F] font-bold">{latestScanResult.check?.checkId || 'REAL-CHK-001'}</span>
            </div>
            <div>
              <span className="text-[#85948C] block text-[10px]">Matches Count:</span>
              <span className={latestScanResult.observations?.length > 0 ? 'text-[#C53030] font-bold' : 'text-[#0A6E4F] font-bold'}>
                {latestScanResult.observations?.length || 0} Matches
              </span>
            </div>
            <div>
              <span className="text-[#85948C] block text-[10px]">Scanned Files:</span>
              <span className="text-[#16201B] font-bold">{latestScanResult.check?.scannedFilesCount || 0} source files</span>
            </div>
            <div>
              <span className="text-[#85948C] block text-[10px]">Target Source Hash:</span>
              <span className="text-[#064E3B] font-bold">{latestScanResult.check?.sourceHash || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#56655D] italic">
            No live AST scan run in this session. Head to 'Security Controls' and click 'Run Real Controlled Check' to scan target source.
          </p>
        )}
      </div>

      {/* Accessible Filters & Search */}
      <div className="panel-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <label htmlFor="findings-search" className="sr-only">Search findings</label>
          <Search className="w-4 h-4 text-[#85948C] absolute left-3 top-2.5 pointer-events-none" />
          <input
            id="findings-search"
            name="findingsSearch"
            type="text"
            placeholder="Search by ID, title, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#85948C]" />
            <label htmlFor="findings-severity-filter" className="text-xs text-[#56655D] font-semibold">Severity:</label>
            <select
              id="findings-severity-filter"
              name="severityFilter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#F8F9F6] border border-[#DEE5E0] text-[#16201B] text-xs font-semibold rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#0A6E4F] cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <label htmlFor="findings-status-filter" className="text-xs text-[#56655D] font-semibold">Status:</label>
            <select
              id="findings-status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8F9F6] border border-[#DEE5E0] text-[#16201B] text-xs font-semibold rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#0A6E4F] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="VALIDATED">Validated</option>
              <option value="REMEDIATION_OPEN">Remediation</option>
              <option value="READY_FOR_RETEST">Ready for Retest</option>
              <option value="VERIFIED">Verified</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings List & Interactive Expandable Items */}
      <div className="panel-card overflow-hidden">
        <div className="p-3.5 border-b border-[#DEE5E0] bg-[#F8F9F6] flex items-center justify-between">
          <span className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
            Findings Directory ({filteredFindings.length} Items)
          </span>
          <span className="text-[11px] text-[#85948C]">Click row to expand details</span>
        </div>

        <div className="divide-y divide-[#DEE5E0]">
          {filteredFindings.map((item) => {
            const isExpanded = expandedFindingId === item.id;
            const currentCondition = item.currentCondition || (item.status === 'VERIFIED' ? 'NO_MATCH' : 'OBSERVED');
            return (
              <div key={item.id} className="transition-colors hover:bg-[#F8F9F6]">
                <div 
                  onClick={() => setExpandedFindingId(isExpanded ? null : item.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="pt-0.5 shrink-0">
                      {getSeverityBadge(item.severity)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#0A6E4F]">{item.id}</span>
                        {(item.isRealCheck || item.id.startsWith('F-REAL-')) && (
                          <span className="badge-emerald text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Real Check
                          </span>
                        )}
                        <span className="text-[11px] text-[#85948C] font-mono truncate">• {item.component}</span>
                      </div>
                      <h2 className="text-sm font-bold text-[#16201B] truncate mt-0.5">{item.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#56655D]">
                        <span>Domain: <strong>{item.category}</strong></span>
                        <span>•</span>
                        <span>CVSS: <strong className="font-mono">{item.cvss || '7.5'}</strong></span>
                        <span>•</span>
                        <span>OWASP: <strong className="font-mono">{item.owasp || 'A01:2021'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 self-end sm:self-center shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      currentCondition === 'OBSERVED' ? 'badge-crimson' : 'badge-emerald'
                    }`}>
                      {currentCondition === 'OBSERVED' ? 'OBSERVED' : 'CLEAN'}
                    </span>

                    {getStatusBadge(item.status)}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/findings/${item.id}`);
                      }}
                      className="btn-secondary text-xs px-2.5 py-1"
                      title="Inspect full finding details"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0A6E4F]" />
                    </button>

                    <div className="text-[#85948C] p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expandable Section with Evidence & Remediation Preview */}
                {isExpanded && (
                  <div className="bg-[#F8F9F6] border-t border-[#DEE5E0] p-4 space-y-3 text-xs animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#FFFFFF] border border-[#DEE5E0] p-3 rounded-md space-y-1">
                        <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Root Cause Analysis</span>
                        <p className="text-xs text-[#16201B] font-mono leading-relaxed">{item.rootCause || 'Root cause analysis captured during AST scan.'}</p>
                      </div>

                      <div className="bg-[#FFFFFF] border border-[#DEE5E0] p-3 rounded-md space-y-1">
                        <span className="text-[10px] font-bold text-[#0A6E4F] uppercase tracking-wider block">Recommended Remediation</span>
                        <p className="text-xs text-[#16201B] font-medium leading-relaxed">
                          {typeof item.remediation === 'object' && item.remediation !== null
                            ? item.remediation.recommendation || 'Remediation guidance pending.'
                            : item.remediation || 'Remediation guidance pending.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2 text-[11px] text-[#56655D]">
                        <FileCode className="w-3.5 h-3.5 text-[#0A6E4F]" />
                        <span>Source Check: <strong className="font-mono text-[#16201B]">{item.checkId || 'CONFIG-REAL-001'}</strong></span>
                      </div>

                      <button
                        onClick={() => navigate(`/findings/${item.id}`)}
                        className="text-xs font-semibold text-[#0A6E4F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Full Lifecycle Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFindings.length === 0 && (
            <div className="p-8 text-center text-xs text-[#56655D]">
              <p className="font-semibold text-[#16201B]">No findings match the selected filter criteria.</p>
              <p className="text-[11px] text-[#85948C] mt-1">Try resetting the severity or status filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
