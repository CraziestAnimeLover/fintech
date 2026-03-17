import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";

const initialState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "agent",
};

const inputStyle =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none";

const CreateAgent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState("");
  const [phoneWarning, setPhoneWarning] = useState("");

  const onChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: "", text: "" });

    // Password validation
    if (name === "password") {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
      if (value.length < 6 || !passwordRegex.test(value)) {
        setPasswordWarning(
          "Password must be at least 6 chars, include 1 number and 1 special char"
        );
      } else {
        setPasswordWarning("");
      }
    }

    // Phone validation
    if (name === "phone") {
      if (!/^\d{10}$/.test(value)) {
        setPhoneWarning("Phone must be exactly 10 digits");
      } else {
        setPhoneWarning("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if warnings exist
    if (passwordWarning || phoneWarning) {
      setMessage({ type: "error", text: "Please fix the errors before submitting" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await adminAPI.createUser(formData);

      if (data.success) {
        setMessage({ type: "success", text: "Agent created successfully!" });
        setFormData(initialState);

        setTimeout(() => navigate("/admin/agents"), 1500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create agent",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
          Create Agent
        </h2>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">

          {message.text && (
            <div
              className={`px-4 py-3 rounded mb-4 text-sm ${
                message.type === "error"
                  ? "bg-red-100 border border-red-400 text-red-700"
                  : "bg-green-100 border border-green-400 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter agent name"
                required
                className={inputStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
                required
                className={inputStyle}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                placeholder="Enter phone number"
                required
                className={`${inputStyle} ${phoneWarning ? "border-red-500" : ""}`}
              />
              {phoneWarning && (
                <p className="text-red-600 text-sm mt-1">{phoneWarning}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Enter password"
                  minLength={6}
                  required
                  className={`${inputStyle} ${passwordWarning ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordWarning && (
                <p className="text-red-600 text-sm mt-1">{passwordWarning}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={onChange}
                className={inputStyle}
              >
                <option value="agent">Agent</option>
              </select>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50"
              >
                {loading ? "Creating Agent..." : "Create Agent"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;