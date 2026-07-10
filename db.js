/**
 * AHCOM E-Learning Database Management System
 * Simulated Relational Database stored in localStorage
 */

const DB_KEYS = {
  VALID_IDS: 'ahcom_valid_employee_ids',
  USERS: 'ahcom_users',
  COURSES: 'ahcom_courses',
  PROGRESS: 'ahcom_progress',
  QUIZ_RESULTS: 'ahcom_quiz_results',
  DEPARTMENTS: 'ahcom_departments'
};

// Seed initial data if not exists
function initDatabase() {
  // 0. Seed default departments
  if (!localStorage.getItem(DB_KEYS.DEPARTMENTS)) {
    const defaultDepts = [
      'Phòng Kinh doanh',
      'Phòng Marketing',
      'Hành chính Nhân sự',
      'Phòng Kỹ thuật',
      'Kế toán / Tài chính',
      'Ban Giám Đốc'
    ];
    localStorage.setItem(DB_KEYS.DEPARTMENTS, JSON.stringify(defaultDepts));
  }
  // 1. Valid Employee IDs (Whitelist)
  if (!localStorage.getItem(DB_KEYS.VALID_IDS)) {
    const validIDs = [
      { EmployeeID: 'AHCOM001' },
      { EmployeeID: 'AHCOM002' },
      { EmployeeID: 'AHCOM003' },
      { EmployeeID: 'AHCOM004' },
      { EmployeeID: 'AHCOM005' },
      { EmployeeID: 'AHCOM006' },
      { EmployeeID: 'AHCOM007' },
      { EmployeeID: 'AHCOM008' },
      { EmployeeID: 'AHCOM009' },
      { EmployeeID: 'AHCOM010' }
    ];
    localStorage.setItem(DB_KEYS.VALID_IDS, JSON.stringify(validIDs));
  }

  // 2. Initial Courses
  if (!localStorage.getItem(DB_KEYS.COURSES)) {
    const courses = [
      {
        CourseID: 'c1',
        Title: 'Quy trình Bán hàng chuẩn 5 bước tại AHCOM',
        Category: 'Sales',
        ContentType: 'Video',
        TargetGroup: 'All', // Accessible to all
        ContentURL: 'https://assets.mixkit.co/videos/preview/mixkit-corporate-workers-discussing-charts-in-the-office-42261-large.mp4',
        QuizQuestions: [
          {
            Question: 'Bước đầu tiên trong quy trình bán hàng chuẩn của AHCOM là gì?',
            Options: [
              'Chuẩn bị và Tìm kiếm khách hàng tiềm năng',
              'Tiếp cận khách hàng',
              'Giới thiệu sản phẩm',
              'Chốt giao dịch'
            ],
            CorrectIndex: 0
          },
          {
            Question: 'Khi gặp khách hàng khó tính, nhân viên AHCOM cần thực hiện nguyên tắc nào đầu tiên?',
            Options: [
              'Giải thích ngay lập tức để bảo vệ quan điểm',
              'Lắng nghe, tôn trọng và đồng cảm sâu sắc',
              'Nhờ cấp trên trực tiếp vào can thiệp',
              'Từ chối phục vụ khách hàng này'
            ],
            CorrectIndex: 1
          },
          {
            Question: 'Sau khi chốt giao dịch thành công, bước tiếp theo quan trọng nhất là gì?',
            Options: [
              'Chăm sóc và duy trì quan hệ sau bán hàng',
              'Tìm kiếm khách hàng mới ngay lập tức',
              'Yêu cầu khách hàng thanh toán 100% bằng mọi giá',
              'Kết thúc tương tác và không liên lạc lại'
            ],
            CorrectIndex: 0
          }
        ]
      },
      {
        CourseID: 'c2',
        Title: 'Thấu hiểu Tính cách Khách hàng qua DISC',
        Category: 'DISC',
        ContentType: 'Slide',
        TargetGroup: 'Manager', // Restricted to Managers only
        Slides: [
          {
            Title: 'Tổng quan về DISC',
            Content: 'DISC là công cụ nhận diện tính cách, hành vi dựa trên nghiên cứu của Tiến sĩ William Moulton Marston. DISC chia hành vi con người thành 4 nhóm chính: Thống trị (D), Ảnh hưởng (I), Kiên định (S), và Tuân thủ (C). Việc thấu hiểu DISC giúp cải thiện kỹ năng giao tiếp và tăng tỷ lệ chốt đơn hàng.'
          },
          {
            Title: 'Nhóm D (Dominance) - Thống trị',
            Content: 'Đặc điểm: Mạnh mẽ, quyết đoán, tập trung vào kết quả, thích kiểm soát và thử thách. Khi làm việc với người nhóm D, hãy đi thẳng vào vấn đề, trình bày ngắn gọn, đưa ra các phương án lựa chọn thay vì giải thích dài dòng.'
          },
          {
            Title: 'Nhóm I (Influence) - Ảnh hưởng',
            Content: 'Đặc điểm: Nhiệt tình, cởi mở, giao tiếp tốt, thích truyền cảm hứng và thích được công nhận. Khi làm việc với người nhóm I, hãy tỏ ra thân thiện, lắng nghe ý tưởng của họ và đưa ra những lời khen ngợi chân thành.'
          },
          {
            Title: 'Nhóm S (Steadiness) - Kiên định',
            Content: 'Đặc điểm: Điềm đạm, hòa nhã, kiên nhẫn, trung thành và ưa thích sự ổn định. Họ rất ngại thay đổi đột ngột. Khi làm việc với nhóm S, hãy từ tốn, thể hiện sự chân thành và đảm bảo độ an toàn cao trong dịch vụ.'
          },
          {
            Title: 'Nhóm C (Compliance) - Tuân thủ',
            Content: 'Đặc điểm: Chính xác, logic, cẩn thận, làm việc theo quy trình và dữ liệu. Họ rất ghét sự mơ hồ. Khi làm việc với người nhóm C, bạn cần chuẩn bị số liệu chi tiết, các bằng chứng rõ ràng và quy trình cụ thể.'
          }
        ],
        QuizQuestions: [
          {
            Question: 'Nhóm tính cách nào trong DISC có xu hướng tập trung vào kết quả nhanh chóng, hành động quyết đoán và thích thử thách?',
            Options: [
              'Nhóm D (Thống trị)',
              'Nhóm I (Ảnh hưởng)',
              'Nhóm S (Kiên định)',
              'Nhóm C (Tuân thủ)'
            ],
            CorrectIndex: 0
          },
          {
            Question: 'Để giao tiếp và tư vấn hiệu quả nhất với một khách hàng thuộc nhóm C (Tuân thủ), bạn nên làm gì?',
            Options: [
              'Tán gẫu nhiệt tình về các chủ đề cuộc sống cá nhân',
              'Cung cấp thông số kỹ thuật, dữ liệu cụ thể và chứng chỉ rõ ràng',
              'Thúc ép họ đưa ra quyết định mua hàng thật nhanh chóng',
              'Đưa ra các cam kết miệng không cần giấy tờ'
            ],
            CorrectIndex: 1
          },
          {
            Question: 'Nhân viên chăm sóc khách hàng có tính cách kiên nhẫn, điềm tĩnh, biết lắng nghe thường thuộc nhóm nào?',
            Options: [
              'Nhóm D (Thống trị)',
              'Nhóm I (Ảnh hưởng)',
              'Nhóm S (Kiên định)',
              'Nhóm C (Tuân thủ)'
            ],
            CorrectIndex: 2
          }
        ]
      },
      {
        CourseID: 'c3',
        Title: 'Hội nhập Nhân sự và Văn hóa Doanh nghiệp AHCOM',
        Category: 'HR',
        ContentType: 'Video',
        TargetGroup: 'All', // Accessible to all
        ContentURL: 'https://assets.mixkit.co/videos/preview/mixkit-presentation-in-a-modern-office-42289-large.mp4',
        QuizQuestions: [
          {
            Question: 'Giá trị cốt lõi hàng đầu trong văn hóa làm việc của toàn thể nhân sự AHCOM là gì?',
            Options: [
              'Trung thực và Trách nhiệm cao trong công việc',
              'Tập trung tối đa vào lợi ích cá nhân trước tiên',
              'Cạnh tranh gay gắt bằng mọi giá với đồng nghiệp',
              'Chỉ tuân thủ khi có sự giám sát trực tiếp'
            ],
            CorrectIndex: 0
          },
          {
            Question: 'Thời gian làm việc hành chính chính thức của khối văn phòng AHCOM bắt đầu từ mấy giờ?',
            Options: [
              '08:30 sáng',
              '08:00 sáng',
              '09:00 sáng',
              '07:30 sáng'
            ],
            CorrectIndex: 1
          },
          {
            Question: 'Hành vi ứng xử nào sau đây được khuyến khích hàng đầu tại văn hóa công sở AHCOM?',
            Options: [
              'Hợp tác, sẵn lòng hỗ trợ, chia sẻ kiến thức với đồng nghiệp',
              'Làm việc riêng, chơi game trong giờ hành chính',
              'Tiết lộ thông tin bảo mật của khách hàng ra bên ngoài',
              'Tránh né trách nhiệm khi xảy ra sai sót trong quy trình làm việc'
            ],
            CorrectIndex: 0
          }
        ]
      }
    ];
    localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(courses));
  }

  // 3. Initial Users (with pre-loaded Admin and students with different job levels)
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const users = [
      {
        UserID: 'u1',
        FullName: 'Nguyễn Văn Trưởng',
        EmployeeID: 'AHCOM001',
        Email: 'admin@ahcom.vn',
        Password: 'adminpassword',
        Role: 'Admin',
        Department: 'Ban Giám Đốc',
        JobLevel: 'All'
      },
      {
        UserID: 'u2',
        FullName: 'Nguyễn Văn Quyết',
        EmployeeID: 'AHCOM002',
        Email: 'quyet.nv@ahcom.vn',
        Password: 'password123',
        Role: 'Student',
        Department: 'Phòng Kinh doanh',
        JobLevel: 'Staff' // Normal staff
      },
      {
        UserID: 'u3',
        FullName: 'Phan Thị Linh',
        EmployeeID: 'AHCOM003',
        Email: 'linh.pt@ahcom.vn',
        Password: 'password123',
        Role: 'Student',
        Department: 'Hành chính Nhân sự',
        JobLevel: 'Manager' // Manager level
      }
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  // 4. Lessons Progress (Initial seed for sample student to make dashboard look realistic)
  if (!localStorage.getItem(DB_KEYS.PROGRESS)) {
    const progress = [
      {
        ProgressID: 'p1',
        UserID: 'u2',
        CourseID: 'c1',
        WatchTimeSeconds: 480,
        IsCompleted: true
      },
      {
        ProgressID: 'p2',
        UserID: 'u2',
        CourseID: 'c2',
        WatchTimeSeconds: 155,
        IsCompleted: false
      },
      {
        ProgressID: 'p3',
        UserID: 'u3',
        CourseID: 'c1',
        WatchTimeSeconds: 50,
        IsCompleted: false
      }
    ];
    localStorage.setItem(DB_KEYS.PROGRESS, JSON.stringify(progress));
  }

  // 5. Quiz Results (Initial seed)
  if (!localStorage.getItem(DB_KEYS.QUIZ_RESULTS)) {
    const quizResults = [
      {
        ResultID: 'r1',
        UserID: 'u2',
        CourseID: 'c1',
        Score: 3,
        TotalQuestions: 3,
        Status: 'Passed',
        CompletedAt: '2026-07-08T10:15:30.000Z'
      }
    ];
    localStorage.setItem(DB_KEYS.QUIZ_RESULTS, JSON.stringify(quizResults));
  }

  // Auto Migration to add TargetGroup and JobLevel to existing localStorage if missing
  try {
    const existingUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    if (existingUsers && Array.isArray(existingUsers)) {
      let migrated = false;
      existingUsers.forEach(u => {
        if (!u.JobLevel) {
          if (u.Role === 'Admin') u.JobLevel = 'All';
          else if (u.EmployeeID === 'AHCOM003') u.JobLevel = 'Manager';
          else u.JobLevel = 'Staff';
          migrated = true;
        }
      });
      if (migrated) {
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(existingUsers));
      }
    }

    const existingCourses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES));
    if (existingCourses && Array.isArray(existingCourses)) {
      let migrated = false;
      existingCourses.forEach(c => {
        if (!c.TargetGroup) {
          if (c.CourseID === 'c2') c.TargetGroup = 'Manager';
          else c.TargetGroup = 'All';
          migrated = true;
        }
        if (c.ContentType === 'Slide' && !c.SlideSource) {
          c.SlideSource = c.ContentURL ? 'link' : 'manual';
          migrated = true;
        }
      });
      if (migrated) {
        localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(existingCourses));
      }
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

// Call initialization immediately on file load
initDatabase();

// DB API layer
const db = {
  // Validate if employee ID is in whitelist
  validateEmployeeID(employeeId) {
    const validIDs = JSON.parse(localStorage.getItem(DB_KEYS.VALID_IDS)) || [];
    return validIDs.some(item => item.EmployeeID.toUpperCase() === employeeId.trim().toUpperCase());
  },

  // Check if Employee ID already has an account
  isEmployeeRegistered(employeeId) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    return users.some(u => u.EmployeeID.toUpperCase() === employeeId.trim().toUpperCase());
  },

  // Check if Email already exists
  isEmailRegistered(email) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    return users.some(u => u.Email.toLowerCase() === email.trim().toLowerCase());
  },

  // Register user account
  registerUser(fullName, employeeId, email, password, department, jobLevel = 'Staff') {
    const cleanEmpId = employeeId.trim().toUpperCase();
    
    // 1. Verify whitelist
    if (!this.validateEmployeeID(cleanEmpId)) {
      return {
        success: false,
        message: 'Mã nhân viên không hợp lệ hoặc không tồn tại trên hệ thống AHCOM. Vui lòng liên hệ phòng HR.'
      };
    }

    // 2. Check duplicate registration
    if (this.isEmployeeRegistered(cleanEmpId)) {
      return {
        success: false,
        message: 'Mã nhân viên này đã được đăng ký tài khoản trên hệ thống.'
      };
    }

    if (this.isEmailRegistered(email)) {
      return {
        success: false,
        message: 'Địa chỉ Email này đã được sử dụng.'
      };
    }

    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    const newUserId = 'u' + (users.length + 1) + '_' + Date.now();
    
    const newUser = {
      UserID: newUserId,
      FullName: fullName.trim(),
      EmployeeID: cleanEmpId,
      Email: email.trim().toLowerCase(),
      Password: password, // Plain text in simulated environment
      Role: 'Student', // Defaults to student, Admin accounts are seeded
      Department: department,
      JobLevel: jobLevel
    };

    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    return {
      success: true,
      user: {
        UserID: newUser.UserID,
        FullName: newUser.FullName,
        EmployeeID: newUser.EmployeeID,
        Email: newUser.Email,
        Role: newUser.Role,
        Department: newUser.Department,
        JobLevel: newUser.JobLevel
      }
    };
  },

  // Login user by Email or Employee ID
  loginUser(emailOrEmpId, password) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    const searchVal = emailOrEmpId.trim().toLowerCase();

    const user = users.find(u => 
      (u.Email.toLowerCase() === searchVal || u.EmployeeID.toLowerCase() === searchVal) && 
      u.Password === password
    );

    if (user) {
      return {
        success: true,
        user: {
          UserID: user.UserID,
          FullName: user.FullName,
          EmployeeID: user.EmployeeID,
          Email: user.Email,
          Role: user.Role,
          Department: user.Department,
          JobLevel: user.JobLevel || 'Staff'
        }
      };
    }

    return {
      success: false,
      message: 'Email/Mã nhân viên hoặc mật khẩu không chính xác.'
    };
  },

  // Get list of courses
  getCourses() {
    return JSON.parse(localStorage.getItem(DB_KEYS.COURSES)) || [];
  },

  // Get progress records for a user
  getUserProgress(userId) {
    const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS)) || [];
    return progressList.filter(p => p.UserID === userId);
  },

  // Update study watch time progress
  updateWatchProgress(userId, courseId, watchSeconds, isCompleted = false) {
    const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS)) || [];
    let progress = progressList.find(p => p.UserID === userId && p.CourseID === courseId);

    if (progress) {
      // Accumulate study time
      progress.WatchTimeSeconds = Math.max(progress.WatchTimeSeconds, watchSeconds);
      if (isCompleted) {
        progress.IsCompleted = true;
      }
    } else {
      progress = {
        ProgressID: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        UserID: userId,
        CourseID: courseId,
        WatchTimeSeconds: watchSeconds,
        IsCompleted: isCompleted
      };
      progressList.push(progress);
    }

    localStorage.setItem(DB_KEYS.PROGRESS, JSON.stringify(progressList));
    return progress;
  },

  // Save Quiz Results
  saveQuizResult(userId, courseId, score, totalQuestions, status) {
    const results = JSON.parse(localStorage.getItem(DB_KEYS.QUIZ_RESULTS)) || [];
    
    // Check if user already took this quiz, if so we update with their best/latest score
    let existingResult = results.find(r => r.UserID === userId && r.CourseID === courseId);
    
    if (existingResult) {
      existingResult.Score = Math.max(existingResult.Score, score);
      existingResult.TotalQuestions = totalQuestions;
      existingResult.Status = (existingResult.Score / totalQuestions >= 0.7 || status === 'Passed') ? 'Passed' : 'Failed';
      existingResult.CompletedAt = new Date().toISOString();
    } else {
      const newResult = {
        ResultID: 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        UserID: userId,
        CourseID: courseId,
        Score: score,
        TotalQuestions: totalQuestions,
        Status: status, // 'Passed' or 'Failed'
        CompletedAt: new Date().toISOString()
      };
      results.push(newResult);
    }

    localStorage.setItem(DB_KEYS.QUIZ_RESULTS, JSON.stringify(results));
  },

  // Get specific quiz results for a user
  getUserQuizResults(userId) {
    const results = JSON.parse(localStorage.getItem(DB_KEYS.QUIZ_RESULTS)) || [];
    return results.filter(r => r.UserID === userId);
  },

  // Format seconds to "Hours:Minutes" or "Minutes:Seconds"
  formatWatchTime(seconds) {
    if (!seconds || seconds <= 0) return '0 phút';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    let result = '';
    if (hrs > 0) {
      result += `${hrs} giờ `;
    }
    result += `${mins} phút`;
    return result;
  },

  // Get overall student metrics for Admin Portal
  getAdminAnalytics() {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    const courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES)) || [];
    const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS)) || [];
    const quizResults = JSON.parse(localStorage.getItem(DB_KEYS.QUIZ_RESULTS)) || [];

    // Filter to only display Students (Admins are excluded from learning metrics)
    const students = users.filter(u => u.Role === 'Student');

    return students.map(student => {
      // 1. Lessons completed
      const studentProgress = progressList.filter(p => p.UserID === student.UserID);
      const completedLessons = studentProgress
        .filter(p => p.IsCompleted)
        .map(p => {
          const course = courses.find(c => c.CourseID === p.CourseID);
          return course ? course.Title : 'Bài học không tên';
        });

      // 2. Cumulative watch time
      const totalSeconds = studentProgress.reduce((sum, p) => sum + (p.WatchTimeSeconds || 0), 0);
      const formattedDuration = this.formatWatchTime(totalSeconds);

      // 3. Quiz History
      const studentQuizzes = quizResults.filter(q => q.UserID === student.UserID);
      const quizHistory = studentQuizzes.map(q => {
        const course = courses.find(c => c.CourseID === q.CourseID);
        return {
          CourseTitle: course ? course.Title : 'Khóa học',
          Score: `${q.Score}/${q.TotalQuestions}`,
          Status: q.Status === 'Passed' ? 'Đạt' : 'Chưa đạt',
          Date: new Date(q.CompletedAt).toLocaleDateString('vi-VN')
        };
      });

      return {
        UserID: student.UserID,
        FullName: student.FullName,
        EmployeeID: student.EmployeeID,
        Department: student.Department || 'Khác',
        JobLevel: student.JobLevel === 'Manager' ? 'Quản lý' : 'Nhân viên',
        CompletedLessons: completedLessons, // Array of titles
        TotalSeconds: totalSeconds,
        TotalDuration: formattedDuration, // "1 giờ 25 phút"
        QuizHistory: quizHistory // Array of objects
      };
    });
  },

  // Save or update a course
  saveCourse(courseData) {
    const courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES)) || [];
    if (courseData.CourseID) {
      // Edit mode
      const idx = courses.findIndex(c => c.CourseID === courseData.CourseID);
      if (idx !== -1) {
        courses[idx] = courseData;
      } else {
        courses.push(courseData);
      }
    } else {
      // Add mode
      courseData.CourseID = 'c_' + Date.now();
      courses.push(courseData);
    }
    localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(courses));
    return courseData;
  },

  // Delete a course and its related progress/results
  deleteCourse(courseId) {
    // 1. Delete course
    let courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES)) || [];
    courses = courses.filter(c => c.CourseID !== courseId);
    localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(courses));

    // 2. Clean progress
    let progress = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS)) || [];
    progress = progress.filter(p => p.CourseID !== courseId);
    localStorage.setItem(DB_KEYS.PROGRESS, JSON.stringify(progress));

    // 3. Clean quiz results
    let results = JSON.parse(localStorage.getItem(DB_KEYS.QUIZ_RESULTS)) || [];
    results = results.filter(r => r.CourseID !== courseId);
    localStorage.setItem(DB_KEYS.QUIZ_RESULTS, JSON.stringify(results));

    // 4. Clean large local video file in IndexedDB
    if (this.largeFileStorage) {
      this.largeFileStorage.deleteVideo(courseId).catch(err => console.error("Error deleting local video: ", err));
    }
  },

  // Get all valid employee IDs (whitelist)
  getValidEmployeeIDs() {
    return JSON.parse(localStorage.getItem(DB_KEYS.VALID_IDS)) || [];
  },

  // Add a new valid employee ID to whitelist
  addValidEmployeeID(employeeId) {
    const cleanId = employeeId.trim().toUpperCase();
    if (!cleanId) return { success: false, message: 'Mã nhân viên không được để trống.' };

    const validIDs = JSON.parse(localStorage.getItem(DB_KEYS.VALID_IDS)) || [];
    const exists = validIDs.some(item => item.EmployeeID.toUpperCase() === cleanId);
    
    if (exists) {
      return { success: false, message: `Mã nhân viên ${cleanId} đã tồn tại trong danh sách Whitelist.` };
    }

    validIDs.push({ EmployeeID: cleanId });
    localStorage.setItem(DB_KEYS.VALID_IDS, JSON.stringify(validIDs));
    return { success: true, message: `Đã thêm mã nhân viên ${cleanId} vào Whitelist thành công.` };
  },

  // Delete a valid employee ID from whitelist
  deleteValidEmployeeID(employeeId) {
    const cleanId = employeeId.trim().toUpperCase();
    let validIDs = JSON.parse(localStorage.getItem(DB_KEYS.VALID_IDS)) || [];
    
    const exists = validIDs.some(item => item.EmployeeID.toUpperCase() === cleanId);
    if (!exists) {
      return { success: false, message: `Không tìm thấy mã nhân viên ${cleanId} trong danh sách.` };
    }

    validIDs = validIDs.filter(item => item.EmployeeID.toUpperCase() !== cleanId);
    localStorage.setItem(DB_KEYS.VALID_IDS, JSON.stringify(validIDs));
    return { success: true, message: `Đã xóa mã nhân viên ${cleanId} khỏi Whitelist.` };
  },

  // Delete multiple employee IDs from whitelist
  deleteValidEmployeeIDs(employeeIds) {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return { success: false, message: 'Danh sách mã xóa trống.' };
    }
    const cleanIds = employeeIds.map(id => id.trim().toUpperCase());
    let validIDs = JSON.parse(localStorage.getItem(DB_KEYS.VALID_IDS)) || [];
    
    validIDs = validIDs.filter(item => !cleanIds.includes(item.EmployeeID.toUpperCase()));
    localStorage.setItem(DB_KEYS.VALID_IDS, JSON.stringify(validIDs));
    return { success: true, message: `Đã xóa thành công ${cleanIds.length} mã nhân viên được chọn.` };
  },

  // Clear all employee IDs from whitelist
  clearAllValidEmployeeIDs() {
    localStorage.setItem(DB_KEYS.VALID_IDS, JSON.stringify([]));
    return { success: true, message: 'Đã xóa toàn bộ danh sách mã nhân viên Whitelist.' };
  },

  // Update user profile info (Admin or Student self-update)
  updateUserProfile(userId, updatedData) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    const idx = users.findIndex(u => u.UserID === userId);
    
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy người dùng trên hệ thống.' };
    }

    const targetUser = users[idx];

    // Check duplicate Email if it is changing
    if (updatedData.Email && updatedData.Email.trim().toLowerCase() !== targetUser.Email.toLowerCase()) {
      const emailExists = users.some(u => u.UserID !== userId && u.Email.toLowerCase() === updatedData.Email.trim().toLowerCase());
      if (emailExists) {
        return { success: false, message: 'Địa chỉ Email này đã được sử dụng bởi tài khoản khác.' };
      }
    }

    // Check duplicate EmployeeID if it is changing (Admin edit user case)
    if (updatedData.EmployeeID && updatedData.EmployeeID.trim().toUpperCase() !== targetUser.EmployeeID.toUpperCase()) {
      const cleanEmpId = updatedData.EmployeeID.trim().toUpperCase();
      // 1. Verify Whitelist
      if (!this.validateEmployeeID(cleanEmpId)) {
        return { success: false, message: 'Mã nhân viên mới không hợp lệ hoặc không tồn tại trong Whitelist.' };
      }
      // 2. Verify Duplicate
      const idExists = users.some(u => u.UserID !== userId && u.EmployeeID.toUpperCase() === cleanEmpId);
      if (idExists) {
        return { success: false, message: 'Mã nhân viên mới này đã được đăng ký bởi tài khoản khác.' };
      }
      targetUser.EmployeeID = cleanEmpId;
    }

    if (updatedData.FullName) targetUser.FullName = updatedData.FullName.trim();
    if (updatedData.Email) targetUser.Email = updatedData.Email.trim().toLowerCase();
    if (updatedData.Department) targetUser.Department = updatedData.Department;
    if (updatedData.JobLevel) targetUser.JobLevel = updatedData.JobLevel;
    if (updatedData.Password) targetUser.Password = updatedData.Password.trim();

    users[idx] = targetUser;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    return {
      success: true,
      message: 'Cập nhật thông tin thành công.',
      user: {
        UserID: targetUser.UserID,
        FullName: targetUser.FullName,
        EmployeeID: targetUser.EmployeeID,
        Email: targetUser.Email,
        Role: targetUser.Role,
        Department: targetUser.Department,
        JobLevel: targetUser.JobLevel
      }
    };
  },

  // Import multiple valid employee IDs in bulk
  importValidEmployeeIDs(idArray) {
    if (!Array.isArray(idArray)) return { success: false, addedCount: 0, skippedCount: 0, message: 'Dữ liệu đầu vào không hợp lệ.' };
    
    const validIDs = JSON.parse(localStorage.getItem(DB_KEYS.VALID_IDS)) || [];
    let addedCount = 0;
    let skippedCount = 0;

    idArray.forEach(id => {
      const cleanId = id.trim().toUpperCase();
      if (!cleanId) return;

      const exists = validIDs.some(item => item.EmployeeID.toUpperCase() === cleanId);
      if (exists) {
        skippedCount++;
      } else {
        validIDs.push({ EmployeeID: cleanId });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      localStorage.setItem(DB_KEYS.VALID_IDS, JSON.stringify(validIDs));
    }

    return {
      success: true,
      addedCount: addedCount,
      skippedCount: skippedCount,
      message: `Đã nhập thành công ${addedCount} mã nhân viên mới. (Bỏ qua ${skippedCount} mã đã tồn tại)`
    };
  },

  // Get all departments
  getDepartments() {
    return JSON.parse(localStorage.getItem(DB_KEYS.DEPARTMENTS)) || [];
  },

  // Add a new department
  addDepartment(deptName) {
    const cleanName = deptName.trim();
    if (!cleanName) return { success: false, message: 'Tên phòng ban không được để trống.' };

    const depts = this.getDepartments();
    const exists = depts.some(d => d.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return { success: false, message: `Phòng ban "${cleanName}" đã tồn tại trên hệ thống.` };
    }

    depts.push(cleanName);
    localStorage.setItem(DB_KEYS.DEPARTMENTS, JSON.stringify(depts));
    return { success: true, message: `Đã thêm phòng ban "${cleanName}" thành công.` };
  },

  // Update a department name and migrate all associated users
  updateDepartment(oldName, newName) {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanOld || !cleanNew) return { success: false, message: 'Tên phòng ban không được để trống.' };
    if (cleanOld.toLowerCase() === cleanNew.toLowerCase()) {
      return { success: false, message: 'Tên phòng ban mới không được trùng với tên cũ.' };
    }

    const depts = this.getDepartments();
    const idx = depts.findIndex(d => d.toLowerCase() === cleanOld.toLowerCase());
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy phòng ban cần chỉnh sửa.' };
    }

    const exists = depts.some(d => d.toLowerCase() === cleanNew.toLowerCase());
    if (exists) {
      return { success: false, message: `Tên phòng ban mới "${cleanNew}" đã tồn tại.` };
    }

    // 1. Update department name in list
    depts[idx] = cleanNew;
    localStorage.setItem(DB_KEYS.DEPARTMENTS, JSON.stringify(depts));

    // 2. Migrate existing users belonging to old department
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    let updatedUsersCount = 0;
    users.forEach(user => {
      if (user.Department === cleanOld) {
        user.Department = cleanNew;
        updatedUsersCount++;
      }
    });

    if (updatedUsersCount > 0) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      
      // Update session if active user is affected
      const activeSession = sessionStorage.getItem('ahcom_session');
      if (activeSession) {
        const currentUser = JSON.parse(activeSession);
        if (currentUser.Department === cleanOld) {
          currentUser.Department = cleanNew;
          sessionStorage.setItem('ahcom_session', JSON.stringify(currentUser));
        }
      }
    }

    return { success: true, message: `Đã đổi tên phòng ban thành "${cleanNew}" thành công. (Đã cập nhật ${updatedUsersCount} tài khoản nhân viên liên quan)` };
  },

  // Delete a department
  deleteDepartment(deptName) {
    const cleanName = deptName.trim();
    const depts = this.getDepartments();
    
    const exists = depts.some(d => d.toLowerCase() === cleanName.toLowerCase());
    if (!exists) {
      return { success: false, message: 'Không tìm thấy phòng ban cần xóa.' };
    }

    // Check if there are users currently belonging to this department
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    const hasUsers = users.some(u => u.Department === cleanName);
    if (hasUsers) {
      return { success: false, message: `Không thể xóa phòng ban "${cleanName}" do đang có nhân viên thuộc phòng ban này. Vui lòng chuyển các nhân viên sang phòng ban khác trước.` };
    }

    const updatedDepts = depts.filter(d => d.toLowerCase() !== cleanName.toLowerCase());
    localStorage.setItem(DB_KEYS.DEPARTMENTS, JSON.stringify(updatedDepts));
    return { success: true, message: `Đã xóa phòng ban "${cleanName}" khỏi hệ thống.` };
  },

  // Large file binary storage using browser IndexedDB (stores local video files)
  largeFileStorage: {
    dbConfig: {
      dbName: 'AHCOM_ELearning_LargeFiles',
      storeName: 'course_videos',
      version: 1
    },

    getConnection() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbConfig.dbName, this.dbConfig.version);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.dbConfig.storeName)) {
            db.createObjectStore(this.dbConfig.storeName, { keyPath: 'courseId' });
          }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });
    },

    async saveVideo(courseId, blob) {
      const dbConn = await this.getConnection();
      return new Promise((resolve, reject) => {
        const transaction = dbConn.transaction(this.dbConfig.storeName, 'readwrite');
        const store = transaction.objectStore(this.dbConfig.storeName);
        const request = store.put({ courseId, videoBlob: blob, name: blob.name, type: blob.type });
        request.onsuccess = () => resolve(true);
        request.onerror = (e) => reject(e.target.error);
      });
    },

    async getVideo(courseId) {
      const dbConn = await this.getConnection();
      return new Promise((resolve, reject) => {
        const transaction = dbConn.transaction(this.dbConfig.storeName, 'readonly');
        const store = transaction.objectStore(this.dbConfig.storeName);
        const request = store.get(courseId);
        request.onsuccess = (e) => {
          const result = e.target.result;
          if (result && result.videoBlob) {
            resolve(result.videoBlob);
          } else {
            resolve(null);
          }
        };
        request.onerror = (e) => reject(e.target.error);
      });
    },

    async deleteVideo(courseId) {
      const dbConn = await this.getConnection();
      return new Promise((resolve, reject) => {
        const transaction = dbConn.transaction(this.dbConfig.storeName, 'readwrite');
        const store = transaction.objectStore(this.dbConfig.storeName);
        const request = store.delete(courseId);
        request.onsuccess = () => resolve(true);
        request.onerror = (e) => reject(e.target.error);
      });
    }
  }
};

// Expose globally for app scripts
window.ahcomDB = db;
