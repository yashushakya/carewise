import React, { useState, useEffect } from "react";
import api from "../api";

export default function BookingModal({ doctor, onClose, onSuccess }) {
  const [date, setDate]       = useState("");
  const [slot, setSlot]       = useState("");
  const [reason, setReason]   = useState("");
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError]     = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Day name from date string
  const dayName = date
    ? ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(date).getDay()]
    : "";

  const doctorAvailable = !date || !doctor.workingDays || doctor.workingDays.includes(dayName);

  // Load slots when date changes
  useEffect(() => {
    if (!date || !doctorAvailable) { setSlots([]); setSlot(""); return; }
    setLoading(true);
    setSlot("");
    api.get(`/appointments/slots?doctorId=${doctor.id}&date=${date}`)
      .then((res) => setSlots(res.data.availableSlots))
      .catch(() => setError("Could not load slots."))
      .finally(() => setLoading(false));
  }, [date]);

  async function handleBook() {
    if (!date)             return setError("Please select a date.");
    if (!doctorAvailable)  return setError("Doctor not available on this day.");
    if (!slot)             return setError("Please select a time slot.");
    setBooking(true);
    setError("");
    try {
      await api.post("/appointments", {
        doctorName: doctor.name, doctorId: String(doctor.id),
        specialty: doctor.specialty, hospital: doctor.hospital,
        date, time: slot, reason,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Book Appointment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {/* Doctor info */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm">
          <p className="font-semibold text-slate-800">{doctor.name}</p>
          <p className="text-xs text-primary">{doctor.specialty} · {doctor.hospital}</p>
          <p className="text-xs text-slate-400 mt-1">₹{doctor.fees} · Works: {doctor.workingDays?.join(", ")}</p>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-700 block mb-1">Date</label>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {date && (
            <p className={`text-xs mt-1 ${doctorAvailable ? "text-green-600" : "text-red-500"}`}>
              {dayName} — {doctorAvailable ? "✓ Available" : "✗ Not available"}
            </p>
          )}
        </div>

        {/* Slots */}
        {date && doctorAvailable && (
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 block mb-2">Time Slot</label>
            {loading ? (
              <p className="text-sm text-slate-400">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-red-500">No slots available. Try another date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button key={s} onClick={() => setSlot(s)}
                    className={`text-xs py-2 rounded-lg border transition ${
                      slot === s ? "bg-primary text-white border-primary" : "border-slate-200 text-slate-600 hover:border-primary"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Reason <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input type="text" placeholder="e.g. Fever, Back pain" value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">⚠️ {error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm hover:bg-slate-200 transition">
            Cancel
          </button>
          <button onClick={handleBook} disabled={booking || !slot}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm hover:bg-primary-dark transition disabled:opacity-50">
            {booking ? "Booking..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}