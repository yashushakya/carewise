import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!user) return navigate("/login");
    if (!file) return setError("Please select a PDF file");
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("report", file);
      const res = await api.post("/ai/report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Report Analysis</h1>
      <p className="text-sm text-slate-500 mb-6">Upload a medical PDF report and get an AI-powered plain-language explanation</p>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
        ⚠️ <strong>This is not a medical diagnosis.</strong> AI analysis is for informational purposes only. Always consult a qualified doctor.
      </div>

      {/* Upload Area */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center mb-4">
        <div className="text-4xl mb-3">📄</div>
        <p className="text-slate-600 text-sm mb-4">Upload your blood report, scan result, or any medical PDF</p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => { setFile(e.target.files[0]); setResult(null); setError(""); }}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-5 py-2 rounded-xl transition">
          Choose PDF File
        </label>
        {file && <p className="mt-3 text-sm text-primary">✓ {file.name}</p>}
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition disabled:opacity-50"
      >
        {loading ? "Analyzing... (this may take a moment)" : "Analyze Report"}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">🤖 AI Summary</h2>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result.summary}</div>
          <p className="mt-4 text-xs text-amber-600">⚠️ This is not a medical diagnosis. Please consult a qualified doctor.</p>
        </div>
      )}
    </div>
  );
}