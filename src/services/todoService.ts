// frontend/src/services/todoService.ts
import { apiClient } from '@/lib/api';

// API methods - using the shared apiClient instance to ensure consistent authentication handling
export const todoService = {
  // Get all tasks
  getTasks: () => apiClient.client.get('/todos/'),

  // Create a new task
  createTask: (taskData: any) => {
    const { title, description, dueDate, priority } = taskData;
    return apiClient.client.post('/todos/', {
      title,
      description,
      due_date: dueDate,
      priority
    });
  },

  // Update a task
  updateTask: (id: string, taskData: any) => {
    return apiClient.client.put(`/todos/${id}`, taskData);
  },

  // Delete a task
  deleteTask: (id: string) => apiClient.client.delete(`/todos/${id}`),

  // Toggle task completion
  toggleTaskCompletion: (id: string, isCompleted: boolean) => {
    return apiClient.client.patch(`/todos/${id}/complete`, { is_completed: isCompleted });
  }
};