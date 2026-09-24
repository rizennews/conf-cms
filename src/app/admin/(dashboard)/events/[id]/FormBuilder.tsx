"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveEvent } from "../actions";
import { QRCodeSVG } from "qrcode.react";

type CustomField = { id: string; label: string; description?: string; type: string; options?: string[]; required?: boolean };

export default function FormBuilder({ initialEvent }: { initialEvent?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const [name, setName] = useState(initialEvent?.name || "Untitled Event");
  const [slug, setSlug] = useState(initialEvent?.slug || "");
  const [deadline, setDeadline] = useState(initialEvent?.deadline ? new Date(initialEvent.deadline).toISOString().slice(0, 16) : "");
  const [isActive, setIsActive] = useState(initialEvent?.isActive ?? true);
  const [isMainEvent, setIsMainEvent] = useState(initialEvent?.isMainEvent ?? false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const eventUrl = `${origin}/${slug}`;
  
  let initialFields: CustomField[] = [];
  try {
      if (initialEvent?.customFields) {
        initialFields = JSON.parse(initialEvent.customFields).map((f: any) => ({
          ...f,
          id: f.id || Math.random().toString(36).substring(2, 9)
        }));
      }
  } catch(e) {}
  
  const [fields, setFields] = useState<CustomField[]>(initialFields);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeField = activeIndex !== null ? fields[activeIndex] : null;

  const handleSave = async () => {
    setLoading(true);
    await saveEvent({
      id: initialEvent?.id,
      name,
      slug,
      deadline: deadline ? new Date(deadline) : null,
      isActive,
      isMainEvent,
      customFields: JSON.stringify(fields)
    });
    setLoading(false);
  };

  const addField = () => {
    const newField = { id: Math.random().toString(36).substring(2, 9), label: "New Question", type: "text", required: true };
    setFields([...fields, newField]);
    setActiveIndex(fields.length);
  };

  const updateActiveField = (updates: Partial<CustomField>) => {
    if (activeIndex === null) return;
    const newFields = [...fields];
    newFields[activeIndex] = { ...newFields[activeIndex], ...updates };
    setFields(newFields);
  };

  const deleteActiveField = () => {
    if (activeIndex === null) return;
    
    if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      const newFields = fields.filter((_, i) => i !== activeIndex);
      setFields(newFields);
      setActiveIndex(null);
    }
  };

  return (
    <div className="builder-wrapper" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", background: "#f3f4f6", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <style>{`
        .builder-container { display: flex; flex-direction: row; flex: 1; overflow: hidden; }
        .builder-sidebar { width: 280px; overflow-y: auto; background: #ffffff; border-right: 1px solid #e5e7eb; }
        .builder-main { flex: 1; overflow-y: auto; background: #f3f4f6; }
        .builder-settings { width: 340px; overflow-y: auto; background: #ffffff; border-left: 1px solid #e5e7eb; }
        
        @media (max-width: 1024px) {
          .builder-wrapper { height: auto !important; min-height: calc(100vh - 80px); }
          .builder-container { flex-direction: column; overflow: auto; }
          .builder-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e5e7eb; }
          .builder-settings { width: 100%; border-left: none; border-top: 1px solid #e5e7eb; }
        }
      `}</style>
      
      {/* Top Navigation */}
      <div style={{ background: "#ffffff", padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => router.push("/admin/events")} style={{ background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, color: "#6b7280" }}>
            ← Dashboard
          </button>
          <div style={{ width: "1px", height: "24px", background: "#e5e7eb" }}></div>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", border: "none", outline: "none", background: "transparent" }} 
            placeholder="Event Name"
          />
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => setShowQR(true)} style={{ background: "#ffffff", color: "#374151", padding: "0.6rem 1.2rem", borderRadius: "6px", fontWeight: 500, border: "1px solid #d1d5db", cursor: "pointer", fontSize: "0.9rem" }}>
            Share
          </button>
          <button onClick={handleSave} disabled={loading} style={{ background: "#111111", color: "white", padding: "0.6rem 1.2rem", borderRadius: "6px", fontWeight: 500, border: "none", cursor: "pointer", fontSize: "0.9rem" }}>
            {loading ? "Saving..." : "Publish Form"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left Sidebar - Content Blocks */}
        <div style={{ width: "260px", background: "#ffffff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Content</h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            
            <div 
              onClick={() => setActiveIndex(null)}
              style={{ padding: "0.75rem", borderRadius: "6px", cursor: "pointer", background: activeIndex === null ? "#eff6ff" : "transparent", color: activeIndex === null ? "#2b3ff2" : "#374151", fontWeight: activeIndex === null ? 600 : 400, marginBottom: "1rem" }}
            >
              ⚙️ Event Settings
            </div>

            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase" }}>Questions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {fields.map((field, i) => (
                <div 
                  key={field.id}
                  onClick={() => setActiveIndex(i)}
                  style={{ 
                    padding: "0.75rem", borderRadius: "6px", cursor: "pointer", 
                    background: activeIndex === i ? "#eff6ff" : "#ffffff", 
                    color: activeIndex === i ? "#2b3ff2" : "#374151",
                    fontWeight: activeIndex === i ? 600 : 400,
                    border: "1px solid",
                    borderColor: activeIndex === i ? "#bfdbfe" : "#e5e7eb",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.9rem"
                  }}
                >
                  <span style={{ color: "#9ca3af", marginRight: "0.5rem" }}>{i + 1}.</span> 
                  {field.label || "Empty Question"}
                </div>
              ))}
            </div>
            
            <button 
              onClick={addField}
              style={{ width: "100%", padding: "0.75rem", background: "transparent", border: "1px dashed #d1d5db", borderRadius: "6px", color: "#6b7280", fontWeight: 500, cursor: "pointer", marginTop: "1rem", fontSize: "0.9rem" }}
            >
              + Add Question
            </button>
          </div>
        </div>

        {/* Center Canvas - Live Preview */}
        <div style={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
          
          {activeIndex === null ? (
            <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", width: "100%", maxWidth: "500px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚙️</div>
              <h2 style={{ margin: "0 0 1rem 0", color: "#111" }}>Event Settings</h2>
              <p style={{ color: "#6b7280" }}>Edit the core details of this event in the right sidebar.</p>
            </div>
          ) : activeField ? (
            <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", width: "100%", maxWidth: "600px", transition: "all 0.3s ease" }}>
              <div style={{ color: "#2b3ff2", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{activeIndex + 1}</span> <span>→</span>
              </div>
              <h2 style={{ fontSize: "1.8rem", color: "#111", margin: "0 0 0.5rem 0", lineHeight: "1.3" }}>
                {activeField.label || "Type your question here..."}
                {activeField.required && <span style={{ color: "#ef4444", marginLeft: "0.5rem" }}>*</span>}
              </h2>
              {activeField.description && (
                <p style={{ color: "#6b7280", margin: "0 0 2rem 0", fontSize: "1.1rem" }}>{activeField.description}</p>
              )}
              <div style={{ marginTop: activeField.description ? "0" : "2rem" }}>
                {activeField.type === "text" || activeField.type === "email" || activeField.type === "tel" ? (
                  <div style={{ borderBottom: "2px solid #2b3ff2", paddingBottom: "0.5rem" }}>
                    <input type="text" placeholder="Type your answer here..." disabled style={{ background: "transparent", border: "none", fontSize: "1.2rem", color: "#9ca3af", width: "100%" }} />
                  </div>
                ) : activeField.type === "select" ? (
                  <div style={{ padding: "1rem", border: "1px solid #d1d5db", borderRadius: "8px", background: "#f9fafb", color: "#9ca3af", fontSize: "1.1rem" }}>
                    Select an option... ▾
                  </div>
                ) : activeField.type === "checkbox" ? (
                  <div style={{ padding: "1rem", border: "1px solid #d1d5db", borderRadius: "8px", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "4px", border: "2px solid #d1d5db" }}></div>
                    <span style={{ fontSize: "1.1rem", color: "#9ca3af" }}>Yes</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          
        </div>

        {/* Right Sidebar - Settings Context */}
        <div style={{ width: "300px", background: "#ffffff", borderLeft: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          
          {activeIndex === null ? (
            <>
              <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#111", fontWeight: 600 }}>Event Settings</h3>
              </div>
              <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>URL Slug</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem" }} />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>Registration Deadline</label>
                  <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem" }} />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    Form is Active (Accepting Registrations)
                  </label>
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>
                    <input type="checkbox" checked={isMainEvent} onChange={e => setIsMainEvent(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    Show on Homepage (Main Event)
                  </label>
                </div>
              </div>
            </>
          ) : activeField ? (
            <>
              <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#111", fontWeight: 600 }}>Question Settings</h3>
              </div>
              <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>Question Title</label>
                  <textarea 
                    value={activeField.label} 
                    onChange={e => updateActiveField({ label: e.target.value })}
                    rows={3}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem", resize: "none" }} 
                  />
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>Description (Optional)</label>
                  <textarea 
                    value={activeField.description || ""} 
                    onChange={e => updateActiveField({ description: e.target.value })}
                    rows={2}
                    placeholder="Add a subtitle or description..."
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem", resize: "none" }} 
                  />
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>Field Type</label>
                  <select 
                    value={activeField.type} 
                    onChange={e => updateActiveField({ type: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem", background: "#fff" }} 
                  >
                    <option value="text">Short Text</option>
                    <option value="fullname">Full Name</option>
                    <option value="textarea">Long Text (Message)</option>
                    <option value="email">Email Address</option>
                    <option value="tel">Phone Number</option>
                    <option value="url">Website / URL</option>
                    <option value="select">Dropdown Menu</option>
                    <option value="radio">Multiple Choice (Radio)</option>
                  </select>
                </div>

                {(activeField.type === "select" || activeField.type === "radio") && (
                  <div style={{ marginBottom: "1.5rem", background: "#f9fafb", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>Choices / Options</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                      {(activeField.options || []).map((opt, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "0.5rem" }}>
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={(e) => {
                              const newOpts = [...(activeField.options || [])];
                              newOpts[idx] = e.target.value;
                              updateActiveField({ options: newOpts });
                            }} 
                            style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
                          />
                          <button 
                            onClick={() => {
                              const newOpts = (activeField.options || []).filter((_, i) => i !== idx);
                              updateActiveField({ options: newOpts });
                            }} 
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => updateActiveField({ options: [...(activeField.options || []), `Option ${(activeField.options?.length || 0) + 1}`] })}
                      style={{ background: "#ffffff", border: "1px dashed #d1d5db", width: "100%", padding: "0.5rem", borderRadius: "4px", color: "#374151", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem", color: "#374151" }}>
                    <input 
                      type="checkbox" 
                      checked={activeField.required ?? true} 
                      onChange={e => updateActiveField({ required: e.target.checked })} 
                      style={{ width: "16px", height: "16px" }} 
                    />
                    Required field
                  </label>
                </div>

                <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
                  <button onClick={deleteActiveField} style={{ background: "transparent", border: "none", color: "#ef4444", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    🗑️ Delete Question
                  </button>
                </div>
              </div>
            </>
          ) : null}
          
        </div>
      </div>

      {showQR && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(17, 17, 17, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 60 }}>
          <div style={{ background: "#ffffff", padding: "2.5rem", borderRadius: "12px", textAlign: "center", maxWidth: "450px" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", color: "#111" }}>Share Event Form</h3>
            <div id="qr-container" style={{ padding: "1.5rem", background: "white", display: "inline-block", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                <QRCodeSVG value={eventUrl} size={250} level="H" includeMargin />
            </div>
            <p style={{ color: "#6b7280", wordBreak: "break-all", fontSize: "0.95rem", margin: "0 0 1.5rem 0", padding: "1rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <a href={eventUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2b3ff2", textDecoration: "none", fontWeight: 500 }}>{eventUrl}</a>
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => setShowQR(false)} style={{ background: "transparent", border: "1px solid #d1d5db", padding: "0.75rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                Close
              </button>
              <button 
                onClick={() => {
                  const svg = document.querySelector('#qr-container svg') as SVGElement;
                  if (!svg) return;
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const data = (new XMLSerializer()).serializeToString(svg);
                  const DOMURL = window.URL || window.webkitURL || window;
                  const img = new Image();
                  const svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
                  const url = DOMURL.createObjectURL(svgBlob);
                  img.onload = function () {
                    canvas.width = img.width; canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    DOMURL.revokeObjectURL(url);
                    const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                    const evt = new MouseEvent("click", { view: window, bubbles: false, cancelable: true });
                    const a = document.createElement("a");
                    a.setAttribute("download", slug + "-qr.png");
                    a.setAttribute("href", imgURI);
                    a.dispatchEvent(evt);
                  };
                  img.src = url;
                }} 
                style={{ background: "#2b3ff2", border: "none", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
