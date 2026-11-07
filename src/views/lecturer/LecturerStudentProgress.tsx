import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Plus,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const LecturerStudentProgress: React.FC = () => {
  const {
    enrolledStudents,
    studentSkills,
    microSkills,
    profile,
    pathways,
    updateSkillScore,
    publishLearningActivity,
  } = useNexora();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('user_student_1');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [reassessSkillId, setReassessSkillId] = useState<string>('skill_cloud');

  const selectedStudent =
    enrolledStudents.find(s => s.userId === selectedStudentId) || enrolledStudents[0];

  const missingEvidenceSkills = microSkills.filter(sk => {
    const rec = studentSkills[sk.id];
    return !rec || !rec.verifiedByLecturer || rec.masteryLevel === 'needs_support' || rec.masteryLevel === 'not_assessed';
  });

  const handleReassessCompetency = (skillId: string) => {
    const sk = microSkills.find(m => m.id === skillId);
    updateSkillScore(
      skillId,
      18,
      'mastered',
      'Lecturer-validated competency',
      'Dr. Ahmad Hidayat'
    );
    setBannerNotice(
      `Workflow B5 Intervention: Reassessed "${sk?.name || skillId}" as Lecturer-Validated Mastery & recalculated student opportunity matches!`
    );
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleAssignRemedialActivity = (skillName: string) => {
    publishLearningActivity(
      pathways[1]?.id || 'path_mlf',
      `Targeted Intervention Lab: ${skillName}`,
      'Practical Task',
      '2026-05-12'
    );
    setBannerNotice(
      `EVENT 5 Triggered: Assigned targeted learning activity for "${skillName}" to ${selectedStudent.studentName}'s pathway!`
    );
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs space-y-1">
        <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
          PRD 04 · Workflow B5 · Lecturer Intervention & Teaching Authority
        </span>
        <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
          Student Competency Progression & Targeted Intervention
        </h1>
        <p className="text-xs text-[#66736C]">
          Identify missing learning evidence, review individual student progress within assigned teaching responsibilities, assign additional learning activities, and reassess competencies.
        </p>
      </div>

      {bannerNotice && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Main Grid: Student Roster List vs Detail Drawer (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roster Picker (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              Assigned Course Roster
            </h3>
            <span className="text-[11px] text-[#66736C]">CS402 Section A</span>
          </div>

          <div className="space-y-2">
            {enrolledStudents.map(st => {
              const isSelected = st.userId === selectedStudentId;
              return (
                <div
                  key={st.userId}
                  onClick={() => setSelectedStudentId(st.userId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#173A32] text-white border-[#173A32] shadow-sm'
                      : 'bg-white text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={st.avatarUrl}
                      alt={st.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-white"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold">{st.studentName}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-[#F4F2EA]/80' : 'text-[#66736C]'}`}>
                        GPA {st.gpa.toFixed(2)} · {st.pendingEvidenceCount} Pending Review
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#25866A]/10 text-[#25866A]'
                    }`}
                  >
                    {st.masteredCount} Mastered
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Student Deep Dive & Intervention Controls (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-6">
          {selectedStudent && (
            <>
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE4DD]">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.studentName}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#25866A]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h2 className="font-heading font-extrabold text-xl text-[#173A32]">
                      {selectedStudent.studentName}
                    </h2>
                    <p className="text-xs text-[#66736C]">
                      {selectedStudent.email} · Official GPA {selectedStudent.gpa.toFixed(2)} (Kept separate from NEXORA competency scores)
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#237A55] bg-[#237A55]/10 px-3 py-1 rounded-lg w-fit">
                  Semester 6 CS Major
                </span>
              </div>

              {/* Target Goals Context */}
              <div className="p-4 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-xs space-y-1">
                <span className="font-bold text-[#25866A] uppercase text-[10px] block">
                  Student Target Career Goal
                </span>
                <p className="font-semibold text-[#173A32]">{profile.careerGoal}</p>
              </div>

              {/* Competency Mastery Breakdown */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-[#173A32] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#25866A]" />
                  Authorized Competency Distribution
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#237A55]/10 border border-[#237A55]/30 rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#237A55] uppercase block">Mastered</span>
                    <span className="font-heading font-extrabold text-2xl text-[#237A55] tabular-nums">
                      {selectedStudent.masteredCount}
                    </span>
                  </div>

                  <div className="p-3 bg-[#25866A]/10 border border-[#25866A]/30 rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#25866A] uppercase block">Developing</span>
                    <span className="font-heading font-extrabold text-2xl text-[#25866A] tabular-nums">
                      {selectedStudent.inProgressCount}
                    </span>
                  </div>

                  <div className="p-3 bg-[#A76716]/10 border border-[#A76716]/30 rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#A76716] uppercase block">Needs Support</span>
                    <span className="font-heading font-extrabold text-2xl text-[#A76716] tabular-nums">
                      {selectedStudent.needsSupportCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow B5: Missing Learning Evidence & Direct Lecturer Intervention */}
              <div className="space-y-3 pt-2 border-t border-[#DCE4DD]">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-[#173A32] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#A76716]" />
                    Identified Missing Evidence & Intervention Actions (Workflow B5)
                  </h3>
                  <span className="text-[11px] text-[#66736C]">
                    {missingEvidenceSkills.length} Skills Unverified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {missingEvidenceSkills.map(sk => {
                    const rec = studentSkills[sk.id];
                    return (
                      <div
                        key={sk.id}
                        className="p-3.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#173A32]">{sk.name}</span>
                          <p className="text-[11px] text-[#66736C]">
                            Current Provenance: <strong>{rec?.provenance || 'Not assessed'}</strong> · Score:{' '}
                            {rec && rec.score > 0 ? `${rec.score}%` : 'Not assessed'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAssignRemedialActivity(sk.name)}
                            className="px-3 py-1.5 bg-white border border-[#DCE4DD] hover:bg-[#F4F2EA] text-[#173A32] font-semibold rounded-lg flex items-center gap-1 text-[11px]"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#25866A]" />
                            <span>Assign Activity (EVENT 5)</span>
                          </button>

                          <button
                            onClick={() => handleReassessCompetency(sk.id)}
                            className="px-3 py-1.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-lg flex items-center gap-1 text-[11px]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D7A85B]" />
                            <span>Reassess & Validate</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manual Competency Reassessment Selector */}
              <div className="p-4 bg-[#F4F2EA] rounded-2xl border border-[#DCE4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#25866A] shrink-0" />
                  <span className="font-semibold text-[#173A32]">
                    Direct Oral/Lab Competency Reassessment:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={reassessSkillId}
                    onChange={e => setReassessSkillId(e.target.value)}
                    className="p-2 bg-white border border-[#DCE4DD] rounded-lg text-xs text-[#173A32]"
                  >
                    {microSkills.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleReassessCompetency(reassessSkillId)}
                    className="px-3.5 py-2 bg-[#237A55] hover:bg-[#173A32] text-white font-semibold rounded-lg shrink-0"
                  >
                    Validate Mastery
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
