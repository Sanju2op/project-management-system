import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { Calendar as CalendarIcon, Clock, FileText, BookOpen } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

function ExamSchedules() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data for exams and deadlines
  const exams = [
    { subject: 'Data Structures', date: '2024-10-15', time: '10:00 AM' },
    { subject: 'Algorithms', date: '2024-10-20', time: '2:00 PM' },
    { subject: 'Database Management', date: '2024-10-25', time: '11:00 AM' },
  ];

  const deadlines = [
    { project: 'Final Project Submission', deadline: '2024-10-25' },
    { project: 'Mid-term Report', deadline: '2024-10-18' },
    { project: 'Proposal Document', deadline: '2024-10-12' },
  ];

  // Removed seminars per requirements

  // Combine all events for calendar
  const events = [
    ...exams.map(e => ({ date: e.date, title: e.subject, type: 'exam', time: e.time })),
    ...deadlines.map(d => ({ date: d.deadline, title: d.project, type: 'deadline' })),
  ];

  // Get events for selected date
  const selectedDateEvents = events.filter(e => e.date === selectedDate.toISOString().split('T')[0]);

  // Custom tile content for calendar
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = events.filter(e => e.date === date.toISOString().split('T')[0]);
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  const EventCard = ({ event, icon: Icon }) => (
    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:bg-white/10 transition duration-200">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-white/10 rounded-full">
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">{event.title}</h3>
          <p className="text-white/70 text-xs">{event.date}</p>
          {event.time && <p className="text-white/70 text-xs">{event.time}</p>}
          {event.speaker && <p className="text-white/70 text-xs">Speaker: {event.speaker}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Exam Schedules</h1>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Exams */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <BookOpen size={24} className="mr-2 text-blue-400" />
              Upcoming Exams
            </h2>
            <div className="space-y-3">
              {exams.map((exam, index) => (
                <EventCard key={index} event={exam} icon={BookOpen} />
              ))}
            </div>
          </div>

          {/* Project Deadlines */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FileText size={24} className="mr-2 text-green-400" />
              Project Deadlines
            </h2>
            <div className="space-y-3">
              {deadlines.map((deadline, index) => (
                <EventCard key={index} event={deadline} icon={FileText} />
              ))}
            </div>
          </div>

          {/* Seminar section removed */}
        </div>

        {/* Calendar and Selected Date Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <CalendarIcon size={24} className="mr-2 text-cyan-400" />
              Calendar View
            </h2>
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="react-calendar-custom"
              />
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock size={24} className="mr-2 text-yellow-400" />
              Events on {selectedDate.toDateString()}
            </h2>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event, index) => {
                  const Icon = event.type === 'exam' ? BookOpen : FileText;
                  return <EventCard key={index} event={event} icon={Icon} />;
                })}
              </div>
            ) : (
              <p className="text-white/70">No events on this date.</p>
            )}
          </div>
        </div>
      </div>

      {/* Custom styles for react-calendar */}
      <style jsx>{`
        .react-calendar-custom {
          background: transparent;
          border: none;
          font-family: inherit;
        }
        .react-calendar-custom .react-calendar__tile {
          background: transparent;
          color: white;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .react-calendar-custom .react-calendar__tile:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .react-calendar-custom .react-calendar__tile--active {
          background: rgba(59, 130, 246, 0.5);
        }
        .react-calendar-custom .react-calendar__navigation button {
          color: white;
        }
        .react-calendar-custom .react-calendar__month-view__weekdays__weekday {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}

export default ExamSchedules;
