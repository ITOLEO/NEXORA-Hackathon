import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  X,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit2,
  ArrowUpCircle,
  Sparkles,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { StudentGoal } from '../../types/nexora';

export const StudentGoals: React.FC = () => {
  const {
    goals,
    microSkills,
    recommendationBundle,
    addGoal,
    updateGoal,
    deleteGoal,
    togglePauseGoal,
    prioritizeGoal,
  } = useNexora();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StudentGoal['category']>('Career');
  const [targetDate, setTargetDate] = useState('June 2026');
  const [notes, setNotes] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['skill_ada', 'skill_mlf']);

  const openCreateModal = () => {
    setEditingGoalId(null);
    setTitle('');
    setCategory('Career');
    setTargetDate('June 2026');
    setNotes('');
    setSelectedSkillIds(['skill_ada', 'skill_mlf']);
    setIsAddOpen(true);
  };

  const openEditModal = (goal: StudentGoal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setCategory(goal.category);
    setTargetDate(goal.targetDate);
    setNotes(goal.notes);
    setSelectedSkillIds(goal.targetSkillIds || ['skill_ada']);
    setIsAddOpen(true);
  };

  const toggleSkillSelection = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        title,
        category,
        targetDate,
        notes,
        targetSkillIds: selectedSkillIds.length > 0 ? selectedSkillIds : ['skill_ada'],
      });
    } else {
      addGoal({
        title,
        category,
        targetDate,
        progressPercentage: 15,
        targetSkillIds: selectedSkillIds.length > 0 ? selectedSkillIds : ['skill_ada'],
        status: 'active',
        notes,
        priorityWeight: 3,
        paused: false,
      });
    }
    setIsAddOpen(false);
    setEditingGoalId(null);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            Academic & Career Goals (Live Recommendation Control)
          </h1>
          <p className="text-xs text-[#66736C]">
            Add, edit, prioritize, pause, or remove goals. Any goal update immediately recalculates your Skill-Gap Report, Personal Growth Pathway, and Opportunity Relevance Scores.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D7A85B]" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Active Recommendation Alignment Summary */}
      <div className="p-4 bg-[#25866A]/10 border border-[#25866A]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#173A32]">
          <Sparkles className="w-4 h-4 text-[#25866A] shrink-0" />
          <span>
            <strong>Primary Active Goal Driving Recommendations:</strong>{' '}
            {recommendationBundle.gapReport.goalTitle} ·{' '}
            {recommendationBundle.gapReport.targetCompetencies.length} linked competencies in Knowledge Graph
          </span>
        </div>
        <span className="text-[11px] font-semibold text-[#237A55]">
          Top Priority Gap: {recommendationBundle.gapReport.identifiedGaps[0]?.skillName || 'None'}
        </span>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(goal => {
          const isPaused = Boolean(goal.paused);
          const priority = goal.priorityWeight || 2;
          return (
            <div
              key={goal.id}
              className={`bg-white p-6 rounded-2xl border shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                isPaused
                  ? 'border-[#DCE4DD] opacity-65 bg-[#F4F2EA]/40'
                  : 'border-[#DCE4DD] hover:border-[#25866A]/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#25866A]/10 text-[#25866A] uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#173A32] text-white">
                      Priority P{priority}
                    </span>
                    {isPaused && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A76716]/15 text-[#A76716]">
                        Paused
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#66736C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {goal.targetDate}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-[#173A32] leading-snug">
                  {goal.title}
                </h3>

                <p className="text-xs text-[#66736C] leading-relaxed">{goal.notes}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {(goal.targetSkillIds || []).map(skId => {
                    const sk = microSkills.find(m => m.id === skId);
                    return (
                      <span
                        key={skId}
                        className="text-[10px] px-2 py-0.5 bg-[#F4F2EA] text-[#173A32] rounded-md border border-[#DCE4DD] font-semibold"
                      >
                        {sk?.name || skId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE4DD] space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#66736C]">Milestone Progress</span>
                    <span className="font-bold text-[#173A32] tabular-nums">
                      {goal.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-[#E9E5DA] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#25866A] h-full rounded-full transition-all"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => prioritizeGoal(goal.id, priority >= 3 ? 1 : priority + 1)}
                      className="px-2 py-1 bg-[#F4F2EA] hover:bg-[#173A32] text-[#173A32] hover:text-white font-semibold rounded-lg border border-[#DCE4DD] flex items-center gap-1 transition-colors"
                      title="Promote goal priority to recalculate recommendations"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>Prioritize</span>
                    </button>
                    <button
                      onClick={() => togglePauseGoal(goal.id)}
                      className="px-2 py-1 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] font-semibold rounded-lg border border-[#DCE4DD] flex items-center gap-1"
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-[#237A55]" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-3.5 h-3.5 text-[#A76716]" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 text-[#66736C] hover:text-[#173A32] rounded-lg border border-[#DCE4DD]"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 text-[#66736C] hover:text-[#B54747] rounded-lg border border-[#DCE4DD]"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                {editingGoalId ? 'Edit Personal Goal' : 'Create New Personal Goal'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Become a Machine Learning Engineer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as StudentGoal['category'])}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  >
                    <option value="Career">Career Goal</option>
                    <option value="Academic">Academic Goal</option>
                    <option value="Skill Mastery">Skill Mastery</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Target Completion Date</label>
                  <input
                    type="text"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Target Competencies in NEXORA Knowledge Graph
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-xl">
                  {microSkills.map(sk => (
                    <label key={sk.id} className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={selectedSkillIds.includes(sk.id)}
                        onChange={() => toggleSkillSelection(sk.id)}
                        className="rounded-xs text-[#25866A]"
                      />
                      <span className="truncate">{sk.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes & Milestones</label>
                <textarea
                  rows={2}
                  placeholder="Action steps..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-[#66736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#173A32] text-white font-semibold rounded-xl"
                >
                  {editingGoalId ? 'Update Goal & Recalculate' : 'Save Goal & Recalculate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
