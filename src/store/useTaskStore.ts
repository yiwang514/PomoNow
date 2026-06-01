import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '@/types';

// 专注记录接口
export interface FocusRecord {
  id: string;
  taskId: string | null;
  duration: number; // 分钟
  completedAt: string;
  type: 'focus' | 'shortBreak' | 'longBreak';
}

interface TaskStore {
  tasks: Task[];
  activeTaskId: string | null;
  focusHistory: FocusRecord[]; // V1.1: 专注历史记录

  // 任务操作
  addTask: (title: string, estimatedTomatoes?: number, focusDuration?: number) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTask: (id: string | null) => void;
  incrementTaskTomatoes: (id: string) => void;
  clearCompleted: () => void;

  // V1.1: 历史记录操作
  addFocusRecord: (record: Omit<FocusRecord, 'id' | 'completedAt'>) => void;
  getTodayRecords: () => FocusRecord[];
  getWeekRecords: () => FocusRecord[];
  getMonthRecords: () => FocusRecord[];
  getTodayPomodoros: () => number;
  getTotalFocusMinutes: () => number;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      focusHistory: [],

      // 任务操作
      addTask: (title, estimatedTomatoes = 1, focusDuration = 25) => {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          estimatedTomatoes,
          actualTomatoes: 0,
          focusDuration,
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

      // V1.1: 历史记录操作
      addFocusRecord: (record) => {
        const newRecord: FocusRecord = {
          ...record,
          id: crypto.randomUUID(),
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          focusHistory: [...state.focusHistory, newRecord],
        }));
      },

      getTodayRecords: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().focusHistory.filter(
          (record) => record.completedAt.split('T')[0] === today
        );
      },

      getWeekRecords: () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return get().focusHistory.filter(
          (record) => new Date(record.completedAt) >= weekAgo
        );
      },

      getMonthRecords: () => {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return get().focusHistory.filter(
          (record) => new Date(record.completedAt) >= monthAgo
        );
      },

      getTodayPomodoros: () => {
        return get().getTodayRecords().filter((r) => r.type === 'focus').length;
      },

      getTotalFocusMinutes: () => {
        return get()
          .getTodayRecords()
          .filter((r) => r.type === 'focus')
          .reduce((sum, r) => sum + r.duration, 0);
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
