import {
  LearnerContextService,
  KnowledgeGraphTraversalService,
  EligibilityService,
  SkillGapAnalysisService,
  LearningPathSequencingService,
  OpportunityMatchingService,
  NextBestActionService,
  executeFullRecommendationRun,
  parseUnstructuredOpportunityDescription,
  DEFAULT_OPPORTUNITY_RANKING_CONFIG,
  RecommendationFeedbackRecord,
} from './recommendationEngine';
import {
  INITIAL_LEARNER_PROFILE,
  INITIAL_GOALS,
  INITIAL_STUDENT_SKILLS,
  INITIAL_MICRO_SKILLS,
  INITIAL_LEARNING_PATHWAYS,
  INITIAL_OPPORTUNITIES,
  INITIAL_EVIDENCE,
  INITIAL_COURSES,
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
} from '../services/demoData';
import { Opportunity } from '../types/nexora';

export interface RecommendationTestResult {
  id: string;
  category:
    | 'Graph & Prerequisite Traversal'
    | 'Skill Gap & Evidence Honesty'
    | 'Dual Learning Pathways'
    | 'Eligibility & Opportunity Ranking'
    | 'Feedback, Overrides & Fallbacks';
  title: string;
  passed: boolean;
  details: string;
}

export function runAllNexoraRecommendationTests(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executedAt: string;
  results: RecommendationTestResult[];
} {
  const results: RecommendationTestResult[] = [];

  const baseContext = LearnerContextService.buildContext({
    profile: INITIAL_LEARNER_PROFILE,
    goals: INITIAL_GOALS,
    studentSkills: INITIAL_STUDENT_SKILLS,
    microSkills: INITIAL_MICRO_SKILLS,
    pathways: INITIAL_LEARNING_PATHWAYS,
    opportunities: INITIAL_OPPORTUNITIES,
    evidenceList: INITIAL_EVIDENCE,
    courses: INITIAL_COURSES,
    graphNodes: INITIAL_GRAPH_NODES,
    graphEdges: INITIAL_GRAPH_EDGES,
    referenceDate: '2026-04-06',
  });

  // TEST 1: Goal-to-competency connection
  const mlGoal = INITIAL_GOALS[0];
  const resolvedSkills = KnowledgeGraphTraversalService.resolveGoalTargetSkills(
    mlGoal,
    INITIAL_MICRO_SKILLS
  );
  results.push({
    id: 'REC-01',
    category: 'Graph & Prerequisite Traversal',
    title: 'Student goal connects to canonical micro-skills in the Knowledge Graph',
    passed:
      resolvedSkills.length >= 2 &&
      resolvedSkills.some(s => s.id === 'skill_dnn' || s.id === 'skill_mlf'),
    details: `Goal '${mlGoal.title}' resolved to ${resolvedSkills.length} canonical skills: [${resolvedSkills.map(s => s.id).join(', ')}].`,
  });

  // TEST 2: Micro-skill prerequisite traversal (foundational before dependent)
  const dnnPrereqs = KnowledgeGraphTraversalService.getOrderedPrerequisites(
    'skill_dnn',
    INITIAL_MICRO_SKILLS
  );
  const pdsIndex = dnnPrereqs.findIndex(s => s.id === 'skill_pds');
  const mlfIndex = dnnPrereqs.findIndex(s => s.id === 'skill_mlf');
  results.push({
    id: 'REC-02',
    category: 'Graph & Prerequisite Traversal',
    title: 'Prerequisite DAG traversal orders foundational skills before intermediate/advanced skills',
    passed: dnnPrereqs.length >= 2 && pdsIndex !== -1 && mlfIndex !== -1 && pdsIndex < mlfIndex,
    details: `Ordered prerequisites for 'skill_dnn': [${dnnPrereqs.map(p => p.id).join(' -> ')}].`,
  });

  // TEST 3: Missing skill evidence detection & "Not Assessed" vs low mastery distinction
  const gapReport = SkillGapAnalysisService.generateSkillGapReport(baseContext);
  const mlopsGap = gapReport.identifiedGaps.find(g => g.skillId === 'skill_mlops');
  const cloudGap = gapReport.identifiedGaps.find(g => g.skillId === 'skill_cloud');
  results.push({
    id: 'REC-03',
    category: 'Skill Gap & Evidence Honesty',
    title: 'Unassessed skills are explicitly classified as Not Assessed rather than fake low mastery',
    passed:
      Boolean(mlopsGap && mlopsGap.currentEvidencedStatus === 'Not Assessed' && mlopsGap.rawScoreOrLabel === 'Not assessed') &&
      Boolean(cloudGap && cloudGap.currentEvidencedStatus === 'Outdated or Insufficient Evidence'),
    details: `skill_mlops classified as '${mlopsGap?.currentEvidencedStatus}' (${mlopsGap?.rawScoreOrLabel}); skill_cloud (52% score) classified as '${cloudGap?.currentEvidencedStatus}'.`,
  });

  // TEST 4: Self-reported skill confidence is distinguished from verified mastery
  const selfReportedContext = LearnerContextService.buildContext({
    ...baseContext,
    goals: INITIAL_GOALS,
    studentSkills: {
      ...INITIAL_STUDENT_SKILLS,
      skill_mlops: {
        skillId: 'skill_mlops',
        masteryLevel: 'not_assessed',
        score: 0,
        verifiedByLecturer: false,
        lastAssessedAt: '2026-04-06',
        selfAssessedConfidence: 5,
        evidenceCount: 0,
        provenance: 'Self-reported skill',
      },
    },
  });
  const selfReportGap = SkillGapAnalysisService.generateSkillGapReport(selfReportedContext);
  const mlopsItem = selfReportGap.identifiedGaps.find(g => g.skillId === 'skill_mlops');
  results.push({
    id: 'REC-04',
    category: 'Skill Gap & Evidence Honesty',
    title: '5-star self-reported confidence without assessment/lecturer validation is not treated as Demonstrated mastery',
    passed:
      Boolean(mlopsItem) &&
      mlopsItem!.currentEvidencedStatus !== 'Demonstrated' &&
      mlopsItem!.provenanceLabel.includes('Self-reported'),
    details: `skill_mlops with 5/5 self-reported stars classified as '${mlopsItem?.currentEvidencedStatus}' (${mlopsItem?.provenanceLabel}).`,
  });

  // TEST 5: Missing prerequisite is prioritized above dependent advanced skill
  const missingPrereqContext = LearnerContextService.buildContext({
    ...baseContext,
    goals: INITIAL_GOALS,
    studentSkills: {
      ...INITIAL_STUDENT_SKILLS,
      skill_mlf: {
        skillId: 'skill_mlf',
        masteryLevel: 'needs_support',
        score: 45,
        verifiedByLecturer: false,
        lastAssessedAt: '2026-04-01',
        selfAssessedConfidence: 2,
        evidenceCount: 0,
      },
      skill_dnn: {
        skillId: 'skill_dnn',
        masteryLevel: 'not_assessed',
        score: 0,
        verifiedByLecturer: false,
        lastAssessedAt: 'N/A',
        selfAssessedConfidence: 1,
        evidenceCount: 0,
      },
    },
  });
  const prereqGapReport = SkillGapAnalysisService.generateSkillGapReport(missingPrereqContext);
  const mlfGapPriority = prereqGapReport.identifiedGaps.find(g => g.skillId === 'skill_mlf')?.priorityScore || 0;
  const dnnGapPriority = prereqGapReport.identifiedGaps.find(g => g.skillId === 'skill_dnn')?.priorityScore || 0;
  results.push({
    id: 'REC-05',
    category: 'Graph & Prerequisite Traversal',
    title: 'Prerequisite skill (skill_mlf) is prioritized higher than dependent advanced skill (skill_dnn) when prerequisite is unmet',
    passed: mlfGapPriority > dnnGapPriority,
    details: `Prerequisite 'skill_mlf' priorityScore=${mlfGapPriority} > dependent 'skill_dnn' priorityScore=${dnnGapPriority}.`,
  });

  // TEST 6: Separation of Academic Learning Path and Personal Growth Path
  const dualPaths = LearningPathSequencingService.generateDualPathways(
    missingPrereqContext,
    prereqGapReport
  );
  const allAcademicAreFormal = dualPaths.academicPath.every(
    i => i.pathwayType === 'Academic Learning Path' && Boolean(i.courseCode)
  );
  const allGrowthArePersonal = dualPaths.personalGrowthPath.every(
    i => i.pathwayType === 'Personal Growth Path'
  );
  const growthMlfIdx = dualPaths.personalGrowthPath.findIndex(i => i.skillId === 'skill_mlf');
  const growthDnnIdx = dualPaths.personalGrowthPath.findIndex(i => i.skillId === 'skill_dnn');
  results.push({
    id: 'REC-06',
    category: 'Dual Learning Pathways',
    title: 'Academic Learning Path and Personal Growth Path are strictly separated and prerequisite-ordered',
    passed:
      allAcademicAreFormal &&
      allGrowthArePersonal &&
      dualPaths.academicPath.length > 0 &&
      dualPaths.personalGrowthPath.length > 0 &&
      growthMlfIdx !== -1 &&
      growthDnnIdx !== -1 &&
      growthMlfIdx < growthDnnIdx,
    details: `Academic Path (${dualPaths.academicPath.length} modules), Personal Growth Path (${dualPaths.personalGrowthPath.length} items, skill_mlf at #${growthMlfIdx + 1} before skill_dnn at #${growthDnnIdx + 1}).`,
  });

  // TEST 7: Mandatory eligibility is evaluated separately from skill readiness (Eligible vs Not Eligible vs Eligibility Unknown)
  const eligibleOpp: Opportunity = INITIAL_OPPORTUNITIES[0];
  const ineligibleGpaOpp: Opportunity = {
    ...INITIAL_OPPORTUNITIES[0],
    id: 'opp_high_gpa',
    eligibility: 'Active Undergraduate, GPA >= 3.95',
  };
  const unknownEligOpp: Opportunity = {
    ...INITIAL_OPPORTUNITIES[0],
    id: 'opp_unknown_elig',
    eligibility: '',
  };
  const e1 = EligibilityService.evaluateOpportunityEligibility(eligibleOpp, INITIAL_LEARNER_PROFILE);
  const e2 = EligibilityService.evaluateOpportunityEligibility(ineligibleGpaOpp, INITIAL_LEARNER_PROFILE);
  const e3 = EligibilityService.evaluateOpportunityEligibility(unknownEligOpp, INITIAL_LEARNER_PROFILE);
  results.push({
    id: 'REC-07',
    category: 'Eligibility & Opportunity Ranking',
    title: 'Eligibility Service accurately distinguishes Eligible, Not Eligible, and Eligibility Unknown',
    passed:
      e1.status === 'Eligible' &&
      e2.status === 'Not Eligible' &&
      e3.status === 'Eligibility Unknown',
    details: `Standard opp -> '${e1.status}', GPA>=3.95 opp (student 3.82) -> '${e2.status}', Empty eligibility -> '${e3.status}'.`,
  });

  // TEST 8: Reproducible opportunity relevance ranking formula (0.30 Goal + 0.25 Interest + 0.25 Competency + 0.20 Timing)
  const oppMatchResult = OpportunityMatchingService.matchOpportunities(
    baseContext,
    DEFAULT_OPPORTUNITY_RANKING_CONFIG
  );
  const topOpp = oppMatchResult.activeRecommendations[0];
  const fc = topOpp.featureContributions;
  const expectedFormulaScore = Math.round(
    fc.goalAlignmentScore * 0.3 +
      fc.interestAlignmentScore * 0.25 +
      fc.competencyRelevanceScore * 0.25 +
      fc.timingRelevanceScore * 0.2
  );
  results.push({
    id: 'REC-08',
    category: 'Eligibility & Opportunity Ranking',
    title: 'Opportunity relevance score is reproducible and matches weighted formula (30/25/25/20)',
    passed:
      topOpp.relevanceScore === expectedFormulaScore &&
      fc.configurationVersion === 'NEXORA-OPP-CFG-v7.1',
    details: `Top opportunity '${topOpp.opportunityTitle}' score=${topOpp.relevanceScore} matches formula (${fc.goalAlignmentScore}*0.30 + ${fc.interestAlignmentScore}*0.25 + ${fc.competencyRelevanceScore}*0.25 + ${fc.timingRelevanceScore}*0.20 = ${expectedFormulaScore}).`,
  });

  // TEST 9: Expired opportunities are automatically excluded from active recommendations
  const expiredOpp: Opportunity = {
    ...INITIAL_OPPORTUNITIES[0],
    id: 'opp_expired_2025',
    title: 'Expired 2025 Internship',
    deadline: '2025-12-31',
    publicationStatus: 'Published',
  };
  const contextWithExpired = LearnerContextService.buildContext({
    ...baseContext,
    goals: INITIAL_GOALS,
    opportunities: [...INITIAL_OPPORTUNITIES, expiredOpp],
    referenceDate: '2026-04-06',
  });
  const expiredMatchResult = OpportunityMatchingService.matchOpportunities(contextWithExpired);
  results.push({
    id: 'REC-09',
    category: 'Eligibility & Opportunity Ranking',
    title: 'Expired opportunities are excluded from active recommendations and tracked in excludedExpired',
    passed:
      !expiredMatchResult.activeRecommendations.some(o => o.opportunityId === 'opp_expired_2025') &&
      expiredMatchResult.excludedExpired.some(o => o.opportunityId === 'opp_expired_2025'),
    details: `Expired opportunity 'opp_expired_2025' (deadline 2025-12-31 < 2026-04-06) excluded from active list (${expiredMatchResult.excludedExpired.length} expired excluded).`,
  });

  // TEST 10: Deduplication & Mandatory Academic Priority in Next Best Action Engine
  const nbaActions = NextBestActionService.generateNextBestActions(
    baseContext,
    gapReport,
    oppMatchResult.activeRecommendations
  );
  const uniqueIds = new Set(nbaActions.map(a => a.recommendationId));
  results.push({
    id: 'REC-10',
    category: 'Dual Learning Pathways',
    title: 'Next Best Actions are deduplicated and place Mandatory Academic obligations at Rank #1',
    passed:
      nbaActions.length > 0 &&
      uniqueIds.size === nbaActions.length &&
      nbaActions[0].isMandatoryAcademic === true &&
      nbaActions[0].priorityRank === 1,
    details: `${nbaActions.length} unique Next Best Actions generated; Rank #1 is '${nbaActions[0]?.title}' (${nbaActions[0]?.urgencyTier}).`,
  });

  // TEST 11: Student feedback dismissal suppresses non-mandatory recommendations without harming academic obligations
  const dismissFeedback: RecommendationFeedbackRecord[] = [
    {
      feedbackId: 'fb_test_1',
      studentId: INITIAL_LEARNER_PROFILE.userId,
      recommendationId: `rec_opp_${INITIAL_OPPORTUNITIES[0].id}`,
      targetEntityId: INITIAL_OPPORTUNITIES[0].id,
      feedbackType: 'Dismissed',
      feedbackReason: 'Focusing on thesis this month',
      createdAt: '2026-04-06',
    },
  ];
  const contextWithDismissal = LearnerContextService.buildContext({
    ...baseContext,
    goals: INITIAL_GOALS,
    feedbackHistory: dismissFeedback,
  });
  const afterDismissMatches = OpportunityMatchingService.matchOpportunities(contextWithDismissal);
  results.push({
    id: 'REC-11',
    category: 'Feedback, Overrides & Fallbacks',
    title: 'Dismissing a recommended opportunity removes it from active recommendations and records feedback',
    passed: !afterDismissMatches.activeRecommendations.some(
      o => o.opportunityId === INITIAL_OPPORTUNITIES[0].id
    ),
    details: `Opportunity '${INITIAL_OPPORTUNITIES[0].id}' removed from active recommendations after student 'Dismissed' feedback.`,
  });

  // TEST 12: Goal updates and validated evidence dynamically recalculate recommendations + Deterministic parser fallback works without AI
  const cloudGoalContext = LearnerContextService.buildContext({
    ...baseContext,
    goals: [
      {
        id: 'goal_cloud_only',
        title: 'Cloud-Native DevOps & Microservices Architect',
        category: 'Career',
        targetDate: 'December 2026',
        progressPercentage: 25,
        targetSkillIds: ['skill_cloud', 'skill_pm'],
        status: 'active',
        notes: 'Focus on Docker, Kubernetes, and cloud architecture.',
      },
    ],
  });
  const cloudRun = executeFullRecommendationRun(cloudGoalContext);
  const parsedDraft = parseUnstructuredOpportunityDescription(
    'We are looking for a Cloud & MLOps Intern skilled in Docker, Kubernetes, Python, and SQL. Apply at https://techcorp.co.id/apply before 2026-06-15.',
    INITIAL_MICRO_SKILLS
  );
  results.push({
    id: 'REC-12',
    category: 'Feedback, Overrides & Fallbacks',
    title: 'Goal updates recalculate target competencies & deterministic unstructured parser operates without AI dependency',
    passed:
      cloudRun.gapReport.targetCompetencies.includes('skill_cloud') &&
      parsedDraft.candidateSkills.some(c => c.skillId === 'skill_cloud') &&
      parsedDraft.candidateSkills.every(c => c.requiresHumanReview === true),
    details: `Updated goal targeted [${cloudRun.gapReport.targetCompetencies.join(', ')}]; deterministic parser extracted ${parsedDraft.candidateSkills.length} candidate skills with requiresHumanReview=true.`,
  });

  const passedTests = results.filter(r => r.passed).length;
  return {
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests,
    executedAt: new Date().toISOString(),
    results,
  };
}
