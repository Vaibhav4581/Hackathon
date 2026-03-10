import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "./ParticlesBackground";

function Auth() {
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
  const navigate = useNavigate();

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  return (
    <div style={styles.container}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');`}
      </style>
      
      <ParticlesBackground />

      <div style={{
        ...styles.mainContainer,
        width: isMobile ? "90%" : "950px",
        height: isMobile ? "auto" : "600px",
        minHeight: isMobile ? "500px" : "600px",
        padding: isMobile ? "40px 20px" : "0",
      }}>
        
        {/* --- REGISTER FORM --- */}
        <div style={{
          ...styles.formBox,
          width: isMobile ? "100%" : "50%",
          position: isMobile ? (active ? "relative" : "absolute") : "absolute",
          visibility: isMobile ? (active ? "visible" : "hidden") : "visible",
          opacity: active ? 1 : 0,
          zIndex: active ? 5 : 1,
          transform: isMobile ? "none" : (active ? "translateX(100%)" : "translateX(0%)"),
          transition: "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
        }}>
          <h2 style={styles.title}>{isMobile ? "Register" : "Create Account"}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Full Name" />
            <input style={styles.input} placeholder="Email" type="email" />
            <input style={styles.input} type="password" placeholder="Password" />
            <button style={styles.button}>SIGN UP</button>
          </form>
          {isMobile && (
            <p style={styles.mobileSwitch} onClick={() => setActive(false)}>
              Already have an account? <b>Sign In</b>
            </p>
          )}
        </div>

        {/* --- LOGIN FORM --- */}
        <div style={{
          ...styles.formBox,
          width: isMobile ? "100%" : "50%",
          position: isMobile ? (active ? "absolute" : "relative") : "absolute",
          visibility: isMobile ? (active ? "hidden" : "visible") : "visible",
          opacity: active ? 0 : 1,
          zIndex: active ? 1 : 5,
          transform: "none",
          transition: "all 0.6s ease"
        }}>
          <h2 style={styles.title}>Welcome Back</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Email" type="email" />
            <input style={styles.input} type="password" placeholder="Password" />
            <p style={styles.forgotPass}>Forgot your password?</p>
            <button style={styles.button}>SIGN IN</button>
          </form>
          {isMobile && (
            <p style={styles.mobileSwitch} onClick={() => setActive(true)}>
              New here? <b>Create Account</b>
            </p>
          )}
        </div>

        {/* --- SLIDING OVERLAY (Desktop Only) --- */}
        {!isMobile && (
          <div style={{
            ...styles.overlayContainer,
            transform: active ? "translateX(-100%)" : "translateX(0%)"
          }}>
            <div style={{
              ...styles.overlay,
              transform: active ? "translateX(50%)" : "translateX(0%)"
            }}>
              <div style={{ ...styles.overlayPanel, ...styles.overlayLeft, transform: active ? "translateX(0)" : "translateX(-20%)" }}>
                <h2 style={styles.overlayTitle}>Already a Finder?</h2>
                <p style={styles.overlayPara}>To keep searching for your items, please login with your account.</p>
                <button style={styles.ghostButton} onClick={() => setActive(false)}>SIGN IN</button>
              </div>
              <div style={{ ...styles.overlayPanel, ...styles.overlayRight, transform: active ? "translateX(20%)" : "translateX(0)" }}>
                <h2 style={styles.overlayTitle}>New Here?</h2>
                <p style={styles.overlayPara}>Join the SmartFind network and start matching lost items today!</p>
                <button style={styles.ghostButton} onClick={() => setActive(true)}>SIGN UP</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  mainContainer: {
    position: "relative",
    background: "#192338",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(143, 179, 226, 0.2)",
    display: "flex",
    transition: "width 0.3s ease",
  },
  formBox: {
    top: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 40px",
    textAlign: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "25px",
    letterSpacing: "-1px",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "320px",
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    background: "#24355a",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    color: "white",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
  },
  forgotPass: {
    color: "#8FB3E2",
    fontSize: "12px",
    textAlign: "right",
    cursor: "pointer",
    marginTop: "-5px",
  },
  button: {
    padding: "14px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(90deg, #31487A, #8FB3E2)",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "10px",
  },
  mobileSwitch: {
    color: "#8FB3E2",
    fontSize: "14px",
    marginTop: "20px",
    cursor: "pointer",
  },
  /* Desktop Only Styles */
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: "50%",
    height: "100%",
    overflow: "hidden",
    transition: "transform 0.6s ease-in-out",
    zIndex: 100,
  },
  overlay: {
    background: "linear-gradient(135deg, #31487A 0%, #8FB3E2 100%)",
    color: "#FFFFFF",
    position: "relative",
    left: "-100%",
    height: "100%",
    width: "200%",
    transition: "transform 0.6s ease-in-out",
  },
  overlayPanel: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: "0 60px",
    textAlign: "center",
    top: 0,
    height: "100%",
    width: "50%",
    transition: "transform 0.6s ease-in-out",
  },
  overlayLeft: { transform: "translateX(-20%)" },
  overlayRight: { right: 0, transform: "translateX(0)" },
  overlayTitle: { fontSize: "36px", fontWeight: "800", margin: 0 },
  overlayPara: { fontSize: "15px", marginTop: "15px", lineHeight: "1.6", opacity: "0.8" },
  ghostButton: {
    padding: "12px 40px",
    borderRadius: "30px",
    border: "2px solid #FFFFFF",
    background: "transparent",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "20px",
  },
};

export default Auth;