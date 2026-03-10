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

    if (error) console.error("Error fetching:", error);
    else setItems(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative z-10">
      <h1 className="text-4xl font-black text-[#D9E1F1] mb-10 tracking-tighter uppercase italic">
        Campus <span className="text-[#8FB3E2]">Grid</span>
      </h1>

      {loading ? (
        <div className="text-[#8FB3E2] font-bold animate-pulse">Scanning database...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card !p-6 !text-left border-[#8FB3E2]/10 hover:border-[#8FB3E2]/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.status === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {item.status}
                </span>
                <span className="text-[#D9E1F1]/30 text-[10px] font-bold">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#D9E1F1] mb-2">{item.title}</h3>
              
              <div className="space-y-2 text-sm text-[#D9E1F1]/60">
                <p><span className="text-[#8FB3E2] font-bold">📍 Location:</span> {item.location}</p>
                <p><span className="text-[#8FB3E2] font-bold">🎨 Color:</span> {item.color}</p>
                <p><span className="text-[#8FB3E2] font-bold">🕒 Time:</span> {item.time}</p>
              </div>

              <button className="mt-6 w-full py-2 bg-[#8FB3E2]/10 border border-[#8FB3E2]/20 rounded-xl text-[#8FB3E2] text-xs font-black uppercase tracking-widest hover:bg-[#8FB3E2] hover:text-[#192338] transition-all">
                Claim Item
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;