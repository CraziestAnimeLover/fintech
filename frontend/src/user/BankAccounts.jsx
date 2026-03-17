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
        accountHolderName: bank.accountHolder,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        ifsc: bank.ifsc,
        branch: bank.branch || "",
      });
    } else {
      setEditingBankId(null);
      setForm({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifsc: "",
        branch: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBankId) {
        await userAPI.updateBankAccount(editingBankId, form);
        alert("Bank updated successfully");
      } else {
        await userAPI.addBankAccount(form);
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
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await userAPI.deleteBankAccount(id);
        fetchBanks();
      } catch (err) {
        console.error(err);
        alert("Failed to delete bank");
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await userAPI.setDefaultBank(id);
      fetchBanks();
    } catch (err) {
      console.error(err);
      alert("Failed to set default bank");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bank Accounts</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Add Bank
        </button>
      </div>

      {/* Bank Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Account Holder</th>
              <th className="border px-4 py-2">Bank Name</th>
              <th className="border px-4 py-2">Account Number</th>
              <th className="border px-4 py-2">IFSC</th>
              <th className="border px-4 py-2">Branch</th>
              <th className="border px-4 py-2">Default</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  No bank accounts added yet
                </td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr
                  key={bank._id}
                  className={bank.isDefault ? "bg-blue-50" : ""}
                >
                  <td className="border px-4 py-2">{bank.accountHolder}</td>
                  <td className="border px-4 py-2">{bank.bankName}</td>
                 <td className="border px-4 py-2">{bank.accountNumber}</td>
                  <td className="border px-4 py-2">{bank.ifsc}</td>
                  <td className="border px-4 py-2">{bank.branch || "-"}</td>
                  <td className="border px-4 py-2">
                    {bank.isDefault && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} /> Default
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2 flex gap-2">
                    {!bank.isDefault && (
                      <button
                        onClick={() => handleSetDefault(bank._id)}
                        className="text-green-600 hover:text-green-800"
                        title="Set as default"
                      >
                        <CheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => openModal(bank)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(bank._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-4">
              {editingBankId ? "Edit Bank" : "Add Bank"}
            </h3>
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <input
                placeholder="Account Holder Name"
                value={form.accountHolderName}
                onChange={(e) =>
                  setForm({ ...form, accountHolderName: e.target.value })
                }
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                placeholder="Bank Name"
                value={form.bankName}
                onChange={(e) =>
                  setForm({ ...form, bankName: e.target.value })
                }
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                placeholder="Account Number"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value })
                }
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                placeholder="IFSC"
                value={form.ifsc}
                onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                placeholder="Branch (optional)"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editingBankId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;