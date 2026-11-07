import React from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  Award,
  BookOpen,
  Briefcase,
  FolderCheck,
  Flag,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Network,
  Users,
  BarChart3,
  ListTodo,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Building2,
  PlusCircle,
  GitBranch,
  Handshake,
  PieChart,
} from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';
import { useNexora } from '../../context/NexoraContext';

interface SidebarProps {
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigateTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  const { currentUser, activeSubRole } = useNexora();

  // PRD 08 Section 8: Role-based navigation scoping — only show admin menus when authorized
  const isAcademicOrProgramAdmin = [
    'Course Coordinator',
    'Academic Administrator',
    'Authorized Opportunity Reviewer',
    'Institutional Administrator',
    'Technical Administrator',
    'Platform Super Administrator',
  ].includes(activeSubRole);

  const isSecurityOrPlatformAdmin = [
    'Institutional Administrator',
    'Technical Administrator',
    'Platform Super Administrator',
  ].includes(activeSubRole);

  const studentNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'skills', label: 'My Skills', icon: Award },
    { id: 'learning', label: 'My Learning', icon: BookOpen },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'portfolio', label: 'My Portfolio', icon: FolderCheck },
    { id: 'goals', label: 'My Goals', icon: Flag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const lecturerNavItems = [
    { id: 'lecturer_overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'lecturer_courses', label: 'My Courses', icon: BookOpen },
    { id: 'lecturer_knowledge_graph', label: 'Course Knowledge Graph', icon: Network },
    { id: 'lecturer_class_intelligence', label: 'Class Intelligence', icon: BarChart3 },
    { id: 'lecturer_activities', label: 'Learning Activities', icon: ListTodo },
    { id: 'lecturer_assessments', label: 'Assessments', icon: CheckSquare },
    { id: 'lecturer_student_progress', label: 'Student Progress', icon: TrendingUp },
    { id: 'lecturer_feedback', label: 'Feedback', icon: MessageSquare },
    ...(isAcademicOrProgramAdmin
      ? [{ id: 'lecturer_program_admin', label: 'Program Admin Oversight', icon: ShieldCheck }]
      : []),
    ...(isSecurityOrPlatformAdmin
      ? [{ id: 'security_admin_console', label: 'Security & RBAC Console', icon: ShieldCheck }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const industryNavItems = [
    { id: 'industry_overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'industry_org_profile', label: 'Organization Profile', icon: Building2 },
    { id: 'industry_opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'industry_create_opportunity', label: 'Create Opportunity', icon: PlusCircle },
    { id: 'industry_skill_requirements', label: 'Skill Requirements', icon: GitBranch },
    { id: 'industry_collaboration', label: 'Collaboration Projects', icon: Handshake },
    { id: 'industry_engagement', label: 'Student Engagement', icon: Users },
    { id: 'industry_analytics', label: 'Analytics', icon: PieChart },
    ...(isSecurityOrPlatformAdmin
      ? [{ id: 'security_admin_console', label: 'Security & RBAC Console', icon: ShieldCheck }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const activeNavItems =
    currentUser.role === 'lecturer'
      ? lecturerNavItems
      : currentUser.role === 'industry'
      ? industryNavItems
      : studentNavItems;

  const handleNavClick = (tabId: string) => {
    onNavigateTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Mobile Bottom Bar items matching the NEXORA Mobile Concept Reference (Home, Learn, Opportunities, Profile)
  const mobileQuickItems =
    currentUser.role === 'lecturer'
      ? [
          { id: 'lecturer_overview', label: 'Home', icon: LayoutDashboard },
          { id: 'lecturer_courses', label: 'Courses', icon: BookOpen },
          { id: 'lecturer_assessments', label: 'Assess', icon: CheckSquare },
          { id: 'lecturer_student_progress', label: 'Students', icon: TrendingUp },
        ]
      : currentUser.role === 'industry'
      ? [
          { id: 'industry_overview', label: 'Home', icon: LayoutDashboard },
          { id: 'industry_opportunities', label: 'Postings', icon: Briefcase },
          { id: 'industry_engagement', label: 'Talent', icon: Users },
          { id: 'industry_org_profile', label: 'Profile', icon: Building2 },
        ]
      : [
          { id: 'overview', label: 'Home', icon: LayoutDashboard },
          { id: 'learning', label: 'Learn', icon: BookOpen },
          { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];

  return (
    <>
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#173A32]/50 backdrop-blur-xs z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar: 248px expanded, 72px collapsed */}
      <aside
        aria-label="Primary Workspace Navigation"
        className={`fixed md:sticky top-0 left-0 z-40 h-screen ${
          isCollapsed ? 'md:w-[72px] w-[248px]' : 'w-[248px]'
        } bg-[#173A32] text-white flex flex-col justify-between p-3.5 border-r border-[#25866A]/20 transition-all duration-200 shrink-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5 overflow-y-auto overflow-x-hidden pr-0.5">
          {/* Brand Header + Collapse Toggle */}
          <div className="px-1.5 pt-1.5 pb-4 border-b border-[#25866A]/30 flex items-center justify-between gap-2">
            {isCollapsed ? (
              <button
                type="button"
                onClick={() => setIsCollapsed && setIsCollapsed(false)}
                title="Expand NEXORA Sidebar"
                aria-label="Expand sidebar"
                className="w-10 h-10 rounded-xl bg-[#25866A] text-white font-heading font-extrabold text-sm flex items-center justify-center mx-auto shadow-xs cursor-pointer"
              >
                N
              </button>
            ) : (
              <>
                <NexoraLogo size="md" lightText />
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-[#25866A]/30 text-[#D7A85B] rounded-md border border-[#D7A85B]/30">
                  {currentUser.role}
                </span>
              </>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1" aria-label="Portal sections">
            {activeNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-3.5'
                  } py-2.5 text-xs font-medium rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#25866A] text-white shadow-sm font-semibold'
                      : 'text-[#F4F2EA]/75 hover:text-white hover:bg-[#25866A]/20'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#F4F2EA]/65'
                    }`}
                  />
                  <span className={`${isCollapsed ? 'md:hidden' : ''} truncate`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Support Card & Desktop Collapse Toggle */}
        <div className="space-y-2.5 pt-3 border-t border-[#25866A]/30">
          {!isCollapsed && (
            <div className="p-3.5 rounded-xl bg-[#25866A]/20 border border-[#25866A]/40 text-xs text-[#F4F2EA]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">Need help?</span>
                <HelpCircle className="w-3.5 h-3.5 text-[#D7A85B]" />
              </div>
              <p className="text-[11px] text-[#F4F2EA]/70 leading-relaxed mb-3">
                Contact our university partnership desk for guidance.
              </p>
              <button
                type="button"
                onClick={() => handleNavClick('settings')}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[#25866A] hover:bg-[#25866A]/85 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <span>Get Help</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {setIsCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex w-full items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-semibold text-[#F4F2EA]/75 hover:text-white hover:bg-[#25866A]/20 transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Sidebar (72px)</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< 768px) matching NEXORA visual concept */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#DCE4DD] px-2 py-1.5 flex items-center justify-around shadow-lg no-print"
      >
        {mobileQuickItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-semibold transition-colors ${
                isActive ? 'text-[#25866A]' : 'text-[#66736C] hover:text-[#173A32]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
