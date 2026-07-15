import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

// Simple reschedule modal — no extra file, no extra abstractions
function RescheduleModal({ appt, onClose, onDone }) {
  const [date, setDate]   = useState("");
  const [slot, setSlot]   = useState("");
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setSlot("");
    api.get(`/appointments/slots?doctorId=${appt.doctorId}&date=${date}`)
      .then((res) => setSlots(res.data.availableSlots))
      .catch(() => setError("Could not load slots."))
      .finally(() => setLoading(false));
  }, [date]);

  async function save() {
    if (!date || !slot) return setError("Select date and time.");
    setSaving(true);
    try {
      await api.put(`/appointments/${appt._id}/reschedule`, { newDate: date, newTime: slot, reason });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Reschedule</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm">
          <p className="font-medium text-slate-800">{appt.doctorName}</p>
          <p className="text-xs text-slate-500">Currently: {appt.date} at {appt.time}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">New Date</label>
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {date && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">New Time</label>
              {loading ? <p className="text-sm text-slate-400">Loading...</p>
              : slots.length === 0 ? <p className="text-sm text-red-500">No slots. Try another date.</p>
              : (
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

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Reason (optional)</label>
            <input type="text" placeholder="Why rescheduling?" value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">⚠️ {error}</p>}

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={save} disabled={saving || !slot}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Status badge colors
const STATUS_COLORS = {
  Confirmed:   "bg-green-100 text-green-700",
  Rescheduled: "bg-blue-100 text-blue-700",
  Cancelled:   "bg-red-100 text-red-600",
  Completed:   "bg-slate-100 text-slate-500",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [reschedule, setReschedule] = useState(null); // appointment being rescheduled
  const [filter, setFilter]     = useState("all");
  const [toast, setToast]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      load();
      flash("Appointment cancelled.");
    } catch (err) {
      flash(err.response?.data?.message || "Could not cancel.");
    }
  }

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  const filtered = appointments.filter((a) => {
    if (filter === "upcoming")  return ["Confirmed","Rescheduled"].includes(a.status);
    if (filter === "completed") return a.status === "Completed";
    if (filter === "cancelled") return a.status === "Cancelled";
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-sm text-slate-500">{appointments.length} total</p>
        </div>
        <Link to="/doctors" className="bg-primary text-white text-sm px-4 py-2 rounded-xl hover:bg-primary-dark transition">
          + Book New
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all","upcoming","completed","cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full capitalize transition ${
              filter === f ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center py-16 text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📅</p>
          <p className="text-slate-500 mb-4">No appointments found.</p>
          <Link to="/doctors" className="bg-primary text-white px-5 py-2 rounded-xl text-sm">Find a Doctor</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">

              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-lg flex-shrink-0">👨‍⚕️</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{a.doctorName}</p>
                    <p className="text-xs text-primary">{a.specialty}</p>
                    <p className="text-xs text-slate-400">{a.hospital}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[a.status] || "bg-slate-100"}`}>
                  {a.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
                <span>📅 {a.date}</span>
                <span>🕒 {a.time}</span>
                {a.reason && <span>📝 {a.reason}</span>}
              </div>

              {a.rescheduleHistory?.length > 0 && (
                <p className="mt-1 text-xs text-slate-400">
                  🔄 Rescheduled {a.rescheduleHistory.length}x — originally {a.rescheduleHistory[0].previousDate}
                </p>
              )}

              {["Confirmed","Rescheduled"].includes(a.status) && (
                <div className="flex gap-4 mt-3">
                  <button onClick={() => setReschedule(a)} className="text-xs text-blue-500 hover:underline">
                    🔄 Reschedule
                  </button>
                  <button onClick={() => cancel(a._id)} className="text-xs text-red-400 hover:underline">
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reschedule && (
        <RescheduleModal
          appt={reschedule}
          onClose={() => setReschedule(null)}
          onDone={() => { setReschedule(null); load(); flash("✅ Rescheduled!"); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}