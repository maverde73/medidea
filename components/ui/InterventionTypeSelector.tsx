"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";


interface InterventionType {
    id: number;
    codice: string;
    descrizione: string;
    ordine: number;
}

interface InterventionTypeSelectorProps {
    // Current selection as JSON array or comma-separated string
    value: string | null;
    onChange: (value: string) => void;
    // Which type of selector
    type: "apparecchiatura" | "intervento" | "modalita";
    label?: string;
}

export function InterventionTypeSelector({
    value,
    onChange,
    type,
    label,
}: InterventionTypeSelectorProps) {
    const [options, setOptions] = useState<InterventionType[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const apiEndpoint =
        type === "apparecchiatura"
            ? "/api/tipi-apparecchiatura"
            : type === "intervento"
                ? "/api/tipi-intervento"
                : "/api/modalita-intervento";

    const defaultLabel =
        type === "apparecchiatura"
            ? "Tipi Apparecchiatura"
            : type === "intervento"
                ? "Tipi Intervento"
                : "Modalità Intervento";

    useEffect(() => {
        loadOptions();
    }, []);

    useEffect(() => {
        if (value) {
            try {
                const parsed = JSON.parse(value);
                setSelected(Array.isArray(parsed) ? parsed : []);
            } catch {
                // If not JSON, try comma-separated
                setSelected(value.split(",").filter(Boolean));
            }
        } else {
            setSelected([]);
        }
    }, [value]);

    const loadOptions = async () => {
        try {
            const response = await fetch(apiEndpoint);
            const data = await response.json();
            if (data.success) {
                setOptions(data.data);
            }
        } catch (error) {
            console.error("Error loading options:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (codice: string) => {
        const newSelected = selected.includes(codice)
            ? selected.filter((s) => s !== codice)
            : [...selected, codice];

        setSelected(newSelected);
        onChange(JSON.stringify(newSelected));
    };

    if (loading) return <div>Caricamento...</div>;

    // For modalita (radio behavior)
    if (type === "modalita") {
        return (
            <div className="space-y-2">
                <Label>{label || defaultLabel}</Label>
                <div className="space-y-2">
                    {options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id={`modalita-${option.codice}`}
                                name="modalita-intervento"
                                checked={selected.includes(option.codice)}
                                onChange={() => {
                                    setSelected([option.codice]);
                                    onChange(option.codice);
                                }}
                                className="h-4 w-4"
                            />
                            <label
                                htmlFor={`modalita-${option.codice}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {option.descrizione}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // For apparecchiatura and intervento (checkbox behavior)
    return (
        <div className="space-y-2">
            <Label>{label || defaultLabel}</Label>
            <div className="grid grid-cols-2 gap-2">
                {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                        <input
                            id={`${type}-${option.codice}`}
                            type="checkbox"
                            checked={selected.includes(option.codice)}
                            onChange={() => handleToggle(option.codice)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                            htmlFor={`${type}-${option.codice}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            {option.descrizione}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
