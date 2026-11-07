import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Plus,
  X,
  AlertCircle,
  Send,
  FileEdit,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { SkillEvidence, EvidenceStatus } from '../../types/nexora';
import { validateEvidenceFileUpload } from '../../security/rbacEngine';

export const StudentPortfolio: React.FC = () => {
  const {
    currentUser,
    evidenceList,
    microSkills,
    submitEvidence,
    submitDraftEvidenceForReview,
    recordSecurityAuditEvent,
  } = useNexora();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attachedFileInfo, setAttachedFileInfo] = useState<{
    fileName: string;
    sizeMB: string;
    storagePath: string;
  } | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<SkillEvidence['type']>('Cap Stone Project');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['skill_ada', 'skill_mlf']);

  const filteredEvidence = evidenceList.filter(e =>
    statusFilter === 'all' ? true : e.status === statusFilter
  );

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const instId = currentUser.institutionId || 'inst_nusantara';
    const targetStoragePath = `/institutions/${instId}/students/${currentUser.id}/evidence/${file.name}`;

    const validation = validateEvidenceFileUpload(
      {
        uid: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        roles: ['Student'],
        activeRole: 'Student',
        accountStatus: currentUser.accountStatus || 'Active',
        emailVerified: true,
        institutionId: instId,
      },
      {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        targetStoragePath,
        targetInstitutionId: instId,
        targetStudentId: currentUser.id,
      }
    );

    if (!validation.allowed) {
      setUploadError(`${validation.code}: ${validation.reason}`);
      setAttachedFileInfo(null);
      recordSecurityAuditEvent({
        actorUid: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actorSecurityRole: 'Student',
        institutionId: instId,
        action: `Blocked Evidence File Upload (${file.name})`,
        targetName: targetStoragePath,
        resourceType: 'evidence_files',
        resourceId: file.name,
        outcome: 'DENIED',
        previousState: 'Unverified Upload',
        newState: validation.code,
        classification: 'Confidential',
      });
      return;
    }

    setAttachedFileInfo({
      fileName: file.name,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      storagePath: targetStoragePath,
    });
  };

  const handleSaveOrSubmit = (targetMode: 'draft' | 'pending') => {
    if (!title.trim() || uploadError) return;
    submitEvidence(
      {
        title,
        type,
        description: attachedFileInfo
          ? `${description} [Verified Attachment: ${attachedFileInfo.storagePath}]`
          : description,
        url,
        skillIds: selectedSkillIds.length > 0 ? selectedSkillIds : ['skill_mlf'],
      },
      targetMode
    );
    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
    setUrl('');
    setAttachedFileInfo(null);
    setUploadError(null);
    setBannerNotice(
      targetMode === 'pending'
        ? 'EVENT 1 Triggered: Evidence submitted to Lecturer Review Queue & notification dispatched!'
        : 'Evidence saved as personal Draft.'
    );
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleResubmit = (id: string) => {
    submitDraftEvidenceForReview(id);
    setBannerNotice('EVENT 1 Triggered: Evidence submitted for Lecturer rubric evaluation!');
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#237A55] bg-[#237A55]/10 px-2.5 py-1 rounded-lg border border-[#237A55]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A76716] bg-[#A76716]/10 px-2.5 py-1 rounded-lg border border-[#A76716]/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Revision Requested
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B54747] bg-[#B54747]/10 px-2.5 py-1 rounded-lg border border-[#B54747]/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#66736C] bg-[#F4F2EA] px-2.5 py-1 rounded-lg border border-[#DCE4DD]">
            <FileEdit className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A76716] bg-[#D7A85B]/20 px-2.5 py-1 rounded-lg border border-[#D7A85B]/40">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">Learning Evidence Portfolio</h1>
          <p className="text-xs text-[#66736C]">
            Submit project artifacts, certificates, and research repositories. Approved evidence updates your competency profile and recalculates opportunity match scores (EVENT 1).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D7A85B]" />
          <span>Add / Submit Evidence</span>
        </button>
      </div>

      {bannerNotice && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DCE4DD] pb-2">
        {[
          { id: 'all', label: 'All Evidence' },
          { id: 'approved', label: 'Approved' },
          { id: 'pending', label: 'Pending Review' },
          { id: 'revision_requested', label: 'Revision Requested' },
          { id: 'draft', label: 'Drafts' },
          { id: 'rejected', label: 'Rejected' },
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(st.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              statusFilter === st.id
                ? 'bg-[#173A32] text-white shadow-xs'
                : 'bg-white text-[#66736C] border border-[#DCE4DD] hover:bg-[#F4F2EA]'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvidence.map(item => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 hover:border-[#25866A]/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#F4F2EA] text-[#25866A] uppercase tracking-wider">
                  {item.type}
                </span>
                {getStatusBadge(item.status)}
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-base text-[#173A32]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#66736C] leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>

              {/* Mapped Micro-Skills */}
              <div className="flex flex-wrap gap-1.5">
                {item.skillIds.map(skId => {
                  const sk = microSkills.find(m => m.id === skId);
                  return (
                    <span
                      key={skId}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-[#F4F2EA] text-[#173A32] rounded-md border border-[#DCE4DD]"
                    >
                      {sk?.name || skId}
                    </span>
                  );
                })}
              </div>

              {item.lecturerFeedback && (
                <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-xs text-[#173A32] space-y-1">
                  <span className="text-[10px] font-bold text-[#25866A] uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D7A85B]" />
                    {item.validatorName ? `Evaluator: ${item.validatorName}` : 'Review Status Note'}:
                  </span>
                  <p className="italic text-[#66736C]">{item.lecturerFeedback}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#DCE4DD] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#66736C]">Recorded: {item.submittedAt}</span>

              <div className="flex items-center gap-3">
                {(item.status === 'draft' || item.status === 'revision_requested') && (
                  <button
                    onClick={() => handleResubmit(item.id)}
                    className="px-3 py-1.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-lg flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>{item.status === 'draft' ? 'Submit for Review' : 'Resubmit Revision'}</span>
                  </button>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#25866A] hover:underline flex items-center gap-1"
                  >
                    <span>View Artifact</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Evidence Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase">EVENT 1 · Evidence Lifecycle</span>
                <h3 className="font-heading font-bold text-lg text-[#173A32]">
                  Create or Submit Learning Evidence
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capstone Research Code Base"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Evidence Category</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                >
                  <option value="Cap Stone Project">Cap Stone Project</option>
                  <option value="Industry Certificate">Industry Certificate</option>
                  <option value="Verified Assessment">Verified Assessment</option>
                  <option value="Research Paper">Research Paper</option>
                  <option value="Code Repository">Code Repository</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Target Micro-Skills Evidenced</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl">
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

              <div>
                <label className="font-semibold block mb-1">Artifact Repository / Certificate URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Secure Evidence File Attachment (PDF, JPG, PNG, DOCX, PPTX · Max 10 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.pptx"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[11px]"
                />
                {uploadError && (
                  <p className="text-[11px] font-semibold text-[#B54747] mt-1">{uploadError}</p>
                )}
                {attachedFileInfo && (
                  <p className="text-[11px] font-semibold text-[#237A55] mt-1">
                    Verified ({attachedFileInfo.sizeMB} MB) → Tenant Path:{' '}
                    <code className="font-mono">{attachedFileInfo.storagePath}</code>
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold block mb-1">Description & Methodology</label>
                <textarea
                  rows={3}
                  placeholder="Explain what was built, observable indicators met, and skills applied..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DCE4DD]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-[#66736C]"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveOrSubmit('draft')}
                    className="px-4 py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] font-semibold rounded-xl border border-[#DCE4DD]"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveOrSubmit('pending')}
                    className="px-5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl shadow-xs"
                  >
                    Submit for Lecturer Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
