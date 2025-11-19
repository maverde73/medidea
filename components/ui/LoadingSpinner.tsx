"use client";

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional message to display */
  message?: string;
  /** Color variant */
  variant?: "primary" | "secondary" | "white";
  /** Center in container */
  centered?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const colorClasses = {
  primary: "border-blue-600",
  secondary: "border-gray-600",
  white: "border-white",
};

export function LoadingSpinner({
  size = "md",
  message,
  variant = "primary",
  centered = false,
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[variant]}`}
        aria-hidden="true"
      />
      {message && (
        <p className="mt-3 text-sm text-gray-600" aria-label={message}>
          {message}
        </p>
      )}
      <span className="sr-only">Caricamento in corso...</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
