"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

interface ListItemActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ListItemActions({ onView, onEdit, onDelete }: ListItemActionsProps) {
  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Visualizza"
        aria-label="Visualizza"
      >
        <Eye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        title="Modifica"
        aria-label="Modifica"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Elimina"
        aria-label="Elimina"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
