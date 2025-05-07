import axios from 'axios'

export enum TaskStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

export interface Task {
  id: string
  name: string
  description: string
  status: TaskStatus
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
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
  }
})

export const TaskService = {
  async getAll(filter?: TaskStatus | 'all'): Promise<Task[]> {
    const { data } = await apiClient.get('/tasks', {
      params: { status: filter !== 'all' ? filter : undefined }
    })
    return data
  },

  async create(task: { name: string; description: string }): Promise<Task> {
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
  }
}