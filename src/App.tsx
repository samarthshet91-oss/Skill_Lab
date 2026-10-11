import React, { useState, useEffect, useRef } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { StudentSidebar, StudentTab } from './components/layout/StudentSidebar';
import { AdminSidebar, AdminTab } from './components/layout/AdminSidebar';
import { StudentDashboard } from './features/dashboard/pages/StudentDashboard';
import { AdminDashboard } from './features/dashboard/pages/AdminDashboard';
import { StudentLearningPath } from './features/learning-path/pages/StudentLearningPath';
import { AdminModuleManagement } from './features/learning-path/pages/AdminModuleManagement';
import { StudentAttendancePage } from './features/attendance/pages/StudentAttendancePage';
import { AdminAttendancePage } from './features/attendance/pages/AdminAttendancePage';
import { ResourcesPage } from './features/resources/pages/ResourcesPage';
import { StudentProgressPage } from './features/progress/pages/StudentProgressPage';
import { AdminStudentsDirectory } from './features/students/pages/AdminStudentsDirectory';
import { SkillBotPage } from './features/skillbot/pages/SkillBotPage';
import { SkillBotDrawer } from './features/skillbot/components/SkillBotDrawer';
import { StudentProfilePage } from './features/profile/StudentProfilePage';
import { AdminProfilePage } from './features/profile/AdminProfilePage';
import { StudentActiveAttendancePrompt } from './components/attendance/StudentActiveAttendancePrompt';
import { LoginPage } from './features/auth/pages/LoginPage';
import { moduleService } from './services/moduleService';
import { studentService } from './services/studentService';
import { ModuleItem, StudentProgressSummary } from './types';
import { Bot } from 'lucide-react';
import { Header } from './components/layout/Header';




function IntroGate() {
  const [introFinished, setIntroFinished] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      {!introFinished && (
        <div className="fixed inset-0 z-100 h-screen w-screen overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/assets/skill-lab-intro.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setIntroFinished(true)}
            onError={() => setVideoFailed(true)}
          />

          {videoFailed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <p className="text-sm text-white">
                The intro video couldn't be played. Please refresh the page.
              </p>
            </div>
          )}
        </div>
      )}

      {introFinished && <AppContent />}
    </>
  );
}



function AppContent() {
  const { user, role, loading } = useAuth();

  const [studentTab, setStudentTab] = useState<StudentTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSkillBotDrawerOpen, setIsSkillBotDrawerOpen] = useState(false);
  const [skillBotModuleContext, setSkillBotModuleContext] = useState('4. APIs & JSON');

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = async () => {
    setDataLoading(true);
    const [modRes, stdRes] = await Promise.all([
      moduleService.getModules(),
      studentService.getStudents(),
    ]);

    if (modRes.data) setModules(modRes.data);
    if (stdRes.data) setStudents(stdRes.data);
    setDataLoading(false);
  };

  useEffect(() => {
  if (!loading && user) {
    loadData();
  }
}, [loading, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSuccess={() => {}} />;
  }

  const handleOpenSkillBot = (contextModuleTitle?: string) => {
    if (contextModuleTitle) {
      setSkillBotModuleContext(contextModuleTitle);
    }
    setIsSkillBotDrawerOpen(true);
  };

  const handleAdminToggleModuleLock = async (moduleId: string, isLocked: boolean) => {
    await moduleService.toggleModuleLock(moduleId, isLocked);
    loadData();
  };

  const getPageTitle = () => {
    if (role === 'ADMIN') {
      switch (adminTab) {
        case 'dashboard': return 'Admin Dashboard';
        case 'students': return `Enrolled Students Directory (${students.length})`;
        case 'attendance': return 'Attendance Manager';
        case 'modules': return 'Curriculum Module Management';
        case 'resources': return 'Learning Resources Repository';
        case 'skillbot': return 'SkillBot AI Console';
        case 'profile': return 'Admin Profile';
        default: return 'Admin Console';
      }
    } else {
      switch (studentTab) {
        case 'dashboard': return 'Student Dashboard';
        case 'learning-path': return 'Software Engineering Learning Path';
        case 'resources': return 'Learning Resources Hub';
        case 'attendance': return 'Attendance & Lab Records';
        case 'progress': return 'Curriculum Progress Analytics';
        case 'skillbot': return 'SkillBot AI Tutor';
        case 'profile': return 'Student Profile';
        default: return 'Student Portal';
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        onOpenSkillBot={() => handleOpenSkillBot()}
        currentPageTitle={getPageTitle()}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 bg-white h-full shadow-2xl">
            {role === 'ADMIN' ? (
              <AdminSidebar
                currentTab={adminTab}
                onSelectTab={setAdminTab}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            ) : (
              <StudentSidebar
                currentTab={studentTab}
                onSelectTab={setStudentTab}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex min-w-0">
        {/* Desktop Role-Specific Sidebar */}
        <div className="hidden md:flex shrink-0">
          {role === 'ADMIN' ? (
            <AdminSidebar
              currentTab={adminTab}
              onSelectTab={setAdminTab}
            />
          ) : (
            <StudentSidebar
              currentTab={studentTab}
              onSelectTab={setStudentTab}
            />
          )}
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {role === 'ADMIN' ? (
            <>
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  students={students}
                  modules={modules}
                  onNavigateToStudents={() => setAdminTab('students')}
                  onNavigateToModules={() => setAdminTab('modules')}
                  onNavigateToAttendance={() => setAdminTab('attendance')}
                  onNavigateToResources={() => setAdminTab('resources')}
                  onToggleModuleLock={handleAdminToggleModuleLock}
                />
              )}
              {adminTab === 'students' && (
                <AdminStudentsDirectory students={students} />
              )}
              {adminTab === 'attendance' && (
                <AdminAttendancePage />
              )}
              {adminTab === 'modules' && (
                <AdminModuleManagement
                  modules={modules}
                  onRefreshModules={loadData}
                />
              )}
              {adminTab === 'resources' && (
                <ResourcesPage />
              )}
              {adminTab === 'skillbot' && (
                <SkillBotPage />
              )}
              {adminTab === 'profile' && (
                <AdminProfilePage />
              )}
            </>
          ) : (
            <>
              {studentTab === 'dashboard' && (
                <StudentDashboard
                  modules={modules}
                  onNavigateToLearningPath={() => setStudentTab('learning-path')}
                  onNavigateToAttendance={() => setStudentTab('attendance')}
                  onOpenSkillBot={() => handleOpenSkillBot()}
                />
              )}
              {studentTab === 'learning-path' && (
                <StudentLearningPath
                  modules={modules}
                  onRefreshModules={loadData}
                  onOpenSkillBotWithContext={handleOpenSkillBot}
                />
              )}
              {studentTab === 'resources' && (
                <ResourcesPage />
              )}
              {studentTab === 'attendance' && (
                <StudentAttendancePage />
              )}
              {studentTab === 'progress' && (
                <StudentProgressPage modules={modules} />
              )}
              {studentTab === 'skillbot' && (
                <SkillBotPage />
              )}
              {studentTab === 'profile' && (
                <StudentProfilePage />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating SkillBot Launcher Button (Bottom Right) */}
      <button
        onClick={() => handleOpenSkillBot()}
        title="Open SkillBot AI Assistant"
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-indigo-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Bot className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">Ask SkillBot</span>
      </button>

      {/* Interactive Global SkillBot Drawer */}
      <SkillBotDrawer
        isOpen={isSkillBotDrawerOpen}
        onClose={() => setIsSkillBotDrawerOpen(false)}
        currentModuleTitle={skillBotModuleContext}
      />

      {/* Global Student Active Attendance Prompt */}
      {role === 'STUDENT' && <StudentActiveAttendancePrompt />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <IntroGate />
      </AuthProvider>
    </ToastProvider>
  );
}
