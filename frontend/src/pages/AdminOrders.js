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
        <p>No orders yet.</p>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <div key={order._id} className="admin-order-card">
              <div className="admin-order-top">
                <h3>Order ID: {order._id}</h3>
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="admin-order-grid">
                <div>
                  <p><strong>Customer:</strong> {order.user?.name}</p>
                  <p><strong>Email:</strong> {order.user?.email}</p>
                  <p><strong>Payment:</strong> {order.paymentStatus}</p>
                  <p><strong>Coupon:</strong> {order.coupon || "No coupon"}</p>
                </div>

                <div>
                  <p><strong>Subtotal:</strong> ₹{order.subtotal || 0}</p>
                  <p><strong>Discount:</strong> ₹{order.discount || 0}</p>
                  <p><strong>Final Total:</strong> ₹{order.totalAmount}</p>
                </div>
              </div>

              {order.address && (
                <div className="admin-order-address">
                  <h4>Shipping Address</h4>
                  <p><strong>Name:</strong> {order.address.name}</p>
                  <p><strong>Phone:</strong> {order.address.phone}</p>
                  <p>
                    <strong>Address:</strong> {order.address.addressLine},{" "}
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              )}

              <div className="admin-order-items">
                <h4>Ordered Items</h4>
                {order.items.map((item) => (
                  <div key={item._id} className="admin-order-item-row">
                    <span>{item.product?.name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="admin-order-actions">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;