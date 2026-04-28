const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const studentRoutes = require("./src/routes/studentRoutes");
const errorHandler = require("./src/middlewares/errorHandler");
const logger = require("./src/middlewares/logger");

// Load biến môi trường
dotenv.config();

// Kết nối database
connectDB();

const app = express();

// Middleware parse JSON
app.use(express.json());

// Logger middleware
app.use(logger);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/students", studentRoutes);

// Error handler middleware (đặt sau routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
