import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  Sparkles,
  Menu
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenSkillBot?: () => void;
  currentPageTitle?: string;
  onToggleMobileMenu?: () => void;
}

export function Header({ onOpenSkillBot, currentPageTitle, onToggleMobileMenu }: HeaderProps) {
  const { user, role, signOut } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {currentPageTitle || 'SkillLab Platform'}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {role === 'ADMIN' ? 'Instructor & Management Portal' : 'Cohort Fall 2026 • Private College Program'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* SkillBot Quick Launcher Button */}
        {onOpenSkillBot && (
          <button
            onClick={onOpenSkillBot}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Ask SkillBot</span>
          </button>
        )}

        {/* User Profile display */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.full_name || 'User'}
            className="w-8 h-8 rounded-full border border-slate-200 object-cover"
          />
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.full_name || 'Academic User'}
              </span>
              <Badge variant={role === 'ADMIN' ? 'primary' : 'success'} size="sm">
                {role}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-500 block leading-tight">
              {user?.email || 'user@skilllab.edu'}
            </span>
          </div>

          <button
            onClick={signOut}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
