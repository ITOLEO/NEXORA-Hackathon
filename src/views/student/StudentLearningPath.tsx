import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Send,
  FileCheck,
  GitBranch,
  GraduationCap,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { SequencedPathwayItem } from '../../recommendation/recommendationEngine';

interface StudentLearningPathProps {
  onNavigateTab: (tabId: string) => void;
}

export const StudentLearningPath: React.FC<StudentLearningPathProps> = () => {
  const {
    pathways,
    completeActivity,
    submitEvidence,
    recommendationBundle,
    submitRecommendationFeedback,
  } = useNexora();

  const [activeTrack, setActiveTrack] = useState<'academic' | 'personal_growth'>('academic');
  const [selectedPathId, setSelectedPathId] = useState<string>(pathways[1]?.id || pathways[0]?.id);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const activePath = pathways.find(p => p.id === selectedPathId) || pathways[0];
  const { academicPath, personalGrowthPath } = recommendationBundle;

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) return;
    submitEvidence({
      title: evidenceTitle,
      type: 'Cap Stone Project',
      description: evidenceDesc || 'Learning module evidence submission.',
      url: evidenceUrl,
      skillIds: activePath.targetSkillIds,
    });
    setIsSubmitModalOpen(false);
    setEvidenceTitle('');
    setEvidenceDesc('');
    setEvidenceUrl('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const renderSequencedCard = (item: SequencedPathwayItem) => (
    <div
      key={item.itemId}
      className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-3 hover:border-[#25866A]/40 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#173A32] text-white font-bold text-xs flex items-center justify-center">
            {item.sequenceOrder}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#25866A]/10 text-[#25866A] uppercase">
            {item.priority}
          </span>
          {item.isCrossDisciplinary && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#D7A85B]/20 text-[#A76716]">
              Cross-Disciplinary Exploration
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#F4F2EA] text-[#173A32] border border-[#DCE4DD]">
          Status: {item.status}
        </span>
      </div>

      <div>
        <h3 className="font-heading font-bold text-base text-[#173A32]">{item.skillName}</h3>
        <p className="text-xs text-[#66736C] mt-0.5">{item.learningObjective}</p>
      </div>

      {item.lecturerOverrideNote && (
        <div className="p-3 bg-[#D7A85B]/15 border border-[#D7A85B]/40 rounded-xl text-xs text-[#173A32] flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-[#A76716] shrink-0 mt-0.5" />
          <span>
            <strong>Lecturer Pedagogical Guidance:</strong> {item.lecturerOverrideNote}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD]">
          <span className="text-[10px] font-bold text-[#66736C] uppercase block">
            Prerequisites Checked
          </span>
          {item.prerequisites.length > 0 ? (
            <div className="space-y-1 mt-1">
              {item.prerequisites.map(pr => (
                <div key={pr.id} className="flex items-center gap-1.5">
                  <GitBranch className="w-3 h-3 text-[#25866A]" />
                  <span className={pr.met ? 'text-[#237A55] font-semibold' : 'text-[#B54747] font-semibold'}>
                    {pr.name} ({pr.met ? 'Met' : 'Develop First'})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#237A55] font-semibold mt-1">Foundational (No prerequisites)</p>
          )}
        </div>

        <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD]">
          <span className="text-[10px] font-bold text-[#66736C] uppercase block">
            Recommended Resource ({item.activityType})
          </span>
          <p className="font-bold text-[#173A32] mt-1">{item.recommendedResource.title}</p>
          <p className="text-[11px] text-[#66736C]">
            {item.recommendedResource.provider} · {item.estimatedDurationMinutes} mins
          </p>
        </div>

        <div className="p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD]">
          <span className="text-[10px] font-bold text-[#66736C] uppercase block">
            Completion & Assessment Criteria
          </span>
          <p className="text-[#173A32] mt-1">{item.completionCriteria}</p>
          <p className="text-[10px] text-[#66736C] mt-0.5">{item.assessmentCriteria}</p>
        </div>
      </div>

      <div className="p-3 bg-[#F4F2EA]/40 rounded-xl border border-[#DCE4DD] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[#66736C]">
          <strong className="text-[#173A32]">Why recommended:</strong> {item.explanation.whySeeingThis}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => submitRecommendationFeedback(item.itemId, item.skillId, 'Accepted')}
            className="px-3 py-1 bg-[#173A32] hover:bg-[#25866A] text-white text-[11px] font-semibold rounded-lg"
          >
            Accept Step
          </button>
          <button
            onClick={() => submitRecommendationFeedback(item.itemId, item.skillId, 'Dismissed')}
            className="px-2.5 py-1 bg-white hover:bg-[#F4F2EA] text-[#66736C] text-[11px] font-semibold rounded-lg border border-[#DCE4DD]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with Dual Pathway Switcher (PRD 07 Section 7 & 14.3) */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Personalized Learning Pathways
          </h1>
          <p className="text-xs text-[#66736C] leading-relaxed">
            NEXORA separates your <strong>Academic Learning Path</strong> (formal university courses, CPL/CPMK outcomes, and lecturer-assigned activities) from your <strong>Personal Growth Path</strong> (self-paced goal skills and cross-disciplinary exploration).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F4F2EA] p-1.5 rounded-2xl border border-[#DCE4DD] shrink-0">
          <button
            onClick={() => setActiveTrack('academic')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTrack === 'academic'
                ? 'bg-[#173A32] text-white shadow-xs'
                : 'text-[#66736C] hover:text-[#173A32]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Learning Path ({academicPath.length})</span>
          </button>
          <button
            onClick={() => setActiveTrack('personal_growth')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTrack === 'personal_growth'
                ? 'bg-[#25866A] text-white shadow-xs'
                : 'text-[#66736C] hover:text-[#173A32]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Personal Growth Path ({personalGrowthPath.length})</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <FileCheck className="w-5 h-5 shrink-0" />
          <span>Evidence submitted to Department Lecturer queue for verification!</span>
        </div>
      )}

      {activeTrack === 'academic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Formal Curriculum Modules (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-bold text-[#173A32] uppercase tracking-wider px-1">
              Formal Curriculum Modules (CPL / CPMK)
            </p>

            {pathways.map(path => {
              const isSelected = path.id === selectedPathId;
              return (
                <div
                  key={path.id}
                  onClick={() => setSelectedPathId(path.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-[#25866A] shadow-md ring-1 ring-[#25866A]'
                      : 'bg-white border-[#DCE4DD] hover:bg-[#F4F2EA]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4F2EA] text-[#25866A] uppercase">
                      {path.code}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md capitalize ${
                        path.status === 'completed'
                          ? 'bg-[#237A55]/10 text-[#237A55]'
                          : path.status === 'in_progress'
                          ? 'bg-[#25866A]/10 text-[#25866A]'
                          : 'bg-[#66736C]/10 text-[#66736C]'
                      }`}
                    >
                      {path.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#173A32] leading-snug">
                    {path.title}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#66736C]">
                      <span>Progress</span>
                      <span className="font-bold text-[#173A32] tabular-nums">
                        {path.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#E9E5DA] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#25866A] h-full rounded-full transition-all"
                        style={{ width: `${path.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Module Details (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-6">
            {activePath && (
              <>
                <div className="space-y-2 pb-4 border-b border-[#DCE4DD]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#25866A]">
                      {activePath.code} · Formal University Curriculum
                    </span>
                    <span className="text-xs text-[#66736C] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {activePath.estimatedHours} Estimated Hours
                    </span>
                  </div>

                  <h2 className="font-heading font-extrabold text-xl text-[#173A32]">
                    {activePath.title}
                  </h2>

                  <p className="text-xs text-[#66736C] leading-relaxed">{activePath.description}</p>

                  {activePath.mappedOutcomes && activePath.mappedOutcomes.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-bold text-[#25866A] uppercase">
                        Synced Course Learning Outcomes (EVENT 2):
                      </span>
                      <div className="space-y-1">
                        {activePath.mappedOutcomes.map((mo, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg text-[11px] font-medium text-[#173A32]"
                          >
                            {mo}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verified Learning Resources */}
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-sm text-[#173A32] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#25866A]" />
                    Verified Learning Resources & Courseware
                  </h3>

                  <div className="space-y-2">
                    {activePath.resources.map(res => (
                      <div
                        key={res.id}
                        className="p-3.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl flex items-center justify-between gap-4 hover:border-[#25866A]/30 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#25866A] bg-[#25866A]/10 px-2 py-0.5 rounded-md">
                            {res.type}
                          </span>
                          <h4 className="text-xs font-bold text-[#173A32]">{res.title}</h4>
                          <p className="text-[11px] text-[#66736C]">
                            {res.provider} · {res.estimatedMinutes} mins
                          </p>
                        </div>

                        <a
                          href={res.verifiedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#F4F2EA] text-[#173A32] text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#25866A]" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Activities Checklist */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-heading font-bold text-sm text-[#173A32] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#25866A]" />
                      Required Activities & Deliverables (EVENT 5)
                    </h3>
                    <span className="text-[10px] font-medium text-[#A76716] bg-[#A76716]/10 px-2 py-0.5 rounded-md">
                      Note: Activity completion does not automatically establish mastery without evidence validation
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activePath.activities.map(act => (
                      <div
                        key={act.id}
                        onClick={() => completeActivity(activePath.id, act.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          act.completed
                            ? 'bg-[#237A55]/5 border-[#237A55]/30 text-[#173A32]'
                            : 'bg-white border-[#DCE4DD] hover:bg-[#F4F2EA]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={act.completed}
                            onChange={() => {}}
                            className="w-4 h-4 rounded-sm border-[#DCE4DD] text-[#25866A] focus:ring-0 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <p
                              className={`text-xs font-bold ${
                                act.completed ? 'line-through text-[#66736C]' : 'text-[#173A32]'
                              }`}
                            >
                              {act.title}
                            </p>
                            <p className="text-[11px] text-[#66736C]">
                              {act.type} {act.dueDate && `· Due ${act.dueDate}`}
                              {act.publishedBy && ` · Published by ${act.publishedBy}`}
                            </p>
                          </div>
                        </div>

                        {act.completed && (
                          <span className="text-[10px] font-bold text-[#237A55] bg-[#237A55]/10 px-2 py-0.5 rounded-md">
                            Activity Completed — Submit Evidence Below
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Evidence Action */}
                <div className="pt-4 border-t border-[#DCE4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#66736C]">
                    Mastery requires appropriate evidence and assessment criteria. Submit your project artifact or repository to request Lecturer validation (EVENT 1).
                  </p>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Evidence for Review (EVENT 1)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* B. PERSONAL GROWTH PATH (Prerequisite-Ordered Goal Sequence + Cross-Disciplinary Exploration) */
        <div className="space-y-4">
          <div className="p-4 bg-[#25866A]/10 border border-[#25866A]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#173A32]">
              <Sparkles className="w-4 h-4 text-[#25866A] shrink-0" />
              <span>
                <strong>Personal Growth Path:</strong> Topologically ordered by prerequisite dependencies from the Knowledge Graph. Unmet foundational skills are scheduled before advanced dependent skills. Completing these steps never alters official university course grades.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {personalGrowthPath.map(item => renderSequencedCard(item))}
          </div>
        </div>
      )}

      {/* Submit Evidence Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="font-heading font-bold text-lg text-[#173A32] border-b border-[#DCE4DD] pb-3">
              Submit Learning Evidence
            </h3>

            <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-to-End ML Pipeline Capstone"
                  value={evidenceTitle}
                  onChange={e => setEvidenceTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Repository or Artifact URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername/project"
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize your methodology and results..."
                  value={evidenceDesc}
                  onChange={e => setEvidenceDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-[#66736C] hover:text-[#173A32] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#25866A] hover:bg-[#173A32] text-white font-semibold rounded-xl shadow-xs"
                >
                  Submit to Lecturer Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
