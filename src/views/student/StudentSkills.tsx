import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
  Clock,
  Star,
  FileBarChart,
  GitBranch,
  Network,
  BookOpen,
  Target,
  Briefcase,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { INITIAL_CLUSTERS, INITIAL_ASSESSMENT_QUIZ } from '../../services/demoData';
import { MasteryLevel, StudentSkill, EvidenceProvenanceType } from '../../types/nexora';
import {
  KnowledgeGraphTraversalService,
  LearnerContextService,
} from '../../recommendation/recommendationEngine';

export const StudentSkills: React.FC = () => {
  const {
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
    recommendationBundle,
    updateSkillScore,
    updateSelfReportedSkill,
  } = useNexora();

  const [selectedClusterId, setSelectedClusterId] = useState<string>('all');
  const [showGapReport, setShowGapReport] = useState<boolean>(true);
  const [inspectedSkillId, setInspectedSkillId] = useState<string | null>(null);
  const [activeQuizModal, setActiveQuizModal] = useState<boolean>(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const { gapReport } = recommendationBundle;

  const filteredSkills = microSkills.filter(s =>
    selectedClusterId === 'all' ? true : s.clusterId === selectedClusterId
  );

  const inspectedRelationships = inspectedSkillId
    ? KnowledgeGraphTraversalService.inspectSkillRelationships(
        inspectedSkillId,
        LearnerContextService.buildContext({
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
        })
      )
    : null;

  const getMasteryBadge = (mastery: MasteryLevel, score: number) => {
    switch (mastery) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#237A55]/10 text-[#237A55] text-xs font-bold rounded-lg border border-[#237A55]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mastered ({score}%)
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25866A]/10 text-[#25866A] text-xs font-bold rounded-lg border border-[#25866A]/20">
            <Zap className="w-3.5 h-3.5" />
            Developing ({score}%)
          </span>
        );
      case 'needs_support':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#A76716]/10 text-[#A76716] text-xs font-bold rounded-lg border border-[#A76716]/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Support ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#66736C]/10 text-[#66736C] text-xs font-semibold rounded-lg border border-[#DCE4DD]">
            <HelpCircle className="w-3.5 h-3.5" />
            Not Assessed
          </span>
        );
    }
  };

  const getProvenanceBadge = (record?: StudentSkill) => {
    const prov: EvidenceProvenanceType =
      record?.provenance ||
      (record?.verifiedByLecturer
        ? 'Lecturer-validated competency'
        : record?.score
        ? 'Diagnostic assessment result'
        : 'Not assessed');

    if (prov === 'Lecturer-validated competency') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#237A55] bg-[#237A55]/10 px-2.5 py-0.5 rounded-md border border-[#237A55]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Lecturer-Validated Competency ({record?.validatorName || 'Faculty'})
        </span>
      );
    }
    if (prov === 'Diagnostic assessment result') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#416B8B] bg-[#416B8B]/10 px-2.5 py-0.5 rounded-md border border-[#416B8B]/30">
          <Sparkles className="w-3.5 h-3.5" />
          Diagnostic Assessment Result
        </span>
      );
    }
    if (prov === 'External certificate or portfolio evidence') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#A76716] bg-[#D7A85B]/20 px-2.5 py-0.5 rounded-md border border-[#D7A85B]/40">
          <Award className="w-3.5 h-3.5" />
          External Certificate / Portfolio Evidence
        </span>
      );
    }
    if (prov === 'Self-reported skill') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#66736C] bg-[#F4F2EA] px-2.5 py-0.5 rounded-md border border-[#DCE4DD]">
          Self-Reported Skill (Unvalidated)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#66736C] bg-[#F4F2EA] px-2.5 py-0.5 rounded-md border border-[#DCE4DD]">
        Not Assessed — No Valid Evidence Yet
      </span>
    );
  };

  const getGapBadgeClass = (status: string) => {
    switch (status) {
      case 'Demonstrated':
        return 'bg-[#237A55]/10 text-[#237A55] border-[#237A55]/30';
      case 'Developing':
        return 'bg-[#25866A]/10 text-[#25866A] border-[#25866A]/30';
      case 'Missing Prerequisite':
        return 'bg-[#B54747]/10 text-[#B54747] border-[#B54747]/30';
      case 'Outdated or Insufficient Evidence':
        return 'bg-[#A76716]/10 text-[#A76716] border-[#A76716]/30';
      default:
        return 'bg-[#66736C]/10 text-[#66736C] border-[#DCE4DD]';
    }
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[quizQuestionIndex] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    INITIAL_ASSESSMENT_QUIZ.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correctCount++;
    });
    const delta = correctCount * 5;
    updateSkillScore(
      'skill_mlf',
      delta,
      undefined,
      'Diagnostic assessment result',
      'NEXORA Diagnostic Rubric Engine'
    );
  };

  const resetQuiz = () => {
    setActiveQuizModal(false);
    setQuizQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizSubmitted(false);
  };

  const allSortedReportItems = [
    ...gapReport.identifiedGaps,
    ...gapReport.demonstratedSkills,
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Competency Profile, Provenance & Skill-Gap Analysis
          </h1>
          <p className="text-xs text-[#66736C]">
            NEXORA strictly separates Self-Reported Skills, Diagnostic Assessment Results, Portfolio Certificates, and Lecturer-Validated Competencies. Missing prerequisites are prioritized before advanced dependent skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGapReport(!showGapReport)}
            className="px-3.5 py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] text-xs font-semibold rounded-xl border border-[#DCE4DD] transition-colors flex items-center gap-2"
          >
            <FileBarChart className="w-4 h-4 text-[#25866A]" />
            <span>{showGapReport ? 'Hide Skill-Gap Report' : 'View Skill-Gap Report'}</span>
          </button>

          <button
            onClick={() => setActiveQuizModal(true)}
            className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D7A85B]" />
            <span>Start Diagnostic Assessment</span>
          </button>
        </div>
      </div>

      {/* PRD 07 Section 6 & 14.2: Prioritized Skill-Gap Analysis Report */}
      {showGapReport && (
        <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE4DD]">
            <div>
              <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                PRD 07 · Skill-Gap Analysis Engine ({gapReport.algorithmVersion})
              </span>
              <h2 className="font-heading font-bold text-base text-[#173A32]">
                Target Goal Alignment: {gapReport.goalTitle}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-[#237A55]/10 text-[#237A55]">Demonstrated</span>
              <span className="px-2 py-0.5 rounded-md bg-[#25866A]/10 text-[#25866A]">Developing</span>
              <span className="px-2 py-0.5 rounded-md bg-[#A76716]/10 text-[#A76716]">Insufficient Evidence</span>
              <span className="px-2 py-0.5 rounded-md bg-[#66736C]/10 text-[#66736C]">Not Assessed</span>
              <span className="px-2 py-0.5 rounded-md bg-[#B54747]/10 text-[#B54747]">Missing Prerequisite</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCE4DD] text-[11px] text-[#66736C] uppercase">
                  <th className="py-2.5 pr-4">Priority</th>
                  <th className="py-2.5 pr-4">Target Micro-Skill</th>
                  <th className="py-2.5 px-3">Evidenced Classification</th>
                  <th className="py-2.5 px-3">Prerequisite Dependencies</th>
                  <th className="py-2.5 px-3">Recommended Next Action</th>
                  <th className="py-2.5 pl-3">Graph Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DD]">
                {allSortedReportItems.map(item => (
                  <tr key={item.skillId} className="hover:bg-[#F4F2EA]/40">
                    <td className="py-3 pr-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#173A32] text-white font-bold text-[11px] tabular-nums">
                        {item.priorityScore}/100
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#173A32]">
                      {item.skillName}
                      <span className="block text-[10px] font-normal text-[#66736C]">
                        {item.level} · {item.rawScoreOrLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getGapBadgeClass(
                          item.currentEvidencedStatus
                        )}`}
                      >
                        {item.currentEvidencedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#66736C]">
                      {item.missingPrerequisiteNames.length > 0 ? (
                        <span className="text-[#B54747] font-semibold">
                          Unmet: {item.missingPrerequisiteNames.join(', ')}
                        </span>
                      ) : item.blocksDownstreamSkillNames.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#25866A] font-semibold">
                          <GitBranch className="w-3 h-3" />
                          Unlocks: {item.blocksDownstreamSkillNames.join(', ')}
                        </span>
                      ) : (
                        'All prerequisites satisfied'
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#173A32] max-w-xs">
                      {item.suggestedNextAction}
                    </td>
                    <td className="py-3 pl-3">
                      <button
                        onClick={() => setInspectedSkillId(item.skillId)}
                        className="px-2.5 py-1 bg-[#F4F2EA] hover:bg-[#173A32] text-[#173A32] hover:text-white text-[11px] font-semibold rounded-lg border border-[#DCE4DD] transition-colors inline-flex items-center gap-1"
                      >
                        <Network className="w-3 h-3" />
                        <span>Inspect Graph</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cluster Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DCE4DD]">
        <button
          onClick={() => setSelectedClusterId('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
            selectedClusterId === 'all'
              ? 'bg-[#173A32] text-white shadow-xs'
              : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
          }`}
        >
          All Competencies ({microSkills.length})
        </button>
        {INITIAL_CLUSTERS.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClusterId(c.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedClusterId === c.id
                ? 'bg-[#173A32] text-white shadow-xs'
                : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
            }`}
          >
            {c.code} · {c.name}
          </button>
        ))}
      </div>

      {/* Micro-Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map(skill => {
          const studentRecord: StudentSkill | undefined = studentSkills[skill.id];
          const mastery: MasteryLevel = studentRecord ? studentRecord.masteryLevel : 'not_assessed';
          const score = studentRecord ? studentRecord.score : 0;
          const selfStars = studentRecord?.selfAssessedConfidence || 0;

          return (
            <div
              key={skill.id}
              className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                      {skill.category} · {skill.level}
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#173A32] leading-snug">
                      {skill.name}
                    </h3>
                  </div>
                  {getMasteryBadge(mastery, score)}
                </div>

                <p className="text-xs text-[#66736C] leading-relaxed">{skill.description}</p>

                {skill.indicators && skill.indicators.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skill.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 bg-[#F4F2EA] text-[#173A32] rounded-md border border-[#DCE4DD]"
                      >
                        Indicator: {ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#DCE4DD] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {getProvenanceBadge(studentRecord)}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectedSkillId(skill.id)}
                      className="text-[11px] font-semibold text-[#25866A] hover:underline flex items-center gap-1"
                    >
                      <Network className="w-3 h-3" />
                      <span>Relationships</span>
                    </button>
                    <span className="font-bold text-[#173A32] tabular-nums text-xs">
                      {score > 0 ? `${score}/100` : 'Not assessed'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#E9E5DA] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      mastery === 'mastered'
                        ? 'bg-[#237A55]'
                        : mastery === 'in_progress'
                        ? 'bg-[#25866A]'
                        : mastery === 'needs_support'
                        ? 'bg-[#A76716]'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#66736C] pt-1">
                  <span>
                    {studentRecord?.lastAssessedAt
                      ? `Assessed: ${studentRecord.lastAssessedAt} · Quality: ${studentRecord.confidenceQuality || 'Verified'}`
                      : 'No formal assessment recorded yet'}
                  </span>

                  <div
                    className="flex items-center gap-1"
                    title="Update your self-reported confidence (does not invent mastery scores)"
                  >
                    <span className="text-[10px] mr-1">Self-Confidence:</span>
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateSelfReportedSkill(skill.id, st)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            st <= selfStars ? 'text-[#D7A85B] fill-[#D7A85B]' : 'text-[#DCE4DD]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRD 07 Section 14.2: Skill Relationship Inspector Modal */}
      {inspectedRelationships && inspectedRelationships.skill && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  PRD 07 · Knowledge Graph Skill Relationship Inspector
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  {inspectedRelationships.skill.name} ({inspectedRelationships.skill.level})
                </h3>
              </div>
              <button
                onClick={() => setInspectedSkillId(null)}
                className="p-1 text-[#66736C] hover:text-[#173A32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-1.5">
                <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-[#25866A]" />
                  Upstream Prerequisites (Foundational First)
                </span>
                {inspectedRelationships.prerequisites.length > 0 ? (
                  <ul className="list-disc list-inside text-[#66736C] space-y-1">
                    {inspectedRelationships.prerequisites.map(p => (
                      <li key={p.id}>
                        <strong className="text-[#173A32]">{p.name}</strong> ({p.level})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#66736C]">None — Foundational entry-point competency.</p>
                )}
              </div>

              <div className="p-3.5 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-1.5">
                <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#25866A]" />
                  Downstream Dependent Skills Unlocked
                </span>
                {inspectedRelationships.downstreamSkills.length > 0 ? (
                  <ul className="list-disc list-inside text-[#66736C] space-y-1">
                    {inspectedRelationships.downstreamSkills.map(d => (
                      <li key={d.id}>
                        <strong className="text-[#173A32]">{d.name}</strong> ({d.level})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#66736C]">Terminal specialization skill.</p>
                )}
              </div>

              <div className="p-3.5 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1.5">
                <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#25866A]" />
                  Mapped University Courses & CPMK
                </span>
                {inspectedRelationships.mappedCourses.length > 0 ? (
                  <ul className="list-disc list-inside text-[#66736C] space-y-1">
                    {inspectedRelationships.mappedCourses.map(c => (
                      <li key={c.id}>
                        <strong className="text-[#173A32]">{c.code}</strong>: {c.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#66736C]">
                    Not mapped to a current semester course (served via Personal Growth Path).
                  </p>
                )}
              </div>

              <div className="p-3.5 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1.5">
                <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#25866A]" />
                  Connected Student Goals & Opportunities
                </span>
                <p className="text-[#66736C]">
                  <strong>Goals:</strong>{' '}
                  {inspectedRelationships.relatedGoals.map(g => g.title).join(', ') || 'General Growth'}
                </p>
                <p className="text-[#66736C]">
                  <strong>Opportunities:</strong>{' '}
                  {inspectedRelationships.relatedOpportunities.map(o => o.title).join(', ') || 'None'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#25866A]/10 border border-[#25866A]/30 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#25866A]" />
                Verified Learning Resources in Graph
              </span>
              {inspectedRelationships.mappedResources.map(r => (
                <div key={r.id} className="flex items-center justify-between text-[#173A32]">
                  <span>
                    <strong>{r.title}</strong> ({r.type} · {r.provider})
                  </span>
                  <span className="text-[#66736C]">{r.estimatedMinutes} mins</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DCE4DD]">
              <button
                onClick={() => setInspectedSkillId(null)}
                className="px-5 py-2 bg-[#173A32] text-white text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Diagnostic Assessment Modal */}
      {activeQuizModal && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  PRD 04 · Diagnostic Assessment (ID: {INITIAL_ASSESSMENT_QUIZ.id})
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  {INITIAL_ASSESSMENT_QUIZ.title}
                </h3>
              </div>
              <button onClick={resetQuiz} className="p-1.5 text-[#66736C] hover:text-[#173A32] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-[#66736C]">
                  <span>
                    Question {quizQuestionIndex + 1} of {INITIAL_ASSESSMENT_QUIZ.questions.length} · Target Skill:{' '}
                    {INITIAL_ASSESSMENT_QUIZ.skillName}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#173A32]">
                    <Clock className="w-3.5 h-3.5" /> 10 mins remaining
                  </span>
                </div>

                <div className="p-4 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-2xl">
                  <p className="text-sm font-semibold text-[#173A32] leading-relaxed">
                    {INITIAL_ASSESSMENT_QUIZ.questions[quizQuestionIndex].question}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {INITIAL_ASSESSMENT_QUIZ.questions[quizQuestionIndex].options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[quizQuestionIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#173A32] text-white border-[#173A32] font-semibold'
                            : 'bg-white text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D7A85B]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#DCE4DD]">
                  <button
                    disabled={quizQuestionIndex === 0}
                    onClick={() => setQuizQuestionIndex(quizQuestionIndex - 1)}
                    className="px-4 py-2 text-xs font-semibold text-[#66736C] disabled:opacity-30 hover:text-[#173A32]"
                  >
                    Previous
                  </button>

                  {quizQuestionIndex < INITIAL_ASSESSMENT_QUIZ.questions.length - 1 ? (
                    <button
                      onClick={() => setQuizQuestionIndex(quizQuestionIndex + 1)}
                      className="px-5 py-2.5 bg-[#25866A] hover:bg-[#173A32] text-white text-xs font-semibold rounded-xl"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizSubmit}
                      className="px-6 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-md"
                    >
                      Submit Diagnostic Assessment
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-[#237A55]/10 text-[#237A55] rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-heading font-extrabold text-xl text-[#173A32]">
                    Diagnostic Evidence Recorded!
                  </h4>
                  <p className="text-xs text-[#66736C]">
                    Your diagnostic result has been saved with provenance and timestamp, and your skill-gap report & opportunity readiness matches have been recalculated.
                  </p>
                </div>

                <div className="p-4 bg-[#F4F2EA] rounded-2xl border border-[#DCE4DD] max-w-md mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">Target Micro-Skill:</span>
                    <span className="font-bold text-[#173A32]">{INITIAL_ASSESSMENT_QUIZ.skillName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">Evidence Provenance:</span>
                    <span className="font-bold text-[#416B8B]">Diagnostic assessment result</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">Evaluator:</span>
                    <span className="font-semibold text-[#173A32]">NEXORA Diagnostic Rubric Engine</span>
                  </div>
                </div>

                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-[#173A32] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#25866A]"
                >
                  Return to Skill Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
