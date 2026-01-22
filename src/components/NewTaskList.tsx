import { useState } from 'react';
import { Task } from '@/lib/types';
import NewTaskItem from './NewTaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updatedTask: Partial<Task>) => void;
}

export default function NewTaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  // Separate completed and active tasks
  const activeTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Active Tasks */}
      <div className="mb-8">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {activeTasks.map((task) => (
            <NewTaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex justify-between items-center"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">Completed ({completedTasks.length})</span>
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
                showCompleted ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCompleted && (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800">
              {completedTasks.map((task) => (
                <NewTaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add a new task to get started!</p>
        </div>
      )}
    </div>
  );
}