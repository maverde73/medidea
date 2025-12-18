"use client";

import { useState, useEffect, useRef } from "react";
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

export interface Cliente {
  id: number;
  nome: string;
  indirizzo?: string;
  contatti?: string;
}

export interface ClientSelectorProps {
  /** Currently selected client ID */
  value: number | null;
  /** Callback when client changes */
  onChange: (clientId: number | null, client: Cliente | null) => void;
  /** Show "Tutti" option */
  showAllOption?: boolean;
  /** Custom label */
  label?: string;
  /** Required field */
  required?: boolean;
  /** Show "Nuovo Cliente" link - now creates inline instead of callback */
  showNewClientLink?: boolean;
  /** @deprecated Use inline creation instead */
  onNewClient?: () => void;
}

export function ClientSelector({
  value,
  onChange,
  showAllOption = false,
  label = "Cliente",
  required = false,
  showNewClientLink = false,
  onNewClient,
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nome: "", indirizzo: "", contatti: "" });
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/clienti", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = (await response.json()) as { data: Cliente[] };
          setClients(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Update selected client when value changes
  useEffect(() => {
    if (value) {
      const client = clients.find((c) => c.id === value);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [value, clients]);

  const filteredClients = clients.filter((client) =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (client: Cliente | null) => {
    setSelectedClient(client);
    onChange(client?.id || null, client);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreate = async () => {
    if (!newClient.nome) {
      toast.error("Nome è obbligatorio");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/clienti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      if (res.ok) {
        const result = await res.json();
        const created = result.data as Cliente;
        toast.success("Cliente creato con successo");
        setClients((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)));
        onChange(created.id, created);
        setSelectedClient(created);
        setCreateDialogOpen(false);
        setNewClient({ nome: "", indirizzo: "", contatti: "" });
      } else {
        const error = (await res.json()) as any;
        toast.error(error.error || "Errore nella creazione");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Errore di rete");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Selected Value Display / Search Input */}
        <div className="relative">
          <input
            type="text"
            value={isOpen ? searchTerm : selectedClient?.nome || ""}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={loading ? "Caricamento..." : "Cerca cliente..."}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
            aria-label={label}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="client-listbox"
          />

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-y-0 right-0 flex items-center px-2"
            aria-label="Toggle dropdown"
          >
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && !loading && (
          <div
            id="client-listbox"
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            role="listbox"
          >
            {/* All Option */}
            {showAllOption && (
              <div
                onClick={() => handleSelect(null)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${!value ? "bg-blue-50" : ""
                  }`}
                role="option"
                aria-selected={!value}
              >
                <span className="block truncate font-medium">Tutti i clienti</span>
              </div>
            )}

            {/* Clients List */}
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${value === client.id ? "bg-blue-50" : ""
                    }`}
                  role="option"
                  aria-selected={value === client.id}
                >
                  <div>
                    <span className="block truncate font-medium">{client.nome}</span>
                    {client.indirizzo && (
                      <span className="block truncate text-xs text-gray-500">
                        {client.indirizzo}
                      </span>
                    )}
                  </div>
                  {value === client.id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-2 pl-3 pr-9 text-gray-500 text-sm">
                Nessun cliente trovato
              </div>
            )}

            {/* New Client Link */}
            {showNewClientLink && (
              <>
                <hr className="my-1" />
                <button
                  type="button"
                  onClick={() => {
                    // Use inline dialog instead of callback
                    setCreateDialogOpen(true);
                    setIsOpen(false);
                    // Still call old callback for backwards compatibility
                    onNewClient?.();
                  }}
                  className="w-full text-left py-2 pl-3 pr-9 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                >
                  + Nuovo Cliente
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Client Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea Nuovo Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={newClient.nome}
                onChange={(e) => setNewClient({ ...newClient, nome: e.target.value })}
                placeholder="Nome cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indirizzo">Indirizzo</Label>
              <Input
                id="indirizzo"
                value={newClient.indirizzo}
                onChange={(e) => setNewClient({ ...newClient, indirizzo: e.target.value })}
                placeholder="Via, Città"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contatti">Contatti</Label>
              <Input
                id="contatti"
                value={newClient.contatti}
                onChange={(e) => setNewClient({ ...newClient, contatti: e.target.value })}
                placeholder="Telefono, Email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
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
