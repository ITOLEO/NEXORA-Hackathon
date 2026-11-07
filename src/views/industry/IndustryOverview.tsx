import React from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Clock,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  Bookmark,
  Handshake,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { DEMO_IMAGE_TECHCORP } from '../../services/demoData';

interface IndustryOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const IndustryOverview: React.FC<IndustryOverviewProps> = ({ onNavigateTab }) => {
  const { organizationProfile, opportunities, collaborationProjects, studentConsentRecords, auditLogs } = useNexora();

  const publishedOpps = opportunities.filter(o => o.publicationStatus === 'Published');
  const draftOpps = opportunities.filter(o => o.publicationStatus === 'Draft');
  const pendingReviewOpps = opportunities.filter(
    o => o.publicationStatus === 'Submitted for Review' || o.publicationStatus === 'Needs Revision'
  );
  const activeProjects = collaborationProjects.filter(p => p.status === 'Active');

  const totalViews = opportunities.reduce((sum, o) => sum + (o.viewsCount || 0), 0);
  const totalInterest = opportunities.reduce((sum, o) => sum + (o.expressInterestCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner matching bottom-left reference mockup */}
      <div className="relative bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block pointer-events-none">
          <img
            src={organizationProfile.logoUrl || DEMO_IMAGE_TECHCORP}
            alt={organizationProfile.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736C]">
              <span className="font-semibold text-[#237A55] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {organizationProfile.partnershipStatus}
              </span>
              <span>·</span>
              <span>{organizationProfile.sector}</span>
              <span>·</span>
              <span>DEMO Partner Record</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#173A32]">
              Welcome, {organizationProfile.name.replace(' (DEMO)', '')}
            </h1>
            <p className="text-sm text-[#66736C]">
              Build connections. Create verified opportunities aligned with university competency graphs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('industry_org_profile')}
              className="px-4 py-2.5 bg-[#F4F2EA] hover:bg-[#E9E5DA] text-[#173A32] text-xs font-semibold rounded-xl border border-[#DCE4DD] transition-colors whitespace-nowrap"
            >
              Organization Profile
            </button>
            <button
              onClick={() => onNavigateTab('industry_create_opportunity')}
              className="px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-[#D7A85B]" />
              <span>Publish New Opportunity</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('industry_opportunities')}
          className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 cursor-pointer transition-all"
        >
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Published Opportunities</span>
            <span className="text-[#237A55] font-bold">+{publishedOpps.length} Active</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {publishedOpps.length}
          </p>
          <p className="text-[11px] text-[#66736C] mt-2">
            {draftOpps.length} Draft · {pendingReviewOpps.length} In Review
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('industry_engagement')}
          className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 cursor-pointer transition-all"
        >
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Student Engagement</span>
            <span className="text-[#237A55] font-bold">+18%</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {(totalViews / 1000).toFixed(1)}K
          </p>
          <p className="text-[11px] text-[#66736C] mt-2">
            {totalInterest} Express Interest · {studentConsentRecords.filter(r => r.consentGranted).length} Shared Profiles
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('industry_collaboration')}
          className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 cursor-pointer transition-all"
        >
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Active Projects</span>
            <Handshake className="w-4 h-4 text-[#25866A]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {activeProjects.length}
          </p>
          <p className="text-[11px] text-[#66736C] mt-2">
            {collaborationProjects.length} Total University Collaborations
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('industry_opportunities')}
          className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 cursor-pointer transition-all"
        >
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Pending Reviews</span>
            <Clock className="w-4 h-4 text-[#A76716]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">
            {pendingReviewOpps.length}
          </p>
          <p className="text-[11px] text-[#66736C] mt-2">
            Awaiting University Reviewer verification
          </p>
        </div>
      </div>

      {/* Main Grid: Engagement Overview + Your Opportunities (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Engagement Overview Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Engagement Overview</h3>
            <button
              onClick={() => onNavigateTab('industry_analytics')}
              className="text-xs font-semibold text-[#25866A] hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium text-[#66736C] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#25866A]" /> Opportunity Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D7A85B]" /> Student Bookmarks
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#173A32]" /> Official Portal Clicks
            </span>
          </div>

          <div className="h-52 w-full bg-[#F4F2EA]/50 rounded-xl p-5 border border-[#DCE4DD] flex flex-col justify-between">
            <div className="flex items-end justify-around flex-1 gap-6 pt-4">
              {[
                { month: 'Jan', views: 58, bookmarks: 38, clicks: 26 },
                { month: 'Feb', views: 76, bookmarks: 52, clicks: 39 },
                { month: 'Mar', views: 92, bookmarks: 68, clicks: 54 },
                { month: 'Apr', views: 98, bookmarks: 74, clicks: 62 },
              ].map(bar => (
                <div key={bar.month} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                  <div className="flex gap-1.5 items-end h-full w-full justify-center">
                    <div
                      className="w-4 bg-[#25866A] rounded-t-xs transition-all"
                      style={{ height: `${bar.views}%` }}
                      title={`Views: ${bar.views * 15}`}
                    />
                    <div
                      className="w-4 bg-[#D7A85B] rounded-t-xs transition-all"
                      style={{ height: `${bar.bookmarks}%` }}
                      title={`Bookmarks: ${bar.bookmarks * 4}`}
                    />
                    <div
                      className="w-4 bg-[#173A32] rounded-t-xs transition-all"
                      style={{ height: `${bar.clicks}%` }}
                      title={`Clicks: ${bar.clicks * 3}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#66736C]">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Your Opportunities List (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Your Opportunities</h3>
            <button
              onClick={() => onNavigateTab('industry_opportunities')}
              className="text-xs font-semibold text-[#25866A] hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 3).map(opp => (
              <div
                key={opp.id}
                onClick={() => onNavigateTab('industry_opportunities')}
                className="p-4 bg-[#F4F2EA]/60 hover:bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] cursor-pointer transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#173A32] truncate">{opp.title}</span>
                  <span className="text-[11px] font-semibold text-[#25866A] shrink-0">
                    {opp.publicationStatus || 'Published'}
                  </span>
                </div>

                <p className="text-[#66736C] line-clamp-1">{opp.description || opp.eligibility}</p>

                <div className="flex items-center justify-between text-[11px] text-[#66736C] pt-1 border-t border-[#DCE4DD]">
                  <span>
                    {opp.category} · Closes {opp.deadline}
                  </span>
                  <span className="font-semibold text-[#173A32] tabular-nums">
                    {opp.expressInterestCount} Interested
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Deadlines & Recent Partnership Activity Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Upcoming Closing Deadlines</h3>
            <Calendar className="w-4 h-4 text-[#25866A]" />
          </div>

          <div className="space-y-2.5 text-xs">
            {opportunities.map(opp => (
              <div
                key={opp.id}
                className="p-3 bg-[#F4F2EA]/50 rounded-xl border border-[#DCE4DD] flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-[#173A32]">{opp.title}</p>
                  <p className="text-[11px] text-[#66736C]">
                    {opp.category} · Status: {opp.publicationStatus}
                  </p>
                </div>
                <span className="font-semibold text-[#173A32] tabular-nums shrink-0">{opp.deadline}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Recent Partnership & Audit Activity</h3>
            <CheckCircle2 className="w-4 h-4 text-[#237A55]" />
          </div>

          <div className="space-y-2.5 text-xs">
            {auditLogs.slice(0, 4).map(log => (
              <div
                key={log.id}
                className="p-3 bg-[#F4F2EA]/50 rounded-xl border border-[#DCE4DD] flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#173A32]">{log.action}</p>
                  <p className="text-[11px] text-[#66736C]">
                    {log.targetName} · Actor: {log.actorName} ({log.actorRole})
                  </p>
                </div>
                <span className="text-[10px] text-[#66736C] tabular-nums shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
