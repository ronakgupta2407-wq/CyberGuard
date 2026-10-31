import React, { useState } from 'react';
import {
  FileText,
  Mail,
  Globe,
  Scale,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../services/firebase';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage({ onLoginSuccess, onContinueGuest, theme, onThemeChange, developers }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    scope: 'email profile',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const accessToken = tokenResponse.access_token;

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profile = await profileRes.json();
        const user = {
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email || '',
          picture: profile.picture || null,
        };
        googleAuth.setUser(user);
        onLoginSuccess(user);
      } catch (e) {
        console.error('Profile fetch failed:', e);
        setError('Login succeeded but failed to fetch profile. Continuing as guest.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      setLoading(false);
      setError('Google Sign-In was cancelled or blocked. You can still explore using Guest Mode below.');
    },
  });

  const features = [
    {
      icon: FileText,
      title: 'Terms & Conditions Analyzer',
      desc: 'Detect hidden clauses, unilateral changes, arbitration waivers, and auto-renewals in plain English.',
      color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      icon: Mail,
      title: 'Email Phishing & Threat Scanner',
      desc: 'Analyze sender discrepancies, deceptive URLs, and social engineering tricks powered by Groq LLM.',
      color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/20',
    },
    {
      icon: Globe,
      title: 'Website Security Checker',
      desc: 'Verify SSL/TLS certificates, HSTS, security headers, and domain legitimacy with SSRF protection.',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      icon: Scale,
      title: 'Privacy Compliance Checker',
      desc: 'Audit corporate policies against GDPR, CCPA/CPRA, and India’s DPDP Act with statutory citations.',
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/20',
    },
  ];

  return (
    <div className={`theme-${theme} relative isolate min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200`}>
      <div className="site-ambient" aria-hidden="true" />

      {/* Top Simple Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <img src="/cyberguard-logo.png" alt="" className="w-9 h-9 object-contain drop-shadow-md" />
          </div>
          <div>
            <span className="font-sans text-xl font-black tracking-[-0.055em] text-white">
              Cyber<span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Guard</span>
            </span>
            <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              AI Security Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <button
            onClick={onContinueGuest}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-all flex items-center gap-1.5"
          >
            <span>Explore as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="page-enter relative z-10 max-w-5xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Integrated with Groq LLM &amp; Email Threat Analysis</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl">
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Unified Digital, Legal &amp; Privacy</span>
           <br />
           <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Risk Detection</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Analyze website security, dissect predatory terms &amp; conditions, and inspect suspicious emails with deterministic checks and AI explanations.
        </p>

        {/* Auth Box Card */}
        <div className="mt-8 w-full max-w-md gradient-border p-6 sm:p-8 shadow-2xl shadow-violet-900/40">
          <h2 className="text-base font-semibold text-white mb-2">Get Started with CyberGuard</h2>
          <p className="text-xs text-slate-400 mb-6">
            Sign in with your Google account to access all security features.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300 text-left">
              {error}
            </div>
          )}

          {/* Big Google Sign-In Button */}
          <button
            onClick={() => {
              setLoading(true);
              googleLogin();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {/* Google official colored SVG icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-slate-900 px-3 text-slate-500">or</span>
            </div>
          </div>

          {/* Guest Button */}
          <button
            onClick={onContinueGuest}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>Continue as Guest (Offline Mode)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Secure OAuth 2.0
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> No password needed
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-card rounded-xl p-5 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} border flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {developers}

      {/* Simple Clean Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>CyberGuard <span className="mx-1.5 text-slate-700">·</span> Digital security and privacy tools</p>
      </footer>
    </div>
  );
}
