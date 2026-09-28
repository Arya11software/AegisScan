import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ToastNotification from '../components/ToastNotification';
import AssessmentProgressModal from '../components/AssessmentProgressModal';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#17211B] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-[#F7F8F5]">
          <Outlet />
        </main>
      </div>

      {/* Modals & Toasts */}
      <ToastNotification />
      <AssessmentProgressModal />
    </div>
  );
}
