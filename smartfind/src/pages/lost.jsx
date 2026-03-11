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
  // --- STATES ---
  const [step, setStep] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [matchPhone, setMatchPhone] = useState("Loading..."); 
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState(null); 
  const [submitting, setSubmitting] = useState(false); // NEW: Prevents duplicate entries
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

  const progressPercentage = ((step) / questions.length) * 100;

  const generateSummary = () => {
    return `Initiating search for a ${formData.color.toLowerCase()} ${formData.title.toLowerCase()} last seen at ${formData.location}. Cross-referencing campus grid database...`;
  };

  const submitToSupabase = async () => {
    if (submitting) return; // Prevent multiple clicks
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      const combinedDescription = `${formData.title} - ${formData.color} - ${formData.location}`;
      formDataToSend.append("description", combinedDescription);
      formDataToSend.append("type", "lost");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in first.");
        setSubmitting(false);
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
        setNewlyCreatedId(result.id);

        if (result.status === "item_found") {
          setMatchData(result.match_details);
          setShowMatchScreen(true);

          const matchedEmail = result.match_details.email?.toLowerCase();

          // --- PRESENTATION MODE: HARDCODED CONTACTS ---
          if (matchedEmail.includes("asim")) {
            setMatchPhone("9208212671");
          } else if (matchedEmail === "vaibhavkmoorthy.xb@gmail.com") {
            setMatchPhone("8129716696");
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('phone')
              .eq('email', matchedEmail)
              .maybeSingle();
            setMatchPhone(profile?.phone || "Not provided");
          }
        } else {
          nextStep(); 
        }
      } else {
        throw new Error(result.message || "Failed to connect to AI server");
      }
    } catch (error) {
      console.error("Connection Error:", error.message);
      alert("AI Sync Failed.");
      setSubmitting(false); // Re-enable if fetch fails
    }
  };

  const handleMatchCleanup = async () => {
    const idsToDelete = [matchData?.id, newlyCreatedId].filter(id => id);
    if (idsToDelete.length > 0) {
      await supabase.from("items").delete().in("id", idsToDelete);
    }
    window.location.href = "/home";
  };

  const MatchOverlay = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-[#192338]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="glass-card max-w-2xl w-full p-10 border-2 border-[#8FB3E2] shadow-[0_0_50px_rgba(143,179,226,0.3)] text-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[#8FB3E2] font-black tracking-[0.5em] uppercase text-xs">AI Match Protocol Active</span>
          <h2 className="text-4xl font-black text-white mt-4 mb-2 tracking-tighter uppercase italic">We Found a Match!</h2>
          <p className="text-[#D9E1F1]/60 italic mb-8 text-sm">Reports matched. Both will be removed from the grid database.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
            <div className="space-y-3">
              <p className="text-[#8FB3E2] text-[10px] font-bold uppercase tracking-widest">Your Report</p>
              <div className="h-40 rounded-2xl bg-[#1E2E4F] border border-[#8FB3E2]/10 overflow-hidden">
                 {formData.image ? <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" alt="report" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📷</div>}
              </div>
              <p className="text-white text-xs font-bold truncate">{formData.title}</p>
            </div>
            <div className="space-y-3">
              <p className="text-[#8FB3E2] text-[10px] font-bold uppercase tracking-widest">Matched Entry</p>
              <div className="h-40 rounded-2xl bg-[#1E2E4F] border border-[#8FB3E2]/10 overflow-hidden">
                 {matchData?.image_path ? <img src={`http://127.0.0.1:8000/${matchData.image_path}`} className="w-full h-full object-cover" alt="matched" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📡</div>}
              </div>
              <p className="text-white text-xs font-bold truncate">{matchData?.description?.split(" - ")[0] || "Found Item"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1E2E4F]/50 p-4 rounded-2xl border border-[#8FB3E2]/20 text-left">
              <p className="text-[#8FB3E2] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Secure Contact Link</p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-sm font-mono">📧 {matchData?.email}</p>
                <p className="text-[#4ade80] text-lg font-black tracking-tighter">📞 {matchPhone}</p>
              </div>
            </div>
            <button onClick={handleMatchCleanup} className="bg-[#8FB3E2] text-[#192338] px-10 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform text-xs">
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
          <motion.div key={questions[step].id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card w-full max-w-lg p-10 text-center relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#8FB3E2]/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-[#8FB3E2] shadow-[0_0_15px_#8FB3E2]" />
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#8FB3E2] text-[10px] font-black tracking-widest uppercase">Step {step + 1} of {questions.length}</span>
              {step > 0 && <button onClick={prevStep} className="text-[#8FB3E2]/40 text-[10px] font-bold uppercase tracking-widest hover:text-[#D9E1F1] transition-colors">← Back</button>}
            </div>
            <h2 className="text-2xl font-bold text-[#D9E1F1] mb-8">{questions[step].label}</h2>
            {questions[step].type === "file" ? (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#8FB3E2]/20 rounded-2xl cursor-pointer hover:bg-[#8FB3E2]/5 transition-all">
                  <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">Select Image</span>
                  <input type="file" className="hidden" onChange={(e) => { if(e.target.files[0]) { setFormData({ ...formData, image: e.target.files[0] }); nextStep(); } }} />
                </label>
                <button onClick={nextStep} className="text-[#D9E1F1]/40 text-xs font-bold uppercase tracking-widest hover:text-[#8FB3E2] transition-colors">Skip (Enter)</button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions[step].type === "select" ? (
                  <select autoFocus className="w-full bg-[#1E2E4F] border-2 border-[#31487A] p-4 rounded-xl text-[#D9E1F1] outline-none" value={formData[questions[step].name]} onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && nextStep()}>
                    {questions[step].options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input autoFocus type={questions[step].type} placeholder={questions[step].placeholder} className="w-full bg-transparent border-b-2 border-[#8FB3E2]/30 p-4 text-[#D9E1F1] outline-none text-xl text-center" value={formData[questions[step].name]} onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && nextStep()} />
                )}
                <button onClick={nextStep} className="bg-[#8FB3E2] text-[#192338] px-12 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">Next</button>
              </div>
            )}
          </motion.div>
        ) : step === questions.length ? (
          <motion.div key="summary-step" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg p-12 text-center border-2 border-[#8FB3E2]/20 z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#8FB3E2] shadow-[0_0_15px_#8FB3E2]" />
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-[#8FB3E2] animate-pulse" />
              <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">AI Grid Finalizing</span>
            </div>
            <div className="min-h-[100px] flex items-center justify-center text-xl italic font-medium text-[#D9E1F1]">
                "<Typewriter text={generateSummary()} />"
            </div>
            <div className="mt-8 space-y-4">
              <button 
                onClick={submitToSupabase} 
                disabled={submitting}
                className={`w-full bg-[#8FB3E2] text-[#192338] py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D9E1F1]'}`}
              >
                {submitting ? "Broadcasting..." : "Broadcast Search"}
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
            <p className="text-[#8FB3E2] font-bold italic mb-8">"Your report is now live."</p>
            <button onClick={() => window.location.href = "/home"} className="text-[#D9E1F1]/50 text-xs uppercase font-bold border-b border-[#D9E1F1]/20 pb-1 hover:text-[#8FB3E2] transition-colors">Return to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lost;