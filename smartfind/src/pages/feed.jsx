import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

const Feed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching items:", error);
    else setItems(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative z-10">
      <h1 className="text-4xl font-black text-[#D9E1F1] mb-10 tracking-tighter uppercase italic">
        Campus <span className="text-[#8FB3E2]">Grid</span>
      </h1>

      {loading ? (
        <div className="text-[#8FB3E2] font-bold animate-pulse text-center py-20">
          SCANNING CAMPUS NETWORK...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="glass-card !p-0 overflow-hidden border-[#8FB3E2]/10 hover:border-[#8FB3E2]/40 transition-all flex flex-col shadow-2xl"
            >
              {/* --- IMAGE HEADER --- */}
              <div className="h-52 bg-[#1E2E4F] relative overflow-hidden flex items-center justify-center border-b border-[#8FB3E2]/10">
                {item.image_path ? (
                  <img 
                    src={`http://127.0.0.1:8000/${item.image_path}`} 
                    alt="reported item"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}
                  />
                ) : (
                  <div className="flex flex-col items-center opacity-20">
                    <span className="text-5xl mb-2">📷</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Visual Data</span>
                  </div>
                )}
                
                {/* STATUS BADGE */}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                    item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>

              {/* --- INFO BODY --- */}
              <div className="p-7 text-left flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-extrabold text-[#D9E1F1] leading-tight">
                      {item.title || item.description?.split(" - ")[0] || "Unlabeled Item"}
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className="text-[#D9E1F1]/50 italic text-xs leading-relaxed border-l-2 border-[#8FB3E2]/30 pl-3 mb-5">
                      "{item.description}"
                    </p>
                    
                    <div className="space-y-1.5 font-medium">
                      {item.location && (
                        <p className="flex items-center gap-2 text-[#D9E1F1]/80">
                          <span className="text-[#8FB3E2] text-xs">📍</span> {item.location}
                        </p>
                      )}
                      {item.color && (
                        <p className="flex items-center gap-2 text-[#D9E1F1]/80">
                          <span className="text-[#8FB3E2] text-xs">🎨</span> {item.color}
                        </p>
                      )}
                      {item.time && (
                        <p className="flex items-center gap-2 text-[#D9E1F1]/80">
                          <span className="text-[#8FB3E2] text-xs">🕒</span> {item.time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="mt-8 pt-4 border-t border-[#8FB3E2]/5 flex justify-between items-center">
                   <span className="text-[#8FB3E2]/40 text-[9px] font-black uppercase tracking-tighter">
                    REF ID: {item.id.toString().slice(0,8)}
                  </span>
                  <span className="text-[#D9E1F1]/30 text-[10px] font-bold uppercase">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;