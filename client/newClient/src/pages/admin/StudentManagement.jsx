import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Search, Filter, UserCheck, UserX, Loader2 } from 'lucide-react';
import { studentAPI, divisionAPI, groupAPI } from '../../services/api';

const StudentManagement = () => {
  // --- State Hooks ---
  const [students, setStudents] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States that trigger data fetching
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  
  // UI states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    name: '',
    email: '',
    phone: ''
  });

  // --- API Call Functions ---
  
  const fetchStudents = async (currentSearchTerm, currentFilterDivision) => {
    // Only set loading if there are no students currently displayed
    if (students.length === 0) {
        setLoading(true);
    }
    try {
      const response = await studentAPI.getAll({
        search: currentSearchTerm,
        division: currentFilterDivision
      });
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await divisionAPI.getAll();
      setDivisions(response.data.data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      await groupAPI.getAll();
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };


  // --- useEffect Hooks for Data Fetching & Debouncing ---
  
  // 1. Fetch static data (Divisions, Groups) only once on mount
  useEffect(() => {
    fetchDivisions();
    fetchGroups();
    fetchStudents('', ''); 
  }, []); 

  // 2. Debounce and Fetch Students whenever search or filter states change
  useEffect(() => {
    // Set a timer (debounce logic)
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(searchTerm, filterDivision);
    }, 300);

    // Cleanup function: clear the previous timer
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterDivision]); 


  // --- Student Management Handlers ---
  
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await studentAPI.update(selectedStudent._id, formData);
      fetchStudents(searchTerm, filterDivision); 
      setShowEditModal(false);
      setSelectedStudent(null);
      resetForm();
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await studentAPI.delete(studentId);
        fetchStudents(searchTerm, filterDivision); 
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      enrollmentNumber: '',
      name: '',
      email: '',
      phone: ''
    });
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      enrollmentNumber: student.enrollmentNumber,
      name: student.name,
      email: student.email,
      phone: student.phone
    });
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Client-Side Filtering (Fallback/Supplemental) ---
  const localFilteredStudents = students.filter(student => {
    const studentName = student.name || '';
    const enrollmentNumber = student.enrollmentNumber || '';
    const studentEmail = student.email || '';
    const searchLower = searchTerm.toLowerCase();

    return studentName.toLowerCase().includes(searchLower) ||
      enrollmentNumber.toLowerCase().includes(searchLower) ||
      studentEmail.toLowerCase().includes(searchLower);
  });
  
  // --- Loading State UI ---
  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-2xl">
          <Loader2 size={40} className="animate-spin text-cyan-400 mb-4" />
          <div className="text-xl font-semibold text-gray-200">Loading initial student data...</div>
          <p className="text-sm text-gray-500 mt-1">Fetching divisions and student records.</p>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header and Title */}
        <div className="flex items-center justify-between mb-10 border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-cyan-600 to-teal-500 rounded-xl shadow-lg shadow-cyan-500/30">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-teal-100 bg-clip-text text-transparent tracking-tight">
                Student Enrollment Center
              </h1>
              <p className="text-gray-400 mt-1 font-light">Efficiently manage all student profiles, registrations, and divisions.</p>
            </div>
          </div>
        </div>

        {/* Filters and Controls Card */}
        <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-xl mb-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Filter size={20} className="text-cyan-400" />
                Filter & Search Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Search Input */}
                <div className="md:col-span-2 relative">
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Search by Name, Enrollment, or Email</label>
                    <Search size={20} className="absolute left-3 top-1/2 mt-2 transform -translate-y-1/2 text-cyan-500" />
                    <input
                        type="text"
                        placeholder="E.g., Kartik Patel, MCA20253001, kartik21@gmail.com"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                </div>
                
                {/* Division Filter (FIXED DISPLAYED VALUE VISIBILITY) */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Filter by Division</label>
                    <select
                        value={filterDivision}
                        onChange={(e) => setFilterDivision(e.target.value)}
                        // Re-applied bg-gray-700 and ensured text-white is last for highest priority
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none text-white"
                    >
                        <option value="" className="text-white bg-gray-700">— All Divisions —</option>
                        {divisions.map(division => (
                            <option 
                                key={division._id} 
                                value={division._id} 
                                className="text-white bg-gray-700" 
                            >
                                {division.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex items-end pt-2 md:pt-0">
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterDivision('');
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/80 text-white font-medium px-4 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                        title="Reset all search and filter fields"
                    >
                        <Filter size={18} />
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>

        {/* Students Table Section */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <h3 className="text-xl font-semibold p-6 border-b border-gray-700 text-gray-200">
                Student Records ({localFilteredStudents.length})
                {loading && (
                    <Loader2 size={20} className="inline ml-3 animate-spin text-cyan-400" />
                )}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">Enrollment</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400 hidden sm:table-cell">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400 hidden md:table-cell">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {localFilteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-700/50 transition-colors duration-200">
                                <td className="px-6 py-4 text-sm font-medium text-white">{student.enrollmentNumber}</td>
                                <td className="px-6 py-4 font-semibold text-sm text-gray-100">{student.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-300 hidden sm:table-cell">{student.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-300 hidden md:table-cell">{student.phone}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-inner ${
                                        student.isRegistered
                                            ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50'
                                            : 'bg-rose-600/30 text-rose-300 ring-1 ring-rose-500/50'
                                    }`}>
                                        {student.isRegistered ? <UserCheck size={14} /> : <UserX size={14} />}
                                        {student.isRegistered ? 'Active' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => openEditModal(student)}
                                            className="p-2 bg-blue-600/50 text-blue-300 rounded-full hover:bg-blue-600/80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            title="Edit Student Profile"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student._id)}
                                            className="p-2 bg-red-600/50 text-red-300 rounded-full hover:bg-red-600/80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            title="Delete Student Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Empty State */}
            {!loading && localFilteredStudents.length === 0 && (
                <div className="text-center py-16">
                    <Users size={56} className="mx-auto text-gray-500 mb-4 opacity-50" />
                    <p className="text-gray-400 font-medium text-lg">No student records found.</p>
                    <p className="text-gray-500 mt-1">Try adjusting your search term or clearing the division filter.</p>
                </div>
            )}
            {/* Table-specific loading indicator for when a search is running */}
            {loading && students.length > 0 && (
                <div className="text-center py-8">
                    <Loader2 size={32} className="mx-auto animate-spin text-cyan-400 mb-2" />
                    <p className="text-gray-400">Searching...</p>
                </div>
            )}
        </div>

        {/* Edit Student Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-8 rounded-xl border border-cyan-600/50 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                <Edit size={24} className="inline mr-2 text-cyan-400"/> Edit Student Details
              </h2>
              <form onSubmit={handleUpdateStudent} className="space-y-6">
                {/* Form Fields */}
                {['enrollmentNumber', 'name', 'email', 'phone'].map(key => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                            type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                            name={key}
                            required
                            value={formData[key]}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                    </div>
                ))}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-semibold py-3 rounded-lg hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-cyan-500/30 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Edit size={20} />}
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStudent(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-700 text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;