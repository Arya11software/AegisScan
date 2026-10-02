import React, { useState } from 'react';
import { 
  Crosshair, 
  Globe, 
  Server, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Database,
  ChevronRight,
  AlertTriangle,
  FileCode2,
  Lock,
  Code2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AttackSurfacePage() {
  const { targetProfile } = useApp();
  const [selectedNode, setSelectedNode] = useState('API');

  const nodes = [
    {
      id: 'FRONTEND',
      label: 'Frontend Web Surface',
      icon: Globe,
      component: 'React 19 + MapLibre Web UI',
      subtext: 'Client bundle execution and DOM interaction boundary',
      controls: [
        { name: 'Client Session Isolation', status: 'PASS' },
        { name: 'DOM Input Sanitization', status: 'PASS' },
        { name: 'Content Security Policy (CSP)', status: 'REVIEW' },
        { name: 'Clickjacking & X-Frame-Options', status: 'PASS' }
      ],
      evidenceCount: 4,
      findingsCount: 0
    },
    {
      id: 'API',
      label: 'HTTP API Surface',
      icon: Server,
      component: 'World Monitor Client Endpoints',
      subtext: 'RESTful HTTP API and telemetry ingest endpoints',
      controls: [
        { name: 'API Authentication Header', status: 'PASS' },
        { name: 'Authorization & Scope Check', status: 'REVIEW' },
        { name: 'CORS Wildcard Configuration', status: 'PASS' },
        { name: 'Parameter Type & Payload Sanitization', status: 'PASS' },
        { name: 'DTO Serialization Data Exposure', status: 'REVIEW' }
      ],
      evidenceCount: 7,
      findingsCount: 2
    },
    {
      id: 'SERVER',
      label: 'Server Runtime',
      icon: Cpu,
      component: 'Node.js Sandbox Backend',
      subtext: 'Authorized local runtime container and host filesystem',
      controls: [
        { name: 'Process Boundary Isolation', status: 'PASS' },
        { name: 'Environment Secrets Isolation', status: 'PASS' },
        { name: 'TLS & Cipher Suite Standards', status: 'PASS' }
      ],
      evidenceCount: 3,
      findingsCount: 0
    },
    {
      id: 'WORKERS',
      label: 'Background Workers',
      icon: Layers,
      component: 'GeoSpatial Map Tile Workers',
      subtext: 'Async vector tile processing and queue consumer',
      controls: [
        { name: 'Queue Authentication', status: 'PASS' },
        { name: 'Async Payload Size Limits', status: 'PASS' }
      ],
      evidenceCount: 2,
      findingsCount: 0
    },
    {
      id: 'INTEGRATIONS',
      label: 'External Data Feeds',
      icon: Database,
      component: 'OSM Tile Server & Weather API',
      subtext: 'Outbound HTTP integration and third-party data feeds',
      controls: [
        { name: 'Origin Restriction Policy', status: 'REVIEW' },
        { name: 'External API Key Protection', status: 'PASS' }
      ],
      evidenceCount: 5,
      findingsCount: 1
    },
    {
      id: 'DEPENDENCIES',
      label: 'Dependencies & Lockfiles',
      icon: FileCode2,
      component: 'npm Package Lockfile',
      subtext: 'Third-party dependencies and supply-chain integrity',
      controls: [
        { name: 'Known CVE Vulnerability Audit', status: 'PASS' },
        { name: 'License Compliance & Integrity', status: 'PASS' }
      ],
      evidenceCount: 6,
      findingsCount: 0
    }
  ];

  const activeNodeData = nodes.find(n => n.id === selectedNode) || nodes[1];

  const techStack = targetProfile?.techStack || ['TypeScript', 'React', 'Vite', 'MapLibre', 'Three.js', 'deck.gl'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="badge-emerald text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#0A6E4F]" /> PASS
          </span>
        );
      case 'REVIEW':
        return (
          <span className="badge-amber text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#B45309]" /> REVIEW
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge-crimson text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#C53030]" /> FAILED
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE5E0] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0A6E4F] uppercase tracking-wider mb-1">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Target Discovery & Surface Mapping</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16201B] tracking-tight">
            Attack Surface Map & Component Inspector
          </h1>
          <p className="text-xs text-[#56655D] mt-0.5">
            Architectural decomposition and boundary controls mapped for target <strong className="text-[#16201B]">World Monitor</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="badge-emerald text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0A6E4F] animate-pulse"></span>
            <span>Discovery Completed</span>
          </span>
        </div>
      </div>

      {/* Compact Discovery Metrics Cards (Section 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="panel-card p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Surface Layers</span>
          <p className="text-xl font-bold font-mono text-[#16201B]">6 Layers</p>
          <span className="text-[10px] text-[#56655D]">Client & Server tiers</span>
        </div>

        <div className="panel-card p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">API Endpoints</span>
          <p className="text-xl font-bold font-mono text-[#0A6E4F]">14 Endpoints</p>
          <span className="text-[10px] text-[#56655D]">Telemetry & controls</span>
        </div>

        <div className="panel-card p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Parameters Evaluated</span>
          <p className="text-xl font-bold font-mono text-[#16201B]">48 Fields</p>
          <span className="text-[10px] text-[#56655D]">Input validation bounds</span>
        </div>

        <div className="panel-card p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Security Headers</span>
          <p className="text-xl font-bold font-mono text-[#0A6E4F]">8 Enforced</p>
          <span className="text-[10px] text-[#56655D]">CSP, CORS, HSTS</span>
        </div>

        <div className="panel-card p-3.5 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider block">Technologies Mapped</span>
          <p className="text-xl font-bold font-mono text-[#16201B]">{techStack.length} Packages</p>
          <span className="text-[10px] text-[#56655D]">React, Vite, MapLibre</span>
        </div>
      </div>

      {/* Discovered Tech Stack Pill Row */}
      <div className="panel-card p-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#16201B]">
          <Code2 className="w-3.5 h-3.5 text-[#0A6E4F]" />
          <span>Discovered Technology Stack</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, idx) => (
            <span key={idx} className="bg-[#F8F9F6] border border-[#DEE5E0] text-[#16201B] px-2.5 py-1 rounded-md text-xs font-semibold">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Application Map (Section 8) */}
      <div className="panel-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A6E4F]"></span>
            <h2 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
              Application Architecture Map
            </h2>
          </div>
          <span className="text-[11px] text-[#85948C]">Click any layer below to inspect security controls</span>
        </div>

        {/* Tree Root */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-[#FFFFFF] border-2 border-[#0A6E4F] text-[#16201B] px-6 py-2.5 rounded-lg shadow-sm text-center">
            <p className="text-[10px] font-bold text-[#0A6E4F] uppercase tracking-wider">Target Root</p>
            <p className="text-sm font-bold font-mono text-[#16201B]">World Monitor (wm-sandbox)</p>
          </div>

          <div className="w-0.5 h-6 bg-[#DEE5E0]"></div>

          {/* Level 1 Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
            {nodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-3.5 rounded-lg border text-center space-y-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EBF5F0] border-[#0A6E4F] ring-2 ring-[#0A6E4F]/20 shadow-xs'
                      : 'bg-[#F8F9F6] border-[#DEE5E0] hover:bg-white hover:border-[#CBD5CE]'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center ${isSelected ? 'bg-[#0A6E4F] text-white' : 'bg-white text-[#0A6E4F] border border-[#DEE5E0]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#16201B] tracking-tight">{node.id}</h3>
                    <p className="text-[10px] text-[#56655D] truncate">{node.component}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5 pt-1 text-[10px] border-t border-[#DEE5E0]/60">
                    <span className="font-semibold text-[#0A6E4F]">{node.evidenceCount} Evid.</span>
                    <span className="text-[#DEE5E0]">•</span>
                    <span className={`font-semibold ${node.findingsCount > 0 ? 'text-[#C53030]' : 'text-[#85948C]'}`}>
                      {node.findingsCount} Find.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Component Security Inspector */}
      <div className="panel-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEE5E0] pb-4 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#0A6E4F] uppercase tracking-wider">Surface Component Inspector</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#85948C]" />
              <span className="text-xs font-bold text-[#16201B] font-mono">{activeNodeData.id} LAYER</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#16201B] mt-0.5">{activeNodeData.component}</h2>
            <p className="text-xs text-[#56655D]">{activeNodeData.subtext}</p>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="bg-[#F8F9F6] border border-[#DEE5E0] px-3 py-1.5 rounded-md text-xs">
              <span className="text-[#56655D]">Evidence Captured: </span>
              <strong className="text-[#0A6E4F] font-bold">{activeNodeData.evidenceCount} Records</strong>
            </div>

            <div className="bg-[#F8F9F6] border border-[#DEE5E0] px-3 py-1.5 rounded-md text-xs">
              <span className="text-[#56655D]">Active Findings: </span>
              <strong className={activeNodeData.findingsCount > 0 ? 'text-[#C53030] font-bold' : 'text-[#0A6E4F] font-bold'}>
                {activeNodeData.findingsCount} Issues
              </strong>
            </div>
          </div>
        </div>

        {/* Security Controls Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider">
              Evaluated Security Controls & Assurance Bounds
            </h3>
            <span className="text-[11px] text-[#85948C]">AST Rule + AI Context Verification</span>
          </div>

          <div className="border border-[#DEE5E0] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9F6] border-b border-[#DEE5E0] text-[#85948C] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Security Control</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Assurance Confidence</th>
                  <th className="py-2.5 px-4">Verification Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE5E0]">
                {activeNodeData.controls.map((control, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F9F6] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#16201B]">{control.name}</td>
                    <td className="py-3 px-4">{getStatusBadge(control.status)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0A6E4F]">High (92%)</td>
                    <td className="py-3 px-4 text-[#56655D]">Deterministic AST Rule + AI Analysis</td>
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
