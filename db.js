/**
 * AHCOM E-Learning Database Connector (Supabase Integration Layer - Multi-tenant Upgrade)
 * Manages asynchronous cloud sync with Supabase PostgreSQL and handles large local videos via IndexedDB.
 */

const SUPABASE_URL = 'https://vhbokhazwnmfpzijbljc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYm9raGF6d25tZnB6aWpibGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NzA5MTAsImV4cCI6MjA5OTI0NjkxMH0.f2rOeY_ElRIOkkjuEftuUsiDRPTiLdKIgrgAPIbNvRk';

// Rename local connection variable to supabaseClient to avoid collision with CDN global window.supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const db = {
  // --- CATEGORIES / PHÂN LOẠI KHÓA HỌC CRUD ---
  async getCategories() {
    const { data, error } = await supabaseClient
      .from('ahcom_categories')
      .select('name')
      .order('id', { ascending: true });
    if (error || !data || data.length === 0) {
      // Fallback default list if table doesn't exist yet
      return ['Kỹ năng Bán hàng', 'Mô hình DISC', 'Hội nhập & Quy chế'];
    }
    return data.map(c => c.name);
  },

  async addCategory(categoryName) {
    const cleanName = categoryName.trim();
    if (!cleanName) return { success: false, message: 'Tên phân loại không được để trống.' };

    const { error } = await supabaseClient
      .from('ahcom_categories')
      .insert({ name: cleanName });

    if (error) {
      if (error.code === '23505') return { success: false, message: 'Phân loại này đã tồn tại.' };
      return { success: false, message: error.message };
    }
    return { success: true, message: `Đã thêm phân loại "${cleanName}" thành công.` };
  },

  async updateCategory(oldName, newName) {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanNew) return { success: false, message: 'Tên phân loại mới không được để trống.' };

    // Update in ahcom_categories table
    const { error: catError } = await supabaseClient
      .from('ahcom_categories')
      .update({ name: cleanNew })
      .eq('name', cleanOld);

    if (catError && catError.code === '23505') {
      return { success: false, message: 'Tên phân loại này đã tồn tại.' };
    }

    // Cascade update category on existing courses in ahcom_courses
    await supabaseClient
      .from('ahcom_courses')
      .update({ category: cleanNew })
      .eq('category', cleanOld);

    return { success: true, message: `Đã cập nhật tên phân loại thành "${cleanNew}" thành công.` };
  },

  async deleteCategory(categoryName) {
    const cleanName = categoryName.trim();

    // Check if courses are using this category
    const { data: courses } = await supabaseClient
      .from('ahcom_courses')
      .select('course_id')
      .eq('category', cleanName)
      .limit(1);

    if (courses && courses.length > 0) {
      return { success: false, message: `Không thể xóa phân loại "${cleanName}" do đang có khóa học thuộc phân loại này.` };
    }

    const { error } = await supabaseClient
      .from('ahcom_categories')
      .delete()
      .eq('name', cleanName);

    if (error) return { success: false, message: error.message };
    return { success: true, message: `Đã xóa phân loại "${cleanName}" thành công.` };
  },

  // --- COMPANIES CRUD (NEW) ---
  async getCompanies() {
    const { data, error } = await supabaseClient
      .from('ahcom_companies')
      .select('name')
      .order('id', { ascending: true });
    if (error) {
      console.error("Lỗi getCompanies: ", error);
      return [];
    }
    return data.map(c => c.name);
  },

  async addCompany(companyName) {
    const cleanName = companyName.trim();
    if (!cleanName) return { success: false, message: 'Tên công ty không được để trống.' };
    const { error } = await supabaseClient
      .from('ahcom_companies')
      .insert({ name: cleanName });
    if (error) {
      if (error.code === '23505') return { success: false, message: 'Công ty này đã tồn tại.' };
      return { success: false, message: error.message };
    }
    return { success: true, message: `Đã thêm công ty "${cleanName}" thành công.` };
  },

  async deleteCompany(companyName) {
    const cleanName = companyName.trim();
    
    // Check if there are users currently belonging to this company
    const { data: users, error: userCheckError } = await supabaseClient
      .from('ahcom_users')
      .select('user_id')
      .eq('company', cleanName)
      .limit(1);
    if (users && users.length > 0) {
      return { success: false, message: `Không thể xóa công ty "${cleanName}" vì đang có nhân viên trực thuộc.` };
    }

    // Check if there are departments currently belonging to this company
    const { data: depts, error: deptCheckError } = await supabaseClient
      .from('ahcom_departments')
      .select('id')
      .eq('company', cleanName)
      .limit(1);
    if (depts && depts.length > 0) {
      return { success: false, message: `Không thể xóa công ty "${cleanName}" vì đang có phòng ban trực thuộc.` };
    }

    const { error } = await supabaseClient
      .from('ahcom_companies')
      .delete()
      .eq('name', cleanName);
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Đã xóa công ty "${cleanName}" khỏi hệ thống.` };
  },

  async updateCompany(oldName, newName) {
    const cleanOldName = oldName.trim();
    const cleanNewName = newName.trim();
    if (!cleanNewName) return { success: false, message: 'Tên công ty không được để trống.' };

    const { error: companyError } = await supabaseClient
      .from('ahcom_companies')
      .update({ name: cleanNewName })
      .eq('name', cleanOldName);
      
    if (companyError) {
      if (companyError.code === '23505') return { success: false, message: 'Công ty này đã tồn tại.' };
      return { success: false, message: companyError.message };
    }

    // Cascade update referencing tables (using simple string matches)
    await supabaseClient.from('ahcom_departments').update({ company: cleanNewName }).eq('company', cleanOldName);
    await supabaseClient.from('ahcom_whitelist').update({ company: cleanNewName }).eq('company', cleanOldName);
    await supabaseClient.from('ahcom_users').update({ company: cleanNewName }).eq('company', cleanOldName);
    await supabaseClient.from('ahcom_courses').update({ scope_company: cleanNewName }).eq('scope_company', cleanOldName);

    return { success: true, message: `Đổi tên công ty thành "${cleanNewName}" thành công.` };
  },

  // --- DEPARTMENTS CRUD ---
  async getDepartments(companyFilter = null) {
    let query = supabaseClient
      .from('ahcom_departments')
      .select('name, company')
      .order('id', { ascending: true });
    
    if (companyFilter) {
      query = query.eq('company', companyFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Lỗi getDepartments: ", error);
      return [];
    }
    // Return objects containing both name and company for dynamic frontend filtering
    return data.map(d => ({ name: d.name, company: d.company || 'AHCOM Tổng' }));
  },

  async addDepartment(deptName, companyName = 'AHCOM Tổng') {
    const cleanName = deptName.trim();
    const cleanCompany = companyName.trim();
    if (!cleanName) return { success: false, message: 'Tên phòng ban không được để trống.' };
    const { error } = await supabaseClient
      .from('ahcom_departments')
      .insert({ name: cleanName, company: cleanCompany });
    if (error) {
      if (error.code === '23505') return { success: false, message: 'Phòng ban này đã tồn tại.' };
      return { success: false, message: error.message };
    }
    return { success: true, message: `Đã thêm phòng ban "${cleanName}" thuộc "${cleanCompany}" thành công.` };
  },

  async updateDepartment(oldName, newName, oldCompany, newCompany) {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    const cleanOldCompany = oldCompany.trim();
    const cleanNewCompany = newCompany.trim();
    
    if (!cleanNew) return { success: false, message: 'Tên phòng ban mới không được để trống.' };
    
    // 1. Update the department name and company in ahcom_departments
    const { error: deptError } = await supabaseClient
      .from('ahcom_departments')
      .update({ name: cleanNew, company: cleanNewCompany })
      .eq('name', cleanOld)
      .eq('company', cleanOldCompany);
      
    if (deptError) {
      if (deptError.code === '23505') return { success: false, message: 'Tên phòng ban này đã tồn tại trong công ty đích.' };
      return { success: false, message: deptError.message };
    }

    // 2. Update users belonging to this department and company
    await supabaseClient
      .from('ahcom_users')
      .update({ department: cleanNew, company: cleanNewCompany })
      .eq('department', cleanOld)
      .eq('company', cleanOldCompany);

    // 3. Update whitelist entries for this department and company
    await supabaseClient
      .from('ahcom_whitelist')
      .update({ department: cleanNew, company: cleanNewCompany })
      .eq('department', cleanOld)
      .eq('company', cleanOldCompany);

    // 4. Update courses scope
    await supabaseClient
      .from('ahcom_courses')
      .update({ scope_department: cleanNew, scope_company: cleanNewCompany })
      .eq('scope_department', cleanOld)
      .eq('scope_company', cleanOldCompany);
    
    return { success: true, message: `Đã cập nhật phòng ban thành công.` };
  },

  async deleteDepartment(deptName, companyName) {
    const cleanName = deptName.trim();
    const cleanCompany = companyName.trim();
    
    // Check if there are users currently belonging to this department in this company
    const { data: users, error: checkError } = await supabaseClient
      .from('ahcom_users')
      .select('user_id')
      .eq('department', cleanName)
      .eq('company', cleanCompany)
      .limit(1);
    if (users && users.length > 0) {
      return { success: false, message: `Không thể xóa phòng ban "${cleanName}" do đang có nhân viên thuộc phòng ban này. Vui lòng chuyển các nhân viên sang phòng ban khác trước.` };
    }

    const { error } = await supabaseClient
      .from('ahcom_departments')
      .delete()
      .eq('name', cleanName)
      .eq('company', cleanCompany);
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Đã xóa phòng ban "${cleanName}" thành công.` };
  },

  // --- WHITELIST EMPLOYEE IDS ---
  async getValidEmployeeIDs() {
    const { data, error } = await supabaseClient
      .from('ahcom_whitelist')
      .select('employee_id, company, department');
    if (error) {
      console.error("Lỗi getValidEmployeeIDs: ", error);
      return [];
    }
    return data.map(d => ({ 
      EmployeeID: d.employee_id,
      Company: d.company || 'AHCOM Tổng',
      Department: d.department || 'Ban Giám Đốc'
    }));
  },

  async addValidEmployeeID(newEmpId, company = 'AHCOM Tổng', department = 'Ban Giám Đốc') {
    const cleanId = newEmpId.trim().toUpperCase();
    if (!cleanId) return { success: false, message: 'Mã nhân sự không được để trống.' };

    const { error } = await supabaseClient
      .from('ahcom_whitelist')
      .insert({ 
        employee_id: cleanId,
        company: company,
        department: department
      });
    if (error) {
      if (error.code === '23505') return { success: false, message: 'Mã nhân sự này đã tồn tại.' };
      return { success: false, message: error.message };
    }
    return { success: true, message: `Đã thêm mã nhân sự "${cleanId}" vào whitelist.` };
  },

  async addValidEmployeeIDs(idsArray, company = 'AHCOM Tổng', department = 'Ban Giám Đốc') {
    const rows = idsArray.map(id => ({ 
      employee_id: id.trim().toUpperCase(),
      company: company,
      department: department
    }));
    const { error } = await supabaseClient
      .from('ahcom_whitelist')
      .upsert(rows, { onConflict: 'employee_id' });
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Đã nhập thành công ${idsArray.length} mã nhân sự.` };
  },

  async importValidEmployeeIDs(codes, company = 'AHCOM Tổng', department = 'Ban Giám Đốc') {
    return await this.addValidEmployeeIDs(codes, company, department);
  },

  async deleteValidEmployeeID(employeeId) {
    const { error } = await supabaseClient
      .from('ahcom_whitelist')
      .delete()
      .eq('employee_id', employeeId.trim().toUpperCase());
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Đã xóa mã nhân sự "${employeeId}" khỏi whitelist.` };
  },

  async deleteValidEmployeeIDs(selectedIds) {
    const cleanIds = selectedIds.map(id => id.trim().toUpperCase());
    const { error } = await supabaseClient
      .from('ahcom_whitelist')
      .delete()
      .in('employee_id', cleanIds);
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Đã xóa ${selectedIds.length} mã nhân sự.` };
  },

  async clearValidEmployeeIDs() {
    const { error } = await supabaseClient
      .from('ahcom_whitelist')
      .delete()
      .neq('employee_id', '');
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Đã xóa toàn bộ danh sách whitelist thành công.' };
  },

  async clearAllValidEmployeeIDs() {
    return await this.clearValidEmployeeIDs();
  },

  // --- COURSES ---
  async getCourses() {
    const { data, error } = await supabaseClient
      .from('ahcom_courses')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error("Lỗi getCourses: ", error);
      return [];
    }
    let localCache = {};
    try {
      localCache = JSON.parse(localStorage.getItem('ahcom_courses_cache') || '{}');
    } catch(e) {}

    return data.map(c => {
      const cached = localCache[c.course_id] || {};
      const isHidden = c.is_hidden !== undefined && c.is_hidden !== null 
        ? c.is_hidden 
        : (cached.IsHidden !== undefined ? cached.IsHidden : false);

      return {
        CourseID: c.course_id,
        Title: c.title,
        Category: c.category,
        ContentType: c.content_type,
        TargetGroup: c.target_group,
        ContentURL: c.content_url,
        SlideSource: c.slide_source,
        ThumbnailURL: c.thumbnail_url,
        Slides: c.slides || [],
        QuizQuestions: c.quiz_questions || [],
        ScopeCompany: c.scope_company || 'All',
        ScopeDepartment: c.scope_department || 'All',
        CreatedByUserId: c.created_by_user_id,
        IsHidden: isHidden
      };
    });
  },

  async saveCourse(courseData) {
    const courseId = courseData.CourseID || ('c_' + Date.now());
    const row = {
      course_id: courseId,
      title: courseData.Title,
      category: courseData.Category,
      content_type: courseData.ContentType,
      target_group: courseData.TargetGroup,
      content_url: courseData.ContentURL || '',
      slide_source: courseData.SlideSource || 'manual',
      thumbnail_url: courseData.ThumbnailURL || '',
      slides: courseData.Slides || [],
      quiz_questions: courseData.QuizQuestions || [],
      scope_company: courseData.ScopeCompany || 'All',
      scope_department: courseData.ScopeDepartment || 'All',
      created_by_user_id: courseData.CreatedByUserId || null,
      is_hidden: courseData.IsHidden || false
    };

    let { error } = await supabaseClient
      .from('ahcom_courses')
      .upsert(row);

    // Fallback if is_hidden column is not created in Supabase schema yet
    if (error && error.message && error.message.includes('is_hidden')) {
      delete row.is_hidden;
      const res = await supabaseClient.from('ahcom_courses').upsert(row);
      error = res.error;
    }

    if (error) {
      throw new Error(error.message);
    }
    courseData.CourseID = courseId;

    // Cache locally
    try {
      const localCourses = JSON.parse(localStorage.getItem('ahcom_courses_cache') || '{}');
      localCourses[courseId] = courseData;
      localStorage.setItem('ahcom_courses_cache', JSON.stringify(localCourses));
    } catch(e) {}

    return courseData;
  },

  async deleteCourse(courseId) {
    const { error } = await supabaseClient
      .from('ahcom_courses')
      .delete()
      .eq('course_id', courseId);
    if (error) throw new Error(error.message);

    try {
      const localCourses = JSON.parse(localStorage.getItem('ahcom_courses_cache') || '{}');
      delete localCourses[courseId];
      localStorage.setItem('ahcom_courses_cache', JSON.stringify(localCourses));
    } catch(e) {}

    // Clean large local video file in IndexedDB
    if (this.largeFileStorage) {
      this.largeFileStorage.deleteVideo(courseId).catch(err => console.error("Error deleting local video: ", err));
    }
  },

  // --- USERS & AUTHENTICATION ---
  async getUsers() {
    const { data, error } = await supabaseClient
      .from('ahcom_users')
      .select('*');
    if (error) {
      console.error("Lỗi getUsers: ", error);
      return [];
    }
    return data.map(u => ({
      UserID: u.user_id,
      FullName: u.fullname,
      EmployeeID: u.employee_id,
      Email: u.email,
      Password: u.password,
      Department: u.department,
      JobLevel: u.job_level,
      Role: u.role,
      Company: u.company || 'AHCOM Tổng'
    }));
  },

  async registerUser(fullName, empId, email, password, department, jobLevel, company = 'AHCOM Tổng') {
    const cleanEmpId = empId.trim().toUpperCase();
    
    // 1. Verify employee_id exists in whitelist
    const { data: whitelistData, error: wlError } = await supabaseClient
      .from('ahcom_whitelist')
      .select('employee_id, company, department')
      .eq('employee_id', cleanEmpId);
    
    if (wlError || !whitelistData || whitelistData.length === 0) {
      return { success: false, message: 'Mã nhân viên không hợp lệ hoặc không tồn tại trên hệ thống AHCOM. Vui lòng liên hệ phòng HR.' };
    }

    const whitelistItem = whitelistData[0];
    // Automatically match the user's company and department with the whitelist pre-configured values
    const finalCompany = whitelistItem.company || company;
    const finalDepartment = whitelistItem.department || department;

    // 2. Check if employee_id already registered
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('ahcom_users')
      .select('user_id')
      .eq('employee_id', cleanEmpId);
    if (existingUser && existingUser.length > 0) {
      return { success: false, message: 'Mã nhân viên này đã đăng ký tài khoản trước đó.' };
    }

    // 3. Check if email already registered
    const { data: existingEmail, error: checkEmailError } = await supabaseClient
      .from('ahcom_users')
      .select('user_id')
      .eq('email', email.trim().toLowerCase());
    if (existingEmail && existingEmail.length > 0) {
      return { success: false, message: 'Địa chỉ Email này đã đăng ký tài khoản trước đó.' };
    }

    // 4. Create user
    const userId = 'u_' + Date.now();
    const row = {
      user_id: userId,
      fullname: fullName,
      employee_id: cleanEmpId,
      email: email.trim().toLowerCase(),
      password: password,
      department: finalDepartment,
      job_level: jobLevel,
      role: 'Student',
      company: finalCompany
    };

    const { error: regError } = await supabaseClient
      .from('ahcom_users')
      .insert(row);
    if (regError) return { success: false, message: regError.message };

    return {
      success: true,
      user: {
        UserID: row.user_id,
        FullName: row.fullname,
        EmployeeID: row.employee_id,
        Email: row.email,
        Password: row.password,
        Department: row.department,
        JobLevel: row.job_level,
        Role: row.role,
        Company: row.company
      }
    };
  },

  async loginUser(identity, password) {
    const cleanIdentity = identity.trim();
    const cleanPass = password.trim();

    // Find user by email or employee_id
    const query = cleanIdentity.includes('@') 
      ? supabaseClient.from('ahcom_users').select('*').eq('email', cleanIdentity.toLowerCase())
      : supabaseClient.from('ahcom_users').select('*').eq('employee_id', cleanIdentity.toUpperCase());

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return { success: false, message: 'Mã nhân viên hoặc email không chính xác.' };
    }

    const user = data[0];
    if (user.password !== cleanPass) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    return {
      success: true,
      user: {
        UserID: user.user_id,
        FullName: user.fullname,
        EmployeeID: user.employee_id,
        Email: user.email,
        Password: user.password,
        Department: user.department,
        JobLevel: user.job_level,
        Role: user.role,
        Company: user.company || 'AHCOM Tổng'
      }
    };
  },

  async updateUserProfile(userId, updatedData) {
    const row = {
      fullname: updatedData.FullName,
      email: updatedData.Email.trim().toLowerCase(),
      department: updatedData.Department,
      job_level: updatedData.JobLevel,
      company: updatedData.Company || 'AHCOM Tổng'
    };
    if (updatedData.Role !== undefined) {
      row.role = updatedData.Role;
    }
    if (updatedData.Password) {
      row.password = updatedData.Password;
    }

    const { data, error } = await supabaseClient
      .from('ahcom_users')
      .update(row)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) return { success: false, message: error.message };

    return {
      success: true,
      user: {
        UserID: data.user_id,
        FullName: data.fullname,
        EmployeeID: data.employee_id,
        Email: data.email,
        Password: data.password,
        Department: data.department,
        JobLevel: data.job_level,
        Role: data.role,
        Company: data.company
      }
    };
  },

  // --- LEARNING PROGRESS ---
  async getUserProgress(userId) {
    const { data, error } = await supabaseClient
      .from('ahcom_progress')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error("Lỗi getUserProgress: ", error);
      return [];
    }
    return data.map(p => ({
      ProgressID: p.id,
      UserID: p.user_id,
      CourseID: p.course_id,
      WatchTimeSeconds: p.watch_time_seconds,
      IsCompleted: p.is_completed,
      LastUpdated: p.updated_at
    }));
  },

  async updateWatchProgress(userId, courseId, seconds, isCompleted) {
    const row = {
      user_id: userId,
      course_id: courseId,
      watch_time_seconds: seconds,
      is_completed: isCompleted,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('ahcom_progress')
      .upsert(row, { onConflict: 'user_id,course_id' });
    if (error) console.error("Lỗi updateWatchProgress: ", error);
    
    return {
      UserID: userId,
      CourseID: courseId,
      WatchTimeSeconds: seconds,
      IsCompleted: isCompleted
    };
  },

  // --- QUIZ RESULTS ---
  async getUserQuizResults(userId) {
    const { data, error } = await supabaseClient
      .from('ahcom_quiz_results')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error("Lỗi getUserQuizResults: ", error);
      return [];
    }
    return data.map(r => ({
      ResultID: r.id,
      UserID: r.user_id,
      CourseID: r.course_id,
      Score: r.score,
      TotalQuestions: r.total_questions,
      Status: r.status,
      CompletedAt: r.created_at
    }));
  },

  async saveQuizResult(userId, courseId, score, totalQuestions, status) {
    const row = {
      user_id: userId,
      course_id: courseId,
      score: score,
      total_questions: totalQuestions,
      status: status
    };

    const { error } = await supabaseClient
      .from('ahcom_quiz_results')
      .insert(row);
    if (error) console.error("Lỗi saveQuizResult: ", error);

    return {
      UserID: userId,
      CourseID: courseId,
      Score: score,
      TotalQuestions: totalQuestions,
      Status: status
    };
  },

  // --- ADMIN ANALYTICS ---
  async getAdminAnalytics() {
    const users = await this.getUsers();
    const courses = await this.getCourses();
    
    const { data: progressData, error: pError } = await supabaseClient
      .from('ahcom_progress')
      .select('*');
    const progressList = pError ? [] : progressData.map(p => ({
      UserID: p.user_id,
      CourseID: p.course_id,
      WatchTimeSeconds: p.watch_time_seconds,
      IsCompleted: p.is_completed
    }));

    const { data: quizData, error: qError } = await supabaseClient
      .from('ahcom_quiz_results')
      .select('*');
    const quizResults = qError ? [] : quizData.map(r => ({
      UserID: r.user_id,
      CourseID: r.course_id,
      Score: r.score,
      TotalQuestions: r.total_questions,
      Status: r.status
    }));

    const students = users.filter(u => u.Role === 'Student');

    return students.map(student => {
      const studentProgress = progressList.filter(p => p.UserID === student.UserID);
      const completedLessons = studentProgress
        .filter(p => p.IsCompleted)
        .map(p => {
          const course = courses.find(c => c.CourseID === p.CourseID);
          return course ? course.Title : 'Bài học không tên';
        });

      const totalSeconds = studentProgress.reduce((sum, p) => sum + (p.WatchTimeSeconds || 0), 0);
      const totalDuration = this.formatWatchTime(totalSeconds);

      const studentQuizzes = quizResults.filter(q => q.UserID === student.UserID);
      const quizHistory = studentQuizzes.map(q => {
        const course = courses.find(c => c.CourseID === q.CourseID);
        return {
          CourseTitle: course ? course.Title : 'Bài thi không tên',
          Score: `${q.Score}/${q.TotalQuestions}`,
          Status: q.Status
        };
      });

      return {
        UserID: student.UserID,
        FullName: student.FullName,
        EmployeeID: student.EmployeeID,
        Department: student.Department,
        Company: student.Company || 'AHCOM Tổng',
        CompletedLessons: completedLessons,
        TotalDuration: totalDuration,
        QuizHistory: quizHistory
      };
    });
  },

  // --- SYNCHRONOUS HELPERS ---
  formatWatchTime(seconds) {
    if (!seconds) return '0 phút';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs > 0 ? secs + ' giây' : ''}`;
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
    },

    async saveDocument(courseId, blob) {
      return this.saveVideo(courseId, blob);
    },

    async getDocument(courseId) {
      return this.getVideo(courseId);
    },

    async deleteDocument(courseId) {
      return this.deleteVideo(courseId);
    }
  }
};

// Expose globally for app scripts
window.ahcomDB = db;
