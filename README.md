# ShopKart

**ShopKart** is a full-stack MERN (MongoDB, Express, React, Node.js) e-commerce web application developed across Labs 01–06.

It features user authentication, a product catalog with live search and category filtering, a persistent wishlist, an interactive shopping cart with live inventory tracking, a checkout workflow integrated with Razorpay Test Mode payment verification, and complete order management.

---

# Features

### User Authentication & Profiles

- Secure customer registration and login
- Password hashing using `bcrypt`
- JWT-based authentication
- JWT stored in HTTP-only cookies
- Protected backend routes

### Product Catalog & Details

- Browse products with categories, prices, images, and live stock counts
- Individual product detail pages
- Real-time inventory availability

### Search & Filtering

- Search products by name
- Filter products by category
- Real-time product filtering

### Wishlist

- Add and remove products from wishlist
- Persistent wishlist stored in MongoDB
- Customer-specific wishlist data

### Shopping Cart

- Add products to cart
- Increase, decrease, or remove items
- Automatic total calculation
- Real-time stock limits
- Prevent quantities from exceeding available inventory
- Persistent customer cart

### Checkout & Shipping Address

- Shipping address form with validation
- Full name, phone number, address, city, state, and 6-digit pincode
- Server-side cart validation
- Server-side stock validation
- Server-side price calculation

### Razorpay Test Mode Payment

- Server-side Razorpay order creation
- INR amount handling in paise
- Client-side Razorpay Checkout integration
- HMAC SHA256 payment signature verification
- Test Mode payment workflow

### Order Management & History

- Persistent order history
- Payment and delivery status
- Itemized order details
- Shipping information
- Razorpay payment ID tracking
- Immutable product snapshots stored with orders

### Inventory & Payment Synchronization

**Successful Payment:**

```text
Payment Successful
       ↓
Signature Verified
       ↓
Order → PAID / PLACED
       ↓
Product Stock Reduced
       ↓
Cart Cleared
```

**Failed Payment:**

```text
Payment Failed
       ↓
Order → FAILED / PENDING_PAYMENT
       ↓
Stock Remains Unchanged
       ↓
Cart Remains Intact
```

---

# Tech Stack

## Frontend

- React 19
- Vite
- React Router v7
- Tailwind CSS
- Axios
- React Context API

## Backend

- Node.js (ES Modules)
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- bcrypt
- cookie-parser
- CORS
- dotenv
- Razorpay Node SDK

---

# Project Structure

```text
shopkart-mern-lab-project/
├── ShopKart/                     # Backend Server
│   ├── controllers/              # Controller logic
│   ├── middlewares/              # Authentication middleware
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express API routes
│   ├── utils/                    # Helper functions
│   ├── index.js                  # Server entry point
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Backend environment template
│
├── ShopKartF/
│   └── ShopKart-Frontend/        # Frontend Application
│       ├── public/               # Static assets
│       ├── src/
│       │   ├── assets/           # Images and icons
│       │   ├── components/       # Reusable components
│       │   ├── context/          # Cart and wishlist contexts
│       │   ├── pages/            # Application pages
│       │   ├── services/         # Axios API client
│       │   ├── App.jsx           # Route configuration
│       │   ├── main.jsx          # React entry point
│       │   └── index.css         # Global styles
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
├── .gitignore
├── .env.example
└── README.md
```

---

# Prerequisites

Before running the project locally, ensure the following are installed:

- Node.js v18.0 or higher
- npm v9.0 or higher
- MongoDB Atlas or a local MongoDB instance
- Razorpay account with Test Mode access

---

# Installation

## Clone the Repository

```bash
git clone <repository-url>
cd shopkart-mern-lab-project
```

## Install Backend Dependencies

```bash
cd ShopKart
npm install
```

## Install Frontend Dependencies

```bash
cd ../ShopKartF/ShopKart-Frontend
npm install
```

---

# Environment Variables

The backend requires environment variables for database connectivity, authentication, and Razorpay payments.

Navigate to the backend directory:

```bash
cd ShopKart
```

Create a `.env` file using the provided template:

```bash
cp .env.example .env
```

Add the required values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

### Security

**Never commit `.env` files, API keys, database credentials, or other secrets to GitHub.**

The repository contains `.env.example` files containing only placeholder values.

---

# MongoDB Setup

1. Log in to MongoDB Atlas.
2. Create a MongoDB cluster.
3. Create a database user with read and write permissions.
4. Configure Network Access.
5. Select **Connect → Drivers → Node.js**.
6. Copy the MongoDB connection string.
7. Replace `<password>` with the database user's password.
8. Add the connection string to `MONGO_URI` in the backend `.env` file.

---

# Razorpay Test Mode

1. Log in to the Razorpay Dashboard.
2. Switch to **Test Mode**.
3. Navigate to **Account & Settings → API Keys**.
4. Generate Test Mode API keys.
5. Add the Key ID and Key Secret to the backend `.env` file.

Razorpay Test Mode is used to simulate payment workflows without processing real transactions.

---

# Running the Project

## Start Backend

From the project root:

```bash
cd ShopKart
npm run dev
```

The backend runs on:

```text
http://localhost:8002
```

## Start Frontend

Open a separate terminal:

```bash
cd ShopKartF/ShopKart-Frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

# Testing Flow

### 1. Register & Login

Open the registration page and create a customer account.

Log in and verify that protected functionality is accessible.

### 2. Product Catalog

Test:

- Product browsing
- Product search
- Category filtering
- Product details
- Stock availability

### 3. Wishlist

Test:

- Adding products
- Removing products
- Wishlist persistence
- Wishlist synchronization with the customer account

### 4. Cart

Test:

- Adding products
- Increasing quantity
- Decreasing quantity
- Removing products
- Automatic total calculation
- Stock restrictions

### 5. Checkout

Enter:

- Full name
- Phone number
- Address
- City
- State
- 6-digit pincode

The backend validates the cart, stock, and pricing before creating the payment order.

### 6. Payment

Click **Pay with Razorpay** and test both successful and failed payment scenarios.

**Successful payment:**

- Payment signature verified
- Order marked `PAID / PLACED`
- Product stock reduced
- Cart cleared
- User redirected to order success

**Failed payment:**

- Order marked `FAILED / PENDING_PAYMENT`
- Product stock remains unchanged
- Cart remains intact

### 7. Order History

Verify:

- Order listing
- Payment status
- Delivery status
- Itemized order details
- Shipping information
- Razorpay payment ID

---

# Security Implementation

### Secrets Isolation

Sensitive credentials are stored exclusively on the backend:

```text
MONGO_URI
JWT_SECRET
RAZORPAY_KEY_SECRET
```

These values are never exposed to the frontend.

### Server-Side Pricing

Order totals are calculated on the backend using product prices stored in MongoDB instead of trusting prices supplied by the client.

### Server-Side Stock Validation

Product stock is revalidated before payment/order confirmation to prevent purchasing unavailable inventory.

### Razorpay Signature Verification

The backend verifies the Razorpay payment signature using HMAC SHA256.

The verification is based on:

```text
razorpay_order_id + "|" + razorpay_payment_id
```

using the server-side:

```text
RAZORPAY_KEY_SECRET
```

### Protected Endpoints

Cart, wishlist, order, and profile operations require valid JWT authentication verified by the backend authentication middleware.

---

# Deployment

The application can be deployed with the frontend and backend hosted separately.

Production environment variables should be configured through the deployment platform's environment variable settings.

**Never commit production secrets or `.env` files to GitHub.**

---

# Project Status

The project includes:

- User authentication
- MongoDB database integration
- Product catalog
- Search and filtering
- Wishlist
- Shopping cart
- Inventory management
- Checkout
- Razorpay Test Mode payments
- Payment signature verification
- Order management
- Protected backend routes
- Frontend and backend implementation
- Environment variable protection
- Deployment-ready configuration
