import React, { useState } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  ShieldCheck,
  Edit2,
  Save,
  X,
  UserPlus,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { OrganizationProfile } from '../../types/nexora';
import { DEMO_IMAGE_TECHCORP } from '../../services/demoData';

export const IndustryOrganizationProfile: React.FC = () => {
  const { organizationProfile, updateOrganizationProfile, addOrganizationRepresentative } = useNexora();
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    name: organizationProfile.name,
    organizationType: organizationProfile.organizationType,
    sector: organizationProfile.sector,
    website: organizationProfile.website,
    location: organizationProfile.location,
    description: organizationProfile.description,
  });

  const [isAddRepOpen, setIsAddRepOpen] = useState(false);
  const [repName, setRepName] = useState('');
  const [repRole, setRepRole] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationProfile(formState);
    setIsEditing(false);
    setSaveMessage('Organization profile updated and logged in institutional audit trail.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleAddRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repEmail.trim()) return;
    addOrganizationRepresentative({
      name: repName.trim(),
      roleTitle: repRole.trim() || 'Partner Representative',
      email: repEmail.trim(),
      isPrimary: false,
    });
    setIsAddRepOpen(false);
    setRepName('');
    setRepRole('');
    setRepEmail('');
    setSaveMessage(
      'Representative invited! Access remains restricted until institutional verification is completed.'
    );
    setTimeout(() => setSaveMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Organization Header Card */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={organizationProfile.logoUrl || DEMO_IMAGE_TECHCORP}
            alt={organizationProfile.name}
            className="w-20 h-20 rounded-2xl object-cover border border-[#DCE4DD] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736C]">
              <span className="font-semibold text-[#237A55] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Verified Partner Organization
              </span>
              <span>·</span>
              <span>{organizationProfile.organizationType}</span>
              <span>·</span>
              <span>Simulated DEMO Record</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
              {organizationProfile.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#66736C]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#25866A]" />
                {organizationProfile.location}
              </span>
              <span>·</span>
              <a
                href={organizationProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#25866A] font-medium hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                {organizationProfile.website}
              </a>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Editing' : 'Edit Organization Profile'}</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Organization Details & Edit Form (7 cols) */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs"
        >
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            Organization Identity & Sector Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-[#173A32] block mb-1">Company / Organization Name</label>
              <input
                type="text"
                disabled={!isEditing}
                required
                value={formState.name}
                onChange={e => setFormState({ ...formState, name: e.target.value })}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold disabled:opacity-80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Organization Type</label>
                <select
                  disabled={!isEditing}
                  value={formState.organizationType}
                  onChange={e =>
                    setFormState({
                      ...formState,
                      organizationType: e.target.value as OrganizationProfile['organizationType'],
                    })
                  }
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                >
                  <option value="Enterprise Corporation">Enterprise Corporation</option>
                  <option value="High-Growth Startup">High-Growth Startup</option>
                  <option value="Research Institute">Research Institute</option>
                  <option value="Non-Profit / NGO">Non-Profit / NGO</option>
                  <option value="Government Agency">Government Agency</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#173A32] block mb-1">Official Website</label>
                <input
                  type="url"
                  disabled={!isEditing}
                  required
                  value={formState.website}
                  onChange={e => setFormState({ ...formState, website: e.target.value })}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">Industry Sector</label>
              <input
                type="text"
                disabled={!isEditing}
                required
                value={formState.sector}
                onChange={e => setFormState({ ...formState, sector: e.target.value })}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">Headquarters / Primary Location</label>
              <input
                type="text"
                disabled={!isEditing}
                required
                value={formState.location}
                onChange={e => setFormState({ ...formState, location: e.target.value })}
                className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#173A32] block mb-1">Organization Overview & Academic Mission</label>
              <textarea
                rows={4}
                disabled={!isEditing}
                required
                value={formState.description}
                onChange={e => setFormState({ ...formState, description: e.target.value })}
                className="w-full p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] leading-relaxed"
              />
            </div>

            {isEditing && (
              <div className="pt-3 border-t border-[#DCE4DD]">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#25866A] hover:bg-[#173A32] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Organization Profile</span>
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Right: Institutional Partnership Status & Representatives (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
              University Partnership Verification
            </h3>

            <div className="p-3.5 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#173A32]">
                <span>Verification Status</span>
                <span className="text-[#237A55] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified Partner
                </span>
              </div>
              <p className="text-[#66736C] leading-relaxed">
                Authorized to submit internships, capstone projects, and innovation challenges for university review.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#173A32] block">Active Partner Institutions</span>
              {organizationProfile.partnerUniversities.map(uni => (
                <div
                  key={uni}
                  className="p-2.5 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-lg flex items-center justify-between"
                >
                  <span className="font-medium text-[#173A32]">{uni}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#237A55]" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Authorized Representatives</h3>
              <button
                onClick={() => setIsAddRepOpen(true)}
                className="px-3 py-1.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Representative</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {organizationProfile.representatives.map(rep => (
                <div
                  key={rep.id}
                  className="p-3 bg-[#F4F2EA]/50 border border-[#DCE4DD] rounded-xl flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#173A32]">{rep.name}</p>
                    <p className="text-[11px] text-[#66736C]">{rep.roleTitle}</p>
                    <p className="text-[11px] text-[#25866A]">{rep.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {rep.verified ? (
                      <span className="text-[11px] font-semibold text-[#237A55] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#A76716] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-[11px] text-[#66736C] flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#173A32] shrink-0 mt-0.5" />
              <span>
                Governance Rule: New representatives never automatically receive unrestricted administrator access until verified by institutional administration.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Representative Modal */}
      {isAddRepOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">
                Invite Organization Representative
              </h3>
              <button onClick={() => setIsAddRepOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRep} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rina Permata"
                  value={repName}
                  onChange={e => setRepName(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Recruiter / Mentor"
                  value={repRole}
                  onChange={e => setRepRole(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@techcorp.co.id"
                  value={repEmail}
                  onChange={e => setRepEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button type="button" onClick={() => setIsAddRepOpen(false)} className="px-4 py-2 text-[#66736C]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#173A32] text-white font-semibold rounded-xl">
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
