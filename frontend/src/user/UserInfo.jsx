import { useState } from "react";
import { userAPI } from "../services/api";

const UserInfo = () => {

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await userAPI.createProfile(form);

      if (res.data.success) {
        setMessage("Profile saved successfully");
      }

    } catch (err) {
      setMessage("Error saving profile");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h3 className="text-lg font-semibold mb-4">User Information</h3>

      {message && (
        <p className="mb-4 text-green-600">{message}</p>
      )}

      <form onSubmit={handleSubmit}>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? "Saving..." : "Submit"}
        </button>

      </form>

    </div>
  );
};

export default UserInfo;