import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "./ParticlesBackground";

function Profile() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 968);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // --- NEW EDITING STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Demo User",
    email: "demo@gmail.com",
    phone: "+1 (555) 012-3456",
    lostCount: 3,
    foundCount: 2
  });
  const [tempData, setTempData] = useState({ ...userData });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 968);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSave = () => {
    setUserData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...userData }); // Reset changes
    setIsEditing(false);
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
          .content-scroll::-webkit-scrollbar-thumb { background: #31487A; borderRadius: 10px; }
          input::placeholder { color: rgba(143, 179, 226, 0.5); }
        `}
      </style>

      <ParticlesBackground />

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

      <div style={{
        ...styles.dashboard,
        flexDirection: isMobile ? "column" : "row",
        width: isMobile ? "95%" : "1100px",
        height: isMobile ? "90vh" : "700px",
        filter: showLogoutConfirm ? "blur(4px)" : "none",
        pointerEvents: showLogoutConfirm ? "none" : "auto",
      }}>
        
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
                  onChange={(e) => setTempData({...tempData, name: e.target.value})}
                />
              ) : (
                <h2 style={styles.userName}>{userData.name}</h2>
              )}
              
              {!isMobile && (
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
              )}
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statBox}><p style={styles.statNum}>{userData.lostCount}</p><p style={styles.statSub}>Lost</p></div>
            <div style={styles.statBox}><p style={styles.statNum}>{userData.foundCount}</p><p style={styles.statSub}>Found</p></div>
          </div>

          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "auto" }}>
            {isEditing ? (
              <>
                <button style={{ ...styles.cancelBtn, flex: 1, padding: '10px' }} onClick={handleCancel}>Cancel</button>
                <button style={{ ...styles.primaryBtn, flex: 1, padding: '10px', borderRadius: '10px' }} onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <button style={{ ...styles.editBtn, flex: 1 }} onClick={() => setIsEditing(true)}>Edit</button>
                <button style={{ ...styles.logoutBtn, flex: 1 }} onClick={() => setShowLogoutConfirm(true)}>Exit</button>
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
            <div style={{ ...styles.headerButtons, width: isMobile ? "100%" : "auto" }}>
               <button style={{ ...styles.secondaryBtn, flex: 1 }}>+ Found</button>
               <button style={{ ...styles.primaryBtn, flex: 1 }}>+ Lost</button>
            </div>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <section>
              <h3 style={styles.sectionTitle}>Your Lost Reports</h3>
              <div style={styles.itemTable}>
                <ItemRow title="MacBook Pro" tag="Tech" status="Scanning" color="#aaa" />
                <ItemRow title="Leather Wallet" tag="Personal" status="2 Matches" color="#4ade80" />
              </div>
            </section>
            <section>
              <h3 style={styles.sectionTitle}>Items You Found</h3>
              <div style={styles.itemTable}>
                <ItemRow title="House Keys" tag="Keys" status="Returned" color="#8FB3E2" />
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
  // Existing styles preserved...
  container: { height: "100vh", width: "100vw", backgroundColor: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" },
  modalOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  confirmBox: { backgroundColor: "#192338", padding: "30px", borderRadius: "20px", textAlign: "center", border: "1px solid rgba(143, 179, 226, 0.3)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", width: "320px" },
  dashboard: { display: "flex", backgroundColor: "#192338", borderRadius: "24px", zIndex: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", overflow: "hidden", border: "1px solid rgba(143, 179, 226, 0.15)", transition: "all 0.3s ease" },
  sidebar: { background: "rgba(30, 46, 79, 0.4)", display: "flex", flexDirection: "column" },
  
  // --- NEW EDIT STYLES ---
  editInput: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(143, 179, 226, 0.2)",
    borderRadius: "6px",
    color: "white",
    fontSize: "13px",
    padding: "5px 8px",
    marginTop: "4px",
    outline: "none",
    width: "100%"
  },
  editInputHeader: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(143, 179, 226, 0.2)",
    borderRadius: "8px",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    padding: "8px",
    textAlign: "center",
    width: "100%",
    marginBottom: "10px"
  },

  avatar: { width: "70px", height: "70px", borderRadius: "18px", backgroundColor: "#8FB3E2", color: "#192338", fontSize: "24px", fontWeight: "800", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "15px", alignSelf: 'center' },
  userName: { color: "white", fontSize: "20px", fontWeight: "700", margin: "0 0 10px 0" },
  contactList: { display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" },
  contactItem: { display: "flex", flexDirection: "column" },
  contactLabel: { color: "#8FB3E2", fontSize: "9px", fontWeight: "800", letterSpacing: "1px" },
  contactValue: { color: "#D9E1F1", fontSize: "13px" },
  statsRow: { display: "flex", gap: "10px", margin: "25px 0" },
  statBox: { flex: 1, background: "#24355a", padding: "12px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(143, 179, 226, 0.1)" },
  statNum: { color: "white", fontSize: "18px", fontWeight: "bold", margin: 0 },
  statSub: { color: "#8FB3E2", fontSize: "10px", margin: 0 },
  editBtn: { padding: "10px", borderRadius: "10px", border: "none", background: "#31487A", color: "white", fontWeight: "600", cursor: "pointer" },
  logoutBtn: { padding: "10px", borderRadius: "10px", border: "1px solid rgba(255, 77, 77, 0.4)", background: "transparent", color: "#ff4d4d", fontWeight: "600", cursor: "pointer" },
  confirmBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#ff4d4d", color: "white", fontWeight: "bold", cursor: "pointer" },
  cancelBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #8FB3E2", background: "transparent", color: "#8FB3E2", fontWeight: "bold", cursor: "pointer" },
  content: { flex: 1, overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "30px" },
  headerButtons: { display: "flex", gap: "10px" },
  welcomeText: { color: "white", fontSize: "28px", fontWeight: "800", margin: 0 },
  subtitle: { color: "#8FB3E2", opacity: 0.7, fontSize: "14px" },
  primaryBtn: { padding: "10px 20px", borderRadius: "20px", border: "none", background: "linear-gradient(90deg, #31487A, #8FB3E2)", color: "white", fontWeight: "bold", cursor: "pointer" },
  secondaryBtn: { padding: "10px 20px", borderRadius: "20px", border: "1px solid #8FB3E2", background: "transparent", color: "#8FB3E2", fontWeight: "bold", cursor: "pointer" },
  sectionTitle: { color: "white", fontSize: "16px", marginBottom: "15px", opacity: 0.9 },
  itemTable: { display: "flex", flexDirection: "column", gap: "10px" },
  tableRow: { background: "#24355a", padding: "12px 15px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(143, 179, 226, 0.05)" },
  itemMain: { color: "white", fontWeight: "600", fontSize: "14px" },
  itemTag: { color: "#8FB3E2", background: "rgba(143, 179, 226, 0.1)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" },
};

export default Profile;