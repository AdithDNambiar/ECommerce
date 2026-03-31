import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import "../styles/orderDetail.css";

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const res = await API.get(`/orders/${id}`);
    setOrder(res.data);
  };

  const cancelOrder = async () => {
    try {
      await API.put(`/orders/cancel/${id}`);
      alert("Cancelled");
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (!order) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div className="order-detail-page">
      <div className="order-detail-box">
        <h2>Order Details</h2>

        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
        <p><strong>Payment:</strong> {order.paymentStatus}</p>

        <h3>Shipping Address</h3>
        <p>{order.address?.name}</p>
        <p>{order.address?.phone}</p>
        <p>
          {order.address?.addressLine}, {order.address?.city},{" "}
          {order.address?.state} - {order.address?.pincode}
        </p>

        <h3>Items</h3>

        {order.items.map((item) => (
          <div key={item._id} className="order-item">
            <p><strong>{item.product.name}</strong></p>
            <p>Qty: {item.quantity}</p>
            <p>Price: ₹{item.price}</p>
          </div>
        ))}

        {order.status === "pending" && (
          <button className="danger-btn" onClick={cancelOrder}>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;