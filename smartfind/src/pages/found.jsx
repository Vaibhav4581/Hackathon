import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { supabase } from "../supabaseClient"; 

// Helper Typewriter Component
const Typewriter = ({ text, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return <span>{displayedText}</span>;
};

const Found = () => {
  // --- STATES ---
  const [step, setStep] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState(null); // Track the report ID we just created
  const [formData, setFormData] = useState({
    title: "",
    type: "Electronics",
    color: "",
    location: "",
    time: "",
    status: "Found",
    image: null,
  });

  // --- Particles Configuration ---
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

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const questions = [
    { id: "image", label: "Upload Photo of Item Found", type: "file", name: "image" },
    { id: "title", label: "What did you find?", type: "text", placeholder: "e.g. Silver Keychain", name: "title" },
    { id: "type", label: "Category", type: "select", options: ["Electronics", "Personal", "Documents", "Other"], name: "type" },
    { id: "color", label: "Primary Color", type: "text", placeholder: "e.g. Metallic Blue", name: "color" },
    { id: "location", label: "Where was it found?", type: "text", placeholder: "e.g. Cafeteria Entrance", name: "location" },
    { id: "time", label: "Approximate Time Found", type: "time", name: "time" },
  ];

  const progressPercentage = ((step) / questions.length) * 100;

  const generateSummary = () => {
    return `I've discovered a ${formData.color.toLowerCase()} ${formData.title.toLowerCase()} at ${formData.location}. Broadcasting to the campus network...`;
  };

  const submitToSupabase = async () => {
    try {
      const formDataToSend = new FormData();
      const combinedDescription = `${formData.title} (${formData.color}) found at ${formData.location}`;
      formDataToSend.append("description", combinedDescription);
      formDataToSend.append("type", "found");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in first!");
        return;
      }
      
      formDataToSend.append("email", user.email);
      if (formData.image) formDataToSend.append("image", formData.image);

      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        // Capture the ID of the new entry created by the backend
        setNewlyCreatedId(result.id);

        if (result.status === "item_found") {
          setMatchData(result.match_details);
          setShowMatchScreen(true);
        } else {
          nextStep(); 
        }
      } else {
        throw new Error(result.message || "AI Server error");
      }
    } catch (error) {
      console.error("Submission Error:", error.message);
      alert("Error: AI Backend is offline.");
    }
  };

  // --- DATABASE CLEANUP LOGIC ---
  const handleMatchCleanup = async () => {
    const idsToDelete = [];
    if (matchData?.id) idsToDelete.push(matchData.id);
    if (newlyCreatedId) idsToDelete.push(newlyCreatedId);

    if (idsToDelete.length > 0) {
      const { error } = await supabase
        .from("items")
        .delete()
        .in("id", idsToDelete);

      if (error) {
        console.error("Database Cleanup Error:", error.message);
      }
    }
    // REDIRECT TO HOME
    window.location.href = "/home";
  };

  // --- MATCH OVERLAY COMPONENT ---
  const MatchOverlay = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-[#192338]/95 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="glass-card max-w-2xl w-full p-10 border-2 border-[#8FB3E2] shadow-[0_0_50px_rgba(143,179,226,0.3)] text-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[#8FB3E2] font-black tracking-[0.5em] uppercase text-xs">AI Match Protocol Active</span>
          <h2 className="text-4xl font-black text-white mt-4 mb-2 tracking-tighter uppercase italic">Potential Owner Found!</h2>
          <p className="text-[#D9E1F1]/60 italic mb-8 text-sm">Our neural network matched these reports. Both will be removed from the grid.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
            <div className="space-y-3">
              <p className="text-[#8FB3E2] text-[10px] font-bold uppercase tracking-widest">Item You Found</p>
              <div className="h-40 rounded-2xl bg-[#1E2E4F] border border-[#8FB3E2]/10 overflow-hidden">
                 {formData.image ? (
                   <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" alt="found item" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📷</div>
                 )}
              </div>
              <p className="text-white text-xs font-bold truncate">{formData.title}</p>
            </div>

            <div className="space-y-3">
              <p className="text-[#8FB3E2] text-[10px] font-bold uppercase tracking-widest">Lost Report Match</p>
              <div className="h-40 rounded-2xl bg-[#1E2E4F] border border-[#8FB3E2]/10 overflow-hidden">
                 {matchData?.image_path ? (
                   <img src={`http://127.0.0.1:8000/${matchData.image_path}`} className="w-full h-full object-cover" alt="lost item match" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📡</div>
                 )}
              </div>
              <p className="text-white text-xs font-bold truncate">{matchData?.description?.split(" - ")[0] || "Lost Item"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[#D9E1F1] text-xs leading-relaxed">
              Handshake notification sent to: <br/>
              <span className="text-[#8FB3E2] font-mono font-bold">{matchData?.email}</span>
            </p>
            <button 
              onClick={handleMatchCleanup}
              className="bg-[#8FB3E2] text-[#192338] px-10 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform text-xs"
            >
              Resolve & Clear Both from Grid
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
      <Particles id="tsparticles" init={particlesInit} options={particleOptions} />
      
      {showMatchScreen && <MatchOverlay />}

      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div
            key={questions[step].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card w-full max-w-lg p-10 text-center relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#8FB3E2]/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-[#8FB3E2] shadow-[0_0_15px_#8FB3E2]"
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-[#8FB3E2] text-[10px] font-black tracking-widest uppercase">
                Step {step + 1} of {questions.length}
              </span>
              {step > 0 && (
                <button onClick={prevStep} className="text-[#8FB3E2]/40 text-[10px] font-bold uppercase tracking-widest hover:text-[#D9E1F1] transition-colors">← Back</button>
              )}
            </div>

            <h2 className="text-2xl font-bold text-[#D9E1F1] mb-8">{questions[step].label}</h2>

            {questions[step].type === "file" ? (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#8FB3E2]/20 rounded-2xl cursor-pointer hover:bg-[#8FB3E2]/5 transition-all">
                  <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">Select Image</span>
                  <input type="file" className="hidden" 
                    onChange={(e) => {
                      if(e.target.files[0]) {
                          setFormData({ ...formData, image: e.target.files[0] });
                          nextStep();
                      }
                    }} 
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                  />
                </label>
                <button onClick={nextStep} className="text-[#D9E1F1]/40 text-xs font-bold uppercase tracking-widest hover:text-[#8FB3E2] transition-colors">Skip (Enter)</button>
              </div>
            ) : questions[step].type === "select" ? (
              <div className="space-y-6 text-center">
                <select 
                  autoFocus
                  className="w-full bg-[#1E2E4F] border-2 border-[#31487A] p-4 rounded-xl text-[#D9E1F1] outline-none text-center appearance-none"
                  value={formData[questions[step].name]}
                  onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && nextStep()}
                >
                  {questions[step].options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <button onClick={nextStep} className="bg-[#8FB3E2] text-[#192338] px-12 py-3 rounded-full font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Next</button>
              </div>
            ) : (
              <div className="space-y-6">
                <input autoFocus type={questions[step].type} placeholder={questions[step].placeholder} 
                  className="w-full bg-transparent border-b-2 border-[#8FB3E2]/30 p-4 text-[#D9E1F1] outline-none text-xl text-center focus:border-[#8FB3E2] transition-colors"
                  value={formData[questions[step].name]}
                  onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        nextStep();
                    }
                  }} 
                />
                <button onClick={nextStep} className="bg-[#8FB3E2] text-[#192338] px-12 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">Next</button>
              </div>
            )}
          </motion.div>
        ) : step === questions.length ? (
          <motion.div key="summary-step" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg p-12 text-center border-2 border-[#8FB3E2]/20 z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#8FB3E2] shadow-[0_0_15px_#8FB3E2]" />
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-[#8FB3E2] animate-pulse" />
              <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">AI Cataloging...</span>
            </div>
            <div className="min-h-[100px] flex items-center justify-center text-xl italic font-medium text-[#D9E1F1] leading-relaxed">
              "<Typewriter text={generateSummary()} />"
            </div>
            <div className="mt-8 space-y-4">
              <button 
                onClick={submitToSupabase} 
                onKeyDown={(e) => e.key === "Enter" && submitToSupabase()}
                className="w-full bg-[#8FB3E2] text-[#192338] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D9E1F1] transition-all shadow-xl shadow-[#8FB3E2]/20"
              >
                Confirm Report
              </button>
              <button onClick={() => setStep(1)} className="text-[#D9E1F1]/40 text-xs font-bold uppercase tracking-widest hover:text-[#8FB3E2] transition-colors">Edit details</button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center p-12 z-10">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-2 border-[#8FB3E2] rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">📡</div>
            </div>
            <h2 className="text-2xl font-black text-[#D9E1F1] mb-4 uppercase tracking-tighter">Entry Published</h2>
            <p className="text-[#8FB3E2] font-bold italic mb-8">"Thank you for reporting. The grid is now searching for the owner."</p>
            {/* REDIRECT TO HOME */}
            <button onClick={() => window.location.href = "/home"} className="text-[#D9E1F1]/50 text-xs uppercase font-bold border-b border-[#D9E1F1]/20 pb-1 hover:text-[#8FB3E2] transition-colors">Return to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Found;