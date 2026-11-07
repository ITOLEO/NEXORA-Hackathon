import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  LearnerContextService,
  executeFullRecommendationRun,
  RecommendationFeedbackRecord,
  RecommendationFeedbackType,
} from '../recommendation/recommendationEngine';
import {
  User,
  UserRole,
  InstitutionalRoleLabel,
  LearnerProfile,
  StudentSkill,
  LearningPathModule,
  Opportunity,
  OpportunityPublicationStatus,
  SkillEvidence,
  EvidenceStatus,
  StudentGoal,
  NotificationItem,
  CrossPortalEventType,
  MasteryLevel,
  EvidenceProvenanceType,
  Course,
  GraphNode,
  GraphEdge,
  GraphEdgeRelationship,
  FlexibleLearningGroup,
  AssessmentRubric,
  EnrolledStudentSummary,
  MappingApprovalRecord,
  MicroSkill,
  OrganizationProfile,
  OrganizationRepresentative,
  FlaggedCompetencyProposal,
  RequirementTier,
  CollaborationProject,
  StudentConsentShareRecord,
  AuditLogEntry,
  AccountStatus,
  InstitutionalTenant,
  UserInvitationRecord,
  PrivacyDataRequest,
} from '../types/nexora';
import {
  INITIAL_USERS,
  INITIAL_LEARNER_PROFILE,
  INITIAL_STUDENT_SKILLS,
  INITIAL_LEARNING_PATHWAYS,
  INITIAL_OPPORTUNITIES,
  INITIAL_EVIDENCE,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COURSES,
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
  INITIAL_LEARNING_GROUPS,
  INITIAL_RUBRICS,
  INITIAL_ENROLLED_STUDENTS,
  INITIAL_MAPPING_APPROVALS,
  INITIAL_MICRO_SKILLS,
  INITIAL_ORGANIZATION_PROFILE,
  INITIAL_FLAGGED_COMPETENCIES,
  INITIAL_COLLABORATION_PROJECTS,
  INITIAL_STUDENT_CONSENT_RECORDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INSTITUTIONAL_TENANTS,
  INITIAL_USER_INVITATIONS,
  INITIAL_PRIVACY_REQUESTS,
  DEMO_IMAGE_TECHCORP,
} from '../services/demoData';

interface NexoraContextType {
  currentUser: User;
  activeSubRole: InstitutionalRoleLabel;
  allUsers: User[];
  profile: LearnerProfile;
  studentSkills: Record<string, StudentSkill>;
  pathways: LearningPathModule[];
  opportunities: Opportunity[];
  evidenceList: SkillEvidence[];
  goals: StudentGoal[];
  notifications: NotificationItem[];

  // PRD 02 Lecturer Collections
  courses: Course[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  learningGroups: FlexibleLearningGroup[];
  rubrics: AssessmentRubric[];
  enrolledStudents: EnrolledStudentSummary[];
  mappingApprovals: MappingApprovalRecord[];
  microSkills: MicroSkill[];

  // PRD 03 Industry Collections
  organizationProfile: OrganizationProfile;
  flaggedCompetencies: FlaggedCompetencyProposal[];
  collaborationProjects: CollaborationProject[];
  studentConsentRecords: StudentConsentShareRecord[];
  auditLogs: AuditLogEntry[];

  // PRD 06 Security & RBAC Collections
  institutionalTenants: InstitutionalTenant[];
  userInvitations: UserInvitationRecord[];
  privacyRequests: PrivacyDataRequest[];

  // PRD 07 Recommendation Intelligence Engine State & Actions
  recommendationBundle: ReturnType<typeof executeFullRecommendationRun>;
  recommendationFeedback: RecommendationFeedbackRecord[];
  lecturerOverrides: Record<string, string>;
  submitRecommendationFeedback: (
    recommendationId: string,
    targetEntityId: string,
    feedbackType: RecommendationFeedbackType,
    reason?: string
  ) => void;
  overrideLecturerRecommendation: (targetId: string, reason: string) => void;

  // Student & Shared Actions
  switchUserRole: (role: UserRole, subRoleLabel?: InstitutionalRoleLabel) => void;
  switchUserAccount: (userId: string, subRoleLabel?: InstitutionalRoleLabel) => void;
  updateUserAccountStatus: (userId: string, newStatus: AccountStatus, reason?: string) => void;
  updateUserAssignedRoles: (userId: string, roles: InstitutionalRoleLabel[]) => void;
  createUserInvitation: (
    email: string,
    roleLabel: InstitutionalRoleLabel,
    institutionId: string,
    organizationId?: string
  ) => void;
  revokeUserInvitation: (invId: string) => void;
  updateInstitutionalTenantStatus: (
    tenantId: string,
    status: 'Active' | 'Suspended' | 'Onboarding'
  ) => void;
  resolvePrivacyDataRequest: (
    reqId: string,
    status: PrivacyDataRequest['status'],
    note: string
  ) => void;
  recordSecurityAuditEvent: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  updateProfile: (updated: Partial<LearnerProfile>) => void;
  updateSkillScore: (
    skillId: string,
    deltaScore: number,
    newMastery?: MasteryLevel,
    provenance?: EvidenceProvenanceType,
    validatorName?: string
  ) => void;
  updateSelfReportedSkill: (skillId: string, confidenceStars: number) => void;
  completeActivity: (pathId: string, activityId: string) => void;
  toggleSaveOpportunity: (oppId: string) => void;
  expressInterestInOpportunity: (
    oppId: string,
    sharedFields?: ('program_semester' | 'verified_skills' | 'approved_portfolio_links' | 'career_goal')[]
  ) => void;
  withdrawStudentConsent: (oppId: string) => void;
  recordExternalApplicationClick: (oppId: string) => void;
  submitEvidence: (
    newEv: Omit<SkillEvidence, 'id' | 'submittedAt' | 'status' | 'isDemo'>,
    initialStatus?: 'pending' | 'draft'
  ) => void;
  submitDraftEvidenceForReview: (evidenceId: string) => void;
  addGoal: (newGoal: Omit<StudentGoal, 'id'>) => void;
  updateGoal: (id: string, updated: Partial<StudentGoal>) => void;
  deleteGoal: (id: string) => void;
  togglePauseGoal: (id: string) => void;
  prioritizeGoal: (id: string, priorityWeight: number) => void;
  markNotificationRead: (id: string) => void;
  resetToDemoData: () => void;

  // Lecturer & Institutional Admin Actions
  addCourseOutcome: (courseId: string, text: string, skillIds: string[], cplCode?: string) => void;
  addMicroSkill: (newSkill: Omit<MicroSkill, 'id'>) => void;
  addGraphNode: (node: Omit<GraphNode, 'id'>) => void;
  editGraphNode: (id: string, updated: Partial<GraphNode>) => void;
  addGraphEdge: (source: string, target: string, relationship: GraphEdgeRelationship) => { success: boolean; message?: string };
  removeGraphEdge: (edgeId: string) => void;
  updateLearningGroup: (groupId: string, updated: Partial<FlexibleLearningGroup>) => void;
  createLearningGroup: (newGrp: Omit<FlexibleLearningGroup, 'id' | 'createdDate'>) => void;
  publishLearningActivity: (
    pathId: string,
    title: string,
    type: 'Quiz' | 'Practical Task' | 'Project Submission' | 'Peer Review',
    dueDate: string,
    assignedGroupId?: string
  ) => void;
  reviewEvidence: (
    evidenceId: string,
    status: 'approved' | 'revision_requested' | 'rejected',
    feedback: string
  ) => void;
  reviewOpportunity: (oppId: string, status: 'approved' | 'rejected' | 'needs_correction', feedback: string) => void;
  approveMappingOutcome: (approvalId: string) => void;
  approveCollaborationProject: (projectId: string) => void;
  resolveFlaggedCompetency: (
    flagId: string,
    resolutionStatus: 'Mapped to Existing Taxonomy' | 'Approved by Curriculum Board'
  ) => void;
  updateOrganizationVerificationStatus: (
    status: 'verified' | 'pending' | 'unverified' | 'rejected' | 'suspended'
  ) => void;

  // Industry Actions
  updateOrganizationProfile: (updated: Partial<OrganizationProfile>) => void;
  addOrganizationRepresentative: (rep: Omit<OrganizationRepresentative, 'id' | 'verified'>) => void;
  saveOrSubmitOpportunity: (
    oppData: Partial<Opportunity> & { title: string; category: Opportunity['category']; officialUrl: string; deadline: string; eligibility: string; requiredSkillIds: string[] },
    targetStatus: 'Draft' | 'Submitted for Review',
    existingId?: string
  ) => Opportunity;
  publishApprovedOpportunity: (oppId: string) => void;
  archiveOpportunity: (oppId: string) => void;
  deleteDraftOpportunity: (oppId: string) => void;
  flagMissingCompetency: (plainLanguageRequirement: string, suggestedClusterId: string, tier: RequirementTier) => void;
  createCollaborationProject: (
    proj: Omit<CollaborationProject, 'id' | 'organizationId' | 'organizationName' | 'status' | 'submittedAt' | 'isDemo' | 'milestones'> & { milestoneTitles: string[] }
  ) => void;
  toggleProjectMilestone: (projectId: string, milestoneId: string) => void;
}

const STORAGE_KEY = 'nexora_app_state_v4';

const NexoraContext = createContext<NexoraContextType | undefined>(undefined);

export const NexoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [managedUsers, setManagedUsers] = useState<User[]>(INITIAL_USERS);
  const [activeSubRole, setActiveSubRole] = useState<InstitutionalRoleLabel>('Student');
  const [profile, setProfile] = useState<LearnerProfile>(INITIAL_LEARNER_PROFILE);
  const [studentSkills, setStudentSkills] = useState<Record<string, StudentSkill>>(INITIAL_STUDENT_SKILLS);
  const [pathways, setPathways] = useState<LearningPathModule[]>(INITIAL_LEARNING_PATHWAYS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [evidenceList, setEvidenceList] = useState<SkillEvidence[]>(INITIAL_EVIDENCE);
  const [goals, setGoals] = useState<StudentGoal[]>(INITIAL_GOALS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // PRD 02 Lecturer Collections
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(INITIAL_GRAPH_NODES);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(INITIAL_GRAPH_EDGES);
  const [learningGroups, setLearningGroups] = useState<FlexibleLearningGroup[]>(INITIAL_LEARNING_GROUPS);
  const [rubrics, setRubrics] = useState<AssessmentRubric[]>(INITIAL_RUBRICS);
  const [enrolledStudents] = useState<EnrolledStudentSummary[]>(INITIAL_ENROLLED_STUDENTS);
  const [mappingApprovals, setMappingApprovals] = useState<MappingApprovalRecord[]>(INITIAL_MAPPING_APPROVALS);
  const [microSkills, setMicroSkills] = useState<MicroSkill[]>(INITIAL_MICRO_SKILLS);

  // PRD 03 Industry Collections
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile>(INITIAL_ORGANIZATION_PROFILE);
  const [flaggedCompetencies, setFlaggedCompetencies] = useState<FlaggedCompetencyProposal[]>(INITIAL_FLAGGED_COMPETENCIES);
  const [collaborationProjects, setCollaborationProjects] = useState<CollaborationProject[]>(INITIAL_COLLABORATION_PROJECTS);
  const [studentConsentRecords, setStudentConsentRecords] = useState<StudentConsentShareRecord[]>(INITIAL_STUDENT_CONSENT_RECORDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // PRD 06 Security & RBAC Collections
  const [institutionalTenants, setInstitutionalTenants] = useState<InstitutionalTenant[]>(
    INITIAL_INSTITUTIONAL_TENANTS
  );
  const [userInvitations, setUserInvitations] = useState<UserInvitationRecord[]>(
    INITIAL_USER_INVITATIONS
  );
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyDataRequest[]>(
    INITIAL_PRIVACY_REQUESTS
  );

  // PRD 07 Recommendation Feedback & Lecturer Override State
  const [recommendationFeedback, setRecommendationFeedback] = useState<
    RecommendationFeedbackRecord[]
  >([]);
  const [lecturerOverrides, setLecturerOverrides] = useState<Record<string, string>>({
    skill_cna:
      'Dr. Ahmad Hidayat: Focus on container fundamentals lab before attempting multi-cluster Kubernetes orchestration.',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('nexora_app_state_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.studentSkills) setStudentSkills(parsed.studentSkills);
        if (parsed.pathways) setPathways(parsed.pathways);
        if (parsed.opportunities) setOpportunities(parsed.opportunities);
        if (parsed.evidenceList) setEvidenceList(parsed.evidenceList);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.graphNodes) setGraphNodes(parsed.graphNodes);
        if (parsed.graphEdges) setGraphEdges(parsed.graphEdges);
        if (parsed.learningGroups) setLearningGroups(parsed.learningGroups);
        if (parsed.mappingApprovals) setMappingApprovals(parsed.mappingApprovals);
        if (parsed.microSkills) setMicroSkills(parsed.microSkills);
        if (parsed.organizationProfile) setOrganizationProfile(parsed.organizationProfile);
        if (parsed.flaggedCompetencies) setFlaggedCompetencies(parsed.flaggedCompetencies);
        if (parsed.collaborationProjects) setCollaborationProjects(parsed.collaborationProjects);
        if (parsed.studentConsentRecords) setStudentConsentRecords(parsed.studentConsentRecords);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.managedUsers) setManagedUsers(parsed.managedUsers);
        if (parsed.institutionalTenants) setInstitutionalTenants(parsed.institutionalTenants);
        if (parsed.userInvitations) setUserInvitations(parsed.userInvitations);
        if (parsed.privacyRequests) setPrivacyRequests(parsed.privacyRequests);
        if (parsed.recommendationFeedback) setRecommendationFeedback(parsed.recommendationFeedback);
        if (parsed.lecturerOverrides) setLecturerOverrides(parsed.lecturerOverrides);
        if (parsed.activeSubRole) setActiveSubRole(parsed.activeSubRole);
        if (parsed.currentUserId) {
          const pool: User[] = parsed.managedUsers || INITIAL_USERS;
          const u = pool.find(x => x.id === parsed.currentUserId);
          if (u) setCurrentUser(u);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved nexora state', e);
    }
  }, []);

  const saveStateToStorage = (newState: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  };

  const currentPayload = {
    currentUserId: currentUser.id,
    activeSubRole,
    profile,
    studentSkills,
    pathways,
    opportunities,
    evidenceList,
    goals,
    notifications,
    courses,
    graphNodes,
    graphEdges,
    learningGroups,
    mappingApprovals,
    microSkills,
    organizationProfile,
    flaggedCompetencies,
    collaborationProjects,
    studentConsentRecords,
    auditLogs,
    managedUsers,
    institutionalTenants,
    userInvitations,
    privacyRequests,
    recommendationFeedback,
    lecturerOverrides,
  };

  const appendAuditLog = (
    action: string,
    targetName: string,
    eventType?: CrossPortalEventType,
    extra?: Partial<AuditLogEntry>
  ) => {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorUid: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorSecurityRole: activeSubRole,
      institutionId: currentUser.institutionId || 'inst_nusantara',
      organizationId: currentUser.organizationId,
      action,
      targetName,
      outcome: 'SUCCESS',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventType,
      ...extra,
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const recordSecurityAuditEvent = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit_sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Deduplicated Cross-Portal Notification Dispatcher (PRD 04 Section 7)
  const dispatchCrossPortalNotification = (params: {
    title: string;
    message: string;
    type: NotificationItem['type'];
    eventType: CrossPortalEventType;
    recipientRole: UserRole | 'all';
    relatedRecordId: string;
    navigationTarget: string;
    dedupeKey: string;
  }) => {
    // Also dispatch to server-side event engine (/api/events) with dedupeKey guard
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).catch(() => {
      // Non-blocking fallback when offline
    });

    setNotifications(prev => {
      // Prevent duplicate unread notifications with the same dedupeKey
      if (prev.some(n => n.dedupeKey === params.dedupeKey && !n.read)) {
        return prev;
      }
      const item: NotificationItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: params.title,
        message: params.message,
        timestamp: 'Just now',
        read: false,
        type: params.type,
        eventType: params.eventType,
        recipientRole: params.recipientRole,
        relatedRecordId: params.relatedRecordId,
        navigationTarget: params.navigationTarget,
        dedupeKey: params.dedupeKey,
      };
      const next = [item, ...prev];
      saveStateToStorage({ ...currentPayload, notifications: next });
      return next;
    });
  };

  // Compute match score & explanation dynamically from shared student learner profile & microSkills
  const computeOpportunityMatchWithSkills = (
    requiredSkillIds: string[],
    relevantSkillIds: string[],
    eligibilityText: string,
    skillsMap: Record<string, StudentSkill>
  ) => {
    const allTargetIds = Array.from(new Set([...requiredSkillIds, ...relevantSkillIds]));
    const evidenced: string[] = [];
    const gaps: string[] = [];

    allTargetIds.forEach(skId => {
      const skMeta = microSkills.find(m => m.id === skId);
      const stRecord = skillsMap[skId];
      const label = skMeta ? skMeta.name : skId;
      if (stRecord && (stRecord.masteryLevel === 'mastered' || stRecord.score >= 70)) {
        evidenced.push(
          `${label} (${stRecord.verifiedByLecturer ? 'Lecturer Verified' : stRecord.provenance || 'Evidenced'}: ${stRecord.score}%)`
        );
      } else {
        gaps.push(
          `${label} (${stRecord && stRecord.score > 0 ? `Developing: ${stRecord.score}%` : 'Not assessed / Missing evidence'})`
        );
      }
    });

    const ratio = allTargetIds.length > 0 ? evidenced.length / allTargetIds.length : 0.8;
    const matchPercentage = Math.min(98, Math.max(65, Math.round(68 + ratio * 28)));

    return {
      matchPercentage,
      matchExplanation: {
        relevanceSummary: `Matched via NEXORA Shared Competency Graph against your ${profile.programName} curriculum and verified skill evidence.`,
        matchingInterests: profile.interests.slice(0, 3),
        evidencedSkills: evidenced.length > 0 ? evidenced : ['Python Data Science Stack (Score 96%)'],
        gapSkills: gaps,
        eligibilityMet: true,
        eligibilityNotes: `Mandatory academic eligibility verified (${eligibilityText}). Optional/recommended skill gaps do not disqualify application.`,
      },
    };
  };

  // Recalculate all opportunities when student skills update (EVENT 1 / Diagnostic Assessment)
  const recalculateAllOpportunitiesForSkills = (updatedSkills: Record<string, StudentSkill>) => {
    setOpportunities(prev => {
      const next = prev.map(opp => {
        const computed = computeOpportunityMatchWithSkills(
          opp.requiredSkillIds,
          opp.relevantSkillIds,
          opp.eligibility,
          updatedSkills
        );
        return {
          ...opp,
          matchPercentage: computed.matchPercentage,
          matchExplanation: computed.matchExplanation,
        };
      });
      saveStateToStorage({ ...currentPayload, studentSkills: updatedSkills, opportunities: next });
      return next;
    });
  };

  const switchUserRole = (role: UserRole, subRoleLabel?: InstitutionalRoleLabel) => {
    let target = managedUsers.find(u => u.role === role && u.accountStatus === 'Active') || managedUsers[0];
    if (
      subRoleLabel === 'Technical Administrator' ||
      subRoleLabel === 'Platform Super Administrator'
    ) {
      target =
        managedUsers.find(u => u.id === 'user_tech_admin_1') ||
        managedUsers.find(u => u.role === 'lecturer') ||
        target;
    }
    setCurrentUser(target);
    const resolvedSubRole: InstitutionalRoleLabel =
      subRoleLabel ||
      (role === 'student'
        ? 'Student'
        : role === 'lecturer'
        ? 'Lecturer'
        : 'Industry Partner');
    setActiveSubRole(resolvedSubRole);
    saveStateToStorage({ ...currentPayload, currentUserId: target.id, activeSubRole: resolvedSubRole });
  };

  const switchUserAccount = (userId: string, subRoleLabel?: InstitutionalRoleLabel) => {
    const target = managedUsers.find(u => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    const resolvedSubRole: InstitutionalRoleLabel =
      subRoleLabel ||
      target.institutionalRoleLabel ||
      (target.role === 'student'
        ? 'Student'
        : target.role === 'lecturer'
        ? 'Lecturer'
        : 'Industry Partner');
    setActiveSubRole(resolvedSubRole);
    saveStateToStorage({ ...currentPayload, currentUserId: target.id, activeSubRole: resolvedSubRole });
  };

  const updateUserAccountStatus = (userId: string, newStatus: AccountStatus, reason = '') => {
    const targetUser = managedUsers.find(u => u.id === userId);
    const prevStatus = targetUser?.accountStatus || 'Active';
    setManagedUsers(prev => {
      const next = prev.map(u => (u.id === userId ? { ...u, accountStatus: newStatus } : u));
      if (currentUser.id === userId) {
        setCurrentUser(c => ({ ...c, accountStatus: newStatus }));
      }
      saveStateToStorage({ ...currentPayload, managedUsers: next });
      return next;
    });
    appendAuditLog(
      `Updated Account Status to '${newStatus}'${reason ? ` (${reason})` : ''}`,
      `${targetUser?.name || userId} (${targetUser?.email || ''})`,
      'SYSTEM',
      {
        resourceType: 'users',
        resourceId: userId,
        previousState: prevStatus,
        newState: newStatus,
        classification: 'Restricted',
      }
    );
  };

  const updateUserAssignedRoles = (userId: string, roles: InstitutionalRoleLabel[]) => {
    const targetUser = managedUsers.find(u => u.id === userId);
    const prevRoles = (targetUser?.assignedRoles || [targetUser?.institutionalRoleLabel || 'Student']).join(', ');
    setManagedUsers(prev => {
      const next = prev.map(u =>
        u.id === userId
          ? {
              ...u,
              assignedRoles: roles,
              institutionalRoleLabel: roles[0] || u.institutionalRoleLabel,
              isProgramAdmin: roles.includes('Academic Administrator'),
              isOpportunityReviewer: roles.includes('Authorized Opportunity Reviewer'),
              isInstitutionalAdmin: roles.includes('Institutional Administrator'),
              isTechnicalAdmin: roles.includes('Technical Administrator'),
              isSuperAdmin: roles.includes('Platform Super Administrator'),
            }
          : u
      );
      if (currentUser.id === userId) {
        setCurrentUser(c => ({
          ...c,
          assignedRoles: roles,
          institutionalRoleLabel: roles[0] || c.institutionalRoleLabel,
        }));
      }
      saveStateToStorage({ ...currentPayload, managedUsers: next });
      return next;
    });
    appendAuditLog(
      'Modified Authorized RBAC Role Assignments',
      `${targetUser?.name || userId}`,
      'SYSTEM',
      {
        resourceType: 'users',
        resourceId: userId,
        previousState: `[${prevRoles}]`,
        newState: `[${roles.join(', ')}]`,
        classification: 'Restricted',
      }
    );
  };

  const createUserInvitation = (
    email: string,
    roleLabel: InstitutionalRoleLabel,
    institutionId: string,
    organizationId?: string
  ) => {
    const inv: UserInvitationRecord = {
      id: `inv_${Date.now()}`,
      email: email.trim().toLowerCase(),
      assignedRole: roleLabel,
      institutionId,
      organizationId,
      invitedBy: currentUser.name,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Invitation Pending',
    };
    setUserInvitations(prev => {
      const next = [inv, ...prev];
      saveStateToStorage({ ...currentPayload, userInvitations: next });
      return next;
    });
    appendAuditLog(
      `Issued Time-Limited Institutional Invitation (${roleLabel})`,
      inv.email,
      'SYSTEM',
      {
        resourceType: 'users',
        resourceId: inv.id,
        previousState: 'Uninvited',
        newState: `Invitation Pending (Expires ${inv.expiresAt})`,
        classification: 'Restricted',
      }
    );
  };

  const revokeUserInvitation = (invId: string) => {
    const target = userInvitations.find(i => i.id === invId);
    setUserInvitations(prev => {
      const next = prev.map(i => (i.id === invId ? { ...i, status: 'Revoked' as const } : i));
      saveStateToStorage({ ...currentPayload, userInvitations: next });
      return next;
    });
    appendAuditLog('Revoked Pending User Invitation', target?.email || invId, 'SYSTEM', {
      resourceType: 'users',
      resourceId: invId,
      previousState: target?.status || 'Invitation Pending',
      newState: 'Revoked',
      classification: 'Restricted',
    });
  };

  const updateInstitutionalTenantStatus = (
    tenantId: string,
    status: 'Active' | 'Suspended' | 'Onboarding'
  ) => {
    const target = institutionalTenants.find(t => t.id === tenantId);
    setInstitutionalTenants(prev => {
      const next = prev.map(t => (t.id === tenantId ? { ...t, status } : t));
      saveStateToStorage({ ...currentPayload, institutionalTenants: next });
      return next;
    });
    appendAuditLog(
      `Updated Institutional Tenant Status to '${status}'`,
      target?.name || tenantId,
      'SYSTEM',
      {
        resourceType: 'institutions',
        resourceId: tenantId,
        previousState: target?.status || 'Active',
        newState: status,
        classification: 'Restricted',
      }
    );
  };

  const resolvePrivacyDataRequest = (
    reqId: string,
    status: PrivacyDataRequest['status'],
    note: string
  ) => {
    const target = privacyRequests.find(r => r.id === reqId);
    setPrivacyRequests(prev => {
      const next = prev.map(r =>
        r.id === reqId ? { ...r, status, resolutionNote: note } : r
      );
      saveStateToStorage({ ...currentPayload, privacyRequests: next });
      return next;
    });
    appendAuditLog(
      `Processed Student Privacy Request (${status})`,
      `${target?.studentName || reqId}: ${target?.requestType || ''}`,
      'SYSTEM',
      {
        resourceType: 'learner_profiles',
        resourceId: reqId,
        previousState: target?.status || 'Pending Review',
        newState: status,
        classification: 'Confidential',
      }
    );
  };

  const updateProfile = (updated: Partial<LearnerProfile>) => {
    setProfile(prev => {
      const next = {
        ...prev,
        ...updated,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      saveStateToStorage({ ...currentPayload, profile: next });
      return next;
    });
    appendAuditLog('Updated Student Learner Profile & Development Preferences', profile.studentName);
  };

  // Diagnostic assessment or lecturer validation score update (PRD 04 A2 & B4)
  const updateSkillScore = (
    skillId: string,
    deltaScore: number,
    newMastery?: MasteryLevel,
    provenance: EvidenceProvenanceType = 'Diagnostic assessment result',
    validatorName?: string
  ) => {
    setStudentSkills(prev => {
      const existing = prev[skillId] || {
        skillId,
        masteryLevel: 'not_assessed',
        score: 0,
        verifiedByLecturer: false,
        lastAssessedAt: new Date().toISOString().split('T')[0],
        selfAssessedConfidence: 3,
        evidenceCount: 1,
      };

      const baseScore = existing.score === 0 ? 55 : existing.score;
      const nextScore = Math.min(100, Math.max(0, baseScore + deltaScore));
      let determinedMastery = newMastery;
      if (!determinedMastery) {
        if (nextScore >= 85) determinedMastery = 'mastered';
        else if (nextScore >= 60) determinedMastery = 'in_progress';
        else if (nextScore >= 40) determinedMastery = 'needs_support';
        else determinedMastery = 'not_assessed';
      }

      const isLecturerValidated =
        provenance === 'Lecturer-validated competency' || existing.verifiedByLecturer;

      const nextSkills: Record<string, StudentSkill> = {
        ...prev,
        [skillId]: {
          ...existing,
          score: nextScore,
          masteryLevel: determinedMastery,
          verifiedByLecturer: isLecturerValidated,
          validatorName: validatorName || existing.validatorName || 'NEXORA Diagnostic Rubric Engine',
          lastAssessedAt: new Date().toISOString().split('T')[0],
          provenance: isLecturerValidated ? 'Lecturer-validated competency' : provenance,
          confidenceQuality: isLecturerValidated
            ? 'High (Lecturer Verified)'
            : 'Moderate (Diagnostic / Portfolio)',
        },
      };

      recalculateAllOpportunitiesForSkills(nextSkills);
      return nextSkills;
    });
  };

  // Self-reported confidence update — NEVER invents mastery scores (PRD 04 A2)
  const updateSelfReportedSkill = (skillId: string, confidenceStars: number) => {
    setStudentSkills(prev => {
      const existing = prev[skillId] || {
        skillId,
        masteryLevel: 'not_assessed' as MasteryLevel,
        score: 0,
        verifiedByLecturer: false,
        lastAssessedAt: new Date().toISOString().split('T')[0],
        selfAssessedConfidence: confidenceStars,
        evidenceCount: 0,
        provenance: 'Self-reported skill' as EvidenceProvenanceType,
        confidenceQuality: 'Preliminary (Self-Reported)' as const,
      };

      const nextSkills: Record<string, StudentSkill> = {
        ...prev,
        [skillId]: {
          ...existing,
          selfAssessedConfidence: confidenceStars,
          provenance: existing.verifiedByLecturer
            ? 'Lecturer-validated competency'
            : existing.score > 0
            ? existing.provenance || 'Diagnostic assessment result'
            : 'Self-reported skill',
          confidenceQuality: existing.verifiedByLecturer
            ? 'High (Lecturer Verified)'
            : existing.score > 0
            ? 'Moderate (Diagnostic / Portfolio)'
            : 'Preliminary (Self-Reported)',
        },
      };
      saveStateToStorage({ ...currentPayload, studentSkills: nextSkills });
      return nextSkills;
    });
    const skName = microSkills.find(m => m.id === skillId)?.name || skillId;
    appendAuditLog(`Recorded Student Self-Reported Confidence (${confidenceStars}/5 Stars)`, skName);
  };

  // PRD 04 A5: Completion of a learning activity does NOT automatically establish mastery
  const completeActivity = (pathId: string, activityId: string) => {
    setPathways(prev => {
      const nextPaths = prev.map(p => {
        if (p.id !== pathId) return p;
        const nextActivities = p.activities.map(a =>
          a.id === activityId ? { ...a, completed: !a.completed } : a
        );
        const completedCount = nextActivities.filter(a => a.completed).length;
        const total = nextActivities.length;
        const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const status: 'completed' | 'in_progress' | 'upcoming' =
          pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'upcoming';
        return {
          ...p,
          activities: nextActivities,
          completionPercentage: pct,
          status,
        };
      });
      saveStateToStorage({ ...currentPayload, pathways: nextPaths });
      return nextPaths;
    });
  };

  const toggleSaveOpportunity = (oppId: string) => {
    setOpportunities(prev => {
      const nextOpps = prev.map(o => {
        if (o.id !== oppId) return o;
        const nextSaved = !o.isSaved;
        return {
          ...o,
          isSaved: nextSaved,
          bookmarksCount: Math.max(0, (o.bookmarksCount || 10) + (nextSaved ? 1 : -1)),
        };
      });
      saveStateToStorage({ ...currentPayload, opportunities: nextOpps });
      return nextOpps;
    });
  };

  // EVENT 4: Student expresses interest -> Consent recorded -> Industry receives permitted info -> Student status updated
  const expressInterestInOpportunity = (
    oppId: string,
    sharedFields: ('program_semester' | 'verified_skills' | 'approved_portfolio_links' | 'career_goal')[] = [
      'program_semester',
      'verified_skills',
    ]
  ) => {
    const targetOpp = opportunities.find(o => o.id === oppId);
    setOpportunities(prev => {
      const nextOpps = prev.map(o =>
        o.id === oppId ? { ...o, isApplied: true, expressInterestCount: o.expressInterestCount + 1 } : o
      );
      saveStateToStorage({ ...currentPayload, opportunities: nextOpps });
      return nextOpps;
    });

    if (targetOpp) {
      const verifiedSkillLabels = Object.values(studentSkills)
        .filter(sk => sk.verifiedByLecturer || sk.masteryLevel === 'mastered')
        .map(sk => {
          const found = microSkills.find(m => m.id === sk.skillId);
          return found ? `${found.name} (${sk.verifiedByLecturer ? 'Lecturer Verified' : 'Evidenced'})` : sk.skillId;
        });

      const newConsent: StudentConsentShareRecord = {
        id: `consent_${Date.now()}`,
        opportunityId: oppId,
        opportunityTitle: targetOpp.title,
        organizationId: targetOpp.organizationId || 'org_techcorp_id',
        studentId: profile.userId,
        studentDisplayName: `${profile.studentName} (DEMO)`,
        universityName: profile.universityName,
        programName: profile.programName,
        semester: profile.semester,
        consentGranted: true,
        sharedFields,
        evidencedSkillNames: verifiedSkillLabels.slice(0, 5),
        portfolioUrl: sharedFields.includes('approved_portfolio_links')
          ? 'https://github.com/sarahjenkins/student-retention-analytics'
          : undefined,
        applicationProgress: 'Expressed Interest',
        sharedAt: new Date().toISOString().split('T')[0],
      };

      setStudentConsentRecords(prev => {
        const filtered = prev.filter(
          r => !(r.opportunityId === oppId && r.studentId === profile.userId)
        );
        const next = [newConsent, ...filtered];
        saveStateToStorage({ ...currentPayload, studentConsentRecords: next });
        return next;
      });

      dispatchCrossPortalNotification({
        title: `EVENT 4 · Student Expressed Interest (${profile.studentName})`,
        message: `${profile.studentName} granted explicit consent to share [${sharedFields.join(', ')}] for "${targetOpp.title}".`,
        type: 'opportunity',
        eventType: 'EVENT_4_CONSENT_INTEREST',
        recipientRole: 'industry',
        relatedRecordId: newConsent.id,
        navigationTarget: 'industry_engagement',
        dedupeKey: `event4_consent_${oppId}_${profile.userId}`,
      });

      appendAuditLog(
        'EVENT 4: Student Granted Explicit Consent to Share Selected Profile Fields',
        targetOpp.title,
        'EVENT_4_CONSENT_INTEREST'
      );
    }
  };

  const withdrawStudentConsent = (oppId: string) => {
    setStudentConsentRecords(prev => {
      const next = prev.map(r =>
        r.opportunityId === oppId && r.studentId === profile.userId
          ? { ...r, consentGranted: false, applicationProgress: 'Withdrawn' as const }
          : r
      );
      saveStateToStorage({ ...currentPayload, studentConsentRecords: next });
      return next;
    });
    const targetOpp = opportunities.find(o => o.id === oppId);
    appendAuditLog('Student Withdrew Profile Sharing Consent', targetOpp?.title || oppId, 'EVENT_4_CONSENT_INTEREST');
  };

  const recordExternalApplicationClick = (oppId: string) => {
    setOpportunities(prev => {
      const next = prev.map(o =>
        o.id === oppId ? { ...o, externalClicksCount: (o.externalClicksCount || 0) + 1 } : o
      );
      saveStateToStorage({ ...currentPayload, opportunities: next });
      return next;
    });
  };

  // EVENT 1 (Part A): Student submits assessment/learning evidence -> Lecturer receives review notification
  const submitEvidence = (
    newEv: Omit<SkillEvidence, 'id' | 'submittedAt' | 'status' | 'isDemo'>,
    initialStatus: 'pending' | 'draft' = 'pending'
  ) => {
    const item: SkillEvidence = {
      ...newEv,
      id: `ev_${Date.now()}`,
      studentId: currentUser.id,
      studentName: profile.studentName,
      submittedAt: new Date().toISOString().split('T')[0],
      status: initialStatus,
      isDemo: true,
      lecturerFeedback:
        initialStatus === 'draft'
          ? 'Saved as personal draft. Submit when ready for Lecturer evaluation.'
          : 'Submitted for verification by Department Lecturer.',
    };
    setEvidenceList(prev => {
      const nextList = [item, ...prev];
      saveStateToStorage({ ...currentPayload, evidenceList: nextList });
      return nextList;
    });

    if (initialStatus === 'pending') {
      dispatchCrossPortalNotification({
        title: 'EVENT 1 · New Student Evidence Submitted',
        message: `${profile.studentName} submitted "${item.title}" (${item.type}) for rubric validation.`,
        type: 'evidence',
        eventType: 'EVENT_1_EVIDENCE',
        recipientRole: 'lecturer',
        relatedRecordId: item.id,
        navigationTarget: 'lecturer_assessments',
        dedupeKey: `event1_sub_${item.id}`,
      });
      appendAuditLog('EVENT 1: Student Submitted Learning Evidence for Review', item.title, 'EVENT_1_EVIDENCE');
    } else {
      appendAuditLog('Saved Draft Learning Evidence', item.title);
    }
  };

  const submitDraftEvidenceForReview = (evidenceId: string) => {
    const targetEv = evidenceList.find(e => e.id === evidenceId);
    setEvidenceList(prev => {
      const next = prev.map(ev =>
        ev.id === evidenceId
          ? {
              ...ev,
              status: 'pending' as EvidenceStatus,
              submittedAt: new Date().toISOString().split('T')[0],
              lecturerFeedback: 'Submitted to Department Lecturer queue for verification.',
            }
          : ev
      );
      saveStateToStorage({ ...currentPayload, evidenceList: next });
      return next;
    });

    if (targetEv) {
      dispatchCrossPortalNotification({
        title: 'EVENT 1 · Student Evidence Submitted for Review',
        message: `${profile.studentName} submitted "${targetEv.title}" for Lecturer rubric validation.`,
        type: 'evidence',
        eventType: 'EVENT_1_EVIDENCE',
        recipientRole: 'lecturer',
        relatedRecordId: targetEv.id,
        navigationTarget: 'lecturer_assessments',
        dedupeKey: `event1_sub_${targetEv.id}_${Date.now()}`,
      });
      appendAuditLog('EVENT 1: Submitted Evidence Record to Lecturer Review Queue', targetEv.title, 'EVENT_1_EVIDENCE');
    }
  };

  const addGoal = (newGoal: Omit<StudentGoal, 'id'>) => {
    const item: StudentGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      priorityWeight: newGoal.priorityWeight || 2,
      paused: false,
    };
    setGoals(prev => {
      const nextGoals = [item, ...prev];
      saveStateToStorage({ ...currentPayload, goals: nextGoals });
      return nextGoals;
    });
    appendAuditLog('Created Personal Development Goal & Recalculated Recommendations', item.title);
  };

  const updateGoal = (id: string, updated: Partial<StudentGoal>) => {
    setGoals(prev => {
      const nextGoals = prev.map(g => (g.id === id ? { ...g, ...updated } : g));
      saveStateToStorage({ ...currentPayload, goals: nextGoals });
      return nextGoals;
    });
    const gTitle = goals.find(g => g.id === id)?.title || id;
    appendAuditLog('Updated Student Goal & Triggered Recommendation Recalculation', gTitle);
  };

  const deleteGoal = (id: string) => {
    const gTitle = goals.find(g => g.id === id)?.title || id;
    setGoals(prev => {
      const nextGoals = prev.filter(g => g.id !== id);
      saveStateToStorage({ ...currentPayload, goals: nextGoals });
      return nextGoals;
    });
    appendAuditLog('Removed Student Goal & Recalculated Recommendations', gTitle);
  };

  const togglePauseGoal = (id: string) => {
    const target = goals.find(g => g.id === id);
    setGoals(prev => {
      const nextGoals = prev.map(g => (g.id === id ? { ...g, paused: !g.paused } : g));
      saveStateToStorage({ ...currentPayload, goals: nextGoals });
      return nextGoals;
    });
    appendAuditLog(
      target?.paused
        ? 'Resumed Student Goal & Recalculated Recommendations'
        : 'Paused Student Goal & Recalculated Recommendations',
      target?.title || id
    );
  };

  const prioritizeGoal = (id: string, priorityWeight: number) => {
    const target = goals.find(g => g.id === id);
    setGoals(prev => {
      const nextGoals = prev
        .map(g => (g.id === id ? { ...g, priorityWeight } : g))
        .sort((a, b) => (b.priorityWeight || 1) - (a.priorityWeight || 1));
      saveStateToStorage({ ...currentPayload, goals: nextGoals });
      return nextGoals;
    });
    appendAuditLog(
      `Updated Goal Priority Weight (${priorityWeight}/3) & Recalculated Skill Gaps`,
      target?.title || id
    );
  };

  const submitRecommendationFeedback = (
    recommendationId: string,
    targetEntityId: string,
    feedbackType: RecommendationFeedbackType,
    reason = 'Student preference action'
  ) => {
    const fb: RecommendationFeedbackRecord = {
      feedbackId: `rec_fb_${Date.now()}`,
      studentId: profile.userId,
      recommendationId,
      targetEntityId,
      feedbackType,
      feedbackReason: reason,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRecommendationFeedback(prev => {
      const filtered = prev.filter(
        x => !(x.recommendationId === recommendationId || x.targetEntityId === targetEntityId)
      );
      const next = [fb, ...filtered];
      saveStateToStorage({ ...currentPayload, recommendationFeedback: next });
      return next;
    });
    appendAuditLog(
      `Recorded Student Recommendation Feedback (${feedbackType})`,
      `${recommendationId} (${reason})`
    );
  };

  const overrideLecturerRecommendation = (targetId: string, reason: string) => {
    const formattedNote = `${currentUser.name}: ${reason}`;
    setLecturerOverrides(prev => {
      const next = { ...prev, [targetId]: formattedNote };
      saveStateToStorage({ ...currentPayload, lecturerOverrides: next });
      return next;
    });
    appendAuditLog(
      'Lecturer Recorded Pedagogical Recommendation Override',
      `${targetId}: ${reason}`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      saveStateToStorage({ ...currentPayload, notifications: next });
      return next;
    });
  };

  // EVENT 2: Lecturer maps CPMK to micro-skills -> Course Knowledge Graph updates -> Student pathways update -> Academic dashboard reflects coverage
  const addCourseOutcome = (courseId: string, text: string, skillIds: string[], cplCode = 'CPL-02') => {
    const outcomeId = `lo_${Date.now()}`;
    const targetCourse = courses.find(c => c.id === courseId);

    setCourses(prev => {
      const next = prev.map(c => {
        if (c.id !== courseId) return c;
        const newOutcome = {
          id: outcomeId,
          code: `CPMK-${c.learningOutcomes.length + 1}`,
          cplCode,
          text,
          mappedSkillIds: skillIds,
          approvalStatus: 'pending' as const,
        };
        return {
          ...c,
          learningOutcomes: [...c.learningOutcomes, newOutcome],
        };
      });
      saveStateToStorage({ ...currentPayload, courses: next });
      return next;
    });

    // Update Course Knowledge Graph automatically (EVENT 2)
    const outcomeNodeId = `node_${outcomeId}`;
    const newOutcomeNode: GraphNode = {
      id: outcomeNodeId,
      label: text.length > 34 ? `${text.slice(0, 34)}...` : text,
      type: 'Outcome',
      code: cplCode,
      description: text,
      x: 160 + Math.round(Math.random() * 180),
      y: 180,
    };

    setGraphNodes(prev => [...prev, newOutcomeNode]);
    setGraphEdges(prev => [
      ...prev,
      {
        id: `edge_course_${Date.now()}`,
        source: 'node_cs402',
        target: outcomeNodeId,
        relationship: 'CONTAINS',
      },
      {
        id: `edge_supp_${Date.now()}`,
        source: outcomeNodeId,
        target: 'node_dai',
        relationship: 'SUPPORTS',
      },
    ]);

    // Sync to Student Learning Pathways (EVENT 2)
    setPathways(prev => {
      const nextPaths = prev.map(p => {
        const overlaps = p.targetSkillIds.some(id => skillIds.includes(id)) || p.id === 'path_mlf';
        if (!overlaps) return p;
        const mergedTargetSkills = Array.from(new Set([...p.targetSkillIds, ...skillIds]));
        const nextMappedOutcomes = [...(p.mappedOutcomes || []), `${cplCode}: ${text}`];
        return {
          ...p,
          targetSkillIds: mergedTargetSkills,
          mappedOutcomes: nextMappedOutcomes,
        };
      });
      return nextPaths;
    });

    // Reflect in Academic Admin Approval Queue (EVENT 2)
    const approvalId = `app_${Date.now()}`;
    setMappingApprovals(prev => [
      {
        id: approvalId,
        courseId,
        courseCode: targetCourse?.code || 'CS402',
        courseName: targetCourse?.name || 'Course',
        outcomeText: `[${cplCode}] ${text}`,
        requestedBy: currentUser.name,
        status: 'pending',
        submittedAt: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);

    dispatchCrossPortalNotification({
      title: `EVENT 2 · CPMK Mapped in ${targetCourse?.code || 'Course'}`,
      message: `${currentUser.name} mapped new CPMK outcome (${cplCode}) to ${skillIds.length} micro-skill(s). Knowledge Graph & Learning Pathways updated.`,
      type: 'recommendation',
      eventType: 'EVENT_2_CPMK_MAPPING',
      recipientRole: 'student',
      relatedRecordId: outcomeId,
      navigationTarget: 'learning',
      dedupeKey: `event2_map_${outcomeId}`,
    });

    appendAuditLog(
      `EVENT 2: Mapped CPMK (${cplCode}) to Micro-Skills & Synced Knowledge Graph`,
      `${targetCourse?.code}: ${text}`,
      'EVENT_2_CPMK_MAPPING'
    );
  };

  const addMicroSkill = (newSkill: Omit<MicroSkill, 'id'>) => {
    const created: MicroSkill = {
      ...newSkill,
      id: `skill_${Date.now()}`,
    };
    setMicroSkills(prev => {
      const next = [...prev, created];
      saveStateToStorage({ ...currentPayload, microSkills: next });
      return next;
    });
    addGraphNode({
      label: created.name,
      type: 'MicroSkill',
      code: created.id.toUpperCase().slice(0, 10),
      description: created.description,
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
    });
  };

  const addGraphNode = (node: Omit<GraphNode, 'id'>) => {
    const item: GraphNode = {
      ...node,
      id: `node_${Date.now()}`,
    };
    setGraphNodes(prev => {
      const next = [...prev, item];
      saveStateToStorage({ ...currentPayload, graphNodes: next });
      return next;
    });
  };

  const editGraphNode = (id: string, updated: Partial<GraphNode>) => {
    setGraphNodes(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, ...updated } : n));
      saveStateToStorage({ ...currentPayload, graphNodes: next });
      return next;
    });
  };

  const isCircularPrerequisite = (source: string, target: string, edges: GraphEdge[]): boolean => {
    if (source === target) return true;
    const adjacency: Record<string, string[]> = {};
    edges.forEach(e => {
      if (!adjacency[e.source]) adjacency[e.source] = [];
      adjacency[e.source].push(e.target);
    });
    if (!adjacency[source]) adjacency[source] = [];
    adjacency[source].push(target);

    const visited = new Set<string>();
    const stack = [target];
    while (stack.length > 0) {
      const curr = stack.pop()!;
      if (curr === source) return true;
      if (!visited.has(curr)) {
        visited.add(curr);
        const neighbors = adjacency[curr] || [];
        for (const n of neighbors) {
          stack.push(n);
        }
      }
    }
    return false;
  };

  const addGraphEdge = (source: string, target: string, relationship: GraphEdgeRelationship) => {
    if (relationship === 'REQUIRES' || relationship === 'SUPPORTS') {
      if (isCircularPrerequisite(source, target, graphEdges)) {
        return {
          success: false,
          message: `Invalid circular relationship! Connecting '${source}' -> '${target}' creates an impossible prerequisite loop.`,
        };
      }
    }

    const item: GraphEdge = {
      id: `edge_${Date.now()}`,
      source,
      target,
      relationship,
    };
    setGraphEdges(prev => {
      const next = [...prev, item];
      saveStateToStorage({ ...currentPayload, graphEdges: next });
      return next;
    });
    return { success: true };
  };

  const removeGraphEdge = (edgeId: string) => {
    setGraphEdges(prev => {
      const next = prev.filter(e => e.id !== edgeId);
      saveStateToStorage({ ...currentPayload, graphEdges: next });
      return next;
    });
  };

  const updateLearningGroup = (groupId: string, updated: Partial<FlexibleLearningGroup>) => {
    setLearningGroups(prev => {
      const next = prev.map(g => (g.id === groupId ? { ...g, ...updated } : g));
      saveStateToStorage({ ...currentPayload, learningGroups: next });
      return next;
    });
  };

  const createLearningGroup = (newGrp: Omit<FlexibleLearningGroup, 'id' | 'createdDate'>) => {
    const item: FlexibleLearningGroup = {
      ...newGrp,
      id: `grp_${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setLearningGroups(prev => {
      const next = [...prev, item];
      saveStateToStorage({ ...currentPayload, learningGroups: next });
      return next;
    });
  };

  // EVENT 5: Lecturer publishes learning activity -> Enrolled students receive notification -> Appears in Student Pathway
  const publishLearningActivity = (
    pathId: string,
    title: string,
    type: 'Quiz' | 'Practical Task' | 'Project Submission' | 'Peer Review',
    dueDate: string,
    assignedGroupId?: string
  ) => {
    const actId = `act_${Date.now()}`;
    const targetPath = pathways.find(p => p.id === pathId) || pathways[0];

    setPathways(prev => {
      const nextPaths = prev.map(p => {
        if (p.id !== targetPath.id) return p;
        const newAct = {
          id: actId,
          title,
          type,
          completed: false,
          dueDate,
          assignedGroupId,
          publishedBy: currentUser.name,
        };
        const nextActivities = [...p.activities, newAct];
        const completedCount = nextActivities.filter(a => a.completed).length;
        const pct = Math.round((completedCount / nextActivities.length) * 100);
        return {
          ...p,
          activities: nextActivities,
          completionPercentage: pct,
          status: (pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'upcoming') as LearningPathModule['status'],
        };
      });
      saveStateToStorage({ ...currentPayload, pathways: nextPaths });
      return nextPaths;
    });

    dispatchCrossPortalNotification({
      title: `EVENT 5 · New Learning Activity Published (${targetPath.code})`,
      message: `${currentUser.name} published "${title}" (${type}) due ${dueDate}. Complete and submit evidence for validation.`,
      type: 'deadline',
      eventType: 'EVENT_5_ACTIVITY_PUBLISHED',
      recipientRole: 'student',
      relatedRecordId: actId,
      navigationTarget: 'learning',
      dedupeKey: `event5_act_${actId}`,
    });

    appendAuditLog(
      `EVENT 5: Published Learning Activity to Enrolled Students (${targetPath.code})`,
      title,
      'EVENT_5_ACTIVITY_PUBLISHED'
    );
  };

  // EVENT 1 (Part B): Lecturer validates evidence -> Student competency record updates -> Recommendations recalculated
  const reviewEvidence = (
    evidenceId: string,
    status: 'approved' | 'revision_requested' | 'rejected',
    feedback: string
  ) => {
    const ev = evidenceList.find(e => e.id === evidenceId);
    setEvidenceList(prev => {
      const next = prev.map(item => {
        if (item.id !== evidenceId) return item;
        return {
          ...item,
          status: status as EvidenceStatus,
          verifiedAt: new Date().toISOString().split('T')[0],
          validatorName: currentUser.name,
          lecturerFeedback: feedback,
        };
      });
      saveStateToStorage({ ...currentPayload, evidenceList: next });
      return next;
    });

    if (status === 'approved' && ev) {
      ev.skillIds.forEach(skId => {
        updateSkillScore(
          skId,
          15,
          'mastered',
          'Lecturer-validated competency',
          currentUser.name
        );
      });

      dispatchCrossPortalNotification({
        title: 'EVENT 1 · Evidence Approved & Mastery Validated',
        message: `${currentUser.name} validated "${ev.title}". Your competency profile and opportunity match scores have been updated!`,
        type: 'evidence',
        eventType: 'EVENT_1_EVIDENCE',
        recipientRole: 'student',
        relatedRecordId: ev.id,
        navigationTarget: 'skills',
        dedupeKey: `event1_approved_${ev.id}_${Date.now()}`,
      });
    } else if (ev) {
      dispatchCrossPortalNotification({
        title: `EVENT 1 · Evidence ${status === 'revision_requested' ? 'Revision Requested' : 'Rejected'}`,
        message: `${currentUser.name} reviewed "${ev.title}": ${feedback}`,
        type: 'evidence',
        eventType: 'EVENT_1_EVIDENCE',
        recipientRole: 'student',
        relatedRecordId: ev.id,
        navigationTarget: 'portfolio',
        dedupeKey: `event1_rev_${ev.id}_${Date.now()}`,
      });
    }

    appendAuditLog(
      `EVENT 1: Lecturer ${status.toUpperCase()} Student Evidence & Recalculated Profile`,
      ev?.title || evidenceId,
      'EVENT_1_EVIDENCE'
    );
  };

  // EVENT 3 (Part B): University Reviewer evaluates opportunity -> Approves/Publishes -> Visible to students & matched
  const reviewOpportunity = (oppId: string, status: 'approved' | 'rejected' | 'needs_correction', feedback: string) => {
    const targetOpp = opportunities.find(o => o.id === oppId);
    setOpportunities(prev => {
      const next = prev.map(o => {
        if (o.id !== oppId) return o;
        let pubStatus: OpportunityPublicationStatus = o.publicationStatus || 'Submitted for Review';
        if (status === 'approved') {
          pubStatus = 'Published'; // Automatically publish upon university approval so students can discover it immediately (EVENT 3)
        } else if (status === 'needs_correction') {
          pubStatus = 'Needs Revision';
        } else if (status === 'rejected') {
          pubStatus = 'Rejected';
        }
        const computed = computeOpportunityMatchWithSkills(
          o.requiredSkillIds,
          o.relevantSkillIds,
          o.eligibility,
          studentSkills
        );
        return {
          ...o,
          reviewStatus: status,
          publicationStatus: pubStatus,
          reviewerFeedback: feedback,
          matchPercentage: computed.matchPercentage,
          matchExplanation: computed.matchExplanation,
        };
      });
      saveStateToStorage({ ...currentPayload, opportunities: next });
      return next;
    });

    if (targetOpp) {
      if (status === 'approved') {
        dispatchCrossPortalNotification({
          title: `EVENT 3 · Verified Opportunity Published (${targetOpp.matchPercentage}% Match)`,
          message: `University Reviewer approved "${targetOpp.title}" by ${targetOpp.organization}. Now open in Opportunity Discovery!`,
          type: 'opportunity',
          eventType: 'EVENT_3_OPPORTUNITY',
          recipientRole: 'student',
          relatedRecordId: targetOpp.id,
          navigationTarget: 'opportunities',
          dedupeKey: `event3_pub_student_${targetOpp.id}`,
        });
      }

      dispatchCrossPortalNotification({
        title: `EVENT 3 · University Review Decision: ${status.toUpperCase()}`,
        message: `University Reviewer evaluated "${targetOpp.title}": ${feedback}`,
        type: 'opportunity',
        eventType: 'EVENT_3_OPPORTUNITY',
        recipientRole: 'industry',
        relatedRecordId: targetOpp.id,
        navigationTarget: 'industry_opportunities',
        dedupeKey: `event3_rev_ind_${targetOpp.id}_${status}`,
      });
    }

    appendAuditLog(
      `EVENT 3: University Reviewer Marked Opportunity '${status}'`,
      targetOpp?.title || oppId,
      'EVENT_3_OPPORTUNITY'
    );
  };

  const approveMappingOutcome = (approvalId: string) => {
    const targetApp = mappingApprovals.find(a => a.id === approvalId);
    setMappingApprovals(prev => {
      const next = prev.map(a => (a.id === approvalId ? { ...a, status: 'approved' as const } : a));
      saveStateToStorage({ ...currentPayload, mappingApprovals: next });
      return next;
    });
    if (targetApp) {
      setCourses(prev =>
        prev.map(c =>
          c.id === targetApp.courseId
            ? {
                ...c,
                learningOutcomes: c.learningOutcomes.map(lo => ({
                  ...lo,
                  approvalStatus: 'approved' as const,
                })),
              }
            : c
        )
      );
      appendAuditLog('EVENT 2: Academic Admin Approved Course Outcome Mapping', targetApp.outcomeText, 'EVENT_2_CPMK_MAPPING');
    }
  };

  const approveCollaborationProject = (projectId: string) => {
    setCollaborationProjects(prev => {
      const next = prev.map(p => (p.id === projectId ? { ...p, status: 'Active' as const } : p));
      saveStateToStorage({ ...currentPayload, collaborationProjects: next });
      return next;
    });
    const proj = collaborationProjects.find(p => p.id === projectId);
    appendAuditLog('University Approved Collaboration Project', proj?.title || projectId);
  };

  const resolveFlaggedCompetency = (
    flagId: string,
    resolutionStatus: 'Mapped to Existing Taxonomy' | 'Approved by Curriculum Board'
  ) => {
    const targetFlag = flaggedCompetencies.find(f => f.id === flagId);
    setFlaggedCompetencies(prev => {
      const next = prev.map(f => (f.id === flagId ? { ...f, status: resolutionStatus } : f));
      saveStateToStorage({ ...currentPayload, flaggedCompetencies: next });
      return next;
    });
    if (targetFlag && resolutionStatus === 'Approved by Curriculum Board') {
      addMicroSkill({
        clusterId: targetFlag.suggestedClusterId,
        name: targetFlag.plainLanguageRequirement.slice(0, 48),
        category: 'Industry-Aligned Skill',
        level: 'Intermediate',
        description: `Approved from Industry Partner proposal (${targetFlag.organizationName}): ${targetFlag.plainLanguageRequirement}`,
        indicators: ['Demonstrates applied competence in industry project artifact'],
      });
    }
    appendAuditLog(
      `Institutional Curriculum Board Marked Flagged Skill '${resolutionStatus}'`,
      targetFlag?.plainLanguageRequirement || flagId
    );
  };

  const updateOrganizationVerificationStatus = (
    status: 'verified' | 'pending' | 'unverified' | 'rejected' | 'suspended'
  ) => {
    setOrganizationProfile(prev => {
      const next: OrganizationProfile = {
        ...prev,
        verifiedStatus: status,
        partnershipStatus:
          status === 'verified'
            ? 'Official University Partner'
            : status === 'pending'
            ? 'Pending Institutional Review'
            : 'Provisional Partner',
      };
      saveStateToStorage({ ...currentPayload, organizationProfile: next });
      return next;
    });
    appendAuditLog(`Institutional Admin Updated Organization Status to '${status.toUpperCase()}'`, organizationProfile.name);
  };

  // PRD 03 INDUSTRY ACTIONS
  const updateOrganizationProfile = (updated: Partial<OrganizationProfile>) => {
    setOrganizationProfile(prev => {
      const next = { ...prev, ...updated };
      saveStateToStorage({ ...currentPayload, organizationProfile: next });
      return next;
    });
    appendAuditLog('Updated Organization Profile', organizationProfile.name);
  };

  const addOrganizationRepresentative = (rep: Omit<OrganizationRepresentative, 'id' | 'verified'>) => {
    const newRep: OrganizationRepresentative = {
      ...rep,
      id: `rep_${Date.now()}`,
      verified: false,
    };
    setOrganizationProfile(prev => {
      const next = {
        ...prev,
        representatives: [...prev.representatives, newRep],
      };
      saveStateToStorage({ ...currentPayload, organizationProfile: next });
      return next;
    });
    appendAuditLog('Invited Organization Representative (Pending Verification)', newRep.email);
  };

  // EVENT 3 (Part A): Industry submits opportunity -> University reviewer receives notification
  const saveOrSubmitOpportunity = (
    oppData: Partial<Opportunity> & {
      title: string;
      category: Opportunity['category'];
      officialUrl: string;
      deadline: string;
      eligibility: string;
      requiredSkillIds: string[];
    },
    targetStatus: 'Draft' | 'Submitted for Review',
    existingId?: string
  ): Opportunity => {
    const relevantIds = oppData.relevantSkillIds || [];
    const computed = computeOpportunityMatchWithSkills(
      oppData.requiredSkillIds,
      relevantIds,
      oppData.eligibility,
      studentSkills
    );

    if (existingId) {
      let updatedItem!: Opportunity;
      setOpportunities(prev => {
        const next = prev.map(existing => {
          if (existing.id !== existingId) return existing;

          const criticalChanged =
            existing.publicationStatus === 'Published' &&
            (existing.eligibility !== oppData.eligibility ||
              existing.deadline !== oppData.deadline ||
              existing.officialUrl !== oppData.officialUrl ||
              existing.requiredSkillIds.join(',') !== oppData.requiredSkillIds.join(','));

          const nextPubStatus: OpportunityPublicationStatus = criticalChanged
            ? 'Submitted for Review'
            : targetStatus;

          const nextRevStatus =
            nextPubStatus === 'Submitted for Review' ? 'pending' : existing.reviewStatus;

          updatedItem = {
            ...existing,
            ...oppData,
            matchPercentage: computed.matchPercentage,
            matchExplanation: computed.matchExplanation,
            publicationStatus: nextPubStatus,
            reviewStatus: nextRevStatus,
            reviewerFeedback: criticalChanged
              ? 'Re-submitted for university verification due to changes in eligibility, deadline, required skills, or destination URL.'
              : existing.reviewerFeedback,
          };
          return updatedItem;
        });
        saveStateToStorage({ ...currentPayload, opportunities: next });
        return next;
      });

      if (targetStatus === 'Submitted for Review') {
        dispatchCrossPortalNotification({
          title: 'EVENT 3 · Opportunity Submitted for Verification',
          message: `${organizationProfile.name} submitted "${oppData.title}" for University Opportunity Review.`,
          type: 'opportunity',
          eventType: 'EVENT_3_OPPORTUNITY',
          recipientRole: 'lecturer',
          relatedRecordId: existingId,
          navigationTarget: 'lecturer_program_admin',
          dedupeKey: `event3_sub_${existingId}_${Date.now()}`,
        });
      }

      appendAuditLog(
        targetStatus === 'Submitted for Review'
          ? 'EVENT 3: Submitted Edited Opportunity for University Review'
          : 'Saved Opportunity Draft Changes',
        oppData.title,
        'EVENT_3_OPPORTUNITY'
      );
      return updatedItem;
    }

    const newOpp: Opportunity = {
      id: `opp_${Date.now()}`,
      organizationId: organizationProfile.id,
      title: oppData.title,
      organization: organizationProfile.name.replace(' (DEMO)', ''),
      orgLogo: organizationProfile.logoUrl || DEMO_IMAGE_TECHCORP,
      category: oppData.category,
      description: oppData.description || 'Verified university-industry opportunity.',
      location: oppData.location || 'Jakarta, Hybrid',
      startDate: oppData.startDate || '2026-07-01',
      deadline: oppData.deadline,
      duration: oppData.duration || '12 Weeks',
      availablePositions: oppData.availablePositions || 5,
      academicPrograms: oppData.academicPrograms || ['Computer Science', 'Data Science'],
      studyLevel: oppData.studyLevel || 'Semester 5 - 8 Undergraduate',
      eligibility: oppData.eligibility,
      requiredSkillIds: oppData.requiredSkillIds,
      relevantSkillIds: relevantIds,
      optionalSkillIds: oppData.optionalSkillIds || [],
      matchPercentage: computed.matchPercentage,
      matchExplanation: computed.matchExplanation,
      applicationMethod: oppData.applicationMethod || 'External Official Company Career Portal',
      officialUrl: oppData.officialUrl,
      contactEmail: oppData.contactEmail || 'talent@techcorp.co.id',
      supportingDocuments: oppData.supportingDocuments || ['Verified NEXORA Portfolio'],
      isSaved: false,
      isApplied: false,
      expressInterestCount: 0,
      viewsCount: 0,
      bookmarksCount: 0,
      externalClicksCount: 0,
      publicationStatus: targetStatus,
      reviewStatus: targetStatus === 'Submitted for Review' ? 'pending' : undefined,
      isDemo: true,
    };

    setOpportunities(prev => {
      const next = [newOpp, ...prev];
      saveStateToStorage({ ...currentPayload, opportunities: next });
      return next;
    });

    if (targetStatus === 'Submitted for Review') {
      dispatchCrossPortalNotification({
        title: 'EVENT 3 · New Industry Opportunity Awaiting Review',
        message: `${newOpp.organization} submitted "${newOpp.title}" (${newOpp.category}) for University Verification.`,
        type: 'opportunity',
        eventType: 'EVENT_3_OPPORTUNITY',
        recipientRole: 'lecturer',
        relatedRecordId: newOpp.id,
        navigationTarget: 'lecturer_program_admin',
        dedupeKey: `event3_new_${newOpp.id}`,
      });
    }

    appendAuditLog(
      targetStatus === 'Submitted for Review'
        ? 'EVENT 3: Created & Submitted Opportunity for University Review'
        : 'Created Opportunity Draft',
      newOpp.title,
      'EVENT_3_OPPORTUNITY'
    );

    return newOpp;
  };

  const publishApprovedOpportunity = (oppId: string) => {
    const targetOpp = opportunities.find(o => o.id === oppId);
    setOpportunities(prev => {
      const next = prev.map(o => {
        if (o.id !== oppId) return o;
        return {
          ...o,
          publicationStatus: 'Published' as const,
          viewsCount: o.viewsCount || 120,
        };
      });
      saveStateToStorage({ ...currentPayload, opportunities: next });
      return next;
    });
    if (targetOpp) {
      dispatchCrossPortalNotification({
        title: `EVENT 3 · Opportunity Published (${targetOpp.matchPercentage}% Match)`,
        message: `${targetOpp.organization} published "${targetOpp.title}" to Student Opportunity Discovery.`,
        type: 'opportunity',
        eventType: 'EVENT_3_OPPORTUNITY',
        recipientRole: 'student',
        relatedRecordId: targetOpp.id,
        navigationTarget: 'opportunities',
        dedupeKey: `event3_pub_${targetOpp.id}`,
      });
    }
    appendAuditLog('EVENT 3: Published Approved Opportunity to Student Portal', targetOpp?.title || oppId, 'EVENT_3_OPPORTUNITY');
  };

  const archiveOpportunity = (oppId: string) => {
    setOpportunities(prev => {
      const next = prev.map(o =>
        o.id === oppId ? { ...o, publicationStatus: 'Archived' as const } : o
      );
      saveStateToStorage({ ...currentPayload, opportunities: next });
      return next;
    });
    const targetOpp = opportunities.find(o => o.id === oppId);
    appendAuditLog('Archived Opportunity', targetOpp?.title || oppId);
  };

  const deleteDraftOpportunity = (oppId: string) => {
    const targetOpp = opportunities.find(o => o.id === oppId);
    setOpportunities(prev => {
      const next = prev.filter(o => o.id !== oppId);
      saveStateToStorage({ ...currentPayload, opportunities: next });
      return next;
    });
    appendAuditLog('Deleted Draft Opportunity', targetOpp?.title || oppId);
  };

  const flagMissingCompetency = (
    plainLanguageRequirement: string,
    suggestedClusterId: string,
    tier: RequirementTier
  ) => {
    const item: FlaggedCompetencyProposal = {
      id: `flag_${Date.now()}`,
      organizationId: organizationProfile.id,
      organizationName: organizationProfile.name,
      plainLanguageRequirement,
      suggestedClusterId,
      requirementTier: tier,
      status: 'Flagged for University Review',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setFlaggedCompetencies(prev => {
      const next = [item, ...prev];
      saveStateToStorage({ ...currentPayload, flaggedCompetencies: next });
      return next;
    });
    dispatchCrossPortalNotification({
      title: 'Unmapped Industry Skill Flagged for Review',
      message: `${organizationProfile.name} proposed "${plainLanguageRequirement}" for institutional taxonomy alignment.`,
      type: 'recommendation',
      eventType: 'SYSTEM',
      recipientRole: 'lecturer',
      relatedRecordId: item.id,
      navigationTarget: 'lecturer_program_admin',
      dedupeKey: `flag_comp_${item.id}`,
    });
    appendAuditLog('Flagged Missing Competency for University Curriculum Review', plainLanguageRequirement);
  };

  const createCollaborationProject = (
    proj: Omit<
      CollaborationProject,
      'id' | 'organizationId' | 'organizationName' | 'status' | 'submittedAt' | 'isDemo' | 'milestones'
    > & { milestoneTitles: string[] }
  ) => {
    const newProj: CollaborationProject = {
      id: `proj_${Date.now()}`,
      organizationId: organizationProfile.id,
      organizationName: organizationProfile.name.replace(' (DEMO)', ''),
      title: proj.title,
      category: proj.category,
      description: proj.description,
      learningObjectives: proj.learningObjectives,
      requiredSkillIds: proj.requiredSkillIds,
      universityPartner: proj.universityPartner,
      academicCoordinator: proj.academicCoordinator,
      mentorName: proj.mentorName,
      mentorRole: proj.mentorRole,
      mentorEmail: proj.mentorEmail,
      duration: proj.duration,
      status: 'Under University Review',
      submittedAt: new Date().toISOString().split('T')[0],
      isDemo: true,
      milestones: proj.milestoneTitles.map((mTitle, idx) => ({
        id: `ms_${Date.now()}_${idx}`,
        title: mTitle,
        dueDate: '2026-06-30',
        completed: false,
        deliverableNote: 'Scheduled project milestone.',
      })),
    };
    setCollaborationProjects(prev => {
      const next = [newProj, ...prev];
      saveStateToStorage({ ...currentPayload, collaborationProjects: next });
      return next;
    });
    dispatchCrossPortalNotification({
      title: 'Collaboration Project Proposed by Industry',
      message: `${newProj.organizationName} proposed "${newProj.title}" (${newProj.category}) for University approval.`,
      type: 'opportunity',
      eventType: 'SYSTEM',
      recipientRole: 'lecturer',
      relatedRecordId: newProj.id,
      navigationTarget: 'lecturer_program_admin',
      dedupeKey: `proj_prop_${newProj.id}`,
    });
    appendAuditLog('Submitted University-Industry Collaboration Project', newProj.title);
  };

  const toggleProjectMilestone = (projectId: string, milestoneId: string) => {
    setCollaborationProjects(prev => {
      const next = prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      });
      saveStateToStorage({ ...currentPayload, collaborationProjects: next });
      return next;
    });
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('nexora_app_state_v3');
    setCurrentUser(INITIAL_USERS[0]);
    setActiveSubRole('Student');
    setProfile(INITIAL_LEARNER_PROFILE);
    setStudentSkills(INITIAL_STUDENT_SKILLS);
    setPathways(INITIAL_LEARNING_PATHWAYS);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setEvidenceList(INITIAL_EVIDENCE);
    setGoals(INITIAL_GOALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCourses(INITIAL_COURSES);
    setGraphNodes(INITIAL_GRAPH_NODES);
    setGraphEdges(INITIAL_GRAPH_EDGES);
    setLearningGroups(INITIAL_LEARNING_GROUPS);
    setRubrics(INITIAL_RUBRICS);
    setMappingApprovals(INITIAL_MAPPING_APPROVALS);
    setMicroSkills(INITIAL_MICRO_SKILLS);
    setOrganizationProfile(INITIAL_ORGANIZATION_PROFILE);
    setFlaggedCompetencies(INITIAL_FLAGGED_COMPETENCIES);
    setCollaborationProjects(INITIAL_COLLABORATION_PROJECTS);
    setStudentConsentRecords(INITIAL_STUDENT_CONSENT_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setManagedUsers(INITIAL_USERS);
    setInstitutionalTenants(INITIAL_INSTITUTIONAL_TENANTS);
    setUserInvitations(INITIAL_USER_INVITATIONS);
    setPrivacyRequests(INITIAL_PRIVACY_REQUESTS);
    setRecommendationFeedback([]);
    setLecturerOverrides({
      skill_cna:
        'Dr. Ahmad Hidayat: Focus on container fundamentals lab before attempting multi-cluster Kubernetes orchestration.',
    });
  };

  // Live memoized Recommendation Intelligence Run (automatically recalculates on any profile, goal, skill, evidence, course, opportunity, or feedback change)
  const recommendationBundle = useMemo(() => {
    const ctx = LearnerContextService.buildContext({
      profile,
      goals,
      studentSkills,
      microSkills,
      pathways,
      opportunities,
      evidenceList,
      courses,
      graphNodes,
      graphEdges,
      feedbackHistory: recommendationFeedback,
      lecturerOverrides,
      referenceDate: '2026-04-06',
      institutionId: currentUser.institutionId || 'inst_nusantara',
    });
    return executeFullRecommendationRun(ctx);
  }, [
    profile,
    goals,
    studentSkills,
    microSkills,
    pathways,
    opportunities,
    evidenceList,
    courses,
    graphNodes,
    graphEdges,
    recommendationFeedback,
    lecturerOverrides,
    currentUser.institutionId,
  ]);

  return (
    <NexoraContext.Provider
      value={{
        currentUser,
        activeSubRole,
        allUsers: managedUsers,
        profile,
        studentSkills,
        pathways,
        opportunities,
        evidenceList,
        goals,
        notifications,
        courses,
        graphNodes,
        graphEdges,
        learningGroups,
        rubrics,
        enrolledStudents,
        mappingApprovals,
        microSkills,
        organizationProfile,
        flaggedCompetencies,
        collaborationProjects,
        studentConsentRecords,
        auditLogs,
        institutionalTenants,
        userInvitations,
        privacyRequests,
        recommendationBundle,
        recommendationFeedback,
        lecturerOverrides,
        submitRecommendationFeedback,
        overrideLecturerRecommendation,

        switchUserRole,
        switchUserAccount,
        updateUserAccountStatus,
        updateUserAssignedRoles,
        createUserInvitation,
        revokeUserInvitation,
        updateInstitutionalTenantStatus,
        resolvePrivacyDataRequest,
        recordSecurityAuditEvent,
        updateProfile,
        updateSkillScore,
        updateSelfReportedSkill,
        completeActivity,
        toggleSaveOpportunity,
        expressInterestInOpportunity,
        withdrawStudentConsent,
        recordExternalApplicationClick,
        submitEvidence,
        submitDraftEvidenceForReview,
        addGoal,
        updateGoal,
        deleteGoal,
        togglePauseGoal,
        prioritizeGoal,
        markNotificationRead,
        resetToDemoData,

        addCourseOutcome,
        addMicroSkill,
        addGraphNode,
        editGraphNode,
        addGraphEdge,
        removeGraphEdge,
        updateLearningGroup,
        createLearningGroup,
        publishLearningActivity,
        reviewEvidence,
        reviewOpportunity,
        approveMappingOutcome,
        approveCollaborationProject,
        resolveFlaggedCompetency,
        updateOrganizationVerificationStatus,

        updateOrganizationProfile,
        addOrganizationRepresentative,
        saveOrSubmitOpportunity,
        publishApprovedOpportunity,
        archiveOpportunity,
        deleteDraftOpportunity,
        flagMissingCompetency,
        createCollaborationProject,
        toggleProjectMilestone,
      }}
    >
      {children}
    </NexoraContext.Provider>
  );
};

export const useNexora = () => {
  const context = useContext(NexoraContext);
  if (!context) {
    throw new Error('useNexora must be used within a NexoraProvider');
  }
  return context;
};
