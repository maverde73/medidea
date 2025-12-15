"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import { ErrorAlert } from "@/components/ui";

interface LookupItem {
    id: number;
    nome?: string;
    descrizione?: string;
    active: number;
}

function TabelleLookupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const activeTab = (tabParam === "modalita" ? "modalita" : "reparti") as "reparti" | "modalita";

    const [items, setItems] = useState<LookupItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit/Create state
    const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = activeTab === "reparti" ? "/api/reparti" : "/api/modalita-apertura";
            const token = localStorage.getItem("token");
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as { success: boolean; data: LookupItem[]; error?: string };
            if (data.success) {
                setItems(data.data);
            } else {
                setError(data.error || "Errore nel caricamento dei dati");
            }
        } catch (err) {
            setError("Errore di connessione");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newItemName.trim()) return;
        setActionLoading(true);
        try {
            const endpoint = activeTab === "reparti" ? "/api/reparti" : "/api/modalita-apertura";
            const field = activeTab === "reparti" ? "nome" : "descrizione";
            const token = localStorage.getItem("token");

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: newItemName }),
            });

            const data = (await res.json()) as { success: boolean; data: LookupItem; error?: string };
            if (data.success) {
                setItems([...items, data.data]);
                setNewItemName("");
                setIsCreating(false);
            } else {
                setError(data.error || "Errore durante la creazione");
            }
        } catch (err) {
            setError("Errore durante la creazione");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        const name = activeTab === "reparti" ? editingItem.nome : editingItem.descrizione;
        if (!name?.trim()) return;

        setActionLoading(true);
        try {
            const endpoint = activeTab === "reparti"
                ? `/api/reparti/${editingItem.id}`
                : `/api/modalita-apertura/${editingItem.id}`;
            const field = activeTab === "reparti" ? "nome" : "descrizione";
            const token = localStorage.getItem("token");

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: name }),
            });

            const data = (await res.json()) as { success: boolean; data: LookupItem; error?: string };
            if (data.success) {
                setItems(items.map(i => i.id === editingItem.id ? data.data : i));
                setEditingItem(null);
            } else {
                setError(data.error || "Errore durante l'aggiornamento");
            }
        } catch (err) {
            setError("Errore durante l'aggiornamento");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Sei sicuro di voler eliminare questo elemento?")) return;

        setActionLoading(true);
        try {
            const endpoint = activeTab === "reparti"
                ? `/api/reparti/${id}`
                : `/api/modalita-apertura/${id}`;
            const token = localStorage.getItem("token");

            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = (await res.json()) as { success: boolean; error?: string };
            if (data.success) {
                setItems(items.filter(i => i.id !== id));
            } else {
                setError(data.error || "Errore durante l'eliminazione");
            }
        } catch (err) {
            setError("Errore durante l'eliminazione");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestione Tabelle</h1>
                <p className="text-gray-500 mt-1">Configura le liste di valori per l&apos;applicazione</p>
            </div>

            {error && (
                <ErrorAlert
                    type="error"
                    title="Errore"
                    message={error}
                    onDismiss={() => setError(null)}
                    className="mb-6"
                />
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "reparti"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    onClick={() => {
                        router.push("/impostazioni/tabelle?tab=reparti");
                        setIsCreating(false);
                        setEditingItem(null);
                    }}
                >
                    Reparti
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "modalita"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    onClick={() => {
                        router.push("/impostazioni/tabelle?tab=modalita");
                        setIsCreating(false);
                        setEditingItem(null);
                    }}
                >
                    Modalità Apertura
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-semibold text-gray-700">
                        {activeTab === "reparti" ? "Elenco Reparti" : "Elenco Modalità"}
                    </h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        disabled={isCreating || !!editingItem}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Aggiungi
                    </button>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <div className="p-4 border-b bg-blue-50 flex gap-2 items-center">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={activeTab === "reparti" ? "Nome reparto..." : "Descrizione modalità..."}
                            className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                            autoFocus
                        />
                        <button
                            onClick={handleCreate}
                            disabled={actionLoading || !newItemName.trim()}
                            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => { setIsCreating(false); setNewItemName(""); }}
                            className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* List */}
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Caricamento...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Nessun elemento presente.
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 group">
                                {editingItem?.id === item.id ? (
                                    <div className="flex-1 flex gap-2 items-center mr-4">
                                        <input
                                            type="text"
                                            value={activeTab === "reparti" ? editingItem.nome : editingItem.descrizione}
                                            onChange={(e) => setEditingItem({
                                                ...editingItem,
                                                [activeTab === "reparti" ? "nome" : "descrizione"]: e.target.value
                                            })}
                                            className="flex-1 px-3 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                                        />
                                        <button
                                            onClick={handleUpdate}
                                            disabled={actionLoading}
                                            className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingItem(null)}
                                            className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-900 font-medium">
                                        {activeTab === "reparti" ? item.nome : item.descrizione}
                                    </span>
                                )}

                                {!editingItem && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Modifica"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                            title="Elimina"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TabelleLookupPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
            <TabelleLookupContent />
        </Suspense>
    );
}
