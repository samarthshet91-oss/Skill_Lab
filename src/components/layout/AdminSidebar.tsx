import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Layers,
  FolderArchive,
  Bot,
  User,
  ShieldCheck
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'modules'
  | 'resources'
  | 'skillbot'
  | 'profile';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onCloseMobileMenu?: () => void;
}

export function AdminSidebar({ currentTab, onSelectTab, onCloseMobileMenu }: AdminSidebarProps) {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'modules', label: 'Modules', icon: <Layers className="w-4 h-4" />, badge: 'Lock/Unlock' },
    { id: 'resources', label: 'Resources', icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'skillbot', label: 'SkillBot', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'profile', label: 'Admin Profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: AdminTab) => {
    onSelectTab(tab);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4">
        {/* Admin Brand Badge */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-4 rounded-xl bg-purple-50/70 border border-purple-200">
          <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">SkillLab Admin</h1>
            <p className="text-[11px] font-semibold text-indigo-700">Faculty & Director Suite</p>
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
                        : item.badge === 'Lock/Unlock'
                        ? 'bg-amber-100 text-amber-800'
                        : item.badge === 'AI'
                        ? 'bg-purple-100 text-purple-800'
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

      {/* Admin stats summary pill */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-xl border">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Academic Cohort</span>
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Fall 2026</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="font-semibold text-slate-700">Access Level</span>
          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Administrator</span>
        </div>
      </div>
    </aside>
  );
}
