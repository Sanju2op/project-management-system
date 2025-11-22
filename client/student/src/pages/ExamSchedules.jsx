import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { studentProtectedAPI } from "../services/api.js";

function ExamSchedules() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  // Fetch exam schedules dynamically
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await studentProtectedAPI.getExamSchedules();
        setExams(res.schedules || []);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    }
    fetchData();
  }, []);

  // Format date → DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  // Group exams by date
  const groupByDate = (exams) => {
    const groups = {};
    exams.forEach((exam) => {
      const formattedDate = formatDate(exam.date);
      if (!groups[formattedDate]) groups[formattedDate] = [];
      groups[formattedDate].push(exam);
    });
    return groups;
  };

  const groupedExams = groupByDate(exams);

  const EventCard = ({ event }) => (
    <div className="bg-white/10 backdrop-blur-lg p-5 rounded-xl border border-white/20 hover:bg-white/20 transition duration-200">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-white/20 rounded-full">
          <BookOpen size={24} className="text-white" />
        </div>

        <div className="flex-1">
          <p className="text-white/90 text-base font-medium mb-1">
            {event.type}
          </p>

          <h3 className="text-white font-semibold text-lg">{event.subject}</h3>

          {event.description && (
            <p className="text-white/70 text-sm mt-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-white tracking-wide">
            Schedules
          </h1>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Date-wise Exam Listing */}
        {Object.keys(groupedExams).length === 0 ? (
          <p className="text-white/70 text-center text-lg">
            No exams available.
          </p>
        ) : (
          Object.keys(groupedExams).map((date) => (
            <div
              key={date}
              className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8"
            >
              <h2 className="text-2xl font-bold text-cyan-200 mb-4">{date}</h2>

              <div className="space-y-4">
                {groupedExams[date].map((exam, index) => (
                  <EventCard key={index} event={exam} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExamSchedules;
