"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export interface FileUploaderProps {
  /** Accepted file types (default: 'application/pdf') */
  accept?: Record<string, string[]>;
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Allow multiple files (default: false) */
  multiple?: boolean;
  /** Callback when upload completes */
  onUploadComplete?: (fileInfo: UploadedFileInfo) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Additional context for upload (e.g., attivita_id) */
  uploadContext?: {
    tipo_riferimento: string;
    id_riferimento: number;
  };
}

export interface UploadedFileInfo {
  id: number;
  nome_file_originale: string;
  chiave_r2: string;
  dimensione: number;
  data_caricamento: string;
}

export function FileUploader({
  accept = { "application/pdf": [".pdf"] },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  onUploadComplete,
  onError,
  uploadContext,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFiles(acceptedFiles);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple,
    });

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        if (uploadContext) {
          formData.append("tipo_riferimento", uploadContext.tipo_riferimento);
          formData.append("id_riferimento", uploadContext.id_riferimento.toString());
        }

        const token = localStorage.getItem("token");
        const response = await fetch("/api/allegati/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || "Upload failed");
        }

        const data = (await response.json()) as { data: UploadedFileInfo };

        if (onUploadComplete) {
          onUploadComplete(data.data);
        }

        setProgress(
          ((selectedFiles.indexOf(file) + 1) / selectedFiles.length) * 100
        );
      }

      setSelectedFiles([]);
      setProgress(0);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        aria-label="File upload area"
      >
        <input {...getInputProps()} aria-label="File input" />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isDragActive ? (
          <p className="mt-2 text-sm text-blue-600">
            Rilascia i file qui...
          </p>
        ) : (
          <div>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Clicca per selezionare
              </span>
              {" "}o trascina {multiple ? "i file" : "il file"} qui
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Solo PDF fino a {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800 font-medium">
            File non validi:
          </p>
          <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}:{" "}
                {errors.map((e) => e.message).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && !uploading && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            File selezionati:
          </p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                onClick={() =>
                  setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                }
                className="text-red-600 hover:text-red-800 text-sm"
                aria-label={`Rimuovi ${file.name}`}
              >
                Rimuovi
              </button>
            </div>
          ))}

          <button
            onClick={uploadFiles}
            className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            aria-label="Carica file selezionati"
          >
            Carica {selectedFiles.length} {selectedFiles.length === 1 ? "file" : "file"}
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Caricamento in corso...
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </div>
  );
}
