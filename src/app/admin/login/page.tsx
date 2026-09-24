"use client";

import { useState, useEffect } from "react";
import { authClient } from "../../../lib/auth-client";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

type Tab = "password" | "magic" | "otp";

export default function AdminLogin() {
  const [activeTab, setActiveTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "auth-sync") {
        router.push("/admin");
        router.refresh();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (isRegistering) {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) alert(error.message);
      else {
        localStorage.setItem("auth-sync", Date.now().toString());
        router.push("/admin");
      }
    } else {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) alert(error.message);
      else {
        localStorage.setItem("auth-sync", Date.now().toString());
        router.push("/admin");
      }
    }
    
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await authClient.signIn.magicLink({ email });
    if (error) alert(error.message);
    else alert("Magic link sent! Check your terminal.");
    setLoading(false);
  };

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Note: To support OTP fully, we would need to handle the two-step verification UI.
    // For now, we simulate sending it.
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    if (error) alert(error.message);
    else alert("OTP sent! Check your terminal.");
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (activeTab === "password") handlePasswordSubmit(e);
    if (activeTab === "magic") handleMagicLink(e);
    if (activeTab === "otp") handleOTP(e);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 
          className={styles.title} 
          onDoubleClick={() => setIsRegistering(!isRegistering)}
          style={{ cursor: "default", userSelect: "none" }}
        >
          Admin Portal
        </h1>
        <p className={styles.subtitle}>
          Authenticate to access the internal church management system.
        </p>

        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === "password" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("password")}
          >
            Password
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "magic" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("magic")}
          >
            Magic link
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "otp" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("otp")}
          >
            OTP
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegistering && activeTab === "password" && (
            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <label>Full Name</label>
              </div>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="John Doe" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <div className={styles.inputHeader}>
              <label>Email</label>
            </div>
            <div className={styles.inputWrapper}>
              <input 
                type="email" 
                className={styles.input}
                placeholder="pastor@church.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {activeTab === "password" && (
            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <label>Password</label>
                <button type="button" className={styles.actionLink}>Forgot password?</button>
              </div>
              <div className={styles.inputWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={styles.input}
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className={styles.iconBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeLinecap="round" strokeLinejoin="round"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className={styles.checkboxGroup}>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Processing..." : isRegistering ? "Create Account" : (
              activeTab === "password" ? "Sign in" : 
              activeTab === "magic" ? "Send magic link" : 
              "Send OTP"
            )}
            {!loading && !isRegistering && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
