"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import jsonAPI from "@/app/api/jsonAPI";
import { ChevronLeft, Save, Trash2, Plus, Check, Upload, X, Image, Type, Palette, Settings, Eye } from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface TicketTemplate {
    id: number;
    name: string;
    is_default: boolean;
    config: TicketConfig;
    logo: string | null;
    secondary_logo: string | null;
    background_image: string | null;
}

interface TicketConfig {
    accent_color: string;
    bg_color: string;
    text_color: string;
    secondary_text_color: string;
    border_color: string;
    font: string;
    ticket_type_label: string;
    border_style: string;
    show_prizes: boolean;
    show_guidelines_link: boolean;
    custom_header_text: string | null;
    organizer_subtitle: string | null;
    custom_footer_text: string | null;
    logo_url: string | null;
    secondary_logo_url: string | null;
    background_image_url: string | null;
}

const DEFAULT_CONFIG: TicketConfig = {
    accent_color: "#1db9a0",
    bg_color: "#121212",
    text_color: "#ffffff",
    secondary_text_color: "#aaaaaa",
    border_color: "#1db9a0",
    font: "Inter",
    ticket_type_label: "GENERAL",
    border_style: "none",
    show_prizes: true,
    show_guidelines_link: true,
    custom_header_text: null,
    organizer_subtitle: null,
    custom_footer_text: null,
    logo_url: null,
    secondary_logo_url: null,
    background_image_url: null,
};

const FONT_OPTIONS = [
    "Inter", "Roboto", "Poppins", "Outfit", "Montserrat",
    "Playfair Display", "Space Grotesk", "DM Sans", "Lato", "Raleway",
];

const TICKET_TYPE_OPTIONS = ["GENERAL", "EARLY BIRD", "VIP", "PREMIUM", "STUDENT", "FREE"];
const BORDER_STYLE_OPTIONS = ["none", "solid", "dashed", "double"];

/* ─── Component ─────────────────────────────────── */
export default function TicketDesigner() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TicketTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [config, setConfig] = useState<TicketConfig>(DEFAULT_CONFIG);
    const [isDefault, setIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"colors" | "typography" | "branding" | "content" | "options">("colors");

    // File upload states
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [secondaryLogoFile, setSecondaryLogoFile] = useState<File | null>(null);
    const [bgImageFile, setBgImageFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [secondaryLogoPreview, setSecondaryLogoPreview] = useState<string | null>(null);
    const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [removeSecondaryLogo, setRemoveSecondaryLogo] = useState(false);
    const [removeBgImage, setRemoveBgImage] = useState(false);

    const logoRef = useRef<HTMLInputElement>(null);
    const secondaryLogoRef = useRef<HTMLInputElement>(null);
    const bgImageRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchTemplates(); }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await jsonAPI.get("/api/v1/ticket-templates/list");
            setTemplates(data);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        }
    };

    const selectTemplate = (t: TicketTemplate) => {
        setSelectedTemplate(t);
        setTemplateName(t.name);
        setConfig({ ...DEFAULT_CONFIG, ...t.config });
        setIsDefault(t.is_default);
        setIsCreating(false);
        resetFileUploads();
        setLogoPreview(t.logo || null);
        setSecondaryLogoPreview(t.secondary_logo || null);
        setBgImagePreview(t.background_image || null);
    };

    const startCreating = () => {
        setSelectedTemplate(null);
        setIsCreating(true);
        setTemplateName("");
        setConfig(DEFAULT_CONFIG);
        setIsDefault(false);
        resetFileUploads();
    };

    const resetFileUploads = () => {
        setLogoFile(null);
        setSecondaryLogoFile(null);
        setBgImageFile(null);
        setLogoPreview(null);
        setSecondaryLogoPreview(null);
        setBgImagePreview(null);
        setRemoveLogo(false);
        setRemoveSecondaryLogo(false);
        setRemoveBgImage(false);
    };

    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: (f: File | null) => void,
        setPreview: (p: string | null) => void,
        setRemove: (r: boolean) => void,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
            setRemove(false);
        }
    };

    const handleRemoveImage = (
        setFile: (f: File | null) => void,
        setPreview: (p: string | null) => void,
        setRemove: (r: boolean) => void,
    ) => {
        setFile(null);
        setPreview(null);
        setRemove(true);
    };

    const saveTemplate = async () => {
        if (!templateName.trim()) {
            setMessage({ type: "error", text: "Template name is required" });
            return;
        }
        setSaving(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("name", templateName);
        formData.append("is_default", String(isDefault));
        formData.append("config", JSON.stringify(config));
        if (logoFile) formData.append("logo", logoFile);
        if (secondaryLogoFile) formData.append("secondary_logo", secondaryLogoFile);
        if (bgImageFile) formData.append("background_image", bgImageFile);

        try {
            if (selectedTemplate) {
                formData.append("remove_logo", String(removeLogo));
                formData.append("remove_secondary_logo", String(removeSecondaryLogo));
                formData.append("remove_background_image", String(removeBgImage));
                await jsonAPI.put(`/api/v1/ticket-templates/${selectedTemplate.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setMessage({ type: "success", text: "Template updated!" });
            } else {
                await jsonAPI.post("/api/v1/ticket-templates/create", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setMessage({ type: "success", text: "Template created!" });
            }
            fetchTemplates();
            if (!selectedTemplate) setIsCreating(false);
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Save failed" });
        } finally {
            setSaving(false);
        }
    };

    const deleteTemplate = async () => {
        if (!selectedTemplate || !confirm("Delete this template?")) return;
        try {
            await jsonAPI.delete(`/api/v1/ticket-templates/${selectedTemplate.id}`);
            setSelectedTemplate(null);
            setIsCreating(false);
            fetchTemplates();
            setMessage({ type: "success", text: "Template deleted" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Delete failed" });
        }
    };

    /* ─── ImageUpload helper ─────────────────────── */
    const ImageUpload = ({
        label, preview, inputRef, onSelect, onRemove,
    }: {
        label: string;
        preview: string | null;
        inputRef: React.RefObject<HTMLInputElement>;
        onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onRemove: () => void;
    }) => (
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>{label}</label>
            {preview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={preview} alt={label} style={{ maxHeight: 80, borderRadius: 8, border: "1px solid #333" }} />
                    <button
                        onClick={onRemove}
                        style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <X size={12} color="white" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#1e1e2e", border: "1px dashed #444", borderRadius: 8, color: "#aaa", cursor: "pointer", fontSize: 13 }}
                >
                    <Upload size={16} /> Upload {label}
                </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onSelect} />
        </div>
    );

    const isEditing = isCreating || selectedTemplate;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a12" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "24px 32px", marginLeft: 80, color: "#fff" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {isEditing && (
                            <button onClick={() => { setSelectedTemplate(null); setIsCreating(false); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
                            {isCreating ? "New Ticket Template" : selectedTemplate ? "Edit Template" : "Ticket Templates"}
                        </h1>
                    </div>
                    {isEditing && (
                        <div style={{ display: "flex", gap: 10 }}>
                            {selectedTemplate && (
                                <button onClick={deleteTemplate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2a1515", border: "1px solid #4a2020", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            )}
                            <button onClick={saveTemplate} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: config.accent_color, border: "none", borderRadius: 8, color: "#000", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                                <Save size={16} /> {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    )}
                </div>

                {message && (
                    <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, background: message.type === "success" ? "#0d2818" : "#2a1515", color: message.type === "success" ? "#4ade80" : "#ef4444", border: `1px solid ${message.type === "success" ? "#166534" : "#4a2020"}`, fontSize: 13 }}>
                        {message.text}
                    </div>
                )}

                {!isEditing ? (
                    /* ─── Template List ─────────────────────── */
                    <div>
                        <button onClick={startCreating} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#1db9a0", border: "none", borderRadius: 10, color: "#000", cursor: "pointer", fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
                            <Plus size={18} /> New Ticket Template
                        </button>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                            {templates.map((t) => (
                                <div key={t.id} onClick={() => selectTemplate(t)} style={{ background: "#14141f", borderRadius: 12, padding: 20, cursor: "pointer", border: "1px solid #1e1e2e", transition: "all 0.2s" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                        <span style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</span>
                                        {t.is_default && <span style={{ fontSize: 10, background: "#1db9a0", color: "#000", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>DEFAULT</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                        {[t.config?.accent_color, t.config?.bg_color, t.config?.text_color].filter(Boolean).map((c, i) => (
                                            <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: c || "#333", border: "1px solid #333" }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 12, color: "#666" }}>{t.config?.font || "Inter"} · {t.config?.ticket_type_label || "GENERAL"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* ─── Editor ────────────────────────────── */
                    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>
                        {/* Left Panel — Controls */}
                        <div style={{ background: "#14141f", borderRadius: 14, padding: 20, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
                            <input
                                placeholder="Template Name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#fff", fontSize: 14, marginBottom: 12 }}
                            />
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa", marginBottom: 16, cursor: "pointer" }}>
                                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} style={{ accentColor: config.accent_color }} />
                                Set as default template
                            </label>

                            {/* Tabs */}
                            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                                {([
                                    { key: "colors", icon: <Palette size={14} />, label: "Colors" },
                                    { key: "typography", icon: <Type size={14} />, label: "Font" },
                                    { key: "branding", icon: <Image size={14} />, label: "Branding" },
                                    { key: "content", icon: <Eye size={14} />, label: "Content" },
                                    { key: "options", icon: <Settings size={14} />, label: "Options" },
                                ] as const).map(({ key, icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "none", background: activeTab === key ? config.accent_color : "#1e1e2e", color: activeTab === key ? "#000" : "#aaa", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                                    >
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>

                            {/* Colors Tab */}
                            {activeTab === "colors" && (
                                <div>
                                    {[
                                        { key: "accent_color", label: "Accent Color" },
                                        { key: "bg_color", label: "Background Color" },
                                        { key: "text_color", label: "Text Color" },
                                        { key: "secondary_text_color", label: "Secondary Text" },
                                        { key: "border_color", label: "Border Color" },
                                    ].map(({ key, label }) => (
                                        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                            <label style={{ fontSize: 13, color: "#ccc" }}>{label}</label>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <input
                                                    type="color"
                                                    value={(config as any)[key]}
                                                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                                                    style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                                                />
                                                <input
                                                    type="text"
                                                    value={(config as any)[key]}
                                                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                                                    style={{ width: 80, padding: "4px 8px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 12, fontFamily: "monospace" }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Typography Tab */}
                            {activeTab === "typography" && (
                                <div>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Font Family</label>
                                    <select
                                        value={config.font}
                                        onChange={(e) => setConfig({ ...config, font: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 16 }}
                                    >
                                        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <p style={{ fontSize: 22, fontFamily: `"${config.font}", sans-serif`, color: "#fff", padding: 16, background: "#1e1e2e", borderRadius: 8, textAlign: "center" }}>
                                        The quick brown fox
                                    </p>
                                </div>
                            )}

                            {/* Branding Tab */}
                            {activeTab === "branding" && (
                                <div>
                                    <ImageUpload label="Primary Logo" preview={logoPreview} inputRef={logoRef as any}
                                        onSelect={(e) => handleFileSelect(e, setLogoFile, setLogoPreview, setRemoveLogo)}
                                        onRemove={() => handleRemoveImage(setLogoFile, setLogoPreview, setRemoveLogo)} />
                                    <ImageUpload label="Secondary / Sponsor Logo" preview={secondaryLogoPreview} inputRef={secondaryLogoRef as any}
                                        onSelect={(e) => handleFileSelect(e, setSecondaryLogoFile, setSecondaryLogoPreview, setRemoveSecondaryLogo)}
                                        onRemove={() => handleRemoveImage(setSecondaryLogoFile, setSecondaryLogoPreview, setRemoveSecondaryLogo)} />
                                    <ImageUpload label="Background Image" preview={bgImagePreview} inputRef={bgImageRef as any}
                                        onSelect={(e) => handleFileSelect(e, setBgImageFile, setBgImagePreview, setRemoveBgImage)}
                                        onRemove={() => handleRemoveImage(setBgImageFile, setBgImagePreview, setRemoveBgImage)} />
                                </div>
                            )}

                            {/* Content Tab */}
                            {activeTab === "content" && (
                                <div>
                                    {[
                                        { key: "custom_header_text", label: "Custom Header Text", placeholder: "e.g. 'Season 2026'" },
                                        { key: "organizer_subtitle", label: "Organizer Subtitle", placeholder: "e.g. 'Presents' or 'In association with'" },
                                        { key: "custom_footer_text", label: "Footer Text", placeholder: "e.g. 'Terms & conditions apply'" },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key} style={{ marginBottom: 14 }}>
                                            <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>{label}</label>
                                            <input
                                                placeholder={placeholder}
                                                value={(config as any)[key] || ""}
                                                onChange={(e) => setConfig({ ...config, [key]: e.target.value || null })}
                                                style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Options Tab */}
                            {activeTab === "options" && (
                                <div>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Ticket Type</label>
                                    <select
                                        value={config.ticket_type_label}
                                        onChange={(e) => setConfig({ ...config, ticket_type_label: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}
                                    >
                                        {TICKET_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>

                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Border Style</label>
                                    <select
                                        value={config.border_style}
                                        onChange={(e) => setConfig({ ...config, border_style: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}
                                    >
                                        {BORDER_STYLE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>

                                    {[
                                        { key: "show_prizes", label: "Show Prizes" },
                                        { key: "show_guidelines_link", label: "Show Guidelines Link" },
                                    ].map(({ key, label }) => (
                                        <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#ccc", marginBottom: 10, cursor: "pointer" }}>
                                            <input type="checkbox" checked={(config as any)[key]} onChange={(e) => setConfig({ ...config, [key]: e.target.checked })} style={{ accentColor: config.accent_color }} />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Panel — Live Preview */}
                        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                            <div style={{
                                width: "100%", maxWidth: 420,
                                background: config.accent_color,
                                borderRadius: 30, padding: 16,
                                ...(config.border_style !== "none" ? { border: `3px ${config.border_style} ${config.border_color}` } : {}),
                            }}>
                                <div style={{
                                    background: config.bg_color, borderRadius: 20, color: config.text_color,
                                    fontFamily: `"${config.font}", sans-serif`,
                                    position: "relative", overflow: "hidden",
                                    ...(bgImagePreview ? { backgroundImage: `url(${bgImagePreview})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
                                }}>
                                    {bgImagePreview && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.55)", zIndex: 0 }} />}
                                    <div style={{ padding: 20, textAlign: "center", position: "relative", zIndex: 1 }}>

                                        {(logoPreview || secondaryLogoPreview) && (
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                                {logoPreview && <img src={logoPreview} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover" }} />}
                                                {secondaryLogoPreview && <img src={secondaryLogoPreview} style={{ width: 40, height: 40, borderRadius: 6, objectFit: "contain" }} />}
                                            </div>
                                        )}

                                        {config.custom_header_text && (
                                            <div style={{ fontSize: 10, color: config.secondary_text_color, marginBottom: 4 }}>{config.custom_header_text}</div>
                                        )}
                                        {config.organizer_subtitle && (
                                            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: config.secondary_text_color, marginBottom: 6 }}>{config.organizer_subtitle}</div>
                                        )}

                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>SAMPLE EVENT</h2>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
                                            {[
                                                { label: "Date", value: "25 FEB 2026" },
                                                { label: "Time", value: "10:00 AM" },
                                                { label: "Location", value: "HALL A" },
                                                { label: "Ticket ID", value: "TK-001" },
                                                { label: "Holder", value: "JOHN DOE" },
                                                { label: "Type", value: config.ticket_type_label },
                                            ].map(({ label, value }) => (
                                                <div key={label} style={{ marginBottom: 8 }}>
                                                    <div style={{ fontSize: 9, color: config.secondary_text_color }}>{label}</div>
                                                    <div style={{ fontSize: 12, fontWeight: 700 }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: 2, background: `repeating-linear-gradient(to right, transparent, transparent 5px, ${config.text_color} 5px, ${config.text_color} 10px)`, margin: "12px 0", position: "relative", zIndex: 1 }} />

                                    {/* QR */}
                                    <div style={{ textAlign: "center", padding: "16px 20px", position: "relative", zIndex: 1 }}>
                                        <div style={{ width: 100, height: 100, background: "#fff", borderRadius: 8, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#999" }}>
                                            QR CODE
                                        </div>
                                        <div style={{ fontSize: 10, color: config.secondary_text_color }}>Present this ticket at the venue</div>
                                    </div>

                                    {config.custom_footer_text && (
                                        <div style={{ textAlign: "center", fontSize: 9, color: config.secondary_text_color, padding: "6px 16px 16px", position: "relative", zIndex: 1 }}>
                                            {config.custom_footer_text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
