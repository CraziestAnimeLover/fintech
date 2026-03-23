import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { authAPI } from "../services/api";

const UserProfile = () => {
  const { user: contextUser, theme } = useOutletContext();

  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: contextUser?.name || "",
    email: contextUser?.email || "",
    phone: contextUser?.phone || "",
    profilePic: contextUser?.profilePic || "",
  });

  // Load from localStorage
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

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setFormData({ ...formData, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // Save
  const handleSave = async () => {
    try {
      const res = await authAPI.updateProfile(formData);

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

 return (
  <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen space-y-6">

    {/* 🔹 PROFILE HEADER CARD */}
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-5">
      
      <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
        {formData.profilePic ? (
          <img src={formData.profilePic} className="w-full h-full object-cover" />
        ) : (
          user.name?.charAt(0).toUpperCase()
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {user.name}
        </h2>
        <p className="text-gray-500 text-sm">{user.role || "User"}</p>
        <p className="text-gray-400 text-sm">
          {user.location || "Location not set"}
        </p>
      </div>
    </div>

    {/* 🔹 PERSONAL INFO */}
    <div className="bg-white rounded-xl shadow p-6">
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">
          Personal Information
        </h3>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="border p-2 rounded"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border p-2 rounded"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-400">First Name</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-gray-400">Email Address</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-gray-400">Phone Number</p>
            <p className="font-medium">{user.phone || "N/A"}</p>
          </div>
        </div>
      )}

      {isEditing && (
        <button
          onClick={handleSave}
          className="mt-4 px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Changes
        </button>
      )}
    </div>

    {/* 🔹 COMPANY / EXTRA */}
    <div className="bg-white rounded-xl shadow p-6">
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">
          Company Information
        </h3>

        <button className="px-4 py-1 text-sm bg-gray-200 rounded">
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="text-gray-400">Company</p>
          <p className="font-medium">
            {user.company?.name || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">GST</p>
          <p className="font-medium">
            {user.company?.registration?.gst || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Joined</p>
          <p className="font-medium">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>

    {/* 🔹 DOCUMENTS */}
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold text-gray-700 mb-4">
        Documents
      </h3>

      {user.document?.documents &&
      Object.keys(user.document.documents).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(user.document.documents).map(
            ([key, url]) =>
              url && (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-gray-100 rounded text-center hover:bg-gray-200"
                >
                  📄 {key.toUpperCase()}
                </a>
              )
          )}
        </div>
      ) : (
        <p className="text-gray-500">
          No documents uploaded
        </p>
        
      )}
    </div>

  </div>
); 
};

export default UserProfile;