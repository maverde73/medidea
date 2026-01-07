"use client";

import { useState } from "react";

export interface FileInfo {
  id: number;
  nome_file_originale: string;
  chiave_r2: string;
  dimensione: number;
  data_caricamento: string;
  tipo_riferimento?: string;
  id_riferimento?: number;
  categoria?: string | null;
}

export interface FileListProps {
  /** Array of files to display */
  files: FileInfo[];
  /** Callback when download is clicked */
  onDownload: (fileId: number, chiave_r2: string) => void;
  /** Callback when delete is clicked */
  onDelete?: (fileId: number) => void;
  /** Read-only mode (hides delete button) */
  readOnly?: boolean;
  /** Show loading state */
  loading?: boolean;
}

export function FileList({
  files,
  onDownload,
  onDelete,
  readOnly = false,
  loading = false,
}: FileListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleDelete = async (fileId: number) => {
    if (!onDelete) return;

    setDeletingId(fileId);
    try {
      await onDelete(fileId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Caricamento allegati...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">Nessun allegato presente</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="Lista allegati">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
          role="listitem"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* File Icon */}
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.nome_file_originale}
              </p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.dimensione)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDate(file.data_caricamento)}
                </span>
                {file.categoria && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {file.categoria === 'ddt_cliente' && 'DDT Cliente'}
                      {file.categoria === 'ddt_consegna' && 'DDT Consegna'}
                      {file.categoria !== 'ddt_cliente' && file.categoria !== 'ddt_consegna' && file.categoria}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Download Button */}
            <button
              onClick={() => onDownload(file.id, file.chiave_r2)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label={`Scarica ${file.nome_file_originale}`}
            >
              <svg
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Scarica
            </button>

            {/* Delete Button */}
            {!readOnly && onDelete && (
              <>
                {showDeleteConfirm === file.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingId === file.id}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                      aria-label="Conferma eliminazione"
                    >
                      {deletingId === file.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1.5" />
                          Eliminazione...
                        </>
                      ) : (
                        "Conferma"
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      disabled={deletingId === file.id}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                      aria-label="Annulla eliminazione"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(file.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    aria-label={`Elimina ${file.nome_file_originale}`}
                  >
                    <svg
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Elimina
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
