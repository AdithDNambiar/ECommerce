import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/adminCoupons.css";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minOrder: "",
    usageLimit: "",
    expiry: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const createCoupon = async () => {
    try {
      await API.post("/coupons/create", form);
      setForm({
        code: "",
        type: "percent",
        value: "",
        minOrder: "",
        usageLimit: "",
        expiry: ""
      });
      fetchCoupons();
      alert("Coupon created");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const toggleCoupon = async (id) => {
    try {
      await API.put(`/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
  <div className="admin-coupons-page">
    <h2>Manage Coupons</h2>

    <div className="admin-coupon-form">
      <input name="code" placeholder="Code" value={form.code} onChange={handleChange} />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="percent">percent</option>
        <option value="flat">flat</option>
      </select>
      <input name="value" placeholder="Value" value={form.value} onChange={handleChange} />
      <input name="minOrder" placeholder="Minimum Order" value={form.minOrder} onChange={handleChange} />
      <input name="usageLimit" placeholder="Usage Limit" value={form.usageLimit} onChange={handleChange} />
      <input name="expiry" type="date" value={form.expiry} onChange={handleChange} />

      <button onClick={createCoupon}>Create Coupon</button>
    </div>

    <div className="admin-coupon-list">
      {coupons.map((coupon) => (
        <div key={coupon._id} className="admin-coupon-card">
          <p><strong>{coupon.code}</strong></p>
          <p>Type: {coupon.type}</p>
          <p>Value: {coupon.value}</p>
          <p>Used: {coupon.usedCount} / {coupon.usageLimit}</p>
          <p>Status: {coupon.isActive ? "Active" : "Inactive"}</p>

          <button onClick={() => toggleCoupon(coupon._id)}>
            {coupon.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      ))}
    </div>
  </div>
);
};

export default AdminCoupons;