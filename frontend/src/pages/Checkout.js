import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/checkout.css";

function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    fetchAddresses();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    if (document.getElementById("razorpay-script")) return;

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/address");
      setAddresses(res.data);

      const defaultAddress = res.data.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (res.data.length > 0) {
        setSelectedAddressId(res.data[0]._id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addAddress = async () => {
    try {
      await API.post("/address", form);
      setForm({
        name: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: ""
      });
      fetchAddresses();
      alert("Address added");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add address");
    }
  };

  const prepareCheckout = async () => {
    if (!selectedAddressId) {
      alert("Please select an address");
      return;
    }

    try {
      const res = await API.post("/orders/checkout", {
        addressId: selectedAddressId,
        couponCode
      });

      setSummary(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Checkout failed");
    }
  };

  const payNow = async () => {
    if (!summary) {
      alert("Please prepare checkout first");
      return;
    }

    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      alert("Missing Razorpay key in frontend env");
      return;
    }

    setLoading(true);

    const options = {
      key: razorpayKey,
      amount: summary.amount,
      currency: summary.currency,
      name: "ShopX",
      description: "Order Payment",
      order_id: summary.razorpayOrderId,
      handler: async function (response) {
        try {
          const verifyRes = await API.post("/orders/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            address: summary.address,
            couponCode: summary.couponCode || ""
          });

          alert("Payment success");
          console.log(verifyRes.data);
          window.location.href = "/";
        } catch (err) {
          alert(err.response?.data?.message || "Verification failed");
        }
      },
      prefill: {
        name: summary.address?.name || "",
        contact: summary.address?.phone || ""
      },
      theme: {
        color: "#111111"
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function () {
      alert("Payment failed");
    });

    rzp.open();
    setLoading(false);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <div className="checkout-card">
          <h2>Select Address</h2>

          {addresses.length === 0 ? (
  <p className="empty-address-text">No saved addresses yet.</p>
) : (
  <div className="address-list">
    {addresses.map((addr) => (
      <label
        key={addr._id}
        className={`address-option ${
          selectedAddressId === addr._id ? "selected-address" : ""
        }`}
      >
        <div className="address-radio-wrap">
          <input
            type="radio"
            name="selectedAddress"
            checked={selectedAddressId === addr._id}
            onChange={() => setSelectedAddressId(addr._id)}
          />
        </div>

        <div className="address-content">
          <div className="address-top-row">
            <h4>{addr.name}</h4>
            <span className="address-phone">{addr.phone}</span>
          </div>

          <p className="address-line">
            {addr.addressLine}
          </p>

          <p className="address-line">
            {addr.city}, {addr.state} - {addr.pincode}
          </p>

          {addr.isDefault && (
            <span className="default-address-badge">Default</span>
          )}
        </div>
      </label>
    ))}
  </div>
)}
        </div>

        <div className="checkout-card">
          <h2>Add New Address</h2>

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            name="addressLine"
            placeholder="Address Line"
            value={form.addressLine}
            onChange={handleChange}
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
          />
          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
          />
          <input
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
          />

          <button className="black-btn" onClick={addAddress}>
            Save Address
          </button>
        </div>
      </div>

      <div className="checkout-right">
        <div className="checkout-card">
          <h2>Coupon</h2>

          <input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />

          <button className="black-btn" onClick={prepareCheckout}>
            Apply Coupon & Prepare Checkout
          </button>
        </div>

        <div className="checkout-card">
          <h2>Order Summary</h2>

          {!summary ? (
            <p>Prepare checkout to see totals.</p>
          ) : (
            <>
              <p>Subtotal: ₹{summary.subtotal}</p>
              <p>Discount: ₹{summary.discount}</p>
              <p><strong>Final Total: ₹{summary.finalTotal}</strong></p>

              <button
                className="pay-btn"
                onClick={payNow}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay with Razorpay"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;