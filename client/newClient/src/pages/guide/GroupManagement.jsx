// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Users, User, BookOpen, Code, Hash, Edit, X, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { guidePanelAPI } from '../../services/api';

// Mock Data for Guide's Groups
const guideGroups = [
  {
    id: 'g1',
    name: 'Alpha Team',
    guide: 'Patel Kartik',
    projectTitle: 'E-commerce Platform',
    projectDescription: 'A web-based platform for online shopping, featuring a user-friendly interface and secure payment gateways.',
    projectTechnology: 'Full Stack MERN',
    year: 2025,
    members: [
      { name: 'Student 1', className: 'BCA 6', enrollment: '2623' },
      { name: 'Student 2', className: 'BCA 6', enrollment: '2647' },
      { name: 'Student 3', className: 'BCA 6', enrollment: '2662' }
    ]
  },
  {
    id: 'g2',
    name: 'Beta Squad',
    guide: 'Patel Kartik',
    projectTitle: 'Real-time Chat App',
    projectDescription: 'A real-time messaging application with a focus on fast and secure communication between users.',
    projectTechnology: 'Flutter',
    year: 2025,
    members: [
      { name: 'Student 4', className: 'BCA 6', enrollment: '2668' },
      { name: 'Student 5', className: 'BCA 6', enrollment: '2670' },
      { name: 'Student 6', className: 'BCA 6', enrollment: '2681' }
    ]
  },
];

function GroupManagement() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState(null);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [newMemberSearch, setNewMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load of groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const res = await guidePanelAPI.getGroups();
        // Map to local card structure
        // console.log(res);
        const mapped = (res || []).map(g => ({
          id: g.id,
          name: g.groupName || g.name || 'Group',
          projectTitle: g.projectTitle || '',
          projectDescription: g.description || '',
          projectTechnology: g.technology || '',
          course: g.course || '',
          year: g.year || new Date().getFullYear(),
          members: (g.members || []).map(m => ({
            _id: m.id,
            name: m.name,
            enrollmentNumber: m.enrollmentNumber,
          })),
        }));
        setGroups(mapped);
      } catch (e) {
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleBack = () => {
    navigate('/guide/dashboard', { replace: true });
  };

  const handleViewDetails = async (group) => {
    try {
      setLoading(true);
      // Always fetch latest details from API
      const details = await guidePanelAPI.getGroupDetails(group.id);
      const mapped = {
        id: details.id,
        name: details.groupName || group.name,
        projectTitle: details.projectTitle || group.projectTitle,
        projectDescription: details.description || '',
        projectTechnology: details.technology || '',
        course: details.course || group.course || '',
        year: details.year || group.year,
        members: (details.members || []).map(m => ({
          _id: m.id,
          name: m.name,
          enrollmentNumber: m.enrollmentNumber,
        })),
      };
      setSelectedGroup(mapped);
    } catch (e) {
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  const handleEditGroup = () => {
    setEditedGroup(selectedGroup);
    setCurrentMembers(selectedGroup.members);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditedGroup(null);
    setCurrentMembers([]);
    setNewMemberSearch('');
    setSearchResults([]);
    setError('');
  };

  const handleFormChange = (field, value) => {
    setEditedGroup({ ...editedGroup, [field]: value });
  };

  const handleSearchStudents = async () => {
    if (!newMemberSearch.trim()) return;
    try {
      const response = await guidePanelAPI.searchStudents(newMemberSearch);
      // console.log(response);
      // console.log(response.data);
      setSearchResults(response);
    } catch (err) {
      setError('Failed to search students');
    }
  };

  const handleAddMember = (student) => {
    if (currentMembers.length >= 4) {
      setError('Maximum 4 members allowed');
      return;
    }
    if (currentMembers.find(m => m._id === student._id)) {
      setError('Student already in group');
      return;
    }
    setCurrentMembers([...currentMembers, student]);
    setNewMemberSearch('');
    setSearchResults([]);
    setSelectedNewMemberId('');
  };

  const handleRemoveMember = (studentId) => {
    if (currentMembers.length <= 3) {
      setError('Minimum 3 members required');
      return;
    }
    setCurrentMembers(currentMembers.filter(m => m._id !== studentId));
  };

  const handleSaveGroup = async () => {
    if (currentMembers.length < 3 || currentMembers.length > 4) {
      setError('Group must have 3-4 members');
      return;
    }
    setLoading(true);
    try {
      const updateData = {
        projectTitle: editedGroup.projectTitle,
        projectDescription: editedGroup.projectDescription,
        year: editedGroup.year,
        technology: editedGroup.projectTechnology,
        members: currentMembers.map(m => m._id)
      };
      await guidePanelAPI.updateGroupDetails(selectedGroup.id, updateData);
      // Update local state
      const updatedGroup = { ...selectedGroup, ...editedGroup, members: currentMembers };
      setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g));
      setSelectedGroup(updatedGroup);
      handleCloseEdit();
    } catch (err) {
      setError('Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  // Load available students when opening edit
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!isEditing || !selectedGroup) return;
      try {
        const res = await guidePanelAPI.getAvailableStudentsForGroup(selectedGroup.id);
        setAvailableStudents(res.data || []);
      } catch (e) {
        // non-fatal
      }
    };
    fetchAvailable();
  }, [isEditing, selectedGroup]);

  const dropdownOptions = useMemo(() => {
    const currentIds = new Set(currentMembers.map(m => m._id));
    return (availableStudents || []).filter(s => !currentIds.has(s._id));
  }, [availableStudents, currentMembers]);

  // Render details view
  const renderDetailsView = () => {
    if (!selectedGroup) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <ChevronLeft size={18} className="mr-2" /> Back to Groups
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            {selectedGroup.name}
          </h1>
          <button
            onClick={handleEditGroup}
            className="flex items-center bg-gradient-to-r from-blue-500 to-purple-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <Edit size={18} className="mr-2" /> Edit Group
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 space-y-6">
            <h2 className="text-2xl font-bold text-white">Project Details</h2>
            <div className="space-y-4 text-white/90">
              <div className="flex items-center">
                <BookOpen size={20} className="mr-3 text-white" />
                <p className="font-semibold">Project Title:</p>
                <span className="ml-2">{selectedGroup.projectTitle}</span>
              </div>
              <div className="flex items-center">
                <Users size={20} className="mr-3 text-white" />
                <p className="font-semibold">Course:</p>
                <span className="ml-2">{selectedGroup.course || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-white text-lg mr-3">🗓️</span>
                <p className="font-semibold">Year:</p>
                <span className="ml-2">{selectedGroup.year}</span>
              </div>
              <div className="flex items-center">
                <Code size={20} className="mr-3 text-white" />
                <p className="font-semibold">Technology:</p>
                <span className="ml-2">{selectedGroup.projectTechnology}</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Description:</p>
                <p className="text-white/80">{selectedGroup.projectDescription}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 space-y-6">
            <h2 className="text-2xl font-bold text-white">Group Members</h2>
            <div className="space-y-4">
              {selectedGroup.members.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/20">
                  <div className="flex items-center">
                    <User size={20} className="text-white mr-3" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{member.name}</span>
                      <div className="text-white/70 text-sm flex items-center">
                        <Hash size={14} className="mr-1" />
                        <span>{member.enrollmentNumber || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.length > 0 ? (
          groups.map((group, index) => (
            <div
              key={group.id}
              onClick={() => handleViewDetails(group)}
              className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-all duration-200"
            >
              <div>
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <Users size={24} className="mr-3 text-white" />
                  <span>{group.name}</span>
                </div>
                <div className="space-y-2 text-white/90">
                  <div className="flex items-center">
                    <BookOpen size={20} className="mr-3 text-white" />
                    <p className="font-semibold">Project Title:</p>
                    <span className="ml-2 text-sm">{group.projectTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white/70 text-center col-span-full py-8 text-lg">No groups found.</p>
        )}
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <ChevronLeft size={18} className="mr-2" /> Back to Dashboard
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            My <span className="text-teal-400">Groups</span>
          </h1>

          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {selectedGroup ? renderDetailsView() : renderListView()}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl shadow-glow border border-white/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Edit Group</h2>
                <button
                  onClick={handleCloseEdit}
                  className="text-white hover:text-red-400 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Project Details</h3>

                  <div>
                    <label className="block text-white/80 mb-2">Project Title</label>
                    <input
                      type="text"
                      value={editedGroup.projectTitle}
                      onChange={(e) => handleFormChange('projectTitle', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Course</label>
                    <input
                      type="text"
                      value={editedGroup.course || ''}
                      onChange={(e) => handleFormChange('course', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Year</label>
                    <input
                      type="number"
                      value={editedGroup.year}
                      onChange={(e) => handleFormChange('year', parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Technology</label>
                    <input
                      type="text"
                      value={editedGroup.projectTechnology || editedGroup.technology || ''}
                      onChange={(e) => handleFormChange('projectTechnology', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Description</label>
                    <textarea
                      value={editedGroup.projectDescription}
                      onChange={(e) => handleFormChange('projectDescription', e.target.value)}
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                  </div>
                </div>

                {/* Group Members */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Group Members ({currentMembers.length}/4)</h3>

                  {/* Current Members */}
                  <div className="space-y-3">
                    {currentMembers.map((member) => (
                      <div key={member._id} className="flex items-center justify-between bg-white/10 p-3 rounded-lg border border-white/20">
                        <div className="flex items-center">
                          <User size={20} className="text-white mr-3" />
                          <div>
                            <span className="text-white font-semibold">{member.name}</span>
                            <div className="text-white/70 text-sm">
                              <Hash size={14} className="inline mr-1" />
                              {member.enrollmentNumber}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Member */}
                  <div className="space-y-3">
                    <label className="block text-white/80">Add New Member</label>
                    <div className="flex gap-2 items-center">
                      <select
                        value={selectedNewMemberId}
                        onChange={(e) => setSelectedNewMemberId(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="" className="text-black">Select student by enrollment</option>
                        {dropdownOptions.map((s) => (
                          <option key={s._id} value={s._id} className="text-black">
                            {s.enrollmentNumber} - {s.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const s = dropdownOptions.find(d => d._id === selectedNewMemberId);
                          if (s) handleAddMember(s);
                        }}
                        disabled={!selectedNewMemberId}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
                      >
                        Add
                      </button>
                    </div>

                    <div className="text-white/60 text-sm">Or search by enrollment</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter enrollment number"
                        value={newMemberSearch}
                        onChange={(e) => setNewMemberSearch(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      />
                      <button
                        onClick={handleSearchStudents}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        <Search size={16} />
                      </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-lg max-h-32 overflow-y-auto">
                        {searchResults.map((student) => (
                          <div
                            key={student._id}
                            onClick={() => handleAddMember(student)}
                            className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                          >
                            <div className="text-white font-semibold">{student.name}</div>
                            <div className="text-white/70 text-sm">
                              <Hash size={14} className="inline mr-1" />
                              {student.enrollmentNumber}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={handleCloseEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGroup}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupManagement;
