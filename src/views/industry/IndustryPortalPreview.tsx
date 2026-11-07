import React from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Award,
  Clock,
  ArrowRight,
  Plus,
  BarChart2,
  Bookmark,
} from 'lucide-react';
import { DEMO_IMAGE_TECHCORP } from '../../services/demoData';

interface IndustryPortalPreviewProps {
  onSwitchToStudent: () => void;
}

export const IndustryPortalPreview: React.FC<IndustryPortalPreviewProps> = ({ onSwitchToStudent }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Extension Namespace Badge */}
      <div className="p-3 bg-[#173A32] text-white rounded-2xl flex items-center justify-between text-xs font-medium px-4 border border-[#25866A]/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D7A85B] animate-pulse" />
          <span>Shared NEXORA Architecture — Protected Industry Portal Namespace (Seeded Preview)</span>
        </div>
        <button
          onClick={onSwitchToStudent}
          className="text-[#D7A85B] underline hover:text-white text-xs font-semibold"
        >
          Return to Student Portal
        </button>
      </div>

      {/* Welcome Banner matching bottom left screenshot */}
      <div className="relative bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
          <img
            src={DEMO_IMAGE_TECHCORP}
            alt="TechCorp Headquarters"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#173A32]">
            Welcome, TechCorp Indonesia
          </h1>
          <p className="text-sm text-[#66736C]">
            Build connections. Create opportunities for university talent.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Published Opportunities</span>
            <span className="text-[#237A55] font-bold">+2</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">8</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Student Engagement</span>
            <span className="text-[#237A55] font-bold">+18%</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">2.4K</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Active Projects</span>
            <span className="text-[#237A55] font-bold">+1</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">3</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Pending Reviews</span>
            <Clock className="w-4 h-4 text-[#A76716]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">2</p>
        </div>
      </div>

      {/* Main Grid split matching bottom left screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Engagement Overview Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Engagement Overview</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg">
              Last 3 Months
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#66736C] pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#25866A]" /> Views</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D7A85B]" /> Bookmarks</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#173A32]" /> Applications</span>
          </div>

          <div className="h-48 w-full bg-[#F4F2EA]/40 rounded-xl p-4 border border-[#DCE4DD] flex items-end justify-around pt-8">
            <div className="flex gap-1 items-end h-full">
              <div className="w-4 bg-[#25866A] h-[60%] rounded-t-sm" />
              <div className="w-4 bg-[#D7A85B] h-[40%] rounded-t-sm" />
              <div className="w-4 bg-[#173A32] h-[30%] rounded-t-sm" />
            </div>
            <div className="flex gap-1 items-end h-full">
              <div className="w-4 bg-[#25866A] h-[80%] rounded-t-sm" />
              <div className="w-4 bg-[#D7A85B] h-[55%] rounded-t-sm" />
              <div className="w-4 bg-[#173A32] h-[45%] rounded-t-sm" />
            </div>
            <div className="flex gap-1 items-end h-full">
              <div className="w-4 bg-[#25866A] h-[95%] rounded-t-sm" />
              <div className="w-4 bg-[#D7A85B] h-[70%] rounded-t-sm" />
              <div className="w-4 bg-[#173A32] h-[60%] rounded-t-sm" />
            </div>
          </div>
        </div>

        {/* Your Opportunities (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Your Opportunities</h3>
            <span className="text-xs font-semibold text-[#25866A]">View All →</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-2 text-xs">
              <h4 className="font-bold text-[#173A32]">Innovation Challenge 2026</h4>
              <p className="text-[#66736C]">Build innovative solutions for a sustainable future.</p>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#237A55] font-semibold">Open · Closes in 12 days</span>
                <Bookmark className="w-3.5 h-3.5 text-[#66736C]" />
              </div>
            </div>

            <div className="p-4 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] space-y-2 text-xs">
              <h4 className="font-bold text-[#173A32]">Data Science Internship Program</h4>
              <p className="text-[#66736C]">Jakarta Hybrid · 48 student interest badges</p>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#237A55] font-semibold">Active · 92% Match Candidates</span>
                <Bookmark className="w-3.5 h-3.5 text-[#66736C]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
