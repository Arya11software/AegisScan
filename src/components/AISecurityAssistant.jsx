import React, { useState } from 'react';
import { Bot, Sparkles, ChevronRight, ShieldCheck, Terminal, Loader2 } from 'lucide-react';

export default function AISecurityAssistant({ finding }) {
  const [activeQuery, setActiveQuery] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAction = (type) => {
    setActiveQuery(type);
    setLoading(true);
    setResponse(null);

    setTimeout(() => {
      setLoading(false);
      if (type === 'EXPLAIN_FINDING') {
        setResponse({
          title: 'Technical Context & Root Cause Analysis',
          content: `Finding ${finding.id} represents a ${finding.severity} severity ${finding.category} issue in component ${finding.component}.\n\nRoot Cause: ${finding.rootCause || 'Static AST rules identified client-side exposure.'}\n\nSecurity Context: Static AST inspection identified exposed properties within the client runtime bundle. Configuration values must be scoped to server-side process boundaries.`
        });
      } else if (type === 'BUSINESS_IMPACT') {
        setResponse({
          title: 'Operational & Business Risk Assessment',
          content: `Assessed Impact: Operational risk is rated ${finding.severity}.\n\nExposure could permit unauthenticated actors to observe internal API routing or bypass rate-limiting controls. Remediation is required before promotion beyond the authorized sandbox environment.`
        });
      } else if (type === 'REMEDIATION_SUMMARY') {
        setResponse({
          title: 'Deterministic Remediation Guidance',
          content: `1. Migrate secrets and sensitive flags from client-side config to process.env.\n2. Restrict Vite bundle injection to public identifiers only.\n3. Trigger automated retest to verify clean AST evaluation.`
        });
      }
    }, 450);
  };

  return (
    <div className="panel-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DEE5E0] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EBF5F0] border border-[#B6DEC9] flex items-center justify-center text-[#0A6E4F] shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#16201B] uppercase tracking-wider flex items-center gap-1.5">
              <span>AI Security Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-[#0A6E4F]" />
            </h3>
            <p className="text-[10px] text-[#56655D]">Contextual Analysis & Remediation</p>
          </div>
        </div>
        <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
          Copilot Active
        </span>
      </div>

      {/* Action Prompts */}
      <div className="space-y-2">
        <button
          onClick={() => handleAction('EXPLAIN_FINDING')}
          className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
            activeQuery === 'EXPLAIN_FINDING'
              ? 'bg-[#EBF5F0] border-[#0A6E4F] text-[#064E3B] shadow-2xs'
              : 'bg-[#F8F9F6] border-[#DEE5E0] text-[#16201B] hover:bg-white hover:border-[#CBD5CE]'
          }`}
        >
          <span>Explain Vulnerability Context</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#85948C]" />
        </button>

        <button
          onClick={() => handleAction('BUSINESS_IMPACT')}
          className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
            activeQuery === 'BUSINESS_IMPACT'
              ? 'bg-[#EBF5F0] border-[#0A6E4F] text-[#064E3B] shadow-2xs'
              : 'bg-[#F8F9F6] border-[#DEE5E0] text-[#16201B] hover:bg-white hover:border-[#CBD5CE]'
          }`}
        >
          <span>Evaluate Operational Risk</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#85948C]" />
        </button>

        <button
          onClick={() => handleAction('REMEDIATION_SUMMARY')}
          className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
            activeQuery === 'REMEDIATION_SUMMARY'
              ? 'bg-[#EBF5F0] border-[#0A6E4F] text-[#064E3B] shadow-2xs'
              : 'bg-[#F8F9F6] border-[#DEE5E0] text-[#16201B] hover:bg-white hover:border-[#CBD5CE]'
          }`}
        >
          <span>Generate Structured Fix Plan</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#85948C]" />
        </button>
      </div>

      {/* Response Display */}
      {loading && (
        <div className="p-4 bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg text-xs text-[#0A6E4F] flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#0A6E4F]" />
          <span>Generating contextual intelligence for {finding.id}...</span>
        </div>
      )}

      {response && !loading && (
        <div className="p-4 bg-[#EBF5F0] border border-[#B6DEC9] rounded-lg space-y-2 animate-fade-in">
          <h4 className="text-xs font-bold text-[#064E3B] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#0A6E4F]" />
            <span>{response.title}</span>
          </h4>
          <p className="text-xs text-[#16201B] whitespace-pre-line leading-relaxed font-normal">
            {response.content}
          </p>
        </div>
      )}

      {/* Governance Notice */}
      <div className="pt-2 border-t border-[#DEE5E0] flex items-center space-x-2 text-[10px] text-[#85948C]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0A6E4F] shrink-0" />
        <span>Advisory only: finding state changes require empirical evidence.</span>
      </div>
    </div>
  );
}
