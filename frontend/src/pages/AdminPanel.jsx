// frontend/src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import API from "../utils/api";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState({});
  const [users, setUsers] = useState([]);
  const [keys, setKeys] = useState([]);
  const [payments, setPayments] = useState([]);
  const [datasets, setDatasets] = useState([]);

  // Fetch all sections
  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchKeys();
    fetchPayments();
    fetchDatasets();
  }, []);

  const fetchOverview = async () => {
    const res = await API.get("/admin/overview");
    setOverview(res.data);
  };

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const toggleBlock = async (id) => {
    await API.patch(`/admin/users/${id}/block`);
    fetchUsers();
  };

  const promoteUser = async (id) => {
    await API.post("/admin/users/promote", { userId: id });
    fetchUsers();
  };

  const fetchKeys = async () => {
    const res = await API.get("/admin/keys");
    setKeys(res.data);
  };

  const revokeKey = async (id) => {
    await API.delete(`/admin/keys/${id}/revoke`);
    fetchKeys();
  };

  const fetchPayments = async () => {
    const res = await API.get("/admin/payments");
    setPayments(res.data);
  };

  const fetchDatasets = async () => {
    const res = await API.get("/admin/datasets");
    setDatasets(res.data);
  };

  // Utility
  const formatDate = (d) =>
    new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <h2 className="text-3xl font-semibold text-center mb-6">🛠 Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-3">
        {["overview",  "keys", "payments", "datasets"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid sm:grid-cols-4 gap-4 text-center">
        
          <StatCard label="Datasets" value={overview.datasets} />
          <StatCard label="Payments" value={overview.payments} />
          <StatCard label="API Keys" value={overview.apiKeys} />
        </div>
      )}

      

      {/* API Keys */}
      {activeTab === "keys" && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-2">Key</th>
                <th className="p-2">User</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Valid From</th>
                <th className="p-2">Valid To</th>
                <th className="p-2">Active</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border text-center">
                  <td className="text-xs break-all">{k.key}</td>
                  <td>{k.user?.email ?? "—"}</td>
                  <td>{k.plan}</td>
                  <td>{k.validFrom ? formatDate(k.validFrom) : "—"}</td>
                  <td>{k.validTo ? formatDate(k.validTo) : "—"}</td>
                  <td>{k.active ? "✅" : "❌"}</td>
                  <td>
                    {k.active && (
                      <button
                        onClick={() => revokeKey(k.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {activeTab === "payments" && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-2">Txn ID</th>
                <th className="p-2">User</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border text-center">
                  <td>{p.transactionId}</td>
                  <td>{p.user?.email ?? "—"}</td>
                  <td>{p.plan}</td>
                  <td>${p.amount}</td>
                  <td>{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Datasets */}
      {activeTab === "datasets" && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">User</th>
                <th className="p-2">Role</th>
                <th className="p-2">Image</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d) => (
                <tr key={d.id} className="border text-center">
                  <td>{d.datasetName}</td>
                  <td>{d.user?.email}</td>
                  <td>{d.user?.role}</td>
                  <td>
                    {d.imageUrl ? (
                      <img
                        src={`http://localhost:5000/${d.imageUrl}`}
                        alt="dataset"
                        className="w-16 h-16 object-cover mx-auto rounded"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-blue-50 border rounded-lg p-4 shadow">
      <p className="text-2xl font-bold text-blue-700">{value ?? 0}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}
