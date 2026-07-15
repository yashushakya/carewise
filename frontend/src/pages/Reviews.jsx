import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import { doctors, hospitals } from "../data/staticData";

export default function Reviews() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();





  const [reviews, setReviews] = useState([]);

  const doctorFromUrl = searchParams.get("doctor");

const [tab, setTab] = useState(
  doctorFromUrl ? "doctor" : "platform"
);

const [form, setForm] = useState({
  type: doctorFromUrl ? "doctor" : "platform",
  targetName: doctorFromUrl || "CareWise",
  rating: 5,
  comment: ""
});
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/reviews?type=${tab}`).then((r) => setReviews(r.data));
  }, [tab, success]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return alert("Please log in to leave a review");
    setSubmitting(true);
    try {
      await api.post("/reviews", { ...form, userName: user.name });
      setSuccess(true);
      setForm({ ...form, comment: "", rating: 5 });
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  const tabs = [
    { key: "platform", label: "CareWise Reviews" },
    { key: "doctor", label: "Doctor Reviews" },
    { key: "hospital", label: "Hospital Reviews" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Reviews</h1>
      <p className="text-sm text-slate-500 mb-6">What patients are saying</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-xl transition ${tab === t.key ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Write Review Form */}
      {user && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab !== "platform" && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  {tab === "doctor" ? "Select Doctor" : "Select Hospital"}
                </label>
                <select value={form.targetName}
                  onChange={(e) => setForm({ ...form, targetName: e.target.value, type: tab })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select...</option>
                  {(tab === "doctor" ? doctors : hospitals).map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Rating</label>
              <StarRating rating={form.rating} onRate={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Your Review</label>
              <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Share your experience..."
                rows={3} required
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            {success && <p className="text-green-600 text-sm">✅ Review submitted!</p>}
            <button type="submit" disabled={submitting}
              className="bg-primary text-white text-sm px-6 py-2 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-2">💬</div>
          <p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  {(r.userName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.userName || "Anonymous"}</p>
                  {r.targetName && <p className="text-xs text-slate-500">{r.targetName}</p>}
                </div>
                <div className="ml-auto">
                  <StarRating rating={r.rating} />
                </div>
              </div>
              <p className="text-sm text-slate-600">{r.comment}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}