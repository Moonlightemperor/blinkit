# 🛒 Blinkit-Inspired Quick Commerce Platform

AA full-stack quick commerce web application inspired by Blinkit, built using Node.js, Express.js, EJS, and MongoDB.

The platform allows users to browse products, manage carts, place orders securely using Razorpay integration, and provides an admin dashboard for managing products, users, and orders.

---

## 🚀 Live Demo

🔗 Live Website: https://blinkit-opal.vercel.app/

---

## ✨ Features

### 👤 Authentication & Authorization
- JWT-based authentication
- Secure login/signup system
- Protected routes
- Role-Based Access Control (RBAC)
- Admin & User access separation

### 🛍️ E-Commerce Functionality
- Product browsing and searching
- Dynamic product pages
- Add to cart / remove from cart
- Quantity management
- Order placement workflow

### 💳 Payments
- Razorpay payment gateway integration
- Secure online payment handling

### 📦 Admin Dashboard
- Manage products
- Manage users
- Manage orders
- Inventory handling

### ⚡ Performance & UX
- Responsive design
- Optimized API handling
- Clean and modern UI
- Mobile-friendly layout

---

## 🛠️ Tech Stack

### Frontend
- Ejs
- JavaScript (ES6+)
- Tailwind CSS
- Redux
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Tools & Services
- Razorpay
- Vercel
- Git & GitHub

---

## 📂 Project Structure

```bash
project-root/
│
├── client/        # Frontend  Application
├── server/        # Backend Express API
├── models/        # MongoDB Models
├── routes/        # API Routes
├── middleware/    # Authentication & RBAC Middleware
├── controllers/   # Business Logic
└── utils/         # Helper Functions

```
## 🔐 Authentication Flow
  User signs up or logs in
  JWT token is generated
  Protected routes validate token
  RBAC middleware checks user roles
  Admin routes restricted to authorized users
## 💳 Razorpay Payment Flow
  User places an order
  Backend creates Razorpay order
  Payment processed securely
  Payment verification handled on backend
  Order status updated after successful payment
---

## 📸 Screenshots
Home Page

<img width="1637" height="990" alt="image" src="https://github.com/user-attachments/assets/48fe6024-a681-406f-8428-958b8fbdc3d9" />


Product Page

<img width="1389" height="994" alt="image" src="https://github.com/user-attachments/assets/1378f162-f720-4752-99b7-49ef14caab82" />


Cart

<img width="1917" height="990" alt="image" src="https://github.com/user-attachments/assets/94199d2e-0294-4482-9dbd-c85a19a2e0b2" />


Admin Dashboard

<img width="1750" height="993" alt="image" src="https://github.com/user-attachments/assets/61aeb802-8edd-43f3-93ce-e432d38af321" />

## 📈 Future Improvements
- Real-time order tracking
- Wishlist functionality
- Product reviews & ratings
- Email notifications
- Advanced analytics dashboard


## 👨‍💻 Author
Pradyumna Kumar
- Portfolio: https://portfolio-ai-seven-ashen.vercel.app/
- Live Project: https://blinkit-opal.vercel.app/


⭐ If you like this project

Give it a star on GitHub ⭐
