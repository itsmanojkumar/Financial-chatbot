"use client";

import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export default function BatchUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ["pdf", "docx", "txt"].includes(ext || "");
    });

    if (validFiles.length === 0) {
      alert("Only PDF, DOCX, and TXT files are supported.");
      return;
    }

    const uploadFiles: UploadFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);
    setIsOpen(true);

    // Start uploading
    uploadFiles.forEach((uploadFile) => {
      uploadToBackend(uploadFile, newFiles.find((f) => f.name === uploadFile.name)!);
    });
  };

  const uploadToBackend = async (uploadFile: UploadFile, file: File) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" } : f))
    );

    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress } : f
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f
            )
          );
        } else {
          const errorData = JSON.parse(xhr.responseText);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "error", error: errorData.detail || "Upload failed" }
                : f
            )
          );
        }
      });

      xhr.addEventListener("error", () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: "Network error" }
              : f
          )
        );
      });

      const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY || "";
      xhr.open("POST", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/upload`);
      xhr.setRequestHeader("X-Backend-API-Key", apiKey);
      xhr.send(formData);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: String(error) }
            : f
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-40 flex items-center gap-2"
        title="Batch upload documents"
      >
        <Upload size={20} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Batch Upload Documents</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drop Zone */}
            {files.length === 0 ? (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed transition ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Upload size={48} className="text-gray-400 mb-4" />
                <p className="text-lg font-semibold mb-2">Drag files here</p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports PDF, DOCX, and TXT (max 25 MB each)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Or select files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <>
                {/* File List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded p-3 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition ${
                                file.status === "success"
                                  ? "bg-green-500"
                                  : file.status === "error"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {file.progress}%
                          </span>
                        </div>
                        {file.error && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {file.status === "success" && (
                          <CheckCircle size={20} className="text-green-500" />
                        )}
                        {file.status === "error" && (
                          <AlertCircle size={20} className="text-red-500" />
                        )}
                        {file.status === "uploading" && (
                          <Loader size={20} className="text-blue-500 animate-spin" />
                        )}
                        {file.status === "pending" && (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-2 text-gray-500 hover:text-red-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="border-t px-4 py-3 bg-gray-50 text-sm">
                  <p className="text-gray-700">
                    {successCount > 0 && (
                      <span className="text-green-600">✓ {successCount} uploaded</span>
                    )}
                    {successCount > 0 && errorCount > 0 && " • "}
                    {errorCount > 0 && (
                      <span className="text-red-600">✗ {errorCount} failed</span>
                    )}
                    {successCount === 0 && errorCount === 0 && (
                      <span className="text-gray-600">
                        {files.length} file{files.length !== 1 ? "s" : ""} queued
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 border-t">
                  {(successCount > 0 || errorCount > 0) && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add more files
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => successCount > 0 && setIsOpen(false)}
                    className="ml-auto px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                    disabled={successCount === 0}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
