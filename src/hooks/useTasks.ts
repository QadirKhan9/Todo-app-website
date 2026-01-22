// frontend/src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCreateData } from '@/lib/types';
import { todoService } from '@/services/todoService';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  currentTask: Task | null;
}

export const useTasks = (userId: string) => {
  const [taskState, setTaskState] = useState<TaskState>({
    tasks: [],
    isLoading: false,
    error: null,
    currentTask: null,
  });

  // Fetch tasks for the user
  const fetchTasks = useCallback(async () => {
    setTaskState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await todoService.getTasks();

      // Handle different possible response structures
      let tasksData = [];
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as { data?: { tasks?: any[] }, tasks?: any[] };

        // Check if the response has the expected structure
        if (responseData.data && Array.isArray(responseData.data.tasks)) {
          tasksData = responseData.data.tasks;
        } else if (Array.isArray(responseData.tasks)) {
          tasksData = responseData.tasks;
        } else if (Array.isArray(responseData.data)) {
          tasksData = responseData.data;
        } else if (Array.isArray(response.data)) {
          tasksData = response.data;
        } else {
          // If none of the expected structures match, log a warning and use empty array
          console.warn('Unexpected response structure for getTasks:', response.data);
          tasksData = [];
        }
      }

      setTaskState(prev => ({
        ...prev,
        tasks: tasksData,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setTaskState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch tasks',
      }));
    }
  }, []);

  // Create a new task
  const createTask = useCallback(async (taskData: TaskCreateData) => {
    setTaskState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await todoService.createTask(taskData);

      // Handle different possible response structures for the created task
      let newTask;
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as { data?: { task?: any }, task?: any };

        if (responseData.data && responseData.data.task) {
          newTask = responseData.data.task;
        } else if (responseData.task) {
          newTask = responseData.task;
        } else {
          // If the response structure is unexpected, use the whole response or a default object
          newTask = response.data;
        }
      } else {
        // If response data is not an object, use it as is or create a default
        newTask = response.data || {};
      }

      setTaskState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
        isLoading: false,
        error: null,
      }));

      return { success: true, task: newTask };
    } catch (error: any) {
      // Handle specific error statuses locally without triggering logout
      let errorMessage = 'Failed to create task';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 422) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.response.status === 400) {
          errorMessage = 'Validation error. Please check your inputs.';
        } else if (error.response.status === 401) {
          // Don't redirect to login, just return the error
          errorMessage = 'Unauthorized. Please log in again.';
        } else {
          errorMessage = error.response.data?.message || `Server error (${error.response.status}).`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'An unexpected error occurred.';
      }

      setTaskState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (taskId: string, taskData: Partial<TaskCreateData>) => {
    setTaskState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await todoService.updateTask(taskId, taskData);

      // Handle different possible response structures for the updated task
      let updatedTask;
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as { data?: { task?: any }, task?: any };

        if (responseData.data && responseData.data.task) {
          updatedTask = responseData.data.task;
        } else if (responseData.task) {
          updatedTask = responseData.task;
        } else {
          // If the response structure is unexpected, use the whole response or a default object
          updatedTask = response.data;
        }
      } else {
        // If response data is not an object, use it as is or create a default
        updatedTask = response.data || {};
      }

      setTaskState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ),
        isLoading: false,
        error: null,
      }));

      return { success: true, task: updatedTask };
    } catch (error: any) {
      setTaskState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update task',
      }));
      return { success: false, error: error.message || 'Failed to update task' };
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    setTaskState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await todoService.deleteTask(taskId);

      setTaskState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId),
        isLoading: false,
        error: null,
      }));

      return { success: true };
    } catch (error: any) {
      setTaskState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to delete task',
      }));
      return { success: false, error: error.message || 'Failed to delete task' };
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string, isCompleted: boolean) => {
    setTaskState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await todoService.toggleTaskCompletion(taskId, isCompleted);

      // Handle different possible response structures for the updated task
      let updatedTask;
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as { data?: { task?: any }, task?: any };

        if (responseData.data && responseData.data.task) {
          updatedTask = responseData.data.task;
        } else if (responseData.task) {
          updatedTask = responseData.task;
        } else {
          // If the response structure is unexpected, use the whole response or a default object
          updatedTask = response.data;
        }
      } else {
        // If response data is not an object, use it as is or create a default
        updatedTask = response.data || {};
      }

      setTaskState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ),
        isLoading: false,
        error: null,
      }));

      return { success: true, task: updatedTask };
    } catch (error: any) {
      setTaskState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update task completion status',
      }));
      return { success: false, error: error.message || 'Failed to update task completion status' };
    }
  }, []);

  return {
    ...taskState,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};