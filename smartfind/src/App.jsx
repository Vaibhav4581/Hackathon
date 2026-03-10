import { useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";
import Feed from "./pages/feed";

// Import your sub-pages
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import "./App.css";

// --- GLOBAL NAVBAR COMPONENT ---
// --- GLOBAL NAVBAR COMPONENT ---
// --- GLOBAL NAVBAR COMPONENT ---
const Navbar = () => (
  <nav className="navbar">
    {/* LEFT: Logo and Brand in a straight line */}
    <div className="nav-brand-group">
      <Link to="/" className="nav-logo-link">
        <svg className="nav-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
          <circle cx="12" cy="12" r="3" fill="#8FB3E2" />
        </svg>
        <span className="logo-text">
          SMART<span style={{ color: "#8FB3E2" }}>FIND</span>
        </span>
      </Link>
    </div>

    {/* RIGHT: Profile Icon */}
    <Link to="/profile" className="profile-trigger">
      <div className="avatar-glow"></div>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </Link>
  </nav>
);
// --- HOME PAGE COMPONENT ---
const Home = () => {
  return (
    <main className="hero-section">
      <div className="glow-effect"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-card"
      >
        <div className="badge border border-[#8FB3E2]/30 text-[#8FB3E2] bg-[#1E2E4F]/50 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
          Campus Lost & Found Network
        </div>

        <h1 className="title text-[#D9E1F1] text-5xl md:text-6xl font-black leading-tight mb-6">
          Reunite with <br/> your <span className="highlight" style={{ color: "#8FB3E2" }}>belongings.</span>
        </h1>
        
        <p className="subtitle text-[#D9E1F1]/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Did you drop your keys at the library or find a student ID in the cafeteria? 
          SmartFind is our intelligent campus hub to report and recover items instantly.
        </p>

        <div className="button-group flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/lost" className="btn btn-primary bg-[#8FB3E2] text-[#192338] px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D9E1F1] transition-all shadow-lg shadow-[#192338]/50">
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            I Lost Something
          </Link>

          <Link to="/found" className="btn btn-secondary border border-[#31487A] text-[#D9E1F1] px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-[#8FB3E2] transition-all shadow-lg">
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            I Found Something
          </Link>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <div className="stats-container mt-20 flex items-center justify-center gap-10">
        <div className="stat-box text-center">
          <span className="stat-number block text-2xl font-black text-[#8FB3E2]">142</span>
          <span className="stat-label text-[10px] uppercase tracking-tighter text-[#D9E1F1]/50 font-bold">Items Found</span>
        </div>
        <div className="divider h-10 w-[1px] bg-[#31487A]"></div>
        <div className="stat-box text-center">
          <span className="stat-number block text-2xl font-black text-[#8FB3E2]">Active</span>
          <span className="stat-label text-[10px] uppercase tracking-tighter text-[#D9E1F1]/50 font-bold">Campus Grid</span>
        </div>
      </div>
    </main>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = {
    fullScreen: { enable: true, zIndex: 0 },
    fpsLimit: 120,
    particles: {
      color: { value: "#8FB3E2" },
      links: { color: "#D9E1F1", distance: 180, enable: true, opacity: 0.2, width: 1 },
      move: { enable: true, speed: 0.8 },
      number: { density: { enable: true, area: 800 }, value: 45 },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  return (
    <Router>
      <div className="app-container">
        <Particles id="tsparticles" init={particlesInit} options={particleOptions} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/found" element={<Found />} />
        </Routes>
      </div>
    </Router>
  );
}