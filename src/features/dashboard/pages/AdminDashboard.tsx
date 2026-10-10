import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { StatCard } from '../../../components/common/StatCard';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  TrendingUp,
  Layers,
  Lock,
  Unlock,
  Upload,
} from 'lucide-react';
import { ModuleItem, StudentProgressSummary } from '../../../types';

interface AdminDashboardProps {
  students: StudentProgressSummary[];
  modules: ModuleItem[];
  onNavigateToStudents: () => void;
  onNavigateToModules: () => void;
  onNavigateToAttendance: () => void;
  onNavigateToResources: () => void;
  onToggleModuleLock: (moduleId: string, isLocked: boolean) => void;
}

export function AdminDashboard({
  students,
  modules,
  onNavigateToStudents,
  onNavigateToModules,
  onNavigateToAttendance,
  onNavigateToResources,
  onToggleModuleLock,
}: AdminDashboardProps) {
  const { user } = useAuth();

  // Metrics
  const totalStudents = students.length;
  const totalAdmins = 1;
  const avgAttendance = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + s.attendance_percentage, 0) / totalStudents)
    : 100;
  const avgProgress = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + s.overall_progress, 0) / totalStudents)
    : 0;

  const lockedCount = modules.filter(m => m.locked_by_admin || m.status === 'LOCKED').length;
  const unlockedCount = modules.length - lockedCount;
  const activeModule = modules.find(m => m.status === 'IN PROGRESS') || modules.find(m => m.status === 'UNLOCKED') || modules[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            SkillLab Academic Director & Faculty Console
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin Overview: {user?.full_name || 'Academic Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Monitoring {totalStudents} enrolled student{totalStudents === 1 ? '' : 's'} across the software engineering track. Module access is strictly controlled by faculty administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToAttendance}
            icon={<CalendarCheck className="w-4 h-4 text-indigo-600" />}
          >
            New Attendance Session
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToModules}
            icon={<Layers className="w-4 h-4" />}
          >
            Manage Modules
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled in cohort"
          trend={{ value: `${totalStudents} Enrolled`, positive: true }}
          icon={<Users className="w-5 h-5" />}
          accentColor="indigo"
        />

        <StatCard
          title="Active Administrators"
          value={totalAdmins}
          subtitle="Faculty & Academic Directors"
          trend={{ value: 'Full Access', positive: true }}
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="purple"
        />

        <StatCard
          title="Average Attendance"
          value={`${avgAttendance}%`}
          subtitle="Across lab workshops"
          trend={{ value: 'Goal: >85%', positive: true }}
          icon={<CalendarCheck className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Average Progress"
          value={`${avgProgress}%`}
          subtitle={`Current: ${activeModule?.title.replace(/^\d+\.\s*/, '') || 'Orientation'}`}
          trend={{ value: `${unlockedCount}/${modules.length} Modules Accessible`, positive: true }}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Two Column Layout: Module Quick Controls & Student Cohort Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Management Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Curriculum Access Controls</h3>
                <p className="text-xs text-slate-500">
                  Instant administrative Lock/Unlock toggles for the modules
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onNavigateToModules} className="text-indigo-600 font-semibold text-xs">
                View All &rarr;
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {modules.map(mod => {
                const isLocked = mod.locked_by_admin || mod.status === 'LOCKED';
                return (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isLocked
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isLocked ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {mod.order_index}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{mod.title}</h4>
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
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {mod.lesson_count} lessons • {mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={isLocked ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => onToggleModuleLock(mod.id, !isLocked)}
                        className="text-xs"
                        icon={isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      >
                        {isLocked ? 'Unlock for Class' : 'Lock Module'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Students Status & Recent Lab Activities */}
        <div className="space-y-6">
          {/* Quick Roster Snapshot */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Enrolled Students ({totalStudents})</h4>
                <p className="text-[11px] text-slate-500">Live progress indicators</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onNavigateToStudents} className="text-indigo-600 text-xs font-semibold p-0">
                Full Directory
              </Button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {students.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No enrolled students yet.</p>
              ) : (
                students.slice(0, 7).map(student => (
                  <div
                    key={student.student_id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student.avatar_url}
                        alt={student.student_name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{student.student_name}</p>
                        <p className="text-[10px] text-slate-500">{student.student_number}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900">{student.overall_progress}%</span>
                      <span className="block text-[10px] text-emerald-600 font-medium">
                        {student.attendance_percentage}% Att.
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="p-5 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border-purple-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Faculty Lab Tools
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-white"
                onClick={onNavigateToAttendance}
                icon={<CalendarCheck className="w-4 h-4 text-indigo-600" />}
              >
                Manage Attendance Sessions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-white"
                onClick={onNavigateToResources}
                icon={<Upload className="w-4 h-4 text-purple-600" />}
              >
                Upload Learning Resource
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
