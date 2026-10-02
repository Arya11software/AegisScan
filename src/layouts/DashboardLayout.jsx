import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ToastNotification from '../components/ToastNotification';
import AssessmentProgressModal from '../components/AssessmentProgressModal';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9F6] text-[#16201B] flex flex-col lg:flex-row antialiased">
      {/* Responsive Left Sidebar Drawer & Persistent Desktop Nav */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Modals & Toasts */}
      <ToastNotification />
      <AssessmentProgressModal />
    </div>
  );
}
