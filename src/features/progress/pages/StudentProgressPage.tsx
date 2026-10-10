import React from 'react';
import { ModuleItem } from '../../../types';
import { Card } from '../../../components/common/Card';
import { StatCard } from '../../../components/common/StatCard';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { Badge } from '../../../components/common/Badge';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  BookOpen,
  Clock,
  Layers
} from 'lucide-react';

interface StudentProgressPageProps {
  modules: ModuleItem[];
}

export function StudentProgressPage({ modules }: StudentProgressPageProps) {
  const totalLessons = modules.reduce((acc, m) => acc + m.lesson_count, 0);
  const completedLessons = modules.reduce((acc, m) => acc + (m.completed_lessons || 0), 0);
  const overallPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const activeModule = modules.find(m => m.status === 'IN PROGRESS') || modules.find(m => m.status === 'UNLOCKED') || modules[0];
  const activeIndex = modules.findIndex(m => m.id === (activeModule?.id || '')) + 1;
  const activePercent = activeModule && activeModule.lesson_count > 0 ? Math.round(((activeModule.completed_lessons || 0) / activeModule.lesson_count) * 100) : 0;

  // Weekly activity simulator
  const weeklyData = [
    { day: 'Mon', lessons: 2, height: '60%' },
    { day: 'Tue', lessons: 3, height: '90%' },
    { day: 'Wed', lessons: 1, height: '30%' },
    { day: 'Thu', lessons: 4, height: '100%' },
    { day: 'Fri', lessons: 2, height: '60%' },
    { day: 'Sat', lessons: 0, height: '10%' },
    { day: 'Sun', lessons: 1, height: '30%' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Curriculum Mastery & Progress Transcript
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Progress Analytics</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Detailed breakdown of lessons completed, module velocity, and study activity across the 8-module curriculum.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Progress"
          value={`${overallPercentage}%`}
          subtitle={`${completedLessons} of ${totalLessons} Lessons`}
          trend={{ value: 'On schedule', positive: true }}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="indigo"
        />

        <StatCard
          title="Completed Modules"
          value={modules.filter(m => m.status === 'COMPLETED').length}
          subtitle={`Out of ${modules.length} total modules`}
          icon={<Award className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Current Module"
          value={`Module ${activeIndex || 1}`}
          subtitle={`${activeModule?.title.replace(/^\d+\.\s*/, '') || 'Orientation'} (${activePercent}% done)`}
          icon={<BookOpen className="w-5 h-5" />}
          accentColor="blue"
        />

        <StatCard
          title="Weekly Study Streak"
          value="5 Days"
          subtitle="13 lessons completed this week"
          trend={{ value: 'Top 10% of cohort', positive: true }}
          icon={<Flame className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Main Split: Module Breakdown & Weekly Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Progression Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Module-by-Module Progression</h3>
            <div className="space-y-4">
              {modules.map(mod => {
                const completed = mod.completed_lessons || 0;
                const percent = Math.round((completed / mod.lesson_count) * 100);
                const isLocked = mod.locked_by_admin || mod.status === 'LOCKED';

                return (
                  <div key={mod.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{mod.title}</span>
                        <Badge
                          variant={
                            mod.status === 'COMPLETED'
                              ? 'success'
                              : mod.status === 'IN PROGRESS'
                              ? 'primary'
                              : isLocked
                              ? 'locked'
                              : 'default'
                          }
                          size="sm"
                        >
                          {isLocked ? 'LOCKED' : mod.status}
                        </Badge>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {isLocked ? '0%' : `${percent}%`}
                      </span>
                    </div>

                    <ProgressBar
                      value={isLocked ? 0 : completed}
                      max={mod.lesson_count}
                      color={mod.status === 'COMPLETED' ? 'emerald' : 'indigo'}
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>{isLocked ? 'Locked by Admin' : `${completed} of ${mod.lesson_count} lessons complete`}</span>
                      <span>{mod.lessons.reduce((acc, l) => acc + l.duration_minutes, 0)} minutes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Weekly Activity Bar Visualization */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Weekly Learning Activity</h4>
                <p className="text-xs text-slate-500">Lesson submissions by day</p>
              </div>
              <Badge variant="primary" size="sm">This Week</Badge>
            </div>

            {/* Custom CSS Bar Chart */}
            <div className="flex items-end justify-between h-48 pt-4 pb-2 border-b border-slate-200">
              {weeklyData.map(item => (
                <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="text-[10px] font-bold text-slate-600">{item.lessons > 0 ? item.lessons : ''}</div>
                  <div className="w-7 bg-slate-100 rounded-t-lg h-36 flex items-end justify-center p-0.5">
                    <div
                      className="w-full bg-indigo-600 rounded-t-md transition-all duration-500 hover:bg-indigo-700"
                      style={{ height: item.height }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between text-xs text-slate-600">
              <span>Total Weekly Lessons</span>
              <span className="font-bold text-slate-900">13 Lessons</span>
            </div>
          </Card>

          <Card className="p-5 bg-indigo-50/50 border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
              Faculty Feedback Note
            </h4>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              "Great consistency on APIs & JSON. Make sure to complete the Zod schema validation exercises before Module 5 (Databases) unlocks."
            </p>
            <div className="mt-3 text-[11px] font-semibold text-indigo-700">
              — Dr. Marcus Vance, Lead Instructor
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
