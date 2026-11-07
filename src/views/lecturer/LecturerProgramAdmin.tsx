import React, { useState } from 'react';
import {
  CheckCircle2,
  Briefcase,
  BookOpen,
  Handshake,
  Tag,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const LecturerProgramAdmin: React.FC = () => {
  const {
    activeSubRole,
    mappingApprovals,
    approveMappingOutcome,
    opportunities,
    reviewOpportunity,
    collaborationProjects,
    approveCollaborationProject,
    flaggedCompetencies,
    resolveFlaggedCompetency,
    organizationProfile,
    updateOrganizationVerificationStatus,
  } = useNexora();

  const [activeTab, setActiveTab] = useState<
    'opportunities' | 'projects' | 'mappings' | 'flagged_skills' | 'organizations'
  >('opportunities');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});

  const pendingMappings = mappingApprovals.filter(m => m.status === 'pending');
  const pendingOpps = opportunities.filter(
    o => o.publicationStatus === 'Submitted for Review' || o.reviewStatus === 'pending'
  );
  const pendingProjects = collaborationProjects.filter(p => p.status === 'Under University Review');
  const pendingFlags = flaggedCompetencies.filter(f => f.status === 'Flagged for University Review');

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleApproveMapping = (id: string) => {
    approveMappingOutcome(id);
    showToast('EVENT 2 Complete: Course outcome (CPMK) mapping officially approved for degree curriculum coverage.');
  };

  const handleReviewOpp = (
    oppId: string,
    status: 'approved' | 'rejected' | 'needs_correction'
  ) => {
    const customFeedback =
      feedbackInputs[oppId] ||
      (status === 'approved'
        ? 'Approved by Authorized University Opportunity Reviewer. Published to Student Opportunity Discovery.'
        : status === 'needs_correction'
        ? 'Needs Revision: Please clarify mandatory semester eligibility criteria and application deadline.'
        : 'Rejected due to non-compliance with institutional partner guidelines.');
    reviewOpportunity(oppId, status, customFeedback);
    showToast(
      status === 'approved'
        ? 'EVENT 3 Complete: Opportunity approved, published to Student Portal, and matched to eligible students!'
        : `EVENT 3 Complete: Opportunity review decision (${status}) recorded and sent to Industry Partner.`
    );
  };

  const handleApproveProject = (projId: string) => {
    approveCollaborationProject(projId);
    showToast('Workflow C7 Complete: University-Industry collaboration project approved and set to Active!');
  };

  const handleResolveFlag = (
    flagId: string,
    res: 'Mapped to Existing Taxonomy' | 'Approved by Curriculum Board'
  ) => {
    resolveFlaggedCompetency(flagId, res);
    showToast(
      res === 'Approved by Curriculum Board'
        ? 'Workflow C3 Complete: Unmapped industry skill approved by Curriculum Board and added to shared Micro-Skill Taxonomy!'
        : 'Workflow C3 Complete: Industry requirement mapped to existing NEXORA competency taxonomy.'
    );
  };

  const handleOrgStatusChange = (
    status: 'verified' | 'pending' | 'unverified' | 'rejected' | 'suspended'
  ) => {
    updateOrganizationVerificationStatus(status);
    showToast(`Workflow C1 Complete: Organization status for ${organizationProfile.name} updated to '${status.toUpperCase()}'.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#25866A]">
            PRD 04 · Institutional Governance Workspace ({activeSubRole})
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Curriculum Oversight, Opportunity Review & Partner Verification
          </h1>
          <p className="text-xs text-[#66736C] max-w-3xl">
            Verify industry-submitted opportunities (EVENT 3), approve CPMK curriculum mappings (EVENT 2), govern unmapped industry competency proposals (C3), and verify partner organizations (C1).
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173A32] text-white text-xs font-semibold rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#D7A85B]" />
          <span>Authorized Reviewer Access</span>
        </span>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DCE4DD] pb-2">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'opportunities'
              ? 'bg-[#173A32] text-white shadow-xs'
              : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Opportunity Verification ({pendingOpps.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('mappings')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'mappings'
              ? 'bg-[#173A32] text-white shadow-xs'
              : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>CPMK Outcome Approvals ({pendingMappings.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('flagged_skills')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'flagged_skills'
              ? 'bg-[#173A32] text-white shadow-xs'
              : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Unmapped Industry Skills ({pendingFlags.length} Flagged)</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-[#173A32] text-white shadow-xs'
              : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Collaboration Projects ({pendingProjects.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'organizations'
              ? 'bg-[#173A32] text-white shadow-xs'
              : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Verification (C1)</span>
        </button>
      </div>

      {/* Tab 1: Industry Opportunities (EVENT 3) */}
      {activeTab === 'opportunities' && (
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              Industry Opportunity Verification Queue (EVENT 3)
            </h3>
            <span className="text-xs text-[#66736C]">
              Approving an opportunity publishes it to Student Opportunity Discovery
            </span>
          </div>

          <div className="space-y-4">
            {opportunities.map(opp => (
              <div
                key={opp.id}
                className="p-4 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-[#173A32] text-sm">{opp.title}</span>
                    <p className="text-[#66736C] mt-0.5">
                      {opp.organization} · {opp.category} · Deadline: {opp.deadline} · URL: {opp.officialUrl}
                    </p>
                  </div>
                  <span className="font-bold text-[#25866A] px-2.5 py-1 bg-white rounded-lg border border-[#DCE4DD]">
                    State: {opp.publicationStatus || 'Published'}
                  </span>
                </div>

                <p className="text-[#173A32]">
                  <strong>Mandatory Eligibility:</strong> {opp.eligibility}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#DCE4DD]">
                  <input
                    type="text"
                    placeholder="Optional reviewer reason or revision note..."
                    value={feedbackInputs[opp.id] || ''}
                    onChange={e =>
                      setFeedbackInputs({ ...feedbackInputs, [opp.id]: e.target.value })
                    }
                    className="flex-1 p-2 bg-white border border-[#DCE4DD] rounded-lg text-xs text-[#173A32]"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReviewOpp(opp.id, 'needs_correction')}
                      className="px-3 py-2 bg-[#A76716]/10 text-[#A76716] font-semibold rounded-lg hover:bg-[#A76716] hover:text-white transition-colors"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleReviewOpp(opp.id, 'rejected')}
                      className="px-3 py-2 bg-[#B54747]/10 text-[#B54747] font-semibold rounded-lg hover:bg-[#B54747] hover:text-white transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReviewOpp(opp.id, 'approved')}
                      className="px-4 py-2 bg-[#237A55] text-white font-semibold rounded-lg hover:bg-[#173A32] transition-colors"
                    >
                      Approve & Publish (EVENT 3)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Course Outcome Mappings (EVENT 2) */}
      {activeTab === 'mappings' && (
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            Course Outcome (CPMK) Mapping Approvals (EVENT 2)
          </h3>

          <div className="space-y-3">
            {mappingApprovals.map(item => (
              <div
                key={item.id}
                className="p-4 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#25866A] uppercase">
                    {item.courseCode} · {item.courseName}
                  </span>
                  <p className="font-semibold text-[#173A32]">{item.outcomeText}</p>
                  <p className="text-[11px] text-[#66736C]">
                    Submitted by {item.requestedBy} on {item.submittedAt}
                  </p>
                </div>

                {item.status === 'approved' ? (
                  <span className="font-bold text-[#237A55] shrink-0">Approved</span>
                ) : (
                  <button
                    onClick={() => handleApproveMapping(item.id)}
                    className="px-4 py-2 bg-[#237A55] hover:bg-[#173A32] text-white font-semibold rounded-xl shrink-0"
                  >
                    Approve CPMK Mapping
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Unmapped Industry Skill Proposals (Workflow C3) */}
      {activeTab === 'flagged_skills' && (
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              Industry-Flagged Unmapped Skills (Workflow C3)
            </h3>
            <p className="text-xs text-[#66736C]">
              Industry partners cannot automatically create official competencies. Academic Administrators review flagged plain-language skills here.
            </p>
          </div>

          <div className="space-y-3">
            {flaggedCompetencies.map(flag => (
              <div
                key={flag.id}
                className="p-4 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#25866A] uppercase">
                    {flag.organizationName} · {flag.requirementTier} · Cluster: {flag.suggestedClusterId.toUpperCase()}
                  </span>
                  <h4 className="font-bold text-sm text-[#173A32]">{flag.plainLanguageRequirement}</h4>
                  <p className="text-[11px] text-[#66736C]">
                    Status: <strong>{flag.status}</strong> · Submitted {flag.submittedAt}
                  </p>
                </div>

                {flag.status === 'Flagged for University Review' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveFlag(flag.id, 'Mapped to Existing Taxonomy')}
                      className="px-3 py-2 bg-white border border-[#DCE4DD] hover:bg-[#F4F2EA] text-[#173A32] font-semibold rounded-xl"
                    >
                      Map to Existing Skill
                    </button>
                    <button
                      onClick={() => handleResolveFlag(flag.id, 'Approved by Curriculum Board')}
                      className="px-3.5 py-2 bg-[#237A55] hover:bg-[#173A32] text-white font-semibold rounded-xl"
                    >
                      Approve as New Micro-Skill
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-[#237A55] shrink-0">{flag.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Collaboration Projects (Workflow C7) */}
      {activeTab === 'projects' && (
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            University-Industry Collaboration Project Approvals (Workflow C7)
          </h3>

          <div className="space-y-3">
            {collaborationProjects.map(proj => (
              <div
                key={proj.id}
                className="p-4 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="font-semibold text-[#25866A]">
                    {proj.organizationName} · {proj.category}
                  </span>
                  <h4 className="font-bold text-sm text-[#173A32]">{proj.title}</h4>
                  <p className="text-[#66736C]">{proj.description}</p>
                </div>

                {proj.status === 'Active' ? (
                  <span className="font-bold text-[#237A55] shrink-0">Approved & Active</span>
                ) : (
                  <button
                    onClick={() => handleApproveProject(proj.id)}
                    className="px-4 py-2 bg-[#237A55] hover:bg-[#173A32] text-white font-semibold rounded-xl shrink-0"
                  >
                    Approve Project
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Organization Onboarding & Verification Status (Workflow C1) */}
      {activeTab === 'organizations' && (
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              Partner Organization Verification Lifecycle (Workflow C1)
            </h3>
            <p className="text-xs text-[#66736C]">
              Manage institutional verification status for industry partners: Unverified, Pending Verification, Verified, Rejected, or Suspended.
            </p>
          </div>

          <div className="p-5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-2xl space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-heading font-bold text-base text-[#173A32]">
                  {organizationProfile.name}
                </h4>
                <p className="text-[#66736C]">
                  {organizationProfile.organizationType} · {organizationProfile.sector} · {organizationProfile.website}
                </p>
              </div>
              <span className="px-3 py-1 bg-[#237A55]/10 text-[#237A55] font-bold rounded-lg border border-[#237A55]/30 uppercase">
                Current Status: {organizationProfile.verifiedStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#DCE4DD]">
              <span className="font-semibold text-[#173A32] mr-2">Set Verification Status:</span>
              {(['unverified', 'pending', 'verified', 'rejected', 'suspended'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => handleOrgStatusChange(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize border transition-colors ${
                    organizationProfile.verifiedStatus === st
                      ? 'bg-[#173A32] text-white border-[#173A32]'
                      : 'bg-white text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                  }`}
                >
                  {st === 'pending' ? 'Pending Verification' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
