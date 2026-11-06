import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Building2, KeyRound, Waves } from 'lucide-react';
import { safeStorage } from '../utils/storage';

interface LoginGateProps {
  onSuccess: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const normalized = password.trim();

    // Verify partner password: "DigitalNomad26"
    if (normalized === 'DigitalNomad26') {
      safeStorage.setItem('digital_nomad_authenticated', 'true');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setPassword('DigitalNomad26');
    setError(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-4 selection:bg-[#19A7A0]/20 font-sans relative overflow-hidden">
      {/* Subtle Pacific reef and wave aura (low-contrast decorative patterns) */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#EAF4F8] to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#19A7A0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#164B91]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D9F1EC]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-[#D9F1EC] rounded-xl shadow-xl shadow-[#164B91]/5 p-8 sm:p-10 space-y-7 backdrop-blur-sm z-10">
        {/* Brand Lockup */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-xl bg-[#164B91] flex items-center justify-center text-white shadow-md shadow-[#164B91]/20 relative">
            <Building2 className="w-7 h-7 text-white" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#19A7A0] flex items-center justify-center ring-2 ring-white">
              <Waves className="w-2.5 h-2.5 text-white" />
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#24344D] tracking-tight font-heading">
              Digital Nomad
            </h1>
            <p className="text-xs font-semibold text-[#164B91] tracking-wide uppercase mt-0.5 font-heading">
              Enterprise Operations & Financial Portal
            </p>
          </div>

          <p className="text-sm text-[#24344D]/75 max-w-xs mx-auto leading-relaxed">
            Professional Pacific & Reef-Inspired Management System. Enter your authorized credential to continue.
          </p>
        </div>

        {/* Partner Password Badge / Quick Fill */}
        <div className="p-3 bg-[#EAF4F8] border border-[#D9F1EC] rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <KeyRound className="w-4 h-4 text-[#164B91] shrink-0" />
            <div className="truncate">
              <span className="text-[#24344D]/70 font-medium">Partner Password: </span>
              <span className="font-mono font-bold text-[#164B91]">DigitalNomad26</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] font-semibold text-[#164B91] hover:text-[#123e78] bg-white px-2.5 py-1 rounded-md border border-[#D9F1EC] hover:border-[#19A7A0] shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            Quick Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="partner-password"
              className="block text-xs font-semibold text-[#24344D] uppercase tracking-wider font-heading"
            >
              Partner Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#24344D]/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="partner-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter password"
                autoFocus
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-mono text-[#24344D] placeholder:text-[#24344D]/40 focus:outline-none transition-all ${
                  error
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-[#D9F1EC] bg-[#F5F7FA]/60 focus:border-[#164B91] focus:bg-white focus:ring-2 focus:ring-[#164B91]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#24344D]/50 hover:text-[#164B91] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 pt-1">
                <span>Incorrect password. Password is DigitalNomad26 (case-sensitive).</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 px-4 rounded-xl font-semibold text-sm text-white bg-[#164B91] hover:bg-[#123e78] focus:ring-2 focus:ring-[#164B91]/40 focus:outline-none shadow-md shadow-[#164B91]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 font-heading"
          >
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Footer Notice with Reef Teal and Sunset Orange accents */}
        <div className="pt-4 border-t border-[#D9F1EC] flex items-center justify-center gap-2 text-xs text-[#24344D]/70">
          <ShieldCheck className="w-4 h-4 text-[#19A7A0]" />
          <span>Fiji Bank FX & MYOB Ledger Protected</span>
        </div>
      </div>
    </div>
  );
};
