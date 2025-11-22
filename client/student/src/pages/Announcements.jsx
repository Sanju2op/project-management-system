import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { announcementAPI } from "../services/api"; // Assuming this is correct

// --- Helper Components ---

// A simple Skeleton Loader for a better UX while fetching data
const AnnouncementSkeleton = () => (
  <div className="animate-pulse bg-gray-700/50 p-4 rounded-lg h-24">
    <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-600 rounded w-1/4 mb-4"></div>
    <div className="h-3 bg-gray-600 rounded w-full"></div>
  </div>
);

// --- Main Component ---

function Announcements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🤖 AI/ML inspired feature: Mock Sentiment Analysis
  // In a real app, this would be an API call to a Model (e.g., using TensorFlow.js or a cloud API)
  const getSentimentTag = (content) => {
    const positiveKeywords = [
      "great",
      "success",
      "celebrate",
      "opportunity",
      "new feature",
    ];
    const negativeKeywords = [
      "delay",
      "issue",
      "warning",
      "critical",
      "outage",
    ];

    const text = content.toLowerCase();

    // Simple count-based sentiment
    const isPositive = positiveKeywords.some((keyword) =>
      text.includes(keyword)
    );
    const isNegative = negativeKeywords.some((keyword) =>
      text.includes(keyword)
    );

    if (isPositive && !isNegative)
      return { tag: "Positive", color: "text-green-400" };
    if (isNegative && !isPositive)
      return { tag: "Important", color: "text-red-400" };
    return { tag: "Neutral", color: "text-blue-400" };
  };

  // --- Data Fetching Effect ---

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        // Simulating network delay for better visualization of the skeleton loader
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const data = await announcementAPI.getAll();

        const formatted = data.map((a) => ({
          id: a._id,
          title: a.title,
          content: a.message,
          date: a.date?.slice(0, 10),
          category: "Admin Announcement",
          // Adding the mock sentiment analysis on load
          sentiment: getSentimentTag(a.message || ""),
        }));

        setAnnouncements(formatted);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // --- Search/Filter Logic ---

  const filteredAnnouncements = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();

    if (!lowerCaseSearch) {
      return announcements;
    }

    return announcements.filter(
      (ann) =>
        ann.title.toLowerCase().includes(lowerCaseSearch) ||
        ann.content.toLowerCase().includes(lowerCaseSearch)
    );
  }, [announcements, searchTerm]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        {/* HEADER SECTION WITH BACK BUTTON */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold text-teal-400 tracking-tight">
            📢 Announcements
          </h1>

          {/* MOVED BACK BUTTON */}
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-gray-700 text-white py-2 px-6 rounded-full font-bold border border-gray-600 shadow-md hover:bg-gray-600 transition duration-300 flex items-center justify-center text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              ></path>
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search announcements by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:ring-teal-500 focus:border-teal-500 transition duration-200 placeholder-gray-500"
          />
        </div>

        {/* Admin Announcements Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-teal-500/30">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">📝</span> Admin Announcements
            <span className="text-sm ml-auto text-gray-400">
              {filteredAnnouncements.length} results
            </span>
          </h2>

          <div className="space-y-4">
            {isLoading ? (
              // Display Skeletons while loading
              <>
                <AnnouncementSkeleton />
                <AnnouncementSkeleton />
                <AnnouncementSkeleton />
              </>
            ) : filteredAnnouncements.length === 0 ? (
              // Empty State (No Announcements)
              <div className="text-center p-10 bg-gray-700/50 rounded-xl">
                <p className="text-gray-400 text-lg">
                  {searchTerm
                    ? `No announcements match the search term "${searchTerm}".`
                    : "No announcements have been posted yet."}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try a different search or check back later.
                </p>
              </div>
            ) : (
              // Display Filtered Announcements
              filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-gray-700/30 p-5 rounded-xl cursor-pointer hover:bg-teal-500/10 transition duration-300 transform hover:scale-[1.01] shadow-lg"
                  onClick={() => setSelectedAnnouncement(ann)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-white truncate pr-4">
                      {ann.title}
                    </h3>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full border ${ann.sentiment.color} border-current opacity-80 flex-shrink-0`}
                    >
                      {ann.sentiment.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    {ann.date} | {ann.category}
                  </p>
                  <p className="text-gray-300 line-clamp-2">
                    {ann.content.substring(0, 150)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcement Details Modal/Panel */}
        {selectedAnnouncement && (
          <div
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={() => setSelectedAnnouncement(null)} // Close on outside click
          >
            <div
              className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-teal-400/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
            >
              <h2 className="text-3xl font-extrabold text-teal-400 mb-2">
                {selectedAnnouncement.title}
              </h2>

              <div className="flex items-center mb-4 space-x-4">
                <p className="text-gray-400 text-sm">
                  <span className="font-bold">Date:</span>{" "}
                  {selectedAnnouncement.date}
                </p>
                <span className="text-gray-500">|</span>
                <p className="text-gray-400 text-sm">
                  <span className="font-bold">Category:</span>{" "}
                  {selectedAnnouncement.category}
                </p>
                <span className="text-gray-500">|</span>
                <span
                  className={`text-sm font-bold ${selectedAnnouncement.sentiment.color}`}
                >
                  Sentiment: {selectedAnnouncement.sentiment.tag}
                </span>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4 text-gray-200 whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </div>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="mt-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-6 rounded-full font-bold shadow-lg hover:shadow-teal-500/50 transition duration-300 transform hover:scale-[1.02]"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* REMOVED the old back button div here */}
      </div>
    </div>
  );
}

export default Announcements;
