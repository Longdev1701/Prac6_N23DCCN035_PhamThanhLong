const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, "Mã sinh viên là bắt buộc"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Họ tên sinh viên là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email sinh viên là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    score: {
      type: Number,
      min: [0, "Điểm số không được nhỏ hơn 0"],
      max: [100, "Điểm số không được lớn hơn 100"],
      default: 0,
    },
    major: {
      type: String,
      enum: {
        values: ["IT", "Business", "Design", "Marketing"],
        message: "Ngành học phải là một trong: IT, Business, Design, Marketing",
      },
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
