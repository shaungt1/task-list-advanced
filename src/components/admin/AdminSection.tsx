import React from 'react';
import { AdminDashboard } from './AdminDashboard';
import { TaskList } from '../../services/taskListService';

interface AdminSectionProps {
  onError: (error: string) => void;
}

export function AdminSection({ onError }: AdminSectionProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <AdminDashboard onError={onError} onClose={function (): void {
        throw new Error('Function not implemented.');
      } } onEditList={function (list: TaskList): void {
        throw new Error('Function not implemented.');
      } } />
    </div>
  );
}