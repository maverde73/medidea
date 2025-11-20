"use client";

import React, { useState } from "react";

export type AlertType = "error" | "warning" | "success" | "info";

export interface ErrorAlertProps {
  /** Alert type/severity */
  type?: AlertType;
  /** Alert title */
  title?: string;
  /** Alert message/description */
  message?: string;
  /** Make alert dismissible */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const alertConfig: Record<
  AlertType,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
    icon: React.ReactElement;
  }
> = {
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  warning: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
  },
  success: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  info: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
};

export function ErrorAlert({
  type = "error",
  title,
  message,
  dismissible = true,
  onDismiss,
  className = "",
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const config = alertConfig[type];
  const displayTitle = title || (type === "error" ? "Errore" : type === "warning" ? "Attenzione" : type === "success" ? "Successo" : "Info");

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${config.iconColor}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {config.icon}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {displayTitle}
          </h3>
          {message && (
            <div className={`mt-2 text-sm ${config.textColor}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:${config.bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${config.bgColor} focus:ring-${config.iconColor}`}
                aria-label="Chiudi avviso"
              >
                <span className="sr-only">Chiudi</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
