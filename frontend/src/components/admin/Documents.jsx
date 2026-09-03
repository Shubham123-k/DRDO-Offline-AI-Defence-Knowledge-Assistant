import { useEffect, useRef, useState } from "react";

import { Upload, Download, Trash2, FileText, Shield, FileArchive, LockKeyhole, FolderOpen, RefreshCw, AlertTriangle } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import { getAdminDocuments, downloadAdminDocument, deleteAdminDocument } from "../../api/adminApi";
import { uploadDocument } from "../../api/documentApi";

export default function Documents() {
  const { theme } = useTheme();

  const [documents, setDocuments] = useState([]);
  const [classification, setClassification] =
    useState("Public");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const response = await getAdminDocuments();

      setDocuments(response.data);
    } catch (error) {
      console.error(
        "Failed to load admin documents:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "classification",
      classification
    );

    try {
      setUploading(true);

      await uploadDocument(formData);

      alert("Document uploaded successfully.");

      await loadDocuments();
    } catch (error) {
      console.error(
        "Document upload failed:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          "Document upload failed."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async (document) => {
    try {
      setDownloadingId(document.id);

      const response =
        await downloadAdminDocument(document.id);

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/octet-stream",
      });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;
      link.download =
        document.original_filename;

      window.document.body.appendChild(link);

      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Document download failed:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          "Document download failed."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteAdminDocument(id);

      await loadDocuments();
    } catch (error) {
      console.error(
        "Document deletion failed:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          "Document deletion failed."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getClassificationConfig = (value) => {
    if (value === "Secret") {
      return {
        icon: LockKeyhole,
        badge:
          theme === "light"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-red-500/10 text-red-400 border-red-500/20",
        iconBg:
          theme === "light"
            ? "bg-red-100 text-red-600"
            : "bg-red-500/10 text-red-400",
      };
    }

    if (value === "Confidential") {
      return {
        icon: Shield,
        badge:
          theme === "light"
            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        iconBg:
          theme === "light"
            ? "bg-yellow-100 text-yellow-600"
            : "bg-yellow-500/10 text-yellow-400",
      };
    }

    return {
      icon: FolderOpen,
      badge:
        theme === "light"
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-green-500/10 text-green-400 border-green-500/20",
      iconBg:
        theme === "light"
          ? "bg-green-100 text-green-600"
          : "bg-green-500/10 text-green-400",
    };
  };

  const getFileIcon = (filename) => {
    const extension =
      filename?.split(".").pop()?.toLowerCase();

    if (
      extension === "pdf" ||
      extension === "docx" ||
      extension === "txt"
    ) {
      return FileText;
    }

    if (
      extension === "xls" ||
      extension === "xlsx"
    ) {
      return FileArchive;
    }

    return FileText;
  };

  const totalDocuments = documents.length;

  const publicDocuments = documents.filter(
    (doc) => doc.classification === "Public"
  ).length;

  const confidentialDocuments = documents.filter(
    (doc) =>
      doc.classification === "Confidential"
  ).length;

  const secretDocuments = documents.filter(
    (doc) => doc.classification === "Secret"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div
            className={`mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent ${
              theme === "light"
                ? "border-gray-300"
                : "border-white/20"
            }`}
          />

          <p
            className={
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }
          >
            Loading documents...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-7 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >
        <div
          className={`absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-blue-100"
              : "bg-blue-500/10"
          }`}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <FileText size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Documents
              </h1>

              <p
                className={`mt-1 text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Manage classified defence documents
                and their access levels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadDocuments}
            disabled={loading}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
              theme === "light"
                ? "border-gray-300 bg-white hover:bg-gray-50"
                : "border-white/10 bg-[#1D1D1D] hover:bg-[#242424]"
            }`}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div
          className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Total Documents
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalDocuments}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <FileText size={21} />
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Public
              </p>

              <p className="mt-2 text-3xl font-bold">
                {publicDocuments}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-green-100 text-green-600"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              <FolderOpen size={21} />
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Confidential
              </p>

              <p className="mt-2 text-3xl font-bold">
                {confidentialDocuments}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              <Shield size={21} />
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Secret
              </p>

              <p className="mt-2 text-3xl font-bold">
                {secretDocuments}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-red-100 text-red-600"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <LockKeyhole size={21} />
            </div>
          </div>
        </div>

      </div>

      {/* Upload Panel */}
      <div
        className={`rounded-2xl border p-6 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              theme === "light"
                ? "bg-blue-100 text-blue-600"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            <Upload size={20} />
          </div>

          <div>
            <h2 className="font-semibold">
              Upload Document
            </h2>

            <p
              className={`text-xs ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Select the appropriate classification
              before uploading.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <select
            value={classification}
            onChange={(event) =>
              setClassification(event.target.value)
            }
            disabled={uploading}
            className={`rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
              theme === "light"
                ? "border-gray-300 bg-white text-black"
                : "border-white/10 bg-[#1D1D1D] text-white"
            }`}
          >
            <option value="Public">
              Public
            </option>

            <option value="Confidential">
              Confidential
            </option>

            <option value="Secret">
              Secret
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={18} />

            {uploading
              ? "Uploading & Indexing..."
              : "Choose Document"}
          </button>

          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept=".pdf,.docx,.txt,.xls,.xlsx"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Documents Table */}
      <div
        className={`overflow-hidden rounded-2xl border ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >

        {/* Table Header */}
        <div
          className={`flex flex-col gap-2 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
            theme === "light"
              ? "border-gray-200"
              : "border-white/10"
          }`}
        >
          <div>
            <h2 className="text-lg font-semibold">
              Document Repository
            </h2>

            <p
              className={`mt-1 text-xs ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              {totalDocuments} document
              {totalDocuments !== 1 ? "s" : ""} stored
              in the system
            </p>
          </div>

          <div
            className={`flex items-center gap-2 text-xs ${
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            <Shield size={15} />
            Classified Repository
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">

            <thead
              className={
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1E1E1E]"
              }
            >
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Document
                </th>

                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Classification
                </th>

                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Uploaded By
                </th>

                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Date
                </th>

                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => {
                const classificationConfig =
                  getClassificationConfig(
                    document.classification
                  );

                const ClassificationIcon =
                  classificationConfig.icon;

                const FileIcon = getFileIcon(
                  document.original_filename
                );

                return (
                  <tr
                    key={document.id}
                    className={`border-t transition ${
                      theme === "light"
                        ? "border-gray-200 hover:bg-gray-50"
                        : "border-white/10 hover:bg-white/[0.025]"
                    }`}
                  >
                    {/* Document */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            theme === "light"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-white/5 text-gray-300"
                          }`}
                        >
                          <FileIcon size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-xs truncate font-medium">
                            {
                              document.original_filename
                            }
                          </p>

                          <p
                            className={`mt-1 text-xs uppercase ${
                              theme === "light"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {document.file_type
                              ? document.file_type.replace(
                                  ".",
                                  ""
                                )
                              : "FILE"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Classification */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${classificationConfig.badge}`}
                      >
                        <ClassificationIcon
                          size={14}
                        />

                        {document.classification}
                      </span>
                    </td>

                    {/* Uploaded By */}
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">
                          {document.uploaded_by ||
                            "Unknown"}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            theme === "light"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          Authorized user
                        </p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4">
                      <p className="text-sm">
                        {document.upload_time
                          ? new Date(
                              document.upload_time
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          theme === "light"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {document.upload_time
                          ? new Date(
                              document.upload_time
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(document)
                          }
                          disabled={
                            downloadingId ===
                            document.id
                          }
                          className={`group flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            theme === "light"
                              ? "bg-green-50 text-green-600 hover:bg-green-100"
                              : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                          title="Download document"
                        >
                          <Download
                            size={17}
                            className="transition-transform group-hover:-translate-y-0.5"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(document.id)
                          }
                          disabled={
                            deletingId ===
                            document.id
                          }
                          className={`group flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            theme === "light"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          }`}
                          title="Delete document"
                        >
                          <Trash2
                            size={17}
                            className="transition-transform group-hover:scale-110"
                          />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}

              {documents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-14"
                  >
                    <div className="flex flex-col items-center justify-center text-center">

                      <div
                        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                          theme === "light"
                            ? "bg-gray-100 text-gray-400"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        <FileText size={28} />
                      </div>

                      <h3 className="font-semibold">
                        No documents found
                      </h3>

                      <p
                        className={`mt-2 max-w-sm text-sm ${
                          theme === "light"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        Upload a classified document
                        using the upload panel above.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          theme === "light"
            ? "border-yellow-200 bg-yellow-50 text-yellow-800"
            : "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
        }`}
      >
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0"
        />

        <div>
          <p className="text-sm font-medium">
            Classified Document Handling
          </p>

          <p className="mt-1 text-xs opacity-80">
            Ensure that every document is assigned
            the correct security classification.
            Access to classified information is
            controlled by the user's clearance level.
          </p>
        </div>
      </div>

    </div>
  );
}