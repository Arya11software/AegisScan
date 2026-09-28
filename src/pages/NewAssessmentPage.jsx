import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckSquare, Square, Lock, Target, ArrowRight, Play, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NewAssessmentPage() {
  const navigate = useNavigate();
  const { triggerAssessment } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [targetName, setTargetName] = useState('World Monitor');
  const [environment] = useState('Authorized Local Sandbox');
  const [isAuthorized, setIsAuthorized] = useState(true);

  const availableScopes = [
    'Authentication',
    'Authorization',
    'Session Management',
    'API Security',
    'Input Validation',
    'Client Security',
    'Secure Communication',
    'Data Protection'
  ];

  const [selectedScopes, setSelectedScopes] = useState([...availableScopes]);

  const toggleScope = (scope) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleStartAssessment = async () => {
    if (!isAuthorized) return;
    await triggerAssessment(targetName, selectedScopes);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#17211B]">Create Authorized Assessment Scope</h1>
        <p className="text-xs text-[#64746A]">Configure target parameters, scope boundaries, and authorization verification for World Monitor.</p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between bg-white border border-[#DDE5DF] rounded-lg p-4 shadow-2xs">
        {[
          { step: 1, label: 'Target' },
          { step: 2, label: 'Authorization' },
          { step: 3, label: 'Scope' },
          { step: 4, label: 'Review' }
        ].map((s, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === s.step
                  ? 'bg-[#087F5B] text-white shadow-2xs'
                  : currentStep > s.step
                  ? 'bg-[#E6F4F1] text-[#087F5B] border border-[#B2DFDB]'
                  : 'bg-[#F7F8F5] text-[#64746A] border border-[#DDE5DF]'
              }`}
            >
              {currentStep > s.step ? <Check className="w-4 h-4 text-[#087F5B]" /> : s.step}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${currentStep === s.step ? 'text-[#17211B]' : 'text-[#64746A]'}`}>
              {s.label}
            </span>
            {idx < 3 && <div className="w-6 h-px bg-[#DDE5DF] hidden sm:block"></div>}
          </div>
        ))}
      </div>

      {/* Wizard Content */}
      <div className="bg-white border border-[#DDE5DF] rounded-lg p-6 space-y-6 shadow-2xs">
        {/* STEP 1: TARGET */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-[#087F5B]" />
              Step 1: Target Definition
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17211B]">Target Application Name</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#17211B] outline-none focus:border-[#087F5B] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17211B]">Target Environment</label>
                <input
                  type="text"
                  value={environment}
                  disabled
                  className="w-full bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-2.5 text-xs text-[#64746A] cursor-not-allowed font-mono font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Authorization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AUTHORIZATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#DDE5DF] pb-3">
              <div className="w-9 h-9 rounded-md bg-[#E6F4F1] border border-[#B2DFDB] flex items-center justify-center text-[#087F5B]">
                <Lock className="w-5 h-5 text-[#087F5B]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
                  Step 2: Authorization Required
                </h2>
                <p className="text-xs text-[#64746A]">Explicit target consent and non-destructive evaluation bounds.</p>
              </div>
            </div>

            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-lg p-5 space-y-4">
              <div
                onClick={() => setIsAuthorized(!isAuthorized)}
                className="flex items-start space-x-3 cursor-pointer select-none"
              >
                <div className="mt-0.5 text-[#087F5B]">
                  {isAuthorized ? <CheckSquare className="w-5 h-5 text-[#087F5B]" /> : <Square className="w-5 h-5 text-[#64746A]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17211B]">
                    I confirm that target {targetName} is authorized for security assessment.
                  </p>
                  <p className="text-[11px] text-[#64746A] mt-1 leading-relaxed">
                    By checking this box, you confirm explicit permission to run non-destructive security checks against target repository <strong className="text-[#17211B]">{targetName}</strong> inside the designated local sandbox boundary.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#DDE5DF] pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
                  <span>Scope Enforcement</span>
                </div>
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
                  <span>Non-Destructive Checks</span>
                </div>
                <div className="flex items-center space-x-2 text-[#087F5B] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
                  <span>Evidence Captures Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!isAuthorized}
                className={`px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm ${
                  isAuthorized
                    ? 'bg-[#087F5B] hover:bg-[#064E3B] text-white'
                    : 'bg-[#DDE5DF] text-[#64746A] cursor-not-allowed'
                }`}
              >
                <span>Continue to Scope</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SCOPE */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
              Step 3: Define Assessment Scope
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableScopes.map((scope, idx) => {
                const isSelected = selectedScopes.includes(scope);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleScope(scope)}
                    className={`p-3.5 rounded-md border text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#E6F4F1] border-[#087F5B] text-[#064E3B]'
                        : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#64746A] hover:bg-white'
                    }`}
                  >
                    <span>{scope}</span>
                    {isSelected ? <CheckSquare className="w-4 h-4 text-[#087F5B]" /> : <Square className="w-4 h-4 text-[#64746A]" />}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                disabled={selectedScopes.length === 0}
                className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Review Scope</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h2 className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
              Step 4: Review & Run Assessment
            </h2>

            <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#DDE5DF]">
                <span className="text-[#64746A]">Target Application:</span>
                <span className="font-extrabold text-[#17211B]">{targetName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DDE5DF]">
                <span className="text-[#64746A]">Environment:</span>
                <span className="font-mono text-[#087F5B] font-bold">{environment}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DDE5DF]">
                <span className="text-[#64746A]">Authorization:</span>
                <span className="font-bold text-[#087F5B]">Confirmed</span>
              </div>
              <div className="py-1">
                <span className="text-[#64746A] block mb-2 font-bold">Selected Scope Categories ({selectedScopes.length}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScopes.map((sc, i) => (
                    <span key={i} className="bg-white border border-[#DDE5DF] px-2.5 py-1 rounded-md text-[11px] font-bold text-[#087F5B]">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-[#F7F8F5] hover:bg-[#DDE5DF]/50 border border-[#DDE5DF] text-[#17211B] px-4 py-2 rounded-md text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleStartAssessment}
                disabled={!isAuthorized}
                className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-6 py-2.5 rounded-md text-xs font-extrabold flex items-center space-x-2 cursor-pointer shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START ASSESSMENT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
