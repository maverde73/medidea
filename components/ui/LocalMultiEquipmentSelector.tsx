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

interface LocalEquipment {
    tempId: string; // Temporary ID for local tracking
    id_apparecchiatura?: number; // If selecting existing
    id_modello?: number; // For new equipment
    seriale: string;
    modello: string;
    isNew: boolean;
}

interface LocalMultiEquipmentSelectorProps {
    idCliente: number;
    value: LocalEquipment[];
    onChange: (equipment: LocalEquipment[]) => void;
}

export function LocalMultiEquipmentSelector({
    idCliente,
    value,
    onChange,
}: LocalMultiEquipmentSelectorProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState<any[]>([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [showCreateNew, setShowCreateNew] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        id_modello: null as number | null,
        seriale: "",
        modello_nome: "",
    });

    useEffect(() => {
        if (idCliente > 0) {
            loadAvailableEquipment();
        }
    }, [idCliente]);

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

    const handleAdd = () => {
        if (showCreateNew) {
            // Add new equipment to local state
            if (!newEquipment.id_modello || !newEquipment.seriale) {
                alert("Modello e seriale obbligatori");
                return;
            }

            const newItem: LocalEquipment = {
                tempId: `new_${Date.now()}`,
                id_modello: newEquipment.id_modello,
                seriale: newEquipment.seriale,
                modello: newEquipment.modello_nome,
                isNew: true,
            };

            onChange([...value, newItem]);
            resetDialog();
        } else {
            // Add existing equipment to local state
            if (!selectedEquipmentId) {
                alert("Seleziona un'apparecchiatura");
                return;
            }

            const selectedEq = availableEquipment.find((eq) => eq.id === selectedEquipmentId);
            if (!selectedEq) return;

            // Check if already added
            if (value.some((eq) => eq.id_apparecchiatura === selectedEquipmentId)) {
                alert("Questa apparecchiatura è già stata aggiunta");
                return;
            }

            const newItem: LocalEquipment = {
                tempId: `existing_${Date.now()}`,
                id_apparecchiatura: selectedEq.id,
                seriale: selectedEq.seriale,
                modello: selectedEq.modello,
                isNew: false,
            };

            onChange([...value, newItem]);
            resetDialog();
        }
    };

    const handleRemove = (tempId: string) => {
        onChange(value.filter((eq) => eq.tempId !== tempId));
    };

    const resetDialog = () => {
        setShowAddDialog(false);
        setSelectedEquipmentId(null);
        setShowCreateNew(false);
        setNewEquipment({ id_modello: null, seriale: "", modello_nome: "" });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Apparecchiature</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                    disabled={idCliente === 0}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Apparecchiatura
                </Button>
            </div>

            {idCliente === 0 && (
                <p className="text-sm text-muted-foreground">
                    Seleziona prima un cliente per aggiungere apparecchiature
                </p>
            )}

            <div className="space-y-2">
                {value.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nessuna apparecchiatura selezionata
                    </p>
                ) : (
                    <div className="border rounded-md">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Modello</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Seriale</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Tipo</th>
                                    <th className="px-4 py-2 text-right text-sm font-medium">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {value.map((eq) => (
                                    <tr key={eq.tempId} className="border-t">
                                        <td className="px-4 py-2 text-sm">{eq.modello}</td>
                                        <td className="px-4 py-2 text-sm">{eq.seriale || "N/D"}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`text-xs px-2 py-1 rounded ${eq.isNew ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {eq.isNew ? "Nuova" : "Esistente"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(eq.tempId)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                        onSelect={(id) => {
                                            setNewEquipment({ ...newEquipment, id_modello: id, modello_nome: "" });
                                        }}
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
                        <Button variant="outline" onClick={resetDialog}>
                            Annulla
                        </Button>
                        <Button onClick={handleAdd}>Aggiungi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
