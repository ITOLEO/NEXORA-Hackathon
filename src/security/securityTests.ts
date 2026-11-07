import {
  authorizeOperation,
  validateEvidenceFileUpload,
  SecurityActor,
  AuthorizationCode,
} from './rbacEngine';

export interface SecurityTestCaseResult {
  id: string;
  category:
    | 'Student Security Tests'
    | 'Lecturer Security Tests'
    | 'Industry Security Tests'
    | 'Administrative Security Tests'
    | 'Database & File Security Tests';
  title: string;
  expectedOutcome: 'ALLOW' | 'DENY';
  actualOutcome: 'ALLOW' | 'DENY';
  passed: boolean;
  code: AuthorizationCode | string;
  detail: string;
}

export interface SecurityTestSuiteReport {
  executedAt: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: SecurityTestCaseResult[];
}

// Canonical Test Actors across Institutions & Organizations
const studentA: SecurityActor = {
  uid: 'user_student_1',
  email: 'sarah.jenkins@nusantara.ac.id',
  name: 'Sarah Jenkins',
  roles: ['Student'],
  activeRole: 'Student',
  accountStatus: 'Active',
  emailVerified: true,
  institutionId: 'inst_nusantara',
  programId: 'prog_cs',
};

const lecturerA: SecurityActor = {
  uid: 'user_lecturer_1',
  email: 'ahmad.hidayat@nusantara.ac.id',
  name: 'Dr. Ahmad Hidayat',
  roles: ['Lecturer', 'Academic Administrator', 'Opportunity Reviewer'],
  activeRole: 'Lecturer',
  accountStatus: 'Active',
  emailVerified: true,
  institutionId: 'inst_nusantara',
  assignedCourseIds: ['course_cs402', 'course_ds301'],
};

const industryOrgA: SecurityActor = {
  uid: 'user_industry_1',
  email: 'talent@techcorp.co.id',
  name: 'TechCorp Indonesia',
  roles: ['Industry'],
  activeRole: 'Industry',
  accountStatus: 'Active',
  emailVerified: true,
  organizationId: 'org_techcorp_id',
  organizationVerifiedStatus: 'verified',
};

const academicAdminNusantara: SecurityActor = {
  uid: 'user_acad_admin_1',
  email: 'dean.cs@nusantara.ac.id',
  name: 'Prof. Ratna Sari',
  roles: ['Academic Administrator', 'Lecturer'],
  activeRole: 'Academic Administrator',
  accountStatus: 'Active',
  emailVerified: true,
  institutionId: 'inst_nusantara',
};

const opportunityReviewerNusantara: SecurityActor = {
  uid: 'user_reviewer_1',
  email: 'career.review@nusantara.ac.id',
  name: 'Hendra Wijaya',
  roles: ['Opportunity Reviewer'],
  activeRole: 'Opportunity Reviewer',
  accountStatus: 'Active',
  emailVerified: true,
  institutionId: 'inst_nusantara',
};

const technicalAdmin: SecurityActor = {
  uid: 'user_tech_admin_1',
  email: 'secops@nexora.id',
  name: 'Rizky Pratama (SecOps)',
  roles: ['Technical Administrator'],
  activeRole: 'Technical Administrator',
  accountStatus: 'Active',
  emailVerified: true,
  institutionId: 'inst_nusantara',
};

const platformSuperAdmin: SecurityActor = {
  uid: 'user_super_admin_1',
  email: 'callmeito22@gmail.com',
  name: 'Platform Super Administrator',
  roles: ['Platform Super Administrator', 'Institutional Administrator'],
  activeRole: 'Platform Super Administrator',
  accountStatus: 'Active',
  emailVerified: true,
  institutionId: 'inst_nusantara',
};

const suspendedStudent: SecurityActor = {
  ...studentA,
  uid: 'user_student_suspended',
  accountStatus: 'Suspended',
};

export function runAllNexoraSecurityTests(): SecurityTestSuiteReport {
  const results: SecurityTestCaseResult[] = [];

  const recordTest = (
    id: string,
    category: SecurityTestCaseResult['category'],
    title: string,
    expectedOutcome: 'ALLOW' | 'DENY',
    allowed: boolean,
    code: string,
    reason: string
  ) => {
    const actualOutcome: 'ALLOW' | 'DENY' = allowed ? 'ALLOW' : 'DENY';
    results.push({
      id,
      category,
      title,
      expectedOutcome,
      actualOutcome,
      passed: expectedOutcome === actualOutcome,
      code,
      detail: reason,
    });
  };

  // ============================================================================
  // 17.1 STUDENT SECURITY TESTS (6 Tests)
  // ============================================================================

  // ST-01: Student A cannot read Student B's profile
  {
    const dec = authorizeOperation(studentA, 'read', {
      collection: 'learner_profiles',
      resourceId: 'profile_student_b',
      ownerUserId: 'user_student_2',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'ST-01',
      'Student Security Tests',
      "Student A cannot read Student B's learner profile",
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // ST-02: Student A cannot modify official competency scores
  {
    const dec = authorizeOperation(studentA, 'update', {
      collection: 'student_skills',
      resourceId: 'skill_mlf_sarah',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
      updatedFields: ['score', 'masteryLevel', 'verifiedByLecturer'],
    });
    recordTest(
      'ST-02',
      'Student Security Tests',
      'Student A cannot modify official competency scores or lecturer verification flags',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // ST-03: Student A cannot change their role to Lecturer or Admin
  {
    const dec = authorizeOperation(studentA, 'update', {
      collection: 'users',
      resourceId: 'user_student_1',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
      updatedFields: ['role', 'roles', 'isInstitutionalAdmin'],
    });
    recordTest(
      'ST-03',
      'Student Security Tests',
      'Student A cannot escalate role to Lecturer or Admin via client update',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // ST-04: Student A cannot access another student's assessment submission
  {
    const dec = authorizeOperation(studentA, 'read', {
      collection: 'evidence_reviews',
      resourceId: 'ev_student_2_capstone',
      ownerUserId: 'user_student_2',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'ST-04',
      'Student Security Tests',
      "Student A cannot access another student's assessment or evidence submission",
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // ST-05: Student A can submit evidence only for their own account
  {
    const decOwn = authorizeOperation(studentA, 'create', {
      collection: 'evidence_reviews',
      resourceId: 'ev_sarah_new',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'ST-05',
      'Student Security Tests',
      'Student A can submit learning evidence for their own account',
      'ALLOW',
      decOwn.allowed,
      decOwn.code,
      decOwn.reason
    );
  }

  // ST-06: Student A can revoke their own opportunity sharing consent (and not Student B's)
  {
    const decOwnRevoke = authorizeOperation(studentA, 'revoke_consent', {
      collection: 'student_interest',
      resourceId: 'consent_sarah_1',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
    });
    const decOtherRevoke = authorizeOperation(studentA, 'revoke_consent', {
      collection: 'student_interest',
      resourceId: 'consent_budi_1',
      ownerUserId: 'user_student_2',
      institutionId: 'inst_nusantara',
    });
    const combinedAllowed = decOwnRevoke.allowed && !decOtherRevoke.allowed;
    recordTest(
      'ST-06',
      'Student Security Tests',
      'Student A can revoke own opportunity sharing consent and is blocked from modifying Student B consent',
      'ALLOW',
      combinedAllowed,
      decOwnRevoke.code,
      `Own consent revoke: ${decOwnRevoke.code}; Other student consent revoke: ${decOtherRevoke.code}`
    );
  }

  // ============================================================================
  // 17.2 LECTURER SECURITY TESTS (5 Tests)
  // ============================================================================

  // LT-01: Lecturer A cannot read student records from an unrelated course
  {
    const dec = authorizeOperation(lecturerA, 'read', {
      collection: 'learner_profiles',
      resourceId: 'profile_unrelated_course',
      ownerUserId: 'user_student_99',
      institutionId: 'inst_nusantara',
      courseId: 'course_bio101_unassigned',
    });
    recordTest(
      'LT-01',
      'Lecturer Security Tests',
      'Lecturer A cannot read student records from an unassigned course (course_bio101_unassigned)',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // LT-02: Lecturer A cannot edit another lecturer's course without permission
  {
    const dec = authorizeOperation(lecturerA, 'update', {
      collection: 'courses',
      resourceId: 'course_se204_other',
      instructorId: 'user_lecturer_99',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'LT-02',
      'Lecturer Security Tests',
      "Lecturer A cannot edit another lecturer's unassigned course",
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // LT-03: Lecturer A cannot assign administrative permissions to themselves
  {
    const dec = authorizeOperation(lecturerA, 'assign_role', {
      collection: 'users',
      resourceId: 'user_lecturer_1',
      ownerUserId: 'user_lecturer_1',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'LT-03',
      'Lecturer Security Tests',
      'Lecturer A cannot self-assign administrative permissions',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // LT-04: Lecturer A can review evidence only from assigned students/courses
  {
    const decAssigned = authorizeOperation(lecturerA, 'approve', {
      collection: 'evidence_reviews',
      resourceId: 'ev_cs402_sarah',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
      courseId: 'course_cs402',
    });
    const decUnassigned = authorizeOperation(lecturerA, 'approve', {
      collection: 'evidence_reviews',
      resourceId: 'ev_bio101_other',
      ownerUserId: 'user_student_88',
      institutionId: 'inst_nusantara',
      courseId: 'course_bio101_unassigned',
    });
    recordTest(
      'LT-04',
      'Lecturer Security Tests',
      'Lecturer A can review evidence from assigned course (CS402) and is denied on unassigned course',
      'ALLOW',
      decAssigned.allowed && !decUnassigned.allowed,
      decAssigned.code,
      `Assigned course review: ${decAssigned.code}; Unassigned course review: ${decUnassigned.code}`
    );
  }

  // LT-05: Lecturer A cannot modify restricted institutional settings
  {
    const dec = authorizeOperation(lecturerA, 'update', {
      collection: 'institutional_settings',
      resourceId: 'inst_nusantara_config',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'LT-05',
      'Lecturer Security Tests',
      'Lecturer A cannot modify restricted institutional governance settings',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // ============================================================================
  // 17.3 INDUSTRY SECURITY TESTS (6 Tests)
  // ============================================================================

  // IT-01: Industry user from Organization A cannot read Organization B's private data
  {
    const dec = authorizeOperation(industryOrgA, 'read', {
      collection: 'organizations',
      resourceId: 'org_fintech_b',
      organizationId: 'org_fintech_b',
    });
    recordTest(
      'IT-01',
      'Industry Security Tests',
      "Industry user from Organization A cannot read Organization B's private data",
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // IT-02: Industry user cannot browse all student records
  {
    const dec = authorizeOperation(industryOrgA, 'read', {
      collection: 'learner_profiles',
      resourceId: 'profile_sarah',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'IT-02',
      'Industry Security Tests',
      'Industry user cannot browse or read raw student learner profiles',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // IT-03: Industry user cannot read private learner assessment records
  {
    const dec = authorizeOperation(industryOrgA, 'read', {
      collection: 'student_skills',
      resourceId: 'skill_mlf_sarah',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'IT-03',
      'Industry Security Tests',
      'Industry user cannot read private learner competency assessment records',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // IT-04: Industry user cannot access student data without valid consent (or when requesting unconsented fields)
  {
    const decNoConsent = authorizeOperation(industryOrgA, 'read', {
      collection: 'student_interest',
      resourceId: 'consent_revoked_1',
      organizationId: 'org_techcorp_id',
      ownerUserId: 'user_student_1',
      consentGranted: false,
    });
    const decUnconsentedField = authorizeOperation(industryOrgA, 'read', {
      collection: 'student_interest',
      resourceId: 'consent_partial_1',
      organizationId: 'org_techcorp_id',
      ownerUserId: 'user_student_1',
      consentGranted: true,
      sharedFields: ['program_semester', 'verified_skills'],
      requestedFieldsToRead: ['program_semester', 'gpa_transcript_private'],
    });
    recordTest(
      'IT-04',
      'Industry Security Tests',
      'Industry user cannot access student data without valid consent or outside consented field scope',
      'DENY',
      decNoConsent.allowed || decUnconsentedField.allowed,
      decNoConsent.code,
      `Revoked consent: ${decNoConsent.code}; Unconsented field request: ${decUnconsentedField.code}`
    );
  }

  // IT-05: Industry user cannot approve their own opportunity submission
  {
    const dec = authorizeOperation(industryOrgA, 'approve', {
      collection: 'opportunities',
      resourceId: 'opp_techcorp_1',
      organizationId: 'org_techcorp_id',
      updatedFields: ['reviewStatus', 'publicationStatus'],
    });
    recordTest(
      'IT-05',
      'Industry Security Tests',
      'Industry user cannot self-approve their own opportunity submission',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // IT-06: Industry user cannot modify institutional competencies
  {
    const dec = authorizeOperation(industryOrgA, 'update', {
      collection: 'knowledge_graph',
      resourceId: 'node_dai',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'IT-06',
      'Industry Security Tests',
      'Industry user cannot modify official institutional competencies or Course Knowledge Graph',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // ============================================================================
  // 17.4 ADMINISTRATIVE SECURITY TESTS (4 Tests)
  // ============================================================================

  // AT-01: Academic admin cannot access unrelated institution records
  {
    const dec = authorizeOperation(academicAdminNusantara, 'update', {
      collection: 'courses',
      resourceId: 'course_itn_99',
      institutionId: 'inst_itn_bandung',
    });
    recordTest(
      'AT-01',
      'Administrative Security Tests',
      'Academic Administrator (Universitas Nusantara) cannot access or modify records from Institut Teknologi Nasional (inst_itn_bandung)',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // AT-02: Opportunity reviewer cannot approve opportunities outside their institution
  {
    const dec = authorizeOperation(opportunityReviewerNusantara, 'approve', {
      collection: 'opportunities',
      resourceId: 'opp_external_inst',
      institutionId: 'inst_itn_bandung',
    });
    recordTest(
      'AT-02',
      'Administrative Security Tests',
      'Opportunity Reviewer cannot approve opportunities outside their assigned institution',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // AT-03: Technical admin cannot access private learner assessment evidence unless explicitly permitted
  {
    const dec = authorizeOperation(technicalAdmin, 'read', {
      collection: 'evidence_reviews',
      resourceId: 'ev_sarah_1',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'AT-03',
      'Administrative Security Tests',
      'Technical Administrator is denied automatic access to private learner assessment evidence',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // AT-04: Super admin permissions are controlled, blocked from automatic private student reads, and logged
  {
    const decPrivateRead = authorizeOperation(platformSuperAdmin, 'read', {
      collection: 'learner_profiles',
      resourceId: 'profile_sarah',
      ownerUserId: 'user_student_1',
      institutionId: 'inst_nusantara',
    });
    const decTenantGov = authorizeOperation(platformSuperAdmin, 'assign_role', {
      collection: 'users',
      resourceId: 'user_lecturer_1',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'AT-04',
      'Administrative Security Tests',
      'Platform Super Admin is blocked from automatic private student reads and audited on governance actions',
      'ALLOW',
      !decPrivateRead.allowed && decTenantGov.allowed && decTenantGov.auditRequired,
      decTenantGov.code,
      `Private learner read: ${decPrivateRead.code}; Audited governance action: ${decTenantGov.code} (auditRequired=${decTenantGov.auditRequired})`
    );
  }

  // ============================================================================
  // 17.5 DATABASE & FILE SECURITY TESTS (8 Tests)
  // ============================================================================

  // DT-01: Unauthenticated requests to protected collections are denied
  {
    const dec = authorizeOperation(null, 'read', {
      collection: 'courses',
      resourceId: 'course_cs402',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'DT-01',
      'Database & File Security Tests',
      'Unauthenticated requests to protected collections are denied by default',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // DT-02:Suspended or Revoked accounts are blocked from protected resources
  {
    const dec = authorizeOperation(suspendedStudent, 'read', {
      collection: 'learner_profiles',
      resourceId: 'profile_sarah',
      ownerUserId: 'user_student_suspended',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'DT-02',
      'Database & File Security Tests',
      'Suspended or Access Revoked accounts are immediately denied access to protected collections',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // DT-03: Requests with modified institutionId are rejected
  {
    const dec = authorizeOperation(academicAdminNusantara, 'update', {
      collection: 'courses',
      resourceId: 'course_cs402',
      institutionId: 'inst_nusantara',
      updatedFields: ['name', 'institutionId'],
    });
    recordTest(
      'DT-03',
      'Database & File Security Tests',
      'Requests attempting to mutate tenant institutionId are rejected',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // DT-04: Requests with modified organizationId are rejected
  {
    const dec = authorizeOperation(industryOrgA, 'update', {
      collection: 'opportunities',
      resourceId: 'opp_techcorp_1',
      organizationId: 'org_techcorp_id',
      updatedFields: ['title', 'organizationId'],
    });
    recordTest(
      'DT-04',
      'Database & File Security Tests',
      'Requests attempting to mutate organizationId are rejected',
      'DENY',
      dec.allowed,
      dec.code,
      dec.reason
    );
  }

  // DT-05: Audit logs cannot be modified or deleted by any user
  {
    const decUpdate = authorizeOperation(platformSuperAdmin, 'update', {
      collection: 'audit_logs',
      resourceId: 'audit_001',
      institutionId: 'inst_nusantara',
    });
    const decDelete = authorizeOperation(technicalAdmin, 'delete', {
      collection: 'audit_logs',
      resourceId: 'audit_001',
      institutionId: 'inst_nusantara',
    });
    recordTest(
      'DT-05',
      'Database & File Security Tests',
      'Audit logs are strictly append-only and cannot be modified or deleted even by administrators',
      'DENY',
      decUpdate.allowed || decDelete.allowed,
      decUpdate.code,
      `Update attempt: ${decUpdate.code}; Delete attempt: ${decDelete.code}`
    );
  }

  // DT-06: Expired or revoked consent blocks data sharing immediately
  {
    const decExpired = authorizeOperation(industryOrgA, 'read', {
      collection: 'student_interest',
      resourceId: 'consent_expired_1',
      organizationId: 'org_techcorp_id',
      ownerUserId: 'user_student_1',
      consentGranted: true,
      consentExpired: true,
    });
    recordTest(
      'DT-06',
      'Database & File Security Tests',
      'Expired or revoked student consent immediately blocks Industry partner data access',
      'DENY',
      decExpired.allowed,
      decExpired.code,
      decExpired.reason
    );
  }

  // DT-07: Executable/oversized file upload or cross-student storage path is blocked
  {
    const badExec = validateEvidenceFileUpload(studentA, {
      fileName: 'exploit_payload.exe',
      mimeType: 'application/x-msdownload',
      sizeBytes: 250000,
      targetStoragePath: '/institutions/inst_nusantara/students/user_student_1/evidence/ev_1.exe',
      targetInstitutionId: 'inst_nusantara',
      targetStudentId: 'user_student_1',
    });
    const badPath = validateEvidenceFileUpload(studentA, {
      fileName: 'certificate.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 500000,
      targetStoragePath: '/institutions/inst_nusantara/students/user_student_2/evidence/ev_2.pdf',
      targetInstitutionId: 'inst_nusantara',
      targetStudentId: 'user_student_2',
    });
    recordTest(
      'DT-07',
      'Database & File Security Tests',
      'Executable file uploads (.exe) and cross-student storage path writes are blocked',
      'DENY',
      badExec.allowed || badPath.allowed,
      badExec.code,
      `Executable check: ${badExec.code}; Cross-student path check: ${badPath.code}`
    );
  }

  // DT-08: Valid PDF evidence upload within 10MB to own tenant storage path is permitted
  {
    const validPdf = validateEvidenceFileUpload(studentA, {
      fileName: 'ml_capstone_report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2 * 1024 * 1024, // 2MB
      targetStoragePath:
        '/institutions/inst_nusantara/students/user_student_1/evidence/ml_capstone_report.pdf',
      targetInstitutionId: 'inst_nusantara',
      targetStudentId: 'user_student_1',
    });
    recordTest(
      'DT-08',
      'Database & File Security Tests',
      'Valid PDF evidence upload (<=10MB) to authenticated student tenant storage path is permitted',
      'ALLOW',
      validPdf.allowed,
      validPdf.code,
      validPdf.reason
    );
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    executedAt: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}
