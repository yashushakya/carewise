import React, { useState, useEffect } from "react";
import api from "../api";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "", age: "", gender: "", bloodGroup: "",
    height: "", weight: "", allergies: "", diseases: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/profile").then((r) => {
      const d = r.data;
      setProfile({
        name: d.name || "",
        age: d.age || "",
        gender: d.gender || "",
        bloodGroup: d.bloodGroup || "",
        height: d.height || "",
        weight: d.weight || "",
        allergies: (d.allergies || []).join(", "),
        diseases: (d.diseases || []).join(", "),
      });
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", {
        ...profile,
        age: Number(profile.age) || undefined,
        height: Number(profile.height) || undefined,
        weight: Number(profile.weight) || undefined,
        allergies: profile.allergies ? profile.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        diseases: profile.diseases ? profile.diseases.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Health Profile</h1>
      <p className="text-sm text-slate-500 mb-6">Your health information helps the AI give better advice</p>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        {/* Basic Info */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-1">Full Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Age</label>
              <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="25"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Gender</label>
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select</option>
                {["Male", "Female", "Other"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Blood Group</label>
              <select value={profile.bloodGroup} onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Physical Stats */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Physical Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Height (cm)</label>
              <input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                placeholder="170"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Weight (kg)</label>
              <input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                placeholder="65"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          {profile.height && profile.weight && (
            <p className="text-xs text-slate-500 mt-2">
              BMI: <span className="font-semibold text-primary">{(profile.weight / (profile.height / 100) ** 2).toFixed(1)}</span>
            </p>
          )}
        </div>

        {/* Medical History */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Medical History</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Allergies</label>
              <input value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                placeholder="Penicillin, Peanuts, Dust (comma separated)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Existing Diseases / Conditions</label>
              <input value={profile.diseases} onChange={(e) => setProfile({ ...profile, diseases: e.target.value })}
                placeholder="Diabetes, Hypertension (comma separated)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl">
            ✅ Profile saved successfully!
          </div>
        )}
       <button
  type="submit"
  disabled={saving}
  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
>
  {saving ? "Saving..." : "Save Profile"}
</button>
      </form>
    </div>
  );
}