// BankAccounts.jsx
import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { Trash2, Edit, CheckCircle, Plus } from "lucide-react";

const BankAccounts = () => {
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
  });

  const [editingBankId, setEditingBankId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Verification states
  const [loadingIFSC, setLoadingIFSC] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // IFSC Auto Fetch
  const fetchIFSCDetails = async (ifsc) => {
    if (ifsc.length !== 11) return;
    try {
      setLoadingIFSC(true);
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (!res.ok) throw new Error("Invalid IFSC");
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        bankName: data.BANK || "",
        branch: data.BRANCH || "",
      }));
    } catch (err) {
      console.error(err);
      alert("Invalid IFSC");
      setForm((prev) => ({ ...prev, bankName: "", branch: "" }));
    } finally {
      setLoadingIFSC(false);
    }
  };

  // Verify Bank
  const verifyBankAccount = async () => {
    try {
      setVerifying(true);
      const res = await userAPI.verifyBank({
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
      });

      if (res.success) {
        setVerifiedName(res.accountHolderName || res.verifiedName || "Unknown");
        setIsVerified(true);
        setForm((prev) => ({ ...prev, accountHolderName: res.accountHolderName }));
        alert("Bank verified successfully ✅");
      } else {
        setIsVerified(false);
        alert("Verification failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying bank");
    } finally {
      setVerifying(false);
    }
  };

  // Fetch banks
  const fetchBanks = async () => {
    try {
      const res = await userAPI.getBankAccounts();
      setBanks(res?.banks || res?.accounts || []);
    } catch (err) {
      console.error(err);
      setBanks([]);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const openModal = (bank = null) => {
    if (bank) {
      setEditingBankId(bank._id);
      setForm({
        accountHolderName: bank.accountHolderName || bank.accountHolder,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        ifsc: bank.ifsc,
        branch: bank.branch || "",
      });
      setIsVerified(bank.isVerified || false);
      setVerifiedName(bank.accountHolderName || "");
    } else {
      setEditingBankId(null);
      setForm({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifsc: "",
        branch: "",
      });
      setIsVerified(false);
      setVerifiedName("");
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return alert("Please verify bank account first ⚠️");
    try {
      if (editingBankId) {
        await userAPI.updateBankAccount(editingBankId, { ...form, isVerified });
        alert("Bank updated successfully");
      } else {
        await userAPI.addBankAccount({ ...form, isVerified });
        alert("Bank added successfully");
      }
      fetchBanks();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save bank details");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this bank account?")) {
      try {
        await userAPI.deleteBankAccount(id);
        fetchBanks();
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await userAPI.setDefaultBank(id);
      fetchBanks();
    } catch (err) {
      console.error(err);
      alert("Failed to set default");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-semibold">Bank Accounts</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Add Bank
        </button>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Holder</th>
            <th className="border p-2">Bank</th>
            <th className="border p-2">Account</th>
            <th className="border p-2">IFSC</th>
            <th className="border p-2">Branch</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {banks.map((bank) => (
            <tr key={bank._id}>
              <td className="border p-2">{bank.accountHolderName || bank.accountHolder}</td>
              <td className="border p-2">{bank.bankName}</td>
              <td className="border p-2">{bank.accountNumber}</td>
              <td className="border p-2">{bank.ifsc}</td>
              <td className="border p-2">{bank.branch}</td>
              <td className="border p-2">
                {bank.isVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-red-500">Not Verified</span>
                )}
              </td>
              <td className="border p-2 flex gap-2">
                <Edit onClick={() => openModal(bank)} />
                <Trash2 onClick={() => handleDelete(bank._id)} />
                {!bank.isDefault && <CheckCircle onClick={() => handleSetDefault(bank._id)} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>

            <h3 className="text-xl mb-4">{editingBankId ? "Edit Bank" : "Add Bank"}</h3>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <input
                placeholder="Account Holder Name"
                value={form.accountHolderName}
                onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                placeholder="IFSC"
                value={form.ifsc}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setForm({ ...form, ifsc: value });
                  if (value.length === 11) fetchIFSCDetails(value);
                }}
                className="border p-2 rounded"
                required
              />
              {loadingIFSC && <p className="text-blue-500 text-sm">Fetching bank...</p>}
              <input placeholder="Bank Name" value={form.bankName} readOnly className="border p-2 bg-gray-100" />
              <input placeholder="Branch" value={form.branch} readOnly className="border p-2 bg-gray-100" />
              <input
                placeholder="Account Number"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="border p-2 rounded"
                required
              />

              {/* Verify Button */}
              <button type="button" onClick={verifyBankAccount} disabled={verifying} className="bg-green-600 text-white p-2 rounded">
                {verifying ? "Verifying..." : "Verify Bank"}
              </button>

              {isVerified && <p className="text-green-600 text-sm">✅ Verified: {verifiedName}</p>}

              <button className="bg-blue-600 text-white p-2 rounded">Save Bank</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;