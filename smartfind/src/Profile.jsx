import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";

function Profile() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 968);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'lost', 'found'

  const [userData, setUserData] = useState({
    name: "User", email: "", phone: "", lostCount: 0, foundCount: 0, items: []
  });
  
  const [tempData, setTempData] = useState({ name: "", phone: "" });

  const fetchProfileAndItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/"); return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: itemsData } = await supabase.from('items').select('*').eq('email', user.email).order('created_at', { ascending: false });

      const lost = itemsData?.filter(i => i.type?.toLowerCase() === 'lost').length || 0;
      const found = itemsData?.filter(i => i.type?.toLowerCase() === 'found').length || 0;

      const profileName = profileData?.full_name || user.user_metadata?.full_name || "Finder";
      const profilePhone = profileData?.phone || "Not Set";

      setUserData({
        name: profileName,
        email: user.email,
        phone: profilePhone,
        lostCount: lost,
        foundCount: found,
        items: itemsData || []
      });

      setTempData({ name: profileName, phone: profilePhone === "Not Set" ? "" : profilePhone });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        email: user.email, 
        full_name: tempData.name, 
        phone: tempData.phone,
        updated_at: new Date() 
      });
      if (error) throw error;
      setUserData(prev => ({ ...prev, name: tempData.name, phone: tempData.phone }));
      setIsEditing(false);
      alert("Profile updated!");
    } catch (error) {
      alert(error.message);
    } finally { setSaveLoading(false); }
  };

  useEffect(() => {
    fetchProfileAndItems();
    const handleResize = () => setIsMobile(window.innerWidth < 968);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const particlesInit = useCallback(async (engine) => { await loadSlim(engine); }, []);

  if (loading) return <div style={styles.loadingScreen}>Initializing Profile...</div>;

  // Logic to filter the list based on selection
  const filteredItems = userData.items.filter(item => 
    filter === "all" ? true : item.type?.toLowerCase() === filter
  );

  return (
    <div style={styles.container}>
      <style>{`
        .glass-panel { background: rgba(30, 46, 79, 0.4); backdrop-filter: blur(25px); border: 1px solid rgba(143, 179, 226, 0.15); border-radius: 32px; }
        .neon-border-lost { border-left: 4px solid #ff4d4d; }
        .neon-border-found { border-left: 4px solid #4ade80; }
        .content-scroll::-webkit-scrollbar { width: 5px; }
        .content-scroll::-webkit-scrollbar-thumb { background: rgba(143, 179, 226, 0.2); border-radius: 10px; }
        .item-card:hover { background: rgba(255, 255, 255, 0.05) !important; transform: translateX(5px); transition: 0.3s; }
        .action-btn:hover { filter: brightness(1.2); transform: translateY(-2px); transition: 0.2s; }
      `}</style>
      
      <Particles id="tsparticles" init={particlesInit} options={particleConfig} />

      <div style={{...styles.layout, flexDirection: isMobile ? "column" : "row"}}>
        
        {/* LEFT SIDE: SIDEBAR */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-panel" style={styles.sidebar}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatarGlow}></div>
            <div style={styles.avatar}>{userData.name.charAt(0)}</div>
          </div>

          {isEditing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              <input style={styles.editInput} value={tempData.name} onChange={(e) => setTempData({...tempData, name: e.target.value})} />
              <input style={styles.editInput} value={tempData.phone} onChange={(e) => setTempData({...tempData, phone: e.target.value})} />
            </div>
          ) : (
            <>
              <h2 style={styles.userName}>{userData.name}</h2>
              <p style={styles.userPhone}>📞 {userData.phone}</p>
            </>
          )}
          <p style={styles.userEmail}>{userData.email}</p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard} onClick={() => setFilter("lost")}>
              <span style={styles.statVal}>{userData.lostCount}</span>
              <span style={styles.statLab}>LOST</span>
            </div>
            <div style={styles.statCard} onClick={() => setFilter("found")}>
              <span style={styles.statVal}>{userData.foundCount}</span>
              <span style={styles.statLab}>FOUND</span>
            </div>
          </div>

          <div style={styles.sidebarActions}>
            {isEditing ? (
              <button onClick={handleUpdateProfile} style={styles.saveBtn} disabled={saveLoading}>{saveLoading ? "..." : "Save"}</button>
            ) : (
              <button onClick={() => setIsEditing(true)} style={styles.secondaryBtn}>Edit Profile</button>
            )}
            <button onClick={() => isEditing ? setIsEditing(false) : setShowLogoutConfirm(true)} style={styles.dangerBtn}>
              {isEditing ? "Cancel" : "Logout"}
            </button>
          </div>
        </motion.div>

        {/* RIGHT SIDE: ACTIVITY FEED */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel" style={styles.mainFeed}>
          
          {/* HEADER WITH TOP-RIGHT BUTTONS */}
          <div style={styles.feedHeader}>
            <div>
              <h1 style={styles.title}>Activity <span style={{color: '#8FB3E2'}}>Log</span></h1>
              <div style={styles.filterBar}>
                {['all', 'lost', 'found'].map(t => (
                  <span key={t} onClick={() => setFilter(t)} style={{...styles.filterTab, color: filter === t ? '#8FB3E2' : '#555'}}>{t.toUpperCase()}</span>
                ))}
              </div>
            </div>

            {/* TOP RIGHT ACTION BUTTONS */}
            <div style={styles.topRightActions}>
              <Link to="/lost" style={{textDecoration: 'none'}}>
                <button className="action-btn" style={{...styles.actionBtn, background: 'rgba(255, 77, 77, 0.15)', color: '#ff4d4d', border: '1px solid #ff4d4d'}}>+ Lost Item</button>
              </Link>
              <Link to="/found" style={{textDecoration: 'none'}}>
                <button className="action-btn" style={{...styles.actionBtn, background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid #4ade80'}}>+ Found Item</button>
              </Link>
            </div>
          </div>

          <div className="content-scroll" style={styles.scrollArea}>
            {filteredItems.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`item-card ${item.type === 'lost' ? "neon-border-lost" : "neon-border-found"}`} style={styles.itemCard}>
                <div style={{...styles.iconCircle, color: item.type === 'lost' ? '#ff4d4d' : '#4ade80'}}>
                  {item.type === 'lost' ? '🔍' : '🎁'}
                </div>
                <div style={{flex: 1, marginLeft: '15px'}}>
                  <h4 style={styles.itemTitle}>{item.description}</h4>
                  <p style={styles.itemMeta}>📅 {new Date(item.created_at).toLocaleDateString()} • {item.location || 'N/A'}</p>
                </div>
                <div style={{...styles.typeBadge, color: item.type === 'lost' ? '#ff4d4d' : '#4ade80'}}>{item.type.toUpperCase()}</div>
              </motion.div>
            ))}
            {filteredItems.length === 0 && <p style={styles.empty}>No {filter} items found.</p>}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.overlay}>
            <div className="glass-panel" style={styles.modal}>
              <h3 style={{color: 'white'}}>Confirm Logout?</h3>
              <div style={styles.modalBtns}>
                <button style={styles.secondaryBtn} onClick={() => setShowLogoutConfirm(false)}>Stay</button>
                <button style={styles.confirmBtn} onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>Logout</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Particle & Style objects remain below
const particleConfig = {
  fullScreen: { enable: true, zIndex: 0 },
  particles: {
    number: { value: 40 },
    color: { value: "#8FB3E2" },
    links: { enable: true, opacity: 0.1, distance: 150 },
    move: { enable: true, speed: 0.6 },
    size: { value: { min: 1, max: 2 } }
  }
};

const styles = {
  container: { height: "100vh", width: "100vw", background: "#0D1117", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", fontFamily: "'Inter', sans-serif" },
  layout: { display: "flex", gap: "25px", width: "95%", maxWidth: "1200px", height: "85vh", zIndex: 10 },
  loadingScreen: { height: '100vh', width: '100vw', background: '#0D1117', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  sidebar: { flex: 1, padding: "40px", display: "flex", flexDirection: "column", alignItems: "center" },
  avatarContainer: { position: "relative", marginBottom: "20px" },
  avatar: { width: "100px", height: "100px", borderRadius: "30px", background: "linear-gradient(45deg, #1E2E4F, #31487A)", fontSize: "40px", fontWeight: "900", display: "flex", justifyContent: "center", alignItems: "center", color: "white" },
  avatarGlow: { position: "absolute", inset: "-10px", background: "rgba(143,179,226,0.1)", filter: "blur(20px)", borderRadius: "50%" },
  userName: { fontSize: "24px", color: "white", margin: "10px 0 5px" },
  userPhone: { fontSize: "14px", color: "#8FB3E2" },
  userEmail: { fontSize: "12px", color: "rgba(143,179,226,0.3)", marginBottom: "30px" },
  editInput: { width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid #31487A", color: "white" },
  statsGrid: { display: "flex", gap: "10px", width: "100%", marginBottom: "20px" },
  statCard: { flex: 1, padding: "15px", background: "rgba(255,255,255,0.03)", borderRadius: "15px", textAlign: "center", cursor: 'pointer' },
  statVal: { display: "block", fontSize: "22px", fontWeight: "900", color: "white" },
  statLab: { fontSize: "10px", color: "#8FB3E2" },
  mainFeed: { flex: 2.5, padding: "40px", display: "flex", flexDirection: "column", position: 'relative' },
  feedHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" },
  title: { fontSize: "32px", color: "white", fontWeight: "900", margin: 0 },
  filterBar: { display: 'flex', gap: '15px', marginTop: '10px' },
  filterTab: { fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px' },
  topRightActions: { display: 'flex', gap: '10px' },
  actionBtn: { padding: '10px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  scrollArea: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" },
  itemCard: { background: "rgba(255, 255, 255, 0.02)", padding: "15px 20px", borderRadius: "20px", display: "flex", alignItems: "center" },
  iconCircle: { width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' },
  itemTitle: { color: "white", fontSize: "16px", margin: 0 },
  itemMeta: { color: "rgba(143,179,226,0.4)", fontSize: "11px", margin: "4px 0 0" },
  typeBadge: { fontWeight: "900", fontSize: "10px" },
  sidebarActions: { width: "100%", display: "flex", flexDirection: "column", gap: "10px" },
  saveBtn: { background: "#8FB3E2", color: "#0D1117", padding: "12px", borderRadius: "12px", border: 'none', fontWeight: '800' },
  secondaryBtn: { background: "rgba(143,179,226,0.1)", color: "#8FB3E2", padding: "12px", borderRadius: "12px", border: '1px solid rgba(143,179,226,0.2)', fontWeight: '800' },
  dangerBtn: { color: "#ff4d4d", background: 'transparent', border: 'none', padding: "10px", cursor: 'pointer' },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { padding: "30px", width: "300px", textAlign: 'center' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '20px' },
  confirmBtn: { background: '#ff4d4d', color: 'white', border: 'none', flex: 1, padding: '10px', borderRadius: '10px', fontWeight: '800' },
  empty: { textAlign: 'center', color: '#555', marginTop: '40px' }
};

export default Profile;