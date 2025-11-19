"use client";

import { useState } from "react";
import { format, subDays, subMonths, subYears, startOfDay } from "date-fns";
import { it } from "date-fns/locale";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DateRangePickerProps {
  /** Current date range value */
  value: DateRange;
  /** Callback when date range changes */
  onChange: (range: DateRange) => void;
  /** Show quick filter presets */
  showQuickFilters?: boolean;
  /** Custom label */
  label?: string;
}

const quickFilters = [
  { label: "Ultima settimana", days: 7 },
  { label: "Ultimo mese", days: 30 },
  { label: "Ultimi 3 mesi", days: 90 },
  { label: "Ultimo anno", days: 365 },
];

export function DateRangePicker({
  value,
  onChange,
  showQuickFilters = true,
  label = "Intervallo date",
}: DateRangePickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  const handleQuickFilter = (days: number) => {
    const to = startOfDay(new Date());
    const from = startOfDay(subDays(to, days));
    onChange({ from, to });
    setShowPresets(false);
  };

  const handleClear = () => {
    onChange({ from: null, to: null });
  };

  const formatDateValue = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center space-x-2">
        {/* From Date */}
        <div className="flex-1">
          <input
            type="date"
            value={formatDateValue(value.from)}
            onChange={(e) =>
              onChange({ ...value, from: parseDate(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            aria-label="Data inizio"
          />
        </div>

        <span className="text-gray-500 text-sm">-</span>

        {/* To Date */}
        <div className="flex-1">
          <input
            type="date"
            value={formatDateValue(value.to)}
            onChange={(e) =>
              onChange({ ...value, to: parseDate(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            aria-label="Data fine"
          />
        </div>

        {/* Quick Filters Button */}
        {showQuickFilters && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Mostra filtri rapidi"
              aria-expanded={showPresets}
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

            {/* Quick Filters Dropdown */}
            {showPresets && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="quick-filters-menu"
                >
                  {quickFilters.map((filter) => (
                    <button
                      key={filter.days}
                      onClick={() => handleQuickFilter(filter.days)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      {filter.label}
                    </button>
                  ))}
                  <hr className="my-1" />
                  <button
                    onClick={handleClear}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Cancella filtro
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clear Button */}
        {(value.from || value.to) && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            aria-label="Cancella date"
          >
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
        )}
      </div>

      {/* Selected Range Display */}
      {(value.from || value.to) && (
        <p className="text-xs text-gray-500">
          {value.from && value.to
            ? `Dal ${format(value.from, "dd/MM/yyyy", { locale: it })} al ${format(value.to, "dd/MM/yyyy", { locale: it })}`
            : value.from
            ? `Da ${format(value.from, "dd/MM/yyyy", { locale: it })}`
            : value.to
            ? `Fino al ${format(value.to, "dd/MM/yyyy", { locale: it })}`
            : ""}
        </p>
      )}
    </div>
  );
}
