import { useState, useEffect, useMemo, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { Column, Table, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css';
import Badge from '../components/Badge';
import Modal from "../components/Modal";
import { Users, UserCheck, UserX, Shield, User, Theater } from 'lucide-react';

const UserTable = ({ role = 'user', title = 'Users' }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [docModalUser, setDocModalUser] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'name', direction: 'ASC' });

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAllUsers();
      if (res.data.success) {
        const filtered = role ? res.data.data.filter(u => u.role === role) : res.data.data;
        setUsers(filtered);
        setFilteredUsers(filtered);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Search Filter
  useEffect(() => {
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  // Sorting
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const valA = a[sortBy.key];
      const valB = b[sortBy.key];
      if (valA < valB) return sortBy.direction === 'ASC' ? -1 : 1;
      if (valA > valB) return sortBy.direction === 'ASC' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortBy]);

  const handleSort = (key) => {
    setSortBy(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Update User
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser?._id) {
      setError("User ID missing for update");
      return;
    }

    try {
      const res = await adminAPI.updateUser(editingUser._id, editingUser);
      if (res.data.success) {
        setUsers(users.map(u => u._id === editingUser._id ? res.data.data : u));
        setEditingUser(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    if (!id) return;
    try {
      const res = await adminAPI.deleteUser(id);
      if (res.data.success) setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500 text-xl">Loading...</div>;

  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      {sortedUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500">No {role}s found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg min-w-[600px] sm:min-w-full" style={{ height: '600px' }}>
          <AutoSizer>
            {({ width, height }) => (
              <Table
                width={width}
                height={height}
                headerHeight={50}
                rowHeight={50}
                rowCount={sortedUsers.length}
                rowGetter={({ index }) => sortedUsers[index]}
                rowClassName="hover:bg-gray-50"
              >
                <Column
                  label="S.No"
                  dataKey="serial"
                  width={60}
                  cellRenderer={({ rowIndex }) => <span className="text-sm text-gray-700">{rowIndex + 1}</span>}
                />
                <Column
                  label="Name"
                  dataKey="name"
                  width={150}
                  headerRenderer={() => <span className="cursor-pointer" onClick={() => handleSort('name')}>Name</span>}
                  cellRenderer={({ cellData }) => <span className="text-sm font-medium text-gray-900">{cellData}</span>}
                />
                <Column
                  label="Email"
                  dataKey="email"
                  width={200}
                  headerRenderer={() => <span className="cursor-pointer" onClick={() => handleSort('email')}>Email</span>}
                  cellRenderer={({ cellData }) => <span className="text-sm text-gray-500">{cellData}</span>}
                />
                <Column
                  label="Role"
                  dataKey="role"
                  width={100}
                  headerRenderer={() => <span className="cursor-pointer" onClick={() => handleSort('role')}>Role</span>}
                  cellRenderer={({ cellData }) => <Badge text={cellData} type={cellData} />}
                />
                <Column
                  label="Status"
                  dataKey="isVerified"
                  width={100}
                  headerRenderer={() => <span className="cursor-pointer" onClick={() => handleSort('isVerified')}>Status</span>}
                  cellRenderer={({ cellData }) => <Badge text={cellData ? 'Verified' : 'Pending'} type={cellData ? 'verified' : 'pending'} />}
                />
                <Column
                  label="Documents"
                  dataKey="document.documents"
                  width={200}
                  cellRenderer={({ rowData }) => (
                    rowData.document?.documents ? (
                      <button
                        onClick={() => setDocModalUser(rowData)}
                        className="text-blue-600 underline text-xs"
                      >
                        View Docs ({Object.keys(rowData.document.documents).length})
                      </button>
                    ) : <span className="text-gray-400 text-xs">No Docs</span>
                  )}
                />
                <Column
                  label="Actions"
                  dataKey="_id"
                  width={180}
                  cellRenderer={({ rowData }) => (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditingUser({ ...rowData })}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(rowData._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                />
              </Table>
            )}
          </AutoSizer>
        </div>
      )}

      {/* Documents Modal */}
      {docModalUser && (
        <Modal title={`Documents - ${docModalUser.name}`} onClose={() => setDocModalUser(null)}>
          <div className="flex flex-wrap gap-4 max-h-[400px] overflow-y-auto">
            {Object.entries(docModalUser.document?.documents || {}).map(([key, url]) => (
              url && (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{key.toUpperCase()}</span>
                  <img
                    src={url}
                    alt={key}
                    className="w-40 h-40 object-cover border rounded shadow"
                  />
                </div>
              )
            ))}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <Modal title="Edit User" onClose={() => setEditingUser(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={editingUser.role}
                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option value="user">User</option>
                <option value="agent">Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingUser.isVerified ? 'verified' : 'pending'}
                onChange={e => setEditingUser({ ...editingUser, isVerified: e.target.value === 'verified' })}
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p>Are you sure you want to delete this user?</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserTable;