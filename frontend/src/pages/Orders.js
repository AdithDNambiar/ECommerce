import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="orders-page">
      <h2>Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((o) => (
          <div
            key={o._id}
            className="order-card"
            onClick={() => navigate(`/orders/${o._id}`)}
          >
            <p><strong>Order ID:</strong> {o._id}</p>
            <p><strong>Status:</strong> {o.status}</p>
            <p><strong>Total:</strong> ₹{o.totalAmount}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;