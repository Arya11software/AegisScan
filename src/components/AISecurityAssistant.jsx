import React, { useState } from 'react';
import { Bot, Sparkles, ChevronRight, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';

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
          title: 'Technical Context Analysis',
          content: `Finding ${finding.id} represents a ${finding.severity} severity ${finding.category} issue in component ${finding.component}.\n\nRoot Cause: ${finding.rootCause}.\n\nAI Context: Static rule inspection identified exported configuration variables in client-side runtime context. Server endpoints should enforce environment variable boundaries.`
        });
      } else if (type === 'BUSINESS_IMPACT') {
        setResponse({
          title: 'Business Impact Assessment',
          content: `Operational risk rating is evaluated as ${finding.severity}.\n\nUnmitigated exposure could allow unauthorized access to internal service parameters. Response SLA is prioritized for resolution within current release cycle.`
        });
      } else if (type === 'REMEDIATION_SUMMARY') {
        setResponse({
          title: 'Structured Remediation Plan',
          content: `1. Move secret keys to server-side process environment.\n2. Expose only required public flags via build-time injection.\n3. Validate fix via retest engine run.`
        });
      }
    }, 500);
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-lg p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-[#E6F4F1] border border-[#B2DFDB] flex items-center justify-center text-[#087F5B]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[#17211B] uppercase tracking-wider flex items-center gap-1.5">
              AI SECURITY ANALYZER
              <Sparkles className="w-3.5 h-3.5 text-[#087F5B]" />
            </h3>
            <p className="text-[10px] text-[#64746A]">Contextual Finding Intelligence</p>
          </div>
        </div>
        <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
          Structured Analysis
        </span>
      </div>

      {/* Quick Prompt Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleAction('EXPLAIN_FINDING')}
          className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer ${
            activeQuery === 'EXPLAIN_FINDING'
              ? 'bg-[#E6F4F1] border-[#087F5B] text-[#064E3B]'
              : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#17211B] hover:bg-white'
          }`}
        >
          <span>Explain Finding & Context</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#64746A]" />
        </button>

        <button
          onClick={() => handleAction('BUSINESS_IMPACT')}
          className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer ${
            activeQuery === 'BUSINESS_IMPACT'
              ? 'bg-[#E6F4F1] border-[#087F5B] text-[#064E3B]'
              : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#17211B] hover:bg-white'
          }`}
        >
          <span>Evaluate Business Impact</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#64746A]" />
        </button>

        <button
          onClick={() => handleAction('REMEDIATION_SUMMARY')}
          className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer ${
            activeQuery === 'REMEDIATION_SUMMARY'
              ? 'bg-[#E6F4F1] border-[#087F5B] text-[#064E3B]'
              : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#17211B] hover:bg-white'
          }`}
        >
          <span>Generate Remediation Plan</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#64746A]" />
        </button>
      </div>

      {/* Response Box */}
      {loading && (
        <div className="p-4 bg-[#F7F8F5] border border-[#DDE5DF] rounded-md text-xs text-[#087F5B] flex items-center space-x-2 animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin text-[#087F5B]" />
          <span>Generating AI contextual analysis for {finding.id}...</span>
        </div>
      )}

      {response && !loading && (
        <div className="p-4 bg-[#E6F4F1] border border-[#B2DFDB] rounded-md space-y-2">
          <h4 className="text-xs font-bold text-[#064E3B] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#087F5B]" />
            {response.title}
          </h4>
          <p className="text-xs text-[#17211B] whitespace-pre-line leading-relaxed font-medium">
            {response.content}
          </p>
        </div>
      )}

      {/* System positioning notice */}
      <div className="pt-2 border-t border-[#DDE5DF] flex items-center space-x-2 text-[10px] text-[#64746A]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#087F5B] shrink-0" />
        <span>AI serves strictly as contextual analyzer; finding status requires empirical evidence.</span>
      </div>
    </div>
  );
}
