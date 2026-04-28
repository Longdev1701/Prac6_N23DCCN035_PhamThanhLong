const mongoose = require("mongoose");

// Middleware kiểm tra id hợp lệ MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "ID không hợp lệ (không đúng định dạng MongoDB ObjectId)",
    });
  }
  next();
};

module.exports = validateObjectId;
