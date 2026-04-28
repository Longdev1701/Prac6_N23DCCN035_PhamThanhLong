// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    return res.status(400).json({
      success: false,
      message: `Giá trị của trường ${field} đã tồn tại`,
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: "Lỗi máy chủ nội bộ",
  });
};

module.exports = errorHandler;
