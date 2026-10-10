import React, { useState } from 'react';
import { ModuleItem } from '../../../types';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import {
  Layers,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { moduleService } from '../../../services/moduleService';
import { useToast } from '../../../context/ToastContext';

interface AdminModuleManagementProps {
  modules: ModuleItem[];
  onRefreshModules: () => void;
}

export function AdminModuleManagement({ modules, onRefreshModules }: AdminModuleManagementProps) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleItem | null>(null);
  const [inspectModule, setInspectModule] = useState<ModuleItem | null>(null);

  // Form states for Add / Edit
  const [formOrderIndex, setFormOrderIndex] = useState<number>(1);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsLocked, setFormIsLocked] = useState(false);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const { showToast } = useToast();

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order_index)) + 1 : 1;
    setFormOrderIndex(nextOrder);
    setFormTitle('');
    setFormDescription('');
    setFormIsLocked(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (mod: ModuleItem) => {
    setEditingModule(mod);
    setFormOrderIndex(mod.order_index);
    setFormTitle(mod.title);
    setFormDescription(mod.description);
    setFormIsLocked(Boolean(mod.locked_by_admin || mod.status === 'LOCKED'));
  };

  // Submit Add Module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Validation Error', 'Module title is required.', 'error');
      return;
    }

    if (formOrderIndex < 1) {
      showToast('Validation Error', 'Module order must be 1 or higher.', 'error');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await moduleService.createModule({
      title: formTitle.trim(),
      description: formDescription.trim(),
      order_index: formOrderIndex,
      locked_by_admin: formIsLocked,
    });
    setIsSubmitting(false);

    if (error || !data) {
      showToast('Failed to Create Module', error || 'Could not save the module.', 'error');
    } else {
      showToast('Module Created', `"${data.title}" has been added to the curriculum.`, 'success');
      setIsAddModalOpen(false);
      onRefreshModules();
    }
  };

  // Submit Edit Module
  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;

    if (!formTitle.trim()) {
      showToast('Validation Error', 'Module title is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await moduleService.updateModule(editingModule.id, {
      title: formTitle.trim(),
      description: formDescription.trim(),
      order_index: formOrderIndex,
      locked_by_admin: formIsLocked,
    });
    setIsSubmitting(false);

    if (error || !data) {
      showToast('Update Failed', error || 'Could not update the module.', 'error');
    } else {
      showToast('Module Updated', `Changes to "${data.title}" have been saved.`, 'success');
      setEditingModule(null);
      onRefreshModules();
    }
  };

  // Confirm Delete Module
  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;

    setIsSubmitting(true);
    const { error } = await moduleService.deleteModule(moduleToDelete.id);
    setIsSubmitting(false);

    if (error) {
      showToast('Cannot Delete Module', error, 'error');
      setModuleToDelete(null);
    } else {
      showToast('Module Deleted', `"${moduleToDelete.title}" has been removed.`, 'success');
      setModuleToDelete(null);
      onRefreshModules();
    }
  };

  // Toggle Lock
  const handleToggleLock = async (module: ModuleItem) => {
    const isCurrentlyLocked = module.locked_by_admin || module.status === 'LOCKED';
    setUpdatingId(module.id);

    const { error, data } = await moduleService.toggleModuleLock(module.id, !isCurrentlyLocked);
    setUpdatingId(null);

    if (error || !data) {
      showToast('Lock Update Failed', error || 'Could not update lock status.', 'error');
    } else {
      showToast(
        !isCurrentlyLocked ? 'Module Locked' : 'Module Unlocked',
        `"${module.title}" is now ${!isCurrentlyLocked ? 'locked for students' : 'accessible to students'}.`,
        'success'
      );
      onRefreshModules();
    }
  };

  // Seed Standard Modules if database is empty
  const handleSeedStandardCurriculum = async () => {
    setIsSeeding(true);
    const { error } = await moduleService.seedInitialModules();
    setIsSeeding(false);

    if (error) {
      showToast('Seeding Failed', error, 'error');
    } else {
      showToast('Curriculum Initialized', 'Standard SkillLab modules have been populated in Supabase.', 'success');
      onRefreshModules();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Curriculum Administration & Access Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words">Module Management</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Create, update, reorder, and control student access to all curriculum modules. Changes are saved directly to the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-start md:justify-end">
          {modules.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeedStandardCurriculum}
              disabled={isSeeding}
              icon={<Sparkles className="w-4 h-4 text-amber-500" />}
              className="rounded-xl shadow-xs text-xs"
            >
              {isSeeding ? 'Populating...' : 'Populate Standard Curriculum'}
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
            className="rounded-xl shadow-xs"
          >
            Add Module
          </Button>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-white border-dashed border-2 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Curriculum Modules in Database</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your curriculum database is currently empty. You can add a new module or populate the standard 8 SkillLab modules.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedStandardCurriculum}
              disabled={isSeeding}
              icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            >
              {isSeeding ? 'Populating...' : 'Populate Standard Curriculum'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Module
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {modules.map(mod => {
            const isLocked = mod.locked_by_admin || mod.status === 'LOCKED';
            const isUpdating = updatingId === mod.id;
            const orderDisplay = mod.order_index < 10 ? `0${mod.order_index}` : `${mod.order_index}`;

            return (
              <Card
                key={mod.id}
                className={`p-4 sm:p-5 transition-all ${
                  isLocked ? 'bg-slate-50/80 border-slate-200' : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Order badge */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs ${
                        isLocked
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {orderDisplay}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 break-words">{mod.title}</h3>
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
                        {isLocked && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded break-words">
                            Visible as "Locked by Skill Lab Admin"
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed break-words">
                        {mod.description || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {mod.lesson_count} Lessons
                        </span>
                        {mod.lessons.length > 0 && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {mod.lessons.reduce((acc, l) => acc + l.duration_minutes, 0)} Mins Content
                          </span>
                        )}
                        <span className="font-mono text-slate-400 shrink-0">
                          Order: #{mod.order_index}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t border-slate-100 lg:border-t-0 shrink-0">
                    {mod.lessons.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectModule(mod)}
                        className="text-xs text-slate-600 hover:text-slate-900"
                      >
                        View Lessons ({mod.lesson_count})
                      </Button>
                    )}

                    {/* Edit button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(mod)}
                      className="text-xs"
                      icon={<Pencil className="w-3.5 h-3.5 text-slate-500" />}
                    >
                      Edit
                    </Button>

                    {/* Lock / Unlock button */}
                    <Button
                      variant={isLocked ? 'primary' : 'outline'}
                      size="sm"
                      loading={isUpdating}
                      onClick={() => handleToggleLock(mod)}
                      className={`text-xs ${
                        isLocked
                          ? 'bg-indigo-600'
                          : 'hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                      }`}
                      icon={
                        isLocked ? (
                          <Unlock className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )
                      }
                    >
                      {isLocked ? 'Unlock' : 'Lock'}
                    </Button>

                    {/* Delete button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModuleToDelete(mod)}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD MODULE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Curriculum Module"
        subtitle="Create a new module in the SkillLab syllabus"
      >
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Index #
              </label>
              <input
                type="number"
                min="1"
                value={formOrderIndex}
                onChange={e => setFormOrderIndex(parseInt(e.target.value) || 1)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Module Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. 9. Advanced Cloud Architectures"
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Outline what students will learn in this curriculum module..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">Student Access State</p>
              <p className="text-[11px] text-slate-500 break-words">
                {formIsLocked
                  ? 'Locked: Students see "Locked by Skill Lab Admin"'
                  : 'Unlocked: Available immediately to students'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormIsLocked(!formIsLocked)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                formIsLocked
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {formIsLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODULE MODAL */}
      {editingModule && (
        <Modal
          isOpen={Boolean(editingModule)}
          onClose={() => setEditingModule(null)}
          title={`Edit: ${editingModule.title}`}
          subtitle="Update module details and access status"
        >
          <form onSubmit={handleUpdateModule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order Index #
                </label>
                <input
                  type="number"
                  min="1"
                  value={formOrderIndex}
                  onChange={e => setFormOrderIndex(parseInt(e.target.value) || 1)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Objectives
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">Student Access State</p>
                <p className="text-[11px] text-slate-500 break-words">
                  {formIsLocked
                    ? 'Locked: Students see "Locked by Skill Lab Admin"'
                    : 'Unlocked: Students can access lessons'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormIsLocked(!formIsLocked)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                  formIsLocked
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {formIsLocked ? 'Locked' : 'Unlocked'}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingModule(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {moduleToDelete && (
        <Modal
          isOpen={Boolean(moduleToDelete)}
          onClose={() => setModuleToDelete(null)}
          title="Delete Curriculum Module?"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed break-words">
              Are you sure you want to delete <strong className="text-slate-900">"{moduleToDelete.title}"</strong> from the curriculum?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="break-words">
                Safety Check: If this module currently contains lessons or has student progress records, deletion will be safely prevented to protect curriculum integrity.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModuleToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* INSPECT LESSONS MODAL */}
      {inspectModule && (
        <Modal
          isOpen={Boolean(inspectModule)}
          onClose={() => setInspectModule(null)}
          title={inspectModule.title}
          subtitle={`Curriculum Lesson Breakdown (${inspectModule.lesson_count} total)`}
          maxWidth="lg"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 pb-2 border-b border-slate-100 break-words">
              {inspectModule.description || 'No description provided.'}
            </p>
            {inspectModule.lessons.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No individual lessons have been attached to this module yet.
              </p>
            ) : (
              inspectModule.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id || idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap sm:flex-nowrap items-center justify-between text-xs gap-2 sm:gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 break-words">
                      {lesson.order_index ? `${lesson.order_index}. ` : ''}
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-slate-500 break-words">{lesson.description}</p>
                  </div>
                  <span className="text-slate-400 font-medium shrink-0 ml-auto sm:ml-3">
                    {lesson.duration_minutes} min
                  </span>
                </div>
              ))
            )}
            <div className="pt-3 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setInspectModule(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
