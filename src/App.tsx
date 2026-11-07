import React, { useState } from 'react';
import { NexoraProvider } from './context/NexoraContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthPage } from './components/auth/AuthPage';

// Student Portal Views
import { StudentOverview } from './views/student/StudentOverview';
import { StudentProfile } from './views/student/StudentProfile';
import { StudentSkills } from './views/student/StudentSkills';
import { StudentLearningPath } from './views/student/StudentLearningPath';
import { StudentOpportunities } from './views/student/StudentOpportunities';
import { StudentPortfolio } from './views/student/StudentPortfolio';
import { StudentGoals } from './views/student/StudentGoals';
import { StudentSettings } from './views/student/StudentSettings';

// Lecturer Portal Views
import { LecturerOverview } from './views/lecturer/LecturerOverview';
import { LecturerCourses } from './views/lecturer/LecturerCourses';
import { LecturerKnowledgeGraph } from './views/lecturer/LecturerKnowledgeGraph';
import { LecturerClassIntelligence } from './views/lecturer/LecturerClassIntelligence';
import { LecturerActivities } from './views/lecturer/LecturerActivities';
import { LecturerAssessments } from './views/lecturer/LecturerAssessments';
import { LecturerStudentProgress } from './views/lecturer/LecturerStudentProgress';
import { LecturerFeedback } from './views/lecturer/LecturerFeedback';
import { LecturerProgramAdmin } from './views/lecturer/LecturerProgramAdmin';

// Industry Portal Views
import { IndustryOverview } from './views/industry/IndustryOverview';
import { IndustryOrganizationProfile } from './views/industry/IndustryOrganizationProfile';
import { IndustryOpportunities } from './views/industry/IndustryOpportunities';
import { IndustryCreateOpportunity } from './views/industry/IndustryCreateOpportunity';
import { IndustrySkillRequirements } from './views/industry/IndustrySkillRequirements';
import { IndustryCollaborationProjects } from './views/industry/IndustryCollaborationProjects';
import { IndustryStudentEngagement } from './views/industry/IndustryStudentEngagement';
import { IndustryAnalytics } from './views/industry/IndustryAnalytics';
import { SecurityAdminConsole } from './views/security/SecurityAdminConsole';

import { Opportunity, UserRole } from './types/nexora';
import { useNexora } from './context/NexoraContext';
import { ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, switchUserRole } = useNexora();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const handleNavigateTab = (tabId: string) => {
    if (tabId !== 'industry_create_opportunity') {
      setEditingOpportunity(null);
    }
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditOpportunity = (opp: Opportunity) => {
    setEditingOpportunity(opp);
    setCurrentTab('industry_create_opportunity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthOpen(false);
    if (role === 'lecturer') setCurrentTab('lecturer_overview');
    else if (role === 'industry') setCurrentTab('industry_overview');
    else setCurrentTab('overview');
  };

  const isAccountBlocked =
    currentUser.accountStatus && currentUser.accountStatus !== 'Active';

  const renderCurrentView = () => {
    if (currentTab === 'security_admin_console') {
      return <SecurityAdminConsole />;
    }

    if (isAccountBlocked) {
      return (
        <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border-2 border-[#B54747]/40 p-8 shadow-lg space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#B54747]/15 text-[#B54747] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#B54747]/15 text-[#B54747] font-bold text-xs uppercase tracking-wider">
              PRD 06 Security Enforcement · HTTP 403 DENIED_ACCOUNT_INACTIVE
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-[#173A32]">
              Protected Workspace Access Blocked ({currentUser.accountStatus})
            </h2>
            <p className="text-xs text-[#66736C] leading-relaxed">
              The account <strong>{currentUser.name}</strong> ({currentUser.email}) currently has status{' '}
              <strong className="text-[#B54747]">{currentUser.accountStatus}</strong>. Per NEXORA Multi-Tenant Security Policy, suspended, revoked, deactivated, or unverified accounts cannot read or modify protected institutional resources.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                switchUserRole('student', 'Student');
                setCurrentTab('overview');
              }}
              className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Active Student (Sarah Jenkins)</span>
            </button>
            <button
              onClick={() => {
                switchUserRole('lecturer', 'Technical Administrator');
                setCurrentTab('security_admin_console');
              }}
              className="px-4 py-2.5 bg-[#25866A] hover:bg-[#237A55] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Security Console to Reactivate</span>
            </button>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      // Student Views
      case 'overview':
        return <StudentOverview onNavigateTab={handleNavigateTab} />;
      case 'profile':
        return <StudentProfile />;
      case 'skills':
        return <StudentSkills />;
      case 'learning':
        return <StudentLearningPath onNavigateTab={handleNavigateTab} />;
      case 'opportunities':
        return <StudentOpportunities />;
      case 'portfolio':
        return <StudentPortfolio />;
      case 'goals':
        return <StudentGoals />;
      case 'settings':
        return <StudentSettings />;

      // Lecturer Views
      case 'lecturer_preview':
      case 'lecturer_overview':
        return <LecturerOverview onNavigateTab={handleNavigateTab} />;
      case 'lecturer_courses':
        return <LecturerCourses />;
      case 'lecturer_knowledge_graph':
        return <LecturerKnowledgeGraph />;
      case 'lecturer_class_intelligence':
        return <LecturerClassIntelligence />;
      case 'lecturer_activities':
        return <LecturerActivities />;
      case 'lecturer_assessments':
        return <LecturerAssessments />;
      case 'lecturer_student_progress':
        return <LecturerStudentProgress />;
      case 'lecturer_feedback':
        return <LecturerFeedback />;
      case 'lecturer_program_admin':
        return <LecturerProgramAdmin />;

      // Industry Views
      case 'industry_preview':
      case 'industry_overview':
        return <IndustryOverview onNavigateTab={handleNavigateTab} />;
      case 'industry_org_profile':
        return <IndustryOrganizationProfile />;
      case 'industry_opportunities':
        return (
          <IndustryOpportunities
            onNavigateTab={handleNavigateTab}
            onEditOpportunity={handleEditOpportunity}
          />
        );
      case 'industry_create_opportunity':
        return (
          <IndustryCreateOpportunity
            editingOpportunity={editingOpportunity}
            onClearEditing={() => setEditingOpportunity(null)}
            onNavigateTab={handleNavigateTab}
          />
        );
      case 'industry_skill_requirements':
        return <IndustrySkillRequirements />;
      case 'industry_collaboration':
        return <IndustryCollaborationProjects />;
      case 'industry_engagement':
        return <IndustryStudentEngagement />;
      case 'industry_analytics':
        return <IndustryAnalytics />;

      default:
        return <StudentOverview onNavigateTab={handleNavigateTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2EA] flex">
      <Sidebar
        currentTab={currentTab}
        onNavigateTab={handleNavigateTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Header
          currentTab={currentTab}
          onNavigateTab={handleNavigateTab}
          onOpenAuth={() => setIsAuthOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 max-w-[1440px] w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {isAuthOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#173A32]/80 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="NEXORA Authentication"
        >
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setIsAuthOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <NexoraProvider>
      <MainLayout />
    </NexoraProvider>
  );
}
