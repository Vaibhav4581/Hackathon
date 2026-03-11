import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { supabase } from "./supabaseClient"; 

const Login = () => {
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- AUTH STATES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(""); 

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = {
    fullScreen: { enable: true, zIndex: -1 }, // Force background layer
    fpsLimit: 120,
    particles: {
      color: { value: "#8FB3E2" },
      links: { 
        color: "#8FB3E2", 
        distance: 150, 
        enable: true, 
        opacity: 0.2, 
        width: 1 
      },
      move: { 
        enable: true, 
        speed: 1,
        direction: "none",
        random: false,
        straight: false,
        outModes: { default: "out" }
      },
      number: { 
        density: { enable: true, area: 800 }, 
        value: 50 
      },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (active) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone: phone } },
        });
        if (authError) throw authError;
        if (authData.user) {
          await supabase.from('profiles').upsert({ 
            id: authData.user.id, 
            email: email, 
            full_name: fullName, 
            phone: phone,
            updated_at: new Date()
          });
        }
        alert("Success! Check your email for a confirmation link.");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        navigate("/home");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
          input::placeholder { color: rgba(217, 225, 241, 0.4); }
          .auth-card-blur { 
            backdrop-filter: blur(25px); 
            -webkit-backdrop-filter: blur(25px); 
            background: rgba(30, 46, 79, 0.4);
            border: 1px solid rgba(143, 179, 226, 0.15);
          }
          .form-transition {
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          button:hover {
            filter: brightness(1.1);
            transform: scale(1.02);
            box-shadow: 0 0 20px rgba(143, 179, 226, 0.4);
          }
        `}
      </style>
      
      <Particles id="tsparticles" init={particlesInit} options={particleOptions} />

      <div 
        className="auth-card-blur"
        style={{
          ...styles.mainContainer,
          width: isMobile ? "90%" : "950px",
          height: isMobile ? "auto" : "650px", 
          minHeight: isMobile ? "620px" : "650px",
          padding: isMobile ? "40px 20px" : "0",
        }}
      >
        {/* --- REGISTER FORM --- */}
        <div 
          className="form-transition"
          style={{
            ...styles.formBox,
            width: isMobile ? "100%" : "50%",
            position: isMobile ? (active ? "relative" : "absolute") : "absolute",
            visibility: isMobile ? (active ? "visible" : "hidden") : "visible",
            opacity: active ? 1 : 0,
            zIndex: active ? 5 : 1,
            transform: isMobile ? "none" : (active ? "translateX(100%)" : "translateX(0%)"),
          }}
        >
          <h2 style={styles.title}>{isMobile ? "Register" : "Create Account"}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input style={styles.input} placeholder="Mobile Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button style={styles.button} disabled={loading}>{loading ? "PROCESSING..." : "SIGN UP"}</button>
          </form>
          {isMobile && <p style={styles.mobileSwitch} onClick={() => setActive(false)}>Already have an account? <b>Sign In</b></p>}
        </div>

        {/* --- LOGIN FORM --- */}
        <div 
          className="form-transition"
          style={{
            ...styles.formBox,
            width: isMobile ? "100%" : "50%",
            position: isMobile ? (active ? "absolute" : "relative") : "absolute",
            visibility: isMobile ? (active ? "hidden" : "visible") : "visible",
            opacity: active ? 0 : 1,
            zIndex: active ? 1 : 5,
            transform: "none",
          }}
        >
          <h2 style={styles.title}>Welcome Back</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p style={styles.forgotPass}>Forgot your password?</p>
            <button style={styles.button} disabled={loading}>{loading ? "AUTHENTICATING..." : "SIGN IN"}</button>
          </form>
          {isMobile && <p style={styles.mobileSwitch} onClick={() => setActive(true)}>New here? <b>Create Account</b></p>}
        </div>

        {/* --- SLIDING OVERLAY --- */}
        {!isMobile && (
          <div style={{ ...styles.overlayContainer, transform: active ? "translateX(-100%)" : "translateX(0%)" }}>
            <div style={{ ...styles.overlay, transform: active ? "translateX(50%)" : "translateX(0%)" }}>
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
};

const styles = {
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#192338", overflow: "hidden", fontFamily: "'Inter', sans-serif", position: "relative" },
  mainContainer: { position: "relative", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", display: "flex", zIndex: 10 },
  formBox: { height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 40px", textAlign: "center" },
  title: { color: "#FFFFFF", fontSize: "32px", fontWeight: "800", marginBottom: "25px", letterSpacing: "-1px" },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px" },
  input: { width: "100%", padding: "14px 18px", background: "rgba(49, 72, 122, 0.3)", border: "1px solid rgba(143, 179, 226, 0.2)", borderRadius: "12px", color: "white", outline: "none", fontSize: "14px" },
  forgotPass: { color: "#8FB3E2", fontSize: "12px", textAlign: "right", cursor: "pointer", marginTop: "-5px", fontWeight: "600" },
  button: { padding: "14px", borderRadius: "30px", border: "none", background: "linear-gradient(90deg, #31487A, #8FB3E2)", color: "#192338", fontWeight: "800", fontSize: "14px", cursor: "pointer", marginTop: "10px", letterSpacing: "1px" },
  mobileSwitch: { color: "#D9E1F1", fontSize: "14px", marginTop: "20px", cursor: "pointer", opacity: 0.8 },
  overlayContainer: { position: "absolute", top: 0, left: "50%", width: "50%", height: "100%", overflow: "hidden", transition: "transform 0.6s ease-in-out", zIndex: 100 },
  overlay: { background: "linear-gradient(135deg, #31487A 0%, #8FB3E2 100%)", color: "#FFFFFF", position: "relative", left: "-100%", height: "100%", width: "200%", transition: "transform 0.6s ease-in-out" },
  overlayPanel: { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 60px", textAlign: "center", top: 0, height: "100%", width: "50%", transition: "transform 0.6s ease-in-out" },
  overlayLeft: { transform: "translateX(-20%)" },
  overlayRight: { right: 0, transform: "translateX(0)" },
  overlayTitle: { fontSize: "36px", fontWeight: "800", margin: 0 },
  overlayPara: { fontSize: "15px", marginTop: "15px", lineHeight: "1.6", opacity: "0.8" },
  ghostButton: { padding: "12px 40px", borderRadius: "30px", border: "2px solid #FFFFFF", background: "transparent", color: "white", fontWeight: "700", cursor: "pointer", marginTop: "20px" },
};

export default Login;