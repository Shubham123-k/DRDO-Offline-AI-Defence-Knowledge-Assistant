import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";

import {
  uploadDocument,
  getDocuments,                                                                                                         
  downloadDocument,
  deleteDocument,
} from "../../api/documentApi";

export default function Documents() {
  const { theme } = useTheme();

  const [documents, setDocuments] = useState([]);

  const [classification, setClassification] =
    useState("Public");

  const fileInputRef = useRef();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {                                       
      const response = await getDocuments();
      setDocuments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "classification",
      classification
    );

    try {
      await uploadDocument(formData);

      alert("Document uploaded.");

      loadDocuments();

      fileInputRef.current.value = "";
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Upload failed."
      );
    }
  };

  const removeDocument = async (id) => {
    if (!window.confirm("Delete document?")) return;

    await deleteDocument(id);

    loadDocuments();
  };

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Documents
        </h1>

        <div className="flex gap-3">

          <select
            value={classification}
            onChange={(e) =>
              setClassification(e.target.value)
            }
            className={`rounded-lg border px-4 py-2 ${
              theme === "light"
                ? "border-gray-300 bg-white"
                : "border-white/10 bg-[#171717]"
            }`}
          >
            <option>Public</option>
            <option>Confidential</option>
            <option>Secret</option>
          </select>

          <button
            onClick={() =>
              fileInputRef.current.click()
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            <Upload size={18} />

            Upload
          </button>

          <input
            hidden
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
          />
        </div>

      </div>

      <div
        className={`overflow-hidden rounded-2xl border ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >

        <table className="w-full">

          <thead
            className={
              theme === "light"
                ? "bg-gray-100"
                : "bg-[#1E1E1E]"
            }
          >
            <tr>

              <th className="p-4 text-left">
                File
              </th>

              <th className="text-left">
                Classification
              </th>

              <th className="text-left">
                Uploaded By
              </th>

              <th className="text-left">
                Date
              </th>

              <th className="text-center">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {documents.map((doc) => (

              <tr
                key={doc.id}
                className="border-t border-gray-200 dark:border-white/10"
              >

                <td className="flex items-center gap-3 p-4">

                  <FileText size={18} />

                  {doc.original_filename}

                </td>

                <td>{doc.classification}</td>

                <td>{doc.uploaded_by}</td>

                <td>
                  {new Date(
                    doc.upload_time
                  ).toLocaleDateString()}
                </td>

                <td>

                  <div className="flex justify-center gap-3">

                    <a
                      href={downloadDocument(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-green-600 p-2 text-white"
                    >
                      <Download size={18} />
                    </a>

                    <button
                      onClick={() =>
                        removeDocument(doc.id)
                      }
                      className="rounded-lg bg-red-600 p-2 text-white"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

            {documents.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="p-10 text-center text-gray-500"
                >
                  No documents uploaded.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}                                                                 