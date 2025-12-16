"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X, Search } from "lucide-react";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ModelItem {
    id: number;
    nome: string;
    descrizione?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

function ModelsPageContent() {
    const [items, setItems] = useState<ModelItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Edit State
    const [editingItem, setEditingItem] = useState<ModelItem | null>(null);
    const [editItemName, setEditItemName] = useState("");
    const [editItemDesc, setEditItemDesc] = useState("");

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/modelli", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as ApiResponse<ModelItem[]>;
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/modelli", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nome: newItemName, descrizione: newItemDesc }),
            });

            const data = (await res.json()) as ApiResponse<ModelItem>;
            if (data.success) {
                setItems([...items, data.data].sort((a, b) => a.nome.localeCompare(b.nome)));
                setNewItemName("");
                setNewItemDesc("");
                setIsCreateOpen(false);
            } else {
                setError(data.error || "Errore durante la creazione");
            }
        } catch (err) {
            setError("Errore durante la creazione");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !editItemName.trim()) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/modelli/${editingItem.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nome: editItemName, descrizione: editItemDesc }),
            });

            const data = (await res.json()) as ApiResponse<ModelItem>;
            if (data.success) {
                setItems(items.map(i => i.id === editingItem.id ? data.data : i).sort((a, b) => a.nome.localeCompare(b.nome)));
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
        if (!confirm("Sei sicuro di voler eliminare questo modello?")) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/modelli/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = (await res.json()) as ApiResponse<null>;
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

    const filteredItems = items.filter(item =>
        item.nome.toLowerCase().includes(search.toLowerCase()) ||
        item.descrizione?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Anagrafica Modelli</h1>
                    <p className="text-gray-500 mt-1">Gestisci i modelli delle apparecchiature</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuovo Modello
                </Button>
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

            <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Cerca modello..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm border-none shadow-none focus-visible:ring-0"
                    />
                </div>

                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-[300px]">Nome</th>
                                <th scope="col" className="px-6 py-3">Descrizione</th>
                                <th scope="col" className="px-6 py-3 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Caricamento...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                        Nessun modello trovato.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.nome}</td>
                                        <td className="px-6 py-4">{item.descrizione}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setEditItemName(item.nome);
                                                        setEditItemDesc(item.descrizione || "");
                                                    }}
                                                    title="Modifica"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={actionLoading}
                                                    title="Elimina"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aggiungi Modello</DialogTitle>
                        <DialogDescription>
                            Crea un nuovo modello di apparecchiatura.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Es. Ecografo X200"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="desc" className="text-right">
                                    Descrizione
                                </Label>
                                <Input
                                    id="desc"
                                    value={newItemDesc}
                                    onChange={(e) => setNewItemDesc(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Opzionale"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Annulla
                            </Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Salva
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifica Modello</DialogTitle>
                        <DialogDescription>
                            Modifica i dettagli del modello esistente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editItemName}
                                    onChange={(e) => setEditItemName(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-desc" className="text-right">
                                    Descrizione
                                </Label>
                                <Input
                                    id="edit-desc"
                                    value={editItemDesc}
                                    onChange={(e) => setEditItemDesc(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                                Annulla
                            </Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Salva Modifiche
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ModelsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
            <ModelsPageContent />
        </Suspense>
    );
}
