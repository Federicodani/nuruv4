import axiosInstance from './axiosInstance';

// ── Projects ──────────────────────────────────────────────────────────────
export const createConstructionProject = (data) =>
  axiosInstance.post('/construction-projects', data);

export const getMyConstructionProjects = () =>
  axiosInstance.get('/construction-projects');

export const getConstructionProjectById = (id) =>
  axiosInstance.get(`/construction-projects/${id}`);

export const updateConstructionProject = (id, data) =>
  axiosInstance.put(`/construction-projects/${id}`, data);

export const archiveConstructionProject = (id) =>
  axiosInstance.delete(`/construction-projects/${id}`);

// ── Summary / Health / Benchmark ──────────────────────────────────────────
export const getProjectSummary = (id) =>
  axiosInstance.get(`/construction-projects/${id}/summary`);

export const getProjectHealth = (id) =>
  axiosInstance.get(`/construction-projects/${id}/health`);

export const getBenchmarkData = (id) =>
  axiosInstance.get(`/construction-projects/${id}/benchmark`);

// ── Collaboration ──────────────────────────────────────────────────────────
export const addCollaborator = (id, data) =>
  axiosInstance.post(`/construction-projects/${id}/collaborators`, data);

export const removeCollaborator = (id, collaboratorId) =>
  axiosInstance.delete(`/construction-projects/${id}/collaborators/${collaboratorId}`);

// ── Expenses ──────────────────────────────────────────────────────────────
export const getExpenses = (projectId, params) =>
  axiosInstance.get(`/construction-projects/${projectId}/expenses`, { params });

export const getExpenseById = (projectId, expenseId) =>
  axiosInstance.get(`/construction-projects/${projectId}/expenses/${expenseId}`);

export const addExpense = (projectId, formData) =>
  axiosInstance.post(`/construction-projects/${projectId}/expenses`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateExpense = (projectId, expenseId, formData) =>
  axiosInstance.put(`/construction-projects/${projectId}/expenses/${expenseId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteExpense = (projectId, expenseId) =>
  axiosInstance.delete(`/construction-projects/${projectId}/expenses/${expenseId}`);

// ── Professional: assigned projects ───────────────────────────────────────
export const getAssignedProjects = () =>
  axiosInstance.get('/construction-projects/assigned');

// ── Milestones ────────────────────────────────────────────────────────────
export const getMilestones = (projectId) =>
  axiosInstance.get(`/construction-projects/${projectId}/milestones`);

export const getMilestoneStats = (projectId) =>
  axiosInstance.get(`/construction-projects/${projectId}/milestones/stats`);

export const getMilestoneTemplates = (projectId) =>
  axiosInstance.get(`/construction-projects/${projectId}/milestones/templates`);

export const applyMilestoneTemplate = (projectId, names) =>
  axiosInstance.post(`/construction-projects/${projectId}/milestones/apply-template`, { names });

export const reorderMilestones = (projectId, orderedIds) =>
  axiosInstance.put(`/construction-projects/${projectId}/milestones/reorder`, { orderedIds });

export const createMilestone = (projectId, data) =>
  axiosInstance.post(`/construction-projects/${projectId}/milestones`, data);

export const updateMilestone = (projectId, milestoneId, data) =>
  axiosInstance.put(`/construction-projects/${projectId}/milestones/${milestoneId}`, data);

export const deleteMilestone = (projectId, milestoneId) =>
  axiosInstance.delete(`/construction-projects/${projectId}/milestones/${milestoneId}`);

// ── Tasks ─────────────────────────────────────────────────────────────────
export const getTasks = (projectId, milestoneId) =>
  axiosInstance.get(`/construction-projects/${projectId}/milestones/${milestoneId}/tasks`);

export const getMyAssignedTasks = () =>
  axiosInstance.get('/construction-projects/my-tasks');

export const createTask = (projectId, milestoneId, data) =>
  axiosInstance.post(`/construction-projects/${projectId}/milestones/${milestoneId}/tasks`, data);

export const updateTask = (projectId, milestoneId, taskId, data) =>
  axiosInstance.put(
    `/construction-projects/${projectId}/milestones/${milestoneId}/tasks/${taskId}`,
    data
  );

export const deleteTask = (projectId, milestoneId, taskId) =>
  axiosInstance.delete(
    `/construction-projects/${projectId}/milestones/${milestoneId}/tasks/${taskId}`
  );
