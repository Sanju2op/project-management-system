import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';

function Announcements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: ''
  });

  // Mock data for announcements
  useEffect(() => {
    const mockAnnouncements = [
      {
        id: 1,
        type: 'admin',
        title: 'New Project Guidelines',
        content: 'Please review the updated project submission guidelines effective immediately.',
        date: '2023-10-15',
        category: 'Guidelines'
      },
      {
        id: 2,
        type: 'guide',
        title: 'Mentoring Session Schedule',
        content: 'Weekly mentoring sessions are now scheduled for Tuesdays and Thursdays.',
        date: '2023-10-12',
        category: 'Schedule'
      },
      {
        id: 3,
        type: 'admin',
        title: 'Deadline Extension',
        content: 'Project submission deadline has been extended to November 1st.',
        date: '2023-10-10',
        category: 'Deadline'
      },
      {
        id: 4,
        type: 'guide',
        title: 'Feedback Review',
        content: 'All feedback from the last evaluation has been posted.',
        date: '2023-10-08',
        category: 'Feedback'
      },
      {
        id: 5,
        type: 'admin',
        title: 'System Maintenance',
        content: 'Scheduled maintenance on October 20th from 2-4 PM.',
        date: '2023-10-05',
        category: 'Maintenance'
      }
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesDateFrom = !filters.dateFrom || new Date(ann.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(ann.date) <= new Date(filters.dateTo);
    const matchesCategory = !filters.category || ann.category === filters.category;
    return matchesDateFrom && matchesDateTo && matchesCategory;
  });

  const adminAnnouncements = filteredAnnouncements.filter(ann => ann.type === 'admin');
  const guideAnnouncements = filteredAnnouncements.filter(ann => ann.type === 'guide');

  const categories = [...new Set(announcements.map(ann => ann.category))];

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Announcements</h1>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              id="dateFrom"
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
            <Input
              id="dateTo"
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
            <Input
              id="category"
              label="Category"
              type="select"
              placeholder="Select Category"
              value={filters.category}
              onChange={handleFilterChange}
              options={categories}
            />
          </div>
          <button
            onClick={() => setFilters({ dateFrom: '', dateTo: '', category: '' })}
            className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Announcements */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Admin Announcements</h2>
            <div className="space-y-4">
              {adminAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white/5 p-4 rounded-lg cursor-pointer hover:bg-white/10 transition duration-200"
                  onClick={() => setSelectedAnnouncement(ann)}
                >
                  <h3 className="text-lg font-medium text-white">{ann.title}</h3>
                  <p className="text-white/70 text-sm">{ann.date} - {ann.category}</p>
                  <p className="text-white/80 mt-2">{ann.content.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guide Announcements */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Guide Announcements</h2>
            <div className="space-y-4">
              {guideAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white/5 p-4 rounded-lg cursor-pointer hover:bg-white/10 transition duration-200"
                  onClick={() => setSelectedAnnouncement(ann)}
                >
                  <h3 className="text-lg font-medium text-white">{ann.title}</h3>
                  <p className="text-white/70 text-sm">{ann.date} - {ann.category}</p>
                  <p className="text-white/80 mt-2">{ann.content.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcement Details */}
        {selectedAnnouncement && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Announcement Details</h2>
            <h3 className="text-xl font-medium text-white mb-2">{selectedAnnouncement.title}</h3>
            <p className="text-white/70 text-sm mb-4">{selectedAnnouncement.date} - {selectedAnnouncement.category} - {selectedAnnouncement.type}</p>
            <p className="text-white/90">{selectedAnnouncement.content}</p>
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="mt-4 bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
            >
              Close Details
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Announcements;
