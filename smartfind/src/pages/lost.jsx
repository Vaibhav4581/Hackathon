import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient"; // Ensure this file exists

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

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const questions = [
    { id: "image", label: "Upload Photo Evidence", type: "file", name: "image" },
    { id: "title", label: "What did you lose?", type: "text", placeholder: "e.g. Blue Wallet", name: "title" },
    { id: "type", label: "Category", type: "select", options: ["Electronics", "Personal", "Documents", "Other"], name: "type" },
    { id: "color", label: "Primary Color", type: "text", placeholder: "e.g. Midnight Black", name: "color" },
    { id: "location", label: "Last seen location?", type: "text", placeholder: "e.g. Library Hall", name: "location" },
    { id: "time", label: "Estimated Time", type: "time", name: "time" },
    { id: "status", label: "Status", type: "select", options: ["Lost", "Stolen"], name: "status" },
  ];

  const generateSummary = () => {
    return `Scanning for a ${formData.color.toLowerCase()} ${formData.title.toLowerCase()} (${formData.type.toLowerCase()}). Last seen at ${formData.location} around ${formData.time}. Marked as ${formData.status.toLowerCase()}. Generating match report...`;
  };

  // ✅ Connects to Supabase Database
  const submitToSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([
          { 
            title: formData.title,
            type: formData.type,
            color: formData.color,
            location: formData.location,
            time: formData.time,
            status: 'lost' 
          }
        ]);

      if (error) throw error;
      console.log("Submission successful:", data);
      nextStep(); 
    } catch (error) {
      console.error("Database Error:", error.message);
      alert("Submission failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 relative z-10">
      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div
            key={questions[step].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card w-full max-w-lg p-10 text-center relative"
          >
            {step > 0 && (
              <button onClick={prevStep} className="absolute top-6 left-6 text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">← Back</button>
            )}
            <h2 className="text-2xl font-bold text-[#D9E1F1] mb-8">{questions[step].label}</h2>

            {questions[step].type === "file" ? (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#8FB3E2]/20 rounded-2xl cursor-pointer hover:bg-[#8FB3E2]/5 transition-all">
                  <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">Upload Image</span>
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
                  onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })}>
                  {questions[step].options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <button onClick={nextStep} className="bg-[#8FB3E2] text-[#192338] px-12 py-3 rounded-full font-black uppercase tracking-widest shadow-lg">Next</button>
              </div>
            ) : (
              <div className="space-y-6">
                <input autoFocus type={questions[step].type} placeholder={questions[step].placeholder} className="w-full bg-transparent border-b-2 border-[#8FB3E2]/30 p-4 text-[#D9E1F1] outline-none text-xl text-center"
                  onChange={(e) => setFormData({ ...formData, [questions[step].name]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && nextStep()} />
                <button onClick={nextStep} className="bg-[#8FB3E2] text-[#192338] px-12 py-3 rounded-full font-black uppercase tracking-widest">Next</button>
              </div>
            )}
          </motion.div>
        ) : step === questions.length ? (
          <motion.div key="summary-step" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="glass-card w-full max-w-lg p-12 text-center border-2 border-[#8FB3E2]/20">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-[#8FB3E2] animate-pulse" />
              <span className="text-[#8FB3E2] text-xs font-bold uppercase tracking-widest">AI Summarizing...</span>
            </div>
            <div className="min-h-[100px] flex items-center justify-center">
              <h3 className="text-xl italic font-medium text-[#D9E1F1] leading-relaxed">
                "<Typewriter text={generateSummary()} />"
              </h3>
            </div>
            <div className="mt-8 space-y-4">
              <button onClick={submitToSupabase} className="w-full bg-[#8FB3E2] text-[#192338] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D9E1F1] transition-all">
                Looks Correct - Proceed
              </button>
              <button onClick={() => setStep(1)} className="text-[#D9E1F1]/40 text-xs font-bold uppercase tracking-widest hover:text-[#8FB3E2] transition-colors">Wait, let me edit details</button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center p-12 overflow-hidden relative">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-2 border-[#8FB3E2] rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🛰️</div>
            </div>
            <h2 className="text-2xl font-black text-[#D9E1F1] mb-4 uppercase tracking-tighter">Report Active</h2>
            <p className="text-[#8FB3E2] font-bold italic mb-6">"You will be notified if found."</p>
            <button onClick={() => window.location.href = "/"} className="text-[#D9E1F1]/50 text-xs uppercase font-bold border-b border-[#D9E1F1]/20 pb-1">Return to Campus Grid</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lost;