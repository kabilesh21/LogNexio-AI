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
    <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-[#f1e6d5] border border-[#dfcbb5] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        
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
              {/* Detailed custom SVG brain logo matching the LogNexio brand identity */}
              <svg className="w-9 h-9 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Side (Circuit Brain) */}
                <path d="M11.5,4 C9.2,4 7,5.2 6.1,7 C5.6,7.9 5.2,9.3 5.4,10.6 C5.2,11.1 4.9,11.5 4.9,12 C4.9,13.8 6.1,15.6 7.5,16.5 C7.6,17 7.6,17.4 7.8,17.9 C8.4,19.7 10.2,20.2 11.5,20.2" stroke="#1c120c" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M11.5,6.5 L9.5,6.5 C8.8,6.5 8.2,7.1 8.2,7.8 M11.5,9.5 L10.1,9.5 C9.5,9.5 9,10 9,10.6 L9,11 M11.5,12 L9.5,12 L9,11.5 M11.5,14.8 L10.1,14.8 L9.6,13.9 L9.6,13.4 M11.5,17.6 L9.5,17.6 L9,17.1" stroke="#1c120c" strokeWidth="1" strokeLinecap="round" />
                <circle cx="8.2" cy="7.8" r="0.6" fill="#1c120c" />
                <circle cx="9" cy="11.1" r="0.6" fill="#1c120c" />
                <circle cx="9" cy="11.5" r="0.6" fill="#1c120c" />
                <circle cx="9.6" cy="13.4" r="0.6" fill="#1c120c" />
                <circle cx="9" cy="17.1" r="0.6" fill="#1c120c" />

                {/* Right Side (Neural Brain) */}
                <path d="M12.5,4 C14.8,4 17,5.2 17.9,7 C18.4,7.9 18.8,9.3 18.6,10.6 C18.8,11.1 19.1,11.5 19.1,12 C19.1,13.8 17.9,15.6 16.5,16.5 C16.4,17 16.4,17.4 16.2,17.9 C15.6,19.7 13.8,20.2 12.5,20.2" stroke="#2bb385" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="12.5" y1="7.5" x2="15.8" y2="7.5" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="15.8" y1="7.5" x2="17.2" y2="9.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="17.2" y1="9.8" x2="14.4" y2="11.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="14.4" y1="11.8" x2="12.5" y2="11.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="12.5" y1="14.8" x2="16.2" y2="14.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="16.2" y1="14.8" x2="17.2" y2="17.1" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="17.2" y1="17.1" x2="14.4" y2="19.1" stroke="#2bb385" strokeWidth="0.8" />
                
                <line x1="15.8" y1="7.5" x2="14.4" y2="11.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="17.2" y1="9.8" x2="16.2" y2="14.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="14.4" y1="11.8" x2="16.2" y2="14.8" stroke="#2bb385" strokeWidth="0.8" />
                <line x1="16.2" y1="14.8" x2="14.4" y2="19.1" stroke="#2bb385" strokeWidth="0.8" />

                <circle cx="15.8" cy="7.5" r="0.8" fill="#2bb385" />
                <circle cx="17.2" cy="9.8" r="0.8" fill="#2bb385" />
                <circle cx="14.4" cy="11.8" r="0.8" fill="#2bb385" />
                <circle cx="16.2" cy="14.8" r="0.8" fill="#2bb385" />
                <circle cx="17.2" cy="17.1" r="0.8" fill="#2bb385" />
                <circle cx="14.4" cy="19.1" r="0.8" fill="#2bb385" />
              </svg>
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
