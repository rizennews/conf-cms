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
};

const InputLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#111", fontSize: "0.95rem" }}>
    {children} {required && <span style={{ color: "#ef4444" }}>*</span>}
  </label>
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

export default function RegistrationModal({ isOpen, onClose, branches = [], event }: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    address: "",
    ageRange: "",
    isMember: "Yes",
    isFirstTime: "Yes",
    branchName: "",
    otherBranch: "",
    heardFrom: "",
    invitees: "",
    registrantStatus: "",
    website: "", // Honeypot field
  });
  const [countryCode, setCountryCode] = useState("gh");
  const [customData, setCustomData] = useState<Record<string, string>>({});

  let parsedCustomFields: Record<string, unknown>[] = [];
  try {
    if (event?.customFields && typeof event.customFields === "string") {
      parsedCustomFields = JSON.parse(event.customFields);
    }
  } catch { /* ignore */ }

  const hasCustomFields = parsedCustomFields.length > 0;
  const totalSteps = hasCustomFields ? 4 : 3;

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



  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      nextStep();
      return;
    }
    
    setIsSubmitting(true);
    
    const dialCode = COUNTRIES.find(c => c.code === countryCode)?.dial || "";
    
    const res = await submitRegistration({
      eventId: event?.id ? String(event.id) : undefined,
      ...formData,
      whatsapp: `${dialCode} ${formData.whatsapp}`.trim(),
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
    setStep(1);
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
      downloadLink.download = `${(formData.fullName || "Guest").replace(/\s+/g, "_")}_Ticket.png`;
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
            Thank you, {formData.fullName}!
          </h2>
          <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.5, maxWidth: "400px", margin: "0 auto 1.5rem auto" }}>
            Your registration is confirmed. Please save this QR code to check in at {event?.name || 'the event'}. 
          </p>
          
          <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "12px", border: "1px dashed #d1d5db", marginBottom: "2rem", display: "inline-block" }}>
            <QRCodeSVG id="registration-qr-code" value={registrationId} size={160} level="H" aria-label={`QR Code for ${formData.fullName}`} />
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

  return (
    <div className={styles.overlay} onClick={onClose} style={{ zIndex: 100 }}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close registration form">×</button>
        <h2 className={styles.title}>{event?.name || 'Registration Form'}</h2>
        <p className={styles.subtitle}>Step {step} of {totalSteps}</p>
        
        <div className={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`${styles.progressSegment} ${step >= i + 1 ? styles.progressSegmentActive : ''}`} />
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.stepContainer}>
            
            {step === 1 && (
              <>
                {/* Honeypot field for anti-spam */}
                <input 
                  type="text" 
                  name="website" 
                  value={formData.website} 
                  onChange={e => setFormData({...formData, website: e.target.value})} 
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }} 
                  tabIndex={-1} 
                  aria-hidden="true" 
                  autoComplete="off" 
                />

                <div className={styles.inputGroup}>
                  <InputLabel required>Full Name</InputLabel>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" style={inputStyle} />
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel required>Email</InputLabel>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" style={inputStyle} />
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel required>Phone / WhatsApp</InputLabel>
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
                      required 
                      value={formData.whatsapp} 
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                      placeholder="Phone Number" 
                      style={{ ...inputStyle, flex: 1 }} 
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel required>Address / Location</InputLabel>
                  <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="City, Region" style={inputStyle} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className={styles.inputGroup}>
                  <InputLabel required>Age Range</InputLabel>
                  <select required value={formData.ageRange} onChange={e => setFormData({...formData, ageRange: e.target.value})} style={inputStyle}>
                    <option value="">Select an option...</option>
                    <option value="Under 18">Under 18</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55-64">55-64</option>
                    <option value="65+">65+</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel required>Branch</InputLabel>
                  <select required value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} style={inputStyle}>
                    <option value="">Select an option...</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {formData.branchName === "Other" && (
                    <div style={{ marginTop: "1rem" }}>
                      <InputLabel required>Please specify</InputLabel>
                      <input type="text" required value={formData.otherBranch} onChange={e => setFormData({...formData, otherBranch: e.target.value})} placeholder="Branch name" style={inputStyle} />
                    </div>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel required>Registrant Status</InputLabel>
                  <select required value={formData.registrantStatus} onChange={e => setFormData({...formData, registrantStatus: e.target.value})} style={inputStyle}>
                    <option value="">Select an option...</option>
                    <option value="Member">Member</option>
                    <option value="First-time Guest">First-time Guest</option>
                    <option value="Regular Attendee">Regular Attendee</option>
                    <option value="Worker / Volunteer">Worker / Volunteer</option>
                    <option value="Minister / Clergy">Minister / Clergy</option>
                  </select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className={styles.inputGroup}>
                  <InputLabel required>Are you a church member?</InputLabel>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: "0.5rem" }}>
                     {["Yes", "No"].map(opt => (
                       <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "1rem" }}>
                         <input type="radio" name="isMember" value={opt} required checked={formData.isMember === opt} onChange={e => setFormData({...formData, isMember: e.target.value})} style={{ width: "18px", height: "18px", accentColor: "#111" }} />
                         {opt}
                       </label>
                     ))}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel required>Is this your first time?</InputLabel>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: "0.5rem" }}>
                     {["Yes", "No"].map(opt => (
                       <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "1rem" }}>
                         <input type="radio" name="isFirstTime" value={opt} required checked={formData.isFirstTime === opt} onChange={e => setFormData({...formData, isFirstTime: e.target.value})} style={{ width: "18px", height: "18px", accentColor: "#111" }} />
                         {opt}
                       </label>
                     ))}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel>How did you hear about us?</InputLabel>
                  <input type="text" value={formData.heardFrom} onChange={e => setFormData({...formData, heardFrom: e.target.value})} placeholder="E.g. Social Media, Friend" style={inputStyle} />
                </div>
                <div className={styles.inputGroup}>
                  <InputLabel>Who invited you? (Optional)</InputLabel>
                  <input type="text" value={formData.invitees} onChange={e => setFormData({...formData, invitees: e.target.value})} placeholder="Name of person" style={inputStyle} />
                </div>
              </>
            )}

            {step === 4 && hasCustomFields && (
              <>
                <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1rem" }}>Additional Information</p>
                {parsedCustomFields.map((field: Record<string, unknown>) => {
                  const fieldId = String(field.id);
                  const fieldLabel = String(field.label);
                  const fieldType = String(field.type);
                  const fieldRequired = Boolean(field.required);
                  const fieldOptions = (field.options as string[]) || [];

                  return (
                  <div key={fieldId} className={styles.inputGroup}>
                    <InputLabel required={fieldRequired}>{fieldLabel}</InputLabel>
                    
                    {fieldType === "text" || fieldType === "email" || fieldType === "tel" || fieldType === "url" || fieldType === "fullname" ? (
                      <input 
                        type={fieldType === "fullname" ? "text" : fieldType} 
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
              </>
            )}

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
