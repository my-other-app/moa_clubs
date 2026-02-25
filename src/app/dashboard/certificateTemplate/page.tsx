"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import jsonAPI from "@/app/api/jsonAPI";
import { ChevronLeft, Save, Trash2, Plus, Check } from "lucide-react";

interface CertificateTemplate {
    id: number;
    name: string;
    is_default: boolean;
    config: CertificateConfig;
}

interface CertificateConfig {
    accent_color: string;
    bg_color: string;
    text_color: string;
    font: string;
    logo_url: string | null;
    background_image_url: string | null;
    signature_url: string | null;
    custom_text: string | null;
}

const DEFAULT_CONFIG: CertificateConfig = {
    accent_color: "#1db9a0",
    bg_color: "#121212",
    text_color: "#ffffff",
    font: "Inter",
    logo_url: null,
    background_image_url: null,
    signature_url: null,
    custom_text: null,
};

const FONT_OPTIONS = [
    "Inter",
    "Roboto",
    "Poppins",
    "Outfit",
    "Montserrat",
    "Playfair Display",
    "Space Grotesk",
    "DM Sans",
];

export default function CertificateDesigner() {
    const router = useRouter();
    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG);
    const [isDefault, setIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await jsonAPI.get("/api/v1/certificate-templates/list");
            setTemplates(data);
        } catch (err) {
            console.error("Failed to load templates:", err);
        }
    };

    const handleCreateNew = () => {
        setSelectedTemplate(null);
        setIsCreating(true);
        setTemplateName("");
        setConfig({ ...DEFAULT_CONFIG });
        setIsDefault(false);
    };

    const handleSelectTemplate = (template: CertificateTemplate) => {
        setSelectedTemplate(template);
        setIsCreating(false);
        setTemplateName(template.name);
        setConfig({ ...DEFAULT_CONFIG, ...template.config });
        setIsDefault(template.is_default);
    };

    const handleSave = async () => {
        if (!templateName.trim()) {
            setMessage({ type: "error", text: "Template name is required" });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const payload = {
                name: templateName,
                is_default: isDefault,
                config,
            };

            if (selectedTemplate) {
                await jsonAPI.put(`/api/v1/certificate-templates/${selectedTemplate.id}`, payload);
                setMessage({ type: "success", text: "Template updated!" });
            } else {
                const { data } = await jsonAPI.post("/api/v1/certificate-templates/create", payload);
                setSelectedTemplate(data);
                setIsCreating(false);
                setMessage({ type: "success", text: "Template created!" });
            }

            await fetchTemplates();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to save template",
            });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDelete = async () => {
        if (!selectedTemplate) return;
        if (!confirm("Delete this template?")) return;

        try {
            await jsonAPI.delete(`/api/v1/certificate-templates/${selectedTemplate.id}`);
            setSelectedTemplate(null);
            setIsCreating(false);
            setMessage({ type: "success", text: "Template deleted" });
            await fetchTemplates();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to delete template" });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const updateConfig = (key: keyof CertificateConfig, value: any) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const showEditor = isCreating || selectedTemplate;

    return (
        <div className="flex min-h-screen bg-[#1A1E26]">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/dashboard/events")}
                            className="w-10 h-10 rounded-full bg-[#2C333D] flex items-center justify-center text-white hover:bg-[#3D4654] transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Certificate Designer</h1>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Template List + Create */}
                    <div className="xl:col-span-1">
                        <div className="bg-[#2C333D] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Templates</h2>
                                <button
                                    onClick={handleCreateNew}
                                    className="w-8 h-8 rounded-full bg-[#F9FFA1] text-[#2C333D] flex items-center justify-center hover:bg-[#e8ee90] transition"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {templates.length === 0 && !isCreating && (
                                <p className="text-gray-400 text-sm text-center py-8">
                                    No templates yet. Create your first one!
                                </p>
                            )}

                            <div className="flex flex-col gap-2">
                                {templates.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelectTemplate(t)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${selectedTemplate?.id === t.id
                                            ? "bg-[#F9FFA1] text-[#2C333D]"
                                            : "bg-[#3D4654] text-white hover:bg-[#4A5568]"
                                            }`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                                            style={{
                                                backgroundColor: t.config?.bg_color || "#121212",
                                                borderColor: t.config?.accent_color || "#1db9a0",
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{t.name}</div>
                                            {t.is_default && (
                                                <div className="text-xs opacity-60">Default</div>
                                            )}
                                        </div>
                                        {t.is_default && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Editor */}
                    {showEditor && (
                        <div className="xl:col-span-1">
                            <div className="bg-[#2C333D] rounded-2xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">
                                    {isCreating ? "New Template" : "Edit Template"}
                                </h2>

                                <div className="flex flex-col gap-5">
                                    {/* Template Name */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Template Name</label>
                                        <input
                                            type="text"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                            placeholder="e.g. Masterclass Event"
                                        />
                                    </div>

                                    {/* Colors */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Accent</label>
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={config.accent_color}
                                                    onChange={(e) => updateConfig("accent_color", e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer border border-[#4A5568]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Background</label>
                                            <input
                                                type="color"
                                                value={config.bg_color}
                                                onChange={(e) => updateConfig("bg_color", e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer border border-[#4A5568]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Text</label>
                                            <input
                                                type="color"
                                                value={config.text_color}
                                                onChange={(e) => updateConfig("text_color", e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer border border-[#4A5568]"
                                            />
                                        </div>
                                    </div>

                                    {/* Font */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Font</label>
                                        <select
                                            value={config.font}
                                            onChange={(e) => updateConfig("font", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                        >
                                            {FONT_OPTIONS.map((f) => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Logo URL */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Logo URL</label>
                                        <input
                                            type="url"
                                            value={config.logo_url || ""}
                                            onChange={(e) => updateConfig("logo_url", e.target.value || null)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Signature URL */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Signature URL</label>
                                        <input
                                            type="url"
                                            value={config.signature_url || ""}
                                            onChange={(e) => updateConfig("signature_url", e.target.value || null)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Custom Text */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Custom Text beneath name</label>
                                        <textarea
                                            value={config.custom_text || ""}
                                            rows={3}
                                            onChange={(e) => updateConfig("custom_text", e.target.value || null)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                            placeholder="e.g. for outstanding participation and dedication"
                                        />
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isDefault}
                                                onChange={(e) => setIsDefault(e.target.checked)}
                                                className="w-4 h-4 accent-[#F9FFA1]"
                                            />
                                            <span className="text-sm text-gray-300">Set as Default</span>
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 py-3 bg-[#F9FFA1] text-[#2C333D] rounded-xl font-semibold text-sm hover:bg-[#e8ee90] transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} />
                                            {saving ? "Saving..." : "Save Template"}
                                        </button>
                                        {selectedTemplate && (
                                            <button
                                                onClick={handleDelete}
                                                className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold text-sm hover:bg-red-500/30 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right: Live Preview */}
                    {showEditor && (
                        <div className="xl:col-span-1">
                            <div className="bg-[#2C333D] rounded-2xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Preview</h2>

                                {/* Certificate Preview */}
                                <div
                                    className="rounded-[24px] p-2 mx-auto aspect-[1.414/1] relative w-full"
                                    style={{ backgroundColor: config.accent_color }}
                                >
                                    <div
                                        className="w-full h-full rounded-[20px] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner"
                                        style={{
                                            backgroundColor: config.bg_color,
                                            color: config.text_color,
                                            fontFamily: `"${config.font}", sans-serif`,
                                        }}
                                    >
                                        {/* Corners */}
                                        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 opacity-50" style={{ borderColor: config.accent_color }} />
                                        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 opacity-50" style={{ borderColor: config.accent_color }} />
                                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 opacity-50" style={{ borderColor: config.accent_color }} />
                                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 opacity-50" style={{ borderColor: config.accent_color }} />

                                        {config.logo_url && (
                                            <img
                                                src={config.logo_url}
                                                alt="Logo"
                                                className="w-10 h-10 rounded-full mb-3 object-cover border-2"
                                                style={{ borderColor: config.accent_color }}
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        )}

                                        <p className="text-[8px] uppercase tracking-widest font-semibold mb-1" style={{ color: config.accent_color }}>
                                            Organized By Club Name
                                        </p>
                                        <h3 className="text-lg font-bold uppercase tracking-wide mb-3">
                                            Certificate of Participation
                                        </h3>
                                        <p className="text-[10px] opacity-60 mb-2">
                                            This is to certify that
                                        </p>

                                        <div className="text-xl font-bold border-b border-opacity-50 pb-1 mb-3 inline-block px-10" style={{ color: config.accent_color, borderColor: config.accent_color }}>
                                            John Doe
                                        </div>

                                        <p className="text-[10px] leading-relaxed opacity-80 mb-4 max-w-[80%]">
                                            has successfully participated in<br />
                                            <span className="font-semibold text-white opacity-100">Sample Event Name</span><br />
                                            held on 25 Feb 2026
                                        </p>

                                        {config.custom_text && (
                                            <p className="text-[9px] opacity-[0.85] italic mb-3">
                                                {config.custom_text}
                                            </p>
                                        )}

                                        <div className="flex w-full justify-between items-end px-2 mt-auto">
                                            <div className="text-left">
                                                <div className="text-[7px] uppercase opacity-40">Certificate ID</div>
                                                <div className="text-[8px] font-semibold">MOA-1234</div>
                                            </div>
                                            {config.signature_url && (
                                                <div className="flex flex-col items-center">
                                                    <img src={config.signature_url} alt="Signature" className="h-6 object-contain mb-1" onError={(e) => (e.currentTarget.style.display = "none")} />
                                                    <div className="border-t w-20 opacity-40 mx-auto" style={{ borderColor: config.accent_color }}></div>
                                                </div>
                                            )}
                                            <div className="text-right">
                                                <div className="text-[7px] uppercase flex flex-col items-end opacity-40">Organized By</div>
                                                <div className="text-[8px] font-semibold">Club Name</div>
                                            </div>
                                        </div>

                                        {/* QR inside the cert */}
                                        <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 bg-white rounded flex items-center justify-center shadow" style={{ width: "24px", height: "24px" }}>
                                            <p className="text-[5px] text-gray-500 font-bold m-0 p-0 text-center">QR</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state when no template selected */}
                    {!showEditor && templates.length > 0 && (
                        <div className="xl:col-span-2 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <p className="text-lg mb-2">Select a template to edit</p>
                                <p className="text-sm">or create a new one</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
