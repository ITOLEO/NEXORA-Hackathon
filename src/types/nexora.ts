export type UserRole = 'student' | 'lecturer' | 'industry';

export type InstitutionalRoleLabel =
  | 'Student'
  | 'Lecturer'
  | 'Industry Partner'
  | 'Academic Administrator'
  | 'Authorized Opportunity Reviewer'
  | 'Institutional Administrator'
  | 'Technical Administrator'
  | 'Platform Super Administrator';

export type AccountStatus =
  | 'Invitation Pending'
  | 'Active'
  | 'Email Verification Pending'
  | 'Suspended'
  | 'Deactivated'
  | 'Access Revoked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionalRoleLabel?: InstitutionalRoleLabel;
  assignedRoles?: InstitutionalRoleLabel[];
  accountStatus?: AccountStatus;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  avatarUrl: string;
  institution: string;
  institutionId?: string;
  organizationId?: string;
  assignedCourseIds?: string[];
  title?: string;
  isProgramAdmin?: boolean;
  isOpportunityReviewer?: boolean;
  isInstitutionalAdmin?: boolean;
  isTechnicalAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export interface LearnerProfile {
  id: string;
  userId: string;
  studentName: string;
  avatarUrl: string;
  universityName: string;
  facultyName: string;
  programName: string;
  semester: number;
  expectedGraduation: string;
  gpa: number;
  academicGoal: string;
  careerGoal: string;
  interests: string[];
  learningPreferences: string[];
  onboardingCompleted?: boolean;
  updatedAt?: string;
}

export type MasteryLevel = 'mastered' | 'in_progress' | 'needs_support' | 'not_assessed';

export type EvidenceProvenanceType =
  | 'Lecturer-validated competency'
  | 'Diagnostic assessment result'
  | 'External certificate or portfolio evidence'
  | 'Self-reported skill'
  | 'Not assessed';

export interface CompetencyCluster {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
}

export interface MicroSkill {
  id: string;
  clusterId: string;
  name: string;
  category: string;
  level: 'Foundational' | 'Intermediate' | 'Advanced' | 'Specialized';
  description: string;
  indicators?: string[];
  prerequisiteSkillIds?: string[];
}

export interface SkillAssessmentRecord {
  id: string;
  date: string;
  provenance: EvidenceProvenanceType;
  score: number;
  evaluator: string;
  confidenceNote: string;
}

export interface StudentSkill {
  skillId: string;
  masteryLevel: MasteryLevel;
  score: number; // 0 - 100 (0 when not_assessed)
  verifiedByLecturer: boolean;
  validatorName?: string;
  validatorTitle?: string;
  lastAssessedAt: string;
  selfAssessedConfidence: number; // 1 - 5 stars
  evidenceCount: number;
  provenance?: EvidenceProvenanceType;
  confidenceQuality?: 'High (Lecturer Verified)' | 'Moderate (Diagnostic / Portfolio)' | 'Preliminary (Self-Reported)' | 'Unassessed';
  assessmentHistory?: SkillAssessmentRecord[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'Official Course' | 'Interactive Lab' | 'Academic Paper' | 'Industry Guide';
  verifiedUrl: string;
  provider: string;
  estimatedMinutes: number;
}

export interface LearningActivity {
  id: string;
  title: string;
  type: 'Quiz' | 'Practical Task' | 'Project Submission' | 'Peer Review';
  completed: boolean;
  dueDate?: string;
  courseId?: string;
  assignedGroupId?: string;
  isExportedForOffline?: boolean;
  publishedBy?: string;
}

export interface LearningPathModule {
  id: string;
  title: string;
  code: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  completionPercentage: number;
  estimatedHours: number;
  prerequisiteSkillIds: string[];
  targetSkillIds: string[];
  resources: LearningResource[];
  activities: LearningActivity[];
  startsAt?: string;
  mappedOutcomes?: string[];
}

export type OpportunityCategory =
  | 'Internship'
  | 'Industry Project'
  | 'Business Case Competition'
  | 'Innovation Challenge'
  | 'Mentoring'
  | 'Training'
  | 'Sponsored Program'
  | 'Challenge'
  | 'Research Project'
  | 'Industry Fellowship';

export type OpportunityPublicationStatus =
  | 'Draft'
  | 'Submitted for Review'
  | 'Needs Revision'
  | 'Approved'
  | 'Published'
  | 'Rejected'
  | 'Expired'
  | 'Archived';

export interface Opportunity {
  id: string;
  organizationId?: string;
  title: string;
  organization: string;
  orgLogo?: string;
  category: OpportunityCategory;
  description?: string;
  location: string;
  startDate?: string;
  deadline: string;
  duration?: string;
  availablePositions?: number;
  academicPrograms?: string[];
  studyLevel?: string;
  eligibility: string;
  requiredSkillIds: string[];
  relevantSkillIds: string[];
  optionalSkillIds?: string[];
  matchPercentage: number;
  matchExplanation: {
    relevanceSummary: string;
    matchingInterests: string[];
    evidencedSkills: string[];
    gapSkills: string[];
    eligibilityMet: boolean;
    eligibilityNotes: string;
  };
  applicationMethod?: string;
  officialUrl: string;
  contactEmail?: string;
  supportingDocuments?: string[];
  isSaved: boolean;
  isApplied: boolean;
  expressInterestCount: number;
  viewsCount?: number;
  bookmarksCount?: number;
  externalClicksCount?: number;
  publicationStatus?: OpportunityPublicationStatus;
  reviewStatus?: 'approved' | 'pending' | 'needs_correction' | 'rejected';
  reviewerFeedback?: string;
  isDemo?: boolean;
}

export type EvidenceStatus =
  | 'draft'
  | 'submitted'
  | 'pending'
  | 'approved'
  | 'revision_requested'
  | 'rejected';

export interface SkillEvidence {
  id: string;
  title: string;
  type: 'Cap Stone Project' | 'Industry Certificate' | 'Verified Assessment' | 'Research Paper' | 'Code Repository';
  description: string;
  url?: string;
  skillIds: string[];
  status: EvidenceStatus;
  submittedAt: string;
  verifiedAt?: string;
  validatorName?: string;
  lecturerFeedback?: string;
  isDemo: boolean;
  studentId?: string;
  studentName?: string;
}

export interface StudentGoal {
  id: string;
  title: string;
  category: 'Career' | 'Academic' | 'Skill Mastery';
  targetDate: string;
  progressPercentage: number;
  targetSkillIds: string[];
  status: 'active' | 'completed';
  notes: string;
  priorityWeight?: number; // 1 (Standard) to 3 (Critical Priority)
  paused?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  targetSkillId: string;
  points: number;
}

export interface AssessmentSession {
  id: string;
  title: string;
  targetSkillId: string;
  skillName: string;
  questions: AssessmentQuestion[];
  durationMinutes: number;
}

export type CrossPortalEventType =
  | 'EVENT_1_EVIDENCE'
  | 'EVENT_2_CPMK_MAPPING'
  | 'EVENT_3_OPPORTUNITY'
  | 'EVENT_4_CONSENT_INTEREST'
  | 'EVENT_5_ACTIVITY_PUBLISHED'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'evidence' | 'deadline' | 'opportunity' | 'recommendation';
  eventType?: CrossPortalEventType;
  recipientRole?: UserRole | 'all';
  relatedRecordId?: string;
  navigationTarget?: string;
  actionUrl?: string;
  dedupeKey?: string;
}

// PRD 02 Lecturer Portal Extensions
export interface Course {
  id: string;
  code: string;
  name: string;
  section?: string;
  term: string;
  instructorId: string;
  instructorName: string;
  enrolledCount: number;
  completionRate: number;
  cplCodes?: string[];
  learningOutcomes: {
    id: string;
    code?: string;
    cplCode?: string;
    text: string;
    mappedSkillIds: string[];
    approvalStatus: 'approved' | 'pending';
  }[];
  competencyIds: string[];
  description: string;
}

export type GraphNodeType =
  | 'Institution'
  | 'Faculty'
  | 'Program'
  | 'Course'
  | 'Outcome'
  | 'CompetencyCluster'
  | 'Competency'
  | 'Skill'
  | 'MicroSkill'
  | 'Concept'
  | 'Resource'
  | 'Assessment'
  | 'Rubric'
  | 'Opportunity';

export type GraphEdgeRelationship =
  | 'HAS_FACULTY'
  | 'OFFERS_PROGRAM'
  | 'CONTAINS_COURSE'
  | 'HAS_LEARNING_OUTCOME'
  | 'COURSE_SUPPORTS_OUTCOME'
  | 'BELONGS_TO_PROGRAM'
  | 'CONTAINS_COMPETENCY'
  | 'CONTAINS_SKILL'
  | 'CONTAINS_MICRO_SKILL'
  | 'PART_OF'
  | 'CONTAINS'
  | 'SUPPORTS'
  | 'REQUIRES'
  | 'EXPLAINS'
  | 'ASSESSES'
  | 'DEVELOPS'
  | 'ALIGNS_WITH'
  | 'RELATED_TO'
  | 'REQUIRES_SKILL'
  | 'RECOMMENDS_SKILL';

export type GraphEntityStatus = 'Draft' | 'Active' | 'Deprecated' | 'Pending Approval';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  code?: string;
  canonicalCode?: string;
  institutionId?: string;
  description?: string;
  observableIndicators?: string[];
  proficiencyCriteria?: string;
  knowledgeAreas?: string[];
  status?: GraphEntityStatus;
  version?: string;
  provenance?: string;
  createdAt?: string;
  updatedAt?: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: GraphEdgeRelationship;
  institutionId?: string;
  status?: GraphEntityStatus;
  version?: string;
  createdBy?: string;
  provenance?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GraphVersionRecord {
  id: string;
  institutionId: string;
  targetNodeId: string;
  targetNodeLabel: string;
  previousVersion: string;
  proposedVersion: string;
  changeSummary: string;
  affectedCourses: string[];
  connectedResources: string[];
  affectedAssessments: string[];
  status: 'Pending Approval' | 'Approved' | 'Archived';
  createdBy: string;
  createdAt: string;
}

export interface ImportValidationIssue {
  rowOrIndex: number;
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'duplicate';
}

export interface ImportJobRecord {
  id: string;
  institutionId: string;
  format: 'CSV' | 'JSON';
  dataType: 'kg_nodes' | 'kg_edges' | 'micro_skills';
  totalRecords: number;
  validRecords: number;
  errorCount: number;
  duplicateCount: number;
  status: 'Dry-Run Validated' | 'Imported' | 'Rejected';
  createdBy: string;
  createdAt: string;
  summaryNote: string;
}

export interface FlexibleLearningGroup {
  id: string;
  courseId: string;
  groupName: string;
  focusSkillId: string;
  focusSkillName: string;
  supportLevel: 'High Growth Need' | 'Core Advancement' | 'Advanced Specialization';
  recommendedIntervention: string;
  studentUserIds: string[];
  createdDate: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  description: string;
}

export type AssessmentLifecycleState =
  | 'Draft'
  | 'Published'
  | 'Open'
  | 'Submitted'
  | 'Under Review'
  | 'Assessed'
  | 'Revision Requested'
  | 'Closed';

export interface AssessmentRubric {
  id: string;
  courseId: string;
  title: string;
  mappedSkillId: string;
  mappedSkillName: string;
  totalPoints: number;
  criteria: RubricCriterion[];
  status: 'active' | 'draft';
  lifecycleState?: AssessmentLifecycleState;
}

export interface EnrolledStudentSummary {
  userId: string;
  studentName: string;
  avatarUrl: string;
  email: string;
  gpa: number;
  masteredCount: number;
  inProgressCount: number;
  needsSupportCount: number;
  pendingEvidenceCount: number;
}

export interface MappingApprovalRecord {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  outcomeText: string;
  requestedBy: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt: string;
}

// PRD 03 Industry Portal Extensions
export interface OrganizationRepresentative {
  id: string;
  name: string;
  roleTitle: string;
  email: string;
  isPrimary: boolean;
  verified: boolean;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  organizationType: 'Enterprise Corporation' | 'High-Growth Startup' | 'Research Institute' | 'Non-Profit / NGO' | 'Government Agency';
  sector: string;
  website: string;
  location: string;
  description: string;
  logoUrl: string;
  verifiedStatus: 'verified' | 'pending' | 'unverified' | 'rejected' | 'suspended';
  partnershipStatus: 'Official University Partner' | 'Provisional Partner' | 'Pending Institutional Review';
  partnerUniversities: string[];
  representatives: OrganizationRepresentative[];
  isDemo: boolean;
}

export type RequirementTier =
  | 'Mandatory Eligibility'
  | 'Required Competency'
  | 'Recommended Competency'
  | 'Optional Competency';

export interface FlaggedCompetencyProposal {
  id: string;
  organizationId: string;
  organizationName: string;
  plainLanguageRequirement: string;
  suggestedClusterId: string;
  requirementTier: RequirementTier;
  status: 'Flagged for University Review' | 'Mapped to Existing Taxonomy' | 'Approved by Curriculum Board';
  submittedAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  deliverableNote: string;
}

export interface CollaborationProject {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  category: 'Joint Capstone Project' | 'Applied AI Research' | 'Industry Mentoring Program' | 'Curriculum Case Study';
  description: string;
  learningObjectives: string[];
  requiredSkillIds: string[];
  universityPartner: string;
  academicCoordinator: string;
  mentorName: string;
  mentorRole: string;
  mentorEmail: string;
  duration: string;
  status: 'Proposed' | 'Under University Review' | 'Active' | 'Completed';
  milestones: ProjectMilestone[];
  submittedAt: string;
  isDemo: boolean;
}

export interface StudentConsentShareRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organizationId: string;
  studentId: string;
  studentDisplayName: string;
  universityName: string;
  programName: string;
  semester: number;
  consentGranted: boolean;
  sharedFields: ('program_semester' | 'verified_skills' | 'approved_portfolio_links' | 'career_goal')[];
  evidencedSkillNames: string[];
  portfolioUrl?: string;
  applicationProgress: 'Expressed Interest' | 'Clicked Official Link' | 'Application Submitted Externally' | 'Withdrawn';
  sharedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUid?: string;
  actorName: string;
  actorRole: UserRole;
  actorSecurityRole?: InstitutionalRoleLabel;
  institutionId?: string;
  organizationId?: string;
  action: string;
  targetName: string;
  resourceType?: string;
  resourceId?: string;
  outcome?: 'SUCCESS' | 'DENIED';
  previousState?: string;
  newState?: string;
  classification?: 'Public' | 'Institutional' | 'Confidential' | 'Restricted';
  timestamp: string;
  eventType?: CrossPortalEventType;
}

export interface InstitutionalTenant {
  id: string;
  name: string;
  domain: string;
  ssoProvider: 'Google Workspace' | 'Microsoft Entra ID' | 'SAML 2.0 Institutional';
  status: 'Active' | 'Suspended' | 'Onboarding';
  facultyCount: number;
  studentCount: number;
  dataResidencyRegion: string;
  strictDomainCheck: boolean;
}

export interface UserInvitationRecord {
  id: string;
  email: string;
  assignedRole: InstitutionalRoleLabel;
  institutionId: string;
  organizationId?: string;
  invitedBy: string;
  expiresAt: string;
  status: 'Invitation Pending' | 'Accepted' | 'Expired' | 'Revoked';
}

export interface PrivacyDataRequest {
  id: string;
  studentId: string;
  studentName: string;
  institutionId: string;
  requestType:
    | 'Export Personal Data (JSON/PDF)'
    | 'Revoke All Opportunity Consents'
    | 'Account Deactivation & Anonymization';
  status: 'Pending Review' | 'Completed' | 'Retained Official Academic Record Only';
  requestedAt: string;
  resolutionNote: string;
}


