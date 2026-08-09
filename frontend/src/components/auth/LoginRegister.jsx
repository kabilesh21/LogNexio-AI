import React, { useState } from 'react';
import { registerUser, loginUser } from '../../services/authService';
import { Shield, User, Lock, Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginRegister({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await registerUser(username, password, email || null);
        if (response.success) {
          setSuccessMsg('Registration successful! You can now log in.');
          // Auto switch to login mode after 1.5s
          setTimeout(() => {
            setIsRegister(false);
            setSuccessMsg('');
            setPassword('');
          }, 1500);
        }
      } else {
        const response = await loginUser(username, password);
        if (response.success) {
          onLoginSuccess(response);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-[#f1e6d5] border border-[#dfcbb5] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Branding and Illustration (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#3a1d08] via-[#6e3d1c] to-[#1c120c] p-12 flex-col justify-between relative text-white">
          <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('/login_branding_ill.jpg')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c120c] via-transparent to-transparent opacity-90"></div>
          
          {/* Logo and Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Shield className="w-6 h-6 text-[#dfcbb5]" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide uppercase font-mono">LogNexio AI</span>
              <p className="text-[10px] text-[#dfcbb5] tracking-widest uppercase">Intelligence Over Matter</p>
            </div>
          </div>

          {/* Center Tech Illustration Image */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <img 
              src="/login_branding_ill.jpg" 
              alt="Cybersecurity illustration" 
              className="w-64 h-64 object-cover rounded-2xl shadow-xl border border-white/10 hover:scale-105 transition-transform duration-500" 
            />
            <h2 className="text-xl font-bold mt-6 text-center text-[#faf6f0]">AI-Powered Log Intelligence</h2>
            <p className="text-xs text-[#dfcbb5] text-center mt-2 max-w-xs leading-relaxed">
              Detect anomalies, generate AI incident reports, and accelerate root cause analysis in seconds.
            </p>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-[10px] text-[#dfcbb5]">
            &copy; 2026 LogNexio AI Platform. All Rights Reserved.
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#faf6f0]">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1c120c] tracking-tight">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-sm text-[#6e3d1c]/70 mt-2">
              {isRegister 
                ? 'Register to start analyzing system logs with AI.' 
                : 'Access your AI-powered log analysis workspace.'}
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all"
                />
              </div>
            </div>

            {/* Email (Registration Only) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-[#1c120c] uppercase tracking-wider">Password</label>
                {!isRegister && (
                  <a href="#forgot" className="text-xs text-[#6e3d1c] hover:underline" onClick={(e) => { e.preventDefault(); alert('Please contact your administrator to reset your password.'); }}>
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e3d1c]/50">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f1e6d5]/50 border border-[#dfcbb5] rounded-xl text-sm text-[#1c120c] placeholder-[#6e3d1c]/40 focus:outline-none focus:ring-2 focus:ring-[#6e3d1c]/25 focus:border-[#6e3d1c] transition-all"
                />
              </div>
            </div>

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
                  <span>{isRegister ? 'Register Now' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Switcher */}
          <div className="mt-8 pt-6 border-t border-[#dfcbb5]/50 text-center">
            <span className="text-xs text-[#1c120c]/60">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs font-bold text-[#6e3d1c] hover:underline ml-1 cursor-pointer"
            >
              {isRegister ? 'Sign In Now' : 'Register Now'}
            </button>
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
