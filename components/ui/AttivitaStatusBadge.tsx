"use client";

export type AttivitaStatus = "APERTO" | "CHIUSO" | "RIAPERTO";

export interface AttivitaStatusBadgeProps {
  /** Current status of the activity */
  status: AttivitaStatus;
  /** Optional additional CSS classes */
  className?: string;
}

const statusConfig: Record<
  AttivitaStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  APERTO: {
    label: "Aperto",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "●",
  },
  CHIUSO: {
    label: "Chiuso",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: "✓",
  },
  RIAPERTO: {
    label: "Riaperto",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: "⟲",
  },
};

export function AttivitaStatusBadge({
  status,
  className = "",
}: AttivitaStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} ${className}`}
      role="status"
      aria-label={`Stato attività: ${config.label}`}
    >
      <span className="mr-1.5" aria-hidden="true">
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}
