"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModelSelector } from "@/components/ui/ModelSelector";
import { toast } from "sonner";

interface Equipment {
    id: number;
    modello: string;
    seriale: string | null;
}

interface EquipmentSelectorProps {
    idCliente: number;
    value?: number;
    onSelect: (equipmentId: number | null) => void;
    error?: string;
    disabled?: boolean;
    showNewEquipmentLink?: boolean;
}

export function EquipmentSelector({
    idCliente,
    value,
    onSelect,
    error,
    disabled = false,
    showNewEquipmentLink = false,
}: EquipmentSelectorProps) {
    const [open, setOpen] = useState(false);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newEquipment, setNewEquipment] = useState({ id_modello: null as number | null, seriale: "" });
    const [creating, setCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (idCliente) {
            fetchEquipment();
        } else {
            setEquipment([]);
        }
    }, [idCliente]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/apparecchiature?id_cliente=${idCliente}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json() as { data: Equipment[] };
                setEquipment(data.data);
            }
        } catch (error) {
            console.error("Error fetching equipment:", error);
            toast.error("Errore nel caricamento delle apparecchiature");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newEquipment.id_modello) {
            toast.error("Seleziona un modello");
            return;
        }

        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/apparecchiature", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id_cliente: idCliente,
                    id_modello: newEquipment.id_modello,
                    seriale: newEquipment.seriale || null,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                const created = result.data as Equipment;
                toast.success("Apparecchiatura creata con successo");
                // Refresh equipment list
                await fetchEquipment();
                onSelect(created.id);
                setCreateDialogOpen(false);
                setNewEquipment({ id_modello: null, seriale: "" });
            } else {
                const errorData = await res.json() as any;
                toast.error(errorData.error || "Errore nella creazione");
            }
        } catch (error) {
            console.error("Error creating equipment:", error);
            toast.error("Errore di rete");
        } finally {
            setCreating(false);
        }
    };

    const selectedEquipment = equipment.find((e) => e.id === value);
    const filteredEquipment = equipment.filter((e) =>
        e.modello.toLowerCase().includes(search.toLowerCase()) ||
        (e.seriale && e.seriale.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <div className="space-y-2" ref={containerRef}>
                <div className="relative">
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled || !idCliente}
                        onClick={() => setOpen(!open)}
                        className={cn(
                            "w-full justify-between",
                            !value && "text-muted-foreground",
                            error && "border-red-500"
                        )}
                    >
                        {value
                            ? `${selectedEquipment?.modello || "Sconosciuto"} ${selectedEquipment?.seriale ? `(S/N: ${selectedEquipment.seriale})` : ""
                            }`
                            : "Seleziona apparecchiatura..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>

                    {open && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                            <div className="flex items-center border-b px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <input
                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Cerca apparecchiatura..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-1">
                                {filteredEquipment.length === 0 && (
                                    <div className="py-6 text-center text-sm">
                                        <p className="text-muted-foreground">Nessuna apparecchiatura trovata.</p>
                                    </div>
                                )}
                                {filteredEquipment.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                            value === item.id && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => {
                                            onSelect(item.id === value ? null : item.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.modello}</span>
                                            {item.seriale && (
                                                <span className="text-xs text-muted-foreground">
                                                    S/N: {item.seriale}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* New Equipment Link */}
                                {showNewEquipmentLink && (
                                    <>
                                        <hr className="my-1" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCreateDialogOpen(true);
                                                setOpen(false);
                                            }}
                                            className="w-full text-left py-2 px-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-sm"
                                        >
                                            + Nuova Apparecchiatura
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* Create Equipment Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crea Nuova Apparecchiatura</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="modello">Modello *</Label>
                            <ModelSelector
                                value={newEquipment.id_modello || undefined}
                                onSelect={(id) => setNewEquipment({ ...newEquipment, id_modello: id })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seriale">Numero Seriale</Label>
                            <Input
                                id="seriale"
                                value={newEquipment.seriale}
                                onChange={(e) => setNewEquipment({ ...newEquipment, seriale: e.target.value })}
                                placeholder="Inserisci numero seriale"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Annulla
                        </Button>
                        <Button onClick={handleCreate} disabled={creating || !newEquipment.id_modello}>
                            {creating ? "Creazione..." : "Crea"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
