import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Users, CheckCircle, Clock, X } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';

function ProjectSubmission() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    files: [],
    teamMembers: [{ name: '', email: '', role: '' }],
  });
  const [status, setStatus] = useState('Not Submitted');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index][field] = value;
    setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', email: '', role: '' }]
    }));
  };

  const removeMember = (index) => {
    if (formData.teamMembers.length > 1) {
      const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.files.length === 0) newErrors.files = 'At least one file is required';
    formData.teamMembers.forEach((member, index) => {
      if (!member.name.trim()) newErrors[`member${index}Name`] = 'Name is required';
      if (!member.email.trim()) newErrors[`member${index}Email`] = 'Email is required';
      if (!member.role.trim()) newErrors[`member${index}Role`] = 'Role is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate submission
      setStatus('Submitted');
      console.log('Form submitted:', formData);
      alert('Project submitted successfully!');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Submitted':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'Under Review':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <X className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Project Submission</h1>
        
        {/* Status Tracking */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className="text-white text-lg font-semibold">Submission Status: {status}</span>
            </div>
            <div className="text-white/70 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          {/* Project Title and Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2" />
              Project Details
            </h2>
            <Input
              id="title"
              label="Project Title"
              type="text"
              placeholder="Enter your project title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'border-red-400' : ''}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-white text-sm font-medium mb-2">
                Project Description
              </label>
              <textarea
                id="description"
                placeholder="Describe your project in detail"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200 placeholder-white/60 resize-none ${errors.description ? 'border-red-400' : ''}`}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2" />
              Project Documents
            </h2>
            <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Click to upload project documents</p>
                <p className="text-white/60 text-sm">Supported formats: PDF, DOC, DOCX, TXT, ZIP</p>
              </label>
            </div>
            {formData.files.length > 0 && (
              <div className="mt-4">
                <p className="text-white text-sm mb-2">Selected files:</p>
                <ul className="text-white/80 text-sm">
                  {formData.files.map((file, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.files && <p className="text-red-400 text-sm mt-1">{errors.files}</p>}
          </div>

          {/* Team Members */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Team Members
            </h2>
            {formData.teamMembers.map((member, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-medium">Member {index + 1}</h3>
                  {formData.teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      id={`member${index}Name`}
                      label="Name"
                      type="text"
                      placeholder="Full name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className={errors[`member${index}Name`] ? 'border-red-400' : ''}
                    />
                    {errors[`member${index}Name`] && <p className="text-red-400 text-sm mt-1">{errors[`member${index}Name`]}</p>}
                  </div>
                  <div>
                    <Input
                      id={`member${index}Email`}
                      label="Email"
                      type="email"
                      placeholder="email@example.com"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className={errors[`member${index}Email`] ? 'border-red-400' : ''}
                    />
                    {errors[`member${index}Email`] && <p className="text-red-400 text-sm mt-1">{errors[`member${index}Email`]}</p>}
                  </div>
                  <div>
                    <Input
                      id={`member${index}Role`}
                      label="Role"
                      type="text"
                      placeholder="e.g., Developer, Designer"
                      value={member.role}
                      onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                      className={errors[`member${index}Role`] ? 'border-red-400' : ''}
                    />
                    {errors[`member${index}Role`] && <p className="text-red-400 text-sm mt-1">{errors[`member${index}Role`]}</p>}
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addMember}
              className="bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 transition duration-200"
            >
              + Add Team Member
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <Button type="submit">
              Submit Project
            </Button>
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="bg-white/20 text-white py-2 px-6 rounded-lg font-semibold hover:bg-white/30 transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectSubmission;
