import { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const Commercial = () => {
  const [data, setData] = useState({
    _id: "", // track existing commercial
    payin: "",
    payout: "",
    mdr: "",
    transactionFee: "",
    commission: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    settlementType: "",
    minSettlement: ""
  });

  const [warnings, setWarnings] = useState({
    payin: "",
    payout: "",
    mdr: "",
    transactionFee: "",
    commission: "",
    minSettlement: ""
  });

  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCommercial();
  }, []);

  const fetchCommercial = async () => {
    try {
      const res = await userAPI.getCommercial();
      if (res.data.success && res.data.data) {
        // Ensure all fields are strings for controlled inputs
        const fetchedData = { _id: res.data.data._id };
        Object.keys(data).forEach((key) => {
          if (key !== "_id") fetchedData[key] = res.data.data[key]?.toString() || "";
        });
        setData(fetchedData);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Fetch commercial error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));

    // Validate numeric fields
    const numericFields = ["payin", "payout", "mdr", "transactionFee", "commission", "minSettlement"];
    if (numericFields.includes(name)) {
      if (value.trim() === "" || isNaN(Number(value))) {
        setWarnings((prev) => ({ ...prev, [name]: "Please enter a valid number" }));
      } else {
        setWarnings((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Prevent submission if any warnings exist
    if (Object.values(warnings).some((w) => w !== "")) {
      setMessage("Please fix the errors before submitting.");
      setLoading(false);
      return;
    }

    // Convert numeric fields to numbers
    const payload = { ...data };
    ["payin", "payout", "mdr", "transactionFee", "commission", "minSettlement"].forEach(
      (key) => {
        payload[key] = Number(payload[key]) || 0;
      }
    );

    try {
      let res;
      if (data._id) {
        // Update existing commercial
        res = await userAPI.updateCommercial(payload);
      } else {
        // Create new commercial
        res = await userAPI.createCommercial(payload);
      }

      if (res.data.success) {
        setMessage("Commercial details saved successfully");
        setEditMode(false);

        // Convert numeric fields back to strings for controlled inputs
        const updatedData = { _id: res.data.data?._id || data._id };
        Object.keys(payload).forEach((key) => {
          if (key !== "_id") updatedData[key] = payload[key].toString();
        });
        setData(updatedData);
      }
    } catch (err) {
      console.error("Update commercial error:", err);
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  const inputClass = (field) =>
    `border p-2 rounded ${warnings[field] ? "border-red-500" : ""}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Commercial & Settlement</h3>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit}>
        {/* Pricing */}
        <h4 className="font-semibold mb-3">Pricing</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {["payin", "payout", "mdr", "transactionFee", "commission"].map((field) => (
            <div key={field}>
              <input
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={data[field] ?? ""}
                onChange={handleChange}
                className={inputClass(field)}
                disabled={!editMode}
              />
              {warnings[field] && (
                <p className="text-red-600 text-sm mt-1">{warnings[field]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Bank Details */}
        <h4 className="font-semibold mt-8 mb-3">Payment Details</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {["bankName", "accountHolder", "accountNumber", "ifsc", "branch"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.replace(/([A-Z])/g, " $1")}
              value={data[field] ?? ""}
              onChange={handleChange}
              className="border p-2 rounded"
              disabled={!editMode}
            />
          ))}
        </div>

        {/* Settlement Settings */}
        <h4 className="font-semibold mt-8 mb-3">Settlement Settings</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="settlementType"
            value={data.settlementType ?? ""}
            onChange={handleChange}
            className="border p-2 rounded"
            disabled={!editMode}
          >
            <option value="">Select Settlement Type</option>
            <option value="T+1">T+1</option>
            <option value="T+2">T+2</option>
            <option value="Weekly">Weekly</option>
          </select>

          <div>
            <input
              name="minSettlement"
              placeholder="Minimum Settlement Amount"
              value={data.minSettlement ?? ""}
              onChange={handleChange}
              className={inputClass("minSettlement")}
              disabled={!editMode}
            />
            {warnings.minSettlement && (
              <p className="text-red-600 text-sm mt-1">{warnings.minSettlement}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          {!editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-yellow-500 text-white rounded"
            >
              Edit
            </button>
          )}
          {editMode && (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Saving..." : "Update"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Commercial;