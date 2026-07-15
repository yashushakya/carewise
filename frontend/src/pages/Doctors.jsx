import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doctors, specialties } from "../data/staticData";
import DoctorCard from "../components/DoctorCard";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../context/AuthContext";

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filtered = doctors.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !selectedSpecialty || d.specialty === selectedSpecialty;
    return matchSearch && matchSpec;
  });

  function handleBook(doctor) {
    if (!user) return navigate("/login");
    setBookingDoctor(doctor);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Find Doctors</h1>
      <p className="text-sm text-slate-500 mb-6">{filtered.length} doctors available</p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, specialty, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
        {(search || selectedSpecialty) && (
          <button onClick={() => { setSearch(""); setSelectedSpecialty(""); }}
            className="text-sm text-slate-500 hover:text-red-500 px-3">Clear</button>
        )}
      </div>

      {/* Specialty Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {specialties.slice(0, 10).map((s) => (
          <button key={s.name}
            onClick={() => setSelectedSpecialty(selectedSpecialty === s.name ? "" : s.name)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
              selectedSpecialty === s.name
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary"
            }`}>
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* Doctor Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🔍</div>
          <p>No doctors found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DoctorCard key={d.id} doctor={d} onBook={handleBook} />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => {
            setBookingDoctor(null);
            setBookingSuccess(true);
            setTimeout(() => setBookingSuccess(false), 4000);
          }}
        />
      )}

      {/* Success Toast */}
      {bookingSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg">
          ✅ Appointment booked! View in <a href="/appointments" className="underline font-medium">Appointments</a>
        </div>
      )}
    </div>
  );
}