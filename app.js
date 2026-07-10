/**
 * AHCOM E-Learning Application Controller
 * Handles SPA routing, UI rendering, event bindings, progress tracking, and CSV exports
 */

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
    // Video length simulation (seconds)
    SIMULATED_VIDEO_DURATION: 300 // 5 minutes
  };

  // --- HTML ELEMENT REFERENCES ---
  const el = {
    // Nav elements
    navbar: document.getElementById('main-navbar'),
    navLogo: document.getElementById('nav-logo-btn'),
    navCourses: document.getElementById('nav-courses-link'),
    navAdmin: document.getElementById('nav-admin-link'),
    displayUserName: document.getElementById('display-user-name'),
    displayUserRole: document.getElementById('display-user-role'),
    btnLogout: document.getElementById('btn-logout'),

    // Views
    viewLogin: document.getElementById('view-login'),
    viewRegister: document.getElementById('view-register'),
    viewStudentDashboard: document.getElementById('view-student-dashboard'),
    viewCourseViewer: document.getElementById('view-course-viewer'),
    viewQuizPanel: document.getElementById('view-quiz-panel'),
    viewAdminDashboard: document.getElementById('view-admin-dashboard'),

    // Forms
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    formQuiz: document.getElementById('form-quiz-questions'),

    // Inputs
    loginIdentity: document.getElementById('login-identity'),
    loginPassword: document.getElementById('login-password'),
    regFullname: document.getElementById('reg-fullname'),
    regEmpId: document.getElementById('reg-empid'),
    regEmail: document.getElementById('reg-email'),
    regPassword: document.getElementById('reg-password'),
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
    whitelistCountBadge: document.getElementById('whitelist-count-badge'),
    adminWhitelistTableBody: document.getElementById('admin-whitelist-table-body'),
    btnImportWhitelistFile: document.getElementById('btn-import-whitelist-file'),
    whitelistFileInput: document.getElementById('whitelist-file-input'),

    // Admin department configuration elements
    btnTabDepartments: document.getElementById('btn-tab-departments'),
    tabContentDepartments: document.getElementById('tab-content-departments'),
    formAddDepartment: document.getElementById('form-add-department'),
    departmentNameInput: document.getElementById('department-name-input'),
    departmentsCountBadge: document.getElementById('departments-count-badge'),
    adminDepartmentsTableBody: document.getElementById('admin-departments-table-body'),

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
    editorUserDept: document.getElementById('editor-user-dept'),
    editorUserJobLevel: document.getElementById('editor-user-joblevel'),
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
    profileDept: document.getElementById('profile-dept'),
    profileJobLevel: document.getElementById('profile-joblevel'),
    profilePassword: document.getElementById('profile-password')
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
      el.displayUserRole.textContent = state.currentUser.Role === 'Admin' 
        ? `${state.currentUser.Department || 'Ban Giám Đốc'} / Quản trị` 
        : state.currentUser.Department;

      // Reset nav link active states
      el.navCourses.classList.remove('active');
      el.navAdmin.classList.remove('active');

      if (state.currentUser.Role === 'Admin') {
        el.navAdmin.style.display = 'inline-flex';
        el.navCourses.style.display = 'inline-flex'; // Allow admin to see/test courses too
        if (viewId === 'view-admin-dashboard') {
          el.navAdmin.classList.add('active');
        } else if (viewId === 'view-student-dashboard' || viewId === 'view-course-viewer') {
          el.navCourses.classList.add('active');
        }
      } else {
        el.navCourses.style.display = 'inline-flex';
        el.navAdmin.style.display = 'none';
        el.navCourses.classList.add('active');
      }
    } else {
      el.navbar.style.display = 'none';
    }
  }

  // --- AUTHENTICATION ACTIONS ---
  
  // Submit Login
  el.formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const identity = el.loginIdentity.value;
    const password = el.loginPassword.value;

    const result = window.ahcomDB.loginUser(identity, password);

    if (result.success) {
      state.currentUser = result.user;
      sessionStorage.setItem('ahcom_session', JSON.stringify(result.user));
      showToast(`Đăng nhập thành công! Chào mừng ${result.user.FullName}.`, 'success');

      // Routing logic based on Role
      if (result.user.Role === 'Admin') {
        renderAdminDashboard();
        showView('view-admin-dashboard');
      } else {
        renderStudentDashboard();
        showView('view-student-dashboard');
      }

      // Reset form
      el.formLogin.reset();
    } else {
      showToast(result.message, 'danger');
    }
  });

  // Submit Registration
    el.formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = el.regFullname.value;
    const empId = el.regEmpId.value;
    const email = el.regEmail.value;
    const password = el.regPassword.value;
    const department = el.regDept.value;
    const jobLevel = el.regJobLevel.value;

    if (password.length < 6) {
      showToast('Mật khẩu phải chứa ít nhất 6 ký tự.', 'danger');
      return;
    }

    const result = window.ahcomDB.registerUser(fullName, empId, email, password, department, jobLevel);

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

  // Logout
  el.btnLogout.addEventListener('click', () => {
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
  function renderStudentDashboard() {
    // Set welcome text
    document.getElementById('student-welcome-title').innerHTML = `Xin chào, ${state.currentUser.FullName}! <span style="font-weight:400; font-size:16px; color:var(--text-muted); display:inline-block; margin-left:8px;">(${state.currentUser.Department})</span>`;
    
    const courses = window.ahcomDB.getCourses();
    const progressList = window.ahcomDB.getUserProgress(state.currentUser.UserID);
    const quizResults = window.ahcomDB.getUserQuizResults(state.currentUser.UserID);

    // Get active filter
    const activeFilterBtn = el.courseCategoryFilters.querySelector('.filter-btn.active');
    const selectedCategory = activeFilterBtn ? activeFilterBtn.dataset.category : 'all';

    el.coursesContainer.innerHTML = '';

    const filteredCourses = selectedCategory === 'all' 
      ? courses 
      : courses.filter(c => c.Category === selectedCategory);

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
      let categoryName = 'Hội nhập';
      if (course.Category === 'Sales') categoryName = 'Kinh doanh / Bán hàng';
      else if (course.Category === 'DISC') categoryName = 'Mô hình tính cách DISC';
      else if (course.Category === 'HR') categoryName = 'Văn hóa & Quy chế';

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
  }

  // Dashboard filter click handlers
  el.courseCategoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      el.courseCategoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderStudentDashboard();
    }
  });

  // --- COURSE VIEWER (STUDY SCREEN) ---
  function loadCourseViewer(course) {
    // RBAC Security Guard
    if (state.currentUser && state.currentUser.Role !== 'Admin') {
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
    const progressList = window.ahcomDB.getUserProgress(state.currentUser.UserID);
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

  // Simulated watch timer tracking (for Google Drive embeds and external links)
  function startSimulatedWatchProgress(course, startSeconds) {
    // Clear any active watch timers first
    if (state.watchTimer) {
      clearInterval(state.watchTimer);
    }

    let currentSeconds = startSeconds;
    
    state.watchTimer = setInterval(() => {
      currentSeconds++;
      
      // Save progress to DB every 3 seconds to avoid local storage overhead
      if (currentSeconds % 3 === 0) {
        // Assume 5 minutes (300 seconds) is the target completion time
        const isCompleted = currentSeconds >= 270; // 90% of 300s
        
        window.ahcomDB.updateWatchProgress(
          state.currentUser.UserID,
          course.CourseID,
          currentSeconds,
          isCompleted
        );
        
        updateViewerProgressUI(currentSeconds, isCompleted);
        
        if (currentSeconds >= 300) {
          clearInterval(state.watchTimer);
          state.watchTimer = null;
        }
      }
    }, 1000);
  }

  // Render Video Player
  async function renderVideoPlayer(course, startSeconds) {
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
    if (course.SlideSource === 'link' || course.ContentURL) {
      // LINK SOURCE SLIDES
      const embedUrl = getEmbedUrl(course.ContentURL);
      
      el.learningMediaContainer.innerHTML = `
        <div class="slide-container" style="display: flex; flex-direction: column; gap: 16px; height: 500px;">
          <iframe src="${embedUrl}" style="width: 100%; height: 420px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" allowfullscreen></iframe>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <a href="${course.ContentURL}" target="_blank" class="btn btn-secondary btn-open-external" style="display: inline-flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-up-right-from-square"></i> Mở tài liệu trong Tab mới
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
          300, // Full progress (5 mins)
          true
        );
        updateViewerProgressUI(300, true);
        showToast('Chúc mừng bạn đã hoàn thành bài học tài liệu này!', 'success');
      });

      // Start simulated watch timer
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
  el.btnBackToDashboard.addEventListener('click', () => {
    renderStudentDashboard();
    showView('view-student-dashboard');
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
      q.Options.forEach((option, oIndex) => {
        optionsHTML += `
          <label class="quiz-option-label" for="q-${qIndex}-o-${oIndex}">
            <input type="radio" name="question-${qIndex}" id="q-${qIndex}-o-${oIndex}" value="${oIndex}" required>
            <span>${option}</span>
          </label>
        `;
      });

      qCard.innerHTML = `
        <p class="quiz-question-text">Câu ${qIndex + 1}: ${q.Question}</p>
        <div class="quiz-options-list">
          ${optionsHTML}
        </div>
      `;
      el.quizQuestionsList.appendChild(qCard);
    });

    showView('view-quiz-panel');
  });

  // Submit Quiz Action
  el.formQuiz.addEventListener('submit', (e) => {
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
    window.ahcomDB.saveQuizResult(
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

  // --- ADMIN PORTAL PANEL RENDERING ---
  function renderAdminDashboard() {
    const analytics = window.ahcomDB.getAdminAnalytics();
    const courses = window.ahcomDB.getCourses();
    
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

    renderAdminTable();
  }

  // Draw admin table with filters applied
  function renderAdminTable() {
    const analytics = window.ahcomDB.getAdminAnalytics();
    
    // Read current filter state
    const searchTerm = el.adminSearchInput.value.toLowerCase().trim();
    const selectedDept = el.adminDeptFilter.value;

    el.adminTableBody.innerHTML = '';

    const filteredData = analytics.filter(row => {
      // 1. Department match
      const deptMatch = selectedDept === 'all' || row.Department === selectedDept;
      
      // 2. Search match (name or employee id)
      const nameMatch = row.FullName.toLowerCase().includes(searchTerm);
      const empIdMatch = row.EmployeeID.toLowerCase().includes(searchTerm);
      
      return deptMatch && (nameMatch || empIdMatch);
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
  el.btnExportCSV.addEventListener('click', () => {
    const analytics = window.ahcomDB.getAdminAnalytics();
    
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
    if (el.tabContentDepartments) el.tabContentDepartments.classList.remove('active');
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
  function renderAdminCoursesTable() {
    const courses = window.ahcomDB.getCourses();
    el.adminCoursesTableBody.innerHTML = '';

    courses.forEach(course => {
      const quizCount = course.QuizQuestions ? course.QuizQuestions.length : 0;
      const typeLabel = course.ContentType === 'Video' ? '<i class="fa-solid fa-video"></i> Video' : '<i class="fa-solid fa-file-powerpoint"></i> Slides';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${course.Title}</strong></td>
        <td><code>${course.Category}</code></td>
        <td>${typeLabel}</td>
        <td style="font-weight:600;">${quizCount} câu hỏi</td>
        <td style="text-align: right; padding-right:24px;">
          <button class="btn btn-secondary btn-edit-course" data-id="${course.CourseID}" style="padding: 6px 12px; font-size:12px; margin-right:8px;">
            <i class="fa-solid fa-pen-to-square"></i> Sửa
          </button>
          <button class="btn btn-primary btn-delete-course" data-id="${course.CourseID}" style="padding: 6px 12px; font-size:12px;">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      `;

      // Bind edit click
      tr.querySelector('.btn-edit-course').addEventListener('click', () => {
        openCourseEditorModal(course);
      });

      // Bind delete click
      tr.querySelector('.btn-delete-course').addEventListener('click', () => {
        if (confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.Title}" không? Hành động này sẽ xóa toàn bộ tiến trình học và điểm thi liên quan.`)) {
          window.ahcomDB.deleteCourse(course.CourseID);
          showToast(`Đã xóa khóa học "${course.Title}" thành công!`, 'warning');
          renderAdminDashboard(); // refreshes stats counters
          renderAdminCoursesTable(); // refreshes course list table
        }
      });

      el.adminCoursesTableBody.appendChild(tr);
    });
  }

  // Open Modal Course Editor
  function openCourseEditorModal(course = null) {
    el.formCourseEditor.reset();
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
          el.editorSlideUrl.value = course.ContentURL || '';
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

  // --- LOCAL VIDEO UPLOADER MANAGER LOGIC ---
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
        <input type="text" class="form-input slide-title-input" placeholder="Ví dụ: Slide 1: Khái niệm" value="${title}" required>
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label>Nội dung chi tiết Slide</label>
        <textarea class="form-input slide-content-input" rows="3" placeholder="Nhập văn bản giảng dạy hiển thị trên slide..." required style="resize:vertical; font-family:var(--font-family);">${content}</textarea>
      </div>
    `;

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

    // Use a unique group name for correct option radios in this card
    const radioGroupName = `correct-option-${cardId}`;

    card.innerHTML = `
      <button type="button" class="btn-remove-item"><i class="fa-solid fa-trash-can"></i> Xóa câu hỏi</button>
      <div class="form-group" style="margin-top: 16px;">
        <label>Nội dung câu hỏi trắc nghiệm</label>
        <input type="text" class="form-input q-text-input" placeholder="Nhập câu hỏi..." value="${questionText}" required>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>Các lựa chọn và tích chọn đáp án đúng</label>
        
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="0" ${correctIndex === 0 ? 'checked' : ''} required>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án A" value="${options[0] || ''}" required>
        </div>
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="1" ${correctIndex === 1 ? 'checked' : ''}>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án B" value="${options[1] || ''}" required>
        </div>
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="2" ${correctIndex === 2 ? 'checked' : ''}>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án C" value="${options[2] || ''}" required>
        </div>
        <div class="quiz-option-config">
          <input type="radio" name="${radioGroupName}" value="3" ${correctIndex === 3 ? 'checked' : ''}>
          <input type="text" class="form-input q-opt-input" placeholder="Đáp án D" value="${options[3] || ''}" required>
        </div>
      </div>
    `;

    card.querySelector('.btn-remove-item').addEventListener('click', () => {
      card.remove();
    });

    const listContainer = document.getElementById('editor-questions-list');
    if (listContainer) {
      listContainer.appendChild(card);
    }
  }

  // Event delegation to handle dynamic clicks on Add Slide, Add Question, and Import Slides buttons
  document.addEventListener('click', (e) => {
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

  // Handle slide file import change dynamically
  document.addEventListener('change', (e) => {
    if (e.target.id === 'editor-slides-file-input') {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const slides = [];

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = text.split(/[\r\n]+/);
          lines.forEach(line => {
            if (!line.trim()) return;
            const parts = line.split(/[,;]/);
            if (parts.length >= 2) {
              const sTitle = parts[0].trim().replace(/^["']|["']$/g, '');
              const sContent = parts.slice(1).join(',').trim().replace(/^["']|["']$/g, '').replace(/""/g, '"');
              
              // Skip header rows
              if (sTitle.toLowerCase() === 'tiêu đề' || sTitle.toLowerCase() === 'title' || sTitle.toLowerCase() === 'tieu de') {
                return;
              }
              slides.push({ Title: sTitle, Content: sContent });
            }
          });
        } else {
          // Parse TXT: slides separated by double newlines
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
          return;
        }

        // Append parsed slides to editor list
        slides.forEach(s => {
          addSlideInputRow(s.Title, s.Content);
        });

        showToast(`Đã nhập thành công ${slides.length} trang slide bài giảng!`, 'success');
        
        // Reset file input value
        e.target.value = '';
      };

      reader.onerror = () => {
        showToast('Lỗi khi đọc tệp tin slide.', 'danger');
      };

      reader.readAsText(file);
    }
  });

  // Handle Course Form Submit
  el.formCourseEditor.addEventListener('submit', async (e) => {
    e.preventDefault();

    const courseId = el.editorCourseId.value || null;
    const title = el.editorTitle.value.trim();
    const category = el.editorCategory.value;
    const contentType = el.editorContentType.value;
    const targetGroup = el.editorTargetGroup.value;

    const courseData = {
      CourseID: courseId,
      Title: title,
      Category: category,
      ContentType: contentType,
      TargetGroup: targetGroup,
      ThumbnailURL: state.currentThumbnailBase64,
      QuizQuestions: []
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
      const slideSource = el.editorSlideSource.value;
      courseData.SlideSource = slideSource;

      if (slideSource === 'link') {
        const slideUrl = el.editorSlideUrl.value.trim();
        if (!slideUrl) {
          showToast('Vui lòng nhập đường dẫn tài liệu Slide cho khóa học.', 'danger');
          return;
        }
        courseData.ContentURL = slideUrl;
        courseData.Slides = [];
      } else {
        const slideCards = el.editorSlidesList.querySelectorAll('.editor-item-card');
        if (slideCards.length === 0) {
          showToast('Vui lòng thêm ít nhất 1 trang slide nội dung.', 'danger');
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
    const saved = window.ahcomDB.saveCourse(courseData);

    // Save video file to IndexedDB if a new file is pending
    if (contentType === 'Video' && state.pendingVideoFile) {
      try {
        await window.ahcomDB.largeFileStorage.saveVideo(saved.CourseID, state.pendingVideoFile);
      } catch (err) {
        console.error("Lỗi khi lưu video cục bộ: ", err);
        showToast('Lỗi khi lưu tệp tin video vào IndexedDB.', 'danger');
      }
    }

    showToast(`Đã lưu khóa học "${saved.Title}" thành công!`, 'success');
    
    // Refresh panels
    renderAdminDashboard();
    renderAdminCoursesTable();
    closeCourseEditorModal();
  });

  // --- ADMIN EMPLOYEE WHITELIST MANAGER LOGIC ---

  // Draw Whitelist table
  function renderWhitelistTable() {
    const validIDs = window.ahcomDB.getValidEmployeeIDs();
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
      tr.querySelector('.btn-delete-whitelist').addEventListener('click', () => {
        if (confirm(`Bạn có chắc chắn muốn xóa mã nhân viên "${item.EmployeeID}" khỏi Whitelist đăng ký?`)) {
          const result = window.ahcomDB.deleteValidEmployeeID(item.EmployeeID);
          if (result.success) {
            showToast(result.message, 'success');
            renderWhitelistTable();
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
  document.addEventListener('click', (e) => {
    const btnDeleteSelected = e.target.closest('#btn-delete-selected-whitelist');
    if (btnDeleteSelected) {
      e.preventDefault();
      const checkedCheckboxes = document.querySelectorAll('.chk-select-whitelist:checked');
      const selectedIds = Array.from(checkedCheckboxes).map(chk => chk.dataset.id);
      
      if (selectedIds.length === 0) return;

      if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mã nhân viên đã chọn khỏi danh sách Whitelist?`)) {
        const result = window.ahcomDB.deleteValidEmployeeIDs(selectedIds);
        if (result.success) {
          showToast(result.message, 'success');
          renderWhitelistTable();
        } else {
          showToast(result.message, 'danger');
        }
      }
    }

    // Bind Clear All button click
    const btnClearAll = e.target.closest('#btn-clear-all-whitelist');
    if (btnClearAll) {
      e.preventDefault();
      const validIDs = window.ahcomDB.getValidEmployeeIDs();
      if (validIDs.length === 0) {
        showToast('Danh sách mã hiện tại đang trống.', 'warning');
        return;
      }
      
      if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách mã nhân viên Whitelist? Hành động này không thể hoàn tác.')) {
        const result = window.ahcomDB.clearAllValidEmployeeIDs();
        if (result.success) {
          showToast(result.message, 'success');
          renderWhitelistTable();
        } else {
          showToast(result.message, 'danger');
        }
      }
    }
  });

  // Handle Add Whitelist submit
  el.formAddWhitelist.addEventListener('submit', (e) => {
    e.preventDefault();
    const newEmpId = el.whitelistEmpIdInput.value.trim();
    if (!newEmpId) return;

    const result = window.ahcomDB.addValidEmployeeID(newEmpId);

    if (result.success) {
      showToast(result.message, 'success');
      el.whitelistEmpIdInput.value = '';
      renderWhitelistTable();
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

      reader.onload = (event) => {
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

          const result = window.ahcomDB.importValidEmployeeIDs(codes);
          if (result.success) {
            showToast(result.message, 'success');
            renderWhitelistTable();
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
      reader.onload = (event) => {
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

        const result = window.ahcomDB.importValidEmployeeIDs(codes);
        
        if (result.success) {
          showToast(result.message, 'success');
          renderWhitelistTable();
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
  function openUserEditorModal(userId) {
    const users = JSON.parse(localStorage.getItem('ahcom_users')) || [];
    const user = users.find(u => u.UserID === userId);
    if (!user) {
      showToast('Không tìm thấy người dùng.', 'danger');
      return;
    }

    el.editorUserId.value = user.UserID;
    el.editorUserFullname.value = user.FullName;
    el.editorUserEmpId.value = user.EmployeeID;
    el.editorUserEmail.value = user.Email;
    el.editorUserDept.value = user.Department || 'Phòng Kinh doanh';
    el.editorUserJobLevel.value = user.JobLevel || 'Staff';
    el.editorUserPassword.value = ''; // Leave blank initially

    el.modalUserEditor.classList.add('active');
  }

  function closeUserEditorModal() {
    el.modalUserEditor.classList.remove('active');
  }

  el.btnCloseUserModal.addEventListener('click', closeUserEditorModal);
  el.btnCancelUserModal.addEventListener('click', closeUserEditorModal);

  el.formUserEditor.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = el.editorUserId.value;
    const fullName = el.editorUserFullname.value.trim();
    const empId = el.editorUserEmpId.value.trim().toUpperCase();
    const email = el.editorUserEmail.value.trim();
    const department = el.editorUserDept.value;
    const jobLevel = el.editorUserJobLevel.value;
    const password = el.editorUserPassword.value.trim();

    const updatedData = {
      FullName: fullName,
      EmployeeID: empId,
      Email: email,
      Department: department,
      JobLevel: jobLevel
    };

    if (password) {
      if (password.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'danger');
        return;
      }
      updatedData.Password = password;
    }

    const result = window.ahcomDB.updateUserProfile(userId, updatedData);
    if (result.success) {
      showToast('Cập nhật thông tin thành viên thành công!', 'success');
      closeUserEditorModal();
      renderAdminDashboard(); // Refresh reporting table
    } else {
      showToast(result.message, 'danger');
    }
  });


  // --- STUDENT PROFILE EDITOR CONTROLLER ---
  function openProfileEditorModal() {
    if (!state.currentUser) return;
    
    // Fetch latest user details from DB to make sure we edit fresh data
    const users = JSON.parse(localStorage.getItem('ahcom_users')) || [];
    const user = users.find(u => u.UserID === state.currentUser.UserID);
    if (!user) return;

    el.profileFullname.value = user.FullName;
    el.profileEmpId.value = user.EmployeeID;
    el.profileEmail.value = user.Email;
    el.profileDept.value = user.Department || 'Phòng Kinh doanh';
    el.profileJobLevel.value = user.JobLevel || 'Staff';
    el.profilePassword.value = ''; // Leave blank initially

    el.modalProfileEditor.classList.add('active');
  }

  function closeProfileEditorModal() {
    el.modalProfileEditor.classList.remove('active');
  }

  const triggerProfileModal = (e) => {
    if (e) e.preventDefault();
    openProfileEditorModal();
  };

  if (el.btnNavProfile) el.btnNavProfile.addEventListener('click', triggerProfileModal);
  if (el.btnUserBadgeProfile) el.btnUserBadgeProfile.addEventListener('click', triggerProfileModal);

  el.btnCloseProfileModal.addEventListener('click', closeProfileEditorModal);
  el.btnCancelProfileModal.addEventListener('click', closeProfileEditorModal);

  el.formProfileEditor.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.currentUser) return;

    const fullName = el.profileFullname.value.trim();
    const email = el.profileEmail.value.trim();
    const department = el.profileDept.value;
    const jobLevel = el.profileJobLevel.value;
    const password = el.profilePassword.value.trim();

    const updatedData = {
      FullName: fullName,
      Email: email,
      Department: department,
      JobLevel: jobLevel
    };

    if (password) {
      if (password.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'danger');
        return;
      }
      updatedData.Password = password;
    }

    const result = window.ahcomDB.updateUserProfile(state.currentUser.UserID, updatedData);
    if (result.success) {
      showToast('Cập nhật hồ sơ tài khoản cá nhân thành công!', 'success');
      closeProfileEditorModal();
      
      // Update session state
      state.currentUser = result.user;
      sessionStorage.setItem('ahcom_session', JSON.stringify(result.user));

      // Refresh navbar and current view
      showView(state.currentView);
      if (state.currentView === 'view-student-dashboard') {
        renderStudentDashboard();
      } else if (state.currentView === 'view-admin-dashboard') {
        renderAdminDashboard();
      }
    } else {
      showToast(result.message, 'danger');
    }
  });


  // --- ADMIN DEPARTMENT MANAGER LOGIC ---

  // Dynamic department dropdown population
  function renderDepartmentDropdowns() {
    const depts = window.ahcomDB.getDepartments();

    // 1. Register Form Dropdown
    if (el.regDept) {
      const currentVal = el.regDept.value;
      el.regDept.innerHTML = '<option value="" disabled>Chọn phòng ban của bạn</option>';
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        el.regDept.appendChild(opt);
      });
      el.regDept.value = currentVal || "";
    }

    // 2. Profile Editor Form Dropdown
    if (el.profileDept) {
      const currentVal = el.profileDept.value;
      el.profileDept.innerHTML = '';
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        el.profileDept.appendChild(opt);
      });
      if (currentVal && depts.includes(currentVal)) {
        el.profileDept.value = currentVal;
      }
    }

    // 3. Admin Edit User Modal Dropdown
    if (el.editorUserDept) {
      const currentVal = el.editorUserDept.value;
      el.editorUserDept.innerHTML = '';
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        el.editorUserDept.appendChild(opt);
      });
      if (currentVal && depts.includes(currentVal)) {
        el.editorUserDept.value = currentVal;
      }
    }

    // 4. Admin Analytics Table Dept Filter
    if (el.adminDeptFilter) {
      const currentVal = el.adminDeptFilter.value;
      el.adminDeptFilter.innerHTML = '<option value="all">Tất cả Phòng ban</option>';
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        el.adminDeptFilter.appendChild(opt);
      });
      el.adminDeptFilter.value = currentVal || "all";
    }
  }

  // Draw Departments tab table
  function renderAdminDepartmentsTable() {
    const depts = window.ahcomDB.getDepartments();
    el.departmentsCountBadge.textContent = `${depts.length} phòng ban`;
    el.adminDepartmentsTableBody.innerHTML = '';

    depts.forEach((dept, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-stt" style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 500;">${dept}</td>
        <td class="col-action" style="text-align: right; padding-right: 24px;">
          <button class="btn btn-secondary btn-edit-dept" style="padding: 6px 12px; font-size:12px; margin-right: 6px;">
            <i class="fa-solid fa-pen-to-square"></i> Sửa
          </button>
          <button class="btn btn-primary btn-delete-dept" style="padding: 6px 12px; font-size:12px; background-color: var(--danger);">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      `;

      // Bind Edit Click
      tr.querySelector('.btn-edit-dept').addEventListener('click', () => {
        const newName = prompt(`Nhập tên mới cho phòng ban "${dept}":`, dept);
        if (newName === null) return; // Cancelled
        
        const cleanName = newName.trim();
        if (!cleanName) {
          showToast('Tên phòng ban không được để trống.', 'danger');
          return;
        }

        const result = window.ahcomDB.updateDepartment(dept, cleanName);
        if (result.success) {
          showToast(result.message, 'success');
          // Refresh list of depts in DB and UI dropdowns
          renderDepartmentDropdowns();
          renderAdminDepartmentsTable();
          // Update admin table if rendering analytics
          if (state.currentView === 'view-admin-dashboard') {
            renderAdminDashboard();
          }
        } else {
          showToast(result.message, 'danger');
        }
      });

      // Bind Delete Click
      tr.querySelector('.btn-delete-dept').addEventListener('click', () => {
        if (confirm(`Bạn có chắc chắn muốn xóa phòng ban "${dept}"?`)) {
          const result = window.ahcomDB.deleteDepartment(dept);
          if (result.success) {
            showToast(result.message, 'success');
            // Refresh list of depts in DB and UI dropdowns
            renderDepartmentDropdowns();
            renderAdminDepartmentsTable();
            // Update admin table if rendering analytics
            if (state.currentView === 'view-admin-dashboard') {
              renderAdminDashboard();
            }
          } else {
            showToast(result.message, 'danger');
          }
        }
      });

      el.adminDepartmentsTableBody.appendChild(tr);
    });
  }

  // Handle Add Department submit
  el.formAddDepartment.addEventListener('submit', (e) => {
    e.preventDefault();
    const newDeptName = el.departmentNameInput.value.trim();
    if (!newDeptName) return;

    const result = window.ahcomDB.addDepartment(newDeptName);

    if (result.success) {
      showToast(result.message, 'success');
      el.departmentNameInput.value = '';
      renderDepartmentDropdowns();
      renderAdminDepartmentsTable();
    } else {
      showToast(result.message, 'danger');
    }
  });

  // Initial load of dropdowns
  renderDepartmentDropdowns();


  // --- AUTO SESSION LOGIN CHECK ---
  const activeSession = sessionStorage.getItem('ahcom_session');
  if (activeSession) {
    state.currentUser = JSON.parse(activeSession);
    
    if (state.currentUser.Role === 'Admin') {
      renderAdminDashboard();
      showView('view-admin-dashboard');
    } else {
      renderStudentDashboard();
      showView('view-student-dashboard');
    }
  } else {
    showView('view-login');
  }

});
