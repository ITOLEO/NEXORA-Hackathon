import React from 'react';
import {
  BookOpen,
  Users,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { DEMO_IMAGE_AHMAD } from '../../services/demoData';

interface LecturerOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const LecturerOverview: React.FC<LecturerOverviewProps> = ({ onNavigateTab }) => {
  const { courses, evidenceList } = useNexora();

  const pendingEvidenceCount = evidenceList.filter(e => e.status === 'pending').length;
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner matching top right mockup */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#173A32]">
            Welcome, Dr. Ahmad
          </h1>
          <p className="text-sm text-[#66736C]">
            Let's make learning more impactful across your {courses.length} active university courses.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#F4F2EA] p-3 rounded-2xl border border-[#DCE4DD] shrink-0">
          <img
            src={DEMO_IMAGE_AHMAD}
            alt="Dr. Ahmad"
            className="w-16 h-16 rounded-xl object-cover border border-[#25866A]/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-xs font-bold text-[#173A32]">Dr. Ahmad Hidayat</p>
            <p className="text-[11px] text-[#66736C]">Head of Data Science & AI</p>
            <span className="text-[10px] font-bold text-[#25866A] bg-[#25866A]/10 px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-wider">
              Faculty Member
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>My Courses</span>
            <span className="text-[#237A55] font-bold">+1</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">{courses.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Total Students</span>
            <span className="text-[#237A55] font-bold">+12%</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">{totalStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Competencies Mapped</span>
            <span className="text-[#237A55] font-bold">+8%</span>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">36</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DD] shadow-xs hover:border-[#25866A]/40 transition-all">
          <div className="flex justify-between text-xs text-[#66736C] mb-2 font-semibold">
            <span>Pending Assessments</span>
            <Clock className="w-4 h-4 text-[#A76716]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#173A32] tabular-nums">{pendingEvidenceCount}</p>
        </div>
      </div>

      {/* Main Grid split matching top right mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Competency Overview Graph (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Class Competency Overview</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-[#F4F2EA] border border-[#DCE4DD] rounded-lg">
              This Semester
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#66736C] pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#237A55]" /> Mastered</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#25866A]" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D7A85B]" /> Needs Support</span>
          </div>

          {/* Simulated SVG Graph matching screenshot */}
          <div className="h-48 w-full bg-[#F4F2EA]/40 rounded-xl p-4 border border-[#DCE4DD] flex items-end justify-between relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 400 150">
              <path d="M 0 100 Q 100 80 200 40 T 400 30" fill="none" stroke="#237A55" strokeWidth="3" />
              <path d="M 0 120 Q 100 90 200 60 T 400 50" fill="none" stroke="#25866A" strokeWidth="3" />
              <path d="M 0 130 Q 100 110 200 95 T 400 110" fill="none" stroke="#D7A85B" strokeWidth="3" />
            </svg>
            <div className="w-full flex justify-between text-[10px] text-[#66736C] font-semibold pt-36 z-10">
              <span>Week 1</span>
              <span>Week 4</span>
              <span>Week 8</span>
              <span>Week 12</span>
            </div>
          </div>
        </div>

        {/* Teaching Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
            <h3 className="font-heading font-bold text-base text-[#173A32]">Teaching Actions</h3>
            <button onClick={() => onNavigateTab('lecturer_activities')} className="text-xs font-semibold text-[#25866A] hover:underline">
              View All →
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigateTab('lecturer_activities')}
              className="w-full p-3 bg-[#F4F2EA] hover:bg-[#E9E5DA] rounded-xl border border-[#DCE4DD] flex items-center justify-between text-xs transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#25866A]" />
                <span className="font-semibold text-[#173A32]">Review Data Science Activities</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#66736C]" />
            </button>

            <button
              onClick={() => onNavigateTab('lecturer_class_intelligence')}
              className="w-full p-3 bg-[#F4F2EA] hover:bg-[#E9E5DA] rounded-xl border border-[#DCE4DD] flex items-center justify-between text-xs transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#25866A]" />
                <span className="font-semibold text-[#173A32]">Address Machine Learning Skill Gap</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#66736C]" />
            </button>

            <button
              onClick={() => onNavigateTab('lecturer_assessments')}
              className="w-full p-3 bg-[#F4F2EA] hover:bg-[#E9E5DA] rounded-xl border border-[#DCE4DD] flex items-center justify-between text-xs transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#237A55]" />
                <span className="font-semibold text-[#173A32]">Approve {pendingEvidenceCount} Student Submissions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#66736C]" />
            </button>
          </div>
        </div>
      </div>

      {/* Your Courses Grid matching top right mockup */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE4DD]">
          <h3 className="font-heading font-bold text-base text-[#173A32]">Your Courses</h3>
          <button onClick={() => onNavigateTab('lecturer_courses')} className="text-xs font-semibold text-[#25866A] hover:underline">
            Manage Courses →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => onNavigateTab('lecturer_courses')}
              className="p-4 bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl hover:bg-[#F4F2EA] cursor-pointer transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#25866A]/10 text-[#25866A]">
                  {course.code}
                </span>
                <span className="text-xs text-[#66736C] font-semibold">{course.term}</span>
              </div>

              <h4 className="font-heading font-bold text-sm text-[#173A32]">{course.name}</h4>

              <div className="flex items-center justify-between text-xs text-[#66736C] pt-2 border-t border-[#DCE4DD]">
                <span>{course.enrolledCount} Enrolled Students</span>
                <span className="font-bold text-[#173A32] tabular-nums">{course.completionRate}% Completion</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
