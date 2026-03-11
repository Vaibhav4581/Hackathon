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

const Lost = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    type: "Electronics",
    color: "",
    location: "",
    time: "",
    status: "Lost",
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
    { id: "image", label: "Upload Reference Photo (If available)", type: "file", name: "image" },
    { id: "title", label: "What did you lose?", type: "text", placeholder: "e.g. Midnight Blue iPhone", name: "title" },
    { id: "type", label: "Item Category", type: "select", options: ["Electronics", "Personal", "Documents", "Other"], name: "type" },
    { id: "color", label: "Primary Color of Item", type: "text", placeholder: "e.g. Matte Black", name: "color" },
    { id: "location", label: "Last Seen Location?", type: "text", placeholder: "e.g. Science Lab 3", name: "location" },
    { id: "time", label: "Approximate Time Lost", type: "time", name: "time" },
  ];

  const generateSummary = () => {
    return `Initiating search for a ${formData.color.toLowerCase()} ${formData.title.toLowerCase()} last seen at ${formData.location}. Cross-referencing campus grid database...`;
  };

  const submitToSupabase = async () => {
    try {
      // 1. Prepare the data for the Python AI Backend
      const formDataToSend = new FormData();
      
      // Combine details into one description string for the AI to read
      const combinedDescription = `${formData.title} - ${formData.color} - ${formData.location}`;
      formDataToSend.append("description", combinedDescription);
      
      // Set type to 'lost' so the AI looks for 'found' matches
      formDataToSend.append("type", "lost");

      // 2. Get real user email from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please log in first. We need your email to alert you when your item is found!");
        return;
      }

      formDataToSend.append("email", user.email);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // 3. Send to your Python Backend (Uvicorn)
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        console.log("AI Backend Response:", result);
        
        // If an immediate match was found in the database
        if (result.status === "item_found") {
          alert(`🎉 AI MATCH FOUND! A similar item was previously reported. Check your email for details from: ${result.match_details.email}`);
        }
        
        nextStep(); // Move to the "Search Active" success screen
      } else {
        throw new Error(result.message || "Failed to connect to AI server");
      }

    } catch (error) {
      console.error("Connection Error:", error.message);
      alert("AI Sync Failed: Make sure your Python backend is running at http://127.0.0.1:8000");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
      <Particles id="tsparticles" init={particlesInit} options={particleOptions} />

      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div
            key={questions[step].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card w-full max-w-lg p-10 text-center relative z-10"
          >
            {step > 0 && (
              <button onClick={prevStep} className="absolute top-6 left-6 text-[#8FB3E2] text-xs font-bold uppercase tracking-widest hover:text-[#D9E1F1] transition-colors">← Back</button>
            )}
            <h2 className="text-2xl font-bold text-[#D9E1F1] mb-8">{questions[step].label}</h2>

            {questions[step].type === "file" ? (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#8FB3E2]/20 rounded-2xl cursor-pointer hover:bg-[#8FB3E2]/5 transition-all">
                  <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">Select Image</span>
                  <input type="file" className="hidden" onChange={(e) => {
                    setFormData({ ...formData, image: e.target.files[0] });
                    nextStep();
                  }} />
                </label>
                <button onClick={nextStep} className="text-[#D9E1F1]/40 text-xs font-bold uppercase tracking-widest hover:text-[#8FB3E2] transition-colors">Skip for now</button>
              </div>
            ) : questions[step].type === "select" ? (
              <div className="space-y-6 text-center">
                <select className="w-full bg-[#1E2E4F] border-2 border-[#31487A] p-4 rounded-xl text-[#D9E1F1] outline-none text-center appearance-none"
                  value={formData[questions[step].name]}
                  onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })}>
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
                  onKeyDown={(e) => e.key === "Enter" && nextStep()} />
                <button onClick={nextStep} className="bg-[#8FB3E2] text-[#192338] px-12 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">Next</button>
              </div>
            )}
          </motion.div>
        ) : step === questions.length ? (
          <motion.div key="summary-step" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg p-12 text-center border-2 border-[#8FB3E2]/20 z-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-[#8FB3E2] animate-pulse" />
              <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">AI Grid Searching...</span>
            </div>
            <div className="min-h-[100px] flex items-center justify-center">
              <h3 className="text-xl italic font-medium text-[#D9E1F1] leading-relaxed">
                "<Typewriter text={generateSummary()} />"
              </h3>
            </div>
            <div className="mt-8 space-y-4">
              <button onClick={submitToSupabase} className="w-full bg-[#8FB3E2] text-[#192338] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D9E1F1] transition-all shadow-xl shadow-[#8FB3E2]/20">
                Broadcast Search
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
            <h2 className="text-2xl font-black text-[#D9E1F1] mb-4 uppercase tracking-tighter">Search Active</h2>
            <p className="text-[#8FB3E2] font-bold italic mb-8">"Your report is now live. We will alert you immediately upon a potential match."</p>
            <button onClick={() => window.location.href = "/"} className="text-[#D9E1F1]/50 text-xs uppercase font-bold border-b border-[#D9E1F1]/20 pb-1 hover:text-[#8FB3E2] transition-colors">Return to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lost;