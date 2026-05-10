require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { globalLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(globalLimiter);

app.get("/api/v1/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "RepairLink backend is running",
  });
});

// Mount all module routers under /api/v1
app.use("/api/v1/auth", require("./modules/auth/auth.routes"));
app.use("/api/v1/tickets", require("./modules/tickets/ticket.routes"));
app.use("/api/v1", require("./modules/bids/bid.routes"));
app.use("/api/v1/delivery", require("./modules/delivery/delivery.routes"));
app.use(
  "/api/v1/notifications",
  require("./modules/notifications/notification.routes"),
);
app.use("/api/v1", require("./modules/reviews/review.routes"));
app.use("/api/v1/admin", require("./modules/admin/admin.routes"));

// Mount 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Mount global error handler
app.use(errorHandler);

// Create HTTP server, attach Socket.io
const server = http.createServer(app);
const socketConfig = require("./config/socket");
const io = socketConfig.init(server);

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
