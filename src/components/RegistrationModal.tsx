import { useState } from "react";
import styles from "./RegistrationModal.module.css";
import { submitRegistration } from "../app/actions";
import { QRCodeSVG } from "qrcode.react";

type BranchType = { id: string | number; name: string };
type EventType = { id?: string | number; name?: string; isActive?: boolean; deadline?: string | Date | null; customFields?: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  branches?: BranchType[];
  event?: EventType | null;
  initialBranch?: string;
  initialHeardFrom?: string;
};

const InputLabel = ({ children, required, description }: { children: React.ReactNode, required?: boolean, description?: string }) => (
  <div style={{ marginBottom: "0.5rem" }}>
    <label style={{ display: "block", fontWeight: 600, color: "#111", fontSize: "0.95rem" }}>
      {children} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    {description && <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#6b7280" }}>{description}</p>}
  </div>
);

const COUNTRIES = [
  { code: "gh", dial: "+233", name: "Ghana" },
  { code: "ng", dial: "+234", name: "Nigeria" },
  { code: "ke", dial: "+254", name: "Kenya" },
  { code: "za", dial: "+27", name: "South Africa" },
  { code: "us", dial: "+1", name: "United States" },
  { code: "gb", dial: "+44", name: "United Kingdom" },
  { code: "tg", dial: "+228", name: "Togo" },
  { code: "ci", dial: "+225", name: "Ivory Coast" },
];

export default function RegistrationModal({ isOpen, onClose, event, initialBranch, initialHeardFrom }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  
  const [website, setWebsite] = useState(""); // Honeypot
  const [countryCode, setCountryCode] = useState("gh");
  const [customData, setCustomData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (event?.customFields && typeof event.customFields === "string") {
      try {
        const parsed = JSON.parse(event.customFields);
        parsed.forEach((field: Record<string, unknown>) => {
          const label = String(field.label || "");
          const lowerLabel = label.toLowerCase();
          if (initialBranch && lowerLabel.includes("branch")) init[label] = initialBranch;
          if (initialHeardFrom && (lowerLabel.includes("hear") || lowerLabel.includes("heard"))) init[label] = initialHeardFrom;
          if (lowerLabel.includes("member")) init[label] = "No";
          if (lowerLabel.includes("first time") || lowerLabel.includes("first-time")) init[label] = "Yes";
          if (lowerLabel.includes("status") && !lowerLabel.includes("first time")) init[label] = "Guest";
        });
      } catch { /* ignore */ }
    }
    return init;
  });
  const [currentPage, setCurrentPage] = useState(0);

  let parsedCustomFields: Record<string, unknown>[] = [];
  try {
    if (event?.customFields && typeof event.customFields === "string") {
      parsedCustomFields = JSON.parse(event.customFields);
    }
  } catch { /* ignore */ }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dialCode = COUNTRIES.find(c => c.code === countryCode)?.dial || "";

    // Map dynamic fields to standard schemas
    let fullName = "", email = "", whatsapp = "", address = "", ageRange = "", isMember = "", isFirstTime = "", branchName = "", otherBranch = "", heardFrom = "", invitees = "", registrantStatus = "";

    parsedCustomFields.forEach((field: Record<string, unknown>) => {
      const fieldLabel = String(field.label || "");
      const fieldType = String(field.type || "");
      const val = customData[fieldLabel] as string;
      if (!val) return;
      
      const lowerLabel = fieldLabel.toLowerCase();
      if (fieldType === "fullname" || lowerLabel.includes("full name") || lowerLabel.includes("name")) {
        if (!fullName) fullName = val;
      }
      if (fieldType === "email" || lowerLabel.includes("email")) {
        if (!email) email = val;
      }
      if (fieldType === "tel" || lowerLabel.includes("phone") || lowerLabel.includes("whatsapp") || lowerLabel.includes("contact")) {
        if (!whatsapp) whatsapp = val;
      }
      if (lowerLabel.includes("address") || lowerLabel.includes("home") || lowerLabel.includes("residence") || lowerLabel.includes("location")) {
        if (!address && !lowerLabel.includes("email")) address = val;
      }
      if (lowerLabel.includes("age")) {
        if (!ageRange) ageRange = val;
      }
      if (lowerLabel.includes("branch")) {
        if (!branchName) branchName = val;
      }
      if (lowerLabel.includes("specify") || lowerLabel.includes("other church") || lowerLabel.includes("other branch") || lowerLabel.includes("if other")) {
        if (!otherBranch) otherBranch = val;
      }
      if (lowerLabel.includes("first time") || lowerLabel.includes("first-time")) {
        if (!isFirstTime) isFirstTime = val;
      }
      if (lowerLabel.includes("member")) {
        if (!isMember) isMember = val;
      }
      if (lowerLabel.includes("hear") || lowerLabel.includes("heard")) {
        if (!heardFrom) heardFrom = val;
      }
      if (lowerLabel.includes("invite") || lowerLabel.includes("details of y")) {
        if (!invitees) invitees = val;
      }
      if (lowerLabel.includes("status") && !lowerLabel.includes("first time")) {
        if (!registrantStatus) registrantStatus = val;
      }
    });

    const res = await submitRegistration({
      eventId: event?.id ? String(event.id) : undefined,
      fullName,
      email,
      whatsapp: whatsapp ? `${dialCode} ${whatsapp}`.trim() : "",
      address,
      ageRange,
      isMember,
      isFirstTime,
      branchName,
      otherBranch,
      heardFrom,
      invitees,
      registrantStatus,
      website,
      customData: {
        ...customData,
        _countryCode: countryCode
      }
    });

    setIsSubmitting(false);

    if (res.error) {
      alert("Something went wrong.\n\nError: " + res.error);
    } else {
      if (res.id) setRegistrationId(String(res.id));
      setIsSuccess(true);
    }
  };

  const handleCloseSuccess = () => {
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
      
      let finalName = "Guest";
      parsedCustomFields.forEach((field: Record<string, unknown>) => {
        const fieldLabel = String(field.label || "");
        const fieldType = String(field.type || "");
        if ((fieldType === "fullname" || fieldLabel.toLowerCase().includes("name")) && customData[fieldLabel]) {
          finalName = customData[fieldLabel];
        }
      });
      
      downloadLink.download = `${finalName.replace(/\s+/g, "_")}_Ticket.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (isSuccess) {
    let finalName = "Guest";
    parsedCustomFields.forEach((field: Record<string, unknown>) => {
      const fieldLabel = String(field.label || "");
      const fieldType = String(field.type || "");
      if ((fieldType === "fullname" || fieldLabel.toLowerCase().includes("name")) && customData[fieldLabel]) {
        finalName = customData[fieldLabel];
      }
    });

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
            Thank you, {finalName}!
          </h2>
          <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.5, maxWidth: "400px", margin: "0 auto 1.5rem auto" }}>
            Your registration is confirmed. Please save this QR code to check in at {event?.name || 'the event'}. 
          </p>
          
          <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "12px", border: "1px dashed #d1d5db", marginBottom: "2rem", display: "inline-block" }}>
            <QRCodeSVG id="registration-qr-code" value={registrationId} size={160} level="H" aria-label={`QR Code for ${finalName}`} />
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={handleCloseSuccess} style={{ background: "transparent", border: "1px solid #d1d5db", color: "#374151", padding: "0.85rem 2rem", borderRadius: "99px", fontWeight: 600, cursor: "pointer" }}>
              Done
            </button>
            <button onClick={downloadQR} style={{ background: "#2b3ff2", border: "none", color: "white", padding: "0.85rem 2rem", borderRadius: "99px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Download Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = { width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "1rem" };

  if (parsedCustomFields.length === 0) {
    return (
      <div className={styles.overlay} onClick={onClose} style={{ zIndex: 100 }}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close registration form">×</button>
          <h2 className={styles.title}>{event?.name || 'Registration Form'}</h2>
          <p style={{ color: "#6b7280", textAlign: "center", margin: "2rem 0" }}>No questions have been added to this event form yet.</p>
        </div>
      </div>
    );
  }

  const visibleFields = parsedCustomFields.filter((field: Record<string, unknown>) => {
    const fieldCondition = field.condition as Record<string, string> | undefined;
    if (fieldCondition && fieldCondition.dependentFieldId) {
       const depField = parsedCustomFields.find((f: Record<string, unknown>) => f.id === fieldCondition.dependentFieldId);
       if (depField) {
         const val = customData[String(depField.label || "")] || "";
         const ruleVal = String(fieldCondition.value);
         if (fieldCondition.operator === "eq" && val.toLowerCase() !== ruleVal.toLowerCase()) return false;
         if (fieldCondition.operator === "neq" && val.toLowerCase() === ruleVal.toLowerCase()) return false;
       }
    }
    
    // Legacy hack for 'Other' branch specify
    const lowerLabel = String(field.label || "").toLowerCase();
    if (lowerLabel.includes("specify") && lowerLabel.includes("other")) {
       let hasOtherSelected = false;
       parsedCustomFields.forEach((f: Record<string, unknown>) => {
          const l = String(f.label || "").toLowerCase();
          if (l.includes("branch") && customData[String(f.label || "")] === "Other") {
             hasOtherSelected = true;
          }
       });
       if (!hasOtherSelected) return false;
    }
    return true;
  });

  const pages: Record<string, unknown>[][] = [[]];
  visibleFields.forEach((f: Record<string, unknown>) => {
    if (f.type === "page_break") {
      pages.push([]);
    } else {
      pages[pages.length - 1].push(f);
    }
  });

  const activePageFields = pages[currentPage] || [];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setCurrentPage(p => Math.min(p + 1, pages.length - 1));
  };
  
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(p => Math.max(p - 1, 0));
  };

  return (
    <div className={styles.overlay} onClick={onClose} style={{ zIndex: 100 }}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close registration form">×</button>
        <h2 className={styles.title}>{event?.name || 'Registration Form'}</h2>
        
        {pages.length > 1 && (
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", justifyContent: "center" }}>
            {pages.map((_, idx) => (
              <div key={idx} style={{ height: "4px", flex: 1, maxWidth: "40px", borderRadius: "2px", background: idx <= currentPage ? "#2b3ff2" : "#e5e7eb", transition: "background 0.3s" }} />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.stepContainer} style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "0.5rem" }}>
            
            <input 
              type="text" 
              name="website" 
              value={website} 
              onChange={e => setWebsite(e.target.value)} 
              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }} 
              tabIndex={-1} 
              aria-hidden="true" 
              autoComplete="off" 
            />

            {activePageFields.map((field: Record<string, unknown>) => {
              const fieldId = String(field.id);
              const fieldLabel = String(field.label);
              const fieldDescription = field.description ? String(field.description) : undefined;
              const fieldType = String(field.type);
              const fieldRequired = Boolean(field.required);
              const fieldOptions = (field.options as string[]) || [];

              // If the field is a phone number, append country code
              if (fieldType === "tel" || fieldLabel.toLowerCase().includes("contact") || fieldLabel.toLowerCase().includes("phone") || fieldLabel.toLowerCase().includes("whatsapp")) {
                return (
                  <div key={fieldId} className={styles.inputGroup}>
                    <InputLabel required={fieldRequired} description={fieldDescription}>{fieldLabel}</InputLabel>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 0.5rem' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://flagcdn.com/w20/${countryCode}.png`} alt={countryCode} width="20" style={{ borderRadius: '2px' }} />
                        <select 
                          value={countryCode} 
                          onChange={e => setCountryCode(e.target.value)}
                          style={{ border: 'none', background: 'transparent', padding: '0.85rem 0.5rem', outline: 'none', color: '#111', cursor: 'pointer' }}
                          aria-label="Country code"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>{c.dial}</option>
                          ))}
                        </select>
                      </div>
                      <input 
                        type="tel" 
                        required={fieldRequired} 
                        value={customData[fieldLabel] || ""} 
                        onChange={e => setCustomData({...customData, [fieldLabel]: e.target.value})} 
                        style={{ ...inputStyle, flex: 1 }} 
                      />
                    </div>
                  </div>
                );
              }

              return (
              <div key={fieldId} className={`${styles.inputGroup} ${fieldType === 'textarea' || fieldType === 'address' ? styles.fullWidth : ''}`}>
                <InputLabel required={fieldRequired} description={fieldDescription}>{fieldLabel}</InputLabel>
                
                {fieldType === "text" || fieldType === "email" || fieldType === "url" || fieldType === "fullname" || fieldType === "address" || fieldType === "number" || fieldType === "date" || fieldType === "time" ? (
                  <input 
                    type={fieldType === "fullname" || fieldType === "address" ? "text" : fieldType} 
                    required={fieldRequired} 
                    value={customData[fieldLabel] || ""} 
                    onChange={e => setCustomData({...customData, [fieldLabel]: e.target.value})} 
                    style={inputStyle} 
                  />
                ) : fieldType === "textarea" ? (
                  <textarea 
                    required={fieldRequired} 
                    value={customData[fieldLabel] || ""} 
                    onChange={e => setCustomData({...customData, [fieldLabel]: e.target.value})} 
                    style={{ ...inputStyle, minHeight: "80px" }} 
                  />
                ) : fieldType === "select" ? (
                  <select 
                    required={fieldRequired} 
                    value={customData[fieldLabel] || ""} 
                    onChange={e => setCustomData({...customData, [fieldLabel]: e.target.value})} 
                    style={inputStyle}
                  >
                    <option value="">Select an option...</option>
                    {fieldOptions.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : fieldType === "radio" ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: "0.5rem" }}>
                    {fieldOptions.map((opt: string) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "1rem" }}>
                        <input 
                          type="radio" 
                          name={`custom_${fieldId}`} 
                          value={opt} 
                          required={fieldRequired} 
                          checked={customData[fieldLabel] === opt} 
                          onChange={e => setCustomData({...customData, [fieldLabel]: e.target.value})} 
                          style={{ width: "18px", height: "18px", accentColor: "#111" }} 
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            )})}

          </div>

          <div className={styles.buttonRow} style={{ marginTop: "2rem", display: "flex", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
            {currentPage > 0 && (
              <button type="button" onClick={handlePrev} disabled={isSubmitting} style={{ background: "transparent", border: "1px solid #d1d5db", color: "#374151", padding: "0.85rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "1.05rem" }}>
                Previous
              </button>
            )}
            
            {currentPage < pages.length - 1 ? (
              <button type="button" onClick={handleNext} disabled={isSubmitting} style={{ background: "#111", border: "none", color: "white", padding: "0.85rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", flex: 1, fontSize: "1.05rem" }}>
                Next
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} style={{ background: "#2b3ff2", border: "none", color: "white", padding: "0.85rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", flex: 1, fontSize: "1.05rem" }}>
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
