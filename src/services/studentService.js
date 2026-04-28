const Student = require("../models/Student");

// Tạo sinh viên mới
const createStudent = async (data) => {
  const student = new Student(data);
  return await student.save();
};

// Lấy danh sách sinh viên (có pagination & filter theo major)
const getStudents = async ({ page = 1, limit = 10, major }) => {
  const filter = { isActive: true };
  if (major) {
    filter.major = major;
  }

  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  return {
    students,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết sinh viên theo id
const getStudentById = async (id) => {
  return await Student.findById(id);
};

// Cập nhật sinh viên
const updateStudent = async (id, data) => {
  return await Student.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Xóa sinh viên (soft delete - đặt isActive = false)
const deleteStudent = async (id) => {
  return await Student.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

// Cập nhật điểm sinh viên
const updateScore = async (id, score) => {
  return await Student.findByIdAndUpdate(
    id,
    { score },
    { new: true, runValidators: true }
  );
};

// Lấy top sinh viên theo điểm
const getTopStudents = async (limit = 5) => {
  return await Student.find({ isActive: true })
    .sort({ score: -1 })
    .limit(Number(limit));
};

// Tính điểm trung bình
const getAverageScore = async () => {
  const result = await Student.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, averageScore: { $avg: "$score" } } },
  ]);

  return result.length > 0 ? result[0].averageScore : 0;
};

// Tìm kiếm sinh viên theo tên
const searchStudents = async (keyword) => {
  return await Student.find({
    isActive: true,
    name: { $regex: keyword, $options: "i" },
  });
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateScore,
  getTopStudents,
  getAverageScore,
  searchStudents,
};
