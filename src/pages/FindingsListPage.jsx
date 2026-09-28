import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Filter, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Search, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FindingsListPage() {
  const navigate = useNavigate();
  const { findings, latestScanResult } = useApp();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.title.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C62828]" />
            Security Findings Management
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Evidence-backed security findings for active target <strong className="text-[#17211B]">World Monitor</strong>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            {findings.length} Total Findings
          </span>
        </div>
      </div>

      {/* REQUIREMENT 10: CURRENT AST SCAN RESULT DISPLAY CARD */}
      <div className="bg-white border border-[#087F5B] rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
          <span className="font-extrabold text-[#17211B] flex items-center gap-1.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#087F5B]" />
            CURRENT AST SCAN RESULT (Live Target Filesystem)
          </span>
          {latestScanResult ? (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
              latestScanResult.observations && latestScanResult.observations.length > 0 ? 'badge-crimson' : 'badge-emerald'
            }`}>
              STATUS: {latestScanResult.observations && latestScanResult.observations.length > 0 ? `VULNERABILITY OBSERVED (${latestScanResult.observations.length} MATCHES)` : 'NO MATCH (0 MATCHES)'}
            </span>
          ) : (
            <span className="badge-sage text-[10px] font-bold px-2.5 py-1 rounded">
              AWAITS INITIAL SCAN
            </span>
          )}
        </div>

        {latestScanResult ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[#64746A] block text-[11px]">Security Check ID:</span>
              <span className="text-[#087F5B] font-bold">{latestScanResult.check?.checkId || 'REAL-CHK-001'}</span>
            </div>
            <div>
              <span className="text-[#64746A] block text-[11px]">Matches Count:</span>
              <span className={latestScanResult.observations?.length > 0 ? 'text-[#C62828] font-bold' : 'text-[#087F5B] font-bold'}>
                {latestScanResult.observations?.length || 0} Matches
              </span>
            </div>
            <div>
              <span className="text-[#64746A] block text-[11px]">Scanned Files:</span>
              <span className="text-[#17211B] font-bold">{latestScanResult.check?.scannedFilesCount || 0} source files</span>
            </div>
            <div>
              <span className="text-[#64746A] block text-[11px]">Target Source Hash:</span>
              <span className="text-[#064E3B] font-bold">{latestScanResult.check?.sourceHash || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#64746A] italic">
            No live AST scan executed yet in this session. Go to 'Security Checks' and click 'RUN REAL CONTROLLED CHECK' to inspect target source.
          </p>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64746A] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, title, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md pl-9 pr-3 py-2 text-xs text-[#17211B] outline-none focus:border-[#087F5B]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#64746A]" />
            <span className="text-xs text-[#64746A] font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] text-xs font-semibold rounded-md px-2.5 py-1.5 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#64746A] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7F8F5] border border-[#DDE5DF] text-[#17211B] text-xs font-semibold rounded-md px-2.5 py-1.5 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="POTENTIAL">Potential</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REMEDIATION">Remediation</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg overflow-hidden shadow-2xs space-y-1">
        <div className="p-3 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider">
            HISTORICAL FINDINGS INVENTORY & AUDIT TRAIL
          </span>
          <span className="text-[10px] text-[#64746A]">Current Condition vs Lifecycle State</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#17211B]">
            <thead className="bg-[#F7F8F5] text-[#64746A] font-extrabold border-b border-[#DDE5DF] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Finding ID</th>
                <th className="p-3.5">Title & Component</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Current AST Condition</th>
                <th className="p-3.5">Lifecycle Stage</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]">
              {filteredFindings.map((item) => {
                const currentCondition = item.currentCondition || (item.status === 'VERIFIED' ? 'NO_MATCH' : 'OBSERVED');
                return (
                  <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#087F5B]">
                      {item.id}
                      {(item.isRealCheck || item.id.startsWith('F-REAL-')) && (
                        <span className="block text-[9px] font-bold text-[#087F5B] uppercase mt-0.5">
                          REAL CHECK
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 space-y-0.5">
                      <p className="font-extrabold text-[#17211B]">{item.title}</p>
                      <p className="text-[10px] text-[#64746A]">{item.component}</p>
                    </td>
                    <td className="p-3.5 text-[#64746A] font-semibold">{item.category}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                        item.severity === 'HIGH'
                          ? 'badge-crimson'
                          : item.severity === 'MEDIUM'
                          ? 'badge-amber'
                          : 'badge-emerald'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold font-mono ${
                        currentCondition === 'OBSERVED' ? 'badge-crimson' : 'badge-emerald'
                      }`}>
                        {currentCondition === 'OBSERVED' ? 'CURRENT: OBSERVED' : 'CURRENT: NO MATCH'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit ${
                        item.status === 'VERIFIED'
                          ? 'badge-emerald'
                          : item.status === 'CONFIRMED' || item.status === 'REOPENED'
                          ? 'badge-crimson'
                          : 'badge-amber'
                      }`}>
                        {item.status === 'VERIFIED' && <ShieldCheck className="w-3.5 h-3.5 text-[#087F5B]" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => navigate(`/findings/${item.id}`)}
                        className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-3 py-1.5 rounded-md font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#087F5B]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

