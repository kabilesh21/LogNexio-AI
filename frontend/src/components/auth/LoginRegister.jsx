import React, { useState } from 'react';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../../services/authService';
import { Shield, User, Lock, Mail, Loader2, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export default function LoginRegister({ onLoginSuccess }) {
  // Views: 'login' | 'register' | 'forgot' | 'reset'
  const [view, setView] = useState('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // Password reset fields
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (view === 'register') {
        const response = await registerUser(username, password, email || null);
        if (response.success) {
          setSuccessMsg('Registration successful! Switching to Sign In...');
          setTimeout(() => {
            setView('login');
            setSuccessMsg('');
            setPassword('');
          }, 1500);
        }
      } else if (view === 'login') {
        const response = await loginUser(username, password);
        if (response.success) {
          onLoginSuccess(response);
        }
      } else if (view === 'forgot') {
        const response = await forgotPassword(email);
        if (response.success) {
          setSuccessMsg('OTP Code sent! Check your inbox.');
          setTimeout(() => {
            setView('reset');
            setSuccessMsg('');
          }, 1500);
        }
      } else if (view === 'reset') {
        const response = await resetPassword(email, otp, newPassword);
        if (response.success) {
          setSuccessMsg('Password reset successful! Switching to Sign In...');
          setTimeout(() => {
            setView('login');
            setSuccessMsg('');
            setPassword('');
            setNewPassword('');
            setOtp('');
          }, 1800);
        }
      }
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebdccb] via-[#c2a783] to-[#aa8c65] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-[#faf6f0] border border-[#dfcbb5] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Curvy Solid Color Branding (NO IMAGES, NO GRAPHICS) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#d4bd9f] via-[#c2a783] to-[#aa8c65] p-12 flex-col justify-between relative text-[#1c120c] select-none overflow-visible">
          
          {/* SVG Curvy Divider cutting into the left pane */}
          <div className="absolute top-0 bottom-0 right-0 w-24 h-full pointer-events-none z-20">
            <svg className="h-full w-full fill-[#faf6f0]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M100,0 C40,15 30,85 100,100 L100,100 Z" />
            </svg>
          </div>

          {/* Logo and Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-1.5 bg-[#1c120c]/5 rounded-xl border border-[#1c120c]/10 flex items-center justify-center">
              {/* Actual LogNexio Brain Logo icon asset */}
              <img src="/logo_icon.png" className="w-9 h-9 object-contain select-none" alt="LogNexio Logo" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide uppercase font-mono text-[#1c120c]">LogNexio AI</span>
              <p className="text-[10px] text-[#3a1d08]/85 tracking-widest uppercase font-semibold">Intelligence Over Matter</p>
            </div>
          </div>

          {/* Center Minimal Text Branding */}
          <div className="relative z-10 my-auto flex flex-col gap-4 max-w-xs">
            <h2 className="text-4xl font-extrabold text-[#1c120c] leading-tight tracking-tight">
              Real-time Log Analysis.
            </h2>
            <p className="text-sm text-[#1c120c]/85 leading-relaxed font-medium">
              Accelerate incident resolution times and simplify anomaly diagnostics with automated AI intelligence.
            </p>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-[10px] text-[#1c120c]/60 font-semibold">
            &copy; 2026 LogNexio AI Platform. All Rights Reserved.
          </div>
        </div>

        {/* Right Side: Interactive Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#faf6f0] relative z-10">
          
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1c120c] tracking-tight">
              {view === 'login' && 'Sign In'}
              {view === 'register' && 'Create Account'}
              {view === 'forgot' && 'Reset Password'}
              {view === 'reset' && 'Enter Reset Code'}
            </h1>
            <p className="text-sm text-[#6e3d1c]/70 mt-2">
              {view === 'login' && 'Access your AI-powered log analysis workspace.'}
              {view === 'register' && 'Register to start analyzing system logs with AI.'}
              {view === 'forgot' && 'Enter your email to receive a password reset verification code.'}
              {view === 'reset' && 'Enter the 6-digit OTP code sent to your email and set a new password.'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-xl">
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username (Login & Register Only) - Now explicitly supports Username or Email during Sign In */}
            {(view === 'login' || view === 'register') && (
              <div>
                <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider mb-2">
                  {view === 'login' ? 'Username or Email' : 'Username'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={view === 'login' ? 'Enter username or email' : 'Enter username'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email (Register, Forgot, and Reset Only) */}
            {(view === 'register' || view === 'forgot' || view === 'reset') && (
              <div>
                <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    disabled={view === 'reset'}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all disabled:opacity-75"
                  />
                </div>
              </div>
            )}

            {/* OTP Code Input (Reset Code View Only) */}
            {view === 'reset' && (
              <div>
                <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider mb-2">Verification Code (OTP)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                    <KeyRound className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all font-mono tracking-widest text-center"
                  />
                </div>
              </div>
            )}

            {/* Password (Login, Register & Reset Only) */}
            {view !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider">
                    {view === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {view === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-xs text-[#6e3d1c] hover:underline focus:outline-none cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder={view === 'reset' ? 'Enter new password' : 'Enter your password'}
                    value={view === 'reset' ? newPassword : password}
                    onChange={(e) => view === 'reset' ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#6e3d1c] hover:bg-[#573015] text-[#faf6f0] rounded-xl text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  <span>
                    {view === 'login' && 'Sign In to Workspace'}
                    {view === 'register' && 'Register Now'}
                    {view === 'forgot' && 'Send Code'}
                    {view === 'reset' && 'Reset Password'}
                  </span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Switcher links */}
          <div className="mt-8 pt-6 border-t border-[#dfcbb5]/50 text-center">
            {view === 'login' && (
              <>
                <span className="text-xs text-[#1c120c]/60">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-[#6e3d1c] hover:underline ml-1 cursor-pointer"
                >
                  Register Now
                </button>
              </>
            )}
            
            {view === 'register' && (
              <>
                <span className="text-xs text-[#1c120c]/60">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-[#6e3d1c] hover:underline ml-1 cursor-pointer"
                >
                  Sign In Now
                </button>
              </>
            )}

            {(view === 'forgot' || view === 'reset') && (
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-[#6e3d1c] hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
          </div>

          {/* Terms & Support (Matching the reference layout footer) */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#6e3d1c]/50 gap-2">
            <a href="#terms" className="hover:underline" onClick={(e) => e.preventDefault()}>Terms and Services</a>
            <span>Need help? Contact <a href="mailto:support@lognexio.ai" className="font-semibold hover:underline text-[#6e3d1c]">support@lognexio.ai</a></span>
          </div>

        </div>

      </div>
    </div>
  );
}
