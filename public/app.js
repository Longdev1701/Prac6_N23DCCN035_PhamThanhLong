// ============================================
// Student Management System - Frontend JS
// ============================================

const API = "/api/students";

// State
let currentPage = 1;
let currentLimit = 10;
let currentMajor = "";
let searchTimeout = null;

// ============ DOM Elements ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  tableBody: $("#studentTableBody"),
  emptyState: $("#emptyState"),
  pagination: $("#pagination"),
  totalStudents: $("#totalStudents"),
  avgScore: $("#avgScore"),
  searchInput: $("#searchInput"),
  majorFilter: $("#majorFilter"),
  // Student modal
  studentModal: $("#studentModal"),
  modalTitle: $("#modalTitle"),
  studentForm: $("#studentForm"),
  editingId: $("#editingId"),
  btnAddStudent: $("#btnAddStudent"),
  modalClose: $("#modalClose"),
  btnCancel: $("#btnCancel"),
  btnSubmit: $("#btnSubmit"),
  // Score modal
  scoreModal: $("#scoreModal"),
  scoreForm: $("#scoreForm"),
  scoreStudentName: $("#scoreStudentName"),
  inputNewScore: $("#inputNewScore"),
  scoreSlider: $("#scoreSlider"),
  scoreEditingId: $("#scoreEditingId"),
  scoreModalClose: $("#scoreModalClose"),
  scoreCancel: $("#scoreCancel"),
  // Top modal
  topModal: $("#topModal"),
  topStudentsList: $("#topStudentsList"),
  topModalClose: $("#topModalClose"),
  btnTopStudents: $("#btnTopStudents"),
  // Toast
  toastContainer: $("#toastContainer"),
};

// ============ Toast Notifications ============
function showToast(message, type = "success") {
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ""}</span> ${message}`;
  els.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ API Helpers ============
async function apiGet(url) {
  const res = await fetch(url);
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, data: await res.json() };
}

async function apiPut(url, data) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, data: await res.json() };
}

async function apiPatch(url, data) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, data: await res.json() };
}

async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE" });
  return { status: res.status, data: await res.json() };
}

// ============ Render Helpers ============
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getScoreClass(score) {
  if (score < 40) return "score-low";
  if (score < 70) return "score-mid";
  return "score-high";
}

function renderStudentRow(student) {
  const scoreClass = getScoreClass(student.score);
  const statusClass = student.isActive ? "status-active" : "status-inactive";
  const statusText = student.isActive ? "Hoạt động" : "Đã xóa";

  return `
    <tr data-id="${student._id}">
      <td><span class="student-id">${student.studentId}</span></td>
      <td><span class="student-name">${student.name}</span></td>
      <td><span class="student-email">${student.email}</span></td>
      <td>${student.major ? `<span class="badge badge-${student.major}">${student.major}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>
        <div class="score-cell ${scoreClass}">
          <span class="score-value">${student.score}</span>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width:${student.score}%"></div>
          </div>
        </div>
      </td>
      <td style="color:var(--text-secondary)">${formatDate(student.enrollmentDate)}</td>
      <td>
        <span class="status ${statusClass}">
          <span class="status-dot"></span>
          ${statusText}
        </span>
      </td>
      <td>
        <div class="actions-cell">
          <button class="btn-icon edit" title="Sửa" onclick="openEditModal('${student._id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon score" title="Cập nhật điểm" onclick="openScoreModal('${student._id}', '${student.name}', ${student.score})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
          <button class="btn-icon delete" title="Xóa" onclick="deleteStudent('${student._id}', '${student.name}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// ============ Load Students ============
async function loadStudents() {
  try {
    let url = `${API}?page=${currentPage}&limit=${currentLimit}`;
    if (currentMajor) url += `&major=${currentMajor}`;

    const result = await apiGet(url);

    if (result.success) {
      const { students, pagination } = result;

      if (students.length === 0) {
        els.tableBody.innerHTML = "";
        els.emptyState.style.display = "block";
        $(".table thead").style.display = "none";
      } else {
        $(".table thead").style.display = "";
        els.emptyState.style.display = "none";
        els.tableBody.innerHTML = students.map(renderStudentRow).join("");
      }

      els.totalStudents.textContent = pagination.total;
      renderPagination(pagination);
    }
  } catch (err) {
    showToast("Không thể tải danh sách sinh viên", "error");
  }
}

// ============ Load Stats ============
async function loadStats() {
  try {
    const result = await apiGet(`${API}/stats/avg`);
    if (result.success) {
      els.avgScore.textContent = result.data.averageScore;
    }
  } catch (err) {
    console.error("Load stats error:", err);
  }
}

// ============ Pagination ============
function renderPagination(pagination) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) {
    els.pagination.innerHTML = "";
    return;
  }

  let html = `<button ${page <= 1 ? "disabled" : ""} onclick="goToPage(${page - 1})">‹</button>`;

  const range = 2;
  let start = Math.max(1, page - range);
  let end = Math.min(totalPages, page + range);

  if (start > 1) {
    html += `<button onclick="goToPage(1)">1</button>`;
    if (start > 2) html += `<button disabled>…</button>`;
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === page ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (end < totalPages) {
    if (end < totalPages - 1) html += `<button disabled>…</button>`;
    html += `<button onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  html += `<button ${page >= totalPages ? "disabled" : ""} onclick="goToPage(${page + 1})">›</button>`;

  els.pagination.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadStudents();
}

// ============ Search ============
els.searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const q = e.target.value.trim();

  searchTimeout = setTimeout(async () => {
    if (q.length === 0) {
      loadStudents();
      return;
    }

    try {
      const result = await apiGet(`${API}/search?q=${encodeURIComponent(q)}`);
      if (result.success) {
        if (result.data.length === 0) {
          els.tableBody.innerHTML = "";
          els.emptyState.style.display = "block";
          els.emptyState.querySelector("p").textContent = "Không tìm thấy sinh viên nào";
          $(".table thead").style.display = "none";
        } else {
          $(".table thead").style.display = "";
          els.emptyState.style.display = "none";
          els.tableBody.innerHTML = result.data.map(renderStudentRow).join("");
        }
        els.pagination.innerHTML = "";
      }
    } catch (err) {
      showToast("Lỗi tìm kiếm", "error");
    }
  }, 400);
});

// ============ Filter by Major ============
els.majorFilter.addEventListener("change", (e) => {
  currentMajor = e.target.value;
  currentPage = 1;
  loadStudents();
});

// ============ Modal Helpers ============
function openModal(modal) {
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

// Close modals on overlay click
[els.studentModal, els.scoreModal, els.topModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ============ Add/Edit Student Modal ============
els.btnAddStudent.addEventListener("click", () => {
  els.modalTitle.textContent = "Thêm sinh viên mới";
  els.btnSubmit.textContent = "Tạo sinh viên";
  els.studentForm.reset();
  els.editingId.value = "";
  $("#inputEnrollmentDate").value = new Date().toISOString().split("T")[0];
  openModal(els.studentModal);
});

els.modalClose.addEventListener("click", () => closeModal(els.studentModal));
els.btnCancel.addEventListener("click", () => closeModal(els.studentModal));

// Open edit modal
async function openEditModal(id) {
  try {
    const result = await apiGet(`${API}/${id}`);
    if (result.success) {
      const s = result.data;
      els.modalTitle.textContent = "Chỉnh sửa sinh viên";
      els.btnSubmit.textContent = "Cập nhật";
      els.editingId.value = id;
      $("#inputStudentId").value = s.studentId;
      $("#inputName").value = s.name;
      $("#inputEmail").value = s.email;
      $("#inputMajor").value = s.major || "";
      $("#inputScore").value = s.score;
      $("#inputEnrollmentDate").value = s.enrollmentDate
        ? s.enrollmentDate.split("T")[0]
        : "";
      openModal(els.studentModal);
    }
  } catch (err) {
    showToast("Không thể tải thông tin sinh viên", "error");
  }
}

// Submit form (create or update)
els.studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    studentId: $("#inputStudentId").value.trim(),
    name: $("#inputName").value.trim(),
    email: $("#inputEmail").value.trim(),
    major: $("#inputMajor").value || undefined,
    score: Number($("#inputScore").value) || 0,
    enrollmentDate: $("#inputEnrollmentDate").value || undefined,
  };

  const editId = els.editingId.value;

  try {
    let result;
    if (editId) {
      result = await apiPut(`${API}/${editId}`, data);
    } else {
      result = await apiPost(API, data);
    }

    if (result.data.success) {
      showToast(result.data.message);
      closeModal(els.studentModal);
      loadStudents();
      loadStats();
    } else {
      const errMsg =
        result.data.errors?.join(", ") ||
        result.data.message ||
        "Có lỗi xảy ra";
      showToast(errMsg, "error");
    }
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
  }
});

// ============ Delete Student ============
async function deleteStudent(id, name) {
  if (!confirm(`Bạn có chắc muốn xóa sinh viên "${name}"?`)) return;

  try {
    const result = await apiDelete(`${API}/${id}`);
    if (result.data.success) {
      showToast(result.data.message);
      loadStudents();
      loadStats();
    } else {
      showToast(result.data.message || "Lỗi xóa sinh viên", "error");
    }
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
  }
}

// ============ Score Modal ============
function openScoreModal(id, name, currentScore) {
  els.scoreEditingId.value = id;
  els.scoreStudentName.textContent = name;
  els.inputNewScore.value = currentScore;
  els.scoreSlider.value = currentScore;
  openModal(els.scoreModal);
}

els.scoreModalClose.addEventListener("click", () =>
  closeModal(els.scoreModal)
);
els.scoreCancel.addEventListener("click", () => closeModal(els.scoreModal));

// Sync slider and input
els.scoreSlider.addEventListener("input", (e) => {
  els.inputNewScore.value = e.target.value;
});
els.inputNewScore.addEventListener("input", (e) => {
  const val = Math.min(100, Math.max(0, e.target.value));
  els.scoreSlider.value = val;
});

els.scoreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = els.scoreEditingId.value;
  const score = Number(els.inputNewScore.value);

  try {
    const result = await apiPatch(`${API}/${id}/score`, { score });
    if (result.data.success) {
      showToast(result.data.message);
      closeModal(els.scoreModal);
      loadStudents();
      loadStats();
    } else {
      showToast(result.data.message || "Lỗi cập nhật điểm", "error");
    }
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
  }
});

// ============ Top Students ============
els.btnTopStudents.addEventListener("click", async () => {
  try {
    const result = await apiGet(`${API}/top?limit=5`);
    if (result.success && result.data.length > 0) {
      const html = `<ul class="top-list">${result.data
        .map((s, i) => {
          const rankClass =
            i === 0
              ? "rank-1"
              : i === 1
              ? "rank-2"
              : i === 2
              ? "rank-3"
              : "rank-default";
          return `
          <li class="top-item">
            <div class="top-rank ${rankClass}">${i + 1}</div>
            <div class="top-info">
              <div class="top-name">${s.name}</div>
              <div class="top-meta">${s.studentId} • ${s.major || "N/A"}</div>
            </div>
            <div class="top-score">${s.score}</div>
          </li>`;
        })
        .join("")}</ul>`;
      els.topStudentsList.innerHTML = html;
    } else {
      els.topStudentsList.innerHTML =
        '<p style="text-align:center;color:var(--text-muted);padding:20px;">Chưa có dữ liệu</p>';
    }
    openModal(els.topModal);
  } catch (err) {
    showToast("Lỗi tải top sinh viên", "error");
  }
});

els.topModalClose.addEventListener("click", () => closeModal(els.topModal));

// ============ Keyboard shortcuts ============
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    [els.studentModal, els.scoreModal, els.topModal].forEach(closeModal);
  }
});

// ============ Init ============
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  loadStats();
});
