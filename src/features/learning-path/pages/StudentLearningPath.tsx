import React, { useState } from 'react';
import { ModuleItem, Lesson } from '../../../types';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { Modal } from '../../../components/common/Modal';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Play,
  Check
} from 'lucide-react';
import { moduleService } from '../../../services/moduleService';
import { useToast } from '../../../context/ToastContext';

interface StudentLearningPathProps {
  modules: ModuleItem[];
  onRefreshModules: () => void;
  onOpenSkillBotWithContext?: (moduleTitle: string) => void;
}

export function StudentLearningPath({
  modules,
  onRefreshModules,
  onOpenSkillBotWithContext
}: StudentLearningPathProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const { showToast } = useToast();

  const handleToggleLessonComplete = async (moduleId: string, lessonId: string, currentCompleted: boolean) => {
    const { error } = await moduleService.markLessonComplete(moduleId, lessonId, !currentCompleted);
    if (!error) {
      showToast(
        !currentCompleted ? 'Lesson Marked as Completed' : 'Lesson Status Updated',
        'Your learning progress has been saved.',
        'success'
      );
      onRefreshModules();
      // Update local selected module lessons
      if (selectedModule && selectedModule.id === moduleId) {
        const updatedLessons = selectedModule.lessons.map(l =>
          l.id === lessonId ? { ...l, is_completed: !currentCompleted } : l
        );
        const completedCount = updatedLessons.filter(l => l.is_completed).length;
        setSelectedModule({
          ...selectedModule,
          lessons: updatedLessons,
          completed_lessons: completedCount,
        });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            SkillLab Official Curriculum
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Software Engineering Learning Path</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {modules.length > 0 ? `${modules.length} progressive modules designed to take you from foundational syntax to autonomous AI system development.` : 'Curriculum modules designed to take you from foundational syntax to autonomous AI system development.'} Module progression is synchronized with college lab schedules and managed by administrators.
          </p>
        </div>
      </div>

      {/* Module Grid */}
      {modules.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2 border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Curriculum Modules Published Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Modules will appear here once published by course instructors. Please check back soon.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod) => {
            const isLocked = mod.locked_by_admin || mod.status === 'LOCKED';
            const isCompleted = mod.status === 'COMPLETED';
            const isInProgress = mod.status === 'IN PROGRESS';
            const completedCount = mod.completed_lessons || 0;
            const lessonCount = mod.lesson_count || mod.lessons.length || 0;
            const progressPercent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
            const orderDisplay = mod.order_index < 10 ? `0${mod.order_index}` : `${mod.order_index}`;

            return (
              <Card
                key={mod.id}
                className={`flex flex-col justify-between transition-all ${
                  isLocked
                    ? 'bg-slate-50/70 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Header status row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-extrabold text-slate-400">MODULE {orderDisplay}</span>
                    <Badge
                      variant={
                        isCompleted
                          ? 'success'
                          : isInProgress
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

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{mod.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{mod.description}</p>

                  {/* Locked Banner or Progress */}
                  {isLocked ? (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <p className="font-bold">Locked by Skill Lab Admin</p>
                        <p className="text-[11px] text-amber-800">
                          This module will unlock when your cohort reaches this phase in the lab schedule.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{completedCount} of {lessonCount} Lessons Completed</span>
                        <span className="text-indigo-600 font-bold">{progressPercent}%</span>
                      </div>
                      <ProgressBar
                        value={completedCount}
                        max={Math.max(lessonCount, 1)}
                        color={isCompleted ? 'emerald' : 'indigo'}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {mod.lessons.reduce((acc, l) => acc + l.duration_minutes, 0)} mins total
                  </span>

                {isLocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-xs text-slate-400 bg-slate-100 border-slate-200"
                    icon={<Lock className="w-3.5 h-3.5" />}
                  >
                    Locked
                  </Button>
                ) : (
                  <Button
                    variant={isInProgress ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedModule(mod)}
                    className="text-xs"
                    icon={<Play className="w-3 h-3" />}
                  >
                    {isCompleted ? 'Review Lessons' : 'Open Lessons'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    )}

      {/* Lesson Viewer Modal */}
      {selectedModule && (
        <Modal
          isOpen={Boolean(selectedModule)}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.title}
          subtitle={`${selectedModule.lessons.length} lessons in this learning unit`}
          maxWidth="lg"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Click a lesson to toggle completion:</span>
              {onOpenSkillBotWithContext && (
                <button
                  onClick={() => {
                    onOpenSkillBotWithContext(selectedModule.title);
                    setSelectedModule(null);
                  }}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Ask SkillBot about this module &rarr;
                </button>
              )}
            </div>

            {selectedModule.lessons.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => handleToggleLessonComplete(selectedModule.id, lesson.id, Boolean(lesson.is_completed))}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                  lesson.is_completed
                    ? 'bg-emerald-50/50 border-emerald-200/80'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      lesson.is_completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {lesson.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{lesson.description}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  {lesson.duration_minutes} min
                </span>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedModule(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
