import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { StatCard } from '../../../components/common/StatCard';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { ProgressBar } from '../../../components/common/ProgressBar';
import {
  TrendingUp,
  CalendarCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Bot
} from 'lucide-react';
import { UPCOMING_SESSION } from '../../../lib/constants';
import { ModuleItem } from '../../../types';
import { attendanceService } from '../../../services/attendanceService';

interface StudentDashboardProps {
  onNavigateToLearningPath: () => void;
  onNavigateToAttendance: () => void;
  onOpenSkillBot: () => void;
  modules: ModuleItem[];
}

export function StudentDashboard({
  onNavigateToLearningPath,
  onNavigateToAttendance,
  onOpenSkillBot,
  modules
}: StudentDashboardProps) {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<{ percentage: number; totalSessions: number; presentCount: number } | null>(null);

  useEffect(() => {
    if (user?.id) {
      attendanceService.getStudentAttendance(user.id).then(res => {
        if (res.data) setAttendance(res.data);
      });
    }
  }, [user?.id]);

  // Compute metrics from modules
  const currentModule = modules.find(m => m.status === 'IN PROGRESS') || modules.find(m => m.status =='UNLOCKED') || modules[0] || null;
  if (!currentModule) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900">
          Learning modules are loading...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please wait while SkillLab loads your learning path.
        </p>
      </div>
    </div>
  );
}
  const completedModules = modules.filter(m => m.status === 'COMPLETED');
  const unlockedModules = modules.filter(m => m.status === 'UNLOCKED');

  // Overall student progress calculation
  const totalLessons = modules.reduce((acc, m) => acc + m.lesson_count, 0);
  const completedLessons = modules.reduce((acc, m) => acc + (m.completed_lessons || 0), 0);
  const overallProgressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id) + 1;
  const attendanceRate = attendance?.totalSessions ? attendance.percentage : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Skill Lab Cohort • Enrolled Student
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-indigo-100/90 text-sm mt-2 leading-relaxed">
            You are progressing through <strong className="text-white">{currentModule.title}</strong>. Complete the remaining exercises to prepare for the upcoming hands-on lab session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={onOpenSkillBot}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm font-semibold rounded-xl"
            icon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Ask SkillBot
          </Button>
          <Button
            variant="primary"
            onClick={onNavigateToLearningPath}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm font-semibold rounded-xl"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Continue Learning
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Overall Learning Progress"
          value={`${overallProgressPercentage}%`}
          subtitle={`${completedLessons} of ${totalLessons} lessons completed`}
          trend={{ value: `${completedModules.length}/${modules.length} modules completed`, positive: true }}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="indigo"
        />

        <StatCard
          title="Lab Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle={`${attendance?.presentCount ?? 0} of ${attendance?.totalSessions ?? 0} sessions attended`}
          trend={{ value: attendanceRate >= 85 ? 'Standing: Good' : 'Standing: Review', positive: attendanceRate >= 85 }}
          icon={<CalendarCheck className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Current Active Module"
          value={`Module ${currentModuleIndex || 1}`}
          subtitle={currentModule.title.replace(/^\d+\.\s*/, '')}
          trend={{ value: `${currentModule.completed_lessons || 0}/${currentModule.lesson_count} lessons finished`, positive: true }}
          icon={<BookOpen className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Main Split: Current Module & Upcoming Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-indigo-100/80 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="primary" size="sm">ACTIVE MODULE</Badge>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{currentModule.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{currentModule.description}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onNavigateToLearningPath}
                className="shrink-0"
              >
                Resume
              </Button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>Module Completion</span>
                <span className="text-indigo-600">
                  {currentModule.completed_lessons} of {currentModule.lesson_count} Lessons ({Math.round(((currentModule.completed_lessons || 0) / currentModule.lesson_count) * 100)}%)
                </span>
              </div>
              <ProgressBar
                value={currentModule.completed_lessons || 0}
                max={currentModule.lesson_count}
                color="indigo"
              />
            </div>

            {/* Lesson Checklist */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lessons in this Module</h4>
              {currentModule.lessons.map(lesson => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                    lesson.is_completed
                      ? 'bg-emerald-50/40 border-emerald-200/60 text-slate-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {lesson.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{lesson.title}</p>
                      <p className="text-[11px] text-slate-500">{lesson.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">{lesson.duration_minutes} min</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recently Completed & Unlocked Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recently Completed */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Completed Modules
                </h4>
                <Badge variant="success" size="sm">{completedModules.length} Done</Badge>
              </div>
              <div className="space-y-2">
                {completedModules.map(mod => (
                  <div key={mod.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate pr-2">{mod.title}</span>
                    <Badge variant="success" size="sm">100%</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recently Unlocked */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-indigo-600" />
                  Unlocked Next
                </h4>
                <Badge variant="primary" size="sm">Ready</Badge>
              </div>
              <div className="space-y-2">
                {unlockedModules.length > 0 ? (
                  unlockedModules.map(mod => (
                    <div key={mod.id} className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate pr-2">{mod.title}</span>
                      <Button variant="ghost" size="sm" onClick={onNavigateToLearningPath} className="text-indigo-600 p-0 h-auto">
                        View
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3">All next modules are managed by SkillLab faculty.</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Upcoming Lab Session & SkillBot Assistant */}
        <div className="space-y-6">
          {/* Upcoming Session Card */}
          <Card className="border-indigo-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">UPCOMING SESSION</span>
              <Badge variant="warning" size="sm">Mandatory</Badge>
            </div>

            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {UPCOMING_SESSION.topic}
            </h4>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{UPCOMING_SESSION.date}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{UPCOMING_SESSION.time}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{UPCOMING_SESSION.location}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400">Instructor</p>
                <p className="text-xs font-semibold text-slate-800">{UPCOMING_SESSION.instructor}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onNavigateToAttendance}>
                View Attendance
              </Button>
            </div>
          </Card>

          {/* SkillBot Quick Launcher Card */}
          <Card className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border-indigo-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">SkillBot AI Tutor</h4>
                <p className="text-[11px] text-slate-500">Instant explanations & code help</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Stuck on Git rebase, SQL queries, or REST errors? SkillBot is tuned to the SkillLab curriculum.
            </p>

            <Button
              variant="primary"
              size="md"
              onClick={onOpenSkillBot}
              className="w-full rounded-xl text-xs font-semibold"
              icon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              Open SkillBot Assistant
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
