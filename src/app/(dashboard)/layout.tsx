"use client";
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Overlay para móviles */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}