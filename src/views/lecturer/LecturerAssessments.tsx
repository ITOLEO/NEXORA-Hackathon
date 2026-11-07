import React, { useState } from 'react';
import {
  Award,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const LecturerAssessments: React.FC = () => {
  const { evidenceList, rubrics, microSkills, reviewEvidence } = useNexora();
  const [selectedEvId, setSelectedEvId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [pendingConfirmDecision, setPendingConfirmDecision] = useState<
    'approved' | 'revision_requested' | 'rejected' | null
  >(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const pendingEvidence = evidenceList.filter(e => e.status === 'pending' || e.status === 'submitted');
  const reviewedEvidence = evidenceList.filter(e => e.status !== 'pending' && e.status !== 'submitted' && e.status !== 'draft');

  const selectedEvidence = evidenceList.find(e => e.id === selectedEvId);

  const handleReviewDecision = (
    evId: string,
    decision: 'approved' | 'revision_requested' | 'rejected'
  ) => {
    const defaultNote =
      decision === 'approved'
        ? 'Approved after lecturer rubric evaluation. Observable micro-skill indicators satisfied.'
        : decision === 'revision_requested'
        ? 'Revision requested: Please include unit test benchmarks and leak-free train/test split verification.'
        : 'Rejected: Artifact does not meet minimum course rubric criteria.';

    reviewEvidence(evId, decision, feedbackText || defaultNote);
    setSelectedEvId(null);
    setPendingConfirmDecision(null);
    setFeedbackText('');
    setReviewSuccess(
      decision === 'approved'
        ? 'EVENT 1 Complete: Evidence approved! Student competency record updated & opportunity matches recalculated.'
        : decision === 'revision_requested'
        ? 'EVENT 1 Complete: Revision request dispatched to Student Portal.'
        : 'EVENT 1 Complete: Evidence marked as Rejected.'
    );
    setTimeout(() => setReviewSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
            PRD 04 · Workflow B4 & Cross-Portal Event 1
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Assessments, Rubric Evaluation & Evidence Validation
          </h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Evaluate student submissions against rubric criteria to validate competency mastery. Official university transcript grades remain strictly separate from NEXORA competency intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-extrabold px-3 py-1.5 bg-[#A76716]/10 text-[#A76716] rounded-xl border border-[#A76716]/30">
            {pendingEvidence.length} Submissions Pending Review
          </span>
        </div>
      </div>

      {/* Assessment Lifecycle States Strip (Workflow B4) */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#173A32] font-semibold">
          <ShieldAlert className="w-4 h-4 text-[#25866A]" />
          <span>Supported Assessment Lifecycle States:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          {['Draft', 'Published', 'Open', 'Submitted', 'Under Review', 'Assessed', 'Revision Requested', 'Closed'].map(st => (
            <span key={st} className="px-2.5 py-0.5 rounded-md bg-[#F4F2EA] text-[#173A32] border border-[#DCE4DD]">
              {st}
            </span>
          ))}
        </div>
      </div>

      {reviewSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* Main Grid: Pending Submissions vs Rubrics (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Evidence Submissions Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A76716]" />
                Pending Lecturer Review Queue (EVENT 1)
              </h3>
              <span className="text-xs text-[#66736C]">{pendingEvidence.length} Items</span>
            </div>

            {pendingEvidence.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#66736C] bg-[#F4F2EA] rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#237A55] mx-auto" />
                <p className="font-bold text-[#173A32]">Review Queue Complete!</p>
                <p>All student evidence submissions have been evaluated against rubrics.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvidence.map(item => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl space-y-3 hover:border-[#25866A]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#25866A]/10 text-[#25866A] uppercase">
                        {item.type} · State: Under Review
                      </span>
                      <span className="text-[11px] text-[#66736C]">Submitted {item.submittedAt}</span>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#173A32]">{item.title}</h4>
                      <p className="text-xs text-[#25866A] font-semibold mt-0.5">
                        Student: {item.studentName || 'Sarah Jenkins'}
                      </p>
                      <p className="text-xs text-[#66736C] mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.skillIds.map(skId => {
                        const sk = microSkills.find(m => m.id === skId);
                        return (
                          <span
                            key={skId}
                            className="text-[10px] font-semibold px-2 py-0.5 bg-white text-[#173A32] rounded-md border border-[#DCE4DD]"
                          >
                            Target Skill: {sk?.name || skId}
                          </span>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#DCE4DD] flex items-center justify-between">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#25866A] hover:underline flex items-center gap-1"
                        >
                          <span>View Artifact</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => setSelectedEvId(item.id)}
                        className="px-4 py-2 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                      >
                        Evaluate with Rubric
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Assessed History */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#173A32] pb-2 border-b border-[#DCE4DD]">
              Recently Assessed Submissions ({reviewedEvidence.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reviewedEvidence.map(ev => (
                <div
                  key={ev.id}
                  className="p-3 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-[#173A32]">{ev.title}</p>
                    <p className="text-[11px] text-[#66736C]">
                      {ev.studentName || 'Sarah Jenkins'} · Evaluated by {ev.validatorName || 'Dr. Ahmad Hidayat'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase shrink-0 ${
                      ev.status === 'approved'
                        ? 'bg-[#237A55]/10 text-[#237A55]'
                        : ev.status === 'revision_requested'
                        ? 'bg-[#A76716]/10 text-[#A76716]'
                        : 'bg-[#B54747]/10 text-[#B54747]'
                    }`}
                  >
                    {ev.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Official Rubrics & Evaluation Criteria (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#25866A]" />
              Course Rubric Criteria
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#237A55]/10 text-[#237A55] rounded-md">
              State: Published & Open
            </span>
          </div>

          <div className="space-y-4">
            {rubrics.map(rubric => (
              <div key={rubric.id} className="p-4 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-2">
                  <h4 className="font-bold text-[#173A32]">{rubric.title}</h4>
                  <span className="font-extrabold text-[#237A55]">{rubric.totalPoints} pts</span>
                </div>

                <div className="space-y-2">
                  {rubric.criteria.map(crit => (
                    <div key={crit.id} className="p-2.5 bg-white rounded-lg border border-[#DCE4DD] space-y-0.5">
                      <div className="flex justify-between font-bold text-[#173A32]">
                        <span>{crit.name}</span>
                        <span className="text-[#25866A]">{crit.maxPoints} pts</span>
                      </div>
                      <p className="text-[11px] text-[#66736C]">{crit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluate & Endorse Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase">
                  EVENT 1 · Lecturer Rubric Evaluation
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">{selectedEvidence.title}</h3>
              </div>
              <button onClick={() => setSelectedEvId(null)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-1">
                <span className="font-bold text-[#173A32]">
                  Student: {selectedEvidence.studentName || 'Sarah Jenkins'}
                </span>
                <p className="text-[#66736C] leading-relaxed">{selectedEvidence.description}</p>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Qualitative Lecturer Endorsement / Revision Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter rubric feedback, observable indicator verification, or revision requirements..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>
            </div>

            {pendingConfirmDecision ? (
              <div className="p-4 bg-[#F4F2EA] border border-[#DCE4DD] rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173A32]">
                    Confirm Assessment Action:{' '}
                    <span className="uppercase text-[#25866A]">
                      {pendingConfirmDecision.replace('_', ' ')}
                    </span>
                  </span>
                </div>
                <p className="text-[#66736C] leading-relaxed">
                  Finalizing this evaluation will immediately update the student's verified competency provenance, recalculate opportunity readiness, and log an immutable audit record.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingConfirmDecision(null)}
                    className="px-3.5 py-2 text-[#66736C] font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewDecision(selectedEvidence.id, pendingConfirmDecision)}
                    className="px-4 py-2 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-[10px] shadow-xs cursor-pointer"
                  >
                    Confirm & Finalize Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#DCE4DD]">
                <button
                  type="button"
                  onClick={() => setPendingConfirmDecision('rejected')}
                  className="px-3.5 py-2.5 bg-[#B54747]/10 hover:bg-[#B54747] text-[#B54747] hover:text-white font-semibold text-xs rounded-[10px] border border-[#B54747]/30 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingConfirmDecision('revision_requested')}
                  className="px-3.5 py-2.5 bg-[#A76716]/10 hover:bg-[#A76716] text-[#A76716] hover:text-white font-semibold text-xs rounded-[10px] border border-[#A76716]/30 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Request Revision</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingConfirmDecision('approved')}
                  className="px-4 py-2.5 bg-[#237A55] hover:bg-[#173A32] text-white text-xs font-semibold rounded-[10px] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Validate Mastery</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
