import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { authAPI } from "../services/api";

const UserProfile = () => {
  const { user: contextUser, theme } = useOutletContext();
  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profilePic: user?.profilePic || "",
  });

  // Load user from localStorage if exists
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFormData({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        profilePic: parsed.profilePic || "",
      });
    }
    setLoading(false);
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle profile picture file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setFormData({ ...formData, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // Save changes to API
  const handleSave = async () => {
  try {
    const res = await userAPI.updateProfile(formData); // use the correct function
    setUser(res.data.user); // update state
    localStorage.setItem("user", JSON.stringify(res.data.user)); // update localStorage
    setIsEditing(false);
  } catch (err) {
    console.error("Failed to update profile", err);
    alert("Failed to update profile");
  }
};

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-64 text-lg ${
          theme === "dark" ? "text-gray-300" : "text-gray-500"
        }`}
      >
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`text-center py-8 ${
          theme === "dark" ? "text-gray-300" : "text-gray-500"
        }`}
      >
        User not found.
      </div>
    );
  }

  return (
    <div
      className={`max-w-4xl mx-auto rounded-xl shadow-lg p-6 space-y-6 transition-colors ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
          {isEditing ? (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full h-full cursor-pointer"
            />
          ) : formData.profilePic ? (
            <img
              src={formData.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-1 rounded mb-2"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-1 rounded mb-2"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-1 rounded mb-2"
              />
            </>
          ) : (
            <>
              <h2
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {user.name}
              </h2>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {user.email}
              </p>
              <p
                className={`text-sm uppercase font-semibold ${
                  theme === "dark" ? "text-blue-400" : "text-blue-500"
                }`}
              >
                {user.role}
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } mt-1`}
              >
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p
                className={`mt-1 font-semibold ${
                  user.isVerified ? "text-green-500" : "text-yellow-500"
                }`}
              >
                Status: {user.isVerified ? "Verified ✅" : "Pending ⚠️"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Edit / Save buttons */}
      <div className="flex gap-4 mt-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Personal & Company Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          className={`p-4 rounded-lg shadow-sm transition-colors ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <h3
            className={`font-semibold mb-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Personal Info
          </h3>
          <p>
            <strong>Full Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone || "N/A"}
          </p>
        </div>

        <div
          className={`p-4 rounded-lg shadow-sm transition-colors ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <h3
            className={`font-semibold mb-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Company Info
          </h3>
          <p>
            <strong>Company Name:</strong> {user.company?.name || "N/A"}
          </p>
          <p>
            <strong>GST / Tax ID:</strong> {user.company?.registration?.gst || "N/A"}
          </p>
        </div>
      </div>

      {/* Documents */}
      <div
        className={`p-4 rounded-lg shadow-sm transition-colors ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-50"
        }`}
      >
        <h3
          className={`font-semibold mb-2 ${
            theme === "dark" ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Documents
        </h3>
        {user.document?.documents && Object.keys(user.document.documents).length > 0 ? (
          <ul className="list-disc list-inside">
            {Object.entries(user.document.documents).map(
              ([key, url]) =>
                url && (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline ${
                        theme === "dark" ? "text-blue-400" : "text-blue-500"
                      }`}
                    >
                      {key.toUpperCase()}
                    </a>
                  </li>
                )
            )}
          </ul>
        ) : (
          <p
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            No documents uploaded.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;