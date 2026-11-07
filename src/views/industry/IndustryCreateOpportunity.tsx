import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Eye,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { Opportunity, OpportunityCategory } from '../../types/nexora';

interface IndustryCreateOpportunityProps {
  editingOpportunity: Opportunity | null;
  onClearEditing: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const IndustryCreateOpportunity: React.FC<IndustryCreateOpportunityProps> = ({
  editingOpportunity,
  onClearEditing,
  onNavigateTab,
}) => {
  const { organizationProfile, microSkills, saveOrSubmitOpportunity } = useNexora();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('Internship');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [academicProgramsText, setAcademicProgramsText] = useState('Computer Science, Data Science, Information Systems');
  const [studyLevel, setStudyLevel] = useState('Semester 5 - 8 Undergraduate');
  const [location, setLocation] = useState('Jakarta, Hybrid');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [deadline, setDeadline] = useState('2026-05-30');
  const [duration, setDuration] = useState('12 Weeks');
  const [availablePositions, setAvailablePositions] = useState<number>(6);
  const [applicationMethod, setApplicationMethod] = useState('External Official Company Career Portal');
  const [officialUrl, setOfficialUrl] = useState('https://careers.techcorp.co.id/apply');
  const [contactEmail, setContactEmail] = useState('talent@techcorp.co.id');
  const [supportingDocsText, setSupportingDocsText] = useState('Verified NEXORA Portfolio, Academic Transcript');

  const [requiredSkillIds, setRequiredSkillIds] = useState<string[]>(['skill_ada', 'skill_mlf']);
  const [relevantSkillIds, setRelevantSkillIds] = useState<string[]>(['skill_pds']);
  const [optionalSkillIds, setOptionalSkillIds] = useState<string[]>(['skill_cloud']);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (editingOpportunity) {
      setTitle(editingOpportunity.title);
      setCategory(editingOpportunity.category);
      setDescription(editingOpportunity.description || '');
      setEligibility(editingOpportunity.eligibility);
      setAcademicProgramsText((editingOpportunity.academicPrograms || ['Computer Science']).join(', '));
      setStudyLevel(editingOpportunity.studyLevel || 'Semester 5 - 8 Undergraduate');
      setLocation(editingOpportunity.location);
      setStartDate(editingOpportunity.startDate || '2026-07-01');
      setDeadline(editingOpportunity.deadline);
      setDuration(editingOpportunity.duration || '12 Weeks');
      setAvailablePositions(editingOpportunity.availablePositions || 5);
      setApplicationMethod(editingOpportunity.applicationMethod || 'External Official Company Career Portal');
      setOfficialUrl(editingOpportunity.officialUrl);
      setContactEmail(editingOpportunity.contactEmail || 'talent@techcorp.co.id');
      setSupportingDocsText((editingOpportunity.supportingDocuments || ['Verified NEXORA Portfolio']).join(', '));
      setRequiredSkillIds(editingOpportunity.requiredSkillIds || []);
      setRelevantSkillIds(editingOpportunity.relevantSkillIds || []);
      setOptionalSkillIds(editingOpportunity.optionalSkillIds || []);
    }
  }, [editingOpportunity]);

  const toggleSkillList = (
    skillId: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(skillId)) {
      setList(list.filter(x => x !== skillId));
    } else {
      setList([...list, skillId]);
    }
  };

  const validateForm = (): boolean => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Opportunity title is required.');
    if (!description.trim()) errs.push('Opportunity description is required.');
    if (!eligibility.trim()) errs.push('Clear mandatory eligibility criteria are required.');
    if (!officialUrl.trim() || !officialUrl.startsWith('https://')) {
      errs.push('A verified https:// official application destination URL is required.');
    }
    if (!deadline.trim()) {
      errs.push('Closing date is required.');
    } else {
      const parsedDeadline = new Date(deadline);
      const parsedStart = new Date(startDate);
      if (!isNaN(parsedDeadline.getTime()) && !isNaN(parsedStart.getTime())) {
        if (parsedDeadline > parsedStart) {
          errs.push('Closing date cannot be after the program start date.');
        }
      }
    }
    if (requiredSkillIds.length === 0) {
      errs.push('At least one Required Competency must be mapped from the NEXORA taxonomy.');
    }

    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleAction = (targetStatus: 'Draft' | 'Submitted for Review') => {
    if (targetStatus === 'Submitted for Review' && !validateForm()) {
      return;
    }
    if (targetStatus === 'Draft' && !title.trim()) {
      setValidationErrors(['Please enter at least an Opportunity Title to save a Draft.']);
      return;
    }

    saveOrSubmitOpportunity(
      {
        title: title.trim(),
        category,
        description: description.trim(),
        eligibility: eligibility.trim(),
        academicPrograms: academicProgramsText.split(',').map(s => s.trim()).filter(Boolean),
        studyLevel,
        location,
        startDate,
        deadline,
        duration,
        availablePositions: Number(availablePositions),
        applicationMethod,
        officialUrl: officialUrl.trim(),
        contactEmail: contactEmail.trim(),
        supportingDocuments: supportingDocsText.split(',').map(s => s.trim()).filter(Boolean),
        requiredSkillIds,
        relevantSkillIds,
        optionalSkillIds,
      },
      targetStatus,
      editingOpportunity?.id
    );

    onClearEditing();
    onNavigateTab('industry_opportunities');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#66736C]">
            <span>{organizationProfile.name}</span>
            <span>·</span>
            <span>{editingOpportunity ? 'Editing Existing Opportunity' : 'New Opportunity Builder'}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
            {editingOpportunity ? `Edit: ${editingOpportunity.title}` : 'Create & Map New Opportunity'}
          </h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Define opportunity details, separate mandatory academic eligibility from competency readiness, and submit for university verification.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editingOpportunity && (
            <button
              onClick={() => {
                onClearEditing();
                onNavigateTab('industry_opportunities');
              }}
              className="px-3.5 py-2 bg-[#F4F2EA] text-[#173A32] text-xs font-semibold rounded-xl border border-[#DCE4DD] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] text-xs font-semibold rounded-xl border border-[#DCE4DD] flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#25866A]" />
            <span>Preview Card</span>
          </button>
        </div>
      </div>

      {/* Re-review Notice when editing a Published opportunity */}
      {editingOpportunity?.publicationStatus === 'Published' && (
        <div className="p-4 bg-[#A76716]/10 border border-[#A76716]/30 text-[#A76716] rounded-xl text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Institutional Re-Verification Governance Active</p>
            <p className="mt-0.5">
              This opportunity is currently Published. Modifying eligibility criteria, closing date, required competencies, or the official application URL will automatically route it back to University Verification.
            </p>
          </div>
        </div>
      )}

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-[#B54747]/10 border border-[#B54747]/30 text-[#B54747] rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Please resolve the following validation requirements before submitting:</span>
          </div>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* PRD 08 Section 11.D: 7-Section Progress Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCE4DD] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#173A32] uppercase tracking-wider">
            Structured 7-Section Opportunity Publication Flow
          </span>
          <span className="text-[11px] font-semibold text-[#237A55]">
            {[
              Boolean(title.trim() && category),
              Boolean(description.trim()),
              Boolean(eligibility.trim() && academicProgramsText.trim()),
              Boolean(deadline && startDate && location),
              Boolean(officialUrl.startsWith('https://')),
              requiredSkillIds.length > 0,
              true,
            ].filter(Boolean).length}{' '}
            / 7 Sections Ready
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
          {[
            { step: '1. Basic Info', done: Boolean(title.trim() && category) },
            { step: '2. Description', done: Boolean(description.trim()) },
            { step: '3. Eligibility', done: Boolean(eligibility.trim()) },
            { step: '4. Schedule', done: Boolean(deadline && location) },
            { step: '5. Application', done: Boolean(officialUrl.startsWith('https://')) },
            { step: '6. Skill Mapping', done: requiredSkillIds.length > 0 },
            { step: '7. Final Preview', done: isPreviewOpen },
          ].map(s => (
            <div
              key={s.step}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-1 font-semibold ${
                s.done
                  ? 'bg-[#237A55]/10 text-[#237A55] border-[#237A55]/30'
                  : 'bg-[#F4F2EA]/60 text-[#66736C] border-[#DCE4DD]'
              }`}
            >
              <span className="truncate">{s.step}</span>
              {s.done && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Structured Builder Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Column: Core Details & Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            1. Opportunity Identity, Eligibility & Schedule
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-[#173A32] block mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise AI Engineering Internship 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Opportunity Type *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as OpportunityCategory)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold"
                >
                  <option value="Internship">Internship</option>
                  <option value="Industry Project">Industry Project</option>
                  <option value="Business Case Competition">Business Case Competition</option>
                  <option value="Innovation Challenge">Innovation Challenge</option>
                  <option value="Mentoring">Mentoring</option>
                  <option value="Training">Training</option>
                  <option value="Sponsored Program">Sponsored Program</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">Detailed Description & Learning Value *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe responsibilities, learning outcomes, and mentorship structure..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">
                Mandatory Eligibility Criteria (Separated from Skill Readiness) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Enrolled in 5th-8th semester Computer Science or Data Science with GPA >= 3.2"
                value={eligibility}
                onChange={e => setEligibility(e.target.value)}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Eligible Academic Programs</label>
                <input
                  type="text"
                  value={academicProgramsText}
                  onChange={e => setAcademicProgramsText(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Study Level / Semester</label>
                <input
                  type="text"
                  value={studyLevel}
                  onChange={e => setStudyLevel(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Closing Date *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Available Positions</label>
                <input
                  type="number"
                  min={1}
                  value={availablePositions}
                  onChange={e => setAvailablePositions(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Location / Remote Availability</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Application Method</label>
                <input
                  type="text"
                  value={applicationMethod}
                  onChange={e => setApplicationMethod(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Verified Official Application URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://careers.company.com/..."
                  value={officialUrl}
                  onChange={e => setOfficialUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Partner Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">Supporting Documents Required</label>
              <input
                type="text"
                value={supportingDocsText}
                onChange={e => setSupportingDocsText(e.target.value)}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Competency & Micro-Skill Mapping (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#DCE4DD] space-y-1">
            <h3 className="font-heading font-bold text-base text-[#173A32]">
              2. NEXORA Competency Taxonomy Mapping
            </h3>
            <p className="text-[11px] text-[#66736C]">
              Select Required and Recommended micro-skills from the institutional graph. A skill gap will not automatically disqualify an eligible student.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-[#173A32] block">
              Required Competencies ({requiredSkillIds.length} selected) *
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {microSkills.map(sk => {
                const isSelected = requiredSkillIds.includes(sk.id);
                return (
                  <button
                    type="button"
                    key={sk.id}
                    onClick={() => toggleSkillList(sk.id, requiredSkillIds, setRequiredSkillIds)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#173A32] text-white border-[#173A32] font-semibold'
                        : 'bg-[#F4F2EA]/50 text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                    }`}
                  >
                    <span className="truncate">{sk.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D7A85B] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-[#173A32] block">
              Recommended / Bonus Competencies ({relevantSkillIds.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {microSkills.map(sk => {
                const isSelected = relevantSkillIds.includes(sk.id);
                return (
                  <button
                    type="button"
                    key={sk.id}
                    onClick={() => toggleSkillList(sk.id, relevantSkillIds, setRelevantSkillIds)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#25866A] text-white border-[#25866A] font-semibold'
                        : 'bg-[#F4F2EA]/50 text-[#173A32] border-[#DCE4DD] hover:bg-[#F4F2EA]'
                    }`}
                  >
                    <span className="truncate">{sk.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE4DD] space-y-2.5">
            <button
              type="button"
              onClick={() => handleAction('Submitted for Review')}
              className="w-full py-3 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#D7A85B]" />
              <span>Submit Opportunity for University Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction('Draft')}
              className="w-full py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] font-semibold rounded-xl border border-[#DCE4DD] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#25866A]" />
              <span>Save as Draft</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Student Discovery Card Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-[#F4F2EA]/50 rounded-2xl border border-[#DCE4DD] space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#66736C]">
                <span className="font-bold text-[#173A32]">{category}</span>
                <span>Deadline: {deadline || 'TBD'}</span>
              </div>
              <h4 className="font-heading font-extrabold text-lg text-[#173A32]">
                {title || 'Untitled Opportunity'}
              </h4>
              <p className="text-[#66736C]">{organizationProfile.name} · {location}</p>
              <p className="text-[#173A32] leading-relaxed">{description || 'No description entered yet.'}</p>
              <div className="p-3 bg-white rounded-xl border border-[#DCE4DD]">
                <span className="font-bold text-[#173A32] block">Mandatory Eligibility:</span>
                <p className="text-[#66736C] mt-0.5">{eligibility || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 bg-[#173A32] text-white text-xs font-semibold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
