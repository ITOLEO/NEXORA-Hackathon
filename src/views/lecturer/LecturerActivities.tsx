import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Calendar,
  Printer,
  X,
  Users,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const LecturerActivities: React.FC = () => {
  const { pathways, learningGroups, publishLearningActivity } = useNexora();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const [selectedPathId, setSelectedPathId] = useState<string>(pathways[1]?.id || 'path_mlf');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState<'Quiz' | 'Practical Task' | 'Project Submission' | 'Peer Review'>('Practical Task');
  const [dueDate, setDueDate] = useState('2026-05-05');
  const [assignedGroupId, setAssignedGroupId] = useState<string>('all');

  const allActivities = pathways.flatMap(p =>
    p.activities.map(a => ({ ...a, courseName: p.title, courseCode: p.code }))
  );

  const handlePublishActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;
    publishLearningActivity(
      selectedPathId,
      activityTitle,
      activityType,
      dueDate,
      assignedGroupId === 'all' ? undefined : assignedGroupId
    );
    setIsCreateOpen(false);
    setActivityTitle('');
    setBannerMessage(
      'EVENT 5 Triggered: Learning activity published to enrolled students & notification dispatched!'
    );
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handlePrintDownload = () => {
    setIsExportModalOpen(false);
    setBannerMessage('Classroom activity plan exported! Print-ready PDF/Markdown downloaded.');
    setTimeout(() => setBannerMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
            PRD 04 · Workflow B3 & Cross-Portal Event 5
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Learning Activities & Offline Teaching Planner
          </h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Publish learning tasks, guided practice, and advanced challenges to enrolled students or flexible learning groups, and export offline classroom guides.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#D7A85B]" />
            <span>Publish Learning Activity (EVENT 5)</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-[#25866A] hover:bg-[#173A32] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Export for Offline Teaching</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* Activity List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allActivities.map((act, idx) => {
          const groupObj = learningGroups.find(g => g.id === act.assignedGroupId);
          return (
            <div
              key={`${act.id}_${idx}`}
              className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-3 hover:border-[#25866A]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4F2EA] text-[#25866A] uppercase">
                    {act.courseCode} · {act.type}
                  </span>
                  <span className="text-[11px] text-[#66736C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due {act.dueDate}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  {act.title}
                </h3>
                <p className="text-xs text-[#66736C]">{act.courseName}</p>
              </div>

              <div className="pt-3 border-t border-[#DCE4DD] flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#237A55] font-semibold text-[11px]">
                  <Users className="w-3.5 h-3.5" />
                  {groupObj ? `Assigned: ${groupObj.groupName}` : 'Assigned to All Course Sections'}
                </span>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="font-semibold text-[#25866A] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Printer className="w-3 h-3" />
                  <span>Offline Sheet</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish New Learning Activity Modal (EVENT 5) */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase">
                  EVENT 5 · Classroom Activity Publication
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  Publish New Learning Activity
                </h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishActivity} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Target Course / Pathway Module</label>
                <select
                  value={selectedPathId}
                  onChange={e => setSelectedPathId(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                >
                  {pathways.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyperparameter Cross-Validation Lab Exercise"
                  value={activityTitle}
                  onChange={e => setActivityTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Activity Format</label>
                  <select
                    value={activityType}
                    onChange={e => setActivityType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  >
                    <option value="Practical Task">Practical Task</option>
                    <option value="Project Submission">Project Submission</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Peer Review">Peer Review</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Differentiated Classroom Group Assignment (Optional)</label>
                <select
                  value={assignedGroupId}
                  onChange={e => setAssignedGroupId(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                >
                  <option value="all">All Enrolled Students in Course Section</option>
                  {learningGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.groupName} ({g.supportLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-[#66736C] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl shadow-xs"
                >
                  Publish & Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offline Teaching Plan Modal (PRD 08 Section 10.G) */}
      {isExportModalOpen && (
        <div
          className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Printable Classroom Activity Worksheet"
        >
          <div className="bg-white rounded-[16px] border border-[#DCE4DD] shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                  PRD 08 Section 10.G · Offline Classroom Support
                </span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  Printable Classroom Activity & Rubric Worksheet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                aria-label="Close printable worksheet modal"
                className="text-[#66736C] no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-[#F4F2EA]/70 rounded-2xl border border-[#DCE4DD] space-y-4 text-xs text-[#173A32]">
              <div className="flex justify-between border-b border-[#DCE4DD] pb-2 font-bold">
                <span>CS402 Machine Learning Fundamentals · Universitas Nusantara</span>
                <span>Term: Spring 2026</span>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-[#25866A] text-sm block">
                  Activity: Scikit-Learn Pipeline & Cross-Validation Whiteboard Lab
                </span>
                <p className="text-[#66736C] leading-relaxed">
                  <strong>Screen-Free Classroom Instructions:</strong> Organize students into their 3 differentiated learning groups below. Distribute printed datasets and rubric checklists for leak-free train/test split verification and ROC-AUC interpretation.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#173A32] block">
                  Differentiated Classroom Group Prompts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {learningGroups.map(g => (
                    <div key={g.id} className="p-2.5 bg-white rounded-xl border border-[#DCE4DD]">
                      <span className="font-bold text-[#173A32] block">{g.groupName}</span>
                      <span className="text-[10px] text-[#25866A] font-semibold block">
                        {g.supportLevel} ({g.studentUserIds.length} students)
                      </span>
                      <p className="text-[11px] text-[#66736C] mt-1">{g.recommendedIntervention}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#DCE4DD] flex items-center justify-between text-[11px] text-[#66736C]">
                <span>Format: A4 Print-Ready Classroom Guide & Rubric</span>
                <span>Supports screen-free in-person teaching</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD] no-print">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-[#66736C] font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] border border-[#DCE4DD] text-xs font-semibold rounded-[10px] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#25866A]" />
                <span>Print Worksheet</span>
              </button>
              <button
                type="button"
                onClick={handlePrintDownload}
                className="px-5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-[10px] flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#D7A85B]" />
                <span>Download PDF Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
