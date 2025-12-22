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
import { Trash2, Plus } from "lucide-react";
import { ModelSelector } from "@/components/ui/ModelSelector";

interface Equipment {
    id: number;
    id_apparecchiatura: number;
    seriale: string;
    modello: string;
    cliente_nome?: string;
}

interface MultiEquipmentSelectorProps {
    idAttivita: number;
    idCliente: number;
    onUpdate?: () => void;
}

export function MultiEquipmentSelector({
    idAttivita,
    idCliente,
    onUpdate,
}: MultiEquipmentSelectorProps) {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState<any[]>([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [showCreateNew, setShowCreateNew] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        id_modello: null as number | null,
        seriale: "",
    });

    useEffect(() => {
        loadEquipment();
        loadAvailableEquipment();
    }, [idAttivita]);

    const loadEquipment = async () => {
        try {
            const response = await fetch(`/api/attivita/${idAttivita}/apparecchiature`);
            const data = (await response.json()) as { success: boolean; data: any };
            if (data.success) {
                setEquipment(data.data);
            }
        } catch (error) {
            console.error("Error loading equipment:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableEquipment = async () => {
        try {
            const response = await fetch(`/api/apparecchiature?id_cliente=${idCliente}`);
            const data = (await response.json()) as { success: boolean; data: any[] };
            if (data.success) {
                setAvailableEquipment(data.data || []);
            }
        } catch (error) {
            console.error("Error loading available equipment:", error);
        }
    };

    const handleAdd = async () => {
        if (showCreateNew) {
            // Create new equipment first
            if (!newEquipment.id_modello || !newEquipment.seriale) {
                alert("Modello e seriale obbligatori");
                return;
            }

            try {
                const createResponse = await fetch("/api/apparecchiature", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_cliente: idCliente,
                        id_modello: newEquipment.id_modello,
                        seriale: newEquipment.seriale,
                    }),
                });

                const createData = (await createResponse.json()) as { success: boolean; data: any };
                if (createData.success && createData.data) {
                    // Now link to activity
                    await linkEquipment(createData.data.id);
                }
            } catch (error) {
                console.error("Error creating equipment:", error);
            }
        } else {
            // Link existing equipment
            if (!selectedEquipmentId) {
                alert("Seleziona un'apparecchiatura");
                return;
            }
            await linkEquipment(selectedEquipmentId);
        }
    };

    const linkEquipment = async (equipmentId: number) => {
        try {
            const response = await fetch(`/api/attivita/${idAttivita}/apparecchiature`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_apparecchiatura: equipmentId }),
            });

            if (response.ok) {
                setShowAddDialog(false);
                setSelectedEquipmentId(null);
                setShowCreateNew(false);
                setNewEquipment({ id_modello: null, seriale: "" });
                loadEquipment();
                loadAvailableEquipment();
                onUpdate?.();
            }
        } catch (error) {
            console.error("Error linking equipment:", error);
        }
    };

    const handleRemove = async (equipmentId: number) => {
        if (!confirm("Rimuovere questa apparecchiatura dall'attività?")) return;

        try {
            const response = await fetch(`/api/attivita/${idAttivita}/apparecchiature`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_apparecchiatura: equipmentId }),
            });

            if (response.ok) {
                loadEquipment();
                onUpdate?.();
            }
        } catch (error) {
            console.error("Error removing equipment:", error);
        }
    };

    if (loading) return <div>Caricamento...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Apparecchiature Collegate</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Apparecchiatura
                </Button>
            </div>

            <div className="space-y-2">
                {equipment.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nessuna apparecchiatura collegata
                    </p>
                ) : (
                    equipment.map((eq) => (
                        <div
                            key={eq.id}
                            className="flex items-center justify-between p-3 border rounded-md"
                        >
                            <div>
                                <div className="font-medium">{eq.modello}</div>
                                <div className="text-sm text-muted-foreground">
                                    Seriale: {eq.seriale || "N/A"}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(eq.id_apparecchiatura)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aggiungi Apparecchiatura</DialogTitle>
                        <DialogDescription>
                            Seleziona un&apos;apparecchiatura esistente o creane una nuova
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
                                Nuova
                            </Button>
                        </div>

                        {showCreateNew ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Modello</Label>
                                    <ModelSelector
                                        value={newEquipment.id_modello ?? undefined}
                                        onSelect={(id) =>
                                            setNewEquipment({ ...newEquipment, id_modello: id })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Seriale</Label>
                                    <Input
                                        value={newEquipment.seriale}
                                        onChange={(e) =>
                                            setNewEquipment({ ...newEquipment, seriale: e.target.value })
                                        }
                                        placeholder="es. SN2023-001"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Label>Apparecchiatura</Label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={selectedEquipmentId || ""}
                                    onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
                                >
                                    <option value="">Seleziona...</option>
                                    {availableEquipment.map((eq) => (
                                        <option key={eq.id} value={eq.id}>
                                            {eq.modello} - {eq.seriale}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
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
