export type NexoraSecurityRole =
  | 'Student'
  | 'Lecturer'
  | 'Industry'
  | 'Academic Administrator'
  | 'Opportunity Reviewer'
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

export type DataClassification = 'Public' | 'Institutional' | 'Confidential' | 'Restricted';

export interface SecurityActor {
  uid: string;
  email: string;
  name: string;
  roles: NexoraSecurityRole[];
  activeRole: NexoraSecurityRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  institutionId?: string;
  facultyId?: string;
  programId?: string;
  assignedCourseIds?: string[];
  organizationId?: string;
  organizationVerifiedStatus?: 'verified' | 'pending' | 'unverified' | 'rejected' | 'suspended';
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  emergencyTimeLimitedAccess?: {
    grantedBy: string;
    expiresAt: string;
    reason: string;
    targetStudentId: string;
  };
}

export type SecurityCollection =
  | 'users'
  | 'institutions'
  | 'organizations'
  | 'courses'
  | 'knowledge_graph'
  | 'learner_profiles'
  | 'student_skills'
  | 'evidence_reviews'
  | 'learning_paths'
  | 'opportunities'
  | 'collaboration_projects'
  | 'student_interest'
  | 'audit_logs'
  | 'institutional_settings'
  | 'evidence_files';

export type SecurityAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'publish'
  | 'assign_role'
  | 'suspend_account'
  | 'revoke_consent'
  | 'upload_file'
  | 'download_file';

export interface ResourceDescriptor {
  collection: SecurityCollection;
  resourceId: string;
  ownerUserId?: string;
  institutionId?: string;
  organizationId?: string;
  courseId?: string;
  instructorId?: string;
  enrolledStudentIds?: string[];
  consentGranted?: boolean;
  consentExpired?: boolean;
  sharedFields?: string[];
  requestedFieldsToRead?: string[];
  updatedFields?: string[];
  publicationStatus?: string;
  classification?: DataClassification;
}

export type AuthorizationCode =
  | 'AUTHORIZED'
  | 'DENIED_UNAUTHENTICATED'
  | 'DENIED_ACCOUNT_INACTIVE'
  | 'DENIED_EMAIL_UNVERIFIED'
  | 'DENIED_TENANT_ISOLATION'
  | 'DENIED_ORG_ISOLATION'
  | 'DENIED_ROLE_INSUFFICIENT'
  | 'DENIED_FIELD_RESTRICTED'
  | 'DENIED_PRIVACY_CONSENT'
  | 'DENIED_IMMUTABLE_AUDIT'
  | 'DENIED_SELF_APPROVAL'
  | 'DENIED_COURSE_SCOPE'
  | 'DENIED_PRIVATE_LEARNER_RECORD';

export interface AuthorizationDecision {
  allowed: boolean;
  code: AuthorizationCode;
  reason: string;
  auditRequired: boolean;
  classification: DataClassification;
}

export interface FileUploadValidationRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  targetStoragePath: string;
  targetInstitutionId: string;
  targetStudentId: string;
}

export interface FileUploadValidationResult {
  allowed: boolean;
  code:
    | 'VALID_UPLOAD'
    | 'DENIED_UNAUTHENTICATED'
    | 'DENIED_ACCOUNT_INACTIVE'
    | 'DENIED_FORMAT'
    | 'DENIED_MIME_MISMATCH'
    | 'DENIED_SIZE_LIMIT'
    | 'DENIED_PATH_OWNERSHIP';
  reason: string;
  maxAllowedBytes: number;
}

export const ALLOWED_EVIDENCE_FORMATS: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const DATA_CLASSIFICATION_MAP: Record<SecurityCollection, DataClassification> = {
  opportunities: 'Public',
  institutions: 'Institutional',
  courses: 'Institutional',
  knowledge_graph: 'Institutional',
  learning_paths: 'Institutional',
  collaboration_projects: 'Institutional',
  organizations: 'Institutional',
  learner_profiles: 'Confidential',
  student_skills: 'Confidential',
  evidence_reviews: 'Confidential',
  student_interest: 'Confidential',
  evidence_files: 'Confidential',
  users: 'Restricted',
  audit_logs: 'Restricted',
  institutional_settings: 'Restricted',
};

const STUDENT_ALLOWED_PROFILE_FIELDS = [
  'academicGoal',
  'careerGoal',
  'interests',
  'learningPreferences',
  'onboardingCompleted',
  'updatedAt',
];

const STUDENT_RESTRICTED_SKILL_FIELDS = [
  'score',
  'masteryLevel',
  'verifiedByLecturer',
  'validatorName',
  'validatorTitle',
  'confidenceQuality',
];

const PRIVILEGED_PROTECTED_USER_FIELDS = [
  'role',
  'roles',
  'activeRole',
  'accountStatus',
  'institutionId',
  'organizationId',
  'isProgramAdmin',
  'isOpportunityReviewer',
  'isInstitutionalAdmin',
];

/**
 * NEXORA Server & Application RBAC Authorization Engine (PRD 06 Sections 6-14)
 * Enforces Default-Deny, Account Status Checks, Multi-Tenant Isolation,
 * Field-Level Write Protection, Student Consent Boundaries, and Least Privilege.
 */
export function authorizeOperation(
  actor: SecurityActor | null | undefined,
  action: SecurityAction,
  resource: ResourceDescriptor
): AuthorizationDecision {
  const classification =
    resource.classification || DATA_CLASSIFICATION_MAP[resource.collection] || 'Confidential';

  // 1. Default Deny if unauthenticated
  if (!actor || !actor.uid) {
    return {
      allowed: false,
      code: 'DENIED_UNAUTHENTICATED',
      reason: 'Unauthenticated request denied. Every user must have a verified identity.',
      auditRequired: true,
      classification,
    };
  }

  // 2. Account Status Check (Must be Active)
  if (actor.accountStatus !== 'Active') {
    return {
      allowed: false,
      code: 'DENIED_ACCOUNT_INACTIVE',
      reason: `Account status is '${actor.accountStatus}'. Suspended, revoked, deactivated, or pending accounts cannot access protected resources.`,
      auditRequired: true,
      classification,
    };
  }

  if (!actor.emailVerified) {
    return {
      allowed: false,
      code: 'DENIED_EMAIL_UNVERIFIED',
      reason: 'Email verification is required before accessing institutional workspaces.',
      auditRequired: true,
      classification,
    };
  }

  // Ensure activeRole is actually assigned in actor.roles
  const hasActiveRole = actor.roles.includes(actor.activeRole);
  if (!hasActiveRole) {
    return {
      allowed: false,
      code: 'DENIED_ROLE_INSUFFICIENT',
      reason: `Active workspace role '${actor.activeRole}' is not in actor's authorized role list.`,
      auditRequired: true,
      classification,
    };
  }

  const role = actor.activeRole;

  // 3. Append-Only Audit Log Protection (PRD 06 Section 13)
  if (resource.collection === 'audit_logs') {
    if (action === 'update' || action === 'delete') {
      return {
        allowed: false,
        code: 'DENIED_IMMUTABLE_AUDIT',
        reason: 'Audit logs are strictly append-only. No role may modify or delete audit log records.',
        auditRequired: true,
        classification: 'Restricted',
      };
    }
    if (action === 'create') {
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Authenticated active actor permitted to append security audit entry.',
        auditRequired: false,
        classification: 'Restricted',
      };
    }
    if (action === 'read') {
      if (
        role === 'Institutional Administrator' ||
        role === 'Technical Administrator' ||
        role === 'Platform Super Administrator' ||
        role === 'Academic Administrator'
      ) {
        if (
          role !== 'Platform Super Administrator' &&
          resource.institutionId &&
          actor.institutionId &&
          resource.institutionId !== actor.institutionId
        ) {
          return {
            allowed: false,
            code: 'DENIED_TENANT_ISOLATION',
            reason: `Cross-tenant audit log read denied (${actor.institutionId} vs ${resource.institutionId}).`,
            auditRequired: true,
            classification: 'Restricted',
          };
        }
        return {
          allowed: true,
          code: 'AUTHORIZED',
          reason: `Authorized ${role} audit log inspection.`,
          auditRequired: true,
          classification: 'Restricted',
        };
      }
      return {
        allowed: false,
        code: 'DENIED_ROLE_INSUFFICIENT',
        reason: `Role '${role}' is not authorized to read restricted audit logs.`,
        auditRequired: true,
        classification: 'Restricted',
      };
    }
  }

  // 4. Prevent unauthorized modification of institutionId or organizationId on any update
  if (action === 'update' && resource.updatedFields) {
    if (
      resource.updatedFields.includes('institutionId') &&
      role !== 'Platform Super Administrator'
    ) {
      return {
        allowed: false,
        code: 'DENIED_TENANT_ISOLATION',
        reason: 'Modification of tenant identifier (institutionId) is prohibited.',
        auditRequired: true,
        classification,
      };
    }
    if (
      resource.updatedFields.includes('organizationId') &&
      role !== 'Platform Super Administrator' &&
      role !== 'Institutional Administrator'
    ) {
      return {
        allowed: false,
        code: 'DENIED_ORG_ISOLATION',
        reason: 'Modification of organization identifier (organizationId) is prohibited.',
        auditRequired: true,
        classification,
      };
    }
  }

  // 5. Users & Role Assignment Protection (PRD 06 Section 6.3 & 7)
  if (resource.collection === 'users') {
    if (action === 'assign_role' || action === 'suspend_account') {
      if (
        role !== 'Institutional Administrator' &&
        role !== 'Technical Administrator' &&
        role !== 'Platform Super Administrator'
      ) {
        return {
          allowed: false,
          code: 'DENIED_ROLE_INSUFFICIENT',
          reason: `Role '${role}' cannot assign roles or suspend user accounts.`,
          auditRequired: true,
          classification: 'Restricted',
        };
      }
      if (
        role !== 'Platform Super Administrator' &&
        resource.institutionId &&
        actor.institutionId &&
        resource.institutionId !== actor.institutionId
      ) {
        return {
          allowed: false,
          code: 'DENIED_TENANT_ISOLATION',
          reason: 'Administrators cannot modify user roles outside their assigned institution.',
          auditRequired: true,
          classification: 'Restricted',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `Server-validated role/status change by ${role}.`,
        auditRequired: true,
        classification: 'Restricted',
      };
    }

    if (action === 'update') {
      const touchesPrivilegedField = (resource.updatedFields || []).some(f =>
        PRIVILEGED_PROTECTED_USER_FIELDS.includes(f)
      );
      if (
        touchesPrivilegedField &&
        role !== 'Institutional Administrator' &&
        role !== 'Technical Administrator' &&
        role !== 'Platform Super Administrator'
      ) {
        return {
          allowed: false,
          code: 'DENIED_FIELD_RESTRICTED',
          reason: 'Users cannot self-assign roles, privilege flags, or account status from client updates.',
          auditRequired: true,
          classification: 'Restricted',
        };
      }
      if (actor.uid === resource.ownerUserId || actor.uid === resource.resourceId) {
        return {
          allowed: true,
          code: 'AUTHORIZED',
          reason: 'User permitted to update non-privileged personal account fields.',
          auditRequired: false,
          classification: 'Restricted',
        };
      }
    }
  }

  // 6. Private Learner Profile & Student Skill Records (PRD 06 Section 7.1, 7.7, 7.8 & 10)
  if (resource.collection === 'learner_profiles' || resource.collection === 'student_skills') {
    // Technical Admin & Platform Super Admin MUST NOT receive automatic unrestricted access to private student assessment records
    if (role === 'Technical Administrator' || role === 'Platform Super Administrator') {
      const hasValidEmergencyGrant =
        actor.emergencyTimeLimitedAccess &&
        actor.emergencyTimeLimitedAccess.targetStudentId === resource.ownerUserId &&
        new Date(actor.emergencyTimeLimitedAccess.expiresAt).getTime() > Date.now();

      if (!hasValidEmergencyGrant) {
        return {
          allowed: false,
          code: 'DENIED_PRIVATE_LEARNER_RECORD',
          reason: `${role} does not have automatic access to private learner profiles or competency assessment records without an active time-limited emergency authorization.`,
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `Emergency time-limited access verified and logged for ${role}.`,
        auditRequired: true,
        classification: 'Confidential',
      };
    }

    // Industry users cannot browse or read raw learner_profiles or student_skills directly (must go through consented student_interest)
    if (role === 'Industry') {
      return {
        allowed: false,
        code: 'DENIED_PRIVACY_CONSENT',
        reason: 'Industry partners cannot directly read private learner profiles or assessment records. Access is restricted to consented student_interest shares.',
        auditRequired: true,
        classification: 'Confidential',
      };
    }

    // Opportunity Reviewer cannot read private learner profiles or grades
    if (role === 'Opportunity Reviewer') {
      return {
        allowed: false,
        code: 'DENIED_ROLE_INSUFFICIENT',
        reason: 'Opportunity Reviewers do not have access to private student learner profiles or competency scores.',
        auditRequired: true,
        classification: 'Confidential',
      };
    }

    // Student rules
    if (role === 'Student') {
      if (resource.ownerUserId && resource.ownerUserId !== actor.uid) {
        return {
          allowed: false,
          code: 'DENIED_PRIVACY_CONSENT',
          reason: `Student '${actor.uid}' cannot read or modify another student's record ('${resource.ownerUserId}').`,
          auditRequired: true,
          classification: 'Confidential',
        };
      }

      if (action === 'read') {
        return {
          allowed: true,
          code: 'AUTHORIZED',
          reason: 'Student authorized to read their own learner profile and competency records.',
          auditRequired: false,
          classification: 'Confidential',
        };
      }

      if (action === 'update') {
        if (resource.collection === 'student_skills') {
          const touchesOfficialScore = (resource.updatedFields || []).some(f =>
            STUDENT_RESTRICTED_SKILL_FIELDS.includes(f)
          );
          if (touchesOfficialScore) {
            return {
              allowed: false,
              code: 'DENIED_FIELD_RESTRICTED',
              reason: 'Students cannot directly modify official competency scores, mastery levels, or lecturer verification flags.',
              auditRequired: true,
              classification: 'Confidential',
            };
          }
          return {
            allowed: true,
            code: 'AUTHORIZED',
            reason: 'Student authorized to update self-reported confidence stars.',
            auditRequired: false,
            classification: 'Confidential',
          };
        }

        // learner_profiles update
        const invalidProfileFields = (resource.updatedFields || []).filter(
          f => !STUDENT_ALLOWED_PROFILE_FIELDS.includes(f)
        );
        if (invalidProfileFields.length > 0) {
          return {
            allowed: false,
            code: 'DENIED_FIELD_RESTRICTED',
            reason: `Student cannot modify restricted academic fields: ${invalidProfileFields.join(', ')}.`,
            auditRequired: true,
            classification: 'Confidential',
          };
        }

        return {
          allowed: true,
          code: 'AUTHORIZED',
          reason: 'Student authorized to update personal goals, interests, and learning preferences.',
          auditRequired: false,
          classification: 'Confidential',
        };
      }
    }

    // Lecturer / Academic Admin / Institutional Admin rules
    if (
      role === 'Lecturer' ||
      role === 'Academic Administrator' ||
      role === 'Institutional Administrator'
    ) {
      if (
        resource.institutionId &&
        actor.institutionId &&
        resource.institutionId !== actor.institutionId
      ) {
        return {
          allowed: false,
          code: 'DENIED_TENANT_ISOLATION',
          reason: `Cross-institution access denied (${actor.institutionId} vs ${resource.institutionId}).`,
          auditRequired: true,
          classification: 'Confidential',
        };
      }

      if (role === 'Lecturer') {
        // Lecturer must be assigned to the course or student cohort
        if (
          resource.courseId &&
          actor.assignedCourseIds &&
          !actor.assignedCourseIds.includes(resource.courseId)
        ) {
          return {
            allowed: false,
            code: 'DENIED_COURSE_SCOPE',
            reason: `Lecturer '${actor.uid}' is not assigned to course '${resource.courseId}'.`,
            auditRequired: true,
            classification: 'Confidential',
          };
        }
      }

      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `${role} authorized within institutional and course scope.`,
        auditRequired: action !== 'read',
        classification: 'Confidential',
      };
    }
  }

  // 7. Evidence Submissions & Assessments (evidence_reviews & evidence_files)
  if (resource.collection === 'evidence_reviews' || resource.collection === 'evidence_files') {
    if (role === 'Technical Administrator' || role === 'Platform Super Administrator') {
      return {
        allowed: false,
        code: 'DENIED_PRIVATE_LEARNER_RECORD',
        reason: `${role} is denied automatic access to private student assessment and evidence artifacts.`,
        auditRequired: true,
        classification: 'Confidential',
      };
    }

    if (role === 'Student') {
      if (resource.ownerUserId && resource.ownerUserId !== actor.uid) {
        return {
          allowed: false,
          code: 'DENIED_PRIVACY_CONSENT',
          reason: 'Students cannot read, download, or modify another student’s assessment or evidence submission.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      if (action === 'approve') {
        return {
          allowed: false,
          code: 'DENIED_SELF_APPROVAL',
          reason: 'Students cannot approve or validate their own competency evidence.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      if (
        action === 'update' &&
        (resource.updatedFields || []).some(f =>
          ['status_approved', 'verifiedAt', 'validatorName', 'lecturerFeedback'].includes(f)
        )
      ) {
        return {
          allowed: false,
          code: 'DENIED_FIELD_RESTRICTED',
          reason: 'Students cannot modify lecturer verification fields on evidence records.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Student authorized to submit or view their own learning evidence.',
        auditRequired: action === 'create' || action === 'upload_file',
        classification: 'Confidential',
      };
    }

    if (role === 'Lecturer' || role === 'Academic Administrator') {
      if (
        resource.institutionId &&
        actor.institutionId &&
        resource.institutionId !== actor.institutionId
      ) {
        return {
          allowed: false,
          code: 'DENIED_TENANT_ISOLATION',
          reason: 'Cannot access student evidence from another institution.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      if (
        role === 'Lecturer' &&
        resource.courseId &&
        actor.assignedCourseIds &&
        !actor.assignedCourseIds.includes(resource.courseId)
      ) {
        return {
          allowed: false,
          code: 'DENIED_COURSE_SCOPE',
          reason: `Lecturer is not assigned to course '${resource.courseId}'.`,
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `${role} authorized to inspect and evaluate assigned student evidence.`,
        auditRequired: action === 'approve' || action === 'update',
        classification: 'Confidential',
      };
    }

    if (role === 'Industry') {
      // Industry can only download/view evidence if explicit consent is granted and not expired
      if (action === 'read' || action === 'download_file') {
        if (
          resource.consentGranted &&
          !resource.consentExpired &&
          resource.organizationId === actor.organizationId &&
          (resource.sharedFields || []).includes('approved_portfolio_links')
        ) {
          return {
            allowed: true,
            code: 'AUTHORIZED',
            reason: 'Industry partner authorized via explicit, non-expired student portfolio consent.',
            auditRequired: true,
            classification: 'Confidential',
          };
        }
      }
      return {
        allowed: false,
        code: 'DENIED_PRIVACY_CONSENT',
        reason: 'Industry partner cannot access student evidence without explicit, active portfolio sharing consent.',
        auditRequired: true,
        classification: 'Confidential',
      };
    }
  }

  // 8. Courses & Knowledge Graph (PRD 06 Section 7.2 & 7.4)
  if (resource.collection === 'courses' || resource.collection === 'knowledge_graph') {
    if (
      resource.institutionId &&
      actor.institutionId &&
      resource.institutionId !== actor.institutionId &&
      role !== 'Platform Super Administrator'
    ) {
      return {
        allowed: false,
        code: 'DENIED_TENANT_ISOLATION',
        reason: 'Cross-institution access to curriculum or knowledge graph is prohibited.',
        auditRequired: true,
        classification: 'Institutional',
      };
    }

    if (action === 'read') {
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Authorized read of institutional curriculum and knowledge graph.',
        auditRequired: false,
        classification: 'Institutional',
      };
    }

    if (role === 'Industry' || role === 'Student' || role === 'Opportunity Reviewer') {
      return {
        allowed: false,
        code: 'DENIED_ROLE_INSUFFICIENT',
        reason: `Role '${role}' cannot modify official institutional courses or competency taxonomy.`,
        auditRequired: true,
        classification: 'Institutional',
      };
    }

    if (role === 'Lecturer') {
      if (
        resource.collection === 'courses' &&
        resource.instructorId &&
        resource.instructorId !== actor.uid &&
        !(actor.assignedCourseIds || []).includes(resource.resourceId)
      ) {
        return {
          allowed: false,
          code: 'DENIED_COURSE_SCOPE',
          reason: `Lecturer '${actor.uid}' cannot edit another lecturer's unassigned course ('${resource.resourceId}').`,
          auditRequired: true,
          classification: 'Institutional',
        };
      }
      if (action === 'approve') {
        return {
          allowed: false,
          code: 'DENIED_ROLE_INSUFFICIENT',
          reason: 'Only Academic Administrators or Institutional Administrators can approve official curriculum outcome mappings.',
          auditRequired: true,
          classification: 'Institutional',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Lecturer authorized to update assigned course outcomes and propose graph mappings.',
        auditRequired: true,
        classification: 'Institutional',
      };
    }

    if (role === 'Academic Administrator' || role === 'Institutional Administrator') {
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `${role} authorized to manage and approve institutional curriculum and competency taxonomy.`,
        auditRequired: true,
        classification: 'Institutional',
      };
    }
  }

  // 9. Organizations & Opportunities (PRD 06 Section 7.3 & 7.5 & 8.2)
  if (resource.collection === 'organizations' || resource.collection === 'opportunities') {
    if (role === 'Industry') {
      // Organization Isolation
      if (
        resource.organizationId &&
        actor.organizationId &&
        resource.organizationId !== actor.organizationId
      ) {
        // Exception: reading a Published public opportunity is allowed, but reading another org's draft/private data is denied
        if (
          !(
            resource.collection === 'opportunities' &&
            action === 'read' &&
            resource.publicationStatus === 'Published'
          )
        ) {
          return {
            allowed: false,
            code: 'DENIED_ORG_ISOLATION',
            reason: `Industry organization '${actor.organizationId}' cannot access or modify private data belonging to '${resource.organizationId}'.`,
            auditRequired: true,
            classification,
          };
        }
      }

      // Industry cannot approve their own opportunity submission or organization verification
      if (action === 'approve' || action === 'publish') {
        if (
          action === 'approve' ||
          (resource.updatedFields || []).some(f => ['reviewStatus', 'verifiedStatus'].includes(f))
        ) {
          return {
            allowed: false,
            code: 'DENIED_SELF_APPROVAL',
            reason: 'Industry partners cannot self-approve opportunity submissions or organization verification status.',
            auditRequired: true,
            classification,
          };
        }
      }

      if (
        action === 'update' &&
        (resource.updatedFields || []).some(f => ['reviewStatus', 'verifiedStatus'].includes(f))
      ) {
        return {
          allowed: false,
          code: 'DENIED_SELF_APPROVAL',
          reason: 'Industry partners cannot modify university reviewStatus or verifiedStatus fields.',
          auditRequired: true,
          classification,
        };
      }

      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Industry partner authorized to manage own organization profile and opportunity drafts/submissions.',
        auditRequired: action !== 'read',
        classification,
      };
    }

    if (role === 'Opportunity Reviewer' || role === 'Institutional Administrator' || role === 'Academic Administrator') {
      if (
        resource.institutionId &&
        actor.institutionId &&
        resource.institutionId !== actor.institutionId
      ) {
        return {
          allowed: false,
          code: 'DENIED_TENANT_ISOLATION',
          reason: `${role} cannot approve or manage opportunities outside their assigned institution ('${actor.institutionId}').`,
          auditRequired: true,
          classification,
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `${role} authorized to review and verify institutional opportunities.`,
        auditRequired: action !== 'read',
        classification,
      };
    }

    if (role === 'Student' || role === 'Lecturer') {
      if (action === 'read') {
        if (
          resource.collection === 'opportunities' &&
          resource.publicationStatus &&
          resource.publicationStatus !== 'Published' &&
          role === 'Student'
        ) {
          return {
            allowed: false,
            code: 'DENIED_ROLE_INSUFFICIENT',
            reason: 'Students may only view approved and published opportunities.',
            auditRequired: false,
            classification: 'Institutional',
          };
        }
        return {
          allowed: true,
          code: 'AUTHORIZED',
          reason: `${role} authorized to read verified opportunities.`,
          auditRequired: false,
          classification: 'Public',
        };
      }
      return {
        allowed: false,
        code: 'DENIED_ROLE_INSUFFICIENT',
        reason: `Role '${role}' cannot create, edit, or approve organization profiles or opportunities.`,
        auditRequired: true,
        classification,
      };
    }
  }

  // 10. Student Interest & Consent Records (student_interest — PRD 06 Section 10)
  if (resource.collection === 'student_interest') {
    if (role === 'Student') {
      if (resource.ownerUserId && resource.ownerUserId !== actor.uid) {
        return {
          allowed: false,
          code: 'DENIED_PRIVACY_CONSENT',
          reason: 'Students can only grant, view, or revoke their own opportunity sharing consent.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Student authorized to manage own consent record.',
        auditRequired: true,
        classification: 'Confidential',
      };
    }

    if (role === 'Industry') {
      if (action !== 'read') {
        return {
          allowed: false,
          code: 'DENIED_ROLE_INSUFFICIENT',
          reason: 'Industry partners cannot modify or forge student consent records.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      if (resource.organizationId !== actor.organizationId) {
        return {
          allowed: false,
          code: 'DENIED_ORG_ISOLATION',
          reason: 'Industry partner cannot read student consent records submitted to another organization.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      if (!resource.consentGranted || resource.consentExpired) {
        return {
          allowed: false,
          code: 'DENIED_PRIVACY_CONSENT',
          reason: 'Access denied: Student consent has not been granted, was withdrawn, or has expired.',
          auditRequired: true,
          classification: 'Confidential',
        };
      }
      if (resource.requestedFieldsToRead && resource.sharedFields) {
        const unconsented = resource.requestedFieldsToRead.filter(
          f => !resource.sharedFields!.includes(f)
        );
        if (unconsented.length > 0) {
          return {
            allowed: false,
            code: 'DENIED_PRIVACY_CONSENT',
            reason: `Industry partner requested unconsented student fields: ${unconsented.join(', ')}.`,
            auditRequired: true,
            classification: 'Confidential',
          };
        }
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Industry partner authorized to view explicitly consented student profile fields.',
        auditRequired: true,
        classification: 'Confidential',
      };
    }
  }

  // 11. Restricted Institutional Settings (PRD 06 Section 7.6)
  if (resource.collection === 'institutional_settings' || resource.collection === 'institutions') {
    if (action === 'read' && actor.institutionId === resource.institutionId) {
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: 'Institutional member permitted to read institution metadata.',
        auditRequired: false,
        classification: 'Institutional',
      };
    }
    if (role === 'Institutional Administrator' || role === 'Platform Super Administrator') {
      if (
        role === 'Institutional Administrator' &&
        resource.institutionId &&
        actor.institutionId !== resource.institutionId
      ) {
        return {
          allowed: false,
          code: 'DENIED_TENANT_ISOLATION',
          reason: 'Institutional Administrator cannot modify settings for another university tenant.',
          auditRequired: true,
          classification: 'Restricted',
        };
      }
      return {
        allowed: true,
        code: 'AUTHORIZED',
        reason: `${role} authorized to update institutional governance settings.`,
        auditRequired: true,
        classification: 'Restricted',
      };
    }
    return {
      allowed: false,
      code: 'DENIED_ROLE_INSUFFICIENT',
      reason: `Role '${role}' cannot modify restricted institutional governance settings.`,
      auditRequired: true,
      classification: 'Restricted',
    };
  }

  return {
    allowed: false,
    code: 'DENIED_ROLE_INSUFFICIENT',
    reason: `Default deny: Action '${action}' on '${resource.collection}' is not explicitly permitted for role '${role}'.`,
    auditRequired: true,
    classification,
  };
}

/**
 * Evidence & File Upload Security Validator (PRD 06 Section 11)
 * Validates authentication, active status, extension allowlist, MIME type consistency,
 * 10MB file size limit, and tenant/student storage path isolation.
 */
export function validateEvidenceFileUpload(
  actor: SecurityActor | null | undefined,
  req: FileUploadValidationRequest
): FileUploadValidationResult {
  if (!actor || !actor.uid) {
    return {
      allowed: false,
      code: 'DENIED_UNAUTHENTICATED',
      reason: 'Unauthenticated users cannot upload files.',
      maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
    };
  }

  if (actor.accountStatus !== 'Active') {
    return {
      allowed: false,
      code: 'DENIED_ACCOUNT_INACTIVE',
      reason: `Account status '${actor.accountStatus}' is not permitted to upload files.`,
      maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
    };
  }

  const lowerName = req.fileName.trim().toLowerCase();
  const dotIdx = lowerName.lastIndexOf('.');
  const ext = dotIdx >= 0 ? lowerName.slice(dotIdx) : '';

  const allowedMimes = ALLOWED_EVIDENCE_FORMATS[ext];
  if (!allowedMimes) {
    return {
      allowed: false,
      code: 'DENIED_FORMAT',
      reason: `File extension '${ext || 'none'}' is blocked. Allowed formats: PDF, JPG, PNG, DOCX, PPTX.`,
      maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
    };
  }

  if (!allowedMimes.includes(req.mimeType.toLowerCase())) {
    return {
      allowed: false,
      code: 'DENIED_MIME_MISMATCH',
      reason: `MIME type '${req.mimeType}' does not match extension '${ext}'. Executable or disguised uploads are blocked.`,
      maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
    };
  }

  if (req.sizeBytes <= 0 || req.sizeBytes > MAX_EVIDENCE_FILE_SIZE_BYTES) {
    return {
      allowed: false,
      code: 'DENIED_SIZE_LIMIT',
      reason: `File size (${(req.sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB maximum limit.`,
      maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
    };
  }

  const expectedPrefix = `/institutions/${req.targetInstitutionId}/students/${req.targetStudentId}/evidence/`;
  const isOwnerStudent =
    actor.activeRole === 'Student' &&
    actor.uid === req.targetStudentId &&
    actor.institutionId === req.targetInstitutionId;

  if (!req.targetStoragePath.startsWith(expectedPrefix) || !isOwnerStudent) {
    return {
      allowed: false,
      code: 'DENIED_PATH_OWNERSHIP',
      reason: `Storage path '${req.targetStoragePath}' violates tenant/student isolation (${expectedPrefix}).`,
      maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
    };
  }

  return {
    allowed: true,
    code: 'VALID_UPLOAD',
    reason: 'File format, MIME type, size (<=10MB), and tenant storage path verified.',
    maxAllowedBytes: MAX_EVIDENCE_FILE_SIZE_BYTES,
  };
}
