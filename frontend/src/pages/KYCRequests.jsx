import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { Column, Table, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css';
import Badge from '../components/Badge';
import Modal from "../components/Modal";

const KYCRequests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionUser, setActionUser] = useState(null);

  // Fetch users with pending KYC
  const fetchKYCUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await adminAPI.getAllUsers();

      if (res.data.success) {
        const pending = res.data.data.filter(u => u.status === 'pending');
        setUsers(pending);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKYCUsers();
  }, [fetchKYCUsers]);

  // Approve / Reject KYC
 const handleAction = async (type) => {
  if (!actionUser) return;

  try {
    const res = await adminAPI.verifyDocuments(actionUser._id, {
      status: type === "approve" ? "approved" : "rejected",
      remark: type === "approve" ? "KYC approved" : "KYC rejected",
    });

    if (res.data.success) {
      setUsers(prev => prev.filter(u => u._id !== actionUser._id));
      setActionUser(null);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to update KYC status");
  }
};

  if (loading) return <div className="text-center text-gray-500 py-8">Loading KYC requests...</div>;
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  if (users.length === 0) return <div className="text-gray-500 text-center py-8">No pending KYC requests</div>;

  return (
    <div className="p-2">

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Pending KYC Requests
      </h2>

      <div
        className="bg-white rounded-xl shadow-lg min-w-[600px] sm:min-w-full"
        style={{ height: "500px" }}
      >
        <AutoSizer>
          {({ width, height }) => (

            <Table
              width={width}
              height={height}
              headerHeight={50}
              rowHeight={50}
              rowCount={users.length}
              rowGetter={({ index }) => users[index]}
              rowClassName="hover:bg-gray-50 cursor-pointer"
              onRowClick={({ rowData }) => setActionUser(rowData)}
            >

              <Column
                label="S.No"
                dataKey="serial"
                width={60}
                cellRenderer={({ rowIndex }) => rowIndex + 1}
              />

              <Column
                label="Name"
                dataKey="name"
                width={150}
                cellRenderer={({ cellData }) =>
                  <span className="text-sm font-medium">{cellData}</span>
                }
              />

              <Column
                label="Email"
                dataKey="email"
                width={200}
                cellRenderer={({ cellData }) =>
                  <span className="text-sm text-gray-500">{cellData}</span>
                }
              />

              <Column
                label="Role"
                dataKey="role"
                width={100}
                cellRenderer={({ cellData }) =>
                  <Badge text={cellData} type={cellData} />
                }
              />

              <Column
                label="Status"
                dataKey="status"
                width={120}
                cellRenderer={({ rowData }) =>
                  <Badge text={rowData.status} type={rowData.status} />
                }
              />

              <Column
                label="Documents"
                dataKey="documents"
                width={200}
                cellRenderer={({ rowData }) => (

                  rowData.documents ?

                    <button
                      onClick={() => setActionUser(rowData)}
                      className="text-blue-600 underline text-xs"
                    >
                      View Docs ({Object.keys(rowData.documents).length})
                    </button>

                    :

                    <span className="text-gray-400 text-xs">
                      No Docs
                    </span>

                )}
              />

            </Table>

          )}
        </AutoSizer>
      </div>

      {/* KYC Modal */}
      {actionUser && (

        <Modal
          title={`KYC Details - ${actionUser.name}`}
          onClose={() => setActionUser(null)}
        >

          <div className="mb-4">

            <h3 className="font-semibold mb-2">
              Submitted Documents
            </h3>

          <div className="flex flex-wrap gap-4 max-h-[400px] overflow-y-auto">

 {Object.entries(actionUser.documents || {}).map(([key, doc]) => (

  doc && (

    <div key={key} className="flex flex-col items-center gap-1">

      <span className="text-xs font-medium">
        {key.toUpperCase()}
      </span>

      <img
        src={`http://localhost:5000/uploads/${doc}`}
        alt={key}
        className="w-40 h-40 object-cover border rounded shadow"
      />

    </div>

  )

))}

</div>

          </div>

          <p className="mb-4">
            Approve or reject KYC for <strong>{actionUser.name}</strong>?
          </p>

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={() => handleAction("approve")}
              className="flex-1 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              Approve
            </button>

            <button
              onClick={() => handleAction("reject")}
              className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Reject
            </button>

            <button
              onClick={() => setActionUser(null)}
              className="flex-1 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Cancel
            </button>

          </div>

        </Modal>

      )}

    </div>
  );
};

export default KYCRequests;