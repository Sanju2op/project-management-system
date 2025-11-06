import React from 'react';
import { useNavigate } from 'react-router-dom';

function GuideDetails() {
  const navigate = useNavigate();

  // Mock data for the assigned guide (replace with actual data fetching)
  const guide = {
    name: 'Ms. Tanvi Patel',
    contact: {
      email: 'tanvipatel@gmail.com',
      phone: '+19 9999999999',
      office: 'staff-Room 204,'
    },
    officeHours: 'Monday to Friday, 9:00 AM - 4:00 PM',
    availability: 'Available for appointments via email or during office hours. Response time: 24-48 hours.',
    specialization: 'Machine Learning, Data Science, Artificial Intelligence',
    expertise: 'Expert in developing AI models for real-world applications, with 10+ years of experience in academic research and industry collaborations.',
    communicationOptions: [
      { type: 'Email', details: 'Primary method for formal communications' },
      { type: 'Phone', details: 'For urgent matters during office hours' },
      { type: 'Office Visit', details: 'Schedule appointments for in-person meetings' },
      { type: 'Video Call', details: 'Available via Zoom for remote consultations' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">Guide Details</h1>

        <div className="space-y-6">
          {/* Guide's Name and Contact Information */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{guide.name}</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium text-accent-teal mb-2">Contact Information</h3>
                <div className="text-white/90 space-y-1">
                  <p><span className="font-semibold">Email:</span> {guide.contact.email}</p>
                  <p><span className="font-semibold">Phone:</span> {guide.contact.phone}</p>
                  <p><span className="font-semibold">Office:</span> {guide.contact.office}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Office Hours and Availability */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Office Hours & Availability</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-medium text-accent-teal mb-2">Office Hours</h4>
                <p className="text-white/90">{guide.officeHours}</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-accent-teal mb-2">Availability</h4>
                <p className="text-white/90">{guide.availability}</p>
              </div>
            </div>
          </div>

          {/* Specialization and Expertise */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Specialization & Expertise</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-medium text-accent-teal mb-2">Specialization</h4>
                <p className="text-white/90">{guide.specialization}</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-accent-teal mb-2">Expertise</h4>
                <p className="text-white/90">{guide.expertise}</p>
              </div>
            </div>
          </div>

          {/* Communication Options */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Communication Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.communicationOptions.map((option, index) => (
                <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-accent-teal mb-2">{option.type}</h4>
                  <p className="text-white/90 text-sm">{option.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
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

export default GuideDetails;
