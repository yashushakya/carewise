import React from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition">
      {/* Avatar + Name */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
          👨‍⚕️
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
          <p className="text-sm text-primary">{doctor.specialty}</p>
          <p className="text-xs text-slate-500 mt-0.5">{doctor.hospital} · {doctor.city}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
        <span>⭐ {doctor.rating}</span>
        <span>🕒 {doctor.experience} yrs</span>
        <span>💰 ₹{doctor.fees}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {onBook && (
         
          <button
  onClick={() => onBook(doctor)}
  className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg"
>
  Book Appointment
</button>
        )}
        <a
          href={`tel:${doctor.contact}`}
          className="flex-1 text-center bg-slate-100 text-slate-700 text-sm py-2 rounded-lg hover:bg-slate-200 transition"
        >
          📞 Call
        </a>
      </div>
    </div>
  );
}