import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Award,
  Target,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Plus,
  ShieldCheck,
  Lock,
  Layers,
  History,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { DEMO_IMAGE_SARAH } from '../../services/demoData';

export const StudentProfile: React.FC = () => {
  const { profile, updateProfile, studentSkills, evidenceList, goals } = useNexora();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    academicGoal: profile.academicGoal,
    careerGoal: profile.careerGoal,
    semester: profile.semester,
    gpa: profile.gpa,
  });
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [preferences, setPreferences] = useState<string[]>(profile.learningPreferences || []);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [newPrefInput, setNewPrefInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const skillRecords = Object.values(studentSkills);
  const lecturerValidatedCount = skillRecords.filter(s => s.verifiedByLecturer).length;
  const approvedEvidenceCount = evidenceList.filter(e => e.status === 'approved').length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      academicGoal: formData.academicGoal,
      careerGoal: formData.careerGoal,
      semester: Number(formData.semester),
      gpa: Number(formData.gpa),
      interests,
      learningPreferences: preferences,
      onboardingCompleted: true,
    });
    setIsEditing(false);
    setSaveSuccess('Learner profile confirmed and updated! Recommendation engine context recalculated.');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleAddInterest = () => {
    if (newInterestInput.trim() && !interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
  };

  const handleAddPreference = () => {
    if (newPrefInput.trim() && !preferences.includes(newPrefInput.trim())) {
      setPreferences([...preferences, newPrefInput.trim()]);
      setNewPrefInput('');
    }
  };

  const handleRemovePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref));
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Workflow A1: Student Onboarding & Profile Confirmation Stepper */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
            PRD 04 · Workflow A1 & A3 · Dynamic Learner Profiling
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#173A32]">
            <span className="inline-flex items-center gap-1 text-[#237A55]">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Authorized Registration
            </span>
            <span className="text-[#DCE4DD]">→</span>
            <span className="inline-flex items-center gap-1 text-[#237A55]">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2. Academic Identity
            </span>
            <span className="text-[#DCE4DD]">→</span>
            <span className="inline-flex items-center gap-1 text-[#237A55]">
              <CheckCircle2 className="w-3.5 h-3.5" /> 3. Interests & Goals
            </span>
            <span className="text-[#DCE4DD]">→</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#237A55]/10 text-[#237A55] rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" /> 4. Profile Confirmed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#66736C] bg-[#F4F2EA] px-3 py-1.5 rounded-xl border border-[#DCE4DD] shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#173A32]" />
          <span>Private Learner Record (Visible only to you)</span>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={profile.avatarUrl || DEMO_IMAGE_SARAH}
            alt={profile.studentName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#25866A] shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">{profile.studentName}</h1>
            <p className="text-xs text-[#66736C] font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#25866A]" />
              {profile.programName} · Semester {profile.semester}
            </p>
            <p className="text-xs text-[#66736C] flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#66736C]" />
              {profile.universityName} · {profile.facultyName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs ${
            isEditing
              ? 'bg-[#173A32] text-white hover:bg-[#25866A]'
              : 'bg-[#F4F2EA] text-[#173A32] border border-[#DCE4DD] hover:bg-[#E9E5DA]'
          }`}
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Edit' : 'Edit & Confirm Profile'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Workflow A3: 8-Dimension Dynamic Learner Profile Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#25866A]" /> Competency Profile
          </span>
          <p className="font-heading font-extrabold text-xl text-[#173A32]">
            {lecturerValidatedCount} / {skillRecords.length}
          </p>
          <p className="text-[11px] text-[#66736C]">Lecturer-validated skills</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#237A55]" /> Evidence Records
          </span>
          <p className="font-heading font-extrabold text-xl text-[#173A32]">
            {approvedEvidenceCount} Approved
          </p>
          <p className="text-[11px] text-[#66736C]">{evidenceList.length} total portfolio submissions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] uppercase flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-[#D7A85B]" /> Active Goals
          </span>
          <p className="font-heading font-extrabold text-xl text-[#173A32]">
            {goals.filter(g => g.status === 'active').length} Active
          </p>
          <p className="text-[11px] text-[#66736C]">Career & academic milestones</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] uppercase flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-[#416B8B]" /> Last Profile Sync
          </span>
          <p className="font-heading font-extrabold text-base text-[#173A32]">
            {profile.updatedAt || '2026-04-05'}
          </p>
          <p className="text-[11px] text-[#237A55] font-semibold">Provenance verified</p>
        </div>
      </div>

      {/* Main Profile Form / View */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Academic Details (5 cols) */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 h-fit">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            Academic Identity & Standing
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#66736C] font-semibold block mb-1">University Institution</label>
              <input
                type="text"
                disabled
                value={profile.universityName}
                className="w-full p-2.5 bg-[#F4F2EA] border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold"
              />
            </div>

            <div>
              <label className="text-[#66736C] font-semibold block mb-1">Faculty & Program</label>
              <input
                type="text"
                disabled
                value={`${profile.programName} (${profile.facultyName})`}
                className="w-full p-2.5 bg-[#F4F2EA] border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#66736C] font-semibold block mb-1">Semester</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-[#DCE4DD] rounded-xl text-[#173A32] font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="text-[#66736C] font-semibold block mb-1">Cumulative GPA (Official)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isEditing}
                  value={formData.gpa}
                  onChange={e => setFormData({ ...formData, gpa: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-[#DCE4DD] rounded-xl text-[#173A32] font-bold tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-[#66736C] font-semibold block mb-1">Expected Graduation</label>
              <input
                type="text"
                disabled
                value={profile.expectedGraduation}
                className="w-full p-2.5 bg-[#F4F2EA] border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>
          </div>
        </div>

        {/* Goals, Interests & Development Preferences (7 cols) */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-5">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            Goals, Learning Interests & Development Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[#173A32] font-bold block mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#25866A]" />
                Target Career Goal
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.careerGoal}
                  onChange={e => setFormData({ ...formData, careerGoal: e.target.value })}
                  className="w-full p-3 border border-[#DCE4DD] rounded-xl text-[#173A32] focus:border-[#25866A] focus:outline-hidden"
                />
              ) : (
                <p className="p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-medium leading-relaxed">
                  {profile.careerGoal}
                </p>
              )}
            </div>

            <div>
              <label className="text-[#173A32] font-bold block mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#25866A]" />
                Academic Growth Objective
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.academicGoal}
                  onChange={e => setFormData({ ...formData, academicGoal: e.target.value })}
                  className="w-full p-3 border border-[#DCE4DD] rounded-xl text-[#173A32] focus:border-[#25866A] focus:outline-hidden"
                />
              ) : (
                <p className="p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-medium leading-relaxed">
                  {profile.academicGoal}
                </p>
              )}
            </div>

            {/* Learning & Specialization Interests */}
            <div>
              <label className="text-[#173A32] font-bold block mb-1">Learning & Specialization Interests</label>
              <div className="flex flex-wrap gap-2 py-1.5">
                {interests.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] text-[#173A32] text-xs font-medium rounded-lg"
                  >
                    <span>{tag}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(tag)}
                        className="text-[#66736C] hover:text-[#B54747]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={e => setNewInterestInput(e.target.value)}
                    placeholder="Add new learning interest..."
                    className="flex-1 p-2 border border-[#DCE4DD] rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-3 py-2 bg-[#25866A] text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Development Preferences */}
            <div>
              <label className="text-[#173A32] font-bold block mb-1">Development Modality Preferences</label>
              <div className="flex flex-wrap gap-2 py-1.5">
                {preferences.map(pref => (
                  <span
                    key={pref}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#25866A]/10 border border-[#25866A]/30 text-[#173A32] text-xs font-semibold rounded-lg"
                  >
                    <span>{pref}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemovePreference(pref)}
                        className="text-[#66736C] hover:text-[#B54747]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPrefInput}
                    onChange={e => setNewPrefInput(e.target.value)}
                    placeholder="Add development preference (e.g., Mentored Capstones)..."
                    className="flex-1 p-2 border border-[#DCE4DD] rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPreference}
                    className="px-3 py-2 bg-[#173A32] text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-[#DCE4DD]">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#25866A] hover:bg-[#173A32] text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Confirm Profile & Update Recommendation Context</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
