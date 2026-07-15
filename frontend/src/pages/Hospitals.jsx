import React, { useState } from "react";
import { hospitals } from "../data/staticData";

export default function Hospitals() {
  const [search, setSearch] = useState("");

  const filtered = hospitals.filter((h) =>
    !search ||
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Find Hospitals</h1>
      <p className="text-sm text-slate-500 mb-6">{filtered.length} hospitals listed</p>

      <input
        type="text"
        placeholder="Search by hospital name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((h) => (
          <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏥</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{h.name}</h3>
                  {h.emergency && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">24/7 Emergency</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">📍 {h.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              <span>⭐ {h.rating}</span>
              <span>🛏️ {h.beds} beds</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {h.specialties.map((s) => (
                <span key={s} className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <a href={`tel:${h.contact}`}
                className="flex-1 text-center bg-primary text-white text-sm py-2 rounded-lg hover:bg-primary-dark transition">
                📞 Call Hospital
              </a>
              <a href={`https://maps.google.com?q=${encodeURIComponent(h.name + " " + h.city)}`}
                target="_blank" rel="noreferrer"
                className="flex-1 text-center bg-slate-100 text-slate-700 text-sm py-2 rounded-lg hover:bg-slate-200 transition">
                🗺️ Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}