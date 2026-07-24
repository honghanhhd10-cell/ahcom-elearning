/**
 * AHCOM E-Learning Application Controller
 * Handles SPA routing, UI rendering, event bindings, progress tracking, and CSV exports
 */


  // Catch errors globally and display them in the debug console
  window.addEventListener('error', (event) => {
    const consoleEl = document.getElementById('debug-error-console');
    if (consoleEl) {
      consoleEl.style.display = 'block';
      const errDiv = document.createElement('div');
      errDiv.style.marginTop = '8px';
      errDiv.style.borderTop = '1px dashed #ff5555';
      errDiv.style.paddingTop = '4px';
      errDiv.textContent = `Lỗi: ${event.message} tại ${event.filename.split('/').pop()}:${event.lineno}:${event.colno}`;
      consoleEl.appendChild(errDiv);
    }
  });

document.addEventListener('DOMContentLoaded', () => {
  // --- APP STATE ---
  const state = {
    currentUser: null,
    currentView: 'view-login',
    activeCourse: null,
    watchTimer: null,
    slideIndex: 0,
    currentThumbnailBase64: '',
    pendingVideoFile: null,
    pendingPdfFile: null,
    pendingPdfBase64: '',
    viewerOrigin: 'dashboard',
    currentLibraryPdfFile: null,
    currentLibraryPdfBase64: '',
    activeLibraryItem: null,
    // Video length simulation (seconds)
    SIMULATED_VIDEO_DURATION: 300 // 5 minutes
  };

  // --- HTML ELEMENT REFERENCES ---
  const el = {
    // Nav elements
    navbar: document.getElementById('main-navbar'),
    navLogo: document.getElementById('nav-logo-btn'),
    navCourses: document.getElementById('nav-courses-link'),
    navStudentReport: document.getElementById('nav-student-report-link'),
    navLibrary: document.getElementById('nav-library-link'),
    navAdmin: document.getElementById('nav-admin-link'),
    displayUserName: document.getElementById('display-user-name'),
    displayUserRole: document.getElementById('display-user-role'),
    btnLogout: document.getElementById('btn-logout'),

    // Views
    viewLogin: document.getElementById('view-login'),
    viewRegister: document.getElementById('view-register'),
    viewStudentDashboard: document.getElementById('view-student-dashboard'),
    viewStudentReport: document.getElementById('view-student-report'),
    viewStudentLibrary: document.getElementById('view-student-library'),
    viewCourseViewer: document.getElementById('view-course-viewer'),
    viewQuizPanel: document.getElementById('view-quiz-panel'),
    viewAdminDashboard: document.getElementById('view-admin-dashboard'),

    // Forms
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    formQuiz: document.getElementById('form-quiz-questions'),
    formLibraryItemEditor: document.getElementById('form-library-item-editor'),

    // Library elements
    libraryContainer: document.getElementById('library-container'),
    librarySearchInput: document.getElementById('library-search-input'),
    libraryCategoryFilter: document.getElementById('library-category-filter'),
    adminLibraryTableBody: document.getElementById('admin-library-table-body'),
    adminLibraryCategoriesTableBody: document.getElementById('admin-library-categories-table-body'),
    btnAdminAddLibraryItem: document.getElementById('btn-admin-add-library-item'),
    modalLibraryItemEditor: document.getElementById('modal-library-item-editor'),
    btnUploadLibraryPdf: document.getElementById('btn-upload-library-pdf'),
    editorLibraryPdfFileInput: document.getElementById('editor-library-pdf-file-input'),
    editorLibraryPdfFileName: document.getElementById('editor-library-pdf-file-name'),
    btnRemoveLibraryPdfFile: document.getElementById('btn-remove-library-pdf-file'),

    // Inputs
    loginIdentity: document.getElementById('login-identity'),
    loginPassword: document.getElementById('login-password'),
    regFullname: document.getElementById('reg-fullname'),
    regEmpId: document.getElementById('reg-empid'),
    regEmail: document.getElementById('reg-email'),
    regPassword: document.getElementById('reg-password'),
    regCompany: document.getElementById('reg-company'),
    regDept: document.getElementById('reg-department'),
    regJobLevel: document.getElementById('reg-job-level'),

    // Navigation buttons
    goToRegister: document.getElementById('go-to-register-btn'),
    goToLogin: document.getElementById('go-to-login-btn'),
    btnBackToDashboard: document.getElementById('btn-back-to-dashboard'),
    btnStartQuiz: document.getElementById('btn-start-quiz'),
    btnCancelQuiz: document.getElementById('btn-cancel-quiz'),

    // Dynamic containers
    coursesContainer: document.getElementById('courses-container'),
    studentReportTableBody: document.getElementById('student-report-table-body'),
    courseCategoryFilters: document.getElementById('course-category-filters'),
    learningMediaContainer: document.getElementById('learning-media-container'),
    quizQuestionsList: document.getElementById('quiz-questions-list'),
    quizCourseTitle: document.getElementById('quiz-course-title'),
    quizResultContainer: document.getElementById('quiz-result-container'),
    toastContainer: document.getElementById('toast-container'),

    // Viewer Meta Details
    viewerCourseTitle: document.getElementById('viewer-course-title'),
    viewerMetaCategory: document.getElementById('viewer-meta-category'),
    viewerMetaType: document.getElementById('viewer-meta-type'),
    viewerMetaWatchTime: document.getElementById('viewer-meta-watchtime'),
    viewerMetaStatus: document.getElementById('viewer-meta-status'),

    // Admin elements
    statTotalStudents: document.getElementById('stat-total-students'),
    statTotalCourses: document.getElementById('stat-total-courses'),
    statCompletedLessons: document.getElementById('stat-completed-lessons'),
    statPassedQuizzes: document.getElementById('stat-passed-quizzes'),
    adminSearchInput: document.getElementById('admin-search-input'),
    adminCompanyFilter: document.getElementById('admin-company-filter'),
    adminDeptFilter: document.getElementById('admin-dept-filter'),
    adminTableBody: document.getElementById('admin-analytics-table-body'),
    btnExportCSV: document.getElementById('btn-export-csv'),

    // Admin course configuration elements
    btnTabAnalytics: document.getElementById('btn-tab-analytics'),
    btnTabCourses: document.getElementById('btn-tab-courses'),
    tabContentAnalytics: document.getElementById('tab-content-analytics'),
    tabContentCourses: document.getElementById('tab-content-courses'),
    adminCoursesTableBody: document.getElementById('admin-courses-table-body'),
    btnAddNewCourse: document.getElementById('btn-add-new-course'),

    // Admin whitelist configuration elements
    btnTabWhitelist: document.getElementById('btn-tab-whitelist'),
    tabContentWhitelist: document.getElementById('tab-content-whitelist'),
    formAddWhitelist: document.getElementById('form-add-whitelist'),
    whitelistEmpIdInput: document.getElementById('whitelist-empid-input'),
    whitelistCompanySelect: document.getElementById('whitelist-company-select'),
    whitelistDeptSelect: document.getElementById('whitelist-dept-select'),
    whitelistCountBadge: document.getElementById('whitelist-count-badge'),
    adminWhitelistTableBody: document.getElementById('admin-whitelist-table-body'),
    btnImportWhitelistFile: document.getElementById('btn-import-whitelist-file'),
    whitelistFileInput: document.getElementById('whitelist-file-input'),

    // Admin department configuration elements
    btnTabDepartments: document.getElementById('btn-tab-departments'),
    tabContentDepartments: document.getElementById('tab-content-departments'),
    formAddDepartment: document.getElementById('form-add-department'),
    departmentNameInput: document.getElementById('department-name-input'),
    departmentCompanySelect: document.getElementById('department-company-select'),
    departmentsCountBadge: document.getElementById('departments-count-badge'),
    adminDepartmentsTableBody: document.getElementById('admin-departments-table-body'),

    // Admin company configuration elements
    btnTabCompanies: document.getElementById('btn-tab-companies'),
    tabContentCompanies: document.getElementById('tab-content-companies'),
    formAddCompany: document.getElementById('form-add-company'),
    companyNameInput: document.getElementById('company-name-input'),
    companiesCountBadge: document.getElementById('companies-count-badge'),
    adminCompaniesTableBody: document.getElementById('admin-companies-table-body'),

    // Modal elements
    modalCourseEditor: document.getElementById('modal-course-editor'),
    btnCloseCourseModal: document.getElementById('btn-close-course-modal'),
    btnCancelCourseModal: document.getElementById('btn-cancel-course-modal'),
    formCourseEditor: document.getElementById('form-course-editor'),
    editorCourseId: document.getElementById('editor-course-id'),
    editorTitle: document.getElementById('editor-title'),
    editorCategory: document.getElementById('editor-category'),
    editorContentType: document.getElementById('editor-content-type'),
    editorTargetGroup: document.getElementById('editor-target-group'),
    editorIsHidden: document.getElementById('editor-is-hidden'),
    editorScopeCompany: document.getElementById('editor-scope-company'),
    editorScopeDepartment: document.getElementById('editor-scope-department'),
    editorGroupSlideSource: document.getElementById('editor-group-slide-source'),
    editorSlideSource: document.getElementById('editor-slide-source'),
    editorGroupVideoUrl: document.getElementById('editor-group-video-url'),
    editorVideoUrl: document.getElementById('editor-video-url'),
    editorVideoFileInput: document.getElementById('editor-video-file-input'),
    btnUploadVideo: document.getElementById('btn-upload-video'),
    editorVideoFileName: document.getElementById('editor-video-file-name'),
    btnRemoveVideoFile: document.getElementById('btn-remove-video-file'),
    editorGroupSlideUrl: document.getElementById('editor-group-slide-url'),
    editorSlideUrl: document.getElementById('editor-slide-url'),
    editorPdfFileInput: document.getElementById('editor-pdf-file-input'),
    btnUploadPdf: document.getElementById('btn-upload-pdf'),
    editorPdfFileName: document.getElementById('editor-pdf-file-name'),
    btnRemovePdfFile: document.getElementById('btn-remove-pdf-file'),
    editorThumbnailInput: document.getElementById('editor-thumbnail-input'),
    btnUploadThumbnail: document.getElementById('btn-upload-thumbnail'),
    btnRemoveThumbnail: document.getElementById('btn-remove-thumbnail'),
    editorThumbnailPreview: document.getElementById('editor-thumbnail-preview'),
    editorThumbnailPlaceholder: document.getElementById('editor-thumbnail-placeholder'),
    editorGroupSlides: document.getElementById('editor-group-slides'),
    btnEditorAddSlide: document.getElementById('btn-editor-add-slide'),
    editorSlidesList: document.getElementById('editor-slides-list'),
    btnEditorAddQuestion: document.getElementById('btn-editor-add-question'),
    editorQuestionsList: document.getElementById('editor-questions-list'),

    // User editor modal references
    modalUserEditor: document.getElementById('modal-user-editor'),
    btnCloseUserModal: document.getElementById('btn-close-user-modal'),
    btnCancelUserModal: document.getElementById('btn-cancel-user-modal'),
    formUserEditor: document.getElementById('form-user-editor'),
    editorUserId: document.getElementById('editor-user-id'),
    editorUserFullname: document.getElementById('editor-user-fullname'),
    editorUserEmpId: document.getElementById('editor-user-empid'),
    editorUserEmail: document.getElementById('editor-user-email'),
    editorUserCompany: document.getElementById('editor-user-company'),
    editorUserDept: document.getElementById('editor-user-dept'),
    editorUserJobLevel: document.getElementById('editor-user-joblevel'),
    editorUserRole: document.getElementById('editor-user-role'),
    editorUserPassword: document.getElementById('editor-user-password'),

    // Profile editor modal references
    btnNavProfile: document.getElementById('btn-nav-profile'),
    btnUserBadgeProfile: document.getElementById('btn-user-badge-profile'),
    modalProfileEditor: document.getElementById('modal-profile-editor'),
    btnCloseProfileModal: document.getElementById('btn-close-profile-modal'),
    btnCancelProfileModal: document.getElementById('btn-cancel-profile-modal'),
    formProfileEditor: document.getElementById('form-profile-editor'),
    profileFullname: document.getElementById('profile-fullname'),
    profileEmpId: document.getElementById('profile-empid'),
    profileEmail: document.getElementById('profile-email'),
    profileCompany: document.getElementById('profile-company'),
    profileDept: document.getElementById('profile-dept'),
    profileJobLevel: document.getElementById('profile-joblevel'),
    profilePassword: document.getElementById('profile-password'),

    // Department editor modal references
    modalDeptEditor: document.getElementById('modal-dept-editor'),
    btnCloseDeptModal: document.getElementById('btn-close-dept-modal'),
    btnCancelDeptModal: document.getElementById('btn-cancel-dept-modal'),
    formDeptEditor: document.getElementById('form-dept-editor'),
    editorDeptOldName: document.getElementById('editor-dept-old-name'),
    editorDeptOldCompany: document.getElementById('editor-dept-old-company'),
    editorDeptName: document.getElementById('editor-dept-name'),
    editorDeptCompany: document.getElementById('editor-dept-company'),

    // Category management references
    btnTabCategories: document.getElementById('btn-tab-categories'),
    tabContentCategories: document.getElementById('tab-content-categories'),
    formAddCategory: document.getElementById('form-add-category'),
    categoryNameInput: document.getElementById('category-name-input'),
    adminCategoriesTableBody: document.getElementById('admin-categories-table-body'),
    categoriesCountBadge: document.getElementById('categories-count-badge'),

    // Library tab references
    btnTabLibrary: document.getElementById('btn-tab-library'),
    btnTabLibraryCategories: document.getElementById('btn-tab-library-categories'),
    tabContentLibrary: document.getElementById('tab-content-library'),
    tabContentLibraryCategories: document.getElementById('tab-content-library-categories'),
    formAdminAddLibraryCategory: document.getElementById('form-admin-add-library-category'),
    libraryCategoryNameInput: document.getElementById('library-category-name-input'),
    libraryCategoriesCountBadge: document.getElementById('library-categories-count-badge'),
    editorLibraryTitle: document.getElementById('editor-library-title'),
    editorLibraryCategory: document.getElementById('editor-library-category'),
    editorLibraryContentType: document.getElementById('editor-library-content-type'),
    editorLibraryTargetGroup: document.getElementById('editor-library-target-group'),
    editorLibraryIsHidden: document.getElementById('editor-library-is-hidden'),
    editorLibraryScopeCompany: document.getElementById('editor-library-scope-company'),
    editorLibraryScopeDepartment: document.getElementById('editor-library-scope-department'),
    editorLibraryContentUrl: document.getElementById('editor-library-content-url'),
    editorLibraryItemId: document.getElementById('editor-library-item-id')
  };

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '<i class="fa-solid fa-circle-check" style="color: var(--success);"></i>';
    if (type === 'danger') {
      icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--danger);"></i>';
    } else if (type === 'warning') {
      icon = '<i class="fa-solid fa-circle-info" style="color: var(--warning);"></i>';
    }

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon}
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close">&times;</button>
    `;

    el.toastContainer.appendChild(toast);

    // Bind close click
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    // Auto remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // --- ROUTER / VIEW CONTROLLER ---
  function showView(viewId) {
    // Clear active media tracking if leaving course viewer
    if (state.currentView === 'view-course-viewer' && viewId !== 'view-quiz-panel') {
      stopProgressTracking();
      if (state.activeLocalVideoUrl) {
        URL.revokeObjectURL(state.activeLocalVideoUrl);
        state.activeLocalVideoUrl = null;
      }
    }

    // Hide all view panels
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(p => p.classList.remove('active'));

    // Show selected panel
    const targetPanel = document.getElementById(viewId);
    if (targetPanel) {
      targetPanel.classList.add('active');
      state.currentView = viewId;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update Navbar Menu highlights and visibility
    if (state.currentUser) {
      el.navbar.style.display = 'block';
      el.displayUserName.textContent = state.currentUser.FullName;
      
      const role = state.currentUser.Role;
      const isAdmin = role === 'SuperAdmin' || role === 'CompanyAdmin' || role === 'DeptAdmin' || role === 'Admin';

      let roleText = 'Học viên';
      if (role === 'SuperAdmin') roleText = 'Admin Tổng';
      else if (role === 'CompanyAdmin') roleText = 'Admin Công ty';
      else if (role === 'DeptAdmin') roleText = 'Admin Phòng ban';
      
      el.displayUserRole.textContent = `${state.currentUser.Company || 'AHCOM Tổng'} / ${state.currentUser.Department || 'Ban Giám Đốc'} (${roleText})`;

      // Reset nav link active states
      el.navCourses.classList.remove('active');
      if (el.navStudentReport) el.navStudentReport.classList.remove('active');
      if (el.navLibrary) el.navLibrary.classList.remove('active');
      el.navAdmin.classList.remove('active');

      el.navCourses.style.display = 'inline-flex';
      if (el.navStudentReport) el.navStudentReport.style.display = 'inline-flex';
      if (el.navLibrary) el.navLibrary.style.display = 'inline-flex';

      if (isAdmin) {
        el.navAdmin.style.display = 'inline-flex';
      } else {
        el.navAdmin.style.display = 'none';
      }

      if (viewId === 'view-admin-dashboard') {
        el.navAdmin.classList.add('active');
      } else if (viewId === 'view-student-dashboard' || viewId === 'view-course-viewer' || viewId === 'view-quiz-panel') {
        el.navCourses.classList.add('active');
      } else if (viewId === 'view-student-report') {
        if (el.navStudentReport) el.navStudentReport.classList.add('active');
      } else if (viewId === 'view-student-library') {
        if (el.navLibrary) el.navLibrary.classList.add('active');
      }
    } else {
      el.navbar.style.display = 'none';
    }
  }

  // --- AUTHENTICATION ACTIONS ---
  
  // Toggle Login Password Show/Hide
  const btnToggleLoginPassword = document.getElementById('btn-toggle-login-password');
  if (btnToggleLoginPassword) {
    btnToggleLoginPassword.addEventListener('click', () => {
      const passwordInput = document.getElementById('login-password');
      const icon = btnToggleLoginPassword.querySelector('i');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // Toggle Register Password Show/Hide
  const btnToggleRegPassword = document.getElementById('btn-toggle-reg-password');
  if (btnToggleRegPassword) {
    btnToggleRegPassword.addEventListener('click', () => {
      const passwordInput = document.getElementById('reg-password');
      const icon = btnToggleRegPassword.querySelector('i');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // Toggle Register Confirm Password Show/Hide
  const btnToggleRegConfirmPassword = document.getElementById('btn-toggle-reg-confirm-password');
  if (btnToggleRegConfirmPassword) {
    btnToggleRegConfirmPassword.addEventListener('click', () => {
      const passwordInput = document.getElementById('reg-confirm-password');
      const icon = btnToggleRegConfirmPassword.querySelector('i');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // Submit Login
  el.formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identity = el.loginIdentity.value;
    const password = el.loginPassword.value;

    const result = await window.ahcomDB.loginUser(identity, password);

    if (result.success) {
      state.currentUser = result.user;
      sessionStorage.setItem('ahcom_session', JSON.stringify(result.user));
      showToast(`Đăng nhập thành công! Chào mừng ${result.user.FullName}.`, 'success');

      // Routing logic based on Role
      const role = result.user.Role;
      const isAdmin = role === 'SuperAdmin' || role === 'CompanyAdmin' || role === 'DeptAdmin' || role === 'Admin';
      if (isAdmin) {
        await renderAdminDashboard();
        showView('view-admin-dashboard');
      } else {
        await renderStudentDashboard();
        showView('view-student-dashboard');
      }

      // Reset form
      el.formLogin.reset();
    } else {
      showToast(result.message, 'danger');
    }
  });

  // Submit Registration
  el.formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = el.regFullname.value;
    const empId = el.regEmpId.value;
    const email = el.regEmail.value;
    const password = el.regPassword.value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const company = el.regCompany.value;
    const department = el.regDept.value;
    const jobLevel = el.regJobLevel.value;

    if (!company) {
      showToast('Vui lòng chọn Công ty thành viên.', 'danger');
      return;
    }

    if (!department) {
      showToast('Vui lòng chọn Phòng ban làm việc.', 'danger');
      return;
    }

    if (!jobLevel) {
      showToast('Vui lòng chọn Chức vụ của bạn.', 'danger');
      return;
    }

    if (password.length < 6) {
      showToast('Mật khẩu phải chứa ít nhất 6 ký tự.', 'danger');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Mật khẩu và xác nhận mật khẩu không khớp.', 'danger');
      return;
    }

    const result = await window.ahcomDB.registerUser(fullName, empId, email, password, department, jobLevel, company);

    if (result.success) {
      showToast('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.', 'success');
      showView('view-login');
      el.formRegister.reset();
    } else {
      showToast(result.message, 'danger');
    }
  });

  // Auth View Switching Links
  el.goToRegister.addEventListener('click', () => showView('view-register'));
  el.goToLogin.addEventListener('click', () => showView('view-login'));

  // Go to Forgot Password
  const goToForgotPasswordBtn = document.getElementById('go-to-forgot-password-btn');
  if (goToForgotPasswordBtn) {
    goToForgotPasswordBtn.addEventListener('click', () => {
      showView('view-forgot-password');
      const formVerify = document.getElementById('form-forgot-verify');
      const formReset = document.getElementById('form-forgot-reset');
      if (formVerify) formVerify.reset();
      if (formReset) formReset.reset();
      if (formVerify) formVerify.style.display = 'block';
      if (formReset) formReset.style.display = 'none';
      state.activeResetUserId = null;
    });
  }

  // Forgot Password back to Login
  const forgotBackToLoginBtn = document.getElementById('forgot-back-to-login-btn');
  if (forgotBackToLoginBtn) {
    forgotBackToLoginBtn.addEventListener('click', () => showView('view-login'));
  }

  // Toggle Forgot Passwords Show/Hide
  const btnToggleForgot = document.getElementById('btn-toggle-forgot-password');
  if (btnToggleForgot) {
    btnToggleForgot.addEventListener('click', () => {
      const input = document.getElementById('forgot-new-password');
      const icon = btnToggleForgot.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  const btnToggleForgotConfirm = document.getElementById('btn-toggle-forgot-confirm-password');
  if (btnToggleForgotConfirm) {
    btnToggleForgotConfirm.addEventListener('click', () => {
      const input = document.getElementById('forgot-confirm-password');
      const icon = btnToggleForgotConfirm.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // Forgot Password: Step 1 (Verify User)
  const formForgotVerify = document.getElementById('form-forgot-verify');
  if (formForgotVerify) {
    formForgotVerify.addEventListener('submit', async (e) => {
      e.preventDefault();
      const empId = document.getElementById('forgot-empid').value;
      const email = document.getElementById('forgot-email').value;

      const result = await window.ahcomDB.verifyUserIdentity(empId, email);
      if (result.success) {
        state.activeResetUserId = result.userId;
        document.getElementById('form-forgot-verify').style.display = 'none';
        document.getElementById('form-forgot-reset').style.display = 'block';
      } else {
        showToast(result.message, 'danger');
      }
    });
  }

  // Forgot Password: Step 2 (Reset Password)
  const formForgotReset = document.getElementById('form-forgot-reset');
  if (formForgotReset) {
    formForgotReset.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('forgot-new-password').value;
      const confirmPassword = document.getElementById('forgot-confirm-password').value;

      if (!state.activeResetUserId) {
        showToast('Phiên làm việc không hợp lệ. Vui lòng xác thực lại tài khoản.', 'danger');
        return;
      }

      if (newPassword.length < 6) {
        showToast('Mật khẩu mới phải chứa ít nhất 6 ký tự.', 'danger');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('Mật khẩu và xác nhận mật khẩu không trùng khớp.', 'danger');
        return;
      }

      const result = await window.ahcomDB.resetUserPassword(state.activeResetUserId, newPassword);
      if (result.success) {
        showToast('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.', 'success');
        showView('view-login');
        state.activeResetUserId = null;
      } else {
        showToast(result.message, 'danger', 'danger');
      }
    });
  }

  // Logout
  el.btnLogout.addEventListener('click', () => {
    if (state.watchTimer) {
      clearInterval(state.watchTimer);
      state.watchTimer = null;
    }
    state.currentUser = null;
    sessionStorage.removeItem('ahcom_session');
    showToast('Bạn đã đăng xuất khỏi hệ thống.', 'warning');
    showView('view-login');
  });

  // Navbar brand / logo click handler
  el.navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.currentUser) {
      renderStudentDashboard();
      showView('view-student-dashboard');
    }
  });

  el.navCourses.addEventListener('click', (e) => {
    e.preventDefault();
    renderStudentDashboard();
    showView('view-student-dashboard');
  });

  el.navAdmin.addEventListener('click', (e) => {
    e.preventDefault();
    renderAdminDashboard();
    showView('view-admin-dashboard');
  });

  if (el.navStudentReport) {
    el.navStudentReport.addEventListener('click', (e) => {
      e.preventDefault();
      renderStudentReport();
      showView('view-student-report');
    });
  }

  if (el.navLibrary) {
    el.navLibrary.addEventListener('click', (e) => {
      e.preventDefault();
      renderStudentLibrary();
      showView('view-student-library');
    });
  }

  // Helper to resolve course thumbnail image (checks database ThumbnailURL, then YouTube auto-thumbnail)
  function resolveCourseThumbnail(course) {
    if (course.ThumbnailURL) {
      return `<img src="${course.ThumbnailURL}" alt="${course.Title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;">`;
    }
    // Check for YouTube video link to auto-extract thumbnail
    if (course.ContentType === 'Video' && course.ContentURL) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = course.ContentURL.match(regExp);
      if (match && match[2].length === 11) {
        const videoId = match[2];
        return `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${course.Title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;">`;
      }
    }
    return '';
  }

  // --- STUDENT DASHBOARD RENDERING ---
  async function renderStudentDashboard() {
    try {
      // Set welcome text
      document.getElementById('student-welcome-title').innerHTML = `Xin chào, ${state.currentUser.FullName}! <span style="font-weight:400; font-size:16px; color:var(--text-muted); display:inline-block; margin-left:8px;">(${state.currentUser.Company || 'AHCOM Tổng'} - ${state.currentUser.Department})</span>`;
      
      await renderCategoryFilters();
      const courses = await window.ahcomDB.getCourses();
      const progressList = await window.ahcomDB.getUserProgress(state.currentUser.UserID);
      const quizResults = await window.ahcomDB.getUserQuizResults(state.currentUser.UserID);

      // Get active filter
      const activeFilterBtn = el.courseCategoryFilters.querySelector('.filter-btn.active');
      const selectedCategory = activeFilterBtn ? activeFilterBtn.dataset.category : 'all';

      el.coursesContainer.innerHTML = '';

      // Multi-tenant course scoping
      let filteredCourses = courses;
      if (state.currentUser.Role !== 'SuperAdmin') {
        const userCompany = state.currentUser.Company || 'AHCOM Tổng';
        const userDept = state.currentUser.Department || 'Ban Giám Đốc';

        filteredCourses = courses.filter(course => {
          const compMatch = course.ScopeCompany === 'All' || course.ScopeCompany === userCompany;
          const deptMatch = course.ScopeDepartment === 'All' || course.ScopeDepartment === userDept;
          return compMatch && deptMatch;
        });
      }

      // Always hide courses where IsHidden / is_hidden is true on Student Learning Dashboard
      filteredCourses = filteredCourses.filter(course => {
        const isHidden = course.IsHidden === true || course.is_hidden === true || String(course.IsHidden) === 'true' || String(course.is_hidden) === 'true';
        return !isHidden;
      });

      if (selectedCategory !== 'all') {
        filteredCourses = filteredCourses.filter(c => c.Category === selectedCategory);
      }

      if (filteredCourses.length === 0) {
        el.coursesContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <i class="fa-solid fa-folder-open" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
            <p>Không có khóa học nào thuộc chuyên mục này.</p>
          </div>
        `;
        return;
      }

      filteredCourses.forEach(course => {
        const progress = progressList.find(p => p.CourseID === course.CourseID);
        const quiz = quizResults.find(q => q.CourseID === course.CourseID);

        // Calculate progress percentage
        let percentage = 0;
        if (progress) {
          if (progress.IsCompleted) {
            percentage = 100;
          } else {
            if (course.ContentType === 'Video') {
              percentage = Math.min(95, Math.round((progress.WatchTimeSeconds / state.SIMULATED_VIDEO_DURATION) * 100));
            } else if (course.ContentType === 'Slide' && course.Slides) {
              // Estimate based on slide index equivalent stored in watch seconds
              const slideEstimate = Math.round((progress.WatchTimeSeconds / 300) * 100);
              percentage = Math.min(95, slideEstimate);
            }
          }
        }

        // Quiz badge representation
        let quizBadge = '';
        if (quiz) {
          const statusClass = quiz.Status === 'Passed' ? 'passed' : 'failed';
          const statusText = quiz.Status === 'Passed' ? 'Thi Đạt' : 'Thi Chưa Đạt';
          quizBadge = `<span class="badge-status ${statusClass}" style="margin-left: 8px;">${statusText} (${quiz.Score}/${quiz.TotalQuestions})</span>`;
        }

        // Format category label
        let categoryName = course.Category || 'Khóa học';

        // Check access restrictions (RBAC)
        const userRole = state.currentUser.Role;
        const userJobLevel = state.currentUser.JobLevel || 'Staff';
        const courseTarget = course.TargetGroup || 'All';

        let isRestricted = false;
        let restrictionReason = '';

        if (userRole !== 'Admin') {
          if (courseTarget === 'Manager' && userJobLevel !== 'Manager') {
            isRestricted = true;
            restrictionReason = 'Chỉ dành cho Quản lý';
          } else if (courseTarget === 'Staff' && userJobLevel !== 'Staff') {
            isRestricted = true;
            restrictionReason = 'Chỉ dành cho Nhân viên';
          }
        }

        const card = document.createElement('div');
        card.className = 'course-card';
        if (isRestricted) {
          card.classList.add('course-card-locked');
          card.style.opacity = '0.8';
        }

        const lockOverlay = isRestricted 
          ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(1px); z-index: 2;"><div style="background: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);"><i class="fa-solid fa-lock" style="color: var(--primary); font-size: 18px;"></i></div></div>` 
          : '';

        const thumbnailImg = resolveCourseThumbnail(course);
        const isCustomThumbnail = thumbnailImg !== '';

        card.innerHTML = `
          <div class="course-thumbnail" style="position: relative;">
            <span class="course-tag" style="z-index: 3;">${course.Category}</span>
            ${thumbnailImg}
            ${course.ContentType === 'Video' 
              ? `<i class="fa-regular fa-circle-play course-video-icon" style="${isCustomThumbnail ? 'position: relative; z-index: 2; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.6); opacity: 0.95;' : ''}"></i>` 
              : `<i class="fa-regular fa-file-powerpoint course-slide-icon" style="${isCustomThumbnail ? 'position: relative; z-index: 2; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.6); opacity: 0.95;' : ''}"></i>`}
            ${lockOverlay}
          </div>
          <div class="course-card-content">
            <h3 class="course-title" title="${course.Title}">${course.Title}</h3>
            
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
              <span><i class="fa-solid fa-layer-group"></i> ${categoryName}</span>
              ${quizBadge}
            </div>

            ${isRestricted ? `
              <div style="font-size: 12px; color: var(--primary); font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-minus"></i> Hạn chế: ${restrictionReason}
              </div>
            ` : ''}

            <div class="course-progress-container" style="${isRestricted ? 'opacity: 0.5;' : ''}">
              <div class="course-progress-labels">
                <span>Tiến độ học</span>
                <span>${percentage}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
              </div>
            </div>

            <div class="course-card-footer">
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
                ${course.ContentType === 'Video' ? '<i class="fa-solid fa-video"></i> Video' : '<i class="fa-solid fa-circle-chevron-right"></i> Tài liệu Slide'}
              </span>
              ${isRestricted ? `
                <button class="btn btn-secondary btn-study-now" disabled style="cursor: not-allowed; background: var(--gray-light); color: var(--text-muted); border: 1px solid var(--border-color); font-size:12px;">
                  <i class="fa-solid fa-lock"></i> Đã khóa
                </button>
              ` : `
                <button class="btn btn-primary btn-study-now" data-id="${course.CourseID}">
                  ${percentage > 0 ? 'Tiếp tục học' : 'Bắt đầu học'} <i class="fa-solid fa-chevron-right" style="font-size:10px;"></i>
                </button>
              `}
            </div>
          </div>
        `;

        if (!isRestricted) {
          // Bind study button only if not restricted
          card.querySelector('.btn-study-now').addEventListener('click', () => {
            loadCourseViewer(course);
          });
        }

        el.coursesContainer.appendChild(card);
      });
    } catch (err) {
      console.error("Lỗi renderStudentDashboard:", err);
      showToast('Lỗi tải dữ liệu học tập: ' + err.message, 'danger');
    }
  }

  // --- PERSONAL STUDENT REPORT RENDERING ---
  async function renderStudentReport() {
    try {
      const courses = await window.ahcomDB.getCourses();
      const progressList = await window.ahcomDB.getUserProgress(state.currentUser.UserID);
      const quizResults = await window.ahcomDB.getUserQuizResults(state.currentUser.UserID);

      // Filter courses visible to the user
      let userCourses = courses;
      if (state.currentUser.Role !== 'SuperAdmin') {
        const userCompany = state.currentUser.Company || 'AHCOM Tổng';
        const userDept = state.currentUser.Department || 'Ban Giám Đốc';
        userCourses = courses.filter(course => {
          const compMatch = course.ScopeCompany === 'All' || course.ScopeCompany === userCompany;
          const deptMatch = course.ScopeDepartment === 'All' || course.ScopeDepartment === userDept;
          return compMatch && deptMatch;
        });
      }

      // Filter out hidden courses
      userCourses = userCourses.filter(course => {
        const isHidden = course.IsHidden === true || course.is_hidden === true || String(course.IsHidden) === 'true' || String(course.is_hidden) === 'true';
        return !isHidden;
      });

      // 1. Calculate Summary Stats
      let completedCount = 0;
      let totalSeconds = 0;
      let passedQuizzes = 0;
      let quizPercentageSum = 0;
      let quizCount = 0;

      // Track the best quiz attempt per course for statistics
      const bestQuizzes = {};
      quizResults.forEach(q => {
        const key = q.CourseID;
        const currentPercentage = q.Score / q.TotalQuestions;
        if (!bestQuizzes[key] || (currentPercentage > bestQuizzes[key].Score / bestQuizzes[key].TotalQuestions)) {
          bestQuizzes[key] = q;
        }
      });

      // Summarize stats
      progressList.forEach(p => {
        if (p.IsCompleted) {
          completedCount++;
        }
        totalSeconds += (p.WatchTimeSeconds || 0);
      });

      Object.keys(bestQuizzes).forEach(key => {
        const q = bestQuizzes[key];
        if (q.Status === 'Passed' || q.Status === 'Đạt') {
          passedQuizzes++;
        }
        quizPercentageSum += (q.Score / q.TotalQuestions) * 100;
        quizCount++;
      });

      const avgScore = quizCount > 0 ? Math.round(quizPercentageSum / quizCount) : 0;

      // Update Stat DOM elements
      document.getElementById('student-stat-completed').textContent = completedCount;
      document.getElementById('student-stat-time').textContent = window.ahcomDB.formatWatchTime(totalSeconds);
      document.getElementById('student-stat-passed').textContent = passedQuizzes;
      document.getElementById('student-stat-avg-score').textContent = `${avgScore}%`;

      // 2. Render Table Rows
      el.studentReportTableBody.innerHTML = '';

      if (userCourses.length === 0) {
        el.studentReportTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
              <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 12px;"></i>
              <p>Bạn chưa được gán hoặc chưa có khóa học nào.</p>
            </td>
          </tr>
        `;
        return;
      }

      userCourses.forEach(course => {
        const progress = progressList.find(p => p.CourseID === course.CourseID);
        const quiz = bestQuizzes[course.CourseID];

        // Format watch time
        let watchTimeText = '0 phút';
        let percentage = 0;
        if (progress) {
          watchTimeText = window.ahcomDB.formatWatchTime(progress.WatchTimeSeconds);
          if (progress.IsCompleted) {
            percentage = 100;
          } else {
            if (course.ContentType === 'Video') {
              percentage = Math.min(95, Math.round((progress.WatchTimeSeconds / state.SIMULATED_VIDEO_DURATION) * 100));
            } else if (course.ContentType === 'Slide' && course.Slides) {
              const slideEstimate = Math.round((progress.WatchTimeSeconds / 300) * 100);
              percentage = Math.min(95, slideEstimate);
            }
          }
        }

        // Format quiz result representation
        let quizStatusHTML = '<span class="badge-status" style="background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB;"><i class="fa-regular fa-circle-question"></i> Chưa thi</span>';
        if (quiz) {
          const isPassed = quiz.Status === 'Passed' || quiz.Status === 'Đạt';
          const statusClass = isPassed ? 'passed' : 'failed';
          const statusText = isPassed ? 'Đạt' : 'Chưa Đạt';
          quizStatusHTML = `<span class="badge-status ${statusClass}"><i class="fa-solid ${isPassed ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> ${statusText} (${quiz.Score}/${quiz.TotalQuestions})</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div style="font-weight: 600; color: var(--text-dark);">${course.Title}</div>
          </td>
          <td><span class="badge-category">${course.Category || 'Khóa học'}</span></td>
          <td>
            <span style="font-size: 13px;">
              ${course.ContentType === 'Video' ? '<i class="fa-solid fa-video" style="color: var(--primary);"></i> Video' : '<i class="fa-solid fa-file-powerpoint" style="color: var(--secondary);"></i> Slide'}
            </span>
          </td>
          <td>${watchTimeText}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="progress-bar-bg" style="width: 60px; height: 6px; margin-bottom: 0;">
                <div class="progress-bar-fill" style="width: ${percentage}%; height: 100%;"></div>
              </div>
              <span style="font-size: 12px; font-weight: 600; color: var(--text-dark);">${percentage}%</span>
            </div>
          </td>
          <td>${quizStatusHTML}</td>
        `;

        el.studentReportTableBody.appendChild(tr);
      });

    } catch (err) {
      console.error("Lỗi renderStudentReport:", err);
      showToast('Lỗi tải báo cáo cá nhân: ' + err.message, 'danger');
    }
  }

  // --- STUDENT LIBRARY VIEW RENDERING ---
  async function renderStudentLibrary() {
    try {
      const items = await window.ahcomDB.getLibraryItems();
      const categories = await window.ahcomDB.getLibraryCategories();

      // Populate student view category filter select element
      const filterSelect = el.libraryCategoryFilter;
      const currentSelectedFilter = filterSelect.value || 'all';
      filterSelect.innerHTML = '<option value="all">Tất cả Chuyên mục</option>';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        if (cat === currentSelectedFilter) opt.selected = true;
        filterSelect.appendChild(opt);
      });

      // Filter visible items based on RBAC rules (ScopeCompany, ScopeDepartment, TargetGroup)
      let visibleItems = items;
      if (state.currentUser.Role !== 'SuperAdmin') {
        const userCompany = state.currentUser.Company || 'AHCOM Tổng';
        const userDept = state.currentUser.Department || 'Ban Giám Đốc';
        const userJobLevel = state.currentUser.JobLevel || 'Staff'; // 'Staff' or 'Manager'

        visibleItems = items.filter(item => {
          // Company Scope Match
          const compMatch = item.ScopeCompany === 'All' || item.ScopeCompany === userCompany;
          // Department Scope Match
          const deptMatch = item.ScopeDepartment === 'All' || item.ScopeDepartment === userDept;
          // Target Group Match
          const groupMatch = item.TargetGroup === 'All' || item.TargetGroup === userJobLevel;

          return compMatch && deptMatch && groupMatch;
        });
      }

      // Filter out hidden items
      visibleItems = visibleItems.filter(item => !item.IsHidden);

      // Search Filter
      const searchText = (el.librarySearchInput.value || '').trim().toLowerCase();
      if (searchText) {
        visibleItems = visibleItems.filter(item => item.Title.toLowerCase().includes(searchText));
      }

      // Category Filter Select
      const selectedCategory = filterSelect.value || 'all';
      if (selectedCategory !== 'all') {
        visibleItems = visibleItems.filter(item => item.Category === selectedCategory);
      }

      // Render Library Items Grid
      el.libraryContainer.innerHTML = '';

      if (visibleItems.length === 0) {
        el.libraryContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 48px; margin-bottom: 16px; color: var(--text-muted);"></i>
            <h3 style="font-size: 18px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">Không tìm thấy tài liệu nào</h3>
            <p>Vui lòng thử từ khóa khác hoặc liên hệ Admin.</p>
          </div>
        `;
        return;
      }

      visibleItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';

        // Resolve thumbnail
        let thumbnailHTML = `<i class="fa-solid fa-file-invoice" style="font-size: 40px; color: var(--primary);"></i>`;
        if (item.ThumbnailURL) {
          thumbnailHTML = `<img src="${item.ThumbnailURL}" alt="${item.Title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;">`;
        } else if (item.ContentType === 'Video') {
          // Attempt YouTube thumbnail
          if (item.ContentURL) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = item.ContentURL.match(regExp);
            if (match && match[2].length === 11) {
              const youtubeId = match[2];
              thumbnailHTML = `<img src="https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg" alt="${item.Title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;">`;
            } else {
              thumbnailHTML = `<i class="fa-solid fa-video" style="font-size: 40px; color: var(--primary);"></i>`;
            }
          }
        } else {
          thumbnailHTML = `<i class="fa-solid fa-file-pdf" style="font-size: 40px; color: var(--secondary);"></i>`;
        }

        card.innerHTML = `
          <div style="position: relative; aspect-ratio: 16 / 9; background-color: #F3F4F6; border-radius: var(--radius-md) var(--radius-md) 0 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            ${thumbnailHTML}
            <span class="course-tag" style="position: absolute; top: 12px; left: 12px; z-index: 2;">${item.Category}</span>
          </div>
          <div class="course-body" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
            <div>
              <h3 class="course-title" style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 40px;">${item.Title}</h3>
              <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                <span style="font-size: 12px; color: var(--text-muted);">
                  ${item.ContentType === 'Video' ? '<i class="fa-solid fa-video" style="color: var(--primary);"></i> Video' : '<i class="fa-solid fa-file-pdf" style="color: var(--secondary);"></i> Tài liệu'}
                </span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button class="btn btn-primary btn-view-doc" style="width: 100%; justify-content: center; font-size: 13px;">
                <i class="fa-solid fa-eye"></i> Xem tài liệu
              </button>
            </div>
          </div>
        `;

        card.querySelector('.btn-view-doc').addEventListener('click', () => {
          loadLibraryViewer(item);
        });

        el.libraryContainer.appendChild(card);
      });

    } catch (err) {
      console.error("Lỗi renderStudentLibrary:", err);
      showToast('Lỗi tải thư viện tài liệu: ' + err.message, 'danger');
    }
  }

  // --- LIBRARY VIEWER INTEGRATION ---
  function loadLibraryViewer(item) {
    if (item.ContentType === 'Document' && item.ContentURL && !item.ContentURL.startsWith('data:application/pdf') && item.ContentURL !== 'local-pdf') {
      window.open(item.ContentURL, '_blank');
      return;
    }

    state.viewerOrigin = 'library';
    state.activeLibraryItem = item;
    
    showView('view-course-viewer');
    el.viewerCourseTitle.textContent = item.Title;
    el.viewerMetaCategory.textContent = item.Category;
    el.viewerMetaType.textContent = item.ContentType === 'Video' ? 'Thư viện Video' : 'Thư viện Tài liệu';
    
    // Hide progress stats for library
    el.viewerMetaWatchTime.parentElement.style.display = 'none';
    el.viewerMetaStatus.parentElement.style.display = 'none';
    
    // Hide quiz actions panel for library items
    const rightPanel = document.querySelector('.viewer-sidebar');
    if (rightPanel) rightPanel.style.display = 'none';
    
    const mainCol = document.querySelector('.viewer-main');
    if (mainCol) mainCol.style.width = '100%';

    if (item.ContentType === 'Video') {
      const isYouTube = item.ContentURL.includes('youtube.com') || item.ContentURL.includes('youtu.be');
      if (isYouTube) {
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = item.ContentURL.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        }
        el.learningMediaContainer.innerHTML = `
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
            <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
          </div>
        `;
      } else {
        el.learningMediaContainer.innerHTML = `
          <video controls controlsList="nodownload" style="width: 100%; max-height: 500px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); background: #000;">
            <source src="${item.ContentURL}" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ phát video này.
          </video>
        `;
      }
    } else {
      // Document
      if (item.ContentURL.startsWith('data:application/pdf') || item.ContentURL.startsWith('data:')) {
        el.learningMediaContainer.innerHTML = `
          <iframe src="${item.ContentURL}" style="width: 100%; height: 600px; border: none; border-radius: var(--radius-md); box-shadow: var(--shadow-md);"></iframe>
        `;
      } else {
        el.learningMediaContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-file-pdf" style="font-size: 48px; color: var(--secondary); margin-bottom: 16px;"></i>
            <p>Không thể xem trực tiếp tài liệu này.</p>
            <a href="${item.ContentURL}" target="_blank" class="btn btn-primary" style="margin-top: 12px; display: inline-flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở tài liệu ở tab mới
            </a>
          </div>
        `;
      }
    }
  }

  el.librarySearchInput.addEventListener('input', () => {
    renderStudentLibrary();
  });

  el.libraryCategoryFilter.addEventListener('change', () => {
    renderStudentLibrary();
  });

  // --- ADMIN LIBRARY CONFIGURATION LOGIC ---
  async function renderAdminLibraryTable() {
    try {
      const items = await window.ahcomDB.getLibraryItems();
      el.adminLibraryTableBody.innerHTML = '';

      if (items.length === 0) {
        el.adminLibraryTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">
              Chưa có tài liệu nào trong thư viện. Vui lòng bấm "Thêm tài liệu mới".
            </td>
          </tr>
        `;
        return;
      }

      items.forEach(item => {
        const tr = document.createElement('tr');
        
        const isHidden = item.IsHidden;
        const statusBadge = isHidden 
          ? `<span class="badge-status failed"><i class="fa-solid fa-lock"></i> Ẩn</span>`
          : `<span class="badge-status passed"><i class="fa-solid fa-eye"></i> Hiện</span>`;

        tr.innerHTML = `
          <td>
            <div style="font-weight: 600; color: var(--text-dark);">${item.Title}</div>
          </td>
          <td><span class="badge-category">${item.Category}</span></td>
          <td>
            <span style="font-size: 13px;">
              ${item.ContentType === 'Video' ? '<i class="fa-solid fa-video" style="color: var(--primary);"></i> Video' : '<i class="fa-solid fa-file-pdf" style="color: var(--secondary);"></i> Tài liệu'}
            </span>
          </td>
          <td>${item.ScopeCompany === 'All' ? 'Tất cả' : item.ScopeCompany}</td>
          <td>${item.ScopeDepartment === 'All' ? 'Tất cả' : item.ScopeDepartment}</td>
          <td>${statusBadge}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button class="btn btn-secondary btn-edit-lib" style="padding: 4px 8px; font-size: 12px;" data-id="${item.ItemID}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn btn-danger btn-delete-lib" style="padding: 4px 8px; font-size: 12px;" data-id="${item.ItemID}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </td>
        `;

        // Bind Edit button
        tr.querySelector('.btn-edit-lib').addEventListener('click', () => {
          openLibraryModal(item);
        });

        // Bind Delete button
        tr.querySelector('.btn-delete-lib').addEventListener('click', async () => {
          if (confirm(`Bạn chắc chắn muốn xóa tài liệu "${item.Title}" khỏi thư viện?`)) {
            try {
              await window.ahcomDB.deleteLibraryItem(item.ItemID);
              showToast('Đã xóa tài liệu khỏi thư viện.', 'success');
              renderAdminLibraryTable();
            } catch (err) {
              showToast('Lỗi khi xóa: ' + err.message, 'danger');
            }
          }
        });

        el.adminLibraryTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error("Lỗi renderAdminLibraryTable:", err);
      showToast('Lỗi tải bảng quản trị thư viện: ' + err.message, 'danger');
    }
  }

  async function openLibraryModal(item = null) {
    try {
      // 1. Populate category dropdown
      const categories = await window.ahcomDB.getLibraryCategories();
      el.editorLibraryCategory.innerHTML = '';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        el.editorLibraryCategory.appendChild(opt);
      });

      // 2. Populate company and department dropdowns
      const companies = await window.ahcomDB.getCompanies();
      el.editorLibraryScopeCompany.innerHTML = '<option value="All">Tất cả công ty</option>';
      companies.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        el.editorLibraryScopeCompany.appendChild(opt);
      });

      const departments = await window.ahcomDB.getDepartments();
      el.editorLibraryScopeDepartment.innerHTML = '<option value="All">Tất cả phòng ban</option>';
      departments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        el.editorLibraryScopeDepartment.appendChild(opt);
      });

      // Reset local file states
      state.currentLibraryPdfFile = null;
      state.currentLibraryPdfBase64 = '';
      el.editorLibraryPdfFileName.textContent = '';
      el.editorLibraryPdfFileName.style.display = 'none';
      el.btnRemoveLibraryPdfFile.style.display = 'none';

      if (item) {
        // Edit Mode
        document.getElementById('library-modal-title').textContent = 'Chỉnh sửa Tài liệu Thư viện';
        el.editorLibraryItemId.value = item.ItemID;
        el.editorLibraryTitle.value = item.Title;
        el.editorLibraryCategory.value = item.Category;
        el.editorLibraryContentType.value = item.ContentType;
        el.editorLibraryTargetGroup.value = item.TargetGroup;
        el.editorLibraryIsHidden.value = String(item.IsHidden);
        el.editorLibraryScopeCompany.value = item.ScopeCompany;
        el.editorLibraryScopeDepartment.value = item.ScopeDepartment;

        if (item.ContentURL.startsWith('data:application/pdf') || item.ContentURL.startsWith('data:')) {
          state.currentLibraryPdfBase64 = item.ContentURL;
          el.editorLibraryContentUrl.value = '';
          el.editorLibraryPdfFileName.textContent = 'Tập tin: [PDF đã lưu]';
          el.editorLibraryPdfFileName.style.display = 'inline';
          el.btnRemoveLibraryPdfFile.style.display = 'inline-flex';
        } else {
          el.editorLibraryContentUrl.value = item.ContentURL;
        }
      } else {
        // Add Mode
        document.getElementById('library-modal-title').textContent = 'Thêm tài liệu mới vào Thư viện';
        el.editorLibraryItemId.value = '';
        el.editorLibraryTitle.value = '';
        el.editorLibraryContentType.value = 'Document';
        el.editorLibraryTargetGroup.value = 'All';
        el.editorLibraryIsHidden.value = 'false';
        el.editorLibraryScopeCompany.value = 'All';
        el.editorLibraryScopeDepartment.value = 'All';
        el.editorLibraryContentUrl.value = '';
      }

      // Hide or show local PDF section based on ContentType selection
      toggleLibraryPdfSection();

      el.modalLibraryItemEditor.classList.add('active');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi mở modal: ' + err.message, 'danger');
    }
  }

  function toggleLibraryPdfSection() {
    const isDoc = el.editorLibraryContentType.value === 'Document';
    const pdfSection = document.getElementById('group-editor-library-pdf');
    if (pdfSection) {
      pdfSection.style.display = isDoc ? 'block' : 'none';
    }
  }

  el.editorLibraryContentType.addEventListener('change', () => {
    toggleLibraryPdfSection();
  });

  // Open modal on Add button click
  el.btnAdminAddLibraryItem.addEventListener('click', () => {
    openLibraryModal();
  });

  // Close Library modal
  document.getElementById('btn-close-library-modal').addEventListener('click', () => {
    el.modalLibraryItemEditor.classList.remove('active');
  });
  document.getElementById('btn-cancel-library-modal').addEventListener('click', () => {
    el.modalLibraryItemEditor.classList.remove('active');
  });

  // Local PDF File Selector for Library
  el.btnUploadLibraryPdf.addEventListener('click', () => {
    el.editorLibraryPdfFileInput.click();
  });

  el.editorLibraryPdfFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Vui lòng chọn tập tin PDF hợp lệ.', 'danger');
      return;
    }

    state.currentLibraryPdfFile = file;

    const reader = new FileReader();
    reader.onload = (evt) => {
      state.currentLibraryPdfBase64 = evt.target.result;
    };
    reader.readAsDataURL(file);

    el.editorLibraryPdfFileName.textContent = `Tệp đã chọn: ${file.name}`;
    el.editorLibraryPdfFileName.style.display = 'inline';
    el.btnRemoveLibraryPdfFile.style.display = 'inline-flex';
  });

  el.btnRemoveLibraryPdfFile.addEventListener('click', () => {
    el.editorLibraryPdfFileInput.value = '';
    state.currentLibraryPdfFile = null;
    state.currentLibraryPdfBase64 = '';
    el.editorLibraryPdfFileName.textContent = '';
    el.editorLibraryPdfFileName.style.display = 'none';
    el.btnRemoveLibraryPdfFile.style.display = 'none';
  });

  // Submit form action
  el.formLibraryItemEditor.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const itemId = el.editorLibraryItemId.value;
      const title = el.editorLibraryTitle.value.trim();
      const category = el.editorLibraryCategory.value;
      const contentType = el.editorLibraryContentType.value;
      const targetGroup = el.editorLibraryTargetGroup.value;
      const isHidden = el.editorLibraryIsHidden.value === 'true';
      const scopeCompany = el.editorLibraryScopeCompany.value;
      const scopeDepartment = el.editorLibraryScopeDepartment.value;
      let contentUrl = el.editorLibraryContentUrl.value.trim();

      if (contentType === 'Document' && state.currentLibraryPdfBase64) {
        contentUrl = state.currentLibraryPdfBase64;
      }

      if (!title) {
        showToast('Vui lòng nhập tên tài liệu.', 'danger');
        return;
      }

      if (!contentUrl) {
        showToast('Vui lòng nhập liên kết hoặc tải lên file PDF.', 'danger');
        return;
      }

      const itemData = {
        ItemID: itemId || null,
        Title: title,
        Category: category,
        ContentType: contentType,
        TargetGroup: targetGroup,
        IsHidden: isHidden,
        ScopeCompany: scopeCompany,
        ScopeDepartment: scopeDepartment,
        ContentURL: contentUrl,
        CreatedByUserId: state.currentUser ? state.currentUser.UserID : null
      };

      await window.ahcomDB.saveLibraryItem(itemData);
      showToast('Đã lưu cấu hình tài liệu thư viện thành công.', 'success');
      el.modalLibraryItemEditor.classList.remove('active');
      renderAdminLibraryTable();
    } catch (err) {
      showToast('Lỗi khi lưu tài liệu: ' + err.message, 'danger');
    }
  });

  // --- ADMIN LIBRARY CATEGORIES RENDER ---
  async function renderAdminLibraryCategoriesTable() {
    try {
      const categories = await window.ahcomDB.getLibraryCategories();
      el.libraryCategoriesCountBadge.textContent = `${categories.length} chuyên mục`;
      el.adminLibraryCategoriesTableBody.innerHTML = '';

      if (categories.length === 0) {
        el.adminLibraryCategoriesTableBody.innerHTML = `
          <tr>
            <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">
              Chưa có chuyên mục thư viện nào.
            </td>
          </tr>
        `;
        return;
      }

      categories.forEach((cat, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="text-align: center; font-weight: 600;">${index + 1}</td>
          <td>
            <div style="font-weight: 600; color: var(--text-dark);">${cat}</div>
          </td>
          <td style="text-align: right; padding-right: 24px;">
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-secondary btn-edit-lib-cat" style="padding: 4px 8px; font-size: 12px;" data-name="${cat}"><i class="fa-solid fa-pen"></i> Sửa</button>
              <button class="btn btn-danger btn-delete-lib-cat" style="padding: 4px 8px; font-size: 12px;" data-name="${cat}"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            </div>
          </td>
        `;

        // Edit category
        tr.querySelector('.btn-edit-lib-cat').addEventListener('click', async () => {
          const newName = prompt(`Nhập tên mới cho chuyên mục thư viện "${cat}":`, cat);
          if (newName && newName.trim() && newName.trim() !== cat) {
            try {
              const res = await window.ahcomDB.updateLibraryCategory(cat, newName);
              if (res.success) {
                showToast(res.message, 'success');
                renderAdminLibraryCategoriesTable();
              } else {
                showToast(res.message, 'danger');
              }
            } catch (err) {
              showToast('Lỗi: ' + err.message, 'danger');
            }
          }
        });

        // Delete category
        tr.querySelector('.btn-delete-lib-cat').addEventListener('click', async () => {
          if (confirm(`Bạn chắc chắn muốn xóa chuyên mục thư viện "${cat}"?`)) {
            try {
              const res = await window.ahcomDB.deleteLibraryCategory(cat);
              if (res.success) {
                showToast(res.message, 'success');
                renderAdminLibraryCategoriesTable();
              } else {
                showToast(res.message, 'danger');
              }
            } catch (err) {
              showToast('Lỗi: ' + err.message, 'danger');
            }
          }
        });

        el.adminLibraryCategoriesTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh mục thư viện: ' + err.message, 'danger');
    }
  }

  // Submit add library category form
  el.formAdminAddLibraryCategory.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const name = el.libraryCategoryNameInput.value.trim();
      if (!name) return;

      const res = await window.ahcomDB.addLibraryCategory(name);
      if (res.success) {
        showToast(res.message, 'success');
        el.libraryCategoryNameInput.value = '';
        renderAdminLibraryCategoriesTable();
      } else {
        showToast(res.message, 'danger');
      }
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'danger');
    }
  });

  // Dashboard filter click handlers
  el.courseCategoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      el.courseCategoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderStudentDashboard();
    }
  });

  // --- COURSE VIEWER (STUDY SCREEN) ---
  async function loadCourseViewer(course) {
    // RBAC Security Guard
    const userRole = state.currentUser ? state.currentUser.Role : 'Student';
    const isAdmin = userRole === 'SuperAdmin' || userRole === 'CompanyAdmin' || userRole === 'DeptAdmin' || userRole === 'Admin';
    if (state.currentUser && !isAdmin) {
      const userJobLevel = state.currentUser.JobLevel || 'Staff';
      const courseTarget = course.TargetGroup || 'All';
      if (courseTarget === 'Manager' && userJobLevel !== 'Manager') {
        showToast('Khóa học này chỉ dành riêng cho cấp Quản lý.', 'danger');
        return;
      } else if (courseTarget === 'Staff' && userJobLevel !== 'Staff') {
        showToast('Khóa học này chỉ dành riêng cho cấp Nhân viên.', 'danger');
        return;
      }
    }

    state.activeCourse = course;
    state.slideIndex = 0;
    
    // Set headers
    el.viewerCourseTitle.textContent = course.Title;
    el.viewerMetaCategory.textContent = course.Category;
    el.viewerMetaType.textContent = course.ContentType === 'Video' ? 'Video Bài giảng' : 'Tài liệu Slide';

    // Retrieve initial progress
    const progressList = await window.ahcomDB.getUserProgress(state.currentUser.UserID);
    const progress = progressList.find(p => p.CourseID === course.CourseID);
    const initialSeconds = progress ? progress.WatchTimeSeconds : 0;
    
    updateViewerProgressUI(initialSeconds, progress ? progress.IsCompleted : false);

    // Render appropriate learning player/viewer
    if (course.ContentType === 'Video') {
      renderVideoPlayer(course, initialSeconds);
    } else {
      renderSlideViewer(course, initialSeconds);
    }

    showView('view-course-viewer');
  }

  function updateViewerProgressUI(seconds, isCompleted) {
    el.viewerMetaWatchTime.textContent = window.ahcomDB.formatWatchTime(seconds);
    
    if (isCompleted) {
      el.viewerMetaStatus.innerHTML = '<span class="badge-status passed"><i class="fa-solid fa-circle-check"></i> Đã hoàn thành</span>';
    } else {
      el.viewerMetaStatus.innerHTML = '<span class="badge-status pending"><i class="fa-solid fa-clock"></i> Đang học</span>';
    }
  }

  // --- EXTERNAL LINK CONVERTERS & SIMULATED PROGRESS TRACKERS ---
  function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper to parse and convert Google Drive and YouTube links to embeddable preview URLs
  function getEmbedUrl(url) {
    if (!url) return '';
    
    // 1. Google Drive / Docs / Presentation conversion
    const driveRegex = /(https:\/\/drive\.google\.com\/file\/d\/|https:\/\/docs\.google\.com\/presentation\/d\/|https:\/\/docs\.google\.com\/document\/d\/|https:\/\/docs\.google\.com\/spreadsheets\/d\/)([a-zA-Z0-9_-]+)(\/.*)?/;
    const match = url.match(driveRegex);
    
    if (match) {
      const prefix = match[1];
      const fileId = match[2];
      if (prefix.includes('drive.google.com')) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (prefix.includes('presentation')) {
        return `https://docs.google.com/presentation/d/${fileId}/preview`;
      } else if (prefix.includes('document')) {
        return `https://docs.google.com/document/d/${fileId}/preview`;
      } else if (prefix.includes('spreadsheets')) {
        return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
      }
    }
    
    // 2. YouTube link conversion
    if (url.includes('youtube.com/watch')) {
      try {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } catch (e) {
        console.error("Error parsing YouTube URL:", e);
      }
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('/').pop().split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  }

  // Simulated watch timer tracking (auto-completes when student views slides/documents)
  function startSimulatedWatchProgress(course, startSeconds) {
    if (state.watchTimer) {
      clearInterval(state.watchTimer);
    }

    let currentSeconds = startSeconds;
    let hasAnnouncedCompletion = false;
    
    state.watchTimer = setInterval(() => {
      if (!state.currentUser) {
        clearInterval(state.watchTimer);
        state.watchTimer = null;
        return;
      }
      currentSeconds++;
      const isCompleted = currentSeconds >= 15;
      
      window.ahcomDB.updateWatchProgress(
        state.currentUser.UserID,
        course.CourseID,
        currentSeconds,
        isCompleted
      );
      
      updateViewerProgressUI(currentSeconds, isCompleted);

      if (isCompleted && !hasAnnouncedCompletion) {
        hasAnnouncedCompletion = true;
        showToast('🎉 Bạn đã học xong bài giảng! Hệ thống đã tự động ghi nhận HOÀN THÀNH.', 'success');
      }
      
      if (currentSeconds >= 300) {
        clearInterval(state.watchTimer);
        state.watchTimer = null;
      }
    }, 1000);
  }

  // Render Video Player
  async function renderVideoPlayer(course, startSeconds) {
    el.learningMediaContainer.classList.add('video-mode');
    if (course.ContentURL === 'local-video') {
      try {
        const videoBlob = await window.ahcomDB.largeFileStorage.getVideo(course.CourseID);
        if (!videoBlob) {
          el.learningMediaContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; background: #FFF5F5; border-radius: var(--radius-sm); border: 1px solid var(--danger);">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: var(--danger); margin-bottom: 12px;"></i>
              <p style="font-weight: 600; color: var(--danger);">Không tìm thấy tệp video cục bộ trong cơ sở dữ liệu IndexedDB.</p>
              <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Vui lòng tải lại tệp tin video trong cấu hình khóa học của Admin.</p>
            </div>
          `;
          return;
        }

        const localUrl = URL.createObjectURL(videoBlob);
        state.activeLocalVideoUrl = localUrl;

        el.learningMediaContainer.innerHTML = `
          <video id="player-video-element" class="native-video" controls autoplay>
            <source src="${localUrl}" type="${videoBlob.type || 'video/mp4'}">
            Trình duyệt của bạn không hỗ trợ trình phát video HTML5.
          </video>
        `;
      } catch (err) {
        console.error("Error loading local video from IndexedDB: ", err);
        el.learningMediaContainer.innerHTML = `<p style="color: var(--danger);">Đã xảy ra lỗi khi tải video: ${err.message}</p>`;
        return;
      }
    } else {
      const isEmbed = course.ContentURL.includes('drive.google.com') || 
                      course.ContentURL.includes('docs.google.com') ||
                      course.ContentURL.includes('youtube.com') ||
                      course.ContentURL.includes('youtu.be');

      if (isEmbed) {
        const embedUrl = getEmbedUrl(course.ContentURL);
        el.learningMediaContainer.innerHTML = `
          <div class="slide-container" style="display: flex; flex-direction: column; gap: 16px; height: 500px;">
            <iframe src="${embedUrl}" style="width: 100%; height: 420px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
              <a href="${course.ContentURL}" target="_blank" class="btn btn-secondary btn-open-external" style="display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-up-right-from-square"></i> Mở bài giảng trong Cửa sổ mới
              </a>
              <button class="btn btn-success btn-confirm-completed" style="display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-check"></i> Xác nhận đã học xong bài
              </button>
            </div>
          </div>
        `;

        // Bind confirm complete click
        el.learningMediaContainer.querySelector('.btn-confirm-completed').addEventListener('click', () => {
          window.ahcomDB.updateWatchProgress(
            state.currentUser.UserID,
            course.CourseID,
            300,
            true
          );
          updateViewerProgressUI(300, true);
          showToast('Chúc mừng bạn đã hoàn thành bài học video này!', 'success');
        });

        startSimulatedWatchProgress(course, startSeconds);
        return;
      }

      // Direct MP4 Video Player
      el.learningMediaContainer.innerHTML = `
        <video id="player-video-element" class="native-video" controls autoplay>
          <source src="${course.ContentURL}" type="video/mp4">
          Trình duyệt của bạn không hỗ trợ trình phát video HTML5.
        </video>
      `;
    }

    const video = document.getElementById('player-video-element');
    
    // Resume watch position
    video.addEventListener('loadedmetadata', () => {
      if (startSeconds > 0 && startSeconds < video.duration) {
        video.currentTime = startSeconds;
      }
    });

    // Set listener to update watch progress automatically
    let lastSavedTime = 0;
    video.addEventListener('timeupdate', () => {
      if (!state.currentUser) return;
      const currentTime = Math.round(video.currentTime);
      
      // Avoid excessive writes to localStorage. Save every 2 seconds or when video finishes
      if (currentTime !== lastSavedTime && (currentTime % 2 === 0 || video.ended)) {
        lastSavedTime = currentTime;
        
        // 90% or more viewed marks completion
        const isCompleted = video.duration ? (currentTime >= video.duration * 0.9) : false;
        
        window.ahcomDB.updateWatchProgress(
          state.currentUser.UserID,
          course.CourseID,
          currentTime,
          isCompleted
        );
        
        updateViewerProgressUI(currentTime, isCompleted);
      }
    });
  }

  // Render Slide Viewer
  function renderSlideViewer(course, initialSeconds) {
    el.learningMediaContainer.classList.remove('video-mode');
    if (course.SlideSource === 'link' || course.ContentURL) {
      // LINK SOURCE OR LOCAL / BASE64 PDF SLIDES
      const rawUrl = course.ContentURL || '';

      if (rawUrl.startsWith('data:application/pdf') || rawUrl.startsWith('data:')) {
        el.learningMediaContainer.innerHTML = `
          <div class="slide-container" style="display: flex; flex-direction: column; width: 100%; min-height: 580px; height: auto; position: relative; background: #1a202c; border-radius: var(--radius-sm); overflow: hidden;">
            <iframe id="slide-iframe-element" src="${rawUrl}#view=FitH" style="width: 100%; height: 580px; min-height: 460px; border: none;" allowfullscreen></iframe>
          </div>
        `;
        startSimulatedWatchProgress(course, initialSeconds);
        return;
      }

      if (rawUrl === 'local-pdf') {
        el.learningMediaContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 480px; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; margin-right: 12px;"></i> Đang tải tệp PDF bài giảng...
          </div>
        `;
        window.ahcomDB.largeFileStorage.getDocument(course.CourseID).then(pdfBlob => {
          if (!pdfBlob) {
            el.learningMediaContainer.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 460px; text-align: center; padding: 30px; background: #F8FAFC; border-radius: var(--radius-md);">
                <i class="fa-solid fa-mobile-screen-button" style="font-size: 52px; color: var(--primary); margin-bottom: 12px;"></i>
                <h4 style="font-size: 18px; color: var(--primary); margin-bottom: 8px; font-weight: 700;">Tài liệu đang được đồng bộ</h4>
                <p style="color: var(--text-muted); font-size: 13px; max-width: 480px; margin-bottom: 16px; line-height: 1.5;">
                  Tệp PDF này đã được tạo từ máy tính của Admin. Để học trực tiếp mượt mà trên điện thoại, Admin hãy cập nhật lại bài học bằng cách dán link Google Drive chia sẻ.
                </p>
              </div>
            `;
            return;
          }

          const blobUrl = URL.createObjectURL(pdfBlob);
          el.learningMediaContainer.innerHTML = `
            <div class="slide-container" style="display: flex; flex-direction: column; width: 100%; min-height: 620px; height: auto; position: relative; background: #1a202c; border-radius: var(--radius-sm); overflow: hidden;">
              <iframe id="slide-iframe-element" src="${blobUrl}#view=FitH" style="width: 100%; height: 620px; min-height: 620px; border: none;" allowfullscreen></iframe>
            </div>
          `;
        }).catch(err => {
          console.error(err);
          el.learningMediaContainer.innerHTML = `<p style="color: var(--danger); padding: 20px;">Lỗi khi mở tệp PDF: ${err.message}</p>`;
        });

        startSimulatedWatchProgress(course, initialSeconds);
        return;
      }

      const isFolderOrMyDrive = rawUrl.includes('drive.google.com/drive/my-drive') || 
                                rawUrl.includes('drive.google.com/drive/u/') || 
                                rawUrl.includes('drive.google.com/drive/folders');

      if (isFolderOrMyDrive) {
        el.learningMediaContainer.innerHTML = `
          <div class="slide-container" style="display: flex; flex-direction: column; gap: 16px; align-items: center; justify-content: center; background: #F8FAFC; color: #1E293B; padding: 40px; text-align: center; border-radius: var(--radius-md); min-height: 580px;">
            <i class="fa-brands fa-google-drive" style="font-size: 64px; color: #34A853; margin-bottom: 8px;"></i>
            <h3 style="font-size: 22px; font-weight: 700; color: var(--primary); margin: 0;">Thư mục Tài liệu Google Drive</h3>
            <p style="color: var(--text-muted); max-width: 550px; font-size: 14px; margin: 8px 0 20px 0; line-height: 1.5;">
              Google bảo mật cấm hiển thị trực tiếp Thư mục Google Drive cá nhân trong khung xem nhỏ. 
              Vui lòng bấm nút bên dưới để mở tài liệu bài giảng trong Tab mới.
            </p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
              <a href="${rawUrl}" target="_blank" class="btn btn-primary" style="padding: 12px 24px; font-size: 15px; font-weight: 600;">
                <i class="fa-solid fa-up-right-from-square"></i> Mở tài liệu Google Drive
              </a>
            </div>
          </div>
        `;
      } else {
        const embedUrl = getEmbedUrl(rawUrl);
        el.learningMediaContainer.innerHTML = `
          <div class="slide-container" style="display: flex; flex-direction: column; width: 100%; min-height: 620px; height: auto; position: relative; background: #1a202c; border-radius: var(--radius-sm); overflow: hidden;">
            <iframe id="slide-iframe-element" src="${embedUrl}" style="width: 100%; height: 620px; min-height: 620px; border: none;" allowfullscreen></iframe>
          </div>
        `;
      }

      startSimulatedWatchProgress(course, initialSeconds);
      return;
    }

    // MANUAL SOURCE SLIDES
    const slides = course.Slides || [];
    
    // Map initial seconds back to approximate slide index
    let currentSlide = 0;
    if (initialSeconds > 0 && slides.length > 0) {
      const approxRatio = initialSeconds / 300;
      currentSlide = Math.min(slides.length - 1, Math.round(approxRatio * (slides.length - 1)));
    }
    state.slideIndex = currentSlide;

    function drawSlide() {
      const slide = slides[state.slideIndex];
      el.learningMediaContainer.innerHTML = `
        <div class="slide-container">
          <div class="slide-content-area">
            <h3 class="slide-title-header">${slide.Title}</h3>
            <p class="slide-body-text">${slide.Content}</p>
          </div>
          <div class="slide-controls">
            <button class="btn btn-secondary btn-slide-prev" ${state.slideIndex === 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-arrow-left"></i> Trực quan trước
            </button>
            <span class="slide-counter">Slide ${state.slideIndex + 1} / ${slides.length}</span>
            <button class="btn btn-primary btn-slide-next">
              ${state.slideIndex === slides.length - 1 ? 'Hoàn thành đọc <i class="fa-solid fa-check"></i>' : 'Trang tiếp <i class="fa-solid fa-arrow-right"></i>'}
            </button>
          </div>
        </div>
      `;

      // Back slide click
      el.learningMediaContainer.querySelector('.btn-slide-prev').addEventListener('click', () => {
        if (state.slideIndex > 0) {
          state.slideIndex--;
          saveSlideProgress();
          drawSlide();
        }
      });

      // Next slide click
      el.learningMediaContainer.querySelector('.btn-slide-next').addEventListener('click', () => {
        if (state.slideIndex < slides.length - 1) {
          state.slideIndex++;
          saveSlideProgress();
          drawSlide();
        } else {
          // Reached final slide, mark course complete
          saveSlideProgress(true);
          showToast('Chúc mừng bạn đã xem hết tài liệu slide!', 'success');
          drawSlide();
        }
      });
    }

    function saveSlideProgress(isFinal = false) {
      const totalSlides = slides.length;
      // Map slides to simulated watch seconds (Max 300s)
      const ratio = (state.slideIndex + 1) / totalSlides;
      const watchSeconds = Math.round(ratio * 300);
      const isCompleted = isFinal || state.slideIndex === totalSlides - 1;

      window.ahcomDB.updateWatchProgress(
        state.currentUser.UserID,
        course.CourseID,
        watchSeconds,
        isCompleted
      );

      updateViewerProgressUI(watchSeconds, isCompleted);
    }

    // Init draw
    drawSlide();
  }

  function stopProgressTracking() {
    // Clear video element to stop playing audio/video in background
    el.learningMediaContainer.innerHTML = '';
    
    // Clear active watch timer
    if (state.watchTimer) {
      clearInterval(state.watchTimer);
      state.watchTimer = null;
    }
  }

  // Back to dashboard
  el.btnBackToDashboard.addEventListener('click', async () => {
    // Restore default viewer layout styling
    const rightPanel = document.querySelector('.viewer-sidebar');
    if (rightPanel) rightPanel.style.display = '';
    const mainCol = document.querySelector('.viewer-main');
    if (mainCol) mainCol.style.width = '';
    
    // Restore watch time and progress status elements
    el.viewerMetaWatchTime.parentElement.style.display = '';
    el.viewerMetaStatus.parentElement.style.display = '';

    if (state.viewerOrigin === 'library') {
      await renderStudentLibrary();
      showView('view-student-library');
    } else {
      await renderStudentDashboard();
      showView('view-student-dashboard');
    }
  });

  // --- QUIZ INTERACTIVE VIEW ---
  el.btnStartQuiz.addEventListener('click', () => {
    if (!state.activeCourse) return;
    
    // Render the questions
    const questions = state.activeCourse.QuizQuestions || [];
    el.quizCourseTitle.textContent = `Bài Kiểm Tra: ${state.activeCourse.Title}`;
    el.quizQuestionsList.innerHTML = '';
    
    // Hide previous results
    el.quizResultContainer.style.display = 'none';
    el.quizResultContainer.innerHTML = '';
    
    // Enable submit buttons and radios
    el.formQuiz.querySelector('button[type="submit"]').style.display = 'inline-flex';

    questions.forEach((q, qIndex) => {
      const qCard = document.createElement('div');
      qCard.className = 'quiz-question-card';
      
      let optionsHTML = '';
      (q.Options || []).forEach((option, oIndex) => {
        optionsHTML += `
          <label class="quiz-option-label" for="q-${qIndex}-o-${oIndex}">
            <input type="radio" name="question-${qIndex}" id="q-${qIndex}-o-${oIndex}" value="${oIndex}" required>
            <span>${escapeHTML(option)}</span>
          </label>
        `;
      });

      qCard.innerHTML = `
        <p class="quiz-question-text">Câu ${qIndex + 1}: ${escapeHTML(q.Question)}</p>
        <div class="quiz-options-list">
          ${optionsHTML}
        </div>
      `;
      el.quizQuestionsList.appendChild(qCard);
    });

    showView('view-quiz-panel');
  });

  // Submit Quiz Action
  el.formQuiz.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.activeCourse) return;

    const questions = state.activeCourse.QuizQuestions || [];
    let correctCount = 0;

    // Remove any previous feedback classes
    document.querySelectorAll('.quiz-option-label').forEach(label => {
      label.classList.remove('correct', 'incorrect');
    });

    questions.forEach((q, qIndex) => {
      const selectedInput = document.querySelector(`input[name="question-${qIndex}"]:checked`);
      const selectedAnswer = selectedInput ? parseInt(selectedInput.value) : -1;
      
      // Highlight correct/incorrect answers visually
      q.Options.forEach((option, oIndex) => {
        const label = document.querySelector(`label[for="q-${qIndex}-o-${oIndex}"]`);
        
        // Correct answer gets green
        if (oIndex === q.CorrectIndex) {
          label.classList.add('correct');
        }
        
        // If user selected this answer and it is incorrect, it gets red
        if (selectedAnswer === oIndex && selectedAnswer !== q.CorrectIndex) {
          label.classList.add('incorrect');
        }
      });

      if (selectedAnswer === q.CorrectIndex) {
        correctCount++;
      }
    });

    // Score evaluation (Passed if >= 70%)
    const percentage = (correctCount / questions.length) * 100;
    const isPassed = percentage >= 70;
    const statusText = isPassed ? 'Passed' : 'Failed';
    const statusVietnamese = isPassed ? 'Đạt' : 'Chưa đạt';

    // Save to Relational DB
    await window.ahcomDB.saveQuizResult(
      state.currentUser.UserID,
      state.activeCourse.CourseID,
      correctCount,
      questions.length,
      statusText
    );

    // Hide submit button to lock choices after submission
    el.formQuiz.querySelector('button[type="submit"]').style.display = 'none';

    // Display Result Info Box
    el.quizResultContainer.style.display = 'block';
    
    const iconClass = isPassed ? 'fa-solid fa-circle-check passed' : 'fa-solid fa-circle-xmark failed';
    const badgeClass = isPassed ? 'passed' : 'failed';
    const messageText = isPassed 
      ? 'Chúc mừng bạn! Bạn đã nắm bắt rất tốt nội dung bài giảng và xuất sắc vượt qua bài kiểm tra.' 
      : 'Rất tiếc! Bạn chưa đạt mức điểm tối thiểu (70%). Hãy ôn tập kỹ lại lý thuyết và làm lại bài thi.';

    el.quizResultContainer.innerHTML = `
      <div class="quiz-result-feedback">
        <div class="quiz-result-icon ${badgeClass}"><i class="${iconClass}"></i></div>
        <div class="quiz-status-badge ${badgeClass}">${statusVietnamese}</div>
        <div class="quiz-result-score">Kết quả: ${correctCount} / ${questions.length} Câu Đúng</div>
        <p style="color: var(--text-primary); max-width: 600px; margin: 0 auto 24px auto;">${messageText}</p>
        
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" id="btn-result-close">
            <i class="fa-solid fa-chevron-left"></i> Về danh sách khóa học
          </button>
          ${!isPassed ? `
            <button class="btn btn-primary" id="btn-result-retry">
              Thử sức lại <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Bind results actions
    document.getElementById('btn-result-close').addEventListener('click', () => {
      renderStudentDashboard();
      showView('view-student-dashboard');
    });

    if (!isPassed) {
      document.getElementById('btn-result-retry').addEventListener('click', () => {
        loadCourseViewer(state.activeCourse);
      });
    }

    // Scroll down to result view
    el.quizResultContainer.scrollIntoView({ behavior: 'smooth' });
    showToast(`Đã ghi nhận kết quả thi trắc nghiệm: ${statusVietnamese}!`, isPassed ? 'success' : 'danger');
  });

  // Cancel Quiz
  el.btnCancelQuiz.addEventListener('click', () => {
    if (state.activeCourse) {
      loadCourseViewer(state.activeCourse);
    } else {
      showView('view-student-dashboard');
    }
  });

  async function renderAdminDashboard() {
    try {
      let analytics = await window.ahcomDB.getAdminAnalytics();
      let courses = await window.ahcomDB.getCourses();
      
      // RBAC tab visibility control
      const role = state.currentUser.Role;
      if (role === 'SuperAdmin') {
        if (el.btnTabCompanies) el.btnTabCompanies.style.display = 'inline-flex';
        if (el.btnTabDepartments) el.btnTabDepartments.style.display = 'inline-flex';
      } else if (role === 'CompanyAdmin') {
        if (el.btnTabCompanies) el.btnTabCompanies.style.display = 'none';
        if (el.btnTabDepartments) el.btnTabDepartments.style.display = 'inline-flex';
      } else { // DeptAdmin
        if (el.btnTabCompanies) el.btnTabCompanies.style.display = 'none';
        if (el.btnTabDepartments) el.btnTabDepartments.style.display = 'none';
      }

      // Load static dropdown choices
      await renderCompanyDropdowns();
      await renderDepartmentDropdowns();

      // Show/hide company filter select on dashboard
      if (el.adminCompanyFilter) {
        el.adminCompanyFilter.style.display = role === 'SuperAdmin' ? 'inline-flex' : 'none';
      }

      // RBAC filtering of stats and records
      const userCompany = state.currentUser.Company || 'AHCOM Tổng';
      const userDept = state.currentUser.Department || 'Ban Giám Đốc';

      if (role === 'CompanyAdmin') {
        analytics = analytics.filter(u => u.Company === userCompany);
        courses = courses.filter(c => c.ScopeCompany === 'All' || c.ScopeCompany === userCompany);
      } else if (role === 'DeptAdmin') {
        analytics = analytics.filter(u => u.Company === userCompany && u.Department === userDept);
        courses = courses.filter(c => (c.ScopeCompany === 'All' || c.ScopeCompany === userCompany) && (c.ScopeDepartment === 'All' || c.ScopeDepartment === userDept));
      }

      // Update summary counters
      el.statTotalStudents.textContent = analytics.length;
      el.statTotalCourses.textContent = courses.length;

      // Total Completed Lessons
      let totalCompleted = 0;
      analytics.forEach(student => {
        totalCompleted += student.CompletedLessons.length;
      });
      el.statCompletedLessons.textContent = totalCompleted;

      // Total Passed Quizzes
      let totalPassedQuizzes = 0;
      analytics.forEach(student => {
        student.QuizHistory.forEach(quiz => {
          if (quiz.Status === 'Đạt') {
            totalPassedQuizzes++;
          }
        });
      });
      el.statPassedQuizzes.textContent = totalPassedQuizzes;

      await renderAdminTable();
    } catch (err) {
      console.error("Lỗi renderAdminDashboard:", err);
      showToast('Lỗi tải dữ liệu quản trị: ' + err.message, 'danger');
    }
  }

  // Draw admin table with filters applied
  async function renderAdminTable() {
    let analytics = await window.ahcomDB.getAdminAnalytics();
    
    // RBAC filtering of rows based on admin's designated scope
    const role = state.currentUser.Role;
    const userCompany = state.currentUser.Company || 'AHCOM Tổng';
    const userDept = state.currentUser.Department || 'Ban Giám Đốc';

    if (role === 'CompanyAdmin') {
      analytics = analytics.filter(row => row.Company === userCompany);
    } else if (role === 'DeptAdmin') {
      analytics = analytics.filter(row => row.Company === userCompany && row.Department === userDept);
    }

    // Read current filter state
    const searchTerm = el.adminSearchInput.value.toLowerCase().trim();
    const selectedCompany = el.adminCompanyFilter ? el.adminCompanyFilter.value : 'all';
    const selectedDept = el.adminDeptFilter.value;

    el.adminTableBody.innerHTML = '';

    const filteredData = analytics.filter(row => {
      // 1. Company match (only SuperAdmin has active company filter dropdown)
      const companyMatch = role !== 'SuperAdmin' || selectedCompany === 'all' || selectedCompany === 'All' || row.Company === selectedCompany;

      // 2. Department match
      const deptMatch = selectedDept === 'all' || selectedDept === 'All' || row.Department === selectedDept;
      
      // 3. Search match (name or employee id)
      const nameMatch = row.FullName.toLowerCase().includes(searchTerm);
      const empIdMatch = row.EmployeeID.toLowerCase().includes(searchTerm);
      
      return companyMatch && deptMatch && (nameMatch || empIdMatch);
    });

    if (filteredData.length === 0) {
      el.adminTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-people-arrows" style="font-size: 32px; margin-bottom: 12px;"></i>
            <p>Không tìm thấy nhân viên nào khớp với bộ lọc.</p>
          </td>
        </tr>
      `;
      return;
    }

    filteredData.forEach(row => {
      // Completed lessons list tags
      let lessonsHTML = '<span style="color:var(--text-muted); font-style:italic;">Chưa học xong bài nào</span>';
      if (row.CompletedLessons.length > 0) {
        lessonsHTML = `<div class="lesson-list-badges">
          ${row.CompletedLessons.map(title => `<span class="lesson-badge"><i class="fa-solid fa-circle-check" style="color:var(--success);"></i> ${title}</span>`).join('')}
        </div>`;
      }

      // Quiz history formatting
      let quizzesHTML = '<span style="color:var(--text-muted); font-style:italic;">Chưa làm bài thi</span>';
      if (row.QuizHistory.length > 0) {
        quizzesHTML = row.QuizHistory.map(q => {
          const badgeClass = q.Status === 'Đạt' ? 'passed' : 'failed';
          return `
            <div class="quiz-record-badge">
              <strong>${q.CourseTitle}:</strong> 
              <span class="badge-status ${badgeClass}">${q.Status}</span> (${q.Score})
            </div>
          `;
        }).join('');
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${row.FullName}</strong></td>
        <td><code>${row.EmployeeID}</code></td>
        <td>${row.Department} <br><span style="font-size:11px;color:var(--text-muted);font-weight:600;">(${row.JobLevel})</span></td>
        <td>${lessonsHTML}</td>
        <td style="font-weight: 600;">${row.TotalDuration}</td>
        <td>${quizzesHTML}</td>
        <td style="text-align: right; padding-right: 20px;">
          <button class="btn btn-secondary btn-edit-user" data-id="${row.UserID}" style="padding: 5px 10px; font-size: 12px;">
            <i class="fa-solid fa-user-pen"></i> Sửa
          </button>
        </td>
      `;

      tr.querySelector('.btn-edit-user').addEventListener('click', () => {
        openUserEditorModal(row.UserID);
      });

      el.adminTableBody.appendChild(tr);
    });
  }

  // Admin filter event bindings
  el.adminSearchInput.addEventListener('input', renderAdminTable);
  el.adminDeptFilter.addEventListener('change', renderAdminTable);

  // --- EXPORT TO CSV CONTROLLER ---
  el.btnExportCSV.addEventListener('click', async () => {
    const analytics = await window.ahcomDB.getAdminAnalytics();
    
    // Apply current UI filters to export only what is viewed (or export all - exporting filtered matches is more professional!)
    const searchTerm = el.adminSearchInput.value.toLowerCase().trim();
    const selectedDept = el.adminDeptFilter.value;

    const filteredData = analytics.filter(row => {
      const deptMatch = selectedDept === 'all' || row.Department === selectedDept;
      const nameMatch = row.FullName.toLowerCase().includes(searchTerm);
      const empIdMatch = row.EmployeeID.toLowerCase().includes(searchTerm);
      return deptMatch && (nameMatch || empIdMatch);
    });

    if (filteredData.length === 0) {
      showToast('Không có dữ liệu phù hợp để xuất báo cáo.', 'warning');
      return;
    }

    // Build CSV Content
    let csvContent = '';
    
    // Header line
    csvContent += 'Họ và tên,Mã nhân viên,Phòng ban,Bài học đã hoàn thành,Tổng thời gian học,Lịch sử trắc nghiệm\r\n';

    filteredData.forEach(row => {
      // Escape values with double quotes to handle commas correctly
      const name = `"${row.FullName.replace(/"/g, '""')}"`;
      const empId = `"${row.EmployeeID.replace(/"/g, '""')}"`;
      const dept = `"${row.Department.replace(/"/g, '""')}"`;
      
      const lessons = `"${row.CompletedLessons.join(', ').replace(/"/g, '""')}"`;
      const duration = `"${row.TotalDuration.replace(/"/g, '""')}"`;
      
      const quizStr = row.QuizHistory.map(q => `${q.CourseTitle}: ${q.Status} (${q.Score})`).join(' | ');
      const quizHistory = `"${quizStr.replace(/"/g, '""')}"`;

      csvContent += `${name},${empId},${dept},${lessons},${duration},${quizHistory}\r\n`;
    });

    // Create file blob and trigger browser download with UTF-8 BOM to prevent Excel display errors
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Create timestamp
    const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    link.setAttribute('download', `Bao_cao_dao_tao_AHCOM_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Xuất tệp báo cáo CSV thành công!', 'success');
  });

  // --- ADMIN TABS CONTROLLER & COURSE EDITOR ---

  // Admin view Tab switching
  el.btnTabAnalytics.addEventListener('click', () => {
    el.btnTabAnalytics.classList.add('active');
    el.btnTabCourses.classList.remove('active');
    el.btnTabWhitelist.classList.remove('active');
    if (el.btnTabDepartments) el.btnTabDepartments.classList.remove('active');
    el.tabContentAnalytics.classList.add('active');
    el.tabContentCourses.classList.remove('active');
    el.tabContentWhitelist.classList.remove('active');
    if (el.tabContentDepartments) el.tabContentDepartments.classList.add('active');
  });

  el.btnTabCourses.addEventListener('click', () => {
    el.btnTabCourses.classList.add('active');
    el.btnTabAnalytics.classList.remove('active');
    el.btnTabWhitelist.classList.remove('active');
    if (el.btnTabDepartments) el.btnTabDepartments.classList.remove('active');
    el.tabContentCourses.classList.add('active');
    el.tabContentAnalytics.classList.remove('active');
    el.tabContentWhitelist.classList.remove('active');
    if (el.tabContentDepartments) el.tabContentDepartments.classList.remove('active');
    renderAdminCoursesTable();
  });

  el.btnTabWhitelist.addEventListener('click', () => {
    el.btnTabWhitelist.classList.add('active');
    el.btnTabAnalytics.classList.remove('active');
    el.btnTabCourses.classList.remove('active');
    if (el.btnTabDepartments) el.btnTabDepartments.classList.remove('active');
    el.tabContentWhitelist.classList.add('active');
    el.tabContentAnalytics.classList.remove('active');
    el.tabContentCourses.classList.remove('active');
    if (el.tabContentDepartments) el.tabContentDepartments.classList.remove('active');
    renderWhitelistTable();
  });

  if (el.btnTabDepartments) {
    el.btnTabDepartments.addEventListener('click', () => {
      el.btnTabDepartments.classList.add('active');
      el.btnTabAnalytics.classList.remove('active');
      el.btnTabCourses.classList.remove('active');
      el.btnTabWhitelist.classList.remove('active');
      el.tabContentDepartments.classList.add('active');
      el.tabContentAnalytics.classList.remove('active');
      el.tabContentCourses.classList.remove('active');
      el.tabContentWhitelist.classList.remove('active');
      renderAdminDepartmentsTable();
    });
  }

  // Draw admin courses list table
  async function renderAdminCoursesTable() {
    const courses = await window.ahcomDB.getCourses();
    el.adminCoursesTableBody.innerHTML = '';

    courses.forEach(course => {
      const quizCount = course.QuizQuestions ? course.QuizQuestions.length : 0;
      const typeLabel = course.ContentType === 'Video' ? '<i class="fa-solid fa-video"></i> Video' : '<i class="fa-solid fa-file-powerpoint"></i> Slides';
      const isHidden = course.IsHidden === true || course.is_hidden === true || String(course.IsHidden) === 'true' || String(course.is_hidden) === 'true';

      const visibilityBadge = isHidden
        ? '<span class="badge-status pending" style="background:#FFFBEB; color:#D97706; border:1px solid #FCD34D; font-size:11px;"><i class="fa-solid fa-eye-slash"></i> Đã ẩn</span>'
        : '<span class="badge-status passed" style="background:#ECFDF5; color:#059669; border:1px solid #6EE7B7; font-size:11px;"><i class="fa-solid fa-eye"></i> Hiển thị</span>';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <strong>${course.Title}</strong>
            ${visibilityBadge}
          </div>
        </td>
        <td><code>${course.Category}</code></td>
        <td>${typeLabel}</td>
        <td style="font-weight:600;">${quizCount} câu hỏi</td>
        <td style="text-align: right; padding-right:24px;">
          <button class="btn btn-secondary btn-toggle-visibility" data-id="${course.CourseID}" style="padding: 6px 12px; font-size:12px; margin-right:6px;">
            <i class="fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i> ${isHidden ? 'Hiện' : 'Ẩn'}
          </button>
          <button class="btn btn-secondary btn-edit-course" data-id="${course.CourseID}" style="padding: 6px 12px; font-size:12px; margin-right:6px;">
            <i class="fa-solid fa-pen-to-square"></i> Sửa
          </button>
          <button class="btn btn-primary btn-delete-course" data-id="${course.CourseID}" style="padding: 6px 12px; font-size:12px;">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      `;

      // Bind toggle visibility click
      tr.querySelector('.btn-toggle-visibility').addEventListener('click', async () => {
        const nextState = !isHidden;
        course.IsHidden = nextState;
        course.is_hidden = nextState;
        await window.ahcomDB.saveCourse(course);
        showToast(nextState ? `Đã ẩn khóa học "${course.Title}" đối với học viên!` : `Đã hiển thị khóa học "${course.Title}" cho học viên!`, 'info');
        await renderAdminCoursesTable();
      });

      // Bind edit click
      tr.querySelector('.btn-edit-course').addEventListener('click', () => {
        openCourseEditorModal(course);
      });

      // Bind delete click
      tr.querySelector('.btn-delete-course').addEventListener('click', async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.Title}" không? Hành động này sẽ xóa toàn bộ tiến trình học và điểm thi liên quan.`)) {
          await window.ahcomDB.deleteCourse(course.CourseID);
          showToast(`Đã xóa khóa học "${course.Title}" thành công!`, 'warning');
          await renderAdminDashboard(); // refreshes stats counters
          await renderAdminCoursesTable(); // refreshes course list table
        }
      });

      el.adminCoursesTableBody.appendChild(tr);
    });
  }

  // Open Modal Course Editor
  async function openCourseEditorModal(course = null) {
    el.formCourseEditor.reset();
    await renderCategoryDropdowns();
    el.editorSlidesList.innerHTML = '';
    el.editorQuestionsList.innerHTML = '';
    el.editorSlideUrl.value = '';
    el.editorSlideSource.value = 'manual';

    // Handle thumbnail loading
    if (course && course.ThumbnailURL) {
      state.currentThumbnailBase64 = course.ThumbnailURL;
      el.editorThumbnailPreview.style.backgroundImage = `url("${course.ThumbnailURL}")`;
      el.editorThumbnailPlaceholder.style.display = 'none';
      el.btnRemoveThumbnail.style.display = 'inline-flex';
    } else {
      state.currentThumbnailBase64 = '';
      el.editorThumbnailPreview.style.backgroundImage = 'none';
      el.editorThumbnailPlaceholder.style.display = 'block';
      el.btnRemoveThumbnail.style.display = 'none';
    }

    if (course) {
      // EDIT MODE
      document.getElementById('course-modal-title').textContent = 'Chỉnh sửa Khóa học AHCOM';
      el.editorCourseId.value = course.CourseID;
      el.editorTitle.value = course.Title;
      el.editorCategory.value = course.Category;
      el.editorContentType.value = course.ContentType;
      el.editorTargetGroup.value = course.TargetGroup || 'All';
      const isCourseHidden = course.IsHidden === true || course.is_hidden === true || String(course.IsHidden) === 'true' || String(course.is_hidden) === 'true';
      if (el.editorIsHidden) el.editorIsHidden.value = isCourseHidden ? 'true' : 'false';

      if (course.ContentType === 'Video') {
        el.editorGroupVideoUrl.style.display = 'block';
        el.editorGroupSlideSource.style.display = 'none';
        el.editorGroupSlideUrl.style.display = 'none';
        el.editorGroupSlides.style.display = 'none';
        
        if (course.ContentURL === 'local-video') {
          el.editorVideoUrl.value = '';
          el.editorVideoUrl.disabled = true;
          el.editorVideoUrl.placeholder = 'Đang sử dụng tệp tải lên từ máy tính';
          el.editorVideoFileName.textContent = 'Tệp đã chọn: [Video đã lưu cục bộ]';
          el.editorVideoFileName.style.display = 'inline';
          el.btnRemoveVideoFile.style.display = 'inline-flex';
        } else {
          el.editorVideoUrl.value = course.ContentURL || '';
          el.editorVideoUrl.disabled = false;
          el.editorVideoUrl.placeholder = 'Nhập đường dẫn Video, ví dụ: https://drive.google.com/file/d/.../view';
          el.editorVideoFileName.textContent = '';
          el.editorVideoFileName.style.display = 'none';
          el.btnRemoveVideoFile.style.display = 'none';
        }
      } else {
        el.editorGroupVideoUrl.style.display = 'none';
        el.editorGroupSlideSource.style.display = 'block';
        el.editorVideoUrl.value = '';
        el.editorVideoUrl.disabled = false;
        el.editorVideoFileName.textContent = '';
        el.editorVideoFileName.style.display = 'none';
        el.btnRemoveVideoFile.style.display = 'none';
        
        const source = course.SlideSource || 'manual';
        el.editorSlideSource.value = source;

        if (source === 'link') {
          el.editorGroupSlideUrl.style.display = 'block';
          el.editorGroupSlides.style.display = 'none';
          
          if (course.ContentURL === 'local-pdf') {
            el.editorSlideUrl.value = '';
            el.editorSlideUrl.disabled = true;
            el.editorSlideUrl.placeholder = 'Đang sử dụng tệp PDF tải lên từ máy tính';
            if (el.editorPdfFileName) {
              el.editorPdfFileName.textContent = 'Tệp đã chọn: [PDF đã lưu cục bộ]';
              el.editorPdfFileName.style.display = 'inline';
            }
            if (el.btnRemovePdfFile) el.btnRemovePdfFile.style.display = 'inline-flex';
          } else {
            el.editorSlideUrl.value = course.ContentURL || '';
            el.editorSlideUrl.disabled = false;
            el.editorSlideUrl.placeholder = 'Nhập đường dẫn tài liệu Slide, ví dụ: https://docs.google.com/presentation/d/.../edit';
            if (el.editorPdfFileName) {
              el.editorPdfFileName.textContent = '';
              el.editorPdfFileName.style.display = 'none';
            }
            if (el.btnRemovePdfFile) el.btnRemovePdfFile.style.display = 'none';
          }
        } else {
          el.editorGroupSlideUrl.style.display = 'none';
          el.editorGroupSlides.style.display = 'block';
          // Render existing slides
          if (course.Slides && course.Slides.length > 0) {
            course.Slides.forEach(slide => {
              addSlideInputRow(slide.Title, slide.Content);
            });
          } else {
            addSlideInputRow();
          }
        }
      }

      // Render existing quiz questions
      if (course.QuizQuestions && course.QuizQuestions.length > 0) {
        course.QuizQuestions.forEach(q => {
          addQuestionInputRow(q.Question, q.Options, q.CorrectIndex);
        });
      } else {
        addQuestionInputRow();
      }
    } else {
      // ADD NEW MODE
      document.getElementById('course-modal-title').textContent = 'Thêm Khóa học mới cho AHCOM';
      el.editorCourseId.value = '';
      el.editorTitle.value = '';
      el.editorCategory.value = 'Sales';
      el.editorContentType.value = 'Video';
      el.editorTargetGroup.value = 'All';
      el.editorGroupVideoUrl.style.display = 'block';
      el.editorGroupSlideSource.style.display = 'none';
      el.editorGroupSlideUrl.style.display = 'none';
      el.editorGroupSlides.style.display = 'none';
      el.editorVideoUrl.value = '';
      el.editorVideoUrl.disabled = false;
      el.editorVideoUrl.placeholder = 'Nhập đường dẫn Video, ví dụ: https://drive.google.com/file/d/.../view';
      el.editorVideoFileName.textContent = '';
      el.editorVideoFileName.style.display = 'none';
      el.btnRemoveVideoFile.style.display = 'none';

      // Seed default blank values
      addQuestionInputRow();
    }

    el.modalCourseEditor.classList.add('active');
  }

  // Hide Modal
  function closeCourseEditorModal() {
    el.modalCourseEditor.classList.remove('active');
    el.editorThumbnailInput.value = '';
    state.currentThumbnailBase64 = '';
    el.editorVideoFileInput.value = '';
    state.pendingVideoFile = null;
    if (el.editorPdfFileInput) el.editorPdfFileInput.value = '';
    state.pendingPdfFile = null;
    if (el.editorPdfFileName) {
      el.editorPdfFileName.textContent = '';
      el.editorPdfFileName.style.display = 'none';
    }
    if (el.btnRemovePdfFile) el.btnRemovePdfFile.style.display = 'none';
    if (el.editorSlideUrl) {
      el.editorSlideUrl.disabled = false;
      el.editorSlideUrl.placeholder = 'Nhập đường dẫn tài liệu Slide, ví dụ: https://docs.google.com/presentation/d/.../edit';
    }
    el.editorVideoFileName.textContent = '';
    el.editorVideoFileName.style.display = 'none';
    el.btnRemoveVideoFile.style.display = 'none';
    el.editorVideoUrl.disabled = false;
    el.editorVideoUrl.placeholder = 'Nhập đường dẫn Video, ví dụ: https://drive.google.com/file/d/.../view';
  }

  el.btnAddNewCourse.addEventListener('click', () => {
    openCourseEditorModal();
  });

  el.btnCloseCourseModal.addEventListener('click', closeCourseEditorModal);
  el.btnCancelCourseModal.addEventListener('click', closeCourseEditorModal);

  // --- COURSE THUMBNAIL MANAGER LOGIC ---
  el.btnUploadThumbnail.addEventListener('click', () => {
    el.editorThumbnailInput.click();
  });

  el.editorThumbnailInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp tin hình ảnh hợp lệ.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for course card thumbnail (e.g. 480x270 for 16:9)
        const MAX_WIDTH = 480;
        const MAX_HEIGHT = 270;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG at 0.7 quality to keep size under 30KB
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        state.currentThumbnailBase64 = compressedBase64;
        el.editorThumbnailPreview.style.backgroundImage = `url("${compressedBase64}")`;
        el.editorThumbnailPlaceholder.style.display = 'none';
        el.btnRemoveThumbnail.style.display = 'inline-flex';
      };
      img.onerror = () => {
        showToast('Lỗi khi tải ảnh vào trình xử lý nén.', 'danger');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      showToast('Lỗi khi đọc file ảnh.', 'danger');
    };
    reader.readAsDataURL(file);
  });

  el.btnRemoveThumbnail.addEventListener('click', () => {
    el.editorThumbnailInput.value = '';
    state.currentThumbnailBase64 = '';
    el.editorThumbnailPreview.style.backgroundImage = 'none';
    el.editorThumbnailPlaceholder.style.display = 'block';
    el.btnRemoveThumbnail.style.display = 'none';
  });

  // --- FULLSCREEN VIEWER TOGGLE LOGIC ---
  const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
  if (btnToggleFullscreen) {
    btnToggleFullscreen.addEventListener('click', () => {
      const container = document.getElementById('learning-media-container');
      const iframe = container ? container.querySelector('iframe') : null;
      const target = iframe || container;

      if (target) {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (target.requestFullscreen) {
            target.requestFullscreen();
          } else if (target.webkitRequestFullscreen) {
            target.webkitRequestFullscreen();
          } else if (target.msRequestFullscreen) {
            target.msRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      }
    });
  }
  el.btnUploadVideo.addEventListener('click', () => {
    el.editorVideoFileInput.click();
  });

  el.editorVideoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Vui lòng chọn tệp tin video hợp lệ (.mp4, .webm).', 'danger');
      return;
    }

    state.pendingVideoFile = file;
    el.editorVideoFileName.textContent = `Tệp đã chọn: ${file.name}`;
    el.editorVideoFileName.style.display = 'inline';
    el.btnRemoveVideoFile.style.display = 'inline-flex';
    
    // Clear and disable text URL input while a local file is pending
    el.editorVideoUrl.value = '';
    el.editorVideoUrl.disabled = true;
    el.editorVideoUrl.placeholder = 'Đang sử dụng tệp tải lên từ máy tính';
  });

  el.btnRemoveVideoFile.addEventListener('click', () => {
    el.editorVideoFileInput.value = '';
    state.pendingVideoFile = null;
    el.editorVideoFileName.textContent = '';
    el.editorVideoFileName.style.display = 'none';
    el.btnRemoveVideoFile.style.display = 'none';
    
    // Re-enable text URL input
    el.editorVideoUrl.disabled = false;
    el.editorVideoUrl.placeholder = 'Nhập đường dẫn Video, ví dụ: https://drive.google.com/file/d/.../view';
  });

  // --- LOCAL PDF UPLOADER MANAGER LOGIC ---
  el.btnUploadPdf.addEventListener('click', () => {
    el.editorPdfFileInput.click();
  });

  el.editorPdfFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Vui lòng chọn tệp tin PDF hợp lệ.', 'danger');
      return;
    }

    state.pendingPdfFile = file;

    // Convert PDF to Base64 string for cross-device syncing (mobile & desktop)
    const reader = new FileReader();
    reader.onload = (evt) => {
      state.pendingPdfBase64 = evt.target.result;
    };
    reader.readAsDataURL(file);

    el.editorPdfFileName.textContent = `Tệp đã chọn: ${file.name}`;
    el.editorPdfFileName.style.display = 'inline';
    el.btnRemovePdfFile.style.display = 'inline-flex';
    
    // Clear and disable URL input
    el.editorSlideUrl.value = '';
    el.editorSlideUrl.disabled = true;
    el.editorSlideUrl.placeholder = 'Đang sử dụng tệp tải lên từ máy tính';
  });

  el.btnRemovePdfFile.addEventListener('click', () => {
    el.editorPdfFileInput.value = '';
    state.pendingPdfFile = null;
    state.pendingPdfBase64 = '';
    el.editorPdfFileName.textContent = '';
    el.editorPdfFileName.style.display = 'none';
    el.btnRemovePdfFile.style.display = 'none';
    
    el.editorSlideUrl.disabled = false;
    el.editorSlideUrl.placeholder = 'Nhập đường dẫn tài liệu Slide, ví dụ: https://docs.google.com/presentation/d/.../edit';
  });

  // Content type change event handler
  el.editorContentType.addEventListener('change', () => {
    const selectedType = el.editorContentType.value;
    if (selectedType === 'Video') {
      el.editorGroupVideoUrl.style.display = 'block';
      el.editorGroupSlideSource.style.display = 'none';
      el.editorGroupSlideUrl.style.display = 'none';
      el.editorGroupSlides.style.display = 'none';
    } else {
      el.editorGroupVideoUrl.style.display = 'none';
      el.editorGroupSlideSource.style.display = 'block';
      
      const source = el.editorSlideSource.value;
      if (source === 'link') {
        el.editorGroupSlideUrl.style.display = 'block';
        el.editorGroupSlides.style.display = 'none';
      } else {
        el.editorGroupSlideUrl.style.display = 'none';
        el.editorGroupSlides.style.display = 'block';
        if (el.editorSlidesList.children.length === 0) {
          addSlideInputRow();
        }
      }
    }
  });

  // Slide Source change event handler
  el.editorSlideSource.addEventListener('change', () => {
    const source = el.editorSlideSource.value;
    if (source === 'link') {
      el.editorGroupSlideUrl.style.display = 'block';
      el.editorGroupSlides.style.display = 'none';
    } else {
      el.editorGroupSlideUrl.style.display = 'none';
      el.editorGroupSlides.style.display = 'block';
      if (el.editorSlidesList.children.length === 0) {
        addSlideInputRow();
      }
    }
  });

  // Add Slide Input Card
  function addSlideInputRow(title = '', content = '') {
    const card = document.createElement('div');
    card.className = 'editor-item-card';
    
    card.innerHTML = `
      <button type="button" class="btn-remove-item"><i class="fa-solid fa-trash-can"></i> Xóa trang này</button>
      <div class="form-group" style="margin-top: 16px;">
        <label>Tiêu đề Slide</label>
        <input type="text" class="form-input slide-title-input" placeholder="Ví dụ: Slide 1: Khái niệm" required>
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label>Nội dung chi tiết Slide</label>
        <textarea class="form-input slide-content-input" rows="3" placeholder="Nhập văn bản giảng dạy hiển thị trên slide..." required style="resize:vertical; font-family:var(--font-family);"></textarea>
      </div>
    `;

    const titleInput = card.querySelector('.slide-title-input');
    const contentInput = card.querySelector('.slide-content-input');
    if (titleInput) titleInput.value = title;
    if (contentInput) contentInput.value = content;

    card.querySelector('.btn-remove-item').addEventListener('click', () => {
      card.remove();
    });

    const listContainer = document.getElementById('editor-slides-list');
    if (listContainer) {
      listContainer.appendChild(card);
    }
  }

  let questionCounter = 0;
  // Add Question Input Card
  function addQuestionInputRow(questionText = '', options = ['', '', '', ''], correctIndex = 0) {
    questionCounter++;
    const cardId = 'question-' + questionCounter + '-' + Math.round(Math.random() * 100000);
    const card = document.createElement('div');
    card.className = 'editor-item-card';
    card.id = cardId;

    const radioGroupName = `correct-option-${cardId}`;

    card.innerHTML = `
      <button type="button" class="btn-remove-item"><i class="fa-solid fa-trash-can"></i> Xóa câu hỏi</button>
      <div class="form-group" style="margin-top: 16px;">
        <label>Nội dung câu hỏi trắc nghiệm</label>
        <input type="text" class="form-input q-text-input" placeholder="Nhập câu hỏi..." required>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>Các lựa chọn và tích chọn đáp án đúng</label>
        
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="0" ${correctIndex === 0 ? 'checked' : ''} required>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án A" required>
        </div>
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="1" ${correctIndex === 1 ? 'checked' : ''}>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án B" required>
        </div>
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="2" ${correctIndex === 2 ? 'checked' : ''}>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án C" required>
        </div>
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="3" ${correctIndex === 3 ? 'checked' : ''}>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án D" required>
        </div>
      </div>
    `;

    // Safely set values via JS DOM properties to prevent HTML quote attribute truncation
    const qInput = card.querySelector('.q-text-input');
    if (qInput) qInput.value = questionText;

    const optionInputs = card.querySelectorAll('.q-opt-input');
    if (optionInputs[0]) optionInputs[0].value = options[0] || '';
    if (optionInputs[1]) optionInputs[1].value = options[1] || '';
    if (optionInputs[2]) optionInputs[2].value = options[2] || '';
    if (optionInputs[3]) optionInputs[3].value = options[3] || '';

    card.querySelector('.btn-remove-item').addEventListener('click', () => {
      card.remove();
    });

    const listContainer = document.getElementById('editor-questions-list');
    if (listContainer) {
      listContainer.appendChild(card);
    }
  }

  // --- AI AUTOMATIC QUIZ GENERATOR FROM LESSON CONTENT ---
  function generateAIQuestionsFromContent() {
    const courseTitle = el.editorTitle.value.trim() || 'Bài học AHCOM';
    const category = el.editorCategory.value || 'General';
    const slideCards = el.editorSlidesList.querySelectorAll('.editor-item-card');

    let generatedQuestions = [];

    if (slideCards && slideCards.length > 0) {
      // Extract key concepts from slides
      slideCards.forEach((card, idx) => {
        const title = card.querySelector('.slide-title-input').value.trim();
        const content = card.querySelector('.slide-content-input').value.trim();

        if (title || content) {
          const mainTopic = title || `Nội dung phần ${idx + 1}`;
          const contentSnippet = content ? content.slice(0, 120) : mainTopic;

          generatedQuestions.push({
            Question: `Theo nội dung bài học "${mainTopic}", đâu là kiến thức trọng tâm chính xác?`,
            Options: [
              contentSnippet ? `${contentSnippet}` : `Nội dung cốt lõi của ${mainTopic}`,
              `Thông tin chưa đầy đủ hoặc không được áp dụng tại AHCOM`,
              `Quy định không bắt buộc đối với nhân sự chính thức`,
              `Tài liệu tham khảo chưa được phê duyệt bởi Ban Giám Đốc`
            ],
            CorrectIndex: 0
          });

          if (content.length > 40) {
            generatedQuestions.push({
              Question: `Mục tiêu chính của phần học "${mainTopic}" nhằm cung cấp kỹ năng gì cho nhân sự?`,
              Options: [
                `Nắm vững quy trình và thực hành hiệu quả theo nội dung ${mainTopic}`,
                `Thay thế toàn bộ quy trình làm việc cũ tại đại lý`,
                `Chỉ áp dụng thử nghiệm trong thời gian ngắn`,
                `Báo cáo kết quả trực tiếp cho cơ quan ngoài`
              ],
              CorrectIndex: 0
            });
          }
        }
      });
    }

    // Fallback template questions based on Course Title & Category if slides are empty
    if (generatedQuestions.length === 0) {
      if (category === 'Sales' || courseTitle.toLowerCase().includes('bán hàng')) {
        generatedQuestions = [
          {
            Question: `Kỹ năng quan trọng nhất trong bài học "${courseTitle}" khi tiếp xúc với khách hàng là gì?`,
            Options: [
              `Lắng nghe nhu cầu, tư vấn giải pháp phù hợp và xây dựng niềm tin với khách hàng`,
              `Ép buộc khách hàng ký hợp đồng ngay trong lần gặp đầu tiên`,
              `Bỏ qua các thắc mắc của khách hàng về giá sản phẩm`,
              `Chỉ giới thiệu thông số mà không tìm hiểu nhu cầu thực tế`
            ],
            CorrectIndex: 0
          },
          {
            Question: `Theo nội dung bài học "${courseTitle}", bước nào sau đây là bắt buộc trong quy trình chăm sóc khách hàng?`,
            Options: [
              `Theo dõi, phản hồi thắc mắc và hỗ trợ khách hàng sau khi hoàn tất giao dịch`,
              `Kết thúc liên lạc ngay sau khi khách hàng thanh toán`,
              `Chờ khách hàng tự tìm hiểu và không chủ động chăm sóc`,
              `Chuyển toàn bộ hồ sơ cho bộ phận khác mà không bàn giao`
            ],
            CorrectIndex: 0
          }
        ];
      } else if (category === 'DISC' || courseTitle.toLowerCase().includes('disc')) {
        generatedQuestions = [
          {
            Question: `Mục đích của việc ứng dụng bài học "${courseTitle}" trong giao tiếp công việc là gì?`,
            Options: [
              `Nhận biết nhóm tính cách để thấu hiểu và giao tiếp hiệu quả với đồng nghiệp, khách hàng`,
              `Phân loại và đánh giá năng lực làm việc của nhân sự`,
              `Áp dụng một phong cách giao tiếp duy nhất cho tất cả mọi người`,
              `Tránh tiếp xúc với những người có nhóm tính cách khác mình`
            ],
            CorrectIndex: 0
          },
          {
            Question: `Khi giao tiếp công việc theo nội dung bài học "${courseTitle}", bạn nên ứng xử như thế nào?`,
            Options: [
              `Chuẩn bị thông tin ngắn gọn, đi thẳng vào trọng tâm và đưa ra giải pháp rõ ràng`,
              `Nói chuyện lan man không có mục đích cụ thể`,
              `Thay đổi kế hoạch liên tục không thông báo trước`,
              `Giao việc mà không nêu rõ thời hạn hoàn thành`
            ],
            CorrectIndex: 0
          }
        ];
      } else {
        generatedQuestions = [
          {
            Question: `Yêu cầu cốt lõi đối với học viên sau khi hoàn thành bài học "${courseTitle}" là gì?`,
            Options: [
              `Hiểu rõ kiến thức, tuân thủ đúng quy trình và áp dụng hiệu quả vào công việc thực tế`,
              `Chỉ cần hoàn thành bài thi trắc nghiệm mà không cần áp dụng`,
              `Ghi nhớ lý thuyết và không cần chia sẻ với đồng nghiệp`,
              `Thay đổi quy trình làm việc theo ý kiến cá nhân`
            ],
            CorrectIndex: 0
          },
          {
            Question: `Trách nhiệm của nhân sự AHCOM sau khi nghiên cứu nội dung bài học "${courseTitle}" là gì?`,
            Options: [
              `Chủ động cập nhật kiến thức, thực hiện đúng hướng dẫn và tham gia đánh giá định kỳ`,
              `Chờ nhắc nhở từ cấp quản lý mới bắt đầu thực hiện`,
              `Chỉ thực hiện khi có yêu cầu từ Ban Giám Đốc`,
              `Bỏ qua các cập nhật mới trong tài liệu hướng dẫn`
            ],
            CorrectIndex: 0
          }
        ];
      }
    }

    return generatedQuestions;
  }

  // Event delegation to handle dynamic clicks on Add Slide, Add Question, Import Slides, AI Quiz buttons
  document.addEventListener('click', (e) => {
    const aiQuizBtn = e.target.closest('#btn-editor-ai-quiz');
    if (aiQuizBtn) {
      e.preventDefault();
      const questions = generateAIQuestionsFromContent();
      if (questions && questions.length > 0) {
        const questionsList = document.getElementById('editor-questions-list');
        if (questionsList) {
          questionsList.innerHTML = '';
        }
        questions.forEach(q => {
          addQuestionInputRow(q.Question, q.Options, q.CorrectIndex);
        });
        showToast(`✨ Đã tự động tạo ${questions.length} câu hỏi trắc nghiệm kèm đáp án chuẩn từ nội dung bài học!`, 'success');
      }
      return;
    }
    const addSlideBtn = e.target.closest('#btn-editor-add-slide');
    if (addSlideBtn) {
      e.preventDefault();
      addSlideInputRow();
      return;
    }

    const addQuestionBtn = e.target.closest('#btn-editor-add-question');
    if (addQuestionBtn) {
      e.preventDefault();
      addQuestionInputRow();
      return;
    }

    const importSlidesBtn = e.target.closest('#btn-editor-import-slides');
    if (importSlidesBtn) {
      e.preventDefault();
      const fileInput = document.getElementById('editor-slides-file-input');
      if (fileInput) fileInput.click();
      return;
    }
  });

  // Handle slide file import change dynamically (Supports Excel .xlsx/.xls, CSV, TXT)
  document.addEventListener('change', (e) => {
    if (e.target.id === 'editor-slides-file-input') {
      const file = e.target.files[0];
      if (!file) return;

      const fileExtension = file.name.split('.').pop().toLowerCase();

      // Unsupported binary files warning (PowerPoint / PDF / Docs)
      if (['pptx', 'ppt', 'pdf', 'docx', 'doc'].includes(fileExtension)) {
        showToast(`Đối với tệp ${fileExtension.toUpperCase()}, bạn vui lòng chọn 'Nguồn tài liệu Slide' -> 'Nhập liên kết tài liệu ngoài' (Google Slides/PDF) hoặc lưu tệp thành định dạng Excel (.xlsx) / TXT để nhập tự động.`, 'warning');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        if (typeof XLSX === 'undefined') {
          showToast('Cần kết nối internet để tải thư viện đọc tệp Excel. Vui lòng thử lại hoặc lưu tệp thành dạng .txt / .csv.', 'danger');
          e.target.value = '';
          return;
        }

        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
              showToast('Tệp Excel không chứa dữ liệu slide hợp lệ.', 'danger');
              e.target.value = '';
              return;
            }

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            let slides = [];
            const ignoredHeaders = ['STT', 'NO', 'NUM', 'TIÊU ĐỀ', 'TIEU DE', 'TITLE', 'NỘI DUNG', 'NOI DUNG', 'CONTENT'];

            rows.forEach(row => {
              if (Array.isArray(row) && row.length > 0) {
                const sTitle = (row[0] !== undefined && row[0] !== null) ? row[0].toString().trim() : '';
                const sContent = (row[1] !== undefined && row[1] !== null) ? row[1].toString().trim() : '';
                
                if (sTitle && !ignoredHeaders.includes(sTitle.toUpperCase())) {
                  slides.push({ Title: sTitle, Content: sContent });
                }
              }
            });

            if (slides.length === 0) {
              showToast('Không tìm thấy nội dung slide hợp lệ trong tệp Excel. Cột 1 cần chứa Tiêu đề Slide, Cột 2 chứa Nội dung Slide.', 'danger');
              e.target.value = '';
              return;
            }

            if (slides.length > 50) {
              showToast(`Tệp Excel chứa ${slides.length} trang. Hệ thống lấy 50 slide đầu tiên để tối ưu hiệu năng.`, 'warning');
              slides = slides.slice(0, 50);
            }

            slides.forEach(s => addSlideInputRow(s.Title, s.Content));
            showToast(`Đã nhập thành công ${slides.length} trang slide từ tệp Excel!`, 'success');
          } catch (err) {
            console.error(err);
            showToast('Lỗi khi phân tích tệp Excel. Vui lòng kiểm tra lại cấu trúc tệp.', 'danger');
          }
          e.target.value = '';
        };

        reader.onerror = () => {
          showToast('Lỗi khi đọc tệp Excel.', 'danger');
          e.target.value = '';
        };

        reader.readAsArrayBuffer(file);
      } else {
        // Handle TXT or CSV
        reader.onload = (event) => {
          try {
            const text = event.target.result;
            let slides = [];

            if (fileExtension === 'csv') {
              const lines = text.split(/[\r\n]+/);
              lines.forEach(line => {
                if (!line.trim()) return;
                const parts = line.split(/[,;]/);
                if (parts.length >= 1) {
                  const sTitle = parts[0].trim().replace(/^["']|["']$/g, '');
                  const sContent = parts.slice(1).join(',').trim().replace(/^["']|["']$/g, '').replace(/""/g, '"');
                  
                  if (sTitle && sTitle.toLowerCase() !== 'tiêu đề' && sTitle.toLowerCase() !== 'title') {
                    slides.push({ Title: sTitle, Content: sContent });
                  }
                }
              });
            } else {
              // TXT
              const blocks = text.split(/\r?\n\r?\n/);
              blocks.forEach(block => {
                const trimmedBlock = block.trim();
                if (!trimmedBlock) return;
                
                const lines = trimmedBlock.split(/\r?\n/);
                const sTitle = lines[0].trim();
                const sContent = lines.slice(1).join('\n').trim();
                
                if (sTitle) {
                  slides.push({ Title: sTitle, Content: sContent });
                }
              });
            }

            if (slides.length === 0) {
              showToast('Không tìm thấy nội dung slide hợp lệ trong tệp tin.', 'danger');
              e.target.value = '';
              return;
            }

            if (slides.length > 50) {
              showToast(`Tệp chứa ${slides.length} trang. Hệ thống lấy 50 slide đầu tiên để tối ưu hiệu năng.`, 'warning');
              slides = slides.slice(0, 50);
            }

            slides.forEach(s => addSlideInputRow(s.Title, s.Content));
            showToast(`Đã nhập thành công ${slides.length} trang slide bài giảng!`, 'success');
          } catch (err) {
            console.error(err);
            showToast('Lỗi khi xử lý nội dung tệp tin slide.', 'danger');
          }
          e.target.value = '';
        };

        reader.onerror = () => {
          showToast('Lỗi khi đọc tệp tin slide.', 'danger');
          e.target.value = '';
        };

        reader.readAsText(file);
      }
    }
  });

  // Handle Course Form Submit
  el.formCourseEditor.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const courseId = el.editorCourseId.value || null;
      const title = el.editorTitle.value.trim();
      const category = el.editorCategory.value;
      const contentType = el.editorContentType.value;
      const targetGroup = el.editorTargetGroup.value;

      const isHiddenValue = el.editorIsHidden ? el.editorIsHidden.value === 'true' : false;

      const courseData = {
        CourseID: courseId,
        Title: title,
        Category: category,
        ContentType: contentType,
        TargetGroup: targetGroup,
        IsHidden: isHiddenValue,
        is_hidden: isHiddenValue,
        ThumbnailURL: state.currentThumbnailBase64,
        QuizQuestions: [],
        ScopeCompany: el.editorScopeCompany.value,
        ScopeDepartment: el.editorScopeDepartment.value,
        CreatedByUserId: state.currentUser ? state.currentUser.UserID : null
      };

      // Gather and validate Video vs Slide contents
      if (contentType === 'Video') {
        const videoUrl = el.editorVideoUrl.value.trim();
        const hasPendingVideo = !!state.pendingVideoFile;
        const hasExistingLocalVideo = courseId && el.editorVideoFileName.textContent.includes('[Video đã lưu cục bộ]');

        if (!videoUrl && !hasPendingVideo && !hasExistingLocalVideo) {
          showToast('Vui lòng nhập đường dẫn video hoặc tải file video từ máy tính.', 'danger');
          return;
        }
        
        if (hasPendingVideo || hasExistingLocalVideo) {
          courseData.ContentURL = 'local-video';
        } else {
          courseData.ContentURL = videoUrl;
        }
        courseData.SlideSource = 'manual';
      } else {
        let slideSource = el.editorSlideSource.value;
        const slideUrl = el.editorSlideUrl.value.trim();
        const slideCards = el.editorSlidesList.querySelectorAll('.editor-item-card');
        const hasPendingPdf = !!state.pendingPdfFile;
        const hasExistingLocalPdf = courseId && el.editorPdfFileName && el.editorPdfFileName.textContent.includes('[PDF đã lưu cục bộ]');

        // Smart Fallback: If user uploaded PDF or pasted link
        if (hasPendingPdf || hasExistingLocalPdf) {
          slideSource = 'link';
          el.editorSlideSource.value = 'link';
        } else if (slideSource === 'manual' && slideCards.length === 0 && slideUrl) {
          slideSource = 'link';
          el.editorSlideSource.value = 'link';
        }

        courseData.SlideSource = slideSource;

        if (slideSource === 'link') {
          if (!slideUrl && !hasPendingPdf && !hasExistingLocalPdf && !state.pendingPdfBase64) {
            showToast('Vui lòng nhập đường dẫn tài liệu Slide hoặc tải tệp PDF từ máy tính.', 'danger');
            return;
          }

          if (state.pendingPdfBase64) {
            courseData.ContentURL = state.pendingPdfBase64;
          } else if (hasPendingPdf || hasExistingLocalPdf) {
            courseData.ContentURL = 'local-pdf';
          } else {
            courseData.ContentURL = slideUrl;
          }
          courseData.Slides = [];
        } else {
          if (slideCards.length === 0) {
            showToast('Vui lòng bấm nút "+ Thêm trang Slide" (hoặc dán đường dẫn tài liệu ngoài) trước khi lưu.', 'danger');
            return;
          }

          const slides = [];
          slideCards.forEach(card => {
            const sTitle = card.querySelector('.slide-title-input').value.trim();
            const sContent = card.querySelector('.slide-content-input').value.trim();
            slides.push({ Title: sTitle, Content: sContent });
          });
          courseData.Slides = slides;
          courseData.ContentURL = '';
        }
      }

      // Gather and validate Quiz Questions
      const questionCards = el.editorQuestionsList.querySelectorAll('.editor-item-card');
      if (questionCards.length === 0) {
        showToast('Vui lòng thêm ít nhất 1 câu hỏi trắc nghiệm kiểm tra.', 'danger');
        return;
      }

      const quizQuestions = [];
      let validationError = false;

      questionCards.forEach(card => {
        const qText = card.querySelector('.q-text-input').value.trim();
        const optionInputs = card.querySelectorAll('.q-opt-input');
        const correctRadio = card.querySelector('input[type="radio"]:checked');

        if (!correctRadio) {
          validationError = true;
          return;
        }

        const options = Array.from(optionInputs).map(input => input.value.trim());
        const correctIdx = parseInt(correctRadio.value);

        quizQuestions.push({
          Question: qText,
          Options: options,
          CorrectIndex: correctIdx
        });
      });

      if (validationError) {
        showToast('Vui lòng chọn đáp án đúng cho tất cả các câu hỏi.', 'danger');
        return;
      }

      courseData.QuizQuestions = quizQuestions;

      // Save to simulated database
      const saved = await window.ahcomDB.saveCourse(courseData);

      // Save video file to IndexedDB if a new file is pending
      if (contentType === 'Video' && state.pendingVideoFile) {
        try {
          await window.ahcomDB.largeFileStorage.saveVideo(saved.CourseID, state.pendingVideoFile);
        } catch (err) {
          console.error("Lỗi khi lưu video cục bộ: ", err);
          showToast('Lỗi khi lưu tệp tin video vào IndexedDB.', 'danger');
        }
      }

      // Save PDF file to IndexedDB if a new PDF file is pending
      if (state.pendingPdfFile) {
        try {
          await window.ahcomDB.largeFileStorage.saveDocument(saved.CourseID, state.pendingPdfFile);
        } catch (err) {
          console.error("Lỗi khi lưu PDF cục bộ: ", err);
          showToast('Lỗi khi lưu tệp tin PDF vào IndexedDB.', 'danger');
        }
      }

      showToast(`Đã lưu khóa học "${saved.Title}" thành công!`, 'success');
      
      // Refresh panels
      await renderAdminDashboard();
      await renderAdminCoursesTable();
      closeCourseEditorModal();
    } catch (err) {
      console.error("Lỗi khi lưu khóa học: ", err);
      showToast("Lỗi khi lưu khóa học: " + err.message, "danger");
    }
  });

  // --- ADMIN EMPLOYEE WHITELIST MANAGER LOGIC ---

  // Draw Whitelist table
  async function renderWhitelistTable() {
    const validIDs = await window.ahcomDB.getValidEmployeeIDs();
    el.whitelistCountBadge.textContent = `${validIDs.length} mã`;
    el.adminWhitelistTableBody.innerHTML = '';

    // Reset select all checkbox and delete selected button
    const chkSelectAll = document.getElementById('chk-select-all-whitelist');
    const btnDeleteSelected = document.getElementById('btn-delete-selected-whitelist');
    
    if (chkSelectAll) chkSelectAll.checked = false;
    if (btnDeleteSelected) btnDeleteSelected.style.display = 'none';

    validIDs.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-chk" style="text-align: center; padding: 10px;">
          <input type="checkbox" class="chk-select-whitelist" data-id="${item.EmployeeID}" style="cursor: pointer; transform: scale(1.15);">
        </td>
        <td class="col-stt" style="text-align: center;">${idx + 1}</td>
        <td class="col-empid" style="word-break: break-all;"><code style="word-break: break-all; white-space: pre-wrap;">${item.EmployeeID}</code></td>
        <td class="col-action" style="text-align: right; padding-right: 24px;">
          <button class="btn btn-primary btn-delete-whitelist" data-id="${item.EmployeeID}" style="padding: 6px 12px; font-size:12px;">
            <i class="fa-solid fa-trash-can"></i> Xóa mã
          </button>
        </td>
      `;

      // Bind delete click
      tr.querySelector('.btn-delete-whitelist').addEventListener('click', async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa mã nhân viên "${item.EmployeeID}" khỏi Whitelist đăng ký?`)) {
          const result = await window.ahcomDB.deleteValidEmployeeID(item.EmployeeID);
          if (result.success) {
            showToast(result.message, 'success');
            await renderWhitelistTable();
          } else {
            showToast(result.message, 'danger');
          }
        }
      });

      // Bind individual checkbox click
      tr.querySelector('.chk-select-whitelist').addEventListener('change', () => {
        updateBulkDeleteButtonState();
      });

      el.adminWhitelistTableBody.appendChild(tr);
    });
  }

  // Helper to show/hide "Xóa mục chọn" button and update "Chọn tất cả" checkbox state
  function updateBulkDeleteButtonState() {
    const checkboxes = document.querySelectorAll('.chk-select-whitelist');
    const checkedCheckboxes = document.querySelectorAll('.chk-select-whitelist:checked');
    const chkSelectAll = document.getElementById('chk-select-all-whitelist');
    const btnDeleteSelected = document.getElementById('btn-delete-selected-whitelist');

    if (btnDeleteSelected) {
      if (checkedCheckboxes.length > 0) {
        btnDeleteSelected.style.display = 'inline-flex';
        btnDeleteSelected.innerHTML = `<i class="fa-solid fa-trash-can"></i> Xóa ${checkedCheckboxes.length} mục chọn`;
      } else {
        btnDeleteSelected.style.display = 'none';
      }
    }

    if (chkSelectAll && checkboxes.length > 0) {
      chkSelectAll.checked = (checkboxes.length === checkedCheckboxes.length);
    }
  }

  // Bind Whitelist select all checkbox change
  document.addEventListener('change', (e) => {
    if (e.target.id === 'chk-select-all-whitelist') {
      const isChecked = e.target.checked;
      const checkboxes = document.querySelectorAll('.chk-select-whitelist');
      checkboxes.forEach(chk => chk.checked = isChecked);
      updateBulkDeleteButtonState();
    }
  });

  // Bind Bulk Delete Selected button click
  document.addEventListener('click', async (e) => {
    const btnDeleteSelected = e.target.closest('#btn-delete-selected-whitelist');
    if (btnDeleteSelected) {
      e.preventDefault();
      const checkedCheckboxes = document.querySelectorAll('.chk-select-whitelist:checked');
      const selectedIds = Array.from(checkedCheckboxes).map(chk => chk.dataset.id);
      
      if (selectedIds.length === 0) return;

      if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mã nhân viên đã chọn khỏi danh sách Whitelist?`)) {
        const result = await window.ahcomDB.deleteValidEmployeeIDs(selectedIds);
        if (result.success) {
          showToast(result.message, 'success');
          await renderWhitelistTable();
        } else {
          showToast(result.message, 'danger');
        }
      }
    }

    // Bind Clear All button click
    const btnClearAll = e.target.closest('#btn-clear-all-whitelist');
    if (btnClearAll) {
      e.preventDefault();
      const validIDs = await window.ahcomDB.getValidEmployeeIDs();
      if (validIDs.length === 0) {
        showToast('Danh sách mã hiện tại đang trống.', 'warning');
        return;
      }
      
      if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách mã nhân viên Whitelist? Hành động này không thể hoàn tác.')) {
        const result = await window.ahcomDB.clearAllValidEmployeeIDs();
        if (result.success) {
          showToast(result.message, 'success');
          await renderWhitelistTable();
        } else {
          showToast(result.message, 'danger');
        }
      }
    }
  });

  // Handle Add Whitelist submit
  el.formAddWhitelist.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newEmpId = el.whitelistEmpIdInput.value.trim();
    if (!newEmpId) return;

    const result = await window.ahcomDB.addValidEmployeeID(newEmpId);

    if (result.success) {
      showToast(result.message, 'success');
      el.whitelistEmpIdInput.value = '';
      await renderWhitelistTable();
    } else {
      showToast(result.message, 'danger');
    }
  });

  // Trigger hidden file input click
  el.btnImportWhitelistFile.addEventListener('click', () => {
    el.whitelistFileInput.click();
  });

  // Handle Whitelist file upload and parse (Supports Excel xlsx/xls, TXT, CSV)
  el.whitelistFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      if (typeof XLSX === 'undefined') {
        showToast('Trình duyệt cần kết nối mạng để tải thư viện Excel (.xlsx). Vui lòng lưu tệp thành dạng .txt/.csv và thử lại, hoặc kiểm tra kết nối internet.', 'danger');
        el.whitelistFileInput.value = '';
        return;
      }

      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const codes = [];
          const ignoredHeaders = ['STT', 'NO', 'NUM', 'MÃ NHÂN VIÊN', 'MA NHAN VIEN', 'EMPLOYEE ID', 'EMPLOYEEID', 'HỌ TÊN', 'HO TEN', 'TÊN', 'TEN', 'PHÒNG BAN', 'PHONG BAN', 'CHỨC VỤ', 'CHUC VU', 'EMAIL'];
          
          rows.forEach(row => {
            if (Array.isArray(row)) {
              row.forEach(cell => {
                if (cell !== null && cell !== undefined) {
                  const str = cell.toString().trim().toUpperCase();
                  if (str.length > 0 && !ignoredHeaders.includes(str)) {
                    // Only accept strings with alphanumeric characters, dashes, and underscores (like AHCOM001)
                    if (/^[A-Z0-9_/\-]+$/.test(str)) {
                      codes.push(str);
                    }
                  }
                }
              });
            }
          });

          if (codes.length === 0) {
            showToast('Không tìm thấy mã nhân viên hợp lệ nào trong tệp Excel.', 'danger');
            el.whitelistFileInput.value = '';
            return;
          }

          const result = await window.ahcomDB.importValidEmployeeIDs(codes);
          if (result.success) {
            showToast(result.message, 'success');
            await renderWhitelistTable();
          } else {
            showToast(result.message, 'danger');
          }
        } catch (error) {
          console.error(error);
          showToast('Lỗi khi phân tích tệp Excel. Vui lòng kiểm tra lại định dạng tệp.', 'danger');
        }
        el.whitelistFileInput.value = '';
      };

      reader.onerror = () => {
        showToast('Lỗi khi đọc tệp tin.', 'danger');
        el.whitelistFileInput.value = '';
      };

      reader.readAsArrayBuffer(file);
    } else {
      // Handle standard TXT or CSV
      reader.onload = async (event) => {
        const text = event.target.result;
        
        // Split codes by lines, commas, semicolons, or tabs
        const codes = text
          .split(/[\r\n\t,;]+/)
          .map(code => code.trim().toUpperCase())
          .filter(code => code.length > 0);

        if (codes.length === 0) {
          showToast('Không tìm thấy mã nhân sự hợp lệ nào trong tệp tin.', 'danger');
          el.whitelistFileInput.value = '';
          return;
        }

        const result = await window.ahcomDB.importValidEmployeeIDs(codes);
        
        if (result.success) {
          showToast(result.message, 'success');
          await renderWhitelistTable();
        } else {
          showToast(result.message, 'danger');
        }

        el.whitelistFileInput.value = '';
      };

      reader.onerror = () => {
        showToast('Lỗi khi đọc tệp tin. Vui lòng kiểm tra lại định dạng tệp.', 'danger');
        el.whitelistFileInput.value = '';
      };

      reader.readAsText(file);
    }
  });

  // --- ADMIN USER EDITOR CONTROLLER ---
  async function openUserEditorModal(userId) {
    const users = await window.ahcomDB.getUsers();
    const user = users.find(u => u.UserID === userId);
    if (!user) {
      showToast('Không tìm thấy người dùng.', 'danger');
      return;
    }

    el.editorUserId.value = user.UserID;
    el.editorUserFullname.value = user.FullName;
    el.editorUserEmpId.value = user.EmployeeID;
    el.editorUserEmail.value = user.Email;

    // Load static dropdown choices
    await renderCompanyDropdowns();
    el.editorUserCompany.value = user.Company || 'AHCOM Tổng';

    await renderDepartmentDropdowns();
    el.editorUserDept.value = user.Department || 'Phòng Kinh doanh';
    el.editorUserJobLevel.value = user.JobLevel || 'Staff';
    el.editorUserRole.value = user.Role || 'Student';
    el.editorUserPassword.value = ''; // Leave blank initially
    const confirmInput = document.getElementById('editor-user-confirm-password');
    if (confirmInput) confirmInput.value = '';

    // Disable company and role selection for CompanyAdmin / DeptAdmin in user editor modal
    const role = state.currentUser.Role;
    if (role === 'CompanyAdmin' || role === 'DeptAdmin') {
      el.editorUserCompany.disabled = true;
      el.editorUserRole.disabled = true;
    } else {
      el.editorUserCompany.disabled = false;
      el.editorUserRole.disabled = false;
    }

    el.modalUserEditor.classList.add('active');
  }

  function closeUserEditorModal() {
    el.modalUserEditor.classList.remove('active');
  }

  el.btnCloseUserModal.addEventListener('click', closeUserEditorModal);
  el.btnCancelUserModal.addEventListener('click', closeUserEditorModal);

  el.formUserEditor.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = el.editorUserId.value;
    const fullName = el.editorUserFullname.value.trim();
    const empId = el.editorUserEmpId.value.trim().toUpperCase();
    const email = el.editorUserEmail.value.trim();
    const company = el.editorUserCompany.value;
    const department = el.editorUserDept.value;
    const jobLevel = el.editorUserJobLevel.value;
    const accountRole = el.editorUserRole.value;
    const password = el.editorUserPassword.value.trim();
    const confirmPasswordInput = document.getElementById('editor-user-confirm-password');
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';

    const updatedData = {
      FullName: fullName,
      EmployeeID: empId,
      Email: email,
      Company: company,
      Department: department,
      JobLevel: jobLevel,
      Role: accountRole
    };

    if (password) {
      if (password.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'danger');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Xác nhận mật khẩu mới không khớp.', 'danger');
        return;
      }
      updatedData.Password = password;
    }

    const result = await window.ahcomDB.updateUserProfile(userId, updatedData);
    if (result.success) {
      showToast('Cập nhật thông tin thành viên thành công!', 'success');
      closeUserEditorModal();
      await renderAdminDashboard(); // Refresh reporting table
    } else {
      showToast(result.message, 'danger');
    }
  });


  // --- STUDENT PROFILE EDITOR CONTROLLER ---
  async function openProfileEditorModal() {
    if (!state.currentUser) return;
    
    // Fetch latest user details from DB to make sure we edit fresh data
    const users = await window.ahcomDB.getUsers();
    const user = users.find(u => u.UserID === state.currentUser.UserID);
    if (!user) return;

    el.profileFullname.value = user.FullName;
    el.profileEmpId.value = user.EmployeeID;
    el.profileEmail.value = user.Email;

    // Load static dropdown choices
    await renderCompanyDropdowns();
    el.profileCompany.value = user.Company || 'AHCOM Tổng';

    await renderDepartmentDropdowns();
    el.profileDept.value = user.Department || 'Phòng Kinh doanh';
    el.profileJobLevel.value = user.JobLevel || 'Staff';
    el.profilePassword.value = ''; // Leave blank initially
    const confirmInput = document.getElementById('profile-confirm-password');
    if (confirmInput) confirmInput.value = '';

    el.modalProfileEditor.classList.add('active');
  }

  function closeProfileEditorModal() {
    el.modalProfileEditor.classList.remove('active');
  }

  const triggerProfileModal = async (e) => {
    if (e) e.preventDefault();
    await openProfileEditorModal();
  };

  if (el.btnNavProfile) el.btnNavProfile.addEventListener('click', triggerProfileModal);
  if (el.btnUserBadgeProfile) el.btnUserBadgeProfile.addEventListener('click', triggerProfileModal);

  el.btnCloseProfileModal.addEventListener('click', closeProfileEditorModal);
  el.btnCancelProfileModal.addEventListener('click', closeProfileEditorModal);

  el.formProfileEditor.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.currentUser) return;
    const fullName = el.profileFullname.value.trim();
    const email = el.profileEmail.value.trim();
    const company = el.profileCompany.value;
    const department = el.profileDept.value;
    const jobLevel = el.profileJobLevel.value;
    const password = el.profilePassword.value.trim();
    const confirmPasswordInput = document.getElementById('profile-confirm-password');
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';

    const updatedData = {
      FullName: fullName,
      Email: email,
      Company: company,
      Department: department,
      JobLevel: jobLevel
    };

    if (password) {
      if (password.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'danger');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Xác nhận mật khẩu mới không khớp.', 'danger');
        return;
      }
      updatedData.Password = password;
    }

    const result = await window.ahcomDB.updateUserProfile(state.currentUser.UserID, updatedData);
    if (result.success) {
      showToast('Cập nhật hồ sơ tài khoản cá nhân thành công!', 'success');
      closeProfileEditorModal();
      
      // Update session state
      state.currentUser = result.user;
      sessionStorage.setItem('ahcom_session', JSON.stringify(result.user));

      // Refresh navbar and current view
      showView(state.currentView);
      if (state.currentView === 'view-student-dashboard') {
        await renderStudentDashboard();
      } else if (state.currentView === 'view-admin-dashboard') {
        await renderAdminDashboard();
      }
    } else {
      showToast(result.message, 'danger');
    }
  });


  // --- ADMIN COMPANY & DEPARTMENT MANAGER LOGIC ---

  // Dynamic company dropdown population
  async function renderCompanyDropdowns() {
    const companies = await window.ahcomDB.getCompanies();

    const fillSelect = (selectEl, defaultOptText = null) => {
      if (!selectEl) return;
      const currentVal = selectEl.value;
      selectEl.innerHTML = '';
      if (defaultOptText) {
        const defOpt = document.createElement('option');
        defOpt.value = (defaultOptText === 'Tất cả' || defaultOptText === 'Tất cả Công ty') ? 'All' : (defaultOptText.includes('Chọn') ? '' : 'all');
        if (defaultOptText.includes('Chọn')) {
          defOpt.disabled = true;
        }
        defOpt.textContent = defaultOptText;
        selectEl.appendChild(defOpt);
      }
      companies.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        selectEl.appendChild(opt);
      });
      selectEl.value = currentVal || (defaultOptText ? ((defaultOptText === 'Tất cả' || defaultOptText === 'Tất cả Công ty') ? 'All' : (defaultOptText.includes('Chọn') ? '' : 'all')) : '');
    };

    fillSelect(el.regCompany, 'Chọn công ty của bạn');
    fillSelect(el.adminCompanyFilter, 'Tất cả Công ty');
    fillSelect(el.whitelistCompanySelect, 'Chọn công ty');
    fillSelect(el.departmentCompanySelect, 'Chọn công ty');
    fillSelect(el.editorScopeCompany, 'Tất cả');
    fillSelect(el.editorUserCompany, 'Chọn công ty');
    fillSelect(el.profileCompany, 'Chọn công ty');
    fillSelect(el.editorDeptCompany, 'Chọn công ty');
  }

  // Dynamic department dropdown population (filtered by parent company selection)
  async function renderDepartmentDropdowns() {
    const depts = await window.ahcomDB.getDepartments(); // returns array of { name, company }

    const fillDeptSelect = (deptSelectEl, selectedCompany, defaultOptText = null) => {
      if (!deptSelectEl) return;
      const currentVal = deptSelectEl.value;
      deptSelectEl.innerHTML = '';
      if (defaultOptText) {
        const defOpt = document.createElement('option');
        defOpt.value = (defaultOptText === 'Tất cả phòng ban' || defaultOptText === 'Tất cả') ? 'All' : (defaultOptText.includes('Chọn') ? '' : 'all');
        if (defaultOptText.includes('Chọn')) {
          defOpt.disabled = true;
        }
        defOpt.textContent = defaultOptText;
        deptSelectEl.appendChild(defOpt);
      }
      
      const filteredDepts = depts.filter(d => !selectedCompany || selectedCompany === 'all' || selectedCompany === 'All' || d.company === selectedCompany);
      
      filteredDepts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.name;
        opt.textContent = d.name;
        deptSelectEl.appendChild(opt);
      });
      
      deptSelectEl.value = currentVal || (defaultOptText ? ((defaultOptText === 'Tất cả phòng ban' || defaultOptText === 'Tất cả') ? 'All' : (defaultOptText.includes('Chọn') ? '' : 'all')) : '');
    };

    fillDeptSelect(el.regDept, el.regCompany ? el.regCompany.value : null, 'Chọn phòng ban (Chọn công ty trước)');
    fillDeptSelect(el.profileDept, el.profileCompany ? el.profileCompany.value : null, 'Chọn phòng ban');
    fillDeptSelect(el.editorUserDept, el.editorUserCompany ? el.editorUserCompany.value : null, 'Chọn phòng ban');
    fillDeptSelect(el.adminDeptFilter, el.adminCompanyFilter ? el.adminCompanyFilter.value : null, 'Tất cả Phòng ban');
    fillDeptSelect(el.whitelistDeptSelect, el.whitelistCompanySelect ? el.whitelistCompanySelect.value : null, 'Chọn phòng ban');
    fillDeptSelect(el.editorScopeDepartment, el.editorScopeCompany ? el.editorScopeCompany.value : null, 'Tất cả');
  }

  // Dynamic category dropdown population for Course Editor Modal
  async function renderCategoryDropdowns() {
    if (!el.editorCategory) return;
    const categories = await window.ahcomDB.getCategories();
    const currentVal = el.editorCategory.value;

    el.editorCategory.innerHTML = '';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      el.editorCategory.appendChild(opt);
    });

    if (currentVal && categories.includes(currentVal)) {
      el.editorCategory.value = currentVal;
    }
  }

  // Dynamic category filter pills population for Student Dashboard
  async function renderCategoryFilters() {
    if (!el.courseCategoryFilters) return;
    const categories = await window.ahcomDB.getCategories();
    
    const activeBtn = el.courseCategoryFilters.querySelector('.filter-btn.active');
    const currentActive = activeBtn ? activeBtn.dataset.category : 'all';

    el.courseCategoryFilters.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn ${currentActive === 'all' ? 'active' : ''}`;
    allBtn.dataset.category = 'all';
    allBtn.textContent = 'Tất cả';
    el.courseCategoryFilters.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${currentActive === cat ? 'active' : ''}`;
      btn.dataset.category = cat;
      btn.textContent = cat;
      el.courseCategoryFilters.appendChild(btn);
    });
  }

  // Bind change event listeners for dynamic nested department selections
  if (el.regCompany) el.regCompany.addEventListener('change', () => renderDepartmentDropdowns());
  if (el.profileCompany) el.profileCompany.addEventListener('change', () => renderDepartmentDropdowns());
  if (el.editorUserCompany) el.editorUserCompany.addEventListener('change', () => renderDepartmentDropdowns());
  if (el.adminCompanyFilter) {
    el.adminCompanyFilter.addEventListener('change', () => {
      renderDepartmentDropdowns();
      renderAdminTable();
    });
  }
  if (el.whitelistCompanySelect) el.whitelistCompanySelect.addEventListener('change', () => renderDepartmentDropdowns());
  if (el.editorScopeCompany) el.editorScopeCompany.addEventListener('change', () => renderDepartmentDropdowns());

  // Draw Companies tab table
  async function renderAdminCompaniesTable() {
    const companies = await window.ahcomDB.getCompanies();
    el.companiesCountBadge.textContent = `${companies.length} công ty`;
    el.adminCompaniesTableBody.innerHTML = '';

    companies.forEach((company, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-stt" style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 500;">${company}</td>
        <td class="col-action" style="text-align: right; padding-right: 24px;">
          <button class="btn btn-secondary btn-edit-company" style="padding: 6px 12px; font-size:12px; margin-right: 6px;">
            <i class="fa-solid fa-pen-to-square"></i> Đổi tên
          </button>
          <button class="btn btn-secondary btn-delete-company" style="padding: 6px 12px; font-size:12px; background-color: var(--danger); color: white;">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      `;

      tr.querySelector('.btn-edit-company').addEventListener('click', async () => {
        const newName = prompt(`Nhập tên mới cho công ty "${company}":`, company);
        if (newName === null) return;
        
        const cleanName = newName.trim();
        if (!cleanName) {
          showToast('Tên công ty không được để trống.', 'danger');
          return;
        }

        const result = await window.ahcomDB.updateCompany(company, cleanName);
        if (result.success) {
          showToast(result.message, 'success');
          await renderCompanyDropdowns();
          await renderDepartmentDropdowns();
          await renderAdminCompaniesTable();
          if (state.currentView === 'view-admin-dashboard') {
            await renderAdminDashboard();
          }
        } else {
          showToast(result.message, 'danger');
        }
      });

      tr.querySelector('.btn-delete-company').addEventListener('click', async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa công ty "${company}"? Tất cả phòng ban thuộc công ty này phải được xóa/chuyển trước.`)) {
          const result = await window.ahcomDB.deleteCompany(company);
          if (result.success) {
            showToast(result.message, 'success');
            await renderCompanyDropdowns();
            await renderDepartmentDropdowns();
            await renderAdminCompaniesTable();
          } else {
            showToast(result.message, 'danger');
          }
        }
      });

      el.adminCompaniesTableBody.appendChild(tr);
    });
  }

  // Draw Departments tab table
  async function renderAdminDepartmentsTable() {
    const userCompany = state.currentUser ? state.currentUser.Company : 'AHCOM Tổng';
    const userRole = state.currentUser ? state.currentUser.Role : 'Student';
    
    let depts = await window.ahcomDB.getDepartments();
    
    if (userRole === 'CompanyAdmin') {
      depts = depts.filter(d => d.company === userCompany);
    } else if (userRole === 'DeptAdmin') {
      depts = depts.filter(d => d.company === userCompany && d.name === state.currentUser.Department);
    }

    el.departmentsCountBadge.textContent = `${depts.length} phòng ban`;
    el.adminDepartmentsTableBody.innerHTML = '';

    depts.forEach((dept, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-stt" style="text-align: center;">${idx + 1}</td>
        <td>${dept.company}</td>
        <td style="font-weight: 500;">${dept.name}</td>
        <td class="col-action" style="text-align: right; padding-right: 24px;">
          <button class="btn btn-secondary btn-edit-dept" style="padding: 6px 12px; font-size:12px; margin-right: 6px;">
            <i class="fa-solid fa-pen-to-square"></i> Đổi tên
          </button>
          <button class="btn btn-secondary btn-delete-dept" style="padding: 6px 12px; font-size:12px; background-color: var(--danger); color: white;">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      `;

      tr.querySelector('.btn-edit-dept').addEventListener('click', async () => {
        // Dynamically create department editor modal if it doesn't exist yet
        let modal = document.getElementById('modal-dept-editor');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'modal-dept-editor';
          modal.className = 'modal-overlay';
          modal.innerHTML = `
            <div class="modal-container" style="max-width: 450px;">
              <div class="modal-header">
                <h3><i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa Phòng ban</h3>
                <button class="close-modal-btn" id="btn-close-dept-modal">&times;</button>
              </div>
              <form id="form-dept-editor">
                <div class="modal-body">
                  <input type="hidden" id="editor-dept-old-name">
                  <input type="hidden" id="editor-dept-old-company">
                  <div class="form-group">
                    <label for="editor-dept-name">Tên phòng ban</label>
                    <input type="text" id="editor-dept-name" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label for="editor-dept-company">Thuộc công ty</label>
                    <select id="editor-dept-company" class="form-input" required></select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="btn-cancel-dept-modal">Hủy bỏ</button>
                  <button type="submit" class="btn btn-success">
                    <i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          `;
          document.body.appendChild(modal);

          // Bind close buttons
          modal.querySelector('#btn-close-dept-modal').addEventListener('click', () => modal.classList.remove('active'));
          modal.querySelector('#btn-cancel-dept-modal').addEventListener('click', () => modal.classList.remove('active'));

          // Bind form submit
          modal.querySelector('#form-dept-editor').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const oldName = document.getElementById('editor-dept-old-name').value;
            const oldCompany = document.getElementById('editor-dept-old-company').value;
            const newName = document.getElementById('editor-dept-name').value.trim();
            const newCompany = document.getElementById('editor-dept-company').value;

            if (!newName) {
              showToast('Tên phòng ban không được để trống.', 'danger');
              return;
            }

            const result = await window.ahcomDB.updateDepartment(oldName, newName, oldCompany, newCompany);
            if (result.success) {
              showToast(result.message, 'success');
              modal.classList.remove('active');
              await renderDepartmentDropdowns();
              await renderAdminDepartmentsTable();
              if (state.currentView === 'view-admin-dashboard') {
                await renderAdminDashboard();
              }
            } else {
              showToast(result.message, 'danger');
            }
          });
        }

        // Fill in current values
        document.getElementById('editor-dept-old-name').value = dept.name;
        document.getElementById('editor-dept-old-company').value = dept.company;
        document.getElementById('editor-dept-name').value = dept.name;

        // Populate company dropdown
        const companies = await window.ahcomDB.getCompanies();
        const selectEl = document.getElementById('editor-dept-company');
        selectEl.innerHTML = '';
        companies.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          selectEl.appendChild(opt);
        });
        selectEl.value = dept.company;

        // Show modal
        modal.classList.add('active');
      });

      tr.querySelector('.btn-delete-dept').addEventListener('click', async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa phòng ban "${dept.name}" thuộc "${dept.company}"?`)) {
          const result = await window.ahcomDB.deleteDepartment(dept.name, dept.company);
          if (result.success) {
            showToast(result.message, 'success');
            await renderDepartmentDropdowns();
            await renderAdminDepartmentsTable();
            if (state.currentView === 'view-admin-dashboard') {
              await renderAdminDashboard();
            }
          } else {
            showToast(result.message, 'danger');
          }
        }
      });

      el.adminDepartmentsTableBody.appendChild(tr);
    });
  }

  // Handle Add Company submit
  if (el.formAddCompany) {
    el.formAddCompany.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newCompanyName = el.companyNameInput.value.trim();
      if (!newCompanyName) return;

      const result = await window.ahcomDB.addCompany(newCompanyName);

      if (result.success) {
        showToast(result.message, 'success');
        el.companyNameInput.value = '';
        await renderCompanyDropdowns();
        await renderDepartmentDropdowns();
        await renderAdminCompaniesTable();
      } else {
        showToast(result.message, 'danger');
      }
    });
  }

  // Handle Add Department submit
  el.formAddDepartment.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newDeptName = el.departmentNameInput.value.trim();
    const selectedCompany = el.departmentCompanySelect.value || 'AHCOM Tổng';
    if (!newDeptName) return;

    const result = await window.ahcomDB.addDepartment(newDeptName, selectedCompany);

    if (result.success) {
      showToast(result.message, 'success');
      el.departmentNameInput.value = '';
      await renderDepartmentDropdowns();
      await renderAdminDepartmentsTable();
    } else {
      showToast(result.message, 'danger');
    }
  });

  // Draw Categories tab table
  async function renderAdminCategoriesTable() {
    const categories = await window.ahcomDB.getCategories();
    if (el.categoriesCountBadge) {
      el.categoriesCountBadge.textContent = `${categories.length} phân loại`;
    }
    if (!el.adminCategoriesTableBody) return;
    el.adminCategoriesTableBody.innerHTML = '';

    categories.forEach((cat, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-stt" style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 500;">${cat}</td>
        <td class="col-action" style="text-align: right; padding-right: 24px;">
          <button class="btn btn-secondary btn-edit-category" style="padding: 6px 12px; font-size:12px; margin-right: 6px;">
            <i class="fa-solid fa-pen-to-square"></i> Đổi tên
          </button>
          <button class="btn btn-secondary btn-delete-category" style="padding: 6px 12px; font-size:12px; background-color: var(--danger); color: white;">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      `;

      tr.querySelector('.btn-edit-category').addEventListener('click', async () => {
        const newName = prompt(`Nhập tên mới cho phân loại "${cat}":`, cat);
        if (newName === null) return;
        const cleanName = newName.trim();
        if (!cleanName) {
          showToast('Tên phân loại không được để trống.', 'danger');
          return;
        }

        const result = await window.ahcomDB.updateCategory(cat, cleanName);
        if (result.success) {
          showToast(result.message, 'success');
          await renderCategoryDropdowns();
          await renderCategoryFilters();
          await renderAdminCategoriesTable();
          await renderAdminCoursesTable();
          if (state.currentView === 'view-student-dashboard') {
            await renderStudentDashboard();
          }
        } else {
          showToast(result.message, 'danger');
        }
      });

      tr.querySelector('.btn-delete-category').addEventListener('click', async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa phân loại "${cat}"?`)) {
          const result = await window.ahcomDB.deleteCategory(cat);
          if (result.success) {
            showToast(result.message, 'success');
            await renderCategoryDropdowns();
            await renderCategoryFilters();
            await renderAdminCategoriesTable();
          } else {
            showToast(result.message, 'danger');
          }
        }
      });

      el.adminCategoriesTableBody.appendChild(tr);
    });
  }

  // Handle Add Category submit
  if (el.formAddCategory) {
    el.formAddCategory.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newCatName = el.categoryNameInput.value.trim();
      if (!newCatName) return;

      const result = await window.ahcomDB.addCategory(newCatName);
      if (result.success) {
        showToast(result.message, 'success');
        el.categoryNameInput.value = '';
        await renderCategoryDropdowns();
        await renderCategoryFilters();
        await renderAdminCategoriesTable();
      } else {
        showToast(result.message, 'danger');
      }
    });
  }

  // Tab controller helper (NEW)
  function switchTab(activeTabBtn, activeTabContent, loadCallback = null) {
    const tabBtns = [el.btnTabAnalytics, el.btnTabCourses, el.btnTabWhitelist, el.btnTabDepartments, el.btnTabCompanies, el.btnTabCategories, el.btnTabLibrary, el.btnTabLibraryCategories];
    const tabContents = [el.tabContentAnalytics, el.tabContentCourses, el.tabContentWhitelist, el.tabContentDepartments, el.tabContentCompanies, el.tabContentCategories, el.tabContentLibrary, el.tabContentLibraryCategories];

    tabBtns.forEach(btn => { if (btn) btn.classList.remove('active'); });
    tabContents.forEach(content => { if (content) content.classList.remove('active'); });

    activeTabBtn.classList.add('active');
    activeTabContent.classList.add('active');

    if (loadCallback) loadCallback();
  }

  el.btnTabAnalytics.addEventListener('click', () => switchTab(el.btnTabAnalytics, el.tabContentAnalytics, renderAdminTable));
  el.btnTabCourses.addEventListener('click', () => switchTab(el.btnTabCourses, el.tabContentCourses, renderAdminCoursesTable));
  el.btnTabWhitelist.addEventListener('click', () => switchTab(el.btnTabWhitelist, el.tabContentWhitelist, renderWhitelistTable));
  if (el.btnTabDepartments) {
    el.btnTabDepartments.addEventListener('click', () => switchTab(el.btnTabDepartments, el.tabContentDepartments, renderAdminDepartmentsTable));
  }
  if (el.btnTabCompanies) {
    el.btnTabCompanies.addEventListener('click', () => switchTab(el.btnTabCompanies, el.tabContentCompanies, renderAdminCompaniesTable));
  }
  if (el.btnTabCategories) {
    el.btnTabCategories.addEventListener('click', () => switchTab(el.btnTabCategories, el.tabContentCategories, renderAdminCategoriesTable));
  }
  if (el.btnTabLibrary) {
    el.btnTabLibrary.addEventListener('click', () => switchTab(el.btnTabLibrary, el.tabContentLibrary, renderAdminLibraryTable));
  }
  if (el.btnTabLibraryCategories) {
    el.btnTabLibraryCategories.addEventListener('click', () => switchTab(el.btnTabLibraryCategories, el.tabContentLibraryCategories, renderAdminLibraryCategoriesTable));
  }

  // Initial load of static dropdown parameters
  (async () => {
    await renderCompanyDropdowns();
    await renderDepartmentDropdowns();
    await renderCategoryDropdowns();
    await renderCategoryFilters();
  })().catch(err => console.error(err));


  // --- AUTO SESSION LOGIN CHECK ---
  const activeSession = sessionStorage.getItem('ahcom_session');
  if (activeSession) {
    state.currentUser = JSON.parse(activeSession);
    const role = state.currentUser.Role;
    const isAdmin = role === 'SuperAdmin' || role === 'CompanyAdmin' || role === 'DeptAdmin' || role === 'Admin';
    
    if (isAdmin) {
      renderAdminDashboard().catch(err => console.error(err));
      showView('view-admin-dashboard');
    } else {
      renderStudentDashboard().catch(err => console.error(err));
      showView('view-student-dashboard');
    }
  } else {
    showView('view-login');
  }

});
