import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/adminDashboard.css";

function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error");
    }
  };

  if (!data) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div className="admin-dashboard-page">
      <h2>Admin Dashboard</h2>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Revenue</h3>
          <p>₹{data.totalRevenue}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Orders</h3>
          <p>{data.totalOrders}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Users</h3>
          <p>{data.totalUsers}</p>
        </div>
      </div>

      <div className="admin-low-stock-card">
        <h3>Low Stock Products</h3>

        {data.lowStock.length === 0 ? (
          <p>No low stock products</p>
        ) : (
          data.lowStock.map((p) => (
            <div key={p._id} className="admin-low-stock-row">
              <span>{p.name}</span>
              <span>Stock: {p.stock}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;