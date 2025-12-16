"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, FileText, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Attachment {
    id: number;
    nome_file_originale: string;
    dimensione_bytes: number;
    created_at: string;
}

interface AttachmentManagerProps {
    tipoRiferimento: string;
    idRiferimento: number;
    category: string; // e.g., 'test_funzionali', 'test_elettrici'
    label?: string;
    readOnly?: boolean;
}

export function AttachmentManager({
    tipoRiferimento,
    idRiferimento,
    category,
    label,
    readOnly = false,
}: AttachmentManagerProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAttachments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoRiferimento, idRiferimento, category]);

    const fetchAttachments = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const params = new URLSearchParams({
                tipo_riferimento: tipoRiferimento,
                id_riferimento: idRiferimento.toString(),
                note: category,
            });

            const res = await fetch(`/api/allegati?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json() as { data: Attachment[] };
                setAttachments(data.data);
            }
        } catch (error) {
            console.error("Error fetching attachments:", error);
            toast.error("Errore nel caricamento degli allegati");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value so same file can be selected again
        e.target.value = "";

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Il file supera la dimensione massima di 10MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tipo_riferimento", tipoRiferimento);
        formData.append("id_riferimento", idRiferimento.toString());
        formData.append("note", category);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json() as { data: Attachment; error?: string };

            if (res.ok) {
                toast.success("File caricato con successo");
                setAttachments((prev) => [data.data, ...prev]);
            } else {
                toast.error(data.error || "Errore durante il caricamento");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Errore di connessione durante il caricamento");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Sei sicuro di voler eliminare questo allegato?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/allegati/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setAttachments((prev) => prev.filter((a) => a.id !== id));
                toast.success("Allegato eliminato");
            } else {
                toast.error("Errore durante l'eliminazione");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Errore durante l'eliminazione");
        }
    };

    const handleDownload = async (id: number, filename: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/allegati/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                toast.error("Errore durante il download");
            }
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Errore durante il download");
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                {label && <h4 className="text-sm font-medium text-gray-700">{label}</h4>}
                {!readOnly && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Upload className="h-3 w-3" />
                        )}
                        {uploading ? "Caricamento..." : "Allega file"}
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {loading ? (
                <div className="text-xs text-gray-500 animate-pulse">Caricamento allegati...</div>
            ) : attachments.length === 0 ? (
                <div className="text-xs text-gray-400 italic">Nessun allegato</div>
            ) : (
                <ul className="space-y-2">
                    {attachments.map((file) => (
                        <li
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 group"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-gray-700 truncate font-medium" title={file.nome_file_originale}>
                                        {file.nome_file_originale}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatSize(file.dimensione_bytes)} • {new Date(file.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => handleDownload(file.id, file.nome_file_originale)}
                                    className="p-1 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Scarica"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Elimina"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
