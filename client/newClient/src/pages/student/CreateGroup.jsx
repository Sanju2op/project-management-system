import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Check, X } from 'lucide-react';
import { studentProtectedAPI } from '../../services/api';

function CreateGroup() {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState({
    name: '',
    title: '',
    description: '',
    technology: ''
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableStudents();
  }, []);

  const fetchAvailableStudents = async () => {
    try {
      const data = await studentProtectedAPI.getAvailableStudents();
      setAvailableStudents(data);
    } catch (err) {
      console.error('Error fetching available students:', err);
      setError('Failed to load available students');
    }
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s._id === student._id);
      if (isSelected) {
        return prev.filter(s => s._id !== student._id);
      } else {
        if (prev.length >= 3) {
          return prev; // Max 3 additional students
        }
        return [...prev, student];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!projectData.name || !projectData.title || !projectData.description || !projectData.technology) {
      setError('Please fill in all project details');
      return;
    }

    if (selectedStudents.length < 2 || selectedStudents.length > 3) {
      setError('Please select 2-3 additional students');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        project: projectData,
        members: selectedStudents.map(s => s._id)
      };

      await studentProtectedAPI.createGroup(payload);
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <Users size={48} className="text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Project Group</h1>
            <p className="text-white/70">Form a team of 3-4 students to work on your project</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Details */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={projectData.name}
                    onChange={handleProjectChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={projectData.title}
                    onChange={handleProjectChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={projectData.description}
                    onChange={handleProjectChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your project"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Technology *
                  </label>
                  <input
                    type="text"
                    name="technology"
                    value={projectData.technology}
                    onChange={handleProjectChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., React, Node.js, Python"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Student Selection */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Select Team Members ({selectedStudents.length}/3)
              </h2>
              <p className="text-white/70 mb-4">
                Choose 2-3 additional students from your division who are not already in a group
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableStudents.map(student => {
                  const isSelected = selectedStudents.some(s => s._id === student._id);
                  return (
                    <div
                      key={student._id}
                      onClick={() => toggleStudentSelection(student)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{student.name}</p>
                          <p className="text-white/70 text-sm">{student.enrollmentNumber}</p>
                        </div>
                        {isSelected ? (
                          <Check size={20} className="text-blue-400" />
                        ) : (
                          <Plus size={20} className="text-white/50" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {availableStudents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/70">No available students found in your division</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Group...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGroup;
