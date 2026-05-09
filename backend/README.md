# RepairLink Backend 🛠️

RepairLink is a robust two-sided marketplace that connects device owners (customers) with repair service providers (PC, laptop, console, and mobile repair shops). This repository contains the backend API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication:** Secure JWT-based auth with access/refresh tokens and Role-Based Access Control (RBAC) for Customers, Providers, and Admins.
- **Ticketing System:** Advanced state machine for managing repair tickets from creation to delivery.
- **Bidding Engine:** Allows providers to bid on repair tickets.
- **Real-time Communication:** Live chat and notifications powered by Socket.io.
- **Background Jobs:** Automated task processing using Bull and Redis (e.g., bidding expiry, delivery simulations).
- **File Uploads:** Integrated Cloudinary support for device photos and repair logs.
- **Email Service:** Automated emails for verification, password resets, and status updates.
- **Delivery Simulation:** Mock delivery system with OTP-based handover confirmation.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Real-time:** Socket.io
- **Task Queue:** Bull (Redis-backed)
- **Storage:** Cloudinary
- **Validation:** Zod
- **Security:** Helmet, CORS, Bcrypt, Rate Limiting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Redis](https://redis.io/download) (Local or Upstash)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd repairlink/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and fill in the following details (refer to `.env.example` if available):

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   REDIS_URL=redis://localhost:6379
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLIENT_URL=http://localhost:5173
   ```

4. **Run the application:**

   **Development mode (with nodemon):**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

## 📂 Project Structure

```text
src/
├── config/         # Database, Redis, Cloudinary, and Socket.io configurations
├── jobs/           # Bull queue definitions and background job processors
├── middleware/     # Auth, authorization, error handling, and validation middlewares
├── models/         # Mongoose schemas and models
├── modules/        # Feature-based modules (Auth, Tickets, Bids, Chat, etc.)
├── services/       # External services (Email, Notifications)
├── sockets/        # Socket.io event handlers
└── utils/          # Utility classes (ApiError, ApiResponse) and helpers
```

## 🛣️ API Modules

- `/api/v1/auth`: Registration, Login, Profile, Password Management.
- `/api/v1/tickets`: Ticket creation, management, and marketplace.
- `/api/v1/bids`: Bidding on repair jobs.
- `/api/v1/delivery`: Pickup scheduling and OTP verification.
- `/api/v1/notifications`: User notifications.
- `/api/v1/admin`: Administrative controls and analytics.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
