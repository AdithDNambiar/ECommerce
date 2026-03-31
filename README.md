#  ShopX — Full Stack E-Commerce Platform

A complete full-stack e-commerce application built with modern technologies.  
Includes authentication, product management, cart system, coupons, orders, payments, reviews, and admin panel.

---

##  Tech Stack

### Frontend
- React (CRA)
- Axios
- React Router
- Plain CSS (No Tailwind)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication (Access + Refresh Tokens)

### Integrations
- Razorpay (Payments)
- Cloudinary (Image Uploads)

---

##  Features

### AUTH
- JWT authentication with access + refresh tokens
- HttpOnly cookies for security
- Silent token refresh
- Role-based access (User / Admin)
- Admin login separate endpoint
- Logout invalidates refresh token (DB blacklist)

---

### PRODUCTS
- Add/Edit/Delete products (Admin)
- Multiple image upload (Cloudinary)
- Category + price + rating filters (combined)
- Sorting: low-high, high-low, newest, top-rated
- Debounced search
- Discount pricing system
- Stock management

---

### CART
- Stored in database (persistent across devices)
- Add / Remove / Update quantity
- Stock validation on backend
- Real-time cart count in navbar
- Subtotal + total calculation

---

### COUPONS
- Admin creates coupons:
  - % or flat discount
  - min order value
  - expiry
  - usage limit
- One-time usage per user
- Full discount breakdown at checkout

---

### CHECKOUT & PAYMENTS
- Address management (multiple addresses)
- Razorpay integration
- Secure payment verification (HMAC)
- Stock deducted only after payment success
- No fake payment acceptance

---

### ORDERS
- Order statuses:
  - pending → processing → shipped → delivered → cancelled
- Order history
- Order detail page
- Cancel only if pending (stock restored)

---

### REVIEWS
- Only allowed if:
  - product purchased
  - order delivered
- One review per user per product
- Edit review allowed
- Auto rating calculation

---

### ADMIN PANEL
- Dashboard:
  - total revenue
  - total orders
  - total users
  - low stock alerts
- Manage:
  - Products
  - Orders
  - Coupons

---

##  Project Structure
Ecommerce/ │ ├── backend/ │   ├── src/ │   ├── .env (ignored) │   └── package.json │ ├── frontend/ │   ├── src/ │   ├── .env (ignored) │   └── package.json

---

##  Environment Variables

### Backend `.env`
PORT=5000 MONGO_URI=your_mongodb_uri JWT_SECRET=your_access_secret JWT_REFRESH_SECRET=your_refresh_secret
RAZORPAY_KEY_ID=your_key RAZORPAY_KEY_SECRET=your_secret
CLOUD_NAME=your_cloud_name CLOUD_KEY=your_key CLOUD_SECRET=your_secret

---

##  Run Locally

### 1. Clone repo
git clone https://github.com/yourusername/ECommerce.git⁠� cd Ecommerce

### 2. Backend
cd backend npm install npm run dev

### 3. Frontend
cd frontend npm install npm start

---

##  API Base URL
http://localhost:5000/api⁠�

---

##  Key Highlights

- Production-level authentication system
- Secure payment verification (no fake payments)
- Fully scalable architecture
- Clean UI with modern UX
- Backend-first validation (not relying on frontend)

---


##  Author

**Adith D Nambiar**

- Portfolio: https://adithdnambiar.vercel.app
- GitHub: https://github.com/AdithDNambiar

---
