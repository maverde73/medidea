"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Model {
    id: number;
    nome: string;
    descrizione?: string;
}

interface ModelSelectorProps {
    value?: number;
    onSelect: (modelId: number | null) => void;
    error?: string;
}

export function ModelSelector({ value, onSelect, error }: ModelSelectorProps) {
    const [open, setOpen] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newModelName, setNewModelName] = useState("");
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchModels();

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/modelli", {
                headers: { Authorization: `Bearer ${token} ` },
            });
            if (res.ok) {
                const data = await res.json() as { data: Model[] };
                setModels(data.data);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
            toast.error("Errore nel caricamento dei modelli");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newModelName.trim()) return;

        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/modelli", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token} `,
                },
                body: JSON.stringify({ nome: newModelName }),
            });

            const data = await res.json() as { data: Model; error?: string };

            if (res.ok) {
                setModels((prev) => [...prev, data.data].sort((a, b) => a.nome.localeCompare(b.nome)));
                onSelect(data.data.id);
                setDialogOpen(false);
                setNewModelName("");
                toast.success("Modello creato con successo");
            } else {
                toast.error(data.error || "Errore nella creazione del modello");
            }
        } catch (error) {
            console.error("Error creating model:", error);
            toast.error("Errore di connessione");
        } finally {
            setCreating(false);
        }
    };

    const selectedModel = models.find((m) => m.id === value);
    const filteredModels = models.filter((m) =>
        m.nome.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-2" ref={containerRef}>
            <div className="relative">
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        error && "border-red-500"
                    )}
                >
                    {value
                        ? selectedModel?.nome || "Seleziona modello..."
                        : "Seleziona modello..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                {open && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Cerca modello..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-1">
                            {filteredModels.length === 0 && (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    Nessun modello trovato.
                                </div>
                            )}
                            {filteredModels.map((model) => (
                                <div
                                    key={model.id}
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                        value === model.id && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => {
                                        onSelect(model.id === value ? null : model.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === model.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {model.nome}
                                </div>
                            ))}

                            <hr className="my-1" />
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    setDialogOpen(true);
                                }}
                                className="w-full text-left py-2 pl-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-sm flex items-center"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Crea nuovo modello
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crea Nuovo Modello</DialogTitle>
                        <DialogDescription>
                            Inserisci il nome del nuovo modello di apparecchiatura.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={newModelName}
                                onChange={(e) => setNewModelName(e.target.value)}
                                className="col-span-3"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annulla
                        </Button>
                        <Button onClick={handleCreate} disabled={!newModelName.trim() || creating}>
                            {creating ? "Creazione..." : "Crea Modello"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

