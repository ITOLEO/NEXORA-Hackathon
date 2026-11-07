import React, { useState } from 'react';
import {
  Handshake,
  PlusCircle,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Calendar,
  X,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { CollaborationProject } from '../../types/nexora';

export const IndustryCollaborationProjects: React.FC = () => {
  const { collaborationProjects, microSkills, createCollaborationProject, toggleProjectMilestone } =
    useNexora();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CollaborationProject['category']>('Joint Capstone Project');
  const [description, setDescription] = useState('');
  const [objectivesText, setObjectivesText] = useState(
    'Design scalable data pipelines\nPresent technical architecture to joint faculty-industry panel'
  );
  const [universityPartner, setUniversityPartner] = useState(
    'Universitas Nusantara — Faculty of Computer Science'
  );
  const [academicCoordinator, setAcademicCoordinator] = useState('Dr. Ahmad Hidayat');
  const [mentorName, setMentorName] = useState('Hendra Wijaya');
  const [mentorRole, setMentorRole] = useState('Principal ML Architect');
  const [mentorEmail, setMentorEmail] = useState('hendra.wijaya@techcorp.co.id');
  const [duration, setDuration] = useState('16 Weeks (Fall Semester 2026)');
  const [milestonesText, setMilestonesText] = useState(
    'Dataset & Architecture Specification\nMid-Term Prototype Review\nFinal Joint Capstone Defense'
  );
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  const getSkillName = (id: string) => microSkills.find(m => m.id === id)?.name || id;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    createCollaborationProject({
      title: title.trim(),
      category,
      description: description.trim(),
      learningObjectives: objectivesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      requiredSkillIds: ['skill_ada', 'skill_mlf', 'skill_pds'],
      universityPartner,
      academicCoordinator,
      mentorName,
      mentorRole,
      mentorEmail,
      duration,
      milestoneTitles: milestonesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
    });
    setIsCreateOpen(false);
    setTitle('');
    setDescription('');
    setSubmitBanner(
      'Collaboration project submitted for University Review! It will become available once approved by the academic coordinator.'
    );
    setTimeout(() => setSubmitBanner(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            University-Industry Collaboration Projects
          </h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Coordinate joint capstone projects, applied research initiatives, and industry mentoring programs with university faculty and student teams.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#D7A85B]" />
          <span>Propose Collaboration Project</span>
        </button>
      </div>

      {submitBanner && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{submitBanner}</span>
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-6">
        {collaborationProjects.map(proj => (
          <div
            key={proj.id}
            className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#DCE4DD]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736C]">
                  <span className="font-semibold text-[#25866A]">{proj.category}</span>
                  <span>·</span>
                  <span>{proj.duration}</span>
                  <span>·</span>
                  <span>DEMO Project</span>
                </div>
                <h3 className="font-heading font-extrabold text-lg text-[#173A32]">{proj.title}</h3>
              </div>

              <div className="shrink-0">
                {proj.status === 'Active' ? (
                  <span className="text-xs font-bold text-[#237A55] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Active Collaboration
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#A76716] flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {proj.status}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              {/* Left: Project Overview, Objectives, Skills, Partner & Mentor (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <p className="text-[#173A32] leading-relaxed">{proj.description}</p>

                <div className="p-4 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] space-y-2">
                  <span className="font-bold text-[#173A32] block">Academic Learning Objectives:</span>
                  <ul className="list-disc list-inside text-[#66736C] space-y-1">
                    {proj.learningObjectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#F4F2EA]/40 rounded-xl border border-[#DCE4DD] space-y-1">
                    <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#25866A]" /> University Partner
                    </span>
                    <p className="text-[#173A32] font-medium">{proj.universityPartner}</p>
                    <p className="text-[11px] text-[#66736C]">
                      Academic Coordinator: {proj.academicCoordinator}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#F4F2EA]/40 rounded-xl border border-[#DCE4DD] space-y-1">
                    <span className="font-bold text-[#173A32] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#25866A]" /> Assigned Industry Mentor
                    </span>
                    <p className="text-[#173A32] font-medium">
                      {proj.mentorName} ({proj.mentorRole})
                    </p>
                    <p className="text-[11px] text-[#66736C]">{proj.mentorEmail}</p>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[#173A32] block mb-1">Required Competencies:</span>
                  <p className="text-[#66736C]">
                    {proj.requiredSkillIds.map(getSkillName).join(' · ')}
                  </p>
                </div>
              </div>

              {/* Right: Shared Milestone Tracking (5 cols) */}
              <div className="lg:col-span-5 bg-[#F4F2EA]/40 p-5 rounded-2xl border border-[#DCE4DD] space-y-3">
                <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-2">
                  <span className="font-heading font-bold text-sm text-[#173A32]">
                    Shared Project Milestones
                  </span>
                  <span className="text-[11px] text-[#66736C] tabular-nums">
                    {proj.milestones.filter(m => m.completed).length} / {proj.milestones.length} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {proj.milestones.map(ms => (
                    <div
                      key={ms.id}
                      onClick={() => toggleProjectMilestone(proj.id, ms.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                        ms.completed
                          ? 'bg-white border-[#237A55]/30'
                          : 'bg-white border-[#DCE4DD] hover:bg-[#F4F2EA]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={ms.completed}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded-xs border-[#DCE4DD] text-[#25866A] cursor-pointer"
                      />
                      <div className="space-y-0.5 flex-1">
                        <p
                          className={`font-bold ${
                            ms.completed ? 'line-through text-[#66736C]' : 'text-[#173A32]'
                          }`}
                        >
                          {ms.title}
                        </p>
                        <p className="text-[11px] text-[#66736C]">{ms.deliverableNote}</p>
                        <p className="text-[10px] text-[#25866A] flex items-center gap-1 pt-0.5 tabular-nums">
                          <Calendar className="w-3 h-3" /> Target: {ms.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Propose New Collaboration Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                Propose University-Industry Collaboration Project
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart Energy Grid Load Forecasting"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Collaboration Type</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CollaborationProject['category'])}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  >
                    <option value="Joint Capstone Project">Joint Capstone Project</option>
                    <option value="Applied AI Research">Applied AI Research</option>
                    <option value="Industry Mentoring Program">Industry Mentoring Program</option>
                    <option value="Curriculum Case Study">Curriculum Case Study</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Project Scope & Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Learning Objectives (One per line)</label>
                <textarea
                  rows={2}
                  value={objectivesText}
                  onChange={e => setObjectivesText(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">University Partner</label>
                  <input
                    type="text"
                    value={universityPartner}
                    onChange={e => setUniversityPartner(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Project Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Industry Mentor</label>
                  <input
                    type="text"
                    value={mentorName}
                    onChange={e => setMentorName(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mentor Role</label>
                  <input
                    type="text"
                    value={mentorRole}
                    onChange={e => setMentorRole(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mentor Email</label>
                  <input
                    type="email"
                    value={mentorEmail}
                    onChange={e => setMentorEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Shared Milestones (One per line)</label>
                <textarea
                  rows={2}
                  value={milestonesText}
                  onChange={e => setMilestonesText(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-[#66736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl"
                >
                  Submit Project for University Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
