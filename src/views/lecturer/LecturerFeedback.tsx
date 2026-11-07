import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  BookOpen,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';

export const LecturerFeedback: React.FC = () => {
  const { enrolledStudents, pathways, publishLearningActivity } = useNexora();
  const [selectedStudentId, setSelectedStudentId] = useState('user_student_1');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [recommendedMentor, setRecommendedMentor] = useState('Hendra Wijaya (Principal ML Architect, TechCorp)');
  const [recommendedResourceTitle, setRecommendedResourceTitle] = useState(
    'Production ML Pipeline & Kubernetes Deployment Clinic'
  );
  const [assignFollowUpTask, setAssignFollowUpTask] = useState(true);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  const selectedStudent =
    enrolledStudents.find(s => s.userId === selectedStudentId) || enrolledStudents[0];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;

    if (assignFollowUpTask && recommendedResourceTitle.trim()) {
      publishLearningActivity(
        pathways[1]?.id || 'path_mlf',
        `Mentor-Guided Follow-up: ${recommendedResourceTitle}`,
        'Practical Task',
        '2026-05-15'
      );
    }

    setSentSuccess(
      `Workflow B5 Complete: Qualitative guidance, mentor recommendation (${recommendedMentor}), and follow-up resource dispatched to ${selectedStudent.studentName}'s Student Portal!`
    );
    setFeedbackNote('');
    setTimeout(() => setSentSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs space-y-1">
        <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider">
          PRD 04 · Workflow B5 · Lecturer Guidance, Mentor & Resource Recommendations
        </span>
        <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">
          Lecturer Feedback, Mentor & Resource Recommendations
        </h1>
        <p className="text-xs text-[#66736C]">
          Provide direct qualitative academic guidance, recommend verified learning resources or industry/faculty mentors, and assign follow-up learning activities to students in your assigned courses.
        </p>
      </div>

      {sentSuccess && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{sentSuccess}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSendFeedback}
        className="bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-5 text-xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-[#173A32] block mb-1">
              Select Enrolled Student (Assigned Course Scope)
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold"
            >
              {enrolledStudents.map(s => (
                <option key={s.userId} value={s.userId}>
                  {s.studentName} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#173A32] block mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#25866A]" />
              Recommend Academic or Industry Mentor
            </label>
            <select
              value={recommendedMentor}
              onChange={e => setRecommendedMentor(e.target.value)}
              className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32] font-semibold"
            >
              <option value="Hendra Wijaya (Principal ML Architect, TechCorp)">
                Hendra Wijaya (Principal ML Architect, TechCorp)
              </option>
              <option value="Prof. Maya Putri (Lead Software Engineering Faculty)">
                Prof. Maya Putri (Lead Software Engineering Faculty)
              </option>
              <option value="Dr. Bambang Setiawan (Database Systems Chair)">
                Dr. Bambang Setiawan (Database Systems Chair)
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-[#173A32] block mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#25866A]" />
            Recommend Verified Learning Resource or Follow-Up Clinic
          </label>
          <input
            type="text"
            value={recommendedResourceTitle}
            onChange={e => setRecommendedResourceTitle(e.target.value)}
            className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
          />
        </div>

        <div>
          <label className="font-bold text-[#173A32] block mb-1">
            Qualitative Academic Guidance & Endorsement Note
          </label>
          <textarea
            rows={4}
            required
            placeholder="Provide constructive feedback regarding recent assessment evidence, observable micro-skill indicators, or recommended practice..."
            value={feedbackNote}
            onChange={e => setFeedbackNote(e.target.value)}
            className="w-full p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl text-[#173A32]"
          />
        </div>

        <label className="flex items-center gap-2.5 p-3 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={assignFollowUpTask}
            onChange={e => setAssignFollowUpTask(e.target.checked)}
            className="w-4 h-4 rounded-xs border-[#DCE4DD] text-[#25866A]"
          />
          <span className="font-semibold text-[#173A32] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D7A85B]" />
            Also publish recommended follow-up activity to Student's Personalized Learning Pathway (EVENT 5)
          </span>
        </label>

        <div className="flex justify-end pt-2 border-t border-[#DCE4DD]">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-[#D7A85B]" />
            <span>Send Guidance & Recommendations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
