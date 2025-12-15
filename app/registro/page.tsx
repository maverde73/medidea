"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import * as XLSX from "xlsx";
import { Download, Search, Filter, Loader2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { AttivitaStatusBadge, AttivitaStatus } from "@/components/ui/AttivitaStatusBadge";

interface Attivita {
    id: number;
    nome_cliente: string;
    data_presa_in_carico: string | null;
    id_cliente: number;
    created_at: string;
    data_apertura_richiesta: string | null;
    modello: string | null;
    seriale: string | null;
    stato: string;
    urgenza: string | null;
    descrizione_richiesta: string | null;
    tecnico: string | null;
    nome_tecnico: string | null;
    cognome_tecnico: string | null;
}

export default function RegistroAttivita() {
    const router = useRouter();
    const [attivita, setAttivita] = useState<Attivita[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Attivita; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState({
        search: "",
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString(),
    });

    useEffect(() => {
        fetchAttivita();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchAttivita = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            const startDate = filters.month
                ? new Date(parseInt(filters.year), parseInt(filters.month) - 1, 1)
                : new Date(parseInt(filters.year), 0, 1);

            const endDate = filters.month
                ? new Date(parseInt(filters.year), parseInt(filters.month), 0)
                : new Date(parseInt(filters.year), 11, 31);

            params.append("data_apertura_da", startDate.toISOString());
            params.append("data_apertura_a", endDate.toISOString());
            params.append("limit", "1000");

            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const res = await fetch(`/api/attivita?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as { success: boolean; data: Attivita[] };

            if (data.success) {
                let filteredData = data.data;
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    filteredData = filteredData.filter((a: Attivita) =>
                        (a.nome_cliente?.toLowerCase().includes(searchLower)) ||
                        (a.modello?.toLowerCase().includes(searchLower)) ||
                        (a.seriale?.toLowerCase().includes(searchLower)) ||
                        (a.nome_tecnico?.toLowerCase().includes(searchLower)) ||
                        (a.cognome_tecnico?.toLowerCase().includes(searchLower)) ||
                        (a.descrizione_richiesta?.toLowerCase().includes(searchLower)) ||
                        (a.tecnico?.toLowerCase().includes(searchLower))
                    );
                }
                setAttivita(filteredData);
            }
        } catch (error) {
            console.error("Error fetching attivita:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            attivita.map((a) => ({
                Cliente: a.nome_cliente,
                "Data Presa in Carico": a.data_presa_in_carico ? format(new Date(a.data_presa_in_carico), "dd/MM/yyyy HH:mm") : "",
                "Richiesta N°": a.id,
                "Del (Data Apertura)": a.data_apertura_richiesta ? format(new Date(a.data_apertura_richiesta), "dd/MM/yyyy") : "",
                Apparecchiatura: `${a.modello || ""} ${a.seriale ? `(${a.seriale})` : ""}`,
                Tecnico: a.nome_tecnico && a.cognome_tecnico ? `${a.cognome_tecnico} ${a.nome_tecnico}` : (a.tecnico || ""),
                Stato: a.stato,
                Urgenza: a.urgenza,
                Descrizione: a.descrizione_richiesta
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registro Attività");
        XLSX.writeFile(wb, `registro_attivita_${filters.year}_${filters.month || 'anno'}.xlsx`);
    };

    const sortedAttivita = [...attivita].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aVal: any = a[key];
        let bVal: any = b[key];

        // Handle nulls
        if (aVal === null) return direction === 'asc' ? 1 : -1;
        if (bVal === null) return direction === 'asc' ? -1 : 1;

        // String comparison
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key: keyof Attivita) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (columnKey: keyof Attivita) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-4 w-4 text-primary-600" />
            : <ArrowDown className="h-4 w-4 text-primary-600" />;
    };

    const getUrgenzaColor = (urgenza: string | null) => {
        switch (urgenza) {
            case "ALTA": return "bg-red-100 text-red-800 border-red-200";
            case "MEDIA": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "BASSA": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Registro Attività</h1>
                    <p className="text-gray-500 mt-1">
                        Visualizzazione tabellare e reportistica
                    </p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
                >
                    <Download className="h-4 w-4" />
                    Esporta Excel
                </button>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white">
                <div className="flex flex-col space-y-1.5 p-6 border-b">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">Filtri</h3>
                </div>
                <div className="p-6 flex flex-wrap gap-4 items-end">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cerca</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground text-gray-400" />
                            <input
                                id="search"
                                placeholder="Cerca per cliente, modello, seriale, tecnico..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <div className="grid w-full max-w-[150px] items-center gap-1.5">
                        <label htmlFor="year" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Anno</label>
                        <select
                            id="year"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {[2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y.toString()}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid w-full max-w-[150px] items-center gap-1.5">
                        <label htmlFor="month" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mese</label>
                        <select
                            id="month"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Tutto l&apos;anno</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m.toString()}>
                                    {new Date(0, m - 1).toLocaleString('it-IT', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('id')}>
                                    <div className="flex items-center gap-1">Richiesta N° {renderSortIcon('id')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('nome_cliente')}>
                                    <div className="flex items-center gap-1">Cliente {renderSortIcon('nome_cliente')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('data_apertura_richiesta')}>
                                    <div className="flex items-center gap-1">Data Apertura {renderSortIcon('data_apertura_richiesta')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('data_presa_in_carico')}>
                                    <div className="flex items-center gap-1">Data Presa in Carico {renderSortIcon('data_presa_in_carico')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('modello')}>
                                    <div className="flex items-center gap-1">Apparecchiatura {renderSortIcon('modello')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('cognome_tecnico')}>
                                    <div className="flex items-center gap-1">Tecnico {renderSortIcon('cognome_tecnico')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('descrizione_richiesta')}>
                                    <div className="flex items-center gap-1">Descrizione {renderSortIcon('descrizione_richiesta')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('urgenza')}>
                                    <div className="flex items-center gap-1">Urgenza {renderSortIcon('urgenza')}</div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap cursor-pointer group hover:bg-gray-100" onClick={() => requestSort('stato')}>
                                    <div className="flex items-center gap-1">Stato {renderSortIcon('stato')}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Caricamento dati...
                                        </div>
                                    </td>
                                </tr>
                            ) : attivita.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        Nessuna attività trovata per i filtri selezionati.
                                    </td>
                                </tr>
                            ) : (
                                sortedAttivita.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/attivita/${a.id}`)}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">#{a.id}</td>
                                        <td className="px-4 py-3 text-gray-900 font-medium">{a.nome_cliente}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {a.data_apertura_richiesta ? format(new Date(a.data_apertura_richiesta), "dd/MM/yyyy") : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {a.data_presa_in_carico ? format(new Date(a.data_presa_in_carico), "dd/MM/yyyy HH:mm") : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{a.modello}</div>
                                            <div className="text-xs text-gray-500">{a.seriale}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                                            {a.nome_tecnico && a.cognome_tecnico
                                                ? `${a.cognome_tecnico} ${a.nome_tecnico}`
                                                : a.tecnico || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={a.descrizione_richiesta || ""}>
                                            {a.descrizione_richiesta || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {a.urgenza && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgenzaColor(a.urgenza)}`}>
                                                    {a.urgenza}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <AttivitaStatusBadge status={a.stato as AttivitaStatus} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
