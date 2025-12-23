"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus, Search } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface SparePart {
    id: number;
    id_ricambio: number;
    codice: string;
    descrizione: string;
    quantita: number;
    seriale?: string;
    prezzo_unitario?: number;
}

interface SparePartsManagerProps {
    idAttivita: number;
    onUpdate?: () => void;
}

export function SparePartsManager({ idAttivita, onUpdate }: SparePartsManagerProps) {
    const [parts, setParts] = useState<SparePart[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableParts, setAvailableParts] = useState<any[]>([]);
    const [selectedPart, setSelectedPart] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [seriale, setSeriale] = useState("");
    const [showCreateNew, setShowCreateNew] = useState(false);
    const [newPart, setNewPart] = useState({
        codice: "",
        descrizione: "",
        prezzo_unitario: "",
    });

    useEffect(() => {
        loadParts();
    }, [idAttivita]);

    useEffect(() => {
        if (searchTerm) {
            searchParts();
        }
    }, [searchTerm]);

    const loadParts = async () => {
        try {
            const response = await apiFetch(`/api/attivita/${idAttivita}/ricambi`);
            const data = (await response.json()) as { success: boolean; data: SparePart[] };
            if (data.success) {
                setParts(data.data);
            }
        } catch (error) {
            console.error("Error loading spare parts:", error);
        } finally {
            setLoading(false);
        }
    };

    const searchParts = async () => {
        try {
            const response = await apiFetch(`/api/ricambi?search=${encodeURIComponent(searchTerm)}`);
            const data = (await response.json()) as { success: boolean; data: any[] };
            if (data.success) {
                setAvailableParts(data.data || []);
            }
        } catch (error) {
            console.error("Error searching parts:", error);
        }
    };

    const handleAdd = async () => {
        if (showCreateNew) {
            // Create new spare part first
            if (!newPart.codice || !newPart.descrizione) {
                alert("Codice e descrizione obbligatori");
                return;
            }

            try {
                const createResponse = await apiFetch("/api/ricambi", {
                    method: "POST",
                    body: JSON.stringify({
                        codice: newPart.codice,
                        descrizione: newPart.descrizione,
                        prezzo_unitario: newPart.prezzo_unitario ? parseFloat(newPart.prezzo_unitario) : undefined,
                    }),
                });

                const createData = (await createResponse.json()) as { success: boolean; data: any };
                if (createData.success && createData.data) {
                    // Now link to activity
                    await linkPart(createData.data.id);
                }
            } catch (error) {
                console.error("Error creating spare part:", error);
            }
        } else {
            // Link existing part
            if (!selectedPart) {
                alert("Seleziona un ricambio");
                return;
            }
            await linkPart(selectedPart.id);
        }
    };

    const linkPart = async (partId: number) => {
        try {
            const response = await apiFetch(`/api/attivita/${idAttivita}/ricambi`, {
                method: "POST",
                body: JSON.stringify({
                    id_ricambio: partId,
                    quantita: quantity,
                    seriale: seriale || undefined,
                }),
            });

            if (response.ok) {
                setShowAddDialog(false);
                setSelectedPart(null);
                setQuantity(1);
                setSeriale("");
                setSearchTerm("");
                setShowCreateNew(false);
                setNewPart({ codice: "", descrizione: "", prezzo_unitario: "" });
                loadParts();
                onUpdate?.();
            }
        } catch (error) {
            console.error("Error linking spare part:", error);
        }
    };

    const handleRemove = async (partRowId: number) => {
        if (!confirm("Rimuovere questo ricambio dall'attività?")) return;

        try {
            const response = await apiFetch(`/api/attivita/${idAttivita}/ricambi`, {
                method: "DELETE",
                body: JSON.stringify({ id: partRowId }),
            });

            if (response.ok) {
                loadParts();
                onUpdate?.();
            }
        } catch (error) {
            console.error("Error removing spare part:", error);
        }
    };

    if (loading) return <div>Caricamento...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Ricambi Utilizzati</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Ricambio
                </Button>
            </div>

            <div className="space-y-2">
                {parts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nessun ricambio utilizzato</p>
                ) : (
                    parts.map((part) => (
                        <div
                            key={part.id}
                            className="flex items-center justify-between p-3 border rounded-md"
                        >
                            <div className="flex-1">
                                <div className="font-medium">
                                    {part.codice} - {part.descrizione}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Quantità: {part.quantita}
                                    {part.seriale && ` | Seriale: ${part.seriale}`}
                                    {part.prezzo_unitario && ` | €${part.prezzo_unitario.toFixed(2)}`}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(part.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Aggiungi Ricambio</DialogTitle>
                        <DialogDescription>
                            Cerca un ricambio esistente o creane uno nuovo
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={!showCreateNew ? "default" : "outline"}
                                onClick={() => setShowCreateNew(false)}
                            >
                                Esistente
                            </Button>
                            <Button
                                type="button"
                                variant={showCreateNew ? "default" : "outline"}
                                onClick={() => setShowCreateNew(true)}
                            >
                                Nuovo
                            </Button>
                        </div>

                        {showCreateNew ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Codice</Label>
                                    <Input
                                        value={newPart.codice}
                                        onChange={(e) => setNewPart({ ...newPart, codice: e.target.value })}
                                        placeholder="es. BT-6CK"
                                    />
                                </div>
                                <div>
                                    <Label>Descrizione</Label>
                                    <Input
                                        value={newPart.descrizione}
                                        onChange={(e) => setNewPart({ ...newPart, descrizione: e.target.value })}
                                        placeholder="es. Batteria Ricaricabile"
                                    />
                                </div>
                                <div>
                                    <Label>Prezzo Unitario (opzionale)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={newPart.prezzo_unitario}
                                        onChange={(e) => setNewPart({ ...newPart, prezzo_unitario: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <Label>Cerca Ricambio</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Cerca per codice o descrizione..."
                                        />
                                    </div>
                                </div>

                                {searchTerm && (
                                    <div className="max-h-48 overflow-y-auto border rounded-md">
                                        {availableParts.length === 0 ? (
                                            <p className="p-4 text-sm text-muted-foreground">
                                                Nessun ricambio trovato
                                            </p>
                                        ) : (
                                            availableParts.map((part) => (
                                                <div
                                                    key={part.id}
                                                    className={`p-3 cursor-pointer hover:bg-accent ${selectedPart?.id === part.id ? "bg-accent" : ""
                                                        }`}
                                                    onClick={() => setSelectedPart(part)}
                                                >
                                                    <div className="font-medium">{part.codice}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {part.descrizione}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {selectedPart && (
                                    <div className="p-3 bg-accent rounded-md">
                                        <div className="font-medium">{selectedPart.codice}</div>
                                        <div className="text-sm">{selectedPart.descrizione}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Quantità</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div>
                                <Label>Seriale (opzionale)</Label>
                                <Input
                                    value={seriale}
                                    onChange={(e) => setSeriale(e.target.value)}
                                    placeholder="es. SN123456"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Annulla
                        </Button>
                        <Button onClick={handleAdd}>Aggiungi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
