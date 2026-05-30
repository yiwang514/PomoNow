'use client';

import { TodoList } from '@/components/todo/TodoList';

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 py-12 sm:py-16">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <TodoList />
    </div>
  );
}
