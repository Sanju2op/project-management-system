import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GroupManagement() {
  const navigate = useNavigate();
  const [currentGroup, setCurrentGroup] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', projectTitle: '', projectDescription: '', projectTechnology: '' });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editGroup, setEditGroup] = useState({ name: '', projectTitle: '', projectDescription: '', projectTechnology: '' });
  const [error, setError] = useState('');

  // Get auth token
  const getToken = () => localStorage.getItem('studentToken');

  // Check if student is in a group and fetch available students
  useEffect(() => {
    const fetchGroupStatus = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        // Check group status
        const groupResponse = await fetch('/api/student/check-group', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          if (groupData.inGroup) {
            setCurrentGroup(groupData.group);
          }
        }

        // Fetch available students
        const studentsResponse = await fetch('/api/student/available-students', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setAvailableStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load group information');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupStatus();
  }, [navigate]);

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.projectTitle.trim() || !newGroup.projectDescription.trim() || !newGroup.projectTechnology.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    if (selectedStudents.length < 2 || selectedStudents.length > 3) {
      alert('Please select 2-3 additional students.');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('/api/student/create-group', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newGroup.name,
          projectTitle: newGroup.projectTitle,
          projectDescription: newGroup.projectDescription,
          projectTechnology: newGroup.projectTechnology,
          selectedStudents: selectedStudents
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentGroup(data.group);
        setNewGroup({ name: '', projectTitle: '', projectDescription: '', projectTechnology: '' });
        setSelectedStudents([]);
        alert('Group created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleEditGroup = () => {
    if (editGroup.name.trim() !== '' && editGroup.description.trim() !== '' && editGroup.technology.trim() !== '') {
      setCurrentGroup({
        ...currentGroup,
        name: editGroup.name,
        description: editGroup.description,
        technology: editGroup.technology
      });
      setIsEditing(false);
    } else {
      alert('Please fill in all fields.');
    }
  };

  const startEdit = () => {
    setEditGroup({
      name: currentGroup.name,
      description: currentGroup.description,
      technology: currentGroup.technology
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 font-sans flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 font-sans flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">Group Management</h1>

        {currentGroup ? (
          // Show Group Details
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 mb-8 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">{currentGroup.name}</h2>
              <button
                onClick={startEdit}
                className="bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
              >
                Edit Details
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-accent-teal mb-2">Description</h3>
                <p className="text-white/90 bg-gray-800/50 p-3 rounded-lg">{currentGroup.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-accent-teal mb-2">Technology</h3>
                <p className="text-white/90 bg-gray-800/50 p-3 rounded-lg">{currentGroup.technology}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-accent-teal mb-2">Team Members</h3>
                <div className="flex flex-wrap gap-2">
                  {currentGroup.members.map(member => (
                    <span key={member.enrollment} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white/90">
                      {member.name} ({member.enrollment})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show Create Group Form
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 mb-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Group</h2>
            <p className="text-white/70 text-sm mb-6">Fill in the details and select 2-3 additional students to form your group.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-white mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Project Title</label>
                <input
                  type="text"
                  value={newGroup.projectTitle}
                  onChange={(e) => setNewGroup({...newGroup, projectTitle: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Project Description</label>
                <textarea
                  value={newGroup.projectDescription}
                  onChange={(e) => setNewGroup({...newGroup, projectDescription: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="Enter project description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Project Technology</label>
                <input
                  type="text"
                  value={newGroup.projectTechnology}
                  onChange={(e) => setNewGroup({...newGroup, projectTechnology: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="e.g., React, Node.js"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white mb-2">Select Students (Enrollment)</label>
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedStudents.length === 0 && (
                      <span className="text-white/60 text-sm">No students selected</span>
                    )}
                    {selectedStudents.map(id => {
                      const student = availableStudents.find(s => s._id === id);
                      return (
                        <span key={id} className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-2.5 py-1 rounded-full text-xs">
                          {student?.enrollmentNumber}
                          <button onClick={() => setSelectedStudents(selectedStudents.filter(s => s !== id))} className="text-cyan-200/90 hover:text-white">&times;</button>
                        </span>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableStudents.map(s => {
                      const isSelected = selectedStudents.includes(s._id);
                      const isDisabled = !isSelected && selectedStudents.length >= 3;
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStudents(selectedStudents.filter(id => id !== s._id));
                            } else if (!isDisabled) {
                              setSelectedStudents([...selectedStudents, s._id]);
                            }
                          }}
                          disabled={isDisabled}
                          className={
                            `text-left rounded-lg px-3 py-2 border transition duration-150 ` +
                            (isSelected
                              ? 'bg-cyan-500/20 border-cyan-400/50 text-white'
                              : isDisabled
                                ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-white/10 border-white/20 text-white hover:bg-white/15')
                          }
                        >
                          <div className="text-xs font-semibold">{s.enrollmentNumber}</div>
                          <div className="text-[11px] text-white/70">{s.name}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-white/70 text-xs">Selected {selectedStudents.length} (2-3 required)</div>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={handleCreateGroup}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2.5 px-7 rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.01] transition duration-200"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 mb-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Group Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-white mb-2">Group Name</label>
                <input
                  type="text"
                  value={editGroup.name}
                  onChange={(e) => setEditGroup({...editGroup, name: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={editGroup.description}
                  onChange={(e) => setEditGroup({...editGroup, description: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Technology</label>
                <input
                  type="text"
                  value={editGroup.technology}
                  onChange={(e) => setEditGroup({...editGroup, technology: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-white/15 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditGroup}
                  className="bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/student/dashboard')}
          className="bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default GroupManagement;
