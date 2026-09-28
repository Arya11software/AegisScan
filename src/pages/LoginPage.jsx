import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Key } from 'lucide-react';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('analyst@aegisscan.internal');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full bg-white border border-[#DDE5DF] rounded-lg p-8 shadow-2xs space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="xl" />
          </div>
          <p className="text-xs text-[#64746A] font-medium">
            Evidence-Driven Security Assessment & Validation Platform
          </p>
        </div>

        {/* Sandbox Indicator */}
        <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded-md p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[#087F5B]">
            <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
            <span className="font-extrabold text-[#17211B]">AUTHORIZED SANDBOX</span>
          </div>
          <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
            LOCAL TARGET READY
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#087F5B]" />
              Security Analyst Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F8F5] border border-[#DDE5DF] focus:border-[#087F5B] focus:bg-white rounded-md px-3.5 py-2 text-xs text-[#17211B] outline-none transition-colors font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211B] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#087F5B]" />
              Passkey / Access Token
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F7F8F5] border border-[#DDE5DF] focus:border-[#087F5B] focus:bg-white rounded-md px-3.5 py-2 text-xs text-[#17211B] outline-none transition-colors font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#087F5B] hover:bg-[#064E3B] text-white font-bold py-2.5 rounded-md text-xs transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>ENTER SECURITY CONSOLE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Closed-Loop Lifecycle Workflow Footer */}
        <div className="border-t border-[#DDE5DF] pt-4 space-y-2">
          <p className="text-[10px] font-bold text-[#64746A] uppercase tracking-wider text-center">
            CLOSED-LOOP SECURITY WORKFLOW
          </p>
          <div className="flex items-center justify-between text-[10px] font-bold text-[#64746A] px-1">
            <span>DETECT</span>
            <span>→</span>
            <span>VALIDATE</span>
            <span>→</span>
            <span>REMEDIATE</span>
            <span>→</span>
            <span>RETEST</span>
            <span>→</span>
            <span className="text-[#087F5B]">VERIFY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
