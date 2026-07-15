import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/appointments").then((r) => setAppointments(r.data.slice(0, 3)));
    api.get("/profile").then((r) => setProfile(r.data));
  }, []);

  const profileComplete = profile?.age && profile?.bloodGroup && profile?.gender;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-sky-400 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-xl font-bold">Hello, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-sky-100 text-sm mt-1">Stay on top of your health with CareWise</p>
        {!profileComplete && (
          <Link to="/profile" className="mt-3 inline-block bg-white text-primary text-sm font-medium px-4 py-1.5 rounded-full hover:bg-sky-50 transition">
            Complete Health Profile →
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "AI Assistant", icon: "🤖", link: "/assistant", color: "bg-emerald-50 text-emerald-700" },
          { label: "Find Doctors", icon: "👨‍⚕️", link: "/doctors", color: "bg-sky-50 text-sky-700" },
          { label: "My Profile", icon: "👤", link: "/profile", color: "bg-violet-50 text-violet-700" },
          { label: "Analyze Report", icon: "📄", link: "/reports", color: "bg-amber-50 text-amber-700" },
        ].map((a) => (
          <Link key={a.label} to={a.link} className={`${a.color} rounded-2xl p-4 text-center hover:shadow-md transition`}>
            <div className="text-3xl mb-1">{a.icon}</div>
            <div className="text-xs font-semibold">{a.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Health Profile Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800">Health Profile</h2>
            <Link to="/profile" className="text-xs text-primary hover:underline">Edit</Link>
          </div>
          {profile ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Age", profile.age ? `${profile.age} years` : "—"],
                ["Gender", profile.gender || "—"],
                ["Blood Group", profile.bloodGroup || "—"],
                ["Height", profile.height ? `${profile.height} cm` : "—"],
                ["Weight", profile.weight ? `${profile.weight} kg` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-2">
                  <div className="text-xs text-slate-400">{k}</div>
                  <div className="font-medium text-slate-700">{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Loading...</p>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800">Recent Appointments</h2>
            <Link to="/appointments" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">No appointments yet</p>
              <Link to="/doctors" className="text-primary text-sm hover:underline mt-1 block">Find a doctor</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a._id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="text-2xl">📅</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{a.doctorName}</p>
                    <p className="text-xs text-slate-500">{a.date} · {a.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.status === "Confirmed" ? "bg-green-100 text-green-700" :
                    a.status === "Cancelled" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}