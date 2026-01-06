import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Activity, Package } from "lucide-react";
import { EquipmentListItem } from "./EquipmentListItem";

interface EquipmentItem {
  id: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
}

interface EquipmentGroupCardProps {
  activity_id: number | null;
  activity_stato: string | null;
  activity_data_apertura: string | null;
  activity_data_chiusura: string | null;
  equipment: EquipmentItem[];
}

export function EquipmentGroupCard({
  activity_id,
  activity_stato,
  activity_data_apertura,
  activity_data_chiusura,
  equipment
}: EquipmentGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/D";
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  const getStatusBadge = (stato: string | null) => {
    if (!stato) return null;

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      "APERTO": { bg: "bg-green-100", text: "text-green-700", label: "Aperto" },
      "CHIUSO": { bg: "bg-gray-100", text: "text-gray-700", label: "Chiuso" },
      "RIAPERTO": { bg: "bg-yellow-100", text: "text-yellow-700", label: "Riaperto" },
      "SOSPESO": { bg: "bg-orange-100", text: "text-orange-700", label: "Sospeso" }
    };

    const config = statusConfig[stato] || statusConfig["APERTO"];

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const bgColor = activity_id === null
    ? "bg-gray-50"
    : activity_stato === "APERTO" || activity_stato === "RIAPERTO"
      ? "bg-green-50"
      : "bg-gray-50";

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity_id) {
      router.push(`/attivita/${activity_id}`);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`rounded-lg border border-gray-200 ${bgColor} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {activity_id ? (
            <Activity size={18} className="text-purple-600" />
          ) : (
            <Package size={18} className="text-gray-600" />
          )}
          <div className="text-left">
            {activity_id ? (
              <div className="flex items-center gap-2">
                <span
                  className="font-medium text-gray-900 hover:text-purple-600 cursor-pointer"
                  onClick={handleHeaderClick}
                >
                  Attività #{activity_id}
                </span>
                {getStatusBadge(activity_stato)}
              </div>
            ) : (
              <span className="font-medium text-gray-700">Senza Attività</span>
            )}
            {activity_id && activity_data_apertura && (
              <p className="text-xs text-gray-600 mt-1">
                Apertura: {formatDate(activity_data_apertura)}
                {activity_data_chiusura && ` • Chiusura: ${formatDate(activity_data_chiusura)}`}
              </p>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-600">
          {equipment.length} {equipment.length === 1 ? "apparecchiatura" : "apparecchiature"}
        </span>
      </button>

      {/* Equipment List */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {equipment.map(item => (
            <EquipmentListItem key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
