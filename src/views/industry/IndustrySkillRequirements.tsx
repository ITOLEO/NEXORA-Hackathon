import React, { useState } from 'react';
import {
  GitBranch,
  Search,
  Flag,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { INITIAL_CLUSTERS } from '../../services/demoData';
import { RequirementTier } from '../../types/nexora';

export const IndustrySkillRequirements: React.FC = () => {
  const { microSkills, flaggedCompetencies, flagMissingCompetency } = useNexora();

  const [plainTextQuery, setPlainTextQuery] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState('cluster_dai');
  const [selectedTier, setSelectedTier] = useState<RequirementTier>('Required Competency');
  const [flagSuccess, setFlagSuccess] = useState<string | null>(null);

  const matchingSkills = microSkills.filter(
    sk =>
      sk.name.toLowerCase().includes(plainTextQuery.toLowerCase()) ||
      sk.description.toLowerCase().includes(plainTextQuery.toLowerCase()) ||
      sk.category.toLowerCase().includes(plainTextQuery.toLowerCase())
  );

  const handleFlagMissing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainTextQuery.trim()) return;
    flagMissingCompetency(plainTextQuery.trim(), selectedClusterId, selectedTier);
    setFlagSuccess(
      `Requirement "${plainTextQuery.trim()}" has been flagged for University Curriculum Review. Official academic taxonomy remains protected.`
    );
    setPlainTextQuery('');
    setTimeout(() => setFlagSuccess(null), 4500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs space-y-2">
        <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
          Skill Requirement Mapping & Taxonomy Alignment
        </h1>
        <p className="text-xs text-[#66736C] max-w-3xl leading-relaxed">
          Connect plain-language industry role requirements to the shared NEXORA institutional competency taxonomy. If a specialized industry capability does not yet exist in the university curriculum, flag it for faculty review.
        </p>
      </div>

      {/* 4 Requirement Tiers Reference Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] space-y-1">
          <span className="font-bold text-[#173A32] block">1. Mandatory Eligibility</span>
          <p className="text-[#66736C] text-[11px]">
            Formal degree program, semester standing, or institutional prerequisite required to apply.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] space-y-1">
          <span className="font-bold text-[#25866A] block">2. Required Competency</span>
          <p className="text-[#66736C] text-[11px]">
            Core technical or analytical micro-skills directly evaluated in recommendation matching.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] space-y-1">
          <span className="font-bold text-[#D7A85B] block">3. Recommended Competency</span>
          <p className="text-[#66736C] text-[11px]">
            Complementary capabilities that strengthen readiness without disqualifying learners.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] space-y-1">
          <span className="font-bold text-[#66736C] block">4. Optional Competency</span>
          <p className="text-[#66736C] text-[11px]">
            Bonus domain familiarity or tooling exposure taught during onboarding.
          </p>
        </div>
      </div>

      {flagSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{flagSuccess}</span>
        </div>
      )}

      {/* Main Split: Plain-Language Matcher & Taxonomy Flagging vs Available University Taxonomy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Plain-Language Matcher & Flagging Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleFlagMissing}
            className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs"
          >
            <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
              Plain-Language Requirement Matcher
            </h3>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">
                Describe Industry Skill or Requirement in Plain Language
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#66736C] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Vector Database Indexing or Python Pandas..."
                  value={plainTextQuery}
                  onChange={e => setPlainTextQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Target Competency Cluster</label>
                <select
                  value={selectedClusterId}
                  onChange={e => setSelectedClusterId(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                >
                  {INITIAL_CLUSTERS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Requirement Tier</label>
                <select
                  value={selectedTier}
                  onChange={e => setSelectedTier(e.target.value as RequirementTier)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                >
                  <option value="Mandatory Eligibility">Mandatory Eligibility</option>
                  <option value="Required Competency">Required Competency</option>
                  <option value="Recommended Competency">Recommended Competency</option>
                  <option value="Optional Competency">Optional Competency</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-[11px] text-[#66736C] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#A76716] shrink-0 mt-0.5" />
              <span>
                Governance Rule: Industry partners cannot silently create official academic competencies. Unmatched requirements are flagged for university curriculum board review.
              </span>
            </div>

            <button
              type="submit"
              disabled={!plainTextQuery.trim()}
              className="w-full py-2.5 bg-[#173A32] hover:bg-[#25866A] disabled:opacity-40 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4 text-[#D7A85B]" />
              <span>Flag Unmatched Competency for University Review</span>
            </button>
          </form>

          {/* Flagged Proposals Queue */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
              Flagged Competency Review Queue ({flaggedCompetencies.length})
            </h3>

            <div className="space-y-3">
              {flaggedCompetencies.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#66736C]">
                    <span className="font-semibold text-[#25866A]">{item.requirementTier}</span>
                    <span>{item.submittedAt}</span>
                  </div>
                  <p className="font-bold text-[#173A32]">{item.plainLanguageRequirement}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#66736C]">
                      Cluster: {INITIAL_CLUSTERS.find(c => c.id === item.suggestedClusterId)?.code || 'DAI'}
                    </span>
                    <span className="font-semibold text-[#A76716] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Matching Institutional Competency Taxonomy (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#25866A]" />
              Available Institutional Competency Taxonomy ({matchingSkills.length} Matches)
            </h3>
          </div>

          {matchingSkills.length === 0 ? (
            <div className="p-8 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] text-center space-y-2">
              <p className="font-bold text-[#173A32]">
                No official university micro-skill matches "{plainTextQuery}"
              </p>
              <p className="text-[#66736C]">
                Use the button on the left to flag this plain-language requirement for university curriculum review.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {matchingSkills.map(sk => {
                const cluster = INITIAL_CLUSTERS.find(c => c.id === sk.clusterId);
                return (
                  <div
                    key={sk.id}
                    className="p-4 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl space-y-1.5 hover:border-[#25866A]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#66736C]">
                      <span className="font-semibold text-[#25866A]">
                        {cluster?.code} · {sk.category}
                      </span>
                      <span className="font-semibold text-[#173A32]">Level: {sk.level}</span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-[#173A32]">{sk.name}</h4>
                    <p className="text-[#66736C] leading-relaxed">{sk.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
