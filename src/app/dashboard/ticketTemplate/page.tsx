"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import jsonAPI from "@/app/api/jsonAPI";
import { ChevronLeft, Save, Trash2, Plus, Check } from "lucide-react";

interface TicketTemplate {
    id: number;
    name: string;
    is_default: boolean;
    config: TicketConfig;
}

interface TicketConfig {
    accent_color: string;
    bg_color: string;
    text_color: string;
    font: string;
    logo_url: string | null;
    background_image_url: string | null;
    show_prizes: boolean;
    show_guidelines_link: boolean;
    ticket_type_label: string;
    custom_footer_text: string | null;
}

const DEFAULT_CONFIG: TicketConfig = {
    accent_color: "#1db9a0",
    bg_color: "#121212",
    text_color: "#ffffff",
    font: "Inter",
    logo_url: null,
    background_image_url: null,
    show_prizes: true,
    show_guidelines_link: true,
    ticket_type_label: "GENERAL",
    custom_footer_text: null,
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

const TICKET_TYPE_OPTIONS = [
    "GENERAL",
    "EARLY BIRD",
    "VIP",
    "PREMIUM",
    "STUDENT",
    "FREE",
];

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

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await jsonAPI.get("/api/v1/ticket-templates/list");
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

    const handleSelectTemplate = (template: TicketTemplate) => {
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
                await jsonAPI.put(`/api/v1/ticket-templates/${selectedTemplate.id}`, payload);
                setMessage({ type: "success", text: "Template updated!" });
            } else {
                const { data } = await jsonAPI.post("/api/v1/ticket-templates/create", payload);
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
            await jsonAPI.delete(`/api/v1/ticket-templates/${selectedTemplate.id}`);
            setSelectedTemplate(null);
            setIsCreating(false);
            setMessage({ type: "success", text: "Template deleted" });
            await fetchTemplates();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to delete template" });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const updateConfig = (key: keyof TicketConfig, value: any) => {
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
                        <h1 className="text-2xl font-bold text-white">Ticket Designer</h1>
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
                                            placeholder="e.g. Dark Premium"
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

                                    {/* Ticket Type */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Ticket Type Label</label>
                                        <select
                                            value={config.ticket_type_label}
                                            onChange={(e) => updateConfig("ticket_type_label", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                        >
                                            {TICKET_TYPE_OPTIONS.map((t) => (
                                                <option key={t} value={t}>{t}</option>
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

                                    {/* Custom Footer */}
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Custom Footer Text</label>
                                        <input
                                            type="text"
                                            value={config.custom_footer_text || ""}
                                            onChange={(e) => updateConfig("custom_footer_text", e.target.value || null)}
                                            className="w-full px-4 py-2.5 bg-[#1A1E26] text-white rounded-lg border border-[#4A5568] focus:border-[#F9FFA1] outline-none text-sm"
                                            placeholder="Powered by your club name..."
                                        />
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.show_prizes}
                                                onChange={(e) => updateConfig("show_prizes", e.target.checked)}
                                                className="w-4 h-4 accent-[#F9FFA1]"
                                            />
                                            <span className="text-sm text-gray-300">Show Prizes</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.show_guidelines_link}
                                                onChange={(e) => updateConfig("show_guidelines_link", e.target.checked)}
                                                className="w-4 h-4 accent-[#F9FFA1]"
                                            />
                                            <span className="text-sm text-gray-300">Show Guidelines Link</span>
                                        </label>
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

                                {/* Ticket Preview */}
                                <div
                                    className="rounded-[20px] p-4 max-w-[320px] mx-auto"
                                    style={{ backgroundColor: config.accent_color }}
                                >
                                    <div
                                        className="rounded-2xl overflow-hidden"
                                        style={{
                                            backgroundColor: config.bg_color,
                                            color: config.text_color,
                                            fontFamily: `"${config.font}", sans-serif`,
                                        }}
                                    >
                                        {/* Header */}
                                        <div className="p-5 text-center">
                                            {config.logo_url && (
                                                <img
                                                    src={config.logo_url}
                                                    alt="Logo"
                                                    className="w-10 h-10 rounded-full mx-auto mb-3 object-cover"
                                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                                />
                                            )}
                                            <h3 className="text-base font-bold uppercase mb-3">
                                                Sample Event Name
                                            </h3>

                                            <div className="grid grid-cols-2 gap-2 text-left">
                                                <div className="mb-3">
                                                    <div className="text-[10px] opacity-60">Date</div>
                                                    <div className="text-xs font-bold uppercase">25 Feb 2026</div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-[10px] opacity-60">Time</div>
                                                    <div className="text-xs font-bold uppercase">10:00 AM</div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-[10px] opacity-60">Location</div>
                                                    <div className="text-xs font-bold uppercase">Main Hall</div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-[10px] opacity-60">Ticket Type</div>
                                                    <div className="text-xs font-bold uppercase">
                                                        {config.ticket_type_label}
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-[10px] opacity-60">Holder Name</div>
                                                    <div className="text-xs font-bold uppercase">John Doe</div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-[10px] opacity-60">Ticket ID</div>
                                                    <div className="text-xs font-bold uppercase">MOA-1234</div>
                                                </div>
                                            </div>

                                            {config.show_guidelines_link && (
                                                <div className="mt-2">
                                                    <span
                                                        className="text-[11px] underline"
                                                        style={{ color: config.accent_color }}
                                                    >
                                                        Check Out Guidelines
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="relative mx-4 my-2">
                                            <div
                                                className="border-t-2 border-dashed"
                                                style={{ borderColor: config.text_color, opacity: 0.3 }}
                                            />
                                            <div
                                                className="absolute -left-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                                                style={{ backgroundColor: config.accent_color }}
                                            />
                                            <div
                                                className="absolute -right-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                                                style={{ backgroundColor: config.accent_color }}
                                            />
                                        </div>

                                        {/* QR Section */}
                                        <div className="flex flex-col items-center p-5">
                                            <div className="w-24 h-24 bg-white rounded-lg mb-3 flex items-center justify-center text-gray-400 text-[10px]">
                                                QR Code
                                            </div>
                                            <p className="text-[10px] text-center opacity-60 max-w-[180px]">
                                                Present this ticket at the venue
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        {config.custom_footer_text && (
                                            <div className="text-center text-[10px] opacity-40 pb-4 px-4">
                                                {config.custom_footer_text}
                                            </div>
                                        )}
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
