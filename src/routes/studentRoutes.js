const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const validateObjectId = require("../middlewares/validateObjectId");

// API nâng cao (đặt trước các route có :id để tránh conflict)
router.get("/top", studentController.getTopStudents);
router.get("/stats/avg", studentController.getAverageScore);
router.get("/search", studentController.searchStudents);

// CRUD cơ bản
router.post("/", studentController.createStudent);
router.get("/", studentController.getStudents);
router.get("/:id", validateObjectId, studentController.getStudentById);
router.put("/:id", validateObjectId, studentController.updateStudent);
router.delete("/:id", validateObjectId, studentController.deleteStudent);

// API cập nhật điểm
router.patch("/:id/score", validateObjectId, studentController.updateScore);

module.exports = router;
