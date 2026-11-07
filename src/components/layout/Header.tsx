import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { UserRole, InstitutionalRoleLabel, NotificationItem } from '../../types/nexora';

interface HeaderProps {
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
  onOpenAuth: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenAuth,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const {
    currentUser,
    activeSubRole,
    switchUserRole,
    switchUserAccount,
    notifications,
    markNotificationRead,
    auditLogs,
    microSkills,
    pathways,
    opportunities,
  } = useNexora();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorkflowHubOpen, setIsWorkflowHubOpen] = useState(false);
  const [notifFilterRole, setNotifFilterRole] = useState<'current' | 'all'>('current');
  const [searchQuery, setSearchQuery] = useState('');

  // PRD 08 Section 18: Keyboard accessibility — Escape closes open overlays; Cmd/Ctrl+K opens Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsUserMenuOpen(false);
        setIsWorkflowHubOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roleFilteredNotifs = notifications.filter(n =>
    notifFilterRole === 'all'
      ? true
      : !n.recipientRole || n.recipientRole === 'all' || n.recipientRole === currentUser.role
  );

  const unreadNotifCount = notifications.filter(
    n => !n.read && (!n.recipientRole || n.recipientRole === 'all' || n.recipientRole === currentUser.role)
  ).length;

  const tabLabels: Record<string, string> = {
    overview: 'Student Overview',
    profile: 'My Learner Profile',
    skills: 'Competency & Skill Profile',
    learning: 'Personalized Learning Pathways',
    opportunities: 'Opportunity Discovery',
    portfolio: 'Learning Evidence Portfolio',
    goals: 'Academic & Career Goals',
    settings: 'Notifications & Settings',
    lecturer_overview: 'Lecturer Overview',
    lecturer_courses: 'Course Workspace',
    lecturer_knowledge_graph: 'Course Knowledge Graph',
    lecturer_class_intelligence: 'Class Intelligence & Groups',
    lecturer_activities: 'Learning Activities',
    lecturer_assessments: 'Assessments & Evidence Review',
    lecturer_student_progress: 'Student Competency Progress',
    lecturer_feedback: 'Lecturer Feedback & Guidance',
    lecturer_program_admin: 'Curriculum & Opportunity Review',
    industry_overview: 'Industry Partner Overview',
    industry_org_profile: 'Organization Profile & Verification',
    industry_opportunities: 'Opportunity Management',
    industry_create_opportunity: 'Create & Submit Opportunity',
    industry_skill_requirements: 'Skill Requirement Mapping',
    industry_collaboration: 'University-Industry Collaboration Projects',
    industry_engagement: 'Consent-Based Student Engagement',
    industry_analytics: 'Aggregated Talent & Skill Analytics',
    security_admin_console: 'Security Admin & RBAC Console',
  };

  const handleRoleSelect = (
    role: UserRole,
    subRoleLabel?: InstitutionalRoleLabel,
    targetTabOverride?: string
  ) => {
    switchUserRole(role, subRoleLabel);
    setIsUserMenuOpen(false);
    if (targetTabOverride) {
      onNavigateTab(targetTabOverride);
      return;
    }
    if (role === 'lecturer') onNavigateTab('lecturer_overview');
    else if (role === 'industry') onNavigateTab('industry_overview');
    else onNavigateTab('overview');
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationRead(n.id);
    setIsNotifOpen(false);
    if (n.recipientRole && n.recipientRole !== 'all' && n.recipientRole !== currentUser.role) {
      switchUserRole(n.recipientRole);
    }
    if (n.navigationTarget) {
      onNavigateTab(n.navigationTarget);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#DCE4DD] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Contextual Title / Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#173A32] hover:bg-[#F4F2EA] focus:outline-hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#66736C]">
          <span className="font-medium">NEXORA</span>
          <span>/</span>
          <span className="font-semibold text-[#173A32]">{tabLabels[currentTab] || 'Workspace'}</span>
        </div>
      </div>

      {/* Middle: Search Command Palette Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#66736C] rounded-lg border border-[#DCE4DD] text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#66736C]" />
            <span>Search skills, courses, opportunities, projects...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-[#173A32] border border-[#DCE4DD] rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Cross-Portal Event Hub, Role Indicator, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* PRD 06 Security & RBAC Console Quick Access Button */}
        <button
          onClick={() => onNavigateTab('security_admin_console')}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'security_admin_console'
              ? 'bg-[#173A32] text-white border-[#173A32]'
              : 'bg-[#173A32]/10 hover:bg-[#173A32]/20 text-[#173A32] border-[#173A32]/25'
          }`}
          title="Open PRD 06 Security Admin & RBAC Console"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#25866A]" />
          <span>Security & RBAC</span>
        </button>

        {/* PRD 04 Cross-Portal Event Flow Inspector Button */}
        <button
          onClick={() => setIsWorkflowHubOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#25866A]/10 hover:bg-[#25866A]/20 text-[#25866A] text-xs font-semibold rounded-lg border border-[#25866A]/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Inspect Cross-Portal Events & End-to-End Workflows"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Event Flows</span>
        </button>

        {/* Role & Permission Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] text-xs font-medium rounded-lg border border-[#DCE4DD] transition-colors whitespace-nowrap shrink-0"
          >
            <span className="font-semibold">{activeSubRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#66736C]" />
          </button>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-[#173A32] hover:bg-[#F4F2EA] rounded-lg relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#B54747] rounded-full ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DCE4DD] rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
                <div>
                  <h4 className="font-heading font-semibold text-sm text-[#173A32]">Cross-Portal Notifications</h4>
                  <p className="text-[10px] text-[#66736C]">Click any event to jump to its target workspace</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNotifFilterRole(notifFilterRole === 'current' ? 'all' : 'current')}
                    className="text-[10px] font-semibold px-2 py-0.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] rounded-md border border-[#DCE4DD]"
                  >
                    {notifFilterRole === 'current' ? `Role: ${currentUser.role}` : 'All Portals'}
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#DCE4DD] py-1">
                {roleFilteredNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors space-y-1 ${
                      n.read ? 'hover:bg-[#F4F2EA]' : 'bg-[#F4F2EA]/70 hover:bg-[#F4F2EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#173A32] truncate">{n.title}</span>
                      <span className="text-[10px] text-[#66736C] shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[#66736C] leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      {n.recipientRole && (
                        <span className="font-bold uppercase tracking-wider text-[#25866A]">
                          Target: {n.recipientRole} portal
                        </span>
                      )}
                      {n.navigationTarget && (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#173A32]">
                          <span>Open view</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Role Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 hover:bg-[#F4F2EA] rounded-lg transition-colors focus:outline-hidden"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#DCE4DD]"
              referrerPolicy="no-referrer"
            />
            <span className="hidden lg:inline-block text-xs font-semibold text-[#173A32] max-w-[120px] truncate">
              {currentUser.name}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DCE4DD] rounded-xl shadow-lg p-2 z-50">
              <div className="p-3 border-b border-[#DCE4DD] bg-[#F4F2EA]/50 rounded-t-lg">
                <p className="text-xs font-bold text-[#173A32]">{currentUser.name}</p>
                <p className="text-[11px] text-[#66736C] truncate">{currentUser.email}</p>
                <p className="text-[10px] text-[#25866A] font-semibold mt-1 uppercase tracking-wider">
                  {activeSubRole} · {currentUser.institution}
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                <p className="px-3 py-1 text-[10px] font-bold text-[#66736C] uppercase tracking-wider">
                  Primary Portal Roles
                </p>
                <button
                  onClick={() => handleRoleSelect('student', 'Student')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Student'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Portal (Sarah Jenkins)</span>
                </button>
                <button
                  onClick={() => handleRoleSelect('lecturer', 'Lecturer')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Lecturer'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lecturer Portal (Dr. Ahmad)</span>
                </button>
                <button
                  onClick={() => handleRoleSelect('industry', 'Industry Partner')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Industry Partner'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Industry Portal (TechCorp)</span>
                </button>

                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#66736C] uppercase tracking-wider">
                  Institutional Governance Roles
                </p>
                <button
                  onClick={() =>
                    handleRoleSelect('lecturer', 'Academic Administrator', 'lecturer_program_admin')
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Academic Administrator'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#25866A]" />
                  <span>Academic Administrator</span>
                </button>
                <button
                  onClick={() =>
                    handleRoleSelect('lecturer', 'Authorized Opportunity Reviewer', 'lecturer_program_admin')
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Authorized Opportunity Reviewer'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#D7A85B]" />
                  <span>Authorized Opportunity Reviewer</span>
                </button>
                <button
                  onClick={() =>
                    handleRoleSelect('lecturer', 'Institutional Administrator', 'lecturer_program_admin')
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Institutional Administrator'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#173A32]" />
                  <span>Institutional Administrator</span>
                </button>

                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#66736C] uppercase tracking-wider">
                  PRD 06 Security & IAM Roles
                </p>
                <button
                  onClick={() =>
                    handleRoleSelect('lecturer', 'Technical Administrator', 'security_admin_console')
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Technical Administrator'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#25866A]" />
                  <span>Technical Administrator (SecOps)</span>
                </button>
                <button
                  onClick={() =>
                    handleRoleSelect('lecturer', 'Platform Super Administrator', 'security_admin_console')
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeSubRole === 'Platform Super Administrator'
                      ? 'bg-[#25866A]/10 text-[#25866A] font-semibold'
                      : 'text-[#173A32] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#D7A85B]" />
                  <span>Platform Super Administrator</span>
                </button>
                <button
                  onClick={() => {
                    switchUserAccount('user_student_suspended_1', 'Student');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg text-[#B54747] hover:bg-[#B54747]/10 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#B54747]" />
                  <span>Test Suspended Account Lockout</span>
                </button>
              </div>

              <div className="border-t border-[#DCE4DD] pt-1 mt-1">
                <button
                  onClick={onOpenAuth}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#B54747] hover:bg-[#B54747]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRD 04 Cross-Portal Event Flow & Audit Inspector Modal */}
      {isWorkflowHubOpen && (
        <div className="fixed inset-0 bg-[#173A32]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl w-full max-w-4xl p-6 space-y-6 max-h-[88vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  PRD 04 · Institutional Learning Intelligence Ecosystem
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[#173A32]">
                  Cross-Portal Event Flows & Live State Audit Log
                </h3>
              </div>
              <button
                onClick={() => setIsWorkflowHubOpen(false)}
                className="p-1.5 text-[#66736C] hover:text-[#173A32] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Interactive Cross-Portal Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-[#F4F2EA]/70 border border-[#DCE4DD] rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#25866A]/10 text-[#25866A] rounded-md">
                    EVENT 1 · Evidence & Mastery
                  </span>
                  <h4 className="font-bold text-[#173A32]">Student Evidence → Lecturer Review</h4>
                  <p className="text-[11px] text-[#66736C]">
                    Student submits artifact → Lecturer validates with rubric → Competency updates → Opportunity matches recalculate.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleRoleSelect('student', 'Student', 'portfolio');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#173A32] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    1. Student Submit
                  </button>
                  <button
                    onClick={() => {
                      handleRoleSelect('lecturer', 'Lecturer', 'lecturer_assessments');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#173A32] text-white hover:bg-[#25866A] rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    2. Lecturer Validate
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F4F2EA]/70 border border-[#DCE4DD] rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#25866A]/10 text-[#25866A] rounded-md">
                    EVENT 2 · Curriculum Graph
                  </span>
                  <h4 className="font-bold text-[#173A32]">CPMK Mapping → Pathway Sync</h4>
                  <p className="text-[11px] text-[#66736C]">
                    Lecturer maps CPMK to micro-skills → Course Knowledge Graph updates → Student pathways & Admin coverage sync.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleRoleSelect('lecturer', 'Lecturer', 'lecturer_courses');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#173A32] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    1. Map CPMK
                  </button>
                  <button
                    onClick={() => {
                      handleRoleSelect('lecturer', 'Lecturer', 'lecturer_knowledge_graph');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#173A32] text-white hover:bg-[#25866A] rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    2. View Graph
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F4F2EA]/70 border border-[#DCE4DD] rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#D7A85B]/20 text-[#A76716] rounded-md">
                    EVENT 3 · Opportunity Verification
                  </span>
                  <h4 className="font-bold text-[#173A32]">Industry Submit → University Review</h4>
                  <p className="text-[11px] text-[#66736C]">
                    Industry submits opportunity → Reviewer approves → Visible in Student Discovery with eligibility & readiness match.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleRoleSelect('industry', 'Industry Partner', 'industry_create_opportunity');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#173A32] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    1. Industry Submit
                  </button>
                  <button
                    onClick={() => {
                      handleRoleSelect('lecturer', 'Authorized Opportunity Reviewer', 'lecturer_program_admin');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#173A32] text-white hover:bg-[#25866A] rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    2. Reviewer Approve
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F4F2EA]/70 border border-[#DCE4DD] rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#237A55]/10 text-[#237A55] rounded-md">
                    EVENT 4 · Explicit Student Consent
                  </span>
                  <h4 className="font-bold text-[#173A32]">Student Interest → Permitted Share</h4>
                  <p className="text-[11px] text-[#66736C]">
                    Student grants field-level consent → Recorded with timestamp → Industry sees only authorized student fields.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleRoleSelect('student', 'Student', 'opportunities');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#173A32] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    1. Express Interest
                  </button>
                  <button
                    onClick={() => {
                      handleRoleSelect('industry', 'Industry Partner', 'industry_engagement');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#173A32] text-white hover:bg-[#25866A] rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    2. Industry View
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F4F2EA]/70 border border-[#DCE4DD] rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#416B8B]/15 text-[#416B8B] rounded-md">
                    EVENT 5 · Classroom Activity Loop
                  </span>
                  <h4 className="font-bold text-[#173A32]">Publish Activity → Student Pathway</h4>
                  <p className="text-[11px] text-[#66736C]">
                    Lecturer publishes learning activity → Enrolled students notified → Student submits evidence → Lecturer assesses.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleRoleSelect('lecturer', 'Lecturer', 'lecturer_activities');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#173A32] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    1. Publish Activity
                  </button>
                  <button
                    onClick={() => {
                      handleRoleSelect('student', 'Student', 'learning');
                      setIsWorkflowHubOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#173A32] text-white hover:bg-[#25866A] rounded-lg font-semibold text-[11px] transition-colors"
                  >
                    2. Student Pathway
                  </button>
                </div>
              </div>
            </div>

            {/* Live Audit Log Stream */}
            <div className="space-y-2 pt-2 border-t border-[#DCE4DD]">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-[#173A32]">
                  Live Cross-Portal Audit Log ({auditLogs.length} Events Recorded)
                </h4>
                <span className="text-[11px] text-[#237A55] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Referential Integrity Verified
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-[#DCE4DD] border border-[#DCE4DD] rounded-xl bg-[#F4F2EA]/40">
                {auditLogs.slice(0, 12).map(log => (
                  <div key={log.id} className="p-2.5 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-[#DCE4DD] text-[#173A32] shrink-0">
                        {log.actorRole}
                      </span>
                      <span className="font-semibold text-[#173A32] truncate">{log.action}:</span>
                      <span className="text-[#66736C] truncate">{log.targetName}</span>
                    </div>
                    <span className="text-[10px] text-[#66736C] font-mono shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-[#173A32]/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Global Workspace Search"
        >
          <div className="bg-white rounded-2xl border border-[#DCE4DD] shadow-2xl w-full max-w-xl p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DCE4DD]">
              <Search className="w-5 h-5 text-[#25866A]" />
              <input
                type="text"
                autoFocus
                aria-label="Search skills, courses, opportunities, and projects"
                placeholder="Type to search skills, pathways, opportunities, projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm text-[#173A32] placeholder-[#66736C] bg-transparent outline-hidden"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="p-1 rounded-lg text-[#66736C] hover:bg-[#F4F2EA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-80 overflow-y-auto text-xs">
              {searchQuery.trim() && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-[#25866A] uppercase tracking-wider px-2">
                    Matching Institutional Records
                  </p>
                  {microSkills
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 3)
                    .map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          onNavigateTab(currentUser.role === 'lecturer' ? 'lecturer_knowledge_graph' : 'skills');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#F4F2EA] rounded-lg flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#173A32]">{s.name}</span>
                        <span className="text-[10px] text-[#66736C]">Competency · {s.category}</span>
                      </button>
                    ))}
                  {pathways
                    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 2)
                    .map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          onNavigateTab(currentUser.role === 'lecturer' ? 'lecturer_courses' : 'learning');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#F4F2EA] rounded-lg flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#173A32]">{p.code} — {p.title}</span>
                        <span className="text-[10px] text-[#25866A]">Course Pathway</span>
                      </button>
                    ))}
                  {opportunities
                    .filter(
                      o =>
                        o.publicationStatus === 'Published' &&
                        o.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 3)
                    .map(o => (
                      <button
                        type="button"
                        key={o.id}
                        onClick={() => {
                          onNavigateTab(
                            currentUser.role === 'industry' ? 'industry_opportunities' : 'opportunities'
                          );
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#F4F2EA] rounded-lg flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#173A32]">{o.title}</span>
                        <span className="text-[10px] text-[#D7A85B] font-bold">{o.organization}</span>
                      </button>
                    ))}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#66736C] uppercase tracking-wider px-2">
                  Quick Portal Navigation
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('student', 'Student');
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-[#F4F2EA] rounded-lg text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-[#173A32]">
                    Student Portal — Overview & Opportunity Discovery
                  </span>
                  <span className="text-[10px] text-[#25866A]">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('lecturer', 'Lecturer');
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-[#F4F2EA] rounded-lg text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-[#173A32]">
                    Lecturer Portal — Knowledge Graph & Opportunity Review
                  </span>
                  <span className="text-[10px] text-[#25866A]">Lecturer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('industry', 'Industry Partner');
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-[#F4F2EA] rounded-lg text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-[#173A32]">
                    Industry Portal — Publish Opportunities & Collaboration Projects
                  </span>
                  <span className="text-[10px] text-[#D7A85B]">Industry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
