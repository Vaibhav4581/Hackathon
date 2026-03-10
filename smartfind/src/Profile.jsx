import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

function Profile() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 968);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Vaibhav",
    email: "vaibhav@university.edu",
    phone: "+91 98765 43210",
    lostCount: 3,
    foundCount: 2
  });
  const [tempData, setTempData] = useState({ ...userData });

  // --- PARTICLES INITIALIZATION ---
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
      move: { enable: true, speed: 0.8 },
      number: { density: { enable: true, area: 800 }, value: 45 },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 968);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- ACTIONS ---
  const handleEditClick = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...userData });
    setIsEditing(false);
  };

  const handleExitClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
          .content-scroll::-webkit-scrollbar { width: 6px; }
          .content-scroll::-webkit-scrollbar-thumb { background: #31487A; border-radius: 10px; }
          input::placeholder { color: rgba(143, 179, 226, 0.5); }
          button { cursor: pointer; transition: all 0.2s ease; }
          button:hover { opacity: 0.8; transform: translateY(-1px); }
          button:active { transform: translateY(0px); }
          .profile-glass {
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
          }
        `}
      </style>

      {/* --- GLOBAL PARTICLES --- */}
      <Particles id="tsparticles" init={particlesInit} options={particleOptions} />

      {/* --- LOGOUT MODAL --- */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmBox}>
            <h3 style={{ color: "white", marginBottom: "10px" }}>Confirm Sign Out</h3>
            <p style={{ color: "#8FB3E2", fontSize: "14px", marginBottom: "25px" }}>Are you sure you want to leave?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={styles.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>Stay</button>
              <button style={styles.confirmBtn} onClick={confirmLogout}>Yes, Exit</button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="profile-glass"
        style={{
          ...styles.dashboard,
          flexDirection: isMobile ? "column" : "row",
          width: isMobile ? "95%" : "1100px",
          height: isMobile ? "auto" : "700px",
          filter: showLogoutConfirm ? "blur(10px)" : "none",
          pointerEvents: showLogoutConfirm ? "none" : "auto",
        }}
      >
        
        {/* --- SIDEBAR --- */}
        <div style={{
          ...styles.sidebar,
          width: isMobile ? "100%" : "320px",
          padding: isMobile ? "25px" : "40px 30px",
          borderRight: isMobile ? "none" : "1px solid rgba(143, 179, 226, 0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "20px" : "0", flexDirection: isMobile ? "row" : "column" }}>
            <div style={styles.avatar}>{userData.name.charAt(0)}</div>
            <div style={{ textAlign: isMobile ? "left" : "center", width: "100%" }}>
              {isEditing ? (
                <input 
                  style={styles.editInputHeader} 
                  value={tempData.name}
                  autoFocus
                  onChange={(e) => setTempData({...tempData, name: e.target.value})}
                />
              ) : (
                <h2 style={styles.userName}>{userData.name}</h2>
              )}
              
              <div style={styles.contactList}>
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>EMAIL</span>
                  {isEditing ? (
                    <input style={styles.editInput} value={tempData.email} onChange={(e) => setTempData({...tempData, email: e.target.value})} />
                  ) : (
                    <span style={styles.contactValue}>{userData.email}</span>
                  )}
                </div>
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>PHONE</span>
                  {isEditing ? (
                    <input style={styles.editInput} value={tempData.phone} onChange={(e) => setTempData({...tempData, phone: e.target.value})} />
                  ) : (
                    <span style={styles.contactValue}>{userData.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statBox}><p style={styles.statNum}>{userData.lostCount}</p><p style={styles.statSub}>Lost</p></div>
            <div style={styles.statBox}><p style={styles.statNum}>{userData.foundCount}</p><p style={styles.statSub}>Found</p></div>
          </div>

          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "auto" }}>
            {isEditing ? (
              <>
                <button style={styles.cancelBtnSmall} onClick={handleCancel}>Cancel</button>
                <button style={styles.saveBtnSmall} onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <button style={styles.editBtn} onClick={handleEditClick}>Edit Profile</button>
                <button style={styles.logoutBtn} onClick={handleExitClick}>Exit</button>
              </>
            )}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="content-scroll" style={{ ...styles.content, padding: isMobile ? "25px" : "50px" }}>
          <header style={{ ...styles.header, flexDirection: isMobile ? "column" : "row", gap: "20px" }}>
            <div>
              <h1 style={styles.welcomeText}>My Activity</h1>
              <p style={styles.subtitle}>Track items & matches</p>
            </div>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <section>
              <h3 style={styles.sectionTitle}>Your Lost Reports</h3>
              <div style={styles.itemTable}>
                <ItemRow title="iPhone 15 Pro" tag="Tech" status="Scanning Grid" color="#8FB3E2" />
                <ItemRow title="Blue Wallet" tag="Personal" status="2 Matches Found" color="#4ade80" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

const ItemRow = ({ title, tag, status, color }) => (
  <div style={styles.tableRow}>
    <div style={{ display: "flex", flexDirection: "column", flex: 2 }}>
      <span style={styles.itemMain}>{title}</span>
      <span style={{ color, fontSize: "11px", fontWeight: "bold" }}>{status}</span>
    </div>
    <span style={styles.itemTag}>{tag}</span>
  </div>
);

const styles = {
  container: { height: "100vh", width: "100vw", backgroundColor: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  confirmBox: { backgroundColor: "#192338", padding: "40px", borderRadius: "24px", textAlign: "center", border: "1px solid rgba(143, 179, 226, 0.3)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "350px" },
  dashboard: { display: "flex", backgroundColor: "rgba(25, 35, 56, 0.6)", borderRadius: "32px", zIndex: 10, boxShadow: "0 40px 80px rgba(0,0,0,0.7)", overflow: "hidden", border: "1px solid rgba(143, 179, 226, 0.15)", transition: "all 0.3s ease" },
  sidebar: { background: "rgba(30, 46, 79, 0.3)", display: "flex", flexDirection: "column" },
  avatar: { width: "80px", height: "80px", borderRadius: "20px", backgroundColor: "#8FB3E2", color: "#192338", fontSize: "28px", fontWeight: "900", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", alignSelf: 'center' },
  userName: { color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 15px 0" },
  contactList: { display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px", textAlign: 'left' },
  contactItem: { display: "flex", flexDirection: "column" },
  contactLabel: { color: "#8FB3E2", fontSize: "9px", fontWeight: "900", letterSpacing: "1px" },
  contactValue: { color: "#D9E1F1", fontSize: "14px" },
  statsRow: { display: "flex", gap: "12px", margin: "30px 0" },
  statBox: { flex: 1, background: "rgba(143, 179, 226, 0.05)", padding: "15px", borderRadius: "16px", textAlign: "center", border: "1px solid rgba(143, 179, 226, 0.1)" },
  statNum: { color: "white", fontSize: "22px", fontWeight: "900", margin: 0 },
  statSub: { color: "#8FB3E2", fontSize: "11px", margin: 0, fontWeight: '700' },
  editBtn: { flex: 2, padding: "14px", borderRadius: "14px", border: "none", background: "#31487A", color: "white", fontWeight: "700", cursor: "pointer" },
  logoutBtn: { flex: 1, padding: "14px", borderRadius: "14px", border: "1px solid rgba(255, 77, 77, 0.3)", background: "transparent", color: "#ff4d4d", fontWeight: "700", cursor: "pointer" },
  confirmBtn: { padding: "12px 25px", borderRadius: "12px", border: "none", background: "#ff4d4d", color: "white", fontWeight: "800" },
  cancelBtn: { padding: "12px 25px", borderRadius: "12px", border: "1px solid #8FB3E2", background: "transparent", color: "#8FB3E2", fontWeight: "800" },
  cancelBtnSmall: { flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #8FB3E2", background: "transparent", color: "#8FB3E2", fontWeight: "700" },
  saveBtnSmall: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#8FB3E2", color: "#192338", fontWeight: "800" },
  editInput: { background: "rgba(255,255,255,0.05)", border: "1px solid #8FB3E2", borderRadius: "8px", color: "white", padding: "8px 12px", fontSize: "13px", outline: "none", width: "100%" },
  editInputHeader: { background: "rgba(255,255,255,0.05)", border: "1px solid #8FB3E2", borderRadius: "10px", color: "white", fontSize: "20px", fontWeight: "800", padding: "10px", textAlign: "center", width: "100%", marginBottom: "15px" },
  content: { flex: 1, overflowY: "auto" },
  welcomeText: { color: "white", fontSize: "32px", fontWeight: "900", margin: 0 },
  subtitle: { color: "#8FB3E2", opacity: 0.8, fontSize: "15px" },
  sectionTitle: { color: "white", fontSize: "14px", fontWeight: '700', marginBottom: "20px", opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' },
  itemTable: { display: "flex", flexDirection: "column", gap: "15px" },
  tableRow: { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(143, 179, 226, 0.05)" },
  itemMain: { color: "white", fontWeight: "700", fontSize: "16px" },
  itemTag: { color: "#8FB3E2", background: "rgba(143, 179, 226, 0.1)", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: '800' },
};

export default Profile;