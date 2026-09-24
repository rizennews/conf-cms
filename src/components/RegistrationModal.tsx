import { useState } from "react";
import styles from "./RegistrationModal.module.css";
import { submitRegistration } from "../app/actions";
import { QRCodeSVG } from "qrcode.react";

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
  const [registrationId, setRegistrationId] = useState("");
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
      if (res.id) setRegistrationId(String(res.id));
      setIsSuccess(true);
    }
  };

  const handleCloseSuccess = () => {
    setStep(1);
    setCustomData({});
    setIsSuccess(false);
    onClose();
  };

  const downloadQR = () => {
    const svg = document.getElementById("registration-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${userName.replace(/\s+/g, "_") || "Guest"}_Ticket.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (isSuccess) {
    return (
      <div className={styles.overlay} onClick={handleCloseSuccess} style={{ zIndex: 100 }}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ textAlign: "center", padding: "3rem 2rem", maxWidth: "450px" }}>
          <div style={{ display: "inline-flex", padding: "1rem", background: "#f0fdf4", borderRadius: "50%", marginBottom: "1.5rem" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#111" }}>
            Thank you, {userName}!
          </h2>
          <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.5, maxWidth: "400px", margin: "0 auto 1.5rem auto" }}>
            Your registration is confirmed. Please save this QR code to check in at {event?.name || 'the event'}. 
          </p>
          
          <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "12px", border: "1px dashed #d1d5db", marginBottom: "2rem", display: "inline-block" }}>
            <QRCodeSVG id="registration-qr-code" value={registrationId} size={160} level="H" />
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button 
              onClick={handleCloseSuccess} 
              style={{ background: "transparent", border: "1px solid #d1d5db", color: "#374151", padding: "0.85rem 2rem", borderRadius: "99px", fontWeight: 600, cursor: "pointer" }}
            >
              Done
            </button>
            <button 
              onClick={downloadQR}
              style={{ background: "#2b3ff2", border: "none", color: "white", padding: "0.85rem 2rem", borderRadius: "99px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Ticket
            </button>
          </div>
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
                  <>
                  <select 
                    required={field.required !== false} 
                    value={customData[field.label] || ""} 
                    onChange={(e) => setCustomData({ ...customData, [field.label]: e.target.value })}
                    style={{ width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "1rem" }}
                  >
                    <option value="">Select an option...</option>
                    {(field.label.toLowerCase().includes("branch") || field.label.toLowerCase().includes("church")) && !field.label.toLowerCase().includes("member") ? (
                      <>
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        <option value="Other">Other</option>
                      </>
                    ) : (field.options && field.options.length > 0) ? (
                      field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)
                    ) : (
                      <>
                        <option value="Option 1">Option 1</option>
                        <option value="Option 2">Option 2</option>
                      </>
                    )}
                  </select>
                  
                  {field.type === 'select' && customData[field.label] === "Other" && (
                    <div style={{ marginTop: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#111", fontSize: "0.95rem" }}>
                        Please specify <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={customData["otherBranch"] || ""} 
                        onChange={(e) => setCustomData({ ...customData, "otherBranch": e.target.value })} 
                        placeholder="Type your branch name..."
                        style={{ width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "1rem" }}
                      />
                    </div>
                  )}
                  </>
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
