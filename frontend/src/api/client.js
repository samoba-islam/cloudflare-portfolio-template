// ============================================================
// API Client — Fetch wrapper for backend communication
// ============================================================

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  }

  // Auth
  login(email, password) {
    return this.request('/login', { method: 'POST', body: { email, password } });
  }
  updateAdminSettings(data) {
    return this.request('/admin/settings', { method: 'PUT', body: data });
  }

  // Profile
  getProfile() { return this.request('/profile'); }
  updateProfile(data) { return this.request('/profile', { method: 'PUT', body: data }); }

  // Experience
  getExperience() { return this.request('/experience'); }
  createExperience(data) { return this.request('/experience', { method: 'POST', body: data }); }
  updateExperience(id, data) { return this.request(`/experience/${id}`, { method: 'PUT', body: data }); }
  deleteExperience(id) { return this.request(`/experience/${id}`, { method: 'DELETE' }); }

  // Education
  getEducation() { return this.request('/education'); }
  createEducation(data) { return this.request('/education', { method: 'POST', body: data }); }
  updateEducation(id, data) { return this.request(`/education/${id}`, { method: 'PUT', body: data }); }
  deleteEducation(id) { return this.request(`/education/${id}`, { method: 'DELETE' }); }

  // Projects
  getProjects() { return this.request('/projects'); }
  createProject(data) { return this.request('/projects', { method: 'POST', body: data }); }
  updateProject(id, data) { return this.request(`/projects/${id}`, { method: 'PUT', body: data }); }
  deleteProject(id) { return this.request(`/projects/${id}`, { method: 'DELETE' }); }

  // Skills
  getSkills() { return this.request('/skills'); }
  createSkill(data) { return this.request('/skills', { method: 'POST', body: data }); }
  updateSkill(id, data) { return this.request(`/skills/${id}`, { method: 'PUT', body: data }); }
  deleteSkill(id) { return this.request(`/skills/${id}`, { method: 'DELETE' }); }

  // Achievements
  getAchievements() { return this.request('/achievements'); }
  createAchievement(data) { return this.request('/achievements', { method: 'POST', body: data }); }
  updateAchievement(id, data) { return this.request(`/achievements/${id}`, { method: 'PUT', body: data }); }
  deleteAchievement(id) { return this.request(`/achievements/${id}`, { method: 'DELETE' }); }

  // Blog
  getBlogPosts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/blog${query ? `?${query}` : ''}`);
  }
  getBlogPost(slug) { return this.request(`/blog/${slug}`); }
  createBlogPost(data) { return this.request('/blog', { method: 'POST', body: data }); }
  updateBlogPost(id, data) { return this.request(`/blog/${id}`, { method: 'PUT', body: data }); }
  deleteBlogPost(id) { return this.request(`/blog/${id}`, { method: 'DELETE' }); }

  // Contact
  submitContact(data) { return this.request('/contact', { method: 'POST', body: data }); }
  getContacts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/contacts${query ? `?${query}` : ''}`);
  }
  markContactRead(id) { return this.request(`/contacts/${id}/read`, { method: 'PUT' }); }
  deleteContact(id) { return this.request(`/contacts/${id}`, { method: 'DELETE' }); }

  // Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload', {
      method: 'POST',
      body: formData,
    });
  }
  deleteFile(key) { return this.request(`/upload/${key}`, { method: 'DELETE' }); }

  // Dashboard
  getDashboardStats() { return this.request('/dashboard/stats'); }
}

const api = new ApiClient();
export default api;
