import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { parseUnstructuredOpportunityDescription } from '../../recommendation/recommendationEngine';

export const IndustryAnalytics: React.FC = () => {
  const { opportunities, microSkills, collaborationProjects, flagMissingCompetency } = useNexora();

  const [rawDescriptionText, setRawDescriptionText] = useState(
    'We are seeking an Applied AI & Data Engineering Intern proficient in Python, Pandas, SQL data pipelines, Machine Learning model evaluation (scikit-learn), and Docker containerization. Open to Semester 5+ undergraduate students with GPA >= 3.2.'
  );
  const [parsedResult, setParsedResult] = useState<
    ReturnType<typeof parseUnstructuredOpportunityDescription>
  >(() =>
    parseUnstructuredOpportunityDescription(
      'We are seeking an Applied AI & Data Engineering Intern proficient in Python, Pandas, SQL data pipelines, Machine Learning model evaluation (scikit-learn), and Docker containerization. Open to Semester 5+ undergraduate students with GPA >= 3.2.',
      microSkills
    )
  );
  const [parsing, setParsing] = useState(false);
  const [flaggedNotice, setFlaggedNotice] = useState<string | null>(null);

  const handleParseUnstructured = async () => {
    setParsing(true);
    try {
      const res = await fetch('/api/recommendations/parse-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawDescriptionText }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.candidateSkills)) {
        setParsedResult(data);
      } else {
        setParsedResult(parseUnstructuredOpportunityDescription(rawDescriptionText, microSkills));
      }
    } catch (_err) {
      setParsedResult(parseUnstructuredOpportunityDescription(rawDescriptionText, microSkills));
    } finally {
      setParsing(false);
    }
  };

  // Compute aggregated skill demand across all opportunities & projects
  const skillDemandMap: Record<
    string,
    { name: string; category: string; requiredCount: number; recommendedCount: number }
  > = {};

  microSkills.forEach(sk => {
    skillDemandMap[sk.id] = {
      name: sk.name,
      category: sk.category,
      requiredCount: 0,
      recommendedCount: 0,
    };
  });

  opportunities.forEach(opp => {
    opp.requiredSkillIds.forEach(id => {
      if (skillDemandMap[id]) skillDemandMap[id].requiredCount += 1;
    });
    (opp.relevantSkillIds || []).forEach(id => {
      if (skillDemandMap[id]) skillDemandMap[id].recommendedCount += 1;
    });
  });

  collaborationProjects.forEach(proj => {
    proj.requiredSkillIds.forEach(id => {
      if (skillDemandMap[id]) skillDemandMap[id].requiredCount += 1;
    });
  });

  const sortedSkillDemand = Object.values(skillDemandMap).sort(
    (a, b) => b.requiredCount + b.recommendedCount - (a.requiredCount + a.recommendedCount)
  );

  const totalViews = opportunities.reduce((sum, o) => sum + (o.viewsCount || 0), 0);
  const totalBookmarks = opportunities.reduce((sum, o) => sum + (o.bookmarksCount || 0), 0);
  const totalInterest = opportunities.reduce((sum, o) => sum + (o.expressInterestCount || 0), 0);
  const totalClicks = opportunities.reduce((sum, o) => sum + (o.externalClicksCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#237A55] font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Aggregated & De-Identified Institutional Intelligence</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
          Opportunity Engagement, Taxonomy Coverage & Unstructured Requirement Parser
        </h1>
        <p className="text-xs text-[#66736C] max-w-3xl leading-relaxed">
          Analyze aggregated student interest conversion rates, taxonomy coverage, and extract canonical NEXORA competencies from unstructured opportunity descriptions. Individual student assessment scores, GPAs, and private academic records are strictly excluded.
        </p>
      </div>

      {/* 4 Conversion Funnel Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <p className="text-xs font-semibold text-[#66736C] mb-1">Total Opportunity Views</p>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#237A55] font-semibold mt-2">+18% vs prior term</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <p className="text-xs font-semibold text-[#66736C] mb-1">Student Bookmarks</p>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {totalBookmarks.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#66736C] mt-2">
            {totalViews > 0 ? Math.round((totalBookmarks / totalViews) * 100) : 0}% View-to-Save Rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <p className="text-xs font-semibold text-[#66736C] mb-1">Expressed Interest Events</p>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {totalInterest.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#66736C] mt-2">Consent-verified interest signals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <p className="text-xs font-semibold text-[#66736C] mb-1">Official Application Clicks</p>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#25866A] font-semibold mt-2">Outbound to verified URLs</p>
        </div>
      </div>

      {/* PRD 07 Section 16 & 17: Unstructured Opportunity Description Parser & Taxonomy Mapper */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[#DCE4DD]">
          <div>
            <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              PRD 07 Section 16 & 17 · Grounded Unstructured Opportunity Requirement Parser
            </span>
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              Map Plain-Language Job Descriptions to Canonical NEXORA Competencies
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#173A32] bg-[#F4F2EA] px-3 py-1 rounded-lg border border-[#DCE4DD]">
            Engine: {parsedResult.groundingMode}
          </span>
        </div>

        {flaggedNotice && (
          <div className="p-3 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{flaggedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          <div className="lg:col-span-5 space-y-3">
            <label className="font-bold text-[#173A32] block">
              Paste Unstructured Opportunity Description:
            </label>
            <textarea
              rows={5}
              value={rawDescriptionText}
              onChange={e => setRawDescriptionText(e.target.value)}
              className="w-full p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] leading-relaxed"
            />
            <button
              onClick={handleParseUnstructured}
              disabled={parsing}
              className="w-full py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl transition-colors"
            >
              {parsing ? 'Extracting & Validating Against Taxonomy...' : 'Extract Candidate Canonical Skills'}
            </button>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#173A32]">
                Candidate Canonical Skills ({parsedResult.candidateSkills.length} Matched)
              </span>
              <span className="text-[11px] text-[#A76716] font-semibold">
                All AI/Parsed mappings require human verification before official publication
              </span>
            </div>

            <div className="space-y-2">
              {parsedResult.candidateSkills.map(cand => (
                <div
                  key={cand.skillId}
                  className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-[#173A32]">
                      {cand.skillName} ({cand.skillId})
                    </span>
                    <span className="block text-[11px] text-[#66736C]">
                      {cand.category} · Matched terms: {cand.matchedKeywords.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#237A55]/10 text-[#237A55] font-bold text-[11px]">
                      {cand.confidenceScore}% Confidence
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#D7A85B]/20 text-[#A76716] font-bold text-[10px]">
                      Human Review Required
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {parsedResult.missingDetailsFlags.length > 0 && (
              <div className="p-3 bg-[#A76716]/10 border border-[#A76716]/30 rounded-xl space-y-1">
                <span className="font-bold text-[#A76716] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Missing Opportunity Details Flagged by Parser:
                </span>
                <ul className="list-disc list-inside text-[#173A32] space-y-0.5 text-[11px]">
                  {parsedResult.missingDetailsFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#66736C]">
                Need a competency not in the canonical catalog?
              </span>
              <button
                onClick={() => {
                  flagMissingCompetency(
                    rawDescriptionText.slice(0, 70),
                    'cluster_dai',
                    'Recommended Competency'
                  );
                  setFlaggedNotice(
                    'Submitted unmapped requirement to University Curriculum Board for review.'
                  );
                  setTimeout(() => setFlaggedNotice(null), 3500);
                }}
                className="text-[11px] font-bold text-[#25866A] hover:underline"
              >
                + Flag Unmapped Requirement for University Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Competency Demand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#25866A]" />
              Competency Demand Across Partner Opportunities & Projects
            </h3>
            <span className="text-xs text-[#66736C]">Mapped to NEXORA Taxonomy</span>
          </div>

          <div className="space-y-3 text-xs">
            {sortedSkillDemand.map(item => {
              const total = item.requiredCount + item.recommendedCount;
              const pct = Math.min(100, Math.round((total / 6) * 100));
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#173A32]">{item.name}</span>
                      <span className="text-[#66736C] ml-2">· {item.category}</span>
                    </div>
                    <span className="font-semibold text-[#173A32] tabular-nums">
                      {item.requiredCount} Required · {item.recommendedCount} Recommended
                    </span>
                  </div>
                  <div className="w-full bg-[#E9E5DA] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#25866A] h-full rounded-full transition-all"
                      style={{ width: `${Math.max(12, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy & Governance Assurance Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#173A32]" />
            Institutional Privacy Boundary
          </h3>

          <p className="text-[#66736C] leading-relaxed">
            NEXORA is an Institutional Learning Intelligence Platform—not an unrestricted CV database or external applicant tracking system.
          </p>

          <div className="p-4 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-2">
            <span className="font-bold text-[#173A32] block">Protected from Partner Access:</span>
            <ul className="list-disc list-inside text-[#66736C] space-y-1">
              <li>Full university student directories</li>
              <li>Private learner profiles & unshared portfolios</li>
              <li>Raw assessment quiz scores & GPA rankings</li>
              <li>Lecturer internal feedback & flexible support groups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
