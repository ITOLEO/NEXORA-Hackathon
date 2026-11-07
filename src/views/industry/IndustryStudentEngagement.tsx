import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  ExternalLink,
  Lock,
  Eye,
  Bookmark,
  ThumbsUp,
  MousePointerClick,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const IndustryStudentEngagement: React.FC = () => {
  const { opportunities, studentConsentRecords } = useNexora();
  const [selectedOppId, setSelectedOppId] = useState<string>('all');

  const activeConsentRecords = studentConsentRecords.filter(r =>
    selectedOppId === 'all' ? true : r.opportunityId === selectedOppId
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#237A55] font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Consent-Gated Student Engagement & Privacy Protection Active</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
          Student Engagement & Consent-Based Interest
        </h1>
        <p className="text-xs text-[#66736C] max-w-3xl leading-relaxed">
          Monitor opportunity views, bookmarks, expressed interest, and external portal link clicks. Industry partners only see learner information when a student explicitly grants sharing consent—private academic transcripts, unshared assessment scores, and full student databases remain strictly restricted.
        </p>
      </div>

      {/* Opportunity Engagement Funnel Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
          Opportunity Engagement Funnel
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCE4DD] text-[#66736C] font-semibold bg-[#F4F2EA]/60">
                <th className="py-3 px-4">Opportunity Title</th>
                <th className="py-3 px-4">Category & Status</th>
                <th className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#25866A]" /> Views
                  </span>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-[#D7A85B]" /> Bookmarks
                  </span>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#237A55]" /> Expressed Interest
                  </span>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#173A32]" /> Official Link Clicks
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4DD]">
              {opportunities.map(opp => (
                <tr key={opp.id} className="hover:bg-[#F4F2EA]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#173A32]">{opp.title}</td>
                  <td className="py-3 px-4 text-[#66736C]">
                    {opp.category} · {opp.publicationStatus || 'Published'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#173A32] tabular-nums">
                    {opp.viewsCount || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#173A32] tabular-nums">
                    {opp.bookmarksCount || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#237A55] tabular-nums">
                    {opp.expressInterestCount || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#173A32] tabular-nums">
                    {opp.externalClicksCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Bar for Consent-Based Shared Profiles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#25866A]" />
          Consent-Based Student Interest Records
        </h3>

        <select
          value={selectedOppId}
          onChange={e => setSelectedOppId(e.target.value)}
          className="p-2 bg-white border border-[#DCE4DD] rounded-xl text-xs font-semibold text-[#173A32]"
        >
          <option value="all">All Opportunities</option>
          {opportunities.map(o => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      {/* Consent Records Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeConsentRecords.map(rec => (
          <div
            key={rec.id}
            className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 flex flex-col justify-between"
          >
            {rec.consentGranted ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#66736C] pb-2 border-b border-[#DCE4DD]">
                    <span className="font-semibold text-[#237A55] flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Explicit Student Consent Active
                    </span>
                    <span>Shared {rec.sharedAt}</span>
                  </div>

                  <div>
                    <h4 className="font-heading font-extrabold text-base text-[#173A32]">
                      {rec.studentDisplayName}
                    </h4>
                    {rec.sharedFields.includes('program_semester') && (
                      <p className="text-xs text-[#66736C] mt-0.5">
                        {rec.universityName} · {rec.programName} · Semester {rec.semester}
                      </p>
                    )}
                    <p className="text-[11px] font-semibold text-[#25866A] mt-1">
                      Target Opportunity: {rec.opportunityTitle}
                    </p>
                  </div>

                  {rec.sharedFields.includes('verified_skills') && (
                    <div className="p-3.5 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1.5 text-xs">
                      <span className="font-bold text-[#173A32] block">
                        Approved Evidenced Competencies (No Private Scores Exposed):
                      </span>
                      <ul className="list-disc list-inside text-[#66736C] space-y-0.5">
                        {rec.evidencedSkillNames.map(sk => (
                          <li key={sk}>{sk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#DCE4DD] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#173A32]">
                    Status: {rec.applicationProgress}
                  </span>

                  {rec.sharedFields.includes('approved_portfolio_links') && rec.portfolioUrl ? (
                    <a
                      href={rec.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25866A] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Approved Portfolio Artifact</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[#66736C] text-[11px]">Portfolio link not shared</span>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-2 text-xs text-[#66736C]">
                <div className="flex items-center gap-2 font-bold text-[#173A32]">
                  <Lock className="w-4 h-4 text-[#B54747]" />
                  <span>Student Withdrew Sharing Consent</span>
                </div>
                <p>
                  The student has withdrawn profile sharing permission for "{rec.opportunityTitle}". All personal learner data has been revoked from external partner access.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
