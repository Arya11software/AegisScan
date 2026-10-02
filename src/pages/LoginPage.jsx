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
    <div className="min-h-screen bg-[#F8F9F6] flex flex-col justify-center items-center p-4 sm:p-6 relative select-none">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DEE5E0] rounded-xl p-6 sm:p-8 shadow-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="xl" />
          </div>
          <p className="text-xs text-[#56655D] font-medium">
            Evidence-Driven Security Assessment & Validation Platform
          </p>
        </div>

        {/* Sandbox Indicator */}
        <div className="bg-[#F8F9F6] border border-[#DEE5E0] rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[#0A6E4F]">
            <ShieldCheck className="w-4 h-4 text-[#0A6E4F]" />
            <span className="font-bold text-[#16201B]">AUTHORIZED SANDBOX</span>
          </div>
          <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded">
            LOCAL TARGET READY
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-bold text-[#16201B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#0A6E4F]" />
              <span>Security Analyst Identity</span>
            </label>
            <input
              id="login-email"
              name="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-bold text-[#16201B] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#0A6E4F]" />
              <span>Passkey / Access Token</span>
            </label>
            <input
              id="login-password"
              name="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field font-medium font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2.5"
          >
            <span>Enter Security Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Closed-Loop Lifecycle Workflow Footer */}
        <div className="border-t border-[#DEE5E0] pt-4 space-y-2">
          <p className="text-[10px] font-bold text-[#85948C] uppercase tracking-wider text-center">
            Closed-Loop Security Workflow
          </p>
          <div className="flex items-center justify-between text-[10px] font-bold text-[#56655D] px-1">
            <span>DETECT</span>
            <span>&rarr;</span>
            <span>VALIDATE</span>
            <span>&rarr;</span>
            <span>REMEDIATE</span>
            <span>&rarr;</span>
            <span>RETEST</span>
            <span>&rarr;</span>
            <span className="text-[#0A6E4F]">VERIFY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
