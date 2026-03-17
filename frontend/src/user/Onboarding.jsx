import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import CompanyDetails from "./CompanyDetails";

const documentTypes = {
  individual: [
    { key: "pan", label: "PAN Card" },
    { key: "aadhaar", label: "Aadhaar Card" }
  ],
  proprietor: [
    { key: "pan", label: "PAN Card" },
    { key: "aadhaar", label: "Aadhaar Card" },
    { key: "gst", label: "GST Certificate" }
  ],
  pvt: [
    { key: "pan", label: "Company PAN" },
    { key: "gst", label: "GST Certificate" },
    { key: "cin", label: "CIN Certificate" },
    { key: "incorporation", label: "Incorporation Certificate" }
  ],
  llp: [
    { key: "pan", label: "PAN Card" },
    { key: "gst", label: "GST Certificate" },
    { key: "llp_agreement", label: "LLP Agreement" }
  ]
};

const Onboarding = () => {
  const [type, setType] = useState("individual");
  const [files, setFiles] = useState({});
  const [docs, setDocs] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await userAPI.getDocuments();
      if (res.data.success && res.data.data) {
        setDocs(res.data.data.documents || {});
        setType(res.data.data.type || "individual");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("type", type);
    Object.keys(files).forEach((key) => formData.append(key, files[key]));
    setLoading(true);
    try {
      const res = await userAPI.uploadDocuments(formData);
      if (res.data.success) {
        setMessage("Documents uploaded successfully");
        fetchDocuments();
      }
    } catch (error) {
      setMessage("Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Upload Documents */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>

        {docs?.status && (
          <p className={`mb-4 font-semibold ${
            docs.status === "approved" ? "text-green-600" :
            docs.status === "pending" ? "text-yellow-600" :
            "text-red-600"
          }`}>
            KYC Status: {docs.status.toUpperCase()}
          </p>
        )}

        {message && <p className="text-green-600 mb-3">{message}</p>}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={docs?.status === "approved"}>
            <select value={type} onChange={(e) => { setType(e.target.value); setFiles({}); }} className="border p-2 rounded mb-4">
              <option value="individual">Individual</option>
              <option value="proprietor">Proprietor</option>
              <option value="pvt">Private Limited</option>
              <option value="llp">LLP</option>
            </select>

            <div className="grid md:grid-cols-2 gap-4">
              {documentTypes[type].map((doc) => (
                <div key={doc.key}>
                  <label className="block text-sm mb-1">{doc.label}</label>
                  <input type="file" name={doc.key} onChange={handleFileChange} className="border p-2 rounded w-full" />
                  {docs?.[doc.key] && (
                    <div className="mt-2">
                      {docs[doc.key].endsWith(".pdf") ? (
                        <a href={`http://localhost:5000/uploads/${docs[doc.key]}`} target="_blank" className="text-blue-500 underline">
                          View PDF
                        </a>
                      ) : (
                        <img src={`http://localhost:5000/uploads/${docs[doc.key]}`} alt={doc.label} className="w-32 rounded border" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? "Uploading..." : "Submit"}
            </button>
          </fieldset>
        </form>
      </div>

      {/* Step 2: Company Details (only if company type) */}
      {["pvt", "llp", "proprietor"].includes(type) && (
        <CompanyDetails />
      )}
    </div>
  );
};

export default Onboarding;