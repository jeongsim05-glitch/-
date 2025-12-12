import React, { useState } from 'react';
import { Users, Receipt, Swords, BrainCircuit, Menu, FileText, BookOpen, Scale, ExternalLink, Settings, Video, Calendar, LogOut } from 'lucide-react';
import { GlobalSettings, Member } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: GlobalSettings;
  currentUser: Member | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, settings, currentUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Permission Check Helpers
  const canAccessFinancials = (position: string) => {
      // 재무이사, 총무이사만 가능 (요청사항 준수)
      // 편의상 회장도 포함
      return ['재무', '총무', '회장'].some(role => position.includes(role));
  };

  const menuItems = [
    { id: 'members', label: '회원 관리', icon: Users, restricted: false },
    { id: 'matches', label: '대진표/경기', icon: Swords, restricted: false },
    { id: 'financials', label: '회비/지출 관리', icon: Receipt, restricted: true, check: canAccessFinancials },
    { id: 'lessons', label: '레슨 관리', icon: BookOpen, restricted: false },
    { id: 'documents', label: '보고서/문서', icon: FileText, restricted: false },
    { id: 'bylaws', label: '회칙 개정', icon: Scale, restricted: false },
    { id: 'analysis', label: 'AI 승률 분석', icon: BrainCircuit, restricted: false },
  ];

  if (settings.enableAttendance) {
    menuItems.push({ id: 'attendance', label: '출석부', icon: Calendar, restricted: false });
  }
  if (settings.enableAICoaching) {
    menuItems.push({ id: 'coaching', label: 'AI 레슨', icon: Video, restricted: false });
  }
  
  // Settings is generally for admins, but we'll leave it accessible for now or restrict it
  menuItems.push({ id: 'admin', label: '환경 설정', icon: Settings, restricted: false });

  // Filter items based on permissions
  const visibleMenuItems = menuItems.filter(item => {
      if (!item.restricted) return true;
      if (item.check && currentUser) {
          return item.check(currentUser.position);
      }
      return true;
  });

  const ClubLogo = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-xl shadow-lg bg-white">
      <defs>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      
      {/* Sun Body */}
      <circle cx="50" cy="40" r="28" fill="url(#sunGrad)" />
      
      {/* Horizon Arc */}
      <path d="M 15 65 Q 50 50 85 65" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" />
      
      {/* Text */}
      <text x="50" y="85" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">
        Haeoreum
      </text>
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
        
        {/* User Profile Info */}
        {currentUser && (
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div>
                    <div className="text-sm font-bold text-white">{currentUser.name} 님</div>
                    <div className="text-xs text-orange-400">{currentUser.position}</div>
                </div>
                <button 
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors" 
                    title="로그아웃"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        )}

        <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
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
            href="https://docs.google.com/spreadsheets/u/1/d/1t-ivTuXVCjD7Dm3rnsYOW1ylFQDyOe-Ij7iNT4jrgOM/edit?usp=drive_fs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors justify-center p-2 rounded hover:bg-slate-800"
          >
            <ExternalLink className="w-3 h-3" />
            <span>구글 스프레드시트 열기</span>
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