import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Users, Monitor, Activity } from "lucide-react";
import { EquipmentGroupCard } from "./EquipmentGroupCard";

interface EquipmentItem {
  id: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
}

interface EquipmentGroup {
  activity_id: number | null;
  activity_stato: string | null;
  activity_data_apertura: string | null;
  activity_data_chiusura: string | null;
  equipment: EquipmentItem[];
}

interface ClientWithEquipment {
  id: number;
  nome: string;
  indirizzo: string | null;
  contatti: string | null;
  equipment_count: number;
  activities_count: number;
  equipment_groups: EquipmentGroup[];
}

interface ClientHierarchyCardProps {
  client: ClientWithEquipment;
}

export function ClientHierarchyCard({ client }: ClientHierarchyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleClientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/clienti/${client.id}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Client Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className="p-3 bg-blue-100 rounded-lg">
          <Users size={24} className="text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <h3
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer inline-flex items-center gap-2"
            onClick={handleClientClick}
          >
            {client.nome}
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </h3>
          {client.indirizzo && (
            <p className="text-sm text-gray-600 mt-1">{client.indirizzo}</p>
          )}
          {client.contatti && (
            <p className="text-sm text-gray-600">{client.contatti}</p>
          )}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Monitor size={16} />
              <span>{client.equipment_count} {client.equipment_count === 1 ? "apparecchiatura" : "apparecchiature"}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Activity size={16} />
              <span>{client.activities_count} {client.activities_count === 1 ? "attività" : "attività"}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Equipment Groups */}
      {isExpanded && (
        <div className="px-6 pb-4 space-y-3 bg-gray-50">
          {client.equipment_groups.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nessuna apparecchiatura trovata
            </p>
          ) : (
            client.equipment_groups.map((group, index) => (
              <EquipmentGroupCard key={group.activity_id || `no-activity-${index}`} {...group} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
