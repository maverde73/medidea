"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Tecnico {
    id: number;
    nome: string;
    cognome: string;
}

interface TechnicianSelectProps {
    value?: string; // ID as string
    onChange: (value: string) => void;
    onTechnicianSelect?: (tecnico: Tecnico | null) => void;
    availableForUserOnly?: boolean;
    currentUserId?: number;
}

export function TechnicianSelect({
    value,
    onChange,
    onTechnicianSelect,
    availableForUserOnly = false,
    currentUserId,
}: TechnicianSelectProps) {
    const [tecnici, setTecnici] = useState<Tecnico[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newTecnico, setNewTecnico] = useState({ nome: "", cognome: "" });
    const [creating, setCreating] = useState(false);

    const fetchTecnici = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = "/api/tecnici";
            const params = new URLSearchParams();
            if (availableForUserOnly) params.append("available", "true");
            if (currentUserId) params.append("current_user_id", currentUserId.toString());

            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = (await res.json()) as Tecnico[];
                setTecnici(data);
            }
        } catch (error) {
            console.error("Error fetching technicians:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTecnici();
    }, [availableForUserOnly]);

    const handleCreate = async () => {
        if (!newTecnico.nome || !newTecnico.cognome) {
            toast.error("Nome e Cognome sono obbligatori");
            return;
        }

        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/tecnici", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newTecnico),
            });

            if (res.ok) {
                const created = (await res.json()) as Tecnico;
                toast.success("Tecnico creato con successo");
                setTecnici((prev) => [...prev, created].sort((a, b) => a.cognome.localeCompare(b.cognome)));
                onChange(created.id.toString());
                onTechnicianSelect?.(created);
                setOpen(false);
                setNewTecnico({ nome: "", cognome: "" });
            } else {
                const error = (await res.json()) as any;
                toast.error(error.error || "Errore nella creazione");
            }
        } catch (error) {
            console.error("Error creating technician:", error);
            toast.error("Errore di rete");
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <Select value={value} onValueChange={(val) => {
                if (val === "new") {
                    setOpen(true);
                } else {
                    onChange(val);
                    const selectedTecnico = tecnici.find(t => t.id.toString() === val);
                    onTechnicianSelect?.(selectedTecnico || null);
                }
            }}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleziona un tecnico">
                        {value && tecnici.find(t => t.id.toString() === value)
                            ? `${tecnici.find(t => t.id.toString() === value)?.cognome} ${tecnici.find(t => t.id.toString() === value)?.nome}`
                            : null}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="new" className="font-semibold text-primary">
                        + Crea Nuovo Tecnico
                    </SelectItem>
                    {tecnici.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                            {t.cognome} {t.nome}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crea Nuovo Tecnico</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                                id="nome"
                                value={newTecnico.nome}
                                onChange={(e) => setNewTecnico({ ...newTecnico, nome: e.target.value })}
                                placeholder="Nome"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cognome">Cognome</Label>
                            <Input
                                id="cognome"
                                value={newTecnico.cognome}
                                onChange={(e) => setNewTecnico({ ...newTecnico, cognome: e.target.value })}
                                placeholder="Cognome"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Annulla
                        </Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? "Creazione..." : "Crea"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
