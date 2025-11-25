// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { documentAPI } from "../services/api";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const normalizePath = (filePath = "") => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  const sanitized = filePath.replace(/^\/+/, "");
  return `${SERVER_BASE_URL.replace(/\/+$/, "")}/${sanitized}`;
};

export default function StudentDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await documentAPI.getAll();
        const docs = Array.isArray(response?.data) ? response.data : response;
        setDocuments(docs || []);
      } catch (err) {
        console.error("Failed to load documents", err);
        setError(err.message || "Failed to load documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-4 py-20 text-white/80">
          <Loader2 className="animate-spin" size={36} />
          <p>Loading documents...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-red-300">
          <AlertCircle size={40} />
          <p>{error}</p>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-white/70">
          <FileText size={40} className="text-white/50" />
          <p>No documents have been published yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => {
          const downloadUrl = normalizePath(doc.filePath);
          return (
            <div
              key={doc._id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FileText className="text-blue-300" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{doc.title || "Untitled document"}</h3>
                  <p className="text-white/60 text-sm">
                    {doc.uploadedAt
                      ? new Date(doc.uploadedAt).toLocaleDateString()
                      : "No date"}
                  </p>
                </div>
              </div>

              <div className="text-white/70 text-sm line-clamp-2 mb-4">
                {doc.description || doc.fileName || "Document shared by administration"}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{doc.fileName}</span>
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-200 hover:bg-blue-500/30 transition-colors duration-200"
                  >
                    <Download size={16} />
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-red-300">File unavailable</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-right">
            <p className="text-sm text-white/60">Shared by Administration</p>
            <h1 className="text-3xl font-bold">Documents & Resources</h1>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg shadow-2xl">
          <p className="text-white/70 mb-6">
            Browse and download official resources uploaded by the admin team. Stay up to date
            with submission templates, guidelines, and important references for your project work.
          </p>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

