import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Bookmark,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Info,
  ThumbsUp,
  Search,
  X,
  ShieldCheck,
  Lock,
  EyeOff,
  AlertTriangle,
  SlidersHorizontal,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { Opportunity } from '../../types/nexora';
import { OpportunityRecommendationMatch } from '../../recommendation/recommendationEngine';

export const StudentOpportunities: React.FC = () => {
  const {
    opportunities,
    profile,
    studentConsentRecords,
    recommendationBundle,
    submitRecommendationFeedback,
    toggleSaveOpportunity,
    expressInterestInOpportunity,
    withdrawStudentConsent,
    recordExternalApplicationClick,
  } = useNexora();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<
    'all' | 'Eligible' | 'Potentially Eligible'
  >('all');
  const [savedOrDeadlineFilter, setSavedOrDeadlineFilter] = useState<
    'all' | 'saved' | 'closing_soon'
  >('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'readiness' | 'deadline'>('relevance');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeExplanationMatch, setActiveExplanationMatch] =
    useState<OpportunityRecommendationMatch | null>(null);
  const [detailViewMatch, setDetailViewMatch] =
    useState<OpportunityRecommendationMatch | null>(null);
  const [consentModalOpp, setConsentModalOpp] = useState<Opportunity | null>(null);
  const [selectedSharedFields, setSelectedSharedFields] = useState<
    ('program_semester' | 'verified_skills' | 'approved_portfolio_links' | 'career_goal')[]
  >(['program_semester', 'verified_skills', 'approved_portfolio_links']);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const { opportunityMatches, rankingConfig } = recommendationBundle;

  // PRD 08 Section 9.D: Filter by category, eligibility, saved/deadline, and sort by relevance/readiness/deadline
  const filteredMatches = opportunityMatches
    .filter(match => {
      const opp = opportunities.find(o => o.id === match.opportunityId);
      const matchesCat =
        selectedCategory === 'all' ||
        match.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesElig =
        eligibilityFilter === 'all' || match.eligibilityStatus === eligibilityFilter;
      const matchesSearch =
        match.opportunityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.organization.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesSavedOrDeadline = true;
      if (savedOrDeadlineFilter === 'saved') {
        matchesSavedOrDeadline = Boolean(opp?.isSaved);
      } else if (savedOrDeadlineFilter === 'closing_soon') {
        matchesSavedOrDeadline = match.featureContributions.timingRelevanceScore >= 85;
      }

      return matchesCat && matchesElig && matchesSearch && matchesSavedOrDeadline;
    })
    .sort((a, b) => {
      if (sortBy === 'readiness') {
        return b.readinessPercentage - a.readinessPercentage;
      }
      if (sortBy === 'deadline') {
        const oppA = opportunities.find(o => o.id === a.opportunityId);
        const oppB = opportunities.find(o => o.id === b.opportunityId);
        return (oppA?.deadline || '').localeCompare(oppB?.deadline || '');
      }
      return b.relevanceScore - a.relevanceScore;
    });

  const toggleSharedField = (
    field: 'program_semester' | 'verified_skills' | 'approved_portfolio_links' | 'career_goal'
  ) => {
    if (selectedSharedFields.includes(field)) {
      setSelectedSharedFields(selectedSharedFields.filter(f => f !== field));
    } else {
      setSelectedSharedFields([...selectedSharedFields, field]);
    }
  };

  const handleConfirmConsentShare = () => {
    if (!consentModalOpp) return;
    expressInterestInOpportunity(consentModalOpp.id, selectedSharedFields);
    setBannerMessage(
      `Explicit consent recorded for "${consentModalOpp.title}". Only your selected fields are visible to ${consentModalOpp.organization}.`
    );
    setConsentModalOpp(null);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleWithdrawConsent = (opp: Opportunity) => {
    withdrawStudentConsent(opp.id);
    setBannerMessage(
      `Consent withdrawn for "${opp.title}". ${opp.organization} can no longer view your shared learner profile.`
    );
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const getEligibilityBadge = (status: OpportunityRecommendationMatch['eligibilityStatus']) => {
    switch (status) {
      case 'Eligible':
        return (
          <span className="px-2.5 py-0.5 rounded-[6px] bg-[#237A55]/10 text-[#237A55] border border-[#237A55]/30 text-[11px] font-bold">
            Eligible
          </span>
        );
      case 'Potentially Eligible':
        return (
          <span className="px-2.5 py-0.5 rounded-[6px] bg-[#25866A]/10 text-[#25866A] border border-[#25866A]/30 text-[11px] font-bold">
            Potentially Eligible
          </span>
        );
      case 'Not Eligible':
        return (
          <span className="px-2.5 py-0.5 rounded-[6px] bg-[#B54747]/10 text-[#B54747] border border-[#B54747]/30 text-[11px] font-bold">
            Not Eligible
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-[6px] bg-[#A76716]/10 text-[#A76716] border border-[#A76716]/30 text-[11px] font-bold">
            Eligibility Unknown
          </span>
        );
    }
  };

  const detailOpportunity = detailViewMatch
    ? opportunities.find(o => o.id === detailViewMatch.opportunityId)
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Opportunity Discovery & Eligibility Matching
          </h1>
          <p className="text-xs text-[#66736C] leading-relaxed">
            NEXORA separates <strong>Mandatory Eligibility</strong>, <strong>Skill Readiness</strong>, and <strong>Weighted Relevance Ranking</strong> ({rankingConfig.configurationVersion}: 30% Goal + 25% Interest + 25% Competency + 20% Timing). Expired opportunities are automatically excluded.
          </p>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* PRD 08 Section 9.D: Multi-Dimensional Filter & Sort Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['all', 'Internship', 'Challenge', 'Mentoring', 'Project'].map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-[10px] transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#173A32] text-white shadow-xs'
                    : 'bg-[#F4F2EA] text-[#66736C] hover:text-[#173A32] hover:bg-[#E9E5DA]'
                }`}
              >
                {cat === 'all' ? `All Types (${opportunityMatches.length})` : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#66736C] absolute left-3 top-2.5" />
            <input
              type="text"
              aria-label="Search opportunities by title or organization"
              placeholder="Search opportunity title or organization..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-xs text-[#173A32] focus:outline-hidden focus:border-[#25866A]"
            />
          </div>
        </div>

        {/* Secondary Filter Row: Eligibility, Deadline/Saved, Sort */}
        <div className="pt-3 border-t border-[#DCE4DD] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#66736C]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#25866A]" />
              Eligibility:
            </span>
            {(['all', 'Eligible', 'Potentially Eligible'] as const).map(status => (
              <button
                type="button"
                key={status}
                onClick={() => setEligibilityFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  eligibilityFilter === status
                    ? 'bg-[#25866A]/15 text-[#173A32] border-[#25866A]'
                    : 'bg-white text-[#66736C] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                }`}
              >
                {status === 'all' ? 'All Eligibility' : status}
              </button>
            ))}

            <span className="text-[#DCE4DD] hidden sm:inline">|</span>

            {([
              { id: 'all', label: 'All Deadlines' },
              { id: 'closing_soon', label: 'Closing Soon' },
              { id: 'saved', label: 'Saved Only' },
            ] as const).map(f => (
              <button
                type="button"
                key={f.id}
                onClick={() => setSavedOrDeadlineFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  savedOrDeadlineFilter === f.id
                    ? 'bg-[#173A32] text-white border-[#173A32]'
                    : 'bg-white text-[#66736C] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="opp-sort-select" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#66736C]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#25866A]" />
              Sort by:
            </label>
            <select
              id="opp-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'relevance' | 'readiness' | 'deadline')}
              className="px-2.5 py-1 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg text-xs font-semibold text-[#173A32]"
            >
              <option value="relevance">Relevance Score</option>
              <option value="readiness">Skill Readiness %</option>
              <option value="deadline">Closest Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State if filters match 0 opportunities */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white border border-[#DCE4DD] rounded-2xl p-10 text-center space-y-3">
          <p className="font-heading font-bold text-base text-[#173A32]">
            No Verified Opportunities Match Your Active Filters
          </p>
          <p className="text-xs text-[#66736C] max-w-md mx-auto">
            Try clearing your eligibility or saved opportunity filters to view all university-verified opportunities.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setEligibilityFilter('all');
              setSavedOrDeadlineFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#173A32] text-white text-xs font-semibold rounded-[10px] cursor-pointer"
          >
            Reset Opportunity Filters
          </button>
        </div>
      ) : (
        /* Opportunities Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map(match => {
            const opp = opportunities.find(o => o.id === match.opportunityId);
            if (!opp) return null;

            const existingConsent = studentConsentRecords.find(
              r => r.opportunityId === opp.id && r.studentId === profile.userId && r.consentGranted
            );

            return (
              <div
                key={opp.id}
                className="bg-white rounded-[12px] border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736C]">
                      <span className="font-bold text-[#173A32]">{opp.category}</span>
                      <span>·</span>
                      {getEligibilityBadge(match.eligibilityStatus)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSaveOpportunity(opp.id)}
                        className={`px-2.5 py-1.5 rounded-[10px] border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          opp.isSaved
                            ? 'bg-[#173A32] text-white border-[#173A32]'
                            : 'bg-white text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                        }`}
                        aria-label="Save Opportunity"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{opp.isSaved ? 'Saved' : 'Save Opportunity'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          submitRecommendationFeedback(
                            match.recommendationId,
                            opp.id,
                            'Not Relevant',
                            'Student marked opportunity not relevant'
                          );
                          setBannerMessage(
                            `Marked "${opp.title}" as Not Relevant and removed from active recommendations.`
                          );
                          setTimeout(() => setBannerMessage(null), 3500);
                        }}
                        title="Mark Not Relevant / Dismiss"
                        aria-label="Mark opportunity not relevant"
                        className="p-2 rounded-[10px] border border-[#DCE4DD] bg-white text-[#66736C] hover:text-[#B54747] hover:bg-[#B54747]/10 transition-colors cursor-pointer"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-[#173A32] leading-snug">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-[#66736C] font-semibold flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-[#25866A]" />
                      {opp.organization}
                    </p>
                    <p className="text-[11px] text-[#66736C] flex items-center gap-2 mt-1 tabular-nums">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opp.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Deadline: {opp.deadline}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]">
                      <span className="font-semibold text-[#66736C] block text-[10px] uppercase">
                        Mandatory Eligibility:
                      </span>
                      <p className="mt-0.5 leading-relaxed font-medium">
                        {opp.eligibility || 'Unknown — Not specified by partner'}
                      </p>
                    </div>

                    <div className="p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]">
                      <span className="font-semibold text-[#66736C] block text-[10px] uppercase">
                        Skill Readiness (Informational):
                      </span>
                      <p className="mt-0.5 leading-relaxed font-bold text-[#25866A] tabular-nums">
                        {match.readinessSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[#237A55] text-xs font-extrabold tabular-nums">
                      <Sparkles className="w-3.5 h-3.5 text-[#D7A85B]" />
                      {match.relevanceScore}% Relevance Score ({match.featureContributions.configurationVersion})
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDetailViewMatch(match)}
                        className="text-xs font-semibold text-[#173A32] hover:text-[#25866A] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#25866A]" />
                        <span>Check Eligibility & Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveExplanationMatch(match)}
                        className="text-xs font-semibold text-[#25866A] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Review Recommendation</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DCE4DD] flex flex-wrap items-center gap-2">
                  <a
                    href={opp.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordExternalApplicationClick(opp.id)}
                    className="flex-1 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-[10px] text-center shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap px-3"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {existingConsent ? (
                    <button
                      type="button"
                      onClick={() => handleWithdrawConsent(opp)}
                      className="px-3.5 py-2.5 bg-[#B54747]/10 hover:bg-[#B54747] text-[#B54747] hover:text-white text-xs font-semibold rounded-[10px] border border-[#B54747]/30 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Withdraw Consent</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConsentModalOpp(opp)}
                      className="px-3.5 py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] text-xs font-semibold rounded-[10px] border border-[#DCE4DD] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#25866A]" />
                      <span>Express Interest ({opp.expressInterestCount})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRD 08 Section 9.D: Opportunity Detail View Modal */}
      {detailViewMatch && detailOpportunity && (
        <div
          className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Opportunity Details and Eligibility"
        >
          <div className="bg-white rounded-[16px] border border-[#DCE4DD] shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE4DD]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#25866A]">
                    {detailOpportunity.category} · Verified Institutional Opportunity
                  </span>
                  {getEligibilityBadge(detailViewMatch.eligibilityStatus)}
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#173A32]">
                  {detailOpportunity.title}
                </h3>
                <p className="text-xs text-[#66736C] font-semibold mt-0.5">
                  {detailOpportunity.organization} · {detailOpportunity.location} · Closes {detailOpportunity.deadline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailViewMatch(null)}
                aria-label="Close opportunity detail dialog"
                className="p-1.5 text-[#66736C] hover:text-[#173A32] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1.5">
                <h4 className="font-bold text-[#173A32]">Opportunity Overview & Learning Value</h4>
                <p className="text-[#66736C] leading-relaxed">
                  {detailOpportunity.description ||
                    'Verified partner program connecting university competencies with supervised practical deliverables.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-[#DCE4DD] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#66736C]">
                    Mandatory Academic Eligibility
                  </span>
                  <p className="font-semibold text-[#173A32]">{detailOpportunity.eligibility}</p>
                  {detailOpportunity.studyLevel && (
                    <p className="text-[11px] text-[#66736C]">Study Level: {detailOpportunity.studyLevel}</p>
                  )}
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#DCE4DD] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#66736C]">
                    Schedule & Application Destination
                  </span>
                  <p className="font-semibold text-[#173A32]">
                    Duration: {detailOpportunity.duration || '12 Weeks'} ({detailOpportunity.availablePositions || 5} Positions)
                  </p>
                  <p className="text-[11px] text-[#25866A] truncate">{detailOpportunity.officialUrl}</p>
                </div>
              </div>

              {/* Evidenced Skills vs Skill Gaps & Preparation */}
              <div className="p-4 bg-white rounded-xl border border-[#DCE4DD] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#173A32]">
                    Your Evidenced Competencies, Skill Gaps & Recommended Preparation
                  </h4>
                  <span className="font-bold text-[#25866A] tabular-nums">
                    {detailViewMatch.readinessPercentage}% Readiness
                  </span>
                </div>
                <div className="space-y-2">
                  {detailViewMatch.skillReadinessItems.map(item => (
                    <div
                      key={item.skillId}
                      className="p-2.5 bg-[#F4F2EA]/60 rounded-lg border border-[#DCE4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-[#173A32]">
                          {item.skillName} ({item.tier})
                        </span>
                        <span className="block text-[#66736C]">{item.currentEvidenceStatus}</span>
                      </div>
                      <span
                        className={`font-semibold ${
                          item.hasGap ? 'text-[#A76716]' : 'text-[#237A55]'
                        }`}
                      >
                        {item.preparationRecommendation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCE4DD] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDetailViewMatch(null)}
                className="px-4 py-2 text-xs font-semibold text-[#66736C] hover:text-[#173A32]"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleSaveOpportunity(detailOpportunity.id);
                  }}
                  className="px-4 py-2 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] text-xs font-semibold rounded-[10px] border border-[#DCE4DD]"
                >
                  {detailOpportunity.isSaved ? 'Saved' : 'Save Opportunity'}
                </button>
                <a
                  href={detailOpportunity.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordExternalApplicationClick(detailOpportunity.id)}
                  className="px-4 py-2 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-[10px] inline-flex items-center gap-1.5"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Student Consent Modal */}
      {consentModalOpp && (
        <div
          className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Explicit Learner Data Sharing Consent"
        >
          <div className="bg-white rounded-[16px] border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  Explicit Learner Data Sharing Consent
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  Share Interest with {consentModalOpp.organization}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConsentModalOpp(null)}
                aria-label="Close consent dialog"
                className="text-[#66736C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#66736C] leading-relaxed">
                Select which verified learner fields you authorize NEXORA to share with{' '}
                <strong className="text-[#173A32]">{consentModalOpp.organization}</strong> for{' '}
                <strong className="text-[#173A32]">{consentModalOpp.title}</strong>. You can withdraw consent at any time.
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 'program_semester' as const,
                    label: 'University, Degree Program & Current Semester',
                  },
                  {
                    id: 'verified_skills' as const,
                    label: 'Lecturer-Verified Competency Badges (Excludes Raw Quiz Scores)',
                  },
                  {
                    id: 'approved_portfolio_links' as const,
                    label: 'Approved Portfolio Project Repository Links',
                  },
                  {
                    id: 'career_goal' as const,
                    label: 'Target Career Objective Statement',
                  },
                ].map(item => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSharedFields.includes(item.id)}
                      onChange={() => toggleSharedField(item.id)}
                      className="w-4 h-4 rounded-xs border-[#DCE4DD] text-[#25866A]"
                    />
                    <span className="font-semibold text-[#173A32]">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-[11px] text-[#66736C] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#237A55] shrink-0" />
                <span>
                  Note: Expressing interest does not submit an external job application. Use "Apply on Official Portal" to complete the company's official application process.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE4DD] text-xs">
              <button
                type="button"
                onClick={() => setConsentModalOpp(null)}
                className="px-4 py-2 text-[#66736C] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConsentShare}
                className="px-5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-[10px]"
              >
                Grant Consent & Express Interest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRD 07 Section 8 & 11: Opportunity Eligibility, Readiness & Weighted Relevance Formula Modal */}
      {activeExplanationMatch && (
        <div
          className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Recommendation Explanation"
        >
          <div className="bg-white rounded-[16px] border border-[#DCE4DD] shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  PRD 07 · Reproducible Opportunity Matching & Grounded Explanation
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  {activeExplanationMatch.opportunityTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveExplanationMatch(null)}
                aria-label="Close explanation dialog"
                className="p-1 text-[#66736C] hover:text-[#173A32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Reproducible Weighted Relevance Breakdown */}
              <div className="p-4 bg-[#F4F2EA] rounded-2xl border border-[#DCE4DD] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173A32]">
                    Weighted Relevance Formula ({activeExplanationMatch.featureContributions.configurationVersion})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#173A32] text-white font-extrabold tabular-nums">
                    Final Score: {activeExplanationMatch.relevanceScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] tabular-nums">
                  <div className="p-2.5 bg-white rounded-xl border border-[#DCE4DD]">
                    <span className="text-[#66736C] block">Goal Alignment (30%)</span>
                    <span className="font-bold text-sm text-[#173A32]">
                      {activeExplanationMatch.featureContributions.goalAlignmentScore}/100
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#DCE4DD]">
                    <span className="text-[#66736C] block">Interest Match (25%)</span>
                    <span className="font-bold text-sm text-[#173A32]">
                      {activeExplanationMatch.featureContributions.interestAlignmentScore}/100
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#DCE4DD]">
                    <span className="text-[#66736C] block">Competency (25%)</span>
                    <span className="font-bold text-sm text-[#173A32]">
                      {activeExplanationMatch.featureContributions.competencyRelevanceScore}/100
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#DCE4DD]">
                    <span className="text-[#66736C] block">Timing (20%)</span>
                    <span className="font-bold text-sm text-[#173A32]">
                      {activeExplanationMatch.featureContributions.timingRelevanceScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Mandatory Eligibility Criteria Check */}
              <div className="p-3.5 bg-white rounded-xl border border-[#DCE4DD] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173A32] uppercase text-[10px]">
                    A. Mandatory Eligibility Evaluation (Separate from Readiness)
                  </span>
                  {getEligibilityBadge(activeExplanationMatch.eligibilityStatus)}
                </div>
                <div className="space-y-1.5">
                  {activeExplanationMatch.eligibilityCriteriaChecked.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] bg-[#F4F2EA]/50 p-2 rounded-lg">
                      <span className="font-semibold text-[#173A32]">{c.criterion}</span>
                      <span
                        className={`font-bold ${
                          c.status === 'Met'
                            ? 'text-[#237A55]'
                            : c.status === 'Unmet'
                            ? 'text-[#B54747]'
                            : 'text-[#A76716]'
                        }`}
                      >
                        {c.status} — {c.sourceNote}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Readiness Analysis */}
              <div className="p-3.5 bg-white rounded-xl border border-[#DCE4DD] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173A32] uppercase text-[10px]">
                    B. Skill Readiness Breakdown ({activeExplanationMatch.readinessPercentage}% Ready)
                  </span>
                  <span className="text-[11px] text-[#66736C]">
                    Skill gaps are informational and never auto-disqualify
                  </span>
                </div>
                <div className="space-y-1.5">
                  {activeExplanationMatch.skillReadinessItems.map(item => (
                    <div
                      key={item.skillId}
                      className="p-2.5 bg-[#F4F2EA]/60 rounded-lg border border-[#DCE4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-[#173A32]">
                          {item.skillName} ({item.tier})
                        </span>
                        <span className="block text-[#66736C]">{item.currentEvidenceStatus}</span>
                      </div>
                      <span
                        className={`font-semibold ${
                          item.hasGap ? 'text-[#A76716]' : 'text-[#237A55]'
                        }`}
                      >
                        {item.preparationRecommendation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {activeExplanationMatch.explanation.unknownInformation && (
                <div className="p-3 bg-[#F4F2EA]/70 rounded-xl border border-[#DCE4DD] flex items-center gap-2 text-[11px] text-[#66736C]">
                  <AlertTriangle className="w-4 h-4 text-[#A76716] shrink-0" />
                  <span>{activeExplanationMatch.explanation.unknownInformation}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#DCE4DD] text-right">
              <button
                type="button"
                onClick={() => setActiveExplanationMatch(null)}
                className="px-5 py-2 bg-[#173A32] text-white font-semibold text-xs rounded-[10px]"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
