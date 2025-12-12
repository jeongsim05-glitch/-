import React, { useState } from 'react';
import { Users, Receipt, Swords, BrainCircuit, Menu, FileText, BookOpen, Scale, ExternalLink, Settings, Video, Calendar } from 'lucide-react';
import { GlobalSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: GlobalSettings;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, settings }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'members', label: '회원 관리', icon: Users },
    { id: 'matches', label: '대진표/경기', icon: Swords },
    { id: 'financials', label: '회비/지출 관리', icon: Receipt },
    { id: 'lessons', label: '레슨 관리', icon: BookOpen },
    { id: 'documents', label: '보고서/문서', icon: FileText },
    { id: 'bylaws', label: '회칙 개정', icon: Scale },
    { id: 'analysis', label: 'AI 승률 분석', icon: BrainCircuit },
  ];

  if (settings.enableAttendance) {
    menuItems.push({ id: 'attendance', label: '출석부', icon: Calendar });
  }
  if (settings.enableAICoaching) {
    menuItems.push({ id: 'coaching', label: 'AI 레슨', icon: Video });
  }
  menuItems.push({ id: 'admin', label: '환경 설정', icon: Settings });

  const ClubLogo = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-xl shadow-lg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#bgGrad)" />
      
      {/* Sun Rays */}
      <g transform="translate(50, 45)">
         {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
             <rect key={i} x="-2" y="-35" width="4" height="12" fill="#fef08a" transform={`rotate(${angle})`} />
         ))}
         <circle r="18" fill="#fef08a" />
      </g>

      {/* Shuttlecock */}
      <g transform="translate(50, 60) rotate(-30)">
        {/* Skirt */}
        <path d="M-15 -10 L15 -10 L25 25 L-25 25 Z" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        <path d="M-12 -10 L-20 25" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M0 -10 L0 25" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M12 -10 L20 25" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M-22 10 L22 10" stroke="#cbd5e1" strokeWidth="1" />
        
        {/* Band */}
        <rect x="-15" y="-14" width="30" height="4" rx="1" fill="#ea580c" />
        
        {/* Cork */}
        <path d="M-15 -14 C-15 -25 15 -25 15 -14 Z" fill="white" stroke="#d1d5db" strokeWidth="1" />
      </g>
    </svg>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden print:h-auto print:overflow-visible">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-slate-900 text-white transition-transform duration-300 ease-in-out print:hidden flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="flex-shrink-0">
             <ClubLogo />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">해오름클럽</h1>
            <p className="text-xs text-slate-400">Badminton Manager</p>
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === item.id ? 'bg-orange-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <a 
            href="https://drive.google.com/open?id=1dDqT635AHxuDdSlS81_YVyCHg3KASy_5&usp=drive_fs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors justify-center p-2 rounded hover:bg-slate-800"
          >
            <ExternalLink className="w-3 h-3" />
            <span>구글 드라이브 바로가기</span>
          </a>
          <div className="text-xs text-slate-500 text-center">
            &copy; 2024 Haeoreum Club
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative print:h-auto print:overflow-visible print:block">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8"><ClubLogo /></div>
            <h2 className="font-bold text-gray-800">해오름클럽 매니저</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50 print:h-auto print:overflow-visible print:p-0 print:bg-white">
          <div className="max-w-7xl mx-auto h-full print:max-w-none print:h-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
