import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Briefcase,
  BookOpen,
  X,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';
import { useNexora } from '../../context/NexoraContext';
import { UserRole } from '../../types/nexora';
import { DEMO_IMAGE_CAMPUS } from '../../services/demoData';

interface AuthPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onClose }) => {
  const { allUsers, switchUserRole } = useNexora();
  const [email, setEmail] = useState('sarah.jenkins@nusantara.ac.id');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // PRD 08 Section 18: Escape key closes active modal or Auth overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isForgotModalOpen) setIsForgotModalOpen(false);
        else if (isRequestAccessOpen) setIsRequestAccessOpen(false);
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isForgotModalOpen, isRequestAccessOpen, onClose]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    switchUserRole(selectedRole);
    onLoginSuccess(selectedRole);
  };

  const handleDemoPresetSelect = (role: UserRole, userEmail: string) => {
    setSelectedRole(role);
    setEmail(userEmail);
  };

  return (
    <div className="min-h-screen bg-[#F4F2EA] flex items-center justify-center p-4 md:p-8 w-full">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#DCE4DD] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Hero Brand Section (5 cols) matching NEXORA visual concept */}
        <div className="md:col-span-5 bg-[#173A32] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={DEMO_IMAGE_CAMPUS}
              alt="Universitas Nusantara Campus"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#173A32] via-[#173A32]/80 to-transparent" />
          </div>

          <div className="relative z-10 space-y-6">
            <NexoraLogo size="lg" lightText />
            <div className="pt-8">
              <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white leading-tight mb-4">
                Grow beyond what you know.
              </h1>
              <p className="text-sm text-[#F4F2EA]/85 leading-relaxed font-normal">
                Connect your learning journey with meaningful opportunities.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-[#25866A]/40">
            <div className="flex items-center gap-2 text-xs text-[#F4F2EA]/90">
              <ShieldCheck className="w-4 h-4 text-[#D7A85B] shrink-0" />
              <span>Multi-Tenant Institutional Security & Verified Credentials</span>
            </div>
            <div className="text-[11px] text-[#F4F2EA]/70 flex items-center justify-between">
              <span>Institutional Learning Intelligence</span>
              <span>WCAG 2.2 AA · v2.5</span>
            </div>
          </div>
        </div>

        {/* Right Form Section (7 cols) */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#173A32]">Welcome back</h2>
                <p className="text-xs text-[#66736C] mt-0.5">
                  Sign in to your NEXORA account.
                </p>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sign in dialog"
                  className="p-2 text-[#66736C] hover:text-[#173A32] hover:bg-[#F4F2EA] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* PRD 08 Section 12: Multi-Role Workspace Selector */}
            <div className="mt-5 mb-5 bg-[#F4F2EA] p-3.5 rounded-2xl border border-[#DCE4DD] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#173A32] uppercase tracking-wider">
                  Workspace & Authorized Persona Selector
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#237A55]">
                  <CheckCircle2 className="w-3 h-3" /> Email Verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {allUsers.map(u => {
                  const RoleIcon =
                    u.role === 'lecturer'
                      ? BookOpen
                      : u.role === 'industry'
                      ? Briefcase
                      : GraduationCap;
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => handleDemoPresetSelect(u.role, u.email)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedRole === u.role
                          ? 'bg-white border-[#25866A] shadow-xs text-[#173A32]'
                          : 'bg-[#F4F2EA]/80 border-transparent text-[#66736C] hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[11px] font-bold truncate">{u.name.split(' ')[0]}</p>
                        <RoleIcon className="w-3.5 h-3.5 text-[#25866A] shrink-0" />
                      </div>
                      <p className="text-[10px] capitalize text-[#25866A] font-semibold">
                        {u.role} Workspace
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="nexora-login-email"
                  className="block text-xs font-semibold text-[#173A32] mb-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#66736C] absolute left-3.5 top-3" />
                  <input
                    id="nexora-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-xl text-xs text-[#173A32] focus:outline-hidden focus:border-[#25866A] focus:ring-1 focus:ring-[#25866A] transition-colors"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="nexora-login-password"
                  className="block text-xs font-semibold text-[#173A32] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#66736C] absolute left-3.5 top-3" />
                  <input
                    id="nexora-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-xl text-xs text-[#173A32] focus:outline-hidden focus:border-[#25866A] focus:ring-1 focus:ring-[#25866A] transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3 text-[#66736C] hover:text-[#173A32] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#66736C]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[#DCE4DD] text-[#25866A]"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="font-semibold text-[#25866A] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* PRD 08 Section 12: Institutional SSO & Google Sign-In */}
          <div className="space-y-3 pt-5 border-t border-[#DCE4DD] mt-5">
            <p className="text-center text-[11px] text-[#66736C]">
              Or continue with your institution account
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  switchUserRole(selectedRole);
                  onLoginSuccess(selectedRole);
                }}
                className="w-full py-2.5 px-3 bg-white border border-[#DCE4DD] hover:bg-[#F4F2EA] text-[#173A32] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building className="w-4 h-4 text-[#25866A]" />
                <span>Continue with SSO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUserRole(selectedRole);
                  onLoginSuccess(selectedRole);
                }}
                className="w-full py-2.5 px-3 bg-white border border-[#DCE4DD] hover:bg-[#F4F2EA] text-[#173A32] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#25866A]" />
                <span>Google Workspace Sign-In</span>
              </button>
            </div>

            <div className="text-center text-xs text-[#66736C] pt-1">
              Unregistered university student, lecturer, or industry partner?{' '}
              <button
                type="button"
                onClick={() => setIsRequestAccessOpen(true)}
                className="font-semibold text-[#25866A] hover:underline cursor-pointer"
              >
                Request Institutional Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 bg-[#173A32]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reset Password"
        >
          <div className="bg-white rounded-2xl border border-[#DCE4DD] shadow-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Reset Password</h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                aria-label="Close reset password dialog"
                className="text-[#66736C] hover:text-[#173A32]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {forgotSent ? (
              <div className="p-4 bg-[#237A55]/10 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Password reset link sent to {email}. Check your institutional inbox.</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-[#66736C]">
                  Enter your registered institutional email address to receive password reset instructions.
                </p>
                <div>
                  <label htmlFor="reset-email-input" className="font-semibold block mb-1 text-[#173A32]">
                    Institutional Email
                  </label>
                  <input
                    id="reset-email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                    placeholder="name@university.edu"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="w-full py-2.5 bg-[#25866A] text-white font-semibold rounded-xl hover:bg-[#173A32] transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Institutional Access Request Modal */}
      {isRequestAccessOpen && (
        <div
          className="fixed inset-0 bg-[#173A32]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Request Institutional Access"
        >
          <div className="bg-white rounded-2xl border border-[#DCE4DD] shadow-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                Request Institutional Access
              </h3>
              <button
                type="button"
                onClick={() => setIsRequestAccessOpen(false)}
                aria-label="Close access request dialog"
                className="text-[#66736C] hover:text-[#173A32]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {requestSubmitted ? (
              <div className="p-4 bg-[#237A55]/10 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Your access request has been submitted to your university administrator for verification.
                </span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-[#66736C]">
                  NEXORA requires institutional verification. Unregistered students, faculty, and partner organizations receive credentials following institutional administrator review.
                </p>
                <div>
                  <label htmlFor="req-fullname" className="font-semibold block mb-1 text-[#173A32]">
                    Full Name
                  </label>
                  <input
                    id="req-fullname"
                    type="text"
                    placeholder="e.g. Budi Santoso"
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
                <div>
                  <label htmlFor="req-org" className="font-semibold block mb-1 text-[#173A32]">
                    University / Partner Organization
                  </label>
                  <input
                    id="req-org"
                    type="text"
                    placeholder="e.g. Universitas Nusantara - Faculty of Computer Science"
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRequestSubmitted(true)}
                  className="w-full py-2.5 bg-[#173A32] text-white font-semibold rounded-xl hover:bg-[#25866A] transition-colors cursor-pointer"
                >
                  Submit Access Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
