// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, FileText, CheckCircle, Clock, AlertCircle, Download, Eye, Edit3 } from 'lucide-react';
import { guidePanelAPI } from '../../services/api';

export default function ProjectEvaluation() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluationForm, setEvaluationForm] = useState({
    technicalScore: 0,
    presentationScore: 0,
    documentationScore: 0,
    innovationScore: 0,
    overallScore: 0,
    status: 'pending'
  });

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectData = await guidePanelAPI.getProjects();
        setProjects(projectData || []);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects data');
        // Fallback to empty array if API fails
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const [evaluationCriteria] = useState([
    {
      id: 'technical',
      name: 'Technical Implementation',
      description: 'Code quality, architecture, and technical complexity',
      maxScore: 25
    },
    {
      id: 'presentation',
      name: 'Presentation & Demo',
      description: 'Clarity of presentation and demonstration quality',
      maxScore: 20
    },
    {
      id: 'documentation',
      name: 'Documentation',
      description: 'Completeness and quality of project documentation',
      maxScore: 20
    },
    {
      id: 'innovation',
      name: 'Innovation & Creativity',
      description: 'Originality and creative problem-solving approach',
      maxScore: 15
    }
  ]);

  useEffect(() => {
    // Calculate overall score when individual scores change
    const total = evaluationCriteria.reduce((sum, criteria) => {
      const score = evaluationForm[criteria.id + 'Score'] || 0;
      return sum + score;
    }, 0);
    
    setEvaluationForm(prev => ({
      ...prev,
      overallScore: total
    }));
  }, [evaluationForm.technicalScore, evaluationForm.presentationScore, evaluationForm.documentationScore, evaluationForm.innovationScore]);

  const handleScoreChange = (criteriaId, value) => {
    const maxScore = evaluationCriteria.find(c => c.id === criteriaId)?.maxScore || 0;
    const clampedValue = Math.min(Math.max(0, value), maxScore);
    
    setEvaluationForm(prev => ({
      ...prev,
      [criteriaId + 'Score']: clampedValue
    }));
  };

  const submitEvaluation = async () => {
    if (selectedProject) {
      try {
        setLoading(true);
        const evaluationData = {
          projectId: selectedProject.id,
          technicalScore: evaluationForm.technicalScore,
          presentationScore: evaluationForm.presentationScore,
          documentationScore: evaluationForm.documentationScore,
          innovationScore: evaluationForm.innovationScore,
          overallScore: evaluationForm.overallScore,
          status: 'completed'
        };

        await guidePanelAPI.evaluateProject(selectedProject.id, evaluationData);
        
        // Reload projects after successful evaluation
        const updatedProjects = await guidePanelAPI.getProjects();
        setProjects(updatedProjects || []);

        alert(`Evaluation submitted successfully for ${selectedProject.projectTitle}`);
        setSelectedProject(null);
        setEvaluationForm({
          technicalScore: 0,
          presentationScore: 0,
          documentationScore: 0,
          innovationScore: 0,
          overallScore: 0,
          status: 'completed'
        });
      } catch (err) {
        console.error('Error submitting evaluation:', err);
        alert('Failed to submit evaluation');
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadDocument = (documentName) => {
    alert(`Downloading ${documentName}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/30 text-green-300';
      case 'Under Review': return 'bg-orange-500/30 text-orange-300';
      case 'Pending Evaluation': return 'bg-blue-500/30 text-blue-300';
      default: return 'bg-gray-500/30 text-gray-300';
    }
  };

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-400' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-400' };
    if (score >= 50) return { grade: 'C+', color: 'text-yellow-400' };
    if (score >= 40) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'F', color: 'text-red-400' };
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
            Project <span className="text-teal-400">Evaluation</span>
          </h1>

          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Project List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-glow">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FileText size={24} className="text-teal-400 mr-3" />
                Projects to Evaluate
              </h2>
              
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                      selectedProject?.id === project.id
                        ? 'border-teal-400 bg-teal-500/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{project.groupName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-2">{project.projectTitle}</p>
                    <p className="text-white/60 text-xs mb-2">{project.technology}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Submitted: {project.submittedDate}</span>
                      <span className="text-white/50">{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Evaluation Form */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-glow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.projectTitle}</h2>
                    <p className="text-white/70">Group: {selectedProject.groupName}</p>
                    <p className="text-white/70">Technology: {selectedProject.technology}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Submitted: {selectedProject.submittedDate}</p>
                    <p className="text-white/60 text-sm">Last Evaluation: {selectedProject.lastEvaluation}</p>
                  </div>
                </div>

                {/* Project Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Project Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-teal-400" />
                          <span className="text-white/80 text-sm">{doc}</span>
                        </div>
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="p-1 bg-white/10 text-white rounded hover:bg-white/20 transition"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Members */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Group Members</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.members.map((member, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Evaluation Criteria</h3>
                  <div className="space-y-4">
                    {evaluationCriteria.map((criteria) => (
                      <div key={criteria.id} className="bg-white/10 p-4 rounded-2xl border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{criteria.name}</h4>
                            <p className="text-white/70 text-sm">{criteria.description}</p>
                          </div>
                          <span className="text-white/60 text-sm">Max: {criteria.maxScore}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max={criteria.maxScore}
                            value={evaluationForm[criteria.id + 'Score'] || 0}
                            onChange={(e) => handleScoreChange(criteria.id, parseInt(e.target.value))}
                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <span className="text-white font-semibold min-w-[3rem] text-center">
                            {evaluationForm[criteria.id + 'Score'] || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Score */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 p-4 rounded-2xl border border-teal-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Overall Score</h3>
                        <p className="text-white/70 text-sm">Total points out of 80</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{evaluationForm.overallScore}</div>
                        <div className={`text-lg font-semibold ${getGrade(evaluationForm.overallScore).color}`}>
                          {getGrade(evaluationForm.overallScore).grade}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={submitEvaluation}
                    className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition flex-1"
                  >
                    Submit Evaluation
                  </button>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="bg-white/10 text-white py-3 px-6 rounded-lg border border-white/30 hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-md p-12 rounded-3xl border border-white/30 shadow-glow flex items-center justify-center">
                <div className="text-center">
                  <FileText size={64} className="text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Project</h3>
                  <p className="text-white/60">Choose a project from the list to start evaluation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
