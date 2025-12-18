"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface Client {
    id: number;
    nome: string;
}

interface GlobalServiceToggleProps {
    value: number | null;
    onChange: (enabled: boolean, clienteFinaleId?: number | null) => void;
    currentClientId?: number; // To exclude current client from final client dropdown
}

export function GlobalServiceToggle({
    value,
    onChange,
    currentClientId,
}: GlobalServiceToggleProps) {
    const [enabled, setEnabled] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientFinale, setSelectedClientFinale] = useState<number | null>(null);

    useEffect(() => {
        setEnabled(value === 1);
    }, [value]);

    useEffect(() => {
        if (enabled) {
            loadClients();
        }
    }, [enabled]);

    const loadClients = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/clienti", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Filter out current client if provided
                const filtered = currentClientId
                    ? data.data.filter((c: Client) => c.id !== currentClientId)
                    : data.data;
                setClients(filtered);
            }
        } catch (error) {
            console.error("Error loading clients:", error);
        }
    };

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        if (!checked) {
            setSelectedClientFinale(null);
            onChange(false, null);
        } else {
            onChange(true, selectedClientFinale);
        }
    };

    const handleClientChange = (clientId: number | null) => {
        setSelectedClientFinale(clientId);
        onChange(enabled, clientId);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <input
                    id="global-service"
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                />
                <label
                    htmlFor="global-service"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    Global Service
                </label>
            </div>

            {enabled && (
                <div>
                    <Label>Cliente Finale *</Label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={selectedClientFinale || ""}
                        onChange={(e) =>
                            handleClientChange(e.target.value ? Number(e.target.value) : null)
                        }
                    >
                        <option value="">Seleziona cliente finale...</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.nome}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-muted-foreground mt-1">
                        Specificare il cliente finale quando si opera in Global Service
                    </p>
                </div>
            )}
        </div>
    );
}
