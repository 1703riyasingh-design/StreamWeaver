/* ============================================================
   API HELPER - Centralized API URL management
   ============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const API = {
  base: API_BASE_URL,
  socket: SOCKET_URL,
  endpoints: {
    upload: `${API_BASE_URL}/api/upload`,
    uploadDataset: `${API_BASE_URL}/api/upload-dataset`,
    datasets: `${API_BASE_URL}/api/datasets`,
    datasetById: (id) => `${API_BASE_URL}/api/datasets/${id}`,
    datasetRows: (id, page = 1, limit = 100, status = 'all') => {
      let url = `${API_BASE_URL}/api/datasets/${id}/rows?page=${page}&limit=${limit}`;
      if (status !== 'all') url += `&status=${status}`;
      return url;
    },
    validationSummary: (id) =>
      `${API_BASE_URL}/api/datasets/${id}/validation-summary`,
    dashboardStats: `${API_BASE_URL}/api/datasets/dashboard/stats`,
  },
};

export default API;