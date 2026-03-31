import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/adminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/admin/all");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/admin/status/${id}`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="admin-orders-page">
      <h2>Manage Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="admin-order-card">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>User:</strong> {order.user?.name} ({order.user?.email})</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <p><strong>Status:</strong> {order.status}</p>

            <select
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;