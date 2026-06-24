import axios from 'axios'

export enum TaskStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export interface Task {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  priority_name: string
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
)

export const TaskService = {
  async getAll(filter?: TaskStatus | 'all'): Promise<Task[]> {
    const { data } = await apiClient.get('/tasks', {
      params: { status: filter !== 'all' ? filter : undefined }
    })
    return data
  },

  async create(task: { name: string; description: string; priority?: TaskPriority }): Promise<Task> {
    const { data } = await apiClient.post('/tasks', task)
    return data
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await apiClient.get(`/tasks/${id}`)
    return data.data
  },

  async update(id: string, payload: Partial<Task>): Promise<ApiResponse<Task>> {
    const response = await apiClient.put(`/tasks/${id}`, payload)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`)
  },

  async updateStatus(id: string, newStatus: TaskStatus): Promise<Task> {
    const { data } = await apiClient.put(`/tasks/${id}/status`, {
      status: newStatus
    })
    return data.data
  },

  async updatePriority(id: string, newPriority: TaskPriority): Promise<Task> {
    const { data } = await apiClient.put(`/tasks/${id}/priority`, {
      priority: newPriority
    })
    return data.data
  },

  async reorderTasks(tasks: { id: string; position: number }[]): Promise<void> {
    await apiClient.put('/tasks/reorder', { tasks })
  }
}