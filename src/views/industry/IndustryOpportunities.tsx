import React, { useState } from 'react';
import {
  Briefcase,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  Trash2,
  Edit2,
  Send,
  Globe,
  X,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { Opportunity } from '../../types/nexora';

interface IndustryOpportunitiesProps {
  onNavigateTab: (tabId: string) => void;
  onEditOpportunity: (opp: Opportunity) => void;
}

export const IndustryOpportunities: React.FC<IndustryOpportunitiesProps> = ({
  onNavigateTab,
  onEditOpportunity,
}) => {
  const {
    opportunities,
    microSkills,
    publishApprovedOpportunity,
    saveOrSubmitOpportunity,
    archiveOpportunity,
    deleteDraftOpportunity,
  } = useNexora();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const filteredOpps = opportunities.filter(o => {
    if (statusFilter === 'all') return true;
    return (o.publicationStatus || 'Published') === statusFilter;
  });

  const handleSubmitDraftForReview = (opp: Opportunity) => {
    saveOrSubmitOpportunity(
      {
        ...opp,
        title: opp.title,
        category: opp.category,
        officialUrl: opp.officialUrl,
        deadline: opp.deadline,
        eligibility: opp.eligibility,
        requiredSkillIds: opp.requiredSkillIds,
      },
      'Submitted for Review',
      opp.id
    );
    setActionBanner(`"${opp.title}" submitted for University Opportunity Reviewer verification.`);
    setTimeout(() => setActionBanner(null), 4000);
  };

  const handlePublishApproved = (opp: Opportunity) => {
    publishApprovedOpportunity(opp.id);
    setActionBanner(
      `"${opp.title}" is now Published! Eligible students can immediately discover it in the Student Portal.`
    );
    setTimeout(() => setActionBanner(null), 4000);
  };

  const handleArchive = (opp: Opportunity) => {
    archiveOpportunity(opp.id);
    setActionBanner(`"${opp.title}" has been archived.`);
    setTimeout(() => setActionBanner(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteDraftOpportunity(confirmDeleteId);
    setConfirmDeleteId(null);
    setActionBanner('Draft opportunity permanently deleted.');
    setTimeout(() => setActionBanner(null), 3500);
  };

  const getSkillName = (id: string) => microSkills.find(m => m.id === id)?.name || id;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Opportunity Management & Lifecycle
          </h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Manage internships, challenges, projects, and mentoring programs across Draft, University Verification, Approved, and Published states.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('industry_create_opportunity')}
          className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#D7A85B]" />
          <span>Create Opportunity</span>
        </button>
      </div>

      {actionBanner && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionBanner}</span>
        </div>
      )}

      {/* Status Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#DCE4DD]">
        {['all', 'Published', 'Approved', 'Submitted for Review', 'Needs Revision', 'Draft', 'Archived'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              statusFilter === st
                ? 'bg-[#173A32] text-white shadow-xs'
                : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
            }`}
          >
            {st === 'all' ? 'All Opportunities' : st}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpps.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-[#DCE4DD] text-center space-y-3">
            <Briefcase className="w-8 h-8 text-[#66736C] mx-auto" />
            <p className="text-sm font-bold text-[#173A32]">No opportunities in "{statusFilter}" state</p>
            <p className="text-xs text-[#66736C]">
              Create a new opportunity or switch the status filter above.
            </p>
          </div>
        ) : (
          filteredOpps.map(opp => {
            const pubStatus = opp.publicationStatus || 'Published';
            return (
              <div
                key={opp.id}
                className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 hover:border-[#25866A]/40 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#DCE4DD]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736C]">
                      <span className="font-semibold text-[#173A32]">{opp.category}</span>
                      <span>·</span>
                      <span>{opp.location}</span>
                      <span>·</span>
                      <span>Deadline: {opp.deadline}</span>
                      <span>·</span>
                      <span>DEMO Record</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-[#173A32]">{opp.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {pubStatus === 'Published' && (
                      <span className="text-xs font-bold text-[#237A55] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Published & Live
                      </span>
                    )}
                    {pubStatus === 'Approved' && (
                      <span className="text-xs font-bold text-[#25866A] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> University Approved (Ready to Publish)
                      </span>
                    )}
                    {pubStatus === 'Submitted for Review' && (
                      <span className="text-xs font-bold text-[#A76716] flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Submitted for University Review
                      </span>
                    )}
                    {pubStatus === 'Needs Revision' && (
                      <span className="text-xs font-bold text-[#B54747] flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Needs Revision
                      </span>
                    )}
                    {pubStatus === 'Draft' && (
                      <span className="text-xs font-bold text-[#66736C] flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Draft
                      </span>
                    )}
                    {pubStatus === 'Archived' && (
                      <span className="text-xs font-bold text-[#66736C] flex items-center gap-1">
                        <Archive className="w-4 h-4" /> Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-7 space-y-2">
                    <p className="text-[#66736C] leading-relaxed">{opp.description || opp.eligibility}</p>
                    <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-1">
                      <span className="font-bold text-[#173A32] block">Mandatory Eligibility Criteria:</span>
                      <p className="text-[#66736C]">{opp.eligibility}</p>
                    </div>
                    {opp.reviewerFeedback && (
                      <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-1">
                        <span className="font-bold text-[#25866A] block">University Reviewer Note:</span>
                        <p className="text-[#173A32]">{opp.reviewerFeedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-5 bg-[#F4F2EA]/40 p-4 rounded-xl border border-[#DCE4DD] space-y-2.5">
                    <div>
                      <span className="font-bold text-[#173A32] block mb-1">Required Competencies:</span>
                      <p className="text-[#66736C]">
                        {opp.requiredSkillIds.map(getSkillName).join(' · ') || 'None specified'}
                      </p>
                    </div>

                    {opp.relevantSkillIds && opp.relevantSkillIds.length > 0 && (
                      <div>
                        <span className="font-bold text-[#173A32] block mb-1">Recommended Competencies:</span>
                        <p className="text-[#66736C]">{opp.relevantSkillIds.map(getSkillName).join(' · ')}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#DCE4DD] flex items-center justify-between text-[11px] text-[#66736C] tabular-nums">
                      <span>{opp.viewsCount || 0} Views</span>
                      <span>·</span>
                      <span>{opp.bookmarksCount || 0} Bookmarks</span>
                      <span>·</span>
                      <span>{opp.expressInterestCount || 0} Interested</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#DCE4DD] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <a
                    href={opp.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25866A] font-semibold hover:underline flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Official Destination: {opp.officialUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onEditOpportunity(opp)}
                      className="px-3.5 py-2 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] font-semibold rounded-xl border border-[#DCE4DD] transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Opportunity</span>
                    </button>

                    {(pubStatus === 'Draft' || pubStatus === 'Needs Revision') && (
                      <button
                        onClick={() => handleSubmitDraftForReview(opp)}
                        className="px-4 py-2 bg-[#25866A] hover:bg-[#173A32] text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for University Review</span>
                      </button>
                    )}

                    {pubStatus === 'Approved' && (
                      <button
                        onClick={() => handlePublishApproved(opp)}
                        className="px-4 py-2 bg-[#237A55] hover:bg-[#173A32] text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publish to Student Portal</span>
                      </button>
                    )}

                    {pubStatus === 'Published' && (
                      <button
                        onClick={() => handleArchive(opp)}
                        className="px-3.5 py-2 bg-white hover:bg-[#F4F2EA] text-[#66736C] font-semibold rounded-xl border border-[#DCE4DD] transition-colors flex items-center gap-1.5"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>
                    )}

                    {pubStatus === 'Draft' && (
                      <button
                        onClick={() => setConfirmDeleteId(opp.id)}
                        className="px-3 py-2 bg-[#B54747]/10 hover:bg-[#B54747] text-[#B54747] hover:text-white font-semibold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Draft</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Destructive Delete Action */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Confirm Draft Deletion</h3>
              <button onClick={() => setConfirmDeleteId(null)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#66736C] leading-relaxed">
              Are you sure you want to permanently delete this draft opportunity? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD] text-xs">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 font-semibold text-[#66736C] hover:text-[#173A32]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-[#B54747] hover:bg-[#173A32] text-white font-semibold rounded-xl"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
