// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Search, Star, User, Users, Trash2 } from 'lucide-react';
import { guidePanelAPI } from '../../services/api';

export default function Feedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRating, setFilterRating] = useState('All');

  const [newFeedback, setNewFeedback] = useState({
    groupId: '',
    groupName: '',
    project: '',
    feedback: '',
    rating: 5,
    recommendations: ''
  });

  // Load groups dynamically for dropdown
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groups = await guidePanelAPI.getGroups();
        // Normalize for dropdown
        const normalized = (groups || []).map((g) => ({
          id: g.id,
          name: g.groupName,
          projectTitle: g.projectTitle || ''
        }));
        setAvailableGroups(normalized);
      } catch (err) {
        console.error('Error loading groups for dropdown:', err);
      }
    };
    loadGroups();
  }, []);

  // Load feedback data on component mount
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setLoading(true);
        const feedbackData = await guidePanelAPI.getFeedback();
        setFeedbacks(feedbackData || []);
      } catch (err) {
        console.error('Error loading feedbacks:', err);
        setError('Failed to load feedback data');
        // Fallback to empty array if API fails
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      (async () => {
        try {
          setLoading(true);
          await guidePanelAPI.deleteFeedback(id);
          const updated = await guidePanelAPI.getFeedback();
          setFeedbacks(updated || []);
        } catch (err) {
          console.error('Error deleting feedback:', err);
          setError('Failed to delete feedback');
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = feedback.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || feedback.status === filterStatus;
    const matchesRating = filterRating === 'All' || feedback.rating === parseInt(filterRating, 10);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const submitFeedback = async () => {
    if ((newFeedback.groupId || newFeedback.groupName) && newFeedback.feedback) {
      try {
        setLoading(true);
        const feedbackData = {
          // Prefer groupId if selected, fallback to groupName (API supports both)
          ...(newFeedback.groupId ? { groupId: newFeedback.groupId } : { groupName: newFeedback.groupName }),
          project: newFeedback.project,
          feedback: newFeedback.feedback,
          rating: newFeedback.rating,
          recommendations: newFeedback.recommendations || ''
        };

        if (selectedGroup !== null) {
          await guidePanelAPI.updateFeedback(selectedGroup, feedbackData);
        } else {
          await guidePanelAPI.submitFeedback(feedbackData);
        }
        
        // Reload feedbacks after successful submission
        const updatedFeedbacks = await guidePanelAPI.getFeedback();
        setFeedbacks(updatedFeedbacks || []);

        setNewFeedback({
          groupId: '',
          groupName: '',
          project: '',
          feedback: '',
          rating: 5,
          recommendations: ''
        });
        setShowFeedbackModal(false);
        setSelectedGroup(null);
      } catch (err) {
        console.error('Error submitting feedback:', err);
        setError('Failed to submit feedback');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-500/30 text-blue-300';
      case 'Pending Response': return 'bg-orange-500/30 text-orange-300';
      case 'Completed': return 'bg-green-500/30 text-green-300';
      default: return 'bg-gray-500/30 text-gray-300';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/guide/dashboard')}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <ChevronLeft size={18} className="mr-2" /> Back to Dashboard
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Group <span className="text-teal-400">Feedback</span>
          </h1>

          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Feedback Management</h2>
            <p className="text-white/70">Provide feedback and track group responses</p>
          </div>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            <MessageSquare size={20} className="mr-2" />
            Give Feedback
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-glow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2 flex items-center bg-white/10 rounded-xl border border-white/20 px-3">
              <Search size={18} className="text-white/80 mr-2" />
              <input
                className="w-full bg-transparent text-white py-2 outline-none"
                placeholder="Search groups or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="bg-white/10 text-white rounded-xl border border-white/20 px-3 py-2 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All" className="bg-gray-800 text-white">All Status</option>
              <option value="Submitted" className="bg-gray-800 text-white">Submitted</option>
              <option value="Pending Response" className="bg-gray-800 text-white">Pending Response</option>
              <option value="Completed" className="bg-gray-800 text-white">Completed</option>
            </select>
            <select
              className="bg-white/10 text-white rounded-xl border border-white/20 px-3 py-2 appearance-none"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="All" className="bg-gray-800 text-white">All Ratings</option>
              <option value="5" className="bg-gray-800 text-white">5 Stars</option>
              <option value="4" className="bg-gray-800 text-white">4 Stars</option>
              <option value="3" className="bg-gray-800 text-white">3 Stars</option>
              <option value="2" className="bg-gray-800 text-white">2 Stars</option>
              <option value="1" className="bg-gray-800 text-white">1 Star</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-glow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feedback.groupName}</h3>
                    <p className="text-white/70 text-sm">{feedback.project}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-2">
                    {getRatingStars(feedback.rating)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(feedback.status)}`}>
                    {feedback.status}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-white/80 text-sm leading-relaxed">{feedback.feedback}</p>
              </div>

              {feedback.recommendations && (
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20 mb-4">
                  <p className="text-white/70 text-sm mb-2">Recommendations:</p>
                  <p className="text-white/80 text-sm">{feedback.recommendations}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                <span>Given on: {feedback.date}</span>
                <span>ID: {feedback.id}</span>
              </div>

              {feedback.response && (
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20 mb-4">
                  <p className="text-white/70 text-sm mb-2">Group Response:</p>
                  <p className="text-white/80 text-sm">{feedback.response}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedGroup(feedback.id);
                    setNewFeedback({
                      groupId: feedback.groupId || '',
                      groupName: feedback.groupName,
                      project: feedback.project,
                      feedback: feedback.feedback,
                      rating: feedback.rating,
                      recommendations: feedback.recommendations || ''
                    });
                    setShowFeedbackModal(true);
                  }}
                  className="bg-teal-500/30 text-teal-300 py-2 px-4 rounded-lg border border-teal-400/30 hover:bg-teal-500/40 transition"
                >
                  Edit Feedback
                </button>
                {!feedback.response && (
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await guidePanelAPI.remindGroup(feedback.id);
                        // Do not surface errors for dummy emails; show soft confirmation
                        alert('Reminder sent (if email configured).');
                      } catch (e) {
                        console.warn('Email reminder issue (ignored):', e?.message || e);
                        alert('Reminder attempted (emails may be dummy).');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-orange-500/30 text-orange-300 py-2 px-4 rounded-lg border border-orange-400/30 hover:bg-orange-500/40 transition"
                  >
                    Remind Group
                  </button>
                )}
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="bg-red-500/30 text-red-300 py-2 px-4 rounded-lg border border-red-400/30 hover:bg-red-500/40 transition flex items-center"
                >
                  <Trash2 size={16} className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={64} className="text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No feedback found</h3>
            <p className="text-white/60">Start providing feedback to help groups improve</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedGroup !== null ? 'Edit Feedback' : 'Give New Feedback'}
              </h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedGroup(null);
                  setNewFeedback({
                    groupName: '',
                    project: '',
                    feedback: '',
                    rating: 5,
                    recommendations: ''
                  });
                }}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Group</label>
                <select
                  value={newFeedback.groupId}
                  onChange={(e) => {
                    const group = availableGroups.find(g => g.id === e.target.value);
                    setNewFeedback(prev => ({
                      ...prev,
                      groupId: e.target.value,
                      groupName: group ? group.name : '',
                      project: group ? group.projectTitle : ''
                    }));
                  }}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="" className="bg-gray-800 text-white">Select group</option>
                  {availableGroups.map(group => (
                    <option key={group.id} value={group.id} className="bg-gray-800 text-white">
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-2">Project</label>
                <input
                  type="text"
                  value={newFeedback.project}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, project: e.target.value }))}
                  placeholder="Project title"
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starRating) => (
                    <button
                      key={starRating}
                      type="button"
                      onClick={() => setNewFeedback(prev => ({ ...prev, rating: starRating }))}
                      className={`p-2 rounded-lg transition ${
                        newFeedback.rating >= starRating
                          ? 'bg-yellow-500/30 text-yellow-400'
                          : 'bg-white/10 text-white/50 hover:text-white/70'
                      }`}
                    >
                      <Star size={20} className={newFeedback.rating >= starRating ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-2">Feedback</label>
                <textarea
                  value={newFeedback.feedback}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide detailed feedback..."
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-2">Recommendations</label>
                <textarea
                  value={newFeedback.recommendations}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Suggest improvements..."
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitFeedback}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition flex-1"
              >
                {selectedGroup !== null ? 'Update Feedback' : 'Submit Feedback'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedGroup(null);
                  setNewFeedback({
                    groupName: '',
                    project: '',
                    feedback: '',
                    rating: 5,
                    recommendations: ''
                  });
                }}
                className="bg-white/10 text-white py-3 px-6 rounded-lg border border-white/30 hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
