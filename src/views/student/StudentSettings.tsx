import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  RotateCcw,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const StudentSettings: React.FC = () => {
  const { profile, resetToDemoData } = useNexora();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [opportunityDigest, setOpportunityDigest] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetToDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs space-y-1">
        <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">Notifications & Account Settings</h1>
        <p className="text-xs text-[#66736C]">
          Manage your notification preferences, institutional security, and demo data state.
        </p>
      </div>

      {resetDone && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Demo state reset to initial seed dataset!</span>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#25866A]" />
          Notification Preferences
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] cursor-pointer">
            <div>
              <p className="font-semibold text-[#173A32]">Evidence Verification Alerts</p>
              <p className="text-[11px] text-[#66736C]">Receive notifications when a lecturer approves or comments on your evidence.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded-sm border-[#DCE4DD] text-[#25866A]"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] cursor-pointer">
            <div>
              <p className="font-semibold text-[#173A32]">Assignment Deadline Reminders</p>
              <p className="text-[11px] text-[#66736C]">Get alerts 3 days prior to active module activity due dates.</p>
            </div>
            <input
              type="checkbox"
              checked={deadlineReminders}
              onChange={e => setDeadlineReminders(e.target.checked)}
              className="w-4 h-4 rounded-sm border-[#DCE4DD] text-[#25866A]"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-[#F4F2EA]/60 rounded-xl border border-[#DCE4DD] cursor-pointer">
            <div>
              <p className="font-semibold text-[#173A32]">High Match Opportunity Digest</p>
              <p className="text-[11px] text-[#66736C]">Weekly summary of new industry internships with &gt;85% profile match score.</p>
            </div>
            <input
              type="checkbox"
              checked={opportunityDigest}
              onChange={e => setOpportunityDigest(e.target.checked)}
              className="w-4 h-4 rounded-sm border-[#DCE4DD] text-[#25866A]"
            />
          </label>
        </div>
      </div>

      {/* Security & Access Restrictions */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#25866A]" />
          Data Governance & Access Controls
        </h3>

        <div className="space-y-2 text-xs text-[#66736C] leading-relaxed">
          <p>
            NEXORA complies with institutional access restrictions. Your private learner profile and unapproved assessment evidence are visible only to you and authorized university faculty.
          </p>
          <div className="p-3 bg-[#173A32]/5 border border-[#173A32]/10 rounded-xl text-[#173A32] font-medium flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#25866A] shrink-0" />
            <span>Active Institution: {profile.universityName} (Authenticated via SSO)</span>
          </div>
        </div>
      </div>

      {/* Reset Demo Data */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD] flex items-center gap-2 text-[#B54747]">
          <RotateCcw className="w-4 h-4" />
          Reset Demo Data
        </h3>

        <div className="flex items-center justify-between text-xs">
          <p className="text-[#66736C]">
            Reset local changes (assessments completed, goals created, saved opportunities) back to the clean initial seed data.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#B54747]/10 hover:bg-[#B54747] text-[#B54747] hover:text-white font-semibold rounded-xl border border-[#B54747]/30 transition-colors shrink-0"
          >
            Reset Seed Data
          </button>
        </div>
      </div>
    </div>
  );
};
