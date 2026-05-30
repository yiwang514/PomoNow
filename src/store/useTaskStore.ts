import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '@/types';

interface TaskStore {
  tasks: Task[];
  activeTaskId: string | null;

  // 操作
  addTask: (title: string, estimatedTomatoes?: number) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTask: (id: string | null) => void;
  incrementTaskTomatoes: (id: string) => void;
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,

      addTask: (title, estimatedTomatoes = 1) => {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          estimatedTomatoes,
          actualTomatoes: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
          ),
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      setActiveTask: (id) => {
        set({ activeTaskId: id });
      },

      incrementTaskTomatoes: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, actualTomatoes: task.actualTomatoes + 1 }
              : task
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.isCompleted),
          activeTaskId:
            state.tasks.find((t) => t.id === state.activeTaskId)?.isCompleted
              ? null
              : state.activeTaskId,
        }));
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
