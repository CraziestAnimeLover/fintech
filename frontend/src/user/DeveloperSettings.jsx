import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { userAPI } from "../services/api";

const DeveloperSettings = () => {
  const [dev, setDev] = useState({
    ip: "",
    token: "",
    secret: "",
    callback: ""
  });

  const [errors, setErrors] = useState({
    ip: "",
    callback: ""
  });

  const [loading, setLoading] = useState(false);

  // Regex for IPv4 validation
  const ipRegex =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

  // Simple URL validation
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/;

  // Validate only if fields are filled
  const validate = () => {
    let valid = true;
    const newErrors = { ip: "", callback: "" };

    if (dev.ip && !ipRegex.test(dev.ip)) {
      newErrors.ip = "Please enter a valid IP address (IPv4)";
      valid = false;
    }

    if (dev.callback && !urlRegex.test(dev.callback)) {
      newErrors.callback = "Please enter a valid URL (https://example.com)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Fetch existing keys
  const fetchKeys = async () => {
    try {
      const res = await userAPI.getDevKeys();
      if (res.data?.devKeys) {
        setDev({
          ip: res.data.devKeys.ip || "",
          callback: res.data.devKeys.callback || "",
          token: res.data.devKeys.token || "",
          secret: res.data.devKeys.secret || ""
        });
      }
    } catch (err) {
      console.error("Fetch dev keys error", err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Generate / Regenerate keys
  const generateKeys = async () => {
    // Validate only if filled
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await userAPI.generateDevKeys({
        ip: dev.ip,
        callback: dev.callback
      });

      if (res.data?.dev) {
        // Safely update only relevant fields
        setDev((prev) => ({
          ...prev,
          token: res.data.dev.token,
          secret: res.data.dev.secret,
          ip: res.data.dev.ip,
          callback: res.data.dev.callback
        }));
      }
    } catch (err) {
      console.error("Generate keys error", err);
      alert("Failed to generate keys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update IP / Callback
  const updateSettings = async () => {
    if (!validate()) return;

    try {
      await userAPI.updateDevKeys({ ip: dev.ip, callback: dev.callback });
      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update settings. Please try again.");
    }
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Developer Settings</h3>

      <div className="grid md:grid-cols-2 gap-4">

        {/* IP */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">IP Address</label>
          <input
            name="ip"
            value={dev.ip}
            onChange={(e) => setDev({ ...dev, ip: e.target.value })}
            className={`border rounded-lg p-2 focus:ring focus:ring-blue-200 ${
              errors.ip ? "border-red-500" : ""
            }`}
            placeholder="Enter IPv4 address"
          />
          {errors.ip && <p className="text-red-500 text-xs mt-1">{errors.ip}</p>}
        </div>

        {/* Callback URL */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Webhook / Callback URL</label>
          <input
            name="callback"
            value={dev.callback}
            onChange={(e) => setDev({ ...dev, callback: e.target.value })}
            className={`border rounded-lg p-2 focus:ring focus:ring-blue-200 ${
              errors.callback ? "border-red-500" : ""
            }`}
            placeholder="https://example.com/webhook"
          />
          {errors.callback && (
            <p className="text-red-500 text-xs mt-1">{errors.callback}</p>
          )}
        </div>

        {/* Token */}
        <div className="flex flex-col relative">
          <label className="text-sm font-medium mb-1">API Token</label>
          <input
            name="token"
            value={dev.token}
            readOnly
            className="border rounded-lg p-2 pr-10 focus:ring focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(dev.token)}
            className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
          >
            <Copy size={18} />
          </button>
        </div>

        {/* Secret */}
        <div className="flex flex-col relative">
          <label className="text-sm font-medium mb-1">Secret Key</label>
          <input
            name="secret"
            value={dev.secret}
            readOnly
            className="border rounded-lg p-2 pr-10 focus:ring focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(dev.secret)}
            className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={generateKeys}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Keys"}
        </button>

        <button
          onClick={updateSettings}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Settings
        </button>
      </div>
    </div>
  );
};

export default DeveloperSettings;