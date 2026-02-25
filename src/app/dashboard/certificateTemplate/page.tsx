"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import jsonAPI from "@/app/api/jsonAPI";
import { ChevronLeft, Save, Trash2, Plus, X, Upload, Image, Type, Palette, Settings, Eye, PenTool } from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface CertTemplate {
    id: number;
    name: string;
    is_default: boolean;
    config: CertConfig;
    logo: string | null;
    secondary_logo: string | null;
    background_image: string | null;
    signature_1: string | null;
    signature_2: string | null;
}

interface CertConfig {
    accent_color: string;
    bg_color: string;
    text_color: string;
    secondary_text_color: string;
    border_color: string;
    font: string;
    title_font: string | null;
    certificate_title: string;
    custom_body_text: string | null;
    custom_footer_text: string | null;
    signature_1_name: string | null;
    signature_1_title: string | null;
    signature_2_name: string | null;
    signature_2_title: string | null;
    orientation: string;
    border_style: string;
    show_qr_code: boolean;
    show_certificate_id: boolean;
    date_format: string;
    logo_url: string | null;
    secondary_logo_url: string | null;
    background_image_url: string | null;
    signature_1_url: string | null;
    signature_2_url: string | null;
}

const DEFAULT_CONFIG: CertConfig = {
    accent_color: "#1db9a0",
    bg_color: "#121212",
    text_color: "#ffffff",
    secondary_text_color: "#aaaaaa",
    border_color: "#1db9a0",
    font: "Inter",
    title_font: null,
    certificate_title: "Certificate of Participation",
    custom_body_text: null,
    custom_footer_text: null,
    signature_1_name: null,
    signature_1_title: null,
    signature_2_name: null,
    signature_2_title: null,
    orientation: "landscape",
    border_style: "none",
    show_qr_code: true,
    show_certificate_id: true,
    date_format: "dd MMM yyyy",
    logo_url: null,
    secondary_logo_url: null,
    background_image_url: null,
    signature_1_url: null,
    signature_2_url: null,
};

const FONT_OPTIONS = [
    "Inter", "Roboto", "Poppins", "Outfit", "Montserrat",
    "Playfair Display", "Space Grotesk", "DM Sans", "Lato", "Raleway",
    "Cormorant Garamond", "Libre Baskerville", "EB Garamond",
];
const BORDER_STYLES = ["none", "solid", "dashed", "double"];
const CERT_TITLES = [
    "Certificate of Participation", "Certificate of Excellence",
    "Certificate of Achievement", "Certificate of Completion",
    "Certificate of Merit", "Certificate of Appreciation",
];
const DATE_FORMATS = ["dd MMM yyyy", "MMMM dd, yyyy", "dd/MM/yyyy"];

/* ─── Component ─────────────────────────────────── */
export default function CertificateDesigner() {
    const router = useRouter();
    const [templates, setTemplates] = useState<CertTemplate[]>([]);
    const [selected, setSelected] = useState<CertTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [config, setConfig] = useState<CertConfig>(DEFAULT_CONFIG);
    const [isDefault, setIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [tab, setTab] = useState<"colors" | "fonts" | "branding" | "content" | "signatures" | "options">("colors");

    // File states
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [secLogoFile, setSecLogoFile] = useState<File | null>(null);
    const [bgFile, setBgFile] = useState<File | null>(null);
    const [sig1File, setSig1File] = useState<File | null>(null);
    const [sig2File, setSig2File] = useState<File | null>(null);
    const [logoPrev, setLogoPrev] = useState<string | null>(null);
    const [secLogoPrev, setSecLogoPrev] = useState<string | null>(null);
    const [bgPrev, setBgPrev] = useState<string | null>(null);
    const [sig1Prev, setSig1Prev] = useState<string | null>(null);
    const [sig2Prev, setSig2Prev] = useState<string | null>(null);
    const [rmLogo, setRmLogo] = useState(false);
    const [rmSecLogo, setRmSecLogo] = useState(false);
    const [rmBg, setRmBg] = useState(false);
    const [rmSig1, setRmSig1] = useState(false);
    const [rmSig2, setRmSig2] = useState(false);

    const logoRef = useRef<HTMLInputElement>(null);
    const secLogoRef = useRef<HTMLInputElement>(null);
    const bgRef = useRef<HTMLInputElement>(null);
    const sig1Ref = useRef<HTMLInputElement>(null);
    const sig2Ref = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchTemplates(); }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await jsonAPI.get("/api/v1/certificate-templates/list");
            setTemplates(data);
        } catch { }
    };

    const selectTemplate = (t: CertTemplate) => {
        setSelected(t);
        setName(t.name);
        setConfig({ ...DEFAULT_CONFIG, ...t.config });
        setIsDefault(t.is_default);
        setIsCreating(false);
        resetFiles();
        setLogoPrev(t.logo || null);
        setSecLogoPrev(t.secondary_logo || null);
        setBgPrev(t.background_image || null);
        setSig1Prev(t.signature_1 || null);
        setSig2Prev(t.signature_2 || null);
    };

    const startNew = () => {
        setSelected(null); setIsCreating(true);
        setName(""); setConfig(DEFAULT_CONFIG); setIsDefault(false);
        resetFiles();
    };

    const resetFiles = () => {
        setLogoFile(null); setSecLogoFile(null); setBgFile(null); setSig1File(null); setSig2File(null);
        setLogoPrev(null); setSecLogoPrev(null); setBgPrev(null); setSig1Prev(null); setSig2Prev(null);
        setRmLogo(false); setRmSecLogo(false); setRmBg(false); setRmSig1(false); setRmSig2(false);
    };

    const pick = (e: React.ChangeEvent<HTMLInputElement>, setF: any, setP: any, setR: any) => {
        const f = e.target.files?.[0];
        if (f) { setF(f); setP(URL.createObjectURL(f)); setR(false); }
    };

    const remove = (setF: any, setP: any, setR: any) => { setF(null); setP(null); setR(true); };

    const save = async () => {
        if (!name.trim()) { setMsg({ type: "error", text: "Name is required" }); return; }
        setSaving(true); setMsg(null);

        const fd = new FormData();
        fd.append("name", name);
        fd.append("is_default", String(isDefault));
        fd.append("config", JSON.stringify(config));
        if (logoFile) fd.append("logo", logoFile);
        if (secLogoFile) fd.append("secondary_logo", secLogoFile);
        if (bgFile) fd.append("background_image", bgFile);
        if (sig1File) fd.append("signature_1", sig1File);
        if (sig2File) fd.append("signature_2", sig2File);

        try {
            if (selected) {
                fd.append("remove_logo", String(rmLogo));
                fd.append("remove_secondary_logo", String(rmSecLogo));
                fd.append("remove_background_image", String(rmBg));
                fd.append("remove_signature_1", String(rmSig1));
                fd.append("remove_signature_2", String(rmSig2));
                await jsonAPI.put(`/api/v1/certificate-templates/${selected.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                setMsg({ type: "success", text: "Updated!" });
            } else {
                await jsonAPI.post("/api/v1/certificate-templates/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
                setMsg({ type: "success", text: "Created!" });
            }
            fetchTemplates();
            if (!selected) setIsCreating(false);
        } catch (err: any) {
            setMsg({ type: "error", text: err.response?.data?.message || "Save failed" });
        } finally { setSaving(false); }
    };

    const del = async () => {
        if (!selected || !confirm("Delete?")) return;
        try {
            await jsonAPI.delete(`/api/v1/certificate-templates/${selected.id}`);
            setSelected(null); setIsCreating(false); fetchTemplates();
        } catch { }
    };

    /* ─── ImageUpload ─────────────────────────────── */
    const Img = ({ label, prev, ref: r, onPick, onRemove }: any) => (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>{label}</label>
            {prev ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={prev} alt={label} style={{ maxHeight: 70, borderRadius: 8, border: "1px solid #333" }} />
                    <button onClick={onRemove} style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} color="white" />
                    </button>
                </div>
            ) : (
                <button onClick={() => r.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#1e1e2e", border: "1px dashed #444", borderRadius: 8, color: "#aaa", cursor: "pointer", fontSize: 12 }}>
                    <Upload size={14} /> Upload
                </button>
            )}
            <input ref={r} type="file" accept="image/*" hidden onChange={onPick} />
        </div>
    );

    const isEditing = isCreating || selected;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a12" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "24px 32px", marginLeft: 80, color: "#fff" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {isEditing && <button onClick={() => { setSelected(null); setIsCreating(false); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><ChevronLeft size={24} /></button>}
                        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{isCreating ? "New Certificate Template" : selected ? "Edit Template" : "Certificate Templates"}</h1>
                    </div>
                    {isEditing && (
                        <div style={{ display: "flex", gap: 10 }}>
                            {selected && <button onClick={del} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2a1515", border: "1px solid #4a2020", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600 }}><Trash2 size={16} /> Delete</button>}
                            <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: config.accent_color, border: "none", borderRadius: 8, color: "#000", cursor: "pointer", fontSize: 13, fontWeight: 700 }}><Save size={16} /> {saving ? "Saving..." : "Save"}</button>
                        </div>
                    )}
                </div>

                {msg && <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, background: msg.type === "success" ? "#0d2818" : "#2a1515", color: msg.type === "success" ? "#4ade80" : "#ef4444", border: `1px solid ${msg.type === "success" ? "#166534" : "#4a2020"}`, fontSize: 13 }}>{msg.text}</div>}

                {!isEditing ? (
                    /* ─── List ─────────────────────────────── */
                    <div>
                        <button onClick={startNew} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#1db9a0", border: "none", borderRadius: 10, color: "#000", cursor: "pointer", fontSize: 14, fontWeight: 700, marginBottom: 20 }}><Plus size={18} /> New Certificate Template</button>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                            {templates.map((t) => (
                                <div key={t.id} onClick={() => selectTemplate(t)} style={{ background: "#14141f", borderRadius: 12, padding: 20, cursor: "pointer", border: "1px solid #1e1e2e" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                        <span style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</span>
                                        {t.is_default && <span style={{ fontSize: 10, background: "#1db9a0", color: "#000", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>DEFAULT</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                        {[t.config?.accent_color, t.config?.bg_color, t.config?.text_color].filter(Boolean).map((c, i) => (
                                            <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: c || "#333", border: "1px solid #333" }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 12, color: "#666" }}>{t.config?.font || "Inter"} · {t.config?.certificate_title || "Certificate"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* ─── Editor ────────────────────────────── */
                    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>
                        {/* Left — Controls */}
                        <div style={{ background: "#14141f", borderRadius: 14, padding: 20, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
                            <input placeholder="Template Name" value={name} onChange={(e) => setName(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#fff", fontSize: 14, marginBottom: 12 }} />
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa", marginBottom: 16, cursor: "pointer" }}>
                                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} style={{ accentColor: config.accent_color }} />
                                Set as default
                            </label>

                            {/* Tabs */}
                            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                                {([
                                    { k: "colors", i: <Palette size={14} />, l: "Colors" },
                                    { k: "fonts", i: <Type size={14} />, l: "Fonts" },
                                    { k: "branding", i: <Image size={14} />, l: "Branding" },
                                    { k: "content", i: <Eye size={14} />, l: "Content" },
                                    { k: "signatures", i: <PenTool size={14} />, l: "Signatures" },
                                    { k: "options", i: <Settings size={14} />, l: "Options" },
                                ] as const).map(({ k, i, l }) => (
                                    <button key={k} onClick={() => setTab(k as any)}
                                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: "none", background: tab === k ? config.accent_color : "#1e1e2e", color: tab === k ? "#000" : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                                        {i} {l}
                                    </button>
                                ))}
                            </div>

                            {/* Colors */}
                            {tab === "colors" && (
                                <div>
                                    {[
                                        { k: "accent_color", l: "Accent Color" },
                                        { k: "bg_color", l: "Background" },
                                        { k: "text_color", l: "Text Color" },
                                        { k: "secondary_text_color", l: "Secondary Text" },
                                        { k: "border_color", l: "Border Color" },
                                    ].map(({ k, l }) => (
                                        <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                            <label style={{ fontSize: 13, color: "#ccc" }}>{l}</label>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <input type="color" value={(config as any)[k]} onChange={(e) => setConfig({ ...config, [k]: e.target.value })} style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }} />
                                                <input type="text" value={(config as any)[k]} onChange={(e) => setConfig({ ...config, [k]: e.target.value })} style={{ width: 80, padding: "4px 8px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 12, fontFamily: "monospace" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Fonts */}
                            {tab === "fonts" && (
                                <div>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Body Font</label>
                                    <select value={config.font} onChange={(e) => setConfig({ ...config, font: e.target.value })} style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}>
                                        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Title Font (optional)</label>
                                    <select value={config.title_font || ""} onChange={(e) => setConfig({ ...config, title_font: e.target.value || null })} style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}>
                                        <option value="">Same as body font</option>
                                        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <p style={{ fontSize: 24, fontFamily: `"${config.title_font || config.font}", serif`, color: "#fff", padding: 16, background: "#1e1e2e", borderRadius: 8, textAlign: "center" }}>
                                        {config.certificate_title}
                                    </p>
                                </div>
                            )}

                            {/* Branding */}
                            {tab === "branding" && (
                                <div>
                                    <Img label="Primary Logo" prev={logoPrev} ref={logoRef}
                                        onPick={(e: any) => pick(e, setLogoFile, setLogoPrev, setRmLogo)}
                                        onRemove={() => remove(setLogoFile, setLogoPrev, setRmLogo)} />
                                    <Img label="Secondary / Sponsor Logo" prev={secLogoPrev} ref={secLogoRef}
                                        onPick={(e: any) => pick(e, setSecLogoFile, setSecLogoPrev, setRmSecLogo)}
                                        onRemove={() => remove(setSecLogoFile, setSecLogoPrev, setRmSecLogo)} />
                                    <Img label="Background Image" prev={bgPrev} ref={bgRef}
                                        onPick={(e: any) => pick(e, setBgFile, setBgPrev, setRmBg)}
                                        onRemove={() => remove(setBgFile, setBgPrev, setRmBg)} />
                                </div>
                            )}

                            {/* Content */}
                            {tab === "content" && (
                                <div>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Certificate Title</label>
                                    <select value={config.certificate_title} onChange={(e) => setConfig({ ...config, certificate_title: e.target.value })} style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}>
                                        {CERT_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    {[
                                        { k: "custom_body_text", l: "Custom Body Text", p: "e.g. 'For outstanding contribution...'" },
                                        { k: "custom_footer_text", l: "Footer Text", p: "e.g. 'This certificate is digitally verified'" },
                                    ].map(({ k, l, p }) => (
                                        <div key={k} style={{ marginBottom: 14 }}>
                                            <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>{l}</label>
                                            <input placeholder={p} value={(config as any)[k] || ""} onChange={(e) => setConfig({ ...config, [k]: e.target.value || null })}
                                                style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Signatures */}
                            {tab === "signatures" && (
                                <div>
                                    <h3 style={{ fontSize: 14, marginBottom: 12, color: "#ccc" }}>Primary Signature</h3>
                                    <Img label="Signature Image" prev={sig1Prev} ref={sig1Ref}
                                        onPick={(e: any) => pick(e, setSig1File, setSig1Prev, setRmSig1)}
                                        onRemove={() => remove(setSig1File, setSig1Prev, setRmSig1)} />
                                    <input placeholder="Signatory Name" value={config.signature_1_name || ""} onChange={(e) => setConfig({ ...config, signature_1_name: e.target.value || null })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 8 }} />
                                    <input placeholder="Signatory Title" value={config.signature_1_title || ""} onChange={(e) => setConfig({ ...config, signature_1_title: e.target.value || null })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 20 }} />

                                    <h3 style={{ fontSize: 14, marginBottom: 12, color: "#ccc" }}>Secondary Signature</h3>
                                    <Img label="Signature Image" prev={sig2Prev} ref={sig2Ref}
                                        onPick={(e: any) => pick(e, setSig2File, setSig2Prev, setRmSig2)}
                                        onRemove={() => remove(setSig2File, setSig2Prev, setRmSig2)} />
                                    <input placeholder="Signatory Name" value={config.signature_2_name || ""} onChange={(e) => setConfig({ ...config, signature_2_name: e.target.value || null })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 8 }} />
                                    <input placeholder="Signatory Title" value={config.signature_2_title || ""} onChange={(e) => setConfig({ ...config, signature_2_title: e.target.value || null })}
                                        style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                                </div>
                            )}

                            {/* Options */}
                            {tab === "options" && (
                                <div>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Border Style</label>
                                    <select value={config.border_style} onChange={(e) => setConfig({ ...config, border_style: e.target.value })} style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}>
                                        {BORDER_STYLES.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <label style={{ fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" }}>Date Format</label>
                                    <select value={config.date_format} onChange={(e) => setConfig({ ...config, date_format: e.target.value })} style={{ width: "100%", padding: "10px 14px", background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 14 }}>
                                        {DATE_FORMATS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    {[
                                        { k: "show_qr_code", l: "Show QR Code" },
                                        { k: "show_certificate_id", l: "Show Certificate ID" },
                                    ].map(({ k, l }) => (
                                        <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#ccc", marginBottom: 10, cursor: "pointer" }}>
                                            <input type="checkbox" checked={(config as any)[k]} onChange={(e) => setConfig({ ...config, [k]: e.target.checked })} style={{ accentColor: config.accent_color }} /> {l}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right — Live Preview */}
                        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                            <div style={{
                                width: "100%", maxWidth: 560,
                                background: config.accent_color, borderRadius: 20, padding: 14,
                                ...(config.border_style !== "none" ? { border: `3px ${config.border_style} ${config.border_color}` } : {}),
                            }}>
                                <div style={{
                                    background: config.bg_color, color: config.text_color, borderRadius: 16,
                                    padding: "40px 36px", textAlign: "center", position: "relative", overflow: "hidden",
                                    fontFamily: `"${config.font}", sans-serif`,
                                    ...(bgPrev ? { backgroundImage: `url(${bgPrev})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
                                }}>
                                    {bgPrev && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 0 }} />}
                                    <div style={{ position: "relative", zIndex: 1 }}>

                                        {/* Logos */}
                                        {(logoPrev || secLogoPrev) && (
                                            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14 }}>
                                                {logoPrev && <img src={logoPrev} style={{ maxHeight: 50, objectFit: "contain" }} />}
                                                {secLogoPrev && <img src={secLogoPrev} style={{ maxHeight: 40, objectFit: "contain" }} />}
                                            </div>
                                        )}

                                        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: config.accent_color, marginBottom: 6, fontWeight: 600 }}>
                                            Your Organization
                                        </div>
                                        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: `"${config.title_font || config.font}", serif`, marginBottom: 18, letterSpacing: 1 }}>
                                            {config.certificate_title}
                                        </h1>

                                        {config.custom_body_text && <p style={{ fontSize: 11, fontStyle: "italic", color: config.secondary_text_color, marginBottom: 10 }}>{config.custom_body_text}</p>}

                                        <p style={{ fontSize: 11, color: config.secondary_text_color, marginBottom: 6 }}>This is to certify that</p>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: config.accent_color, padding: "6px 0", borderBottom: `2px solid ${config.accent_color}`, display: "inline-block", minWidth: 200, marginBottom: 14 }}>
                                            John Doe
                                        </div>
                                        <div style={{ fontSize: 11, lineHeight: 1.8, color: config.secondary_text_color, marginBottom: 16 }}>
                                            has successfully participated in<br />
                                            <span style={{ fontWeight: 600, color: config.text_color }}>Sample Event 2026</span><br />
                                            held on 25 Feb 2026
                                        </div>

                                        {/* Signatures */}
                                        {(sig1Prev || sig2Prev || config.signature_1_name || config.signature_2_name) && (
                                            <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 16 }}>
                                                {(sig1Prev || config.signature_1_name) && (
                                                    <div style={{ textAlign: "center" }}>
                                                        {sig1Prev && <img src={sig1Prev} style={{ maxHeight: 36, objectFit: "contain", marginBottom: 4 }} />}
                                                        <div style={{ width: 100, height: 1, background: config.secondary_text_color, margin: "0 auto 4px" }} />
                                                        {config.signature_1_name && <div style={{ fontSize: 10, fontWeight: 600 }}>{config.signature_1_name}</div>}
                                                        {config.signature_1_title && <div style={{ fontSize: 9, color: config.secondary_text_color }}>{config.signature_1_title}</div>}
                                                    </div>
                                                )}
                                                {(sig2Prev || config.signature_2_name) && (
                                                    <div style={{ textAlign: "center" }}>
                                                        {sig2Prev && <img src={sig2Prev} style={{ maxHeight: 36, objectFit: "contain", marginBottom: 4 }} />}
                                                        <div style={{ width: 100, height: 1, background: config.secondary_text_color, margin: "0 auto 4px" }} />
                                                        {config.signature_2_name && <div style={{ fontSize: 10, fontWeight: 600 }}>{config.signature_2_name}</div>}
                                                        {config.signature_2_title && <div style={{ fontSize: 9, color: config.secondary_text_color }}>{config.signature_2_title}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {config.show_qr_code && (
                                            <div style={{ width: 60, height: 60, background: "#fff", borderRadius: 6, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#999" }}>QR</div>
                                        )}

                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
                                            {config.show_certificate_id && <div><div style={{ color: config.secondary_text_color, textTransform: "uppercase", letterSpacing: 1 }}>Certificate ID</div><div style={{ fontWeight: 600, marginTop: 2 }}>CERT-001</div></div>}
                                            <div style={{ textAlign: "right" }}><div style={{ color: config.secondary_text_color, textTransform: "uppercase", letterSpacing: 1 }}>Organized By</div><div style={{ fontWeight: 600, marginTop: 2 }}>Your Organization</div></div>
                                        </div>

                                        {config.custom_footer_text && <div style={{ fontSize: 9, color: config.secondary_text_color, marginTop: 12 }}>{config.custom_footer_text}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
