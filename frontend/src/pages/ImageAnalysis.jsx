import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ImageAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyze() {
    if (!user) return navigate("/login");
    if (!file) return setError("Please select an image");
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/ai/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Image Analysis</h1>
      <p className="text-sm text-slate-500 mb-6">Upload a photo of a skin condition, rash, or injury for AI observations</p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
        ⚠️ <strong>This is not a medical diagnosis.</strong> AI observations are informational only. Always consult a doctor.
      </div>

      {/* Upload Area */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center mb-4">
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover mb-3" />
        ) : (
          <>
            <div className="text-4xl mb-3">📸</div>
            <p className="text-slate-500 text-sm">Upload a clear photo of the affected area</p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="img-upload" />
        <label htmlFor="img-upload" className="mt-3 cursor-pointer inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-5 py-2 rounded-xl transition">
          {preview ? "Change Image" : "Choose Image"}
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>

      {result && (
        <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">🤖 AI Observations</h2>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result}</div>
          <p className="mt-4 text-xs text-amber-600">⚠️ This is not a medical diagnosis. Please consult a qualified doctor.</p>
        </div>
      )}
    </div>
  );
}