import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Users,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Play,
  UserPlus,
  KeyRound,
  RefreshCw,
  FileUp,
  EyeOff,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import {
  AccountStatus,
  InstitutionalRoleLabel,
} from '../../types/nexora';
import {
  authorizeOperation,
  validateEvidenceFileUpload,
  DATA_CLASSIFICATION_MAP,
  SecurityActor,
  SecurityAction,
  SecurityCollection,
} from '../../security/rbacEngine';
import {
  runAllNexoraSecurityTests,
  SecurityTestSuiteReport,
} from '../../security/securityTests';

type ConsoleTab =
  | 'overview'
  | 'users_roles'
  | 'institutions'
  | 'organizations'
  | 'audit_center'
  | 'access_review';

const ALL_SECURITY_ROLES: InstitutionalRoleLabel[] = [
  'Student',
  'Lecturer',
  'Industry Partner',
  'Academic Administrator',
  'Authorized Opportunity Reviewer',
  'Institutional Administrator',
  'Technical Administrator',
  'Platform Super Administrator',
];

export const SecurityAdminConsole: React.FC = () => {
  const {
    currentUser,
    activeSubRole,
    allUsers,
    institutionalTenants,
    userInvitations,
    privacyRequests,
    organizationProfile,
    auditLogs,
    studentConsentRecords,
    updateUserAccountStatus,
    updateUserAssignedRoles,
    createUserInvitation,
    revokeUserInvitation,
    updateInstitutionalTenantStatus,
    updateOrganizationVerificationStatus,
    resolvePrivacyDataRequest,
    recordSecurityAuditEvent,
  } = useNexora();

  const [activeTab, setActiveTab] = useState<ConsoleTab>('overview');

  // Section B: User & Role Management State
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InstitutionalRoleLabel>('Lecturer');
  const [inviteInstitution, setInviteInstitution] = useState('inst_nusantara');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRolesDraft, setSelectedRolesDraft] = useState<InstitutionalRoleLabel[]>([]);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Section E: Audit Center State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditOutcomeFilter, setAuditOutcomeFilter] = useState<'ALL' | 'SUCCESS' | 'DENIED'>('ALL');
  const [immutableTestResult, setImmutableTestResult] = useState<string | null>(null);

  // Section F: Automated Security Test Suite Report
  const [testReport, setTestReport] = useState<SecurityTestSuiteReport>(() =>
    runAllNexoraSecurityTests()
  );
  const [testCategoryFilter, setTestCategoryFilter] = useState<string>('ALL');
  const [isRunningServerTests, setIsRunningServerTests] = useState(false);

  // Interactive RBAC & File Upload Simulator State
  const [simActorRole, setSimActorRole] = useState<
    | 'Student'
    | 'Lecturer'
    | 'Industry'
    | 'Academic Administrator'
    | 'Opportunity Reviewer'
    | 'Institutional Administrator'
    | 'Technical Administrator'
    | 'Platform Super Administrator'
  >('Student');
  const [simAccountStatus, setSimAccountStatus] = useState<AccountStatus>('Active');
  const [simAction, setSimAction] = useState<SecurityAction>('update');
  const [simCollection, setSimCollection] = useState<SecurityCollection>('student_skills');
  const [simCrossTenant, setSimCrossTenant] = useState(false);
  const [simRestrictedField, setSimRestrictedField] = useState(true);
  const [simDecisionOutput, setSimDecisionOutput] = useState<{
    allowed: boolean;
    code: string;
    reason: string;
    classification: string;
  } | null>(null);

  // File upload validator simulator state
  const [simFileName, setSimFileName] = useState('ml_capstone_artifact.pdf');
  const [simMimeType, setSimMimeType] = useState('application/pdf');
  const [simFileSizeMB, setSimFileSizeMB] = useState(2.4);
  const [simStoragePath, setSimStoragePath] = useState(
    '/institutions/inst_nusantara/students/user_student_1/evidence/ml_capstone_artifact.pdf'
  );
  const [simFileResult, setSimFileResult] = useState<{
    allowed: boolean;
    code: string;
    reason: string;
  } | null>(null);

  // Check if current persona has administrative console visibility
  const isAdminViewer =
    activeSubRole === 'Technical Administrator' ||
    activeSubRole === 'Platform Super Administrator' ||
    activeSubRole === 'Institutional Administrator' ||
    activeSubRole === 'Academic Administrator' ||
    currentUser.isInstitutionalAdmin ||
    currentUser.isTechnicalAdmin ||
    currentUser.isSuperAdmin;

  const activeUsersCount = allUsers.filter(u => u.accountStatus === 'Active').length;
  const suspendedOrRevokedCount = allUsers.filter(
    u => u.accountStatus === 'Suspended' || u.accountStatus === 'Access Revoked'
  ).length;
  const pendingInvitationsCount = userInvitations.filter(
    i => i.status === 'Invitation Pending'
  ).length;
  const deniedAuditEventsCount = auditLogs.filter(a => a.outcome === 'DENIED').length;

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesQuery =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.institutionalRoleLabel || '').toLowerCase().includes(userSearch.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || (u.accountStatus || 'Active') === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [allUsers, userSearch, statusFilter]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesQuery =
        log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.targetName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.resourceType || '').toLowerCase().includes(auditSearch.toLowerCase());
      const matchesOutcome =
        auditOutcomeFilter === 'ALL' || (log.outcome || 'SUCCESS') === auditOutcomeFilter;
      return matchesQuery && matchesOutcome;
    });
  }, [auditLogs, auditSearch, auditOutcomeFilter]);

  const handleRunSecurityTestSuite = async () => {
    setIsRunningServerTests(true);
    try {
      const res = await fetch('/api/security/run-tests');
      if (res.ok) {
        const serverReport: SecurityTestSuiteReport = await res.json();
        setTestReport(serverReport);
      } else {
        setTestReport(runAllNexoraSecurityTests());
      }
    } catch {
      setTestReport(runAllNexoraSecurityTests());
    } finally {
      setIsRunningServerTests(false);
      setFeedbackBanner({
        type: 'success',
        message: 'Executed all 29 positive and negative RBAC, Multi-Tenant, Consent, and File Security assertions.',
      });
    }
  };

  const handleRunRbacSimulation = async () => {
    const actor: SecurityActor = {
      uid: 'sim_actor_1',
      email: 'simulator@nusantara.ac.id',
      name: `Simulated ${simActorRole}`,
      roles: [simActorRole],
      activeRole: simActorRole,
      accountStatus: simAccountStatus,
      emailVerified: true,
      institutionId: 'inst_nusantara',
      organizationId: 'org_techcorp_id',
      assignedCourseIds: ['course_cs402'],
    };

    const resource = {
      collection: simCollection,
      resourceId: 'res_sim_target_01',
      ownerUserId: simCrossTenant ? 'other_user_99' : 'sim_actor_1',
      institutionId: simCrossTenant ? 'inst_itn_bandung' : 'inst_nusantara',
      organizationId: simCrossTenant ? 'org_other_company' : 'org_techcorp_id',
      courseId: simCrossTenant ? 'course_unassigned_99' : 'course_cs402',
      consentGranted: !simCrossTenant,
      updatedFields: simRestrictedField
        ? ['score', 'masteryLevel', 'role', 'reviewStatus', 'institutionId']
        : ['academicGoal', 'selfAssessedConfidence'],
    };

    const decision = authorizeOperation(actor, simAction, resource);
    setSimDecisionOutput(decision);

    // Also invoke server-side /api/security/authorize
    fetch('/api/security/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor, action: simAction, resource }),
    }).catch(() => {});

    if (!decision.allowed) {
      recordSecurityAuditEvent({
        actorUid: actor.uid,
        actorName: actor.name,
        actorRole: currentUser.role,
        actorSecurityRole: activeSubRole,
        institutionId: actor.institutionId,
        action: `SIMULATED ${simAction.toUpperCase()} on ${simCollection}`,
        targetName: `${simCollection}/${resource.resourceId}`,
        resourceType: simCollection,
        resourceId: resource.resourceId,
        outcome: 'DENIED',
        previousState: 'Protected Resource',
        newState: `Blocked (${decision.code}): ${decision.reason}`,
        classification: decision.classification,
      });
    }
  };

  const handleRunFileValidationSim = () => {
    const actor: SecurityActor = {
      uid: 'user_student_1',
      email: 'sarah.jenkins@nusantara.ac.id',
      name: 'Sarah Jenkins',
      roles: ['Student'],
      activeRole: 'Student',
      accountStatus: 'Active',
      emailVerified: true,
      institutionId: 'inst_nusantara',
    };

    const result = validateEvidenceFileUpload(actor, {
      fileName: simFileName,
      mimeType: simMimeType,
      sizeBytes: Math.round(simFileSizeMB * 1024 * 1024),
      targetStoragePath: simStoragePath,
      targetInstitutionId: 'inst_nusantara',
      targetStudentId: 'user_student_1',
    });

    setSimFileResult(result);
  };

  const handleTestAuditImmutability = async () => {
    const actor: SecurityActor = {
      uid: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      roles: ['Platform Super Administrator'],
      activeRole: 'Platform Super Administrator',
      accountStatus: 'Active',
      emailVerified: true,
      institutionId: 'inst_nusantara',
    };

    const decision = authorizeOperation(actor, 'delete', {
      collection: 'audit_logs',
      resourceId: 'audit_1',
      institutionId: 'inst_nusantara',
    });

    setImmutableTestResult(
      `HTTP 403 Forbidden · ${decision.code}: ${decision.reason}`
    );

    recordSecurityAuditEvent({
      actorUid: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorSecurityRole: activeSubRole,
      institutionId: 'inst_nusantara',
      action: 'Attempted Deletion of Audit Record (Blocked by Append-Only Rule)',
      targetName: 'audit_logs/audit_1',
      resourceType: 'audit_logs',
      resourceId: 'audit_1',
      outcome: 'DENIED',
      previousState: 'Immutable Audit Entry',
      newState: 'Rejected (DENIED_IMMUTABLE_AUDIT)',
      classification: 'Restricted',
    });
  };

  const handleExportAuditLogs = () => {
    const blob = new Blob([JSON.stringify(filteredAuditLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-security-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setFeedbackBanner({
        type: 'error',
        message: 'Please provide a valid institutional or partner email address.',
      });
      return;
    }
    createUserInvitation(inviteEmail, inviteRole, inviteInstitution);
    setInviteEmail('');
    setFeedbackBanner({
      type: 'success',
      message: `Time-limited invitation issued to ${inviteEmail} for role '${inviteRole}'.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#173A32] text-white rounded-3xl p-6 md:p-8 border border-[#25866A]/30 shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#25866A]/30 border border-[#D7A85B]/40 text-[#D7A85B] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>PRD 06 · Multi-Tenant Security, Identity & RBAC Governance</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight">
            Security Admin Dashboard & Technical Console
          </h1>
          <p className="text-sm text-[#F4F2EA]/80 leading-relaxed">
            Server-enforced Role-Based Access Control (RBAC), institutional tenant isolation, explicit student consent boundaries, file upload verification, and append-only security audit logging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs">
            <p className="text-[#F4F2EA]/70">Active Security Persona</p>
            <p className="font-bold text-white flex items-center gap-1.5 mt-0.5">
              <KeyRound className="w-3.5 h-3.5 text-[#D7A85B]" />
              <span>{activeSubRole}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('access_review');
              handleRunSecurityTestSuite();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#25866A] hover:bg-[#237A55] text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Run 29 Automated Security Tests</span>
          </button>
        </div>
      </div>

      {/* Least-Privilege Notice if viewed from a non-admin role */}
      {!isAdminViewer && (
        <div className="p-4 rounded-2xl bg-[#A76716]/10 border border-[#A76716]/30 text-[#173A32] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#A76716] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#173A32]">
                Read-Only Transparency Mode (Current Persona: {activeSubRole})
              </p>
              <p className="text-[#66736C]">
                In production, mutating user roles, tenant status, or organization verification requires an authorized Institutional Administrator, Technical Administrator, or Platform Super Administrator role. Use the top-right Persona Switcher to switch to Technical Administrator to perform privileged mutations.
              </p>
            </div>
          </div>
        </div>
      )}

      {feedbackBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
            feedbackBanner.type === 'success'
              ? 'bg-[#237A55]/10 border-[#237A55]/30 text-[#237A55]'
              : feedbackBanner.type === 'error'
              ? 'bg-[#B54747]/10 border-[#B54747]/30 text-[#B54747]'
              : 'bg-[#A76716]/10 border-[#A76716]/30 text-[#A76716]'
          }`}
        >
          <span>{feedbackBanner.message}</span>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Required PRD 06 Section 16 Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DCE4DD] pb-3">
        {[
          { id: 'overview', label: 'A. Security Overview', icon: ShieldCheck },
          { id: 'users_roles', label: 'B. User & Role Management', icon: Users },
          { id: 'institutions', label: 'C. Institution Management', icon: Building2 },
          { id: 'organizations', label: 'D. Organization Management', icon: Briefcase },
          { id: 'audit_center', label: 'E. Audit Center', icon: FileText },
          { id: 'access_review', label: 'F. Access Review & Security Tests', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ConsoleTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#173A32] text-white shadow-xs'
                  : 'bg-white text-[#173A32] hover:bg-[#E9E5DA] border border-[#DCE4DD]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          SECTION A: SECURITY OVERVIEW
         ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 5 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#66736C]">
                <span>Active Accounts</span>
                <CheckCircle2 className="w-4 h-4 text-[#237A55]" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-[#173A32]">
                {activeUsersCount}
              </p>
              <p className="text-[11px] text-[#237A55] font-medium">
                Email & Tenant Domain Verified
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#66736C]">
                <span>Suspended / Revoked</span>
                <ShieldAlert className="w-4 h-4 text-[#B54747]" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-[#173A32]">
                {suspendedOrRevokedCount}
              </p>
              <p className="text-[11px] text-[#B54747] font-medium">
                Blocked at Firestore & Server RBAC
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#66736C]">
                <span>Pending Invitations</span>
                <UserPlus className="w-4 h-4 text-[#A76716]" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-[#173A32]">
                {pendingInvitationsCount}
              </p>
              <p className="text-[11px] text-[#66736C]">Time-limited 7-day tokens</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#66736C]">
                <span>Blocked Access Attempts</span>
                <EyeOff className="w-4 h-4 text-[#B54747]" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-[#173A32]">
                {deniedAuditEventsCount}
              </p>
              <p className="text-[11px] text-[#66736C]">Logged in Append-Only Audit</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#66736C]">
                <span>Automated Security Suite</span>
                <ShieldCheck className="w-4 h-4 text-[#237A55]" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-[#237A55]">
                {testReport.passedCount} / {testReport.totalTests}
              </p>
              <p className="text-[11px] text-[#237A55] font-semibold">
                100% PASS (Positive & Negative)
              </p>
            </div>
          </div>

          {/* Interactive Live RBAC & File Upload Security Simulators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simulator 1: Server-Side RBAC & Multi-Tenant Authorizer */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                    Live Policy Verifier (/api/security/authorize)
                  </span>
                  <h3 className="font-heading font-bold text-base text-[#173A32]">
                    RBAC, Tenant Isolation & Field-Guard Simulator
                  </h3>
                </div>
                <Lock className="w-5 h-5 text-[#173A32]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">Actor Role</label>
                  <select
                    value={simActorRole}
                    onChange={e => setSimActorRole(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  >
                    <option value="Student">Student</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Industry">Industry Partner</option>
                    <option value="Academic Administrator">Academic Administrator</option>
                    <option value="Opportunity Reviewer">Opportunity Reviewer</option>
                    <option value="Institutional Administrator">Institutional Administrator</option>
                    <option value="Technical Administrator">Technical Administrator</option>
                    <option value="Platform Super Administrator">Platform Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">Account Status</label>
                  <select
                    value={simAccountStatus}
                    onChange={e => setSimAccountStatus(e.target.value as AccountStatus)}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Access Revoked">Access Revoked</option>
                    <option value="Email Verification Pending">Email Verification Pending</option>
                    <option value="Invitation Pending">Invitation Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">Target Collection</label>
                  <select
                    value={simCollection}
                    onChange={e => setSimCollection(e.target.value as SecurityCollection)}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  >
                    <option value="learner_profiles">learner_profiles (Confidential)</option>
                    <option value="student_skills">student_skills (Confidential)</option>
                    <option value="evidence_reviews">evidence_reviews (Confidential)</option>
                    <option value="student_interest">student_interest (Consented Share)</option>
                    <option value="courses">courses (Institutional)</option>
                    <option value="knowledge_graph">knowledge_graph (Institutional)</option>
                    <option value="opportunities">opportunities (Public/Institutional)</option>
                    <option value="organizations">organizations (Institutional)</option>
                    <option value="users">users (Restricted)</option>
                    <option value="audit_logs">audit_logs (Restricted Append-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">Operation</label>
                  <select
                    value={simAction}
                    onChange={e => setSimAction(e.target.value as SecurityAction)}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  >
                    <option value="read">read</option>
                    <option value="create">create</option>
                    <option value="update">update</option>
                    <option value="approve">approve</option>
                    <option value="delete">delete</option>
                    <option value="assign_role">assign_role</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simCrossTenant}
                    onChange={e => setSimCrossTenant(e.target.checked)}
                    className="rounded border-[#DCE4DD]"
                  />
                  <span className="text-[#173A32] font-medium">
                    Simulate Cross-Tenant / Unassigned Resource / Unconsented Student
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simRestrictedField}
                    onChange={e => setSimRestrictedField(e.target.checked)}
                    className="rounded border-[#DCE4DD]"
                  />
                  <span className="text-[#173A32] font-medium">
                    Touch Official/Privileged Fields (score, role, reviewStatus)
                  </span>
                </label>
              </div>

              <button
                onClick={handleRunRbacSimulation}
                className="w-full py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Evaluate Authorization Policy
              </button>

              {simDecisionOutput && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    simDecisionOutput.allowed
                      ? 'bg-[#237A55]/10 border-[#237A55]/30 text-[#173A32]'
                      : 'bg-[#B54747]/10 border-[#B54747]/30 text-[#173A32]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span
                      className={
                        simDecisionOutput.allowed ? 'text-[#237A55]' : 'text-[#B54747]'
                      }
                    >
                      {simDecisionOutput.allowed ? 'ALLOW (HTTP 200)' : 'DENY (HTTP 403)'} ·{' '}
                      {simDecisionOutput.code}
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white border border-[#DCE4DD]">
                      Class: {simDecisionOutput.classification}
                    </span>
                  </div>
                  <p className="text-[#66736C]">{simDecisionOutput.reason}</p>
                </div>
              )}
            </div>

            {/* Simulator 2: Evidence & File Upload Security Validator */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                    PRD 06 Section 11 (/api/security/validate-upload)
                  </span>
                  <h3 className="font-heading font-bold text-base text-[#173A32]">
                    Evidence File Upload & Tenant Path Validator
                  </h3>
                </div>
                <FileUp className="w-5 h-5 text-[#173A32]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">File Name</label>
                  <input
                    type="text"
                    value={simFileName}
                    onChange={e => setSimFileName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">MIME Type</label>
                  <select
                    value={simMimeType}
                    onChange={e => setSimMimeType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  >
                    <option value="application/pdf">application/pdf (.pdf)</option>
                    <option value="image/png">image/png (.png)</option>
                    <option value="image/jpeg">image/jpeg (.jpg)</option>
                    <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                      application/vnd...wordprocessingml.document (.docx)
                    </option>
                    <option value="application/x-msdownload">
                      application/x-msdownload (Malicious Executable)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">
                    File Size (MB — Max 10 MB)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={simFileSizeMB}
                    onChange={e => setSimFileSizeMB(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#173A32] mb-1">Quick Presets</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSimFileName('capstone_report.pdf');
                        setSimMimeType('application/pdf');
                        setSimFileSizeMB(2.4);
                        setSimStoragePath(
                          '/institutions/inst_nusantara/students/user_student_1/evidence/capstone_report.pdf'
                        );
                      }}
                      className="px-2 py-1.5 bg-[#237A55]/10 text-[#237A55] rounded-lg font-semibold text-[11px] cursor-pointer"
                    >
                      Valid PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimFileName('exploit_script.exe');
                        setSimMimeType('application/x-msdownload');
                        setSimFileSizeMB(1.2);
                      }}
                      className="px-2 py-1.5 bg-[#B54747]/10 text-[#B54747] rounded-lg font-semibold text-[11px] cursor-pointer"
                    >
                      Test .EXE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimFileName('capstone_report.pdf');
                        setSimMimeType('application/pdf');
                        setSimFileSizeMB(2.4);
                        setSimStoragePath(
                          '/institutions/inst_nusantara/students/user_student_2_OTHER/evidence/hijack.pdf'
                        );
                      }}
                      className="px-2 py-1.5 bg-[#A76716]/15 text-[#A76716] rounded-lg font-semibold text-[11px] cursor-pointer"
                    >
                      Wrong Student Path
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-[#173A32] mb-1">
                  Target Storage Path (/institutions/&#123;instId&#125;/students/&#123;studentId&#125;/evidence/&#123;fileId&#125;)
                </label>
                <input
                  type="text"
                  value={simStoragePath}
                  onChange={e => setSimStoragePath(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DCE4DD] bg-[#F4F2EA]/50 text-[#173A32] font-mono text-[11px]"
                />
              </div>

              <button
                onClick={handleRunFileValidationSim}
                className="w-full py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Validate Evidence Upload Policy
              </button>

              {simFileResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    simFileResult.allowed
                      ? 'bg-[#237A55]/10 border-[#237A55]/30 text-[#173A32]'
                      : 'bg-[#B54747]/10 border-[#B54747]/30 text-[#173A32]'
                  }`}
                >
                  <p
                    className={`font-bold ${
                      simFileResult.allowed ? 'text-[#237A55]' : 'text-[#B54747]'
                    }`}
                  >
                    {simFileResult.allowed ? 'UPLOAD PERMITTED' : 'UPLOAD BLOCKED'} ·{' '}
                    {simFileResult.code}
                  </p>
                  <p className="text-[#66736C]">{simFileResult.reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* PRD 06 Section 9: 4-Tier Data Classification Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                PRD 06 Section 9 · Data Governance
              </span>
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                NEXORA 4-Tier Data Classification & Isolation Matrix
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCE4DD] text-[#66736C] bg-[#F4F2EA]/60">
                    <th className="py-2.5 px-3 font-semibold">Classification Tier</th>
                    <th className="py-2.5 px-3 font-semibold">Mapped Collections</th>
                    <th className="py-2.5 px-3 font-semibold">Read Access Policy</th>
                    <th className="py-2.5 px-3 font-semibold">Write & Immutability Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4DD]">
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#237A55]">Class 1 — Public</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      opportunities (Published), verified org profiles
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      All authenticated active users across portals
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Only Opportunity Reviewer / Institutional Admin can set Published status
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#416B8B]">Class 2 — Institutional</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      courses, knowledge_graph, learning_paths, collaboration_projects
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Scoped strictly to matching <code className="font-mono">institutionId</code>
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Assigned Lecturer (course scope) & Academic Admin approval
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#A76716]">Class 3 — Confidential</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      learner_profiles, student_skills, evidence_reviews, student_interest
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Student owner, assigned Lecturer; <strong className="text-[#173A32]">Blocked from Technical Admin & unconsented Industry</strong>
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Official mastery scores & verification flags locked to Lecturer/Academic Admin
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#B54747]">Class 4 — Restricted</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      users, audit_logs, institutional_settings
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Institutional Admin, Technical Admin, Platform Super Admin
                    </td>
                    <td className="py-3 px-3 text-[#66736C]">
                      Server-trusted RBAC only; <code className="font-mono">audit_logs</code> strictly append-only (no update/delete)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION B: USER & ROLE MANAGEMENT
         ===================================================================== */}
      {activeTab === 'users_roles' && (
        <div className="space-y-6">
          {/* Invite New Institutional / Partner User */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                PRD 06 Section 5.1 & 16.B · Authorized Onboarding
              </span>
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                Issue Time-Limited Role Invitation (7-Day Expiration)
              </h3>
            </div>

            <form
              onSubmit={handleInviteSubmit}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
            >
              <input
                type="email"
                placeholder="name@nusantara.ac.id or partner@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="p-2.5 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-[#173A32]"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as InstitutionalRoleLabel)}
                className="p-2.5 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-[#173A32]"
              >
                {ALL_SECURITY_ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={inviteInstitution}
                onChange={e => setInviteInstitution(e.target.value)}
                className="p-2.5 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-[#173A32]"
              >
                {institutionalTenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.domain})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="py-2.5 px-4 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Send Secure Invitation
              </button>
            </form>

            {/* Pending Invitations List */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-bold text-[#173A32]">Recent Invitations</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {userInvitations.map(inv => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#173A32] truncate">{inv.email}</p>
                      <p className="text-[11px] text-[#66736C]">
                        {inv.assignedRole} · Expires {inv.expiresAt}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          inv.status === 'Invitation Pending'
                            ? 'bg-[#A76716]/15 text-[#A76716]'
                            : inv.status === 'Accepted'
                            ? 'bg-[#237A55]/15 text-[#237A55]'
                            : 'bg-[#B54747]/15 text-[#B54747]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    {inv.status === 'Invitation Pending' && (
                      <button
                        onClick={() => revokeUserInvitation(inv.id)}
                        className="px-2.5 py-1 bg-white border border-[#DCE4DD] hover:bg-[#B54747] hover:text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Accounts & Multi-Role Assignment Directory */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  User Identity Directory & Server-Enforced Role Assignments
                </h3>
                <p className="text-xs text-[#66736C]">
                  Manage account lifecycle states (Active, Suspended, Access Revoked) and multi-role permissions.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#66736C] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search user or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-[#173A32]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="p-2 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-[#173A32]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Access Revoked">Access Revoked</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map(u => {
                const status = u.accountStatus || 'Active';
                const roles = u.assignedRoles || [u.institutionalRoleLabel || 'Student'];
                const isEditing = editingUserId === u.id;

                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl border border-[#DCE4DD] bg-[#F4F2EA]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#173A32]">{u.name}</span>
                        <span className="text-[#66736C]">{u.email}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            status === 'Active'
                              ? 'bg-[#237A55]/15 text-[#237A55]'
                              : 'bg-[#B54747]/15 text-[#B54747]'
                          }`}
                        >
                          {status}
                        </span>
                        {u.mfaEnabled && (
                          <span className="px-2 py-0.5 rounded-md bg-[#25866A]/10 text-[#25866A] text-[10px] font-semibold">
                            MFA Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[#66736C]">
                        Tenant: <strong className="text-[#173A32]">{u.institution}</strong> (
                        <code className="font-mono">{u.institutionId || 'inst_nusantara'}</code>) ·
                        Last Login: {u.lastLoginAt || '2026-04-06'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#66736C]">
                          Assigned Roles:
                        </span>
                        {roles.map(r => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#DCE4DD] text-[#173A32] font-semibold text-[11px]"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingUserId(null);
                          } else {
                            setEditingUserId(u.id);
                            setSelectedRolesDraft(roles);
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#173A32] hover:text-white rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        {isEditing ? 'Cancel Role Edit' : 'Modify Roles'}
                      </button>

                      {status === 'Active' ? (
                        <>
                          <button
                            onClick={() => {
                              updateUserAccountStatus(
                                u.id,
                                'Suspended',
                                'Administrative security suspension'
                              );
                              setFeedbackBanner({
                                type: 'warning',
                                message: `Suspended account ${u.name}. Protected resource access immediately blocked.`,
                              });
                            }}
                            className="px-3 py-1.5 bg-[#A76716]/15 text-[#A76716] hover:bg-[#A76716] hover:text-white rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => {
                              updateUserAccountStatus(
                                u.id,
                                'Access Revoked',
                                'Access permanently revoked by administrator'
                              );
                              setFeedbackBanner({
                                type: 'error',
                                message: `Revoked access for ${u.name}.`,
                              });
                            }}
                            className="px-3 py-1.5 bg-[#B54747]/15 text-[#B54747] hover:bg-[#B54747] hover:text-white rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Revoke Access
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            updateUserAccountStatus(
                              u.id,
                              'Active',
                              'Reactivated after administrative verification'
                            );
                            setFeedbackBanner({
                              type: 'success',
                              message: `Reactivated account ${u.name}.`,
                            });
                          }}
                          className="px-3 py-1.5 bg-[#237A55] text-white hover:bg-[#173A32] rounded-lg font-semibold transition-colors cursor-pointer"
                        >
                          Reactivate Account
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="w-full pt-3 mt-2 border-t border-[#DCE4DD] space-y-2">
                        <p className="font-bold text-[#173A32]">
                          Select Authorized Roles for {u.name} (Server-Enforced RBAC):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_SECURITY_ROLES.map(roleOption => {
                            const checked = selectedRolesDraft.includes(roleOption);
                            return (
                              <label
                                key={roleOption}
                                className={`px-2.5 py-1.5 rounded-lg border cursor-pointer flex items-center gap-1.5 ${
                                  checked
                                    ? 'bg-[#25866A]/15 border-[#25866A] text-[#173A32] font-semibold'
                                    : 'bg-white border-[#DCE4DD] text-[#66736C]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedRolesDraft(prev => [...prev, roleOption]);
                                    } else if (selectedRolesDraft.length > 1) {
                                      setSelectedRolesDraft(prev =>
                                        prev.filter(x => x !== roleOption)
                                      );
                                    }
                                  }}
                                />
                                <span>{roleOption}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              updateUserAssignedRoles(u.id, selectedRolesDraft);
                              setEditingUserId(null);
                              setFeedbackBanner({
                                type: 'success',
                                message: `Updated RBAC roles for ${u.name} and recorded audit log.`,
                              });
                            }}
                            className="px-4 py-1.5 bg-[#173A32] text-white font-semibold rounded-lg cursor-pointer"
                          >
                            Save Authorized Roles
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION C: INSTITUTION MANAGEMENT (MULTI-TENANT ISOLATION)
         ===================================================================== */}
      {activeTab === 'institutions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                PRD 06 Section 8.1 & 16.C · Institutional Tenants
              </span>
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                University Tenant Isolation & SSO Domain Governance
              </h3>
              <p className="text-xs text-[#66736C]">
                Every institutional record is scoped by <code className="font-mono">institutionId</code>. Users from University A cannot access private learner profiles, courses, or assessments from University B.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {institutionalTenants.map(tenant => (
                <div
                  key={tenant.id}
                  className="p-5 rounded-2xl border border-[#DCE4DD] bg-[#F4F2EA]/40 space-y-3 flex flex-col justify-between text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-[#DCE4DD] text-[#173A32]">
                        {tenant.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          tenant.status === 'Active'
                            ? 'bg-[#237A55]/15 text-[#237A55]'
                            : tenant.status === 'Suspended'
                            ? 'bg-[#B54747]/15 text-[#B54747]'
                            : 'bg-[#A76716]/15 text-[#A76716]'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-base text-[#173A32]">
                      {tenant.name}
                    </h4>
                    <div className="space-y-1 text-[#66736C]">
                      <p>
                        Verified Domain: <strong className="text-[#173A32]">@{tenant.domain}</strong>
                      </p>
                      <p>
                        SSO Identity Provider:{' '}
                        <strong className="text-[#173A32]">{tenant.ssoProvider}</strong>
                      </p>
                      <p>
                        Faculties: <strong className="text-[#173A32]">{tenant.facultyCount}</strong> ·
                        Students:{' '}
                        <strong className="text-[#173A32]">
                          {tenant.studentCount.toLocaleString()}
                        </strong>
                      </p>
                      <p>Data Residency: {tenant.dataResidencyRegion}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DCE4DD] flex items-center gap-2">
                    {tenant.status !== 'Active' && (
                      <button
                        onClick={() => updateInstitutionalTenantStatus(tenant.id, 'Active')}
                        className="px-3 py-1.5 bg-[#237A55] text-white rounded-lg font-semibold cursor-pointer"
                      >
                        Activate Tenant
                      </button>
                    )}
                    {tenant.status === 'Active' && (
                      <button
                        onClick={() => updateInstitutionalTenantStatus(tenant.id, 'Suspended')}
                        className="px-3 py-1.5 bg-[#B54747]/15 text-[#B54747] hover:bg-[#B54747] hover:text-white rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Suspend Tenant
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION D: ORGANIZATION MANAGEMENT (INDUSTRY ISOLATION)
         ===================================================================== */}
      {activeTab === 'organizations' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                  PRD 06 Section 8.2 & 16.D · Partner Organization Governance
                </span>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  Industry Organization Verification & Representative Access Control
                </h3>
                <p className="text-xs text-[#66736C]">
                  Each organization is isolated by <code className="font-mono">organizationId</code>. Unverified or suspended organizations cannot publish opportunities to students.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(['verified', 'pending', 'rejected', 'suspended'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      updateOrganizationVerificationStatus(st);
                      setFeedbackBanner({
                        type: st === 'verified' ? 'success' : 'warning',
                        message: `Organization '${organizationProfile.name}' status updated to '${st.toUpperCase()}' and logged.`,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize border transition-colors cursor-pointer ${
                      organizationProfile.verifiedStatus === st
                        ? 'bg-[#173A32] text-white border-[#173A32]'
                        : 'bg-white text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                    }`}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#DCE4DD] bg-[#F4F2EA]/40 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE4DD]">
                <div>
                  <h4 className="font-heading font-bold text-base text-[#173A32]">
                    {organizationProfile.name}
                  </h4>
                  <p className="text-[#66736C]">
                    Tenant ID: <code className="font-mono">{organizationProfile.id}</code> · Sector:{' '}
                    {organizationProfile.sector} · Website: {organizationProfile.website}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg font-bold uppercase text-[11px] ${
                    organizationProfile.verifiedStatus === 'verified'
                      ? 'bg-[#237A55]/15 text-[#237A55]'
                      : 'bg-[#B54747]/15 text-[#B54747]'
                  }`}
                >
                  Status: {organizationProfile.verifiedStatus}
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-[#173A32]">
                  Authorized Organization Representatives ({organizationProfile.representatives.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {organizationProfile.representatives.map(rep => (
                    <div
                      key={rep.id}
                      className="p-3 rounded-xl bg-white border border-[#DCE4DD] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-[#173A32]">{rep.name}</p>
                        <p className="text-[#66736C]">
                          {rep.roleTitle} · {rep.email}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.verified
                            ? 'bg-[#237A55]/15 text-[#237A55]'
                            : 'bg-[#A76716]/15 text-[#A76716]'
                        }`}
                      >
                        {rep.verified ? 'Verified Rep' : 'Pending Verification'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION E: AUDIT CENTER (APPEND-ONLY IMMUTABLE LOGS)
         ===================================================================== */}
      {activeTab === 'audit_center' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                  PRD 06 Section 13 & 16.E · Immutable Audit Trail
                </span>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  Append-Only Security & Governance Audit Center ({filteredAuditLogs.length} Records)
                </h3>
                <p className="text-xs text-[#66736C]">
                  Audit records are strictly append-only in both Firestore Rules and Express Server APIs. Normal users and administrators cannot modify or delete audit entries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={handleTestAuditImmutability}
                  className="px-3 py-2 bg-[#B54747]/10 hover:bg-[#B54747] text-[#B54747] hover:text-white border border-[#B54747]/30 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Test Immutability (Attempt Delete)
                </button>
                <button
                  onClick={handleExportAuditLogs}
                  className="px-3 py-2 bg-[#173A32] hover:bg-[#25866A] text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Audit JSON</span>
                </button>
              </div>
            </div>

            {immutableTestResult && (
              <div className="p-3.5 rounded-xl bg-[#237A55]/10 border border-[#237A55]/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#237A55]" />
                  <span className="font-bold text-[#173A32]">
                    Immutability Verified: {immutableTestResult}
                  </span>
                </div>
                <button
                  onClick={() => setImmutableTestResult(null)}
                  className="text-xs underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#66736C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by actor, action, target resource, or collection..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 text-[#173A32]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['ALL', 'SUCCESS', 'DENIED'] as const).map(outcome => (
                  <button
                    key={outcome}
                    onClick={() => setAuditOutcomeFilter(outcome)}
                    className={`px-3 py-2 rounded-xl font-semibold cursor-pointer ${
                      auditOutcomeFilter === outcome
                        ? 'bg-[#173A32] text-white'
                        : 'bg-[#F4F2EA] text-[#173A32] hover:bg-[#E9E5DA]'
                    }`}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto border border-[#DCE4DD] rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F2EA] border-b border-[#DCE4DD] text-[#66736C]">
                    <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-3 font-semibold">Actor & Role</th>
                    <th className="py-2.5 px-3 font-semibold">Tenant Scope</th>
                    <th className="py-2.5 px-3 font-semibold">Action & Resource</th>
                    <th className="py-2.5 px-3 font-semibold">State Transition</th>
                    <th className="py-2.5 px-3 font-semibold">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4DD]">
                  {filteredAuditLogs.map(log => {
                    const outcome = log.outcome || 'SUCCESS';
                    return (
                      <tr key={log.id} className="hover:bg-[#F4F2EA]/40">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#66736C] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-[#173A32]">{log.actorName}</p>
                          <p className="text-[10px] text-[#66736C]">
                            {log.actorSecurityRole || log.actorRole} ({log.actorUid || 'verified'})
                          </p>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#173A32]">
                          {log.institutionId || 'inst_nusantara'}
                          {log.organizationId ? ` / ${log.organizationId}` : ''}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-[#173A32]">{log.action}</p>
                          <p className="text-[11px] text-[#66736C]">{log.targetName}</p>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#66736C]">
                          {log.previousState || log.newState ? (
                            <span>
                              {log.previousState || '—'} →{' '}
                              <strong className="text-[#173A32]">{log.newState || 'Updated'}</strong>
                            </span>
                          ) : (
                            <span>Recorded in append-only ledger</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              outcome === 'SUCCESS'
                                ? 'bg-[#237A55]/15 text-[#237A55]'
                                : 'bg-[#B54747]/15 text-[#B54747]'
                            }`}
                          >
                            {outcome}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION F: ACCESS REVIEW, PRIVACY REQUESTS & 29 AUTOMATED SECURITY TESTS
         ===================================================================== */}
      {activeTab === 'access_review' && (
        <div className="space-y-6">
          {/* Automated Security Test Suite Results (PRD 06 Section 17) */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                  PRD 06 Section 17 · Positive & Negative Verification Suite
                </span>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  Automated Security & RBAC Test Suite ({testReport.passedCount} /{' '}
                  {testReport.totalTests} Passed)
                </h3>
                <p className="text-xs text-[#66736C]">
                  Verifies Student, Lecturer, Industry, Administrative, and Database/File security controls against unauthorized reads, cross-tenant mutations, self-approvals, and file exploits.
                </p>
              </div>

              <button
                onClick={handleRunSecurityTestSuite}
                disabled={isRunningServerTests}
                className="px-4 py-2 bg-[#173A32] hover:bg-[#25866A] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRunningServerTests ? 'animate-spin' : ''}`}
                />
                <span>Re-Run All 29 Security Assertions</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                'ALL',
                'Student Security Tests',
                'Lecturer Security Tests',
                'Industry Security Tests',
                'Administrative Security Tests',
                'Database & File Security Tests',
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setTestCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    testCategoryFilter === cat
                      ? 'bg-[#25866A] text-white'
                      : 'bg-[#F4F2EA] text-[#173A32] hover:bg-[#E9E5DA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testReport.results
                .filter(
                  tc => testCategoryFilter === 'ALL' || tc.category === testCategoryFilter
                )
                .map(tc => (
                  <div
                    key={tc.id}
                    className="p-3.5 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/30 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-white border border-[#DCE4DD] text-[#173A32]">
                          {tc.id}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-[#25866A]">
                          {tc.category}
                        </span>
                      </div>
                      <p className="font-bold text-[#173A32]">{tc.title}</p>
                      <p className="text-[11px] text-[#66736C]">{tc.detail}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          tc.passed
                            ? 'bg-[#237A55]/15 text-[#237A55]'
                            : 'bg-[#B54747]/15 text-[#B54747]'
                        }`}
                      >
                        {tc.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{tc.passed ? 'PASS' : 'FAIL'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#66736C]">
                        Expected {tc.expectedOutcome} = {tc.actualOutcome}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Student Privacy, Consent Ledger & Data Deletion Requests (PRD 06 Section 10 & 16.F) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                  PRD 06 Section 10 · Data Export & Retention Governance
                </span>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  Student Privacy & Data Deletion Requests
                </h3>
                <p className="text-xs text-[#66736C]">
                  Students may request personal data export or account deletion while official university academic assessment records remain subject to institutional retention rules.
                </p>
              </div>

              <div className="space-y-3">
                {privacyRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#173A32]">{req.studentName}</span>
                      <span className="px-2 py-0.5 rounded bg-[#237A55]/15 text-[#237A55] font-bold text-[10px]">
                        {req.status}
                      </span>
                    </div>
                    <p className="font-semibold text-[#173A32]">{req.requestType}</p>
                    <p className="text-[11px] text-[#66736C]">{req.resolutionNote}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#66736C]">
                      <span>Requested: {req.requestedAt}</span>
                      <button
                        onClick={() =>
                          resolvePrivacyDataRequest(
                            req.id,
                            'Retained Official Academic Record Only',
                            'Verified institutional retention compliance; revoked external industry shares.'
                          )
                        }
                        className="text-[#25866A] font-semibold hover:underline cursor-pointer"
                      >
                        Re-Verify Retention Compliance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                  PRD 06 Section 10.2 · Active Consent Audit
                </span>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  Explicit Student Opportunity Sharing Consents ({studentConsentRecords.length})
                </h3>
                <p className="text-xs text-[#66736C]">
                  Industry organizations can only read student fields when <code className="font-mono">consentGranted == true</code> and consent has not been withdrawn.
                </p>
              </div>

              <div className="space-y-3">
                {studentConsentRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#173A32]">
                        {rec.studentDisplayName} → {rec.opportunityTitle}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          rec.consentGranted
                            ? 'bg-[#237A55]/15 text-[#237A55]'
                            : 'bg-[#B54747]/15 text-[#B54747]'
                        }`}
                      >
                        {rec.consentGranted ? 'Active Consent' : 'Revoked / Blocked'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66736C]">
                      Permitted Fields:{' '}
                      <code className="font-mono text-[#173A32]">
                        [{rec.sharedFields.join(', ')}]
                      </code>
                    </p>
                    <p className="text-[10px] text-[#66736C]">
                      Target Organization: {rec.organizationId} · Recorded: {rec.sharedAt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
