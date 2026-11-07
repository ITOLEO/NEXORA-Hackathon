import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Plus,
  X,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { FlexibleLearningGroup } from '../../types/nexora';

export const LecturerClassIntelligence: React.FC = () => {
  const {
    enrolledStudents,
    learningGroups,
    createLearningGroup,
    courses,
    microSkills,
    recommendationBundle,
    lecturerOverrides,
    overrideLecturerRecommendation,
    publishLearningActivity,
  } = useNexora();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('course_cs402');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // New group form
  const [groupName, setGroupName] = useState('');
  const [supportLevel, setSupportLevel] =
    useState<FlexibleLearningGroup['supportLevel']>('Core Advancement');
  const [intervention, setIntervention] = useState('');

  // PRD 07 Section 15: Lecturer Pedagogical Override State
  const [overrideTargetId, setOverrideTargetId] = useState<string>('skill_dnn');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  const courseGroups = learningGroups.filter(g => g.courseId === selectedCourseId);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    createLearningGroup({
      courseId: selectedCourseId,
      groupName,
      focusSkillId: 'skill_mlf',
      focusSkillName: 'Machine Learning Fundamentals',
      supportLevel,
      recommendedIntervention: intervention || 'Targeted peer learning and practical exercises.',
      studentUserIds: ['user_student_1'],
    });
    setIsCreateGroupOpen(false);
    setGroupName('');
    setIntervention('');
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    overrideLecturerRecommendation(overrideTargetId, overrideReason.trim());
    const skName = microSkills.find(m => m.id === overrideTargetId)?.name || overrideTargetId;
    setOverrideSuccess(
      `Pedagogical override saved for "${skName}". Student pathways now display your documented academic guidance.`
    );
    setOverrideReason('');
    setTimeout(() => setOverrideSuccess(null), 4000);
  };

  const getLevelBadge = (lvl: FlexibleLearningGroup['supportLevel']) => {
    switch (lvl) {
      case 'Advanced Specialization':
        return 'bg-[#237A55]/10 text-[#237A55] border-[#237A55]/30';
      case 'Core Advancement':
        return 'bg-[#25866A]/10 text-[#25866A] border-[#25866A]/30';
      case 'High Growth Need':
        return 'bg-[#A76716]/10 text-[#A76716] border-[#A76716]/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Class Intelligence, Recommendation Insights & Flexible Groups
          </h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Analyze class-level competency gaps, skills with insufficient evidence, assign recommended resources, and override automated recommendations for pedagogical reasons.
          </p>
        </div>

        <button
          onClick={() => setIsCreateGroupOpen(true)}
          className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D7A85B]" />
          <span>Create Flexible Group</span>
        </button>
      </div>

      {overrideSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{overrideSuccess}</span>
        </div>
      )}

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DCE4DD]">
        {courses.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCourseId(c.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedCourseId === c.id
                ? 'bg-[#173A32] text-white shadow-xs'
                : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
            }`}
          >
            {c.code} · {c.name}
          </button>
        ))}
      </div>

      {/* PRD 07 Section 15: Lecturer Recommendation Insights & Pedagogical Override Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <div>
              <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
                PRD 07 Section 15 · Class Competency & Evidence Sufficiency Insights
              </span>
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                Skills Requiring Additional Classroom Evidence or Prerequisite Support
              </h3>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {recommendationBundle.gapReport.identifiedGaps.slice(0, 4).map(gap => (
              <div
                key={gap.skillId}
                className="p-3.5 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#173A32]">{gap.skillName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A76716]/15 text-[#A76716]">
                      {gap.currentEvidencedStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736C]">{gap.suggestedNextAction}</p>
                </div>

                <button
                  onClick={() => {
                    publishLearningActivity(
                      'path_mlf',
                      `Targeted Lab: ${gap.skillName} Evidence Reinforcement`,
                      'Practical Task',
                      '2026-04-29'
                    );
                    setOverrideSuccess(
                      `Assigned recommended resource & activity for "${gap.skillName}" to enrolled students (EVENT 5).`
                    );
                    setTimeout(() => setOverrideSuccess(null), 4000);
                  }}
                  className="px-3 py-1.5 bg-[#173A32] hover:bg-[#25866A] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Assign Resource to Class</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lecturer Pedagogical Override Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#DCE4DD]">
            <span className="text-[10px] font-bold text-[#A76716] uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Educator Governance Authority
            </span>
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              Override Automated Recommendation
            </h3>
            <p className="text-[11px] text-[#66736C] mt-0.5">
              Lecturers can override or annotate any automated skill/pathway recommendation for documented pedagogical reasons.
            </p>
          </div>

          <form onSubmit={handleOverrideSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-[#173A32]">
                Target Competency or Pathway Module
              </label>
              <select
                value={overrideTargetId}
                onChange={e => setOverrideTargetId(e.target.value)}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              >
                {microSkills.map(sk => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-[#173A32]">
                Documented Pedagogical Reason
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Complete foundational linear algebra & regularization exercises before attempting transformer fine-tuning."
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl transition-colors"
            >
              Record Pedagogical Override
            </button>
          </form>

          {Object.entries(lecturerOverrides).length > 0 && (
            <div className="pt-2 border-t border-[#DCE4DD] space-y-1.5 text-[11px]">
              <span className="font-bold text-[#173A32] block">Active Lecturer Overrides:</span>
              {Object.entries(lecturerOverrides).map(([key, note]) => (
                <div key={key} className="p-2 bg-[#F4F2EA] rounded-lg border border-[#DCE4DD] text-[#66736C]">
                  <strong className="text-[#173A32]">{key}:</strong> {note}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flexible Learning Groups Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D7A85B]" />
            Differentiated Flexible Learning Groups
          </h3>
          <span className="text-xs text-[#66736C]">
            Flexible instructional support (non-permanent classification)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courseGroups.map(grp => (
            <div
              key={grp.id}
              className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 hover:border-[#25866A]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border ${getLevelBadge(
                      grp.supportLevel
                    )}`}
                  >
                    {grp.supportLevel}
                  </span>
                  <span className="text-[11px] text-[#66736C] font-semibold">
                    {grp.studentUserIds.length} Students
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-[#173A32]">{grp.groupName}</h4>

                <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-xs space-y-1">
                  <span className="font-semibold text-[#173A32] block">Intervention Strategy:</span>
                  <p className="text-[#66736C] leading-relaxed">{grp.recommendedIntervention}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE4DD] flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {grp.studentUserIds.map(stId => {
                    const student = enrolledStudents.find(s => s.userId === stId);
                    return (
                      <img
                        key={stId}
                        src={student?.avatarUrl}
                        alt={student?.studentName}
                        className="w-7 h-7 rounded-full object-cover border-2 border-white"
                        referrerPolicy="no-referrer"
                      />
                    );
                  })}
                </div>

                <span className="text-[11px] font-semibold text-[#25866A]">
                  Created {grp.createdDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Competency Heatmap / Student Roster Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
          <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#25866A]" />
            Enrolled Student Competency Heatmap & Roster
          </h3>
          <span className="text-xs text-[#66736C]">{enrolledStudents.length} Students Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCE4DD] text-[#66736C] font-semibold bg-[#F4F2EA]/60">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Cumulative GPA</th>
                <th className="py-3 px-4">Mastered Skills</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Needs Support</th>
                <th className="py-3 px-4">Pending Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4DD]">
              {enrolledStudents.map(st => (
                <tr key={st.userId} className="hover:bg-[#F4F2EA]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#173A32] flex items-center gap-2.5">
                    <img
                      src={st.avatarUrl}
                      alt={st.studentName}
                      className="w-7 h-7 rounded-full object-cover border border-[#DCE4DD]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-[#173A32]">{st.studentName}</p>
                      <p className="text-[10px] text-[#66736C]">{st.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#173A32] tabular-nums">
                    {st.gpa.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 bg-[#237A55]/10 text-[#237A55] font-bold rounded-lg tabular-nums">
                      {st.masteredCount} Skills
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 bg-[#25866A]/10 text-[#25866A] font-bold rounded-lg tabular-nums">
                      {st.inProgressCount} Skills
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 bg-[#A76716]/10 text-[#A76716] font-bold rounded-lg tabular-nums">
                      {st.needsSupportCount} Skills
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {st.pendingEvidenceCount > 0 ? (
                      <span className="inline-block px-2.5 py-1 bg-[#173A32] text-white font-bold rounded-lg tabular-nums">
                        {st.pendingEvidenceCount} Pending Review
                      </span>
                    ) : (
                      <span className="text-[#66736C]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                Create Flexible Learning Group
              </h3>
              <button onClick={() => setIsCreateGroupOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Group D: Neural Network Hyperparameter Tuning"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Support Tier</label>
                <select
                  value={supportLevel}
                  onChange={e => setSupportLevel(e.target.value as FlexibleLearningGroup['supportLevel'])}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                >
                  <option value="High Growth Need">High Growth Need</option>
                  <option value="Core Advancement">Core Advancement</option>
                  <option value="Advanced Specialization">Advanced Specialization</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Intervention Strategy & Materials</label>
                <textarea
                  rows={3}
                  placeholder="Describe targeted classroom or lab intervention..."
                  value={intervention}
                  onChange={e => setIntervention(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 text-[#66736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#173A32] text-white font-semibold rounded-xl"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
