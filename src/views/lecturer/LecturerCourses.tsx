import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  X,
  CheckCircle2,
  BrainCircuit,
  GitBranch,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const LecturerCourses: React.FC = () => {
  const { courses, addCourseOutcome, addMicroSkill, microSkills } = useNexora();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course_cs402');
  const [isAddOutcomeOpen, setIsAddOutcomeOpen] = useState(false);
  const [newOutcomeText, setNewOutcomeText] = useState('');
  const [selectedCplCode, setSelectedCplCode] = useState('CPL-02 (Data & AI Engineering)');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['skill_mlf']);

  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Analytics & Insight');
  const [skillLevel, setSkillLevel] = useState<'Foundational' | 'Intermediate' | 'Advanced' | 'Specialized'>('Intermediate');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillIndicator, setSkillIndicator] = useState('Implements reproducible validation pipeline');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleAddOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutcomeText.trim()) return;
    addCourseOutcome(
      activeCourse.id,
      newOutcomeText,
      selectedSkillIds.length > 0 ? selectedSkillIds : ['skill_mlf'],
      selectedCplCode.split(' ')[0]
    );
    setIsAddOutcomeOpen(false);
    setNewOutcomeText('');
    setSaveSuccess(
      'EVENT 2 Triggered: CPMK mapped to micro-skills! Course Knowledge Graph, Student Learning Pathways, and Academic Admin coverage updated.'
    );
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const handleAddMicroSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    addMicroSkill({
      clusterId: 'cluster_dai',
      name: skillName,
      category: skillCategory,
      level: skillLevel,
      description: skillDesc || 'New course micro-skill unit.',
      indicators: [skillIndicator || 'Demonstrates applied competence in course assessment'],
    });
    setIsAddSkillOpen(false);
    setSkillName('');
    setSkillDesc('');
    setSaveSuccess('New Micro-Skill created with observable indicator and added to Course Knowledge Graph!');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
            PRD 04 · Workflow B1 & Cross-Portal Event 2
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Course Workspace & CPL / CPMK Competency Mapping
          </h1>
          <p className="text-xs text-[#66736C]">
            Map formal Program Learning Outcomes (CPL) and Course Learning Outcomes (CPMK) to granular micro-skills. Mapping updates the Course Knowledge Graph and Student Pathways automatically.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsAddOutcomeOpen(true)}
            className="px-3.5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#D7A85B]" />
            <span>Map CPMK to Micro-Skills (EVENT 2)</span>
          </button>

          <button
            onClick={() => setIsAddSkillOpen(true)}
            className="px-3.5 py-2.5 bg-[#25866A] hover:bg-[#173A32] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Micro-Skill</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccess}</span>
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

      {/* Selected Course Workspace (12 cols) */}
      {activeCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Course Overview & Outcomes (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
                <div>
                  <span className="text-xs font-bold text-[#25866A]">
                    {activeCourse.code} · Section {activeCourse.section || 'A & B'}
                  </span>
                  <h2 className="font-heading font-extrabold text-xl text-[#173A32]">{activeCourse.name}</h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg">
                  {activeCourse.term}
                </span>
              </div>

              <p className="text-xs text-[#66736C] leading-relaxed">{activeCourse.description}</p>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD]">
                  <span className="text-[#66736C] block">Enrolled Students</span>
                  <span className="font-heading font-extrabold text-lg text-[#173A32] tabular-nums">
                    {activeCourse.enrolledCount}
                  </span>
                </div>
                <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD]">
                  <span className="text-[#66736C] block">Completion Rate</span>
                  <span className="font-heading font-extrabold text-lg text-[#237A55] tabular-nums">
                    {activeCourse.completionRate}%
                  </span>
                </div>
                <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD]">
                  <span className="text-[#66736C] block">CPL Alignment</span>
                  <span className="font-heading font-extrabold text-sm text-[#25866A]">
                    CPL-01, CPL-02
                  </span>
                </div>
              </div>
            </div>

            {/* Formal Course Learning Outcomes (CPMK) */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
                <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#25866A]" />
                  Course Learning Outcomes (CPMK) & CPL Relationships
                </h3>
                <span className="text-[11px] text-[#66736C]">
                  {activeCourse.learningOutcomes.length} Outcomes Mapped
                </span>
              </div>

              <div className="space-y-3">
                {activeCourse.learningOutcomes.map((lo, idx) => (
                  <div
                    key={lo.id}
                    className="p-4 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-xl space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-[#173A32]">
                        CPMK-{idx + 1} ({lo.cplCode || 'CPL-02'}):
                      </span>
                      {lo.approvalStatus === 'approved' ? (
                        <span className="text-[10px] font-bold text-[#237A55] bg-[#237A55]/10 px-2 py-0.5 rounded-md border border-[#237A55]/20">
                          Program Admin Approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#A76716] bg-[#A76716]/10 px-2 py-0.5 rounded-md border border-[#A76716]/20">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <p className="text-[#173A32] leading-relaxed font-medium">{lo.text}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lo.mappedSkillIds.map(skId => {
                        const sk = microSkills.find(m => m.id === skId);
                        return (
                          <span
                            key={skId}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-white text-[#25866A] rounded-md border border-[#DCE4DD]"
                          >
                            <GitBranch className="w-3 h-3" />
                            {sk?.name || skId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Micro-Skills Inventory (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <h3 className="font-heading font-bold text-base text-[#173A32] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#25866A]" />
                Shared Micro-Skill Taxonomy
              </h3>
              <span className="text-xs text-[#66736C]">{microSkills.length} Skills</span>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {microSkills.map(sk => (
                <div
                  key={sk.id}
                  className="p-3.5 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl space-y-1.5 text-xs hover:border-[#25866A]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#173A32]">{sk.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#25866A]/10 text-[#25866A] rounded-md">
                      {sk.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736C] line-clamp-2">{sk.description}</p>
                  {sk.indicators && sk.indicators[0] && (
                    <p className="text-[10px] text-[#237A55] font-medium">
                      Observable Indicator: {sk.indicators[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map CPMK Outcome Modal (EVENT 2) */}
      {isAddOutcomeOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase">
                  EVENT 2 · CPMK to Micro-Skill Mapping
                </span>
                <h3 className="font-heading font-bold text-base text-[#173A32]">
                  Add CPMK Outcome to {activeCourse?.code}
                </h3>
              </div>
              <button onClick={() => setIsAddOutcomeOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOutcome} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Parent Program Learning Outcome (CPL)</label>
                <select
                  value={selectedCplCode}
                  onChange={e => setSelectedCplCode(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                >
                  <option value="CPL-01 (Quantitative & Algorithmic Foundations)">CPL-01 (Quantitative & Algorithmic Foundations)</option>
                  <option value="CPL-02 (Data & AI Engineering)">CPL-02 (Data & AI Engineering)</option>
                  <option value="CPL-03 (Software Systems & Cloud Architecture)">CPL-03 (Software Systems & Cloud Architecture)</option>
                  <option value="CPL-04 (Professional Ethics & Communication)">CPL-04 (Professional Ethics & Communication)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Course Learning Outcome (CPMK) Statement</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Students will be able to construct and validate random forest classification pipelines without data leakage."
                  value={newOutcomeText}
                  onChange={e => setNewOutcomeText(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Map to Granular Micro-Skills</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl">
                  {microSkills.map(sk => {
                    const active = selectedSkillIds.includes(sk.id);
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => toggleSkillSelection(sk.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                          active
                            ? 'bg-[#173A32] text-white border-[#173A32]'
                            : 'bg-white text-[#66736C] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                        }`}
                      >
                        {sk.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button type="button" onClick={() => setIsAddOutcomeOpen(false)} className="px-4 py-2 text-[#66736C]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#173A32] text-white font-semibold rounded-xl">
                  Map CPMK & Sync Graph (EVENT 2)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Micro-Skill Modal */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Create New Micro-Skill</h3>
              <button onClick={() => setIsAddSkillOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMicroSkill} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Model Latency Monitoring"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    value={skillCategory}
                    onChange={e => setSkillCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mastery Level</label>
                  <select
                    value={skillLevel}
                    onChange={e => setSkillLevel(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Observable Indicator (Required by B2)</label>
                <input
                  type="text"
                  required
                  value={skillIndicator}
                  onChange={e => setSkillIndicator(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={skillDesc}
                  onChange={e => setSkillDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button type="button" onClick={() => setIsAddSkillOpen(false)} className="px-4 py-2 text-[#66736C]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#25866A] text-white font-semibold rounded-xl">
                  Create Micro-Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
