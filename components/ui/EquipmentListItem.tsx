import { useRouter } from "next/navigation";
import { Monitor, Calendar } from "lucide-react";

interface EquipmentListItemProps {
  id: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
}

export function EquipmentListItem({
  id,
  modello,
  seriale,
  data_test_funzionali,
  data_test_elettrici,
  note
}: EquipmentListItemProps) {
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/D";
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  return (
    <div
      onClick={() => router.push(`/apparecchiature/${id}`)}
      className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="p-2 bg-purple-100 rounded">
        <Monitor size={20} className="text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900">{modello}</h4>
        <p className="text-sm text-gray-600">
          Seriale: {seriale || "N/D"}
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          {data_test_funzionali && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Funz: {formatDate(data_test_funzionali)}</span>
            </div>
          )}
          {data_test_elettrici && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Elettr: {formatDate(data_test_elettrici)}</span>
            </div>
          )}
        </div>
        {note && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{note}</p>
        )}
      </div>
    </div>
  );
}
