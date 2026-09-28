import React, { useState } from 'react';
import { 
  Crosshair, 
  Globe, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  Layers, 
  Cpu, 
  Database,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileCode2,
  Lock
} from 'lucide-react';
import { storageService } from '../services/storageService';

export default function AttackSurfacePage() {
  const attackSurface = storageService.getAttackSurface();
  const [selectedNode, setSelectedNode] = useState('API');

  const nodes = [
    {
      id: 'FRONTEND',
      label: 'FRONTEND SURFACE',
      icon: Globe,
      component: 'React + MapLibre Web UI',
      subtext: 'Client bundle execution boundary',
      controls: [
        { name: 'Authentication', status: 'PASS' },
        { name: 'Authorization', status: 'PASS' },
        { name: 'Client Input Sanitization', status: 'PASS' },
        { name: 'Content Security Policy', status: 'REVIEW' }
      ],
      evidenceCount: 4,
      findingsCount: 0
    },
    {
      id: 'API',
      label: 'API SURFACE',
      icon: Server,
      component: 'World Monitor Client Endpoints',
      subtext: 'HTTP API telemetry endpoints',
      controls: [
        { name: 'Authentication', status: 'PASS' },
        { name: 'Authorization', status: 'REVIEW' },
        { name: 'Input Validation', status: 'PASS' },
        { name: 'Error Handling', status: 'PASS' },
        { name: 'Data Exposure', status: 'REVIEW' }
      ],
      evidenceCount: 7,
      findingsCount: 2
    },
    {
      id: 'SERVER',
      label: 'SERVER SURFACE',
      icon: Cpu,
      component: 'Node.js Sandbox Backend',
      subtext: 'Authorized local runtime container',
      controls: [
        { name: 'Process Isolation', status: 'PASS' },
        { name: 'Environment Secrets', status: 'PASS' },
        { name: 'TLS Termination', status: 'PASS' }
      ],
      evidenceCount: 3,
      findingsCount: 0
    },
    {
      id: 'WORKERS',
      label: 'WORKERS SURFACE',
      icon: Layers,
      component: 'GeoSpatial Map Queue Workers',
      subtext: 'Async vector tile processing',
      controls: [
        { name: 'Queue Auth', status: 'PASS' },
        { name: 'Payload Limits', status: 'PASS' }
      ],
      evidenceCount: 2,
      findingsCount: 0
    },
    {
      id: 'INTEGRATIONS',
      label: 'INTEGRATIONS SURFACE',
      icon: Database,
      component: 'External Map Tiles & Data Feed',
      subtext: 'OSM Tile Server & Weather API',
      controls: [
        { name: 'Origin Restrict', status: 'REVIEW' },
        { name: 'API Key Exposure', status: 'PASS' }
      ],
      evidenceCount: 5,
      findingsCount: 1
    },
    {
      id: 'DEPENDENCIES',
      label: 'DEPENDENCIES SURFACE',
      icon: FileCode2,
      component: 'npm Package Lockfile',
      subtext: '3rd party libraries & lockfile integrity',
      controls: [
        { name: 'CVE Vulnerability Audit', status: 'PASS' },
        { name: 'License Compliance', status: 'PASS' }
      ],
      evidenceCount: 6,
      findingsCount: 0
    }
  ];

  const activeNodeData = nodes.find(n => n.id === selectedNode) || nodes[1];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="badge-emerald text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#087F5B]" /> PASS
          </span>
        );
      case 'REVIEW':
        return (
          <span className="badge-amber text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#B7791F]" /> REVIEW
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge-crimson text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#C62828]" /> FAILED
          </span>
        );
      default:
        return (
          <span className="badge-sage text-[11px] font-bold px-2 py-0.5 rounded-md">
            NOT ASSESSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17211B] flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-[#087F5B]" />
            Attack Surface Map & Component Inspector
          </h1>
          <p className="text-xs text-[#64746A] mt-0.5">
            Interactive architectural decomposition for target <strong className="text-[#17211B]">World Monitor</strong>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md">
            6 Surface Layers Mapped
          </span>
        </div>
      </div>

      {/* Visual Architectural Map Diagram */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B]"></span>
            <h2 className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider">
              TARGET ARCHITECTURE GRAPH — WORLD MONITOR
            </h2>
          </div>
          <span className="text-[11px] text-[#64746A]">Click any node to inspect security controls</span>
        </div>

        {/* Target Root Node */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-[#064E3B] text-white px-6 py-2.5 rounded-md border border-[#087F5B] shadow-sm text-center">
            <p className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest">AUTHORIZED TARGET</p>
            <p className="text-sm font-extrabold font-mono">WORLD MONITOR</p>
          </div>

          <div className="w-0.5 h-6 bg-[#DDE5DF]"></div>

          {/* Level 1 Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
            {nodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-3.5 rounded-md border text-center space-y-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E6F4F1] border-[#087F5B] ring-2 ring-[#087F5B]/20 shadow-sm'
                      : 'bg-[#F7F8F5] border-[#DDE5DF] hover:bg-white hover:border-[#087F5B]/40'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center ${isSelected ? 'bg-[#087F5B] text-white' : 'bg-white text-[#087F5B] border border-[#DDE5DF]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-extrabold text-[#17211B] tracking-tight">{node.id}</h3>
                    <p className="text-[9px] text-[#64746A] truncate">{node.component}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5 pt-1 text-[10px]">
                    <span className="font-bold text-[#087F5B]">{node.evidenceCount} Evid.</span>
                    <span className="text-[#64746A]">•</span>
                    <span className={`font-bold ${node.findingsCount > 0 ? 'text-[#C62828]' : 'text-[#64746A]'}`}>
                      {node.findingsCount} Find.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Security Inspector */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DDE5DF] pb-4 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-wider">COMPONENT SECURITY INSPECTOR</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#64746A]" />
              <span className="text-xs font-extrabold text-[#17211B] font-mono">{activeNodeData.id} SURFACE</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#17211B] mt-0.5">{activeNodeData.component}</h2>
            <p className="text-xs text-[#64746A]">{activeNodeData.subtext}</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#F7F8F5] border border-[#DDE5DF] px-3 py-1.5 rounded-md text-xs">
              <span className="text-[#64746A]">Evidence Collected: </span>
              <strong className="text-[#087F5B] font-bold">{activeNodeData.evidenceCount} Logs</strong>
            </div>

            <div className="bg-[#F7F8F5] border border-[#DDE5DF] px-3 py-1.5 rounded-md text-xs">
              <span className="text-[#64746A]">Active Findings: </span>
              <strong className="text-[#C62828] font-bold">{activeNodeData.findingsCount} Issues</strong>
            </div>
          </div>
        </div>

        {/* Security Controls Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider">
            SECURITY CONTROLS EVALUATION
          </h3>

          <div className="border border-[#DDE5DF] rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] border-b border-[#DDE5DF] text-[#64746A] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Security Control</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Confidence</th>
                  <th className="py-2.5 px-4">Validation Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {activeNodeData.controls.map((control, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#17211B]">{control.name}</td>
                    <td className="py-3 px-4">{getStatusBadge(control.status)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#064E3B]">High (92%)</td>
                    <td className="py-3 px-4 text-[#64746A]">Deterministic AST Rule + AI Verification</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
