import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const CreateUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // validation messages
  const [passwordWarning, setPasswordWarning] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');

  const { name, email, phone, password, role } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccess('');

    // password validation
    if (name === 'password') {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
      if (value.length < 6 || !passwordRegex.test(value)) {
        setPasswordWarning(
          'Password must be at least 6 chars, include 1 number and 1 special char'
        );
      } else {
        setPasswordWarning('');
      }
    }

    // phone validation
    if (name === 'phone') {
      if (!/^\d{10}$/.test(value)) {
        setPhoneWarning('Phone must be exactly 10 digits');
      } else {
        setPhoneWarning('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // prevent submission if warnings exist
    if (passwordWarning || phoneWarning) {
      setError('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminAPI.createUser(formData);

      if (response.data.success) {
        setSuccess('User created successfully!');

        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'user'
        });

        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create User</h2>

      <div className="bg-white rounded-xl shadow-lg p-6">

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter full name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={onChange}
              placeholder="Enter phone number"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                phoneWarning ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {phoneWarning && (
              <p className="text-red-600 text-sm mt-1">{phoneWarning}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Create password"
                minLength={6}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  passwordWarning ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordWarning && (
              <p className="text-red-600 text-sm mt-1">{passwordWarning}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="user">User</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateUser;