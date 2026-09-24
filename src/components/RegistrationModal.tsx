"use client";

import { useState } from "react";
import styles from "./RegistrationModal.module.css";
import { submitRegistration } from "../app/actions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  branches?: any[];
  event?: any;
};

export default function RegistrationModal({ isOpen, onClose, branches = [], event }: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState("");
  const [customData, setCustomData] = useState<Record<string, string>>({});

  let customFields: any[] = [];
  try {
    if (event?.customFields) customFields = JSON.parse(event.customFields);
  } catch (e) {}

  if (!isOpen) return null;

  if (event?.isActive === false || (event?.deadline && new Date() > new Date(event.deadline))) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
           <button className={styles.closeButton} onClick={onClose}>×</button>
           <h2 className={styles.title} style={{ color: "#ef4444" }}>Registration Closed</h2>
           <p className={styles.subtitle}>This form is no longer accepting responses.</p>
        </div>
      </div>
    );
  }

  // Chunk fields into groups of 4 for pagination
  const fieldsPerStep = 4;
  const totalSteps = Math.max(1, Math.ceil(customFields.length / fieldsPerStep));
  const currentFields = customFields.slice((step - 1) * fieldsPerStep, step * fieldsPerStep);

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      nextStep();
      return;
    }
    
    setIsSubmitting(true);
    
    const res = await submitRegistration({
      eventId: event?.id,
      customData
    });

    setIsSubmitting(false);

    if (res.error) {
      alert("Something went wrong.\n\nError: " + res.error);
    } else {
      const nameKey = Object.keys(customData).find(k => k.toLowerCase().includes("name"));
      setUserName(nameKey ? customData[nameKey] : "Guest");
      setIsSuccess(true);
    }
  };

  const handleCloseSuccess = () => {
    setStep(1);
    setCustomData({});
    setIsSuccess(false);
    onClose();
  };

  if (isSuccess) {
    return (
      <div className={styles.overlay} onClick={handleCloseSuccess} style={{ zIndex: 100 }}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ display: "inline-flex", padding: "1.5rem", background: "#f0fdf4", borderRadius: "50%", marginBottom: "2rem" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#111" }}>
            Thank you, {userName}!
          </h2>
          <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "3rem", lineHeight: 1.5, maxWidth: "400px", margin: "0 auto 3rem auto" }}>
            Your registration is confirmed. We can't wait to see you at the event. 
          </p>
          <button 
            onClick={handleCloseSuccess} 
            style={{ background: "#111", border: "none", color: "white", padding: "1rem 3rem", borderRadius: "99px", fontWeight: 500, fontSize: "1.05rem", cursor: "pointer" }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose} style={{ zIndex: 100 }}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.title}>{event?.name || 'Registration Form'}</h2>
        <p className={styles.subtitle}>Step {step} of {totalSteps}</p>
        
        <div className={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`${styles.progressSegment} ${step >= i + 1 ? styles.progressSegmentActive : ''}`} 
            />
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.stepContainer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {currentFields.map((field, i) => (
              <div key={field.id || i} className={styles.inputGroup}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#111", fontSize: "0.95rem" }}>
                  {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                </label>
                
                {field.description && (
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#6b7280" }}>{field.description}</p>
                )}

                {field.type === 'select' ? (
                  <select 
                    required={field.required !== false} 
                    value={customData[field.label] || ""} 
                    onChange={(e) => setCustomData({ ...customData, [field.label]: e.target.value })}
                    style={{ width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "1rem" }}
                  >
                    <option value="">Select an option...</option>
                    {(field.options && field.options.length > 0) ? (
                      field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)
                    ) : (
                      // Fallback dummy options if none provided
                      <>
                        <option value="Option 1">Option 1</option>
                        <option value="Option 2">Option 2</option>
                      </>
                    )}
                  </select>
                ) : field.type === 'radio' ? (
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: "0.5rem" }}>
                     {(field.options && field.options.length > 0 ? field.options : ["Yes", "No"]).map((opt: string) => (
                       <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "1rem" }}>
                         <input 
                           type="radio" 
                           name={field.label}
                           value={opt}
                           required={field.required !== false}
                           checked={customData[field.label] === opt}
                           onChange={(e) => setCustomData({ ...customData, [field.label]: e.target.value })}
                           style={{ width: "18px", height: "18px", accentColor: "#111" }}
                         />
                         {opt}
                       </label>
                     ))}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea 
                    required={field.required !== false} 
                    value={customData[field.label] || ""} 
                    onChange={(e) => setCustomData({ ...customData, [field.label]: e.target.value })} 
                    rows={4}
                    placeholder="Type your answer here..."
                    style={{ width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "1rem", resize: "none" }}
                  />
                ) : (
                  <input 
                    type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "url" ? "url" : "text"} 
                    required={field.required !== false} 
                    value={customData[field.label] || ""} 
                    onChange={(e) => setCustomData({ ...customData, [field.label]: e.target.value })} 
                    placeholder="e.g. Type your answer here..."
                    style={{ width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "1rem" }}
                  />
                )}
              </div>
            ))}

          </div>

          <div className={styles.buttonRow} style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} disabled={isSubmitting} style={{ background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "0.85rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
                Back
              </button>
            )}
            <button type="submit" disabled={isSubmitting} style={{ background: "#111", border: "none", color: "white", padding: "0.85rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", flex: 1 }}>
              {step < totalSteps ? 'Next Step' : isSubmitting ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
