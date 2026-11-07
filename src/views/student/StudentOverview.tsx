import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bookmark,
  Calendar,
  Sparkles,
  Building2,
  MapPin,
  Target,
  Info,
  X,
  Check,
  EyeOff,
  Compass,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { DEMO_IMAGE_SARAH, DEMO_IMAGE_CAMPUS, DEMO_IMAGE_TECHCORP } from '../../services/demoData';
import { NextBestActionItem } from '../../recommendation/recommendationEngine';

interface StudentOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const StudentOverview: React.FC<StudentOverviewProps> = ({ onNavigateTab }) => {
  const {
    profile,
    studentSkills,
    pathways,
    opportunities,
    goals,
    recommendationBundle,
    submitRecommendationFeedback,
    toggleSaveOpportunity,
  } = useNexora();

  const [selectedActionForExplanation, setSelectedActionForExplanation] =
    useState<NextBestActionItem | null>(null);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [aiSourceLabel, setAiSourceLabel] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const totalSkillsCount = 24;
  const assessedSkillsCount = Object.keys(studentSkills).length;
  const activeModulesCount = pathways.filter(p => p.status !== 'completed').length;
  const topRecommendedOpp = opportunities[0];

  const { nextBestActions, gapReport, opportunityMatches } = recommendationBundle;
  const topOppMatch = opportunityMatches[0];

  const handleTriggerAiExplanation = async (action: NextBestActionItem) => {
    setLoadingAi(true);
    setAiNarrative(null);
    try {
      const res = await fetch('/api/recommendations/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: action.title,
          structuredExplanation: action.explanation,
        }),
      });
      const data = await res.json();
      setAiNarrative(data.aiEnhancedNarrative);
      setAiSourceLabel(data.groundingSource);
    } catch (_err) {
      setAiNarrative(
        `${action.explanation.whySeeingThis} ${action.explanation.skillGapSummary} Next step: ${action.explanation.nextActionStep}`
      );
      setAiSourceLabel('Deterministic Rule & Graph Engine (Fallback)');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleFeedback = (
    action: NextBestActionItem,
    type: 'Accepted' | 'Saved' | 'Postponed' | 'Dismissed' | 'Not Relevant'
  ) => {
    submitRecommendationFeedback(action.recommendationId, action.targetEntityId, type);
    setFeedbackToast(
      `Feedback recorded: "${type}" for "${action.title}". Recommendation queue updated.`
    );
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const getCategoryStyle = (cat: NextBestActionItem['category']) => {
    switch (cat) {
      case 'LEARN':
        return 'bg-[#25866A]/10 text-[#25866A] border-[#25866A]/30';
      case 'BUILD':
        return 'bg-[#173A32]/10 text-[#173A32] border-[#173A32]/30';
      case 'EXPLORE':
        return 'bg-[#D7A85B]/20 text-[#A76716] border-[#D7A85B]/40';
      case 'CONNECT':
        return 'bg-[#416B8B]/10 text-[#416B8B] border-[#416B8B]/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Personalized Welcome Banner matching Top Left Mockup */}
      <div className="relative bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 hidden md:block pointer-events-none">
          <img
            src={DEMO_IMAGE_CAMPUS}
            alt="Campus"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#173A32] flex items-center gap-3">
              <span>Good morning, {profile.studentName.split(' ')[0]}!</span>
              <span className="text-2xl" role="img" aria-label="wave">
                👋
              </span>
            </h1>
            <p className="text-sm text-[#66736C] font-medium italic">
              "Grow beyond what you know."
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] text-[#173A32] font-semibold rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-[#25866A]" />
                {profile.universityName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] text-[#173A32] font-semibold rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-[#25866A]" />
                {profile.programName.split(' ')[0]} {profile.programName.split(' ')[1]}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] text-[#173A32] font-semibold rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-[#25866A]" />
                Semester {profile.semester}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#F4F2EA]/60 p-3 rounded-2xl border border-[#DCE4DD] shrink-0">
            <img
              src={profile.avatarUrl || DEMO_IMAGE_SARAH}
              alt={profile.studentName}
              className="w-16 h-16 rounded-xl object-cover border border-[#25866A]/30 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#173A32]">{profile.studentName}</p>
              <p className="text-[11px] text-[#66736C]">GPA {profile.gpa.toFixed(2)} / 4.00</p>
              <span className="inline-block text-[10px] font-bold text-[#237A55] bg-[#237A55]/10 px-2 py-0.5 rounded-md">
                Verified Learner
              </span>
            </div>
          </div>
        </div>
      </div>

      {feedbackToast && (
        <div className="p-3.5 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {feedbackToast}
          </span>
          <button onClick={() => setFeedbackToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Four Primary Stat Cards matching Top Left Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#66736C] mb-2">
            <span className="font-semibold">Learning Progress</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#237A55] bg-[#237A55]/10 px-1.5 py-0.5 rounded-md text-[11px]">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] mb-3 tabular-nums">72%</p>
          <div className="w-full bg-[#E9E5DA] h-2 rounded-full overflow-hidden">
            <div className="bg-[#25866A] h-full rounded-full transition-all duration-500" style={{ width: '72%' }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#66736C] mb-2">
            <span className="font-semibold">Skills Assessed</span>
            <Award className="w-4 h-4 text-[#25866A]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] mb-3 tabular-nums">
            {assessedSkillsCount}{' '}
            <span className="text-lg text-[#66736C] font-normal">/ {totalSkillsCount}</span>
          </p>
          <p className="text-[11px] text-[#66736C]">
            {gapReport.identifiedGaps.length} active skill gaps identified
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#66736C] mb-2">
            <span className="font-semibold">Active Learning Path</span>
            <BookOpen className="w-4 h-4 text-[#25866A]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] mb-3 tabular-nums">
            {activeModulesCount}{' '}
            <span className="text-lg text-[#66736C] font-normal">Modules</span>
          </p>
          <p className="text-[11px] text-[#66736C]">Academic + Personal Growth Paths</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#66736C] mb-2">
            <span className="font-semibold">Available Opportunities</span>
            <Briefcase className="w-4 h-4 text-[#D7A85B]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] mb-3 tabular-nums">
            {opportunityMatches.length}
          </p>
          <p className="text-[11px] text-[#237A55] font-semibold">
            Top match ({topOppMatch?.relevanceScore || 92}% Relevance · {topOppMatch?.eligibilityStatus || 'Eligible'})
          </p>
        </div>
      </div>

      {/* 3. Main 3-Column Content Grid matching Design Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Your Learning Path (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Your Learning Path</h3>
            <button
              onClick={() => onNavigateTab('learning')}
              className="text-xs font-semibold text-[#25866A] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pathways.map(p => (
              <div
                key={p.id}
                onClick={() => onNavigateTab('learning')}
                className="p-3.5 rounded-xl border border-[#DCE4DD] bg-[#F4F2EA]/40 hover:bg-[#F4F2EA] cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {p.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#237A55] shrink-0" />
                    ) : p.status === 'in_progress' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#25866A] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#66736C] shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-[#173A32] line-clamp-1">{p.title}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#66736C]">
                  <span className="capitalize">{p.status.replace('_', ' ')}</span>
                  <span className="font-bold text-[#173A32] tabular-nums">{p.completionPercentage}%</span>
                </div>

                <div className="w-full bg-[#E9E5DA] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.status === 'completed' ? 'bg-[#237A55]' : 'bg-[#25866A]'
                    }`}
                    style={{ width: `${p.completionPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recommended for You Opportunity (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Recommended for You</h3>
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="text-xs font-semibold text-[#25866A] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topRecommendedOpp && (
            <div className="border border-[#DCE4DD] rounded-xl overflow-hidden hover:border-[#25866A]/50 transition-all space-y-3 p-4 bg-white">
              <div className="h-36 w-full rounded-lg overflow-hidden relative">
                <img
                  src={topRecommendedOpp.orgLogo || DEMO_IMAGE_TECHCORP}
                  alt={topRecommendedOpp.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-[#173A32]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-xs">
                  {topRecommendedOpp.category}
                </span>
                {topOppMatch && (
                  <span className="absolute top-2 right-2 bg-[#237A55] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {topOppMatch.eligibilityStatus}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-[#173A32] leading-snug">
                  {topRecommendedOpp.title}
                </h4>
                <p className="text-xs text-[#66736C] flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-[#25866A]" />
                  {topRecommendedOpp.organization}
                </p>
                <p className="text-[11px] text-[#66736C] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#66736C]" />
                  {topRecommendedOpp.location} · Closes {topRecommendedOpp.deadline}
                </p>
              </div>

              <div className="pt-2 border-t border-[#DCE4DD] flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#237A55] bg-[#237A55]/10 px-2.5 py-1 rounded-lg">
                  {topOppMatch ? `${topOppMatch.relevanceScore}% Relevance` : `${topRecommendedOpp.matchPercentage}% match`} ·{' '}
                  {topOppMatch ? `${topOppMatch.readinessPercentage}% Ready` : 'Verified'}
                </span>

                <button
                  onClick={() => toggleSaveOpportunity(topRecommendedOpp.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    topRecommendedOpp.isSaved
                      ? 'bg-[#173A32] text-white border-[#173A32]'
                      : 'bg-white text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Upcoming Deadlines & Active Goals Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Upcoming Deadlines & Goals</h3>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-semibold text-[#25866A] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Goals ({goals.filter(g => !g.paused).length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#B54747]/10 text-[#B54747] flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#173A32] truncate">Final ML Project Submission</p>
                <p className="text-[11px] text-[#66736C]">Apr 25, 2026 · Course CS402 (Mandatory)</p>
              </div>
            </div>

            <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#A76716]/10 text-[#A76716] flex items-center justify-center font-bold shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#173A32] truncate">
                  Active Goal: {gapReport.goalTitle}
                </p>
                <p className="text-[11px] text-[#66736C]">
                  Top Gap: {gapReport.identifiedGaps[0]?.skillName || 'Deep Neural Networks'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#25866A]/10 text-[#25866A] flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#173A32] truncate">TechCorp Internship Application</p>
                <p className="text-[11px] text-[#66736C]">Apr 30, 2026 · Official Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRD 07 Section 9 & 14.1: Next Best Action Intelligence Hub */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[#DCE4DD]">
          <div>
            <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              PRD 07 · Hybrid Recommendation Intelligence Engine ({recommendationBundle.runRecord.algorithmVersion})
            </span>
            <h2 className="font-heading font-bold text-lg text-[#173A32]">
              Prioritized Next Best Actions (LEARN · BUILD · CONNECT · EXPLORE)
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#66736C]">
            <span className="px-2.5 py-1 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg font-semibold text-[#173A32]">
              Mandatory Academic Deadlines Ranked #1
            </span>
            <span className="px-2.5 py-1 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg">
              Calculated in {recommendationBundle.runRecord.calculationDurationMs}ms
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextBestActions.map(action => (
            <div
              key={action.recommendationId}
              className="p-4 rounded-2xl border border-[#DCE4DD] bg-[#F4F2EA]/35 hover:border-[#25866A]/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase ${getCategoryStyle(
                        action.category
                      )}`}
                    >
                      {action.category}
                    </span>
                    <span className="text-[10px] font-bold text-[#66736C] bg-white px-2 py-0.5 rounded-md border border-[#DCE4DD]">
                      {action.urgencyTier}
                    </span>
                  </div>
                  {action.status !== 'Active' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#237A55]/10 text-[#237A55]">
                      {action.status}
                    </span>
                  )}
                </div>

                <h4 className="font-heading font-bold text-sm text-[#173A32] leading-snug">
                  {action.title}
                </h4>
                <p className="text-xs text-[#66736C] leading-relaxed">{action.summary}</p>
              </div>

              <div className="pt-3 border-t border-[#DCE4DD] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      handleFeedback(action, 'Accepted');
                      onNavigateTab(action.navigationTab);
                    }}
                    className="px-3 py-1.5 bg-[#173A32] hover:bg-[#25866A] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Start Action</span>
                  </button>
                  <button
                    onClick={() => handleFeedback(action, 'Saved')}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#F4F2EA] text-[#173A32] text-[11px] font-semibold rounded-lg border border-[#DCE4DD]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleFeedback(action, 'Postponed')}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#F4F2EA] text-[#66736C] text-[11px] font-semibold rounded-lg border border-[#DCE4DD]"
                  >
                    Postpone
                  </button>
                  {!action.isMandatoryAcademic && (
                    <button
                      onClick={() => handleFeedback(action, 'Dismissed')}
                      title="Dismiss recommendation"
                      className="p-1.5 bg-white hover:bg-[#B54747]/10 text-[#66736C] hover:text-[#B54747] rounded-lg border border-[#DCE4DD]"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedActionForExplanation(action);
                    setAiNarrative(null);
                    setAiSourceLabel(null);
                  }}
                  className="text-[11px] font-bold text-[#25866A] hover:underline inline-flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Why this recommendation?</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Part Grounded Recommendation Explanation Modal (PRD 07 Section 11) */}
      {selectedActionForExplanation && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  PRD 07 Section 11 · 7-Part Grounded Recommendation Explanation
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  {selectedActionForExplanation.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActionForExplanation(null)}
                className="p-1 text-[#66736C] hover:text-[#173A32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-1">
                <span className="text-[10px] font-bold text-[#25866A] uppercase block">
                  1. Why You Are Seeing This Recommendation
                </span>
                <p className="text-[#173A32] font-medium">
                  {selectedActionForExplanation.explanation.whySeeingThis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1">
                  <span className="text-[10px] font-bold text-[#173A32] uppercase block">
                    2. Related Goal or Interest
                  </span>
                  <p className="text-[#66736C]">
                    {selectedActionForExplanation.explanation.relatedGoalOrInterest}
                  </p>
                </div>
                <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1">
                  <span className="text-[10px] font-bold text-[#173A32] uppercase block">
                    3. Competencies Involved
                  </span>
                  <p className="text-[#173A32] font-semibold">
                    {selectedActionForExplanation.explanation.involvedCompetencies.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1">
                  <span className="text-[10px] font-bold text-[#173A32] uppercase block">
                    4. Supporting Evidence in Your Record
                  </span>
                  <p className="text-[#66736C]">
                    {selectedActionForExplanation.explanation.supportingEvidence}
                  </p>
                </div>
                <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1">
                  <span className="text-[10px] font-bold text-[#173A32] uppercase block">
                    5. Identified Skill Gap
                  </span>
                  <p className="text-[#A76716] font-medium">
                    {selectedActionForExplanation.explanation.skillGapSummary}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#237A55]/10 rounded-xl border border-[#237A55]/30 space-y-1">
                <span className="text-[10px] font-bold text-[#237A55] uppercase block">
                  6. Concrete Next Action Step
                </span>
                <p className="text-[#173A32] font-semibold">
                  {selectedActionForExplanation.explanation.nextActionStep}
                </p>
              </div>

              <div className="p-3 bg-[#F4F2EA]/50 rounded-xl border border-[#DCE4DD] space-y-1">
                <span className="text-[10px] font-bold text-[#66736C] uppercase block">
                  7. Unknown or Unassessed Information Disclosure
                </span>
                <p className="text-[#66736C]">
                  {selectedActionForExplanation.explanation.unknownInformation}
                </p>
              </div>

              {/* Layer C: Grounded AI Narrative Synthesis */}
              <div className="p-4 bg-[#173A32] text-white rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D7A85B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Layer C · Grounded AI Explanation Assistant
                  </span>
                  <button
                    onClick={() => handleTriggerAiExplanation(selectedActionForExplanation)}
                    disabled={loadingAi}
                    className="px-3 py-1 bg-[#25866A] hover:bg-[#D7A85B] hover:text-[#173A32] text-white text-[11px] font-bold rounded-lg transition-colors"
                  >
                    {loadingAi ? 'Synthesizing...' : 'Generate Grounded Summary'}
                  </button>
                </div>
                {aiNarrative ? (
                  <div className="space-y-1 pt-1">
                    <p className="text-xs text-[#F4F2EA] leading-relaxed">{aiNarrative}</p>
                    <p className="text-[10px] text-[#D7A85B]">Source: {aiSourceLabel}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#E9E5DA]/80">
                    Click "Generate Grounded Summary" to request a concise natural-language synthesis strictly constrained to the verified structured facts above (with automatic deterministic fallback).
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DCE4DD] text-xs">
              <span className="text-[11px] text-[#66736C]">
                Grounding Engine: {selectedActionForExplanation.explanation.groundingSource}
              </span>
              <button
                onClick={() => setSelectedActionForExplanation(null)}
                className="px-5 py-2 bg-[#173A32] text-white font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
