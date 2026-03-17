import { useState } from "react";
import { adminAPI } from "../services/api";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await adminAPI.createUser({ name, email, mobile });
      if (res.data.success) {
        setMessage({ type: "success", text: "User created successfully!" });
        setName("");
        setEmail("");
        setMobile("");
      } else {
        setMessage({ type: "error", text: "Failed to create user" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create user" });
    }

    setLoading(false);

    // Optional: hide message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Create User</h2>

      {message.text && (
        <div
          className={`mb-4 p-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Mobile"
          className="border p-2 rounded"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded col-span-2"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;