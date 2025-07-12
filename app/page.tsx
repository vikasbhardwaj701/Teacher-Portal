// app/page.tsx
'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TeacherDetails from '@/components/TeacherDetails';
import ScheduleTable from '@/components/ScheduleTable';
import { Teacher } from '@/types/teacher';
import { useState } from 'react';

const mockTeacher: Teacher = {
  name: 'Alynia Allan',
  role: 'Teacher',
  email: 'alyniaallan@example.com',
  phone: '416 848 9057',
  address: '56 Oswald De Santos Cr, North York, Ontario, Canada',
  privateQualifications: [
    { name: 'Vocal Contemporary', rate: 28 },
    { name: 'Vocal Core', rate: 28 },
    { name: 'Vocal Plus', rate: 28 },
    { name: 'Instrument', rate: 28 },
  ],
  groupQualifications: [],
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4">
          <TeacherDetails teacher={mockTeacher} />
          <ScheduleTable />
        </main>
      </div>
    </div>
  );
}
