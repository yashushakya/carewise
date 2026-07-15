import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { specialties } from "../data/staticData";

export default function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/doctors?search=${encodeURIComponent(search)}`);
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Emergency Button */}
          <div className="flex justify-end mb-4">
            <a
              href="tel:108"
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-md transition"
            >
              🚑 Emergency 108
            </a>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Your health, <span className="text-primary">guided</span> by AI.
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Describe your symptoms, find the right doctor, and book instantly. CareWise is your 24/7 health companion.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 flex gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search doctors, specialties, cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition">
              Search
            </button>
          </form>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/assistant" className="bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 transition">
              🤖 Ask AI Assistant
            </Link>
            <Link to="/doctors" className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition">
              👨‍⚕️ Find Doctors
            </Link>
            <Link to="/hospitals" className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition">
              🏥 Find Hospitals
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-white text-center">
          {[["500+", "Doctors"], ["50+", "Hospitals"], ["10K+", "Patients Helped"]].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold">{num}</div>
              <div className="text-sm text-sky-100">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Browse by Specialty</h2>
        <p className="text-slate-500 mb-6 text-sm">Find the right expert for your health concern</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {specialties.map((s) => (
            <Link
              key={s.name}
              to={`/doctors?specialty=${encodeURIComponent(s.name)}`}
              className="bg-white border border-slate-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-primary/30 transition group"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-xs font-semibold text-slate-700 group-hover:text-primary transition">{s.name}</div>
              <div className="text-xs text-slate-400 mt-1">{s.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">How CareWise Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "💬", step: "1", title: "Describe Symptoms", desc: "Tell our AI what you're feeling" },
              { icon: "🔍", step: "2", title: "Get Guidance", desc: "AI suggests possible causes & first aid" },
              { icon: "👨‍⚕️", step: "3", title: "Find Doctor", desc: "Browse specialists near you" },
              { icon: "📅", step: "4", title: "Book Instantly", desc: "Schedule your appointment in seconds" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="w-7 h-7 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center mx-auto mb-2">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Powered by AI</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: "🤖", title: "AI Health Assistant", desc: "Chat naturally about your symptoms and get instant guidance, first aid tips, and doctor recommendations.", link: "/assistant", cta: "Start Chat" },
            { icon: "📄", title: "Report Analysis", desc: "Upload your medical reports (PDF) and get a plain-language summary with AI insights.", link: "/reports", cta: "Analyze Report" },
            { icon: "📸", title: "Image Analysis", desc: "Upload a photo of a skin condition, rash, or injury and get AI observations with specialist recommendations.", link: "/image-analysis", cta: "Analyze Image" },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{f.desc}</p>
              <Link to={f.link} className="text-sm text-primary font-medium hover:underline">{f.cta} →</Link>
            </div>
          ))}
        </div>
      </section>


      

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8 px-4 text-center text-sm">
        <p className="text-white font-semibold text-lg mb-2">CareWise</p>
        <p>Your AI-powered healthcare companion</p>
        <p className="mt-2 text-xs text-slate-500">⚠️ CareWise is not a substitute for professional medical advice. Always consult a qualified doctor.</p>
      </footer>
    </div>
  );
}