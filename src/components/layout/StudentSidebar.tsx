import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  FolderArchive,
  CalendarCheck,
  TrendingUp,
  Bot,
  User,
  GraduationCap
} from 'lucide-react';

export type StudentTab =
  | 'dashboard'
  | 'learning-path'
  | 'resources'
  | 'attendance'
  | 'progress'
  | 'skillbot'
  | 'profile';

interface StudentSidebarProps {
  currentTab: StudentTab;
  onSelectTab: (tab: StudentTab) => void;
  onCloseMobileMenu?: () => void;
}

export function StudentSidebar({ currentTab, onSelectTab, onCloseMobileMenu }: StudentSidebarProps) {
  const navItems: { id: StudentTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'learning-path', label: 'Learning Path', icon: <GitFork className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'skillbot', label: 'SkillBot', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: StudentTab) => {
    onSelectTab(tab);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">SkillLab</h1>
            <p className="text-[11px] font-semibold text-indigo-700">Student Portal</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-500/80 text-white'
                        : item.badge === 'AI'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cohort footer info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-xl border">
        <p className="text-xs font-bold text-slate-800">Private College Cohort</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Fall 2026 • Engineering Track</p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Curriculum Active</span>
        </div>
      </div>
    </aside>
  );
}
