import React, { useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";

// --- PAGE IMPORTS ---
import Lost from "./pages/lost";
import Found from "./pages/found";
import Feed from "./pages/feed";
import Login from "./Login"; 
import Profile from "./Profile"; 

// --- CSS IMPORT ---
import "./App.css";

// --- GLOBAL NAVBAR COMPONENT ---
const Navbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <nav className="navbar" style={{ position: 'relative', zIndex: 10 }}>
      <div className="nav-brand-group">
        <Link to="/home" className="nav-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <svg className="nav-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '32px', marginRight: '10px' }}>
            <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
            <circle cx="12" cy="12" r="3" fill="#8FB3E2" />
          </svg>
          <span className="logo-text">
            SMART<span style={{ color: "#8FB3E2" }}>FIND</span>
          </span>
        </Link>
      </div>

      {!isLoginPage && (
        <Link to="/profile" className="profile-trigger">
          <div className="avatar-glow"></div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      )}
    </nav>
  );
};

// --- HOME PAGE COMPONENT ---
const Home = () => {
  return (
    <main className="hero-section">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-card"
      >
        <div className="badge">Campus Lost & Found Network</div>
        
        <h1 className="title">
          Reunite with <br/> your <span className="highlight">belongings.</span>
        </h1>
        
        <p className="subtitle">
          SmartFind is our intelligent campus hub to report and recover items instantly.
        </p>

        <div className="button-group">
          <Link to="/lost" className="btn btn-primary">
            I Lost Something
          </Link>
          <Link to="/found" className="btn btn-secondary">
            I Found Something
          </Link>
        </div>
        
        <Link to="/feed" className="browse-link" style={{ marginTop: '30px', display: 'inline-block' }}>
          Browse Recent Reports →
        </Link>
      </motion.div>
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
      links: { 
        color: "#D9E1F1", 
        distance: 180, 
        enable: true, 
        opacity: 0.2, 
        width: 1 
      },
      move: { 
        enable: true, 
        speed: 0.8,
        direction: "none",
        outModes: { default: "bounce" }
      },
      number: { 
        density: { enable: true, area: 800 }, 
        value: 50 
      },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  return (
    <Router>
      <div className="app-container" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#192338', overflowX: 'hidden' }}>
        
        {/* GLOBAL PARTICLES LAYER */}
        <Particles 
          id="tsparticles" 
          init={particlesInit} 
          options={particleOptions} 
        />
        
        <Navbar />

        <div className="content-wrapper" style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Login />} /> 
            <Route path="/home" element={<Home />} />
            <Route path="/lost" element={<Lost />} />
            <Route path="/found" element={<Found />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}