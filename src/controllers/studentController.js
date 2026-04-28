const studentService = require("../services/studentService");

// POST /api/students - Tạo sinh viên
const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo sinh viên thành công",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students - Lấy danh sách sinh viên
const getStudents = async (req, res, next) => {
  try {
    const { page, limit, major } = req.query;
    const result = await studentService.getStudents({ page, limit, major });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id - Lấy chi tiết sinh viên
const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/students/:id - Cập nhật sinh viên
const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật sinh viên thành công",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/:id - Xóa sinh viên (soft delete)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await studentService.deleteStudent(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }
    res.status(200).json({
      success: true,
      message: "Xóa sinh viên thành công (soft delete)",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/:id/score - Cập nhật điểm
const updateScore = async (req, res, next) => {
  try {
    const { score } = req.body;

    // Validate score
    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp điểm số",
      });
    }

    if (typeof score !== "number" || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Điểm số phải là số trong khoảng 0 - 100",
      });
    }

    const student = await studentService.updateScore(req.params.id, score);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật điểm thành công",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/top?limit=5 - Lấy top sinh viên theo điểm
const getTopStudents = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const students = await studentService.getTopStudents(limit);
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/stats/avg - Tính điểm trung bình
const getAverageScore = async (req, res, next) => {
  try {
    const averageScore = await studentService.getAverageScore();
    res.status(200).json({
      success: true,
      data: {
        averageScore: Math.round(averageScore * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/search?q=keyword - Tìm kiếm sinh viên
const searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp từ khóa tìm kiếm",
      });
    }
    const students = await studentService.searchStudents(q);
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
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
