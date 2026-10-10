import { supabase, isSupabaseConfigured, ServiceResult } from '../lib/supabase';
import { ModuleItem, ModuleStatus, Lesson } from '../types';
import { INITIAL_MODULES } from '../lib/constants';

function mapModuleRow(row: any): ModuleItem {
  const rawLessons: any[] = Array.isArray(row.lessons) ? row.lessons : [];
  const lessons: Lesson[] = rawLessons
    .map(l => ({
      id: l.id,
      module_id: l.module_id,
      title: l.title,
      description: l.description || '',
      duration_minutes: Number(l.duration_minutes) || 45,
      order_index: Number(l.order_index) || 1,
      is_completed: Boolean(l.is_completed),
    }))
    .sort((a, b) => a.order_index - b.order_index);

  const isLocked = Boolean(row.locked_by_admin);
  const status: ModuleStatus = isLocked ? 'LOCKED' : (row.status as ModuleStatus) || 'UNLOCKED';

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    order_index: Number(row.order_index) || 1,
    status,
    lesson_count: lessons.length,
    completed_lessons: 0,
    lessons,
    locked_by_admin: isLocked,
    color_accent: row.color_accent,
  };
}

export const moduleService = {
  /**
   * Fetch all curriculum modules directly from Supabase, ordered by order_index.
   * Real database is the single source of truth.
   */
  async getModules(): Promise<ServiceResult<ModuleItem[]>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: 'Database service is currently unavailable.' };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { data: [], error: 'Authentication required.' };
    }

    // Load curriculum modules and lessons
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*, lessons(*)')
      .order('order_index', { ascending: true });

    if (modulesError) {
      return { data: [], error: 'Unable to load curriculum modules.' };
    }

    if (!modulesData || !Array.isArray(modulesData)) {
      return { data: [], error: null };
    }

    // Load this student's learning progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('module_id, lesson_id, completed')
      .eq('user_id', session.user.id);

    if (progressError) {
      return { data: [], error: 'Unable to load your learning progress.' };
    }

    // Create a quick lookup of completed lessons
    const completedLessonIds = new Set(
      (progressData || [])
        .filter(progress => progress.completed === true)
        .map(progress => progress.lesson_id)
    );

    const modules = modulesData.map((row: any) => {
      const rawLessons: any[] = Array.isArray(row.lessons)
        ? row.lessons
        : [];

      const lessons: Lesson[] = rawLessons
        .map((lesson: any) => ({
          id: lesson.id,
          module_id: lesson.module_id,
          title: lesson.title,
          description: lesson.description || '',
          duration_minutes: Number(lesson.duration_minutes) || 45,
          order_index: Number(lesson.order_index) || 1,
          is_completed: completedLessonIds.has(lesson.id),
        }))
        .sort((a, b) => a.order_index - b.order_index);

      const isLocked = Boolean(row.locked_by_admin);
      const completedLessons = lessons.filter(
        lesson => lesson.is_completed
      ).length;

      const lessonCount = lessons.length;

      let status: ModuleStatus;

      if (isLocked) {
        status = 'LOCKED';
      } else if (lessonCount > 0 && completedLessons === lessonCount) {
        status = 'COMPLETED';
      } else if (completedLessons > 0) {
        status = 'IN PROGRESS';
      } else {
        status = 'UNLOCKED';
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        order_index: Number(row.order_index) || 1,
        status,
        lesson_count: lessonCount,
        completed_lessons: completedLessons,
        lessons,
        locked_by_admin: isLocked,
        color_accent: row.color_accent,
      };
    });

    return { data: modules, error: null };
  } catch {
    return {
      data: [],
      error: 'Failed to retrieve curriculum modules.',
    };
  }
},
  /**
   * Admin creates a new curriculum module in Supabase
   */
  async createModule(params: {
    title: string;
    description?: string;
    order_index: number;
    locked_by_admin?: boolean;
    color_accent?: string;
  }): Promise<ServiceResult<ModuleItem>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database service is currently unavailable.' };
    }

    const title = params.title.trim();
    if (!title) {
      return { data: null, error: 'Module title is required.' };
    }

    const orderIndex = Number(params.order_index);
    if (isNaN(orderIndex) || orderIndex < 1) {
      return { data: null, error: 'Module order index must be a positive number.' };
    }

    try {
      const isLocked = Boolean(params.locked_by_admin);
      const { data, error } = await supabase
        .from('modules')
        .insert({
          title,
          description: params.description?.trim() || '',
          order_index: orderIndex,
          locked_by_admin: isLocked,
          status: isLocked ? 'LOCKED' : 'UNLOCKED',
          color_accent: params.color_accent || 'indigo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*, lessons(*)')
        .single();

      if (error || !data) {
        return { data: null, error: 'Failed to create module. Please check your inputs.' };
      }

      return { data: mapModuleRow(data), error: null };
    } catch {
      return { data: null, error: 'An unexpected error occurred while creating the module.' };
    }
  },

  /**
   * Admin updates an existing curriculum module in Supabase
   */
  async updateModule(
    moduleId: string,
    updates: {
      title?: string;
      description?: string;
      order_index?: number;
      locked_by_admin?: boolean;
      color_accent?: string;
    }
  ): Promise<ServiceResult<ModuleItem>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database service is currently unavailable.' };
    }

    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) {
        const trimmed = updates.title.trim();
        if (!trimmed) return { data: null, error: 'Module title cannot be empty.' };
        payload.title = trimmed;
      }

      if (updates.description !== undefined) {
        payload.description = updates.description.trim();
      }

      if (updates.order_index !== undefined) {
        const orderNum = Number(updates.order_index);
        if (isNaN(orderNum) || orderNum < 1) {
          return { data: null, error: 'Module order must be a positive number.' };
        }
        payload.order_index = orderNum;
      }

      if (updates.locked_by_admin !== undefined) {
        const isLocked = Boolean(updates.locked_by_admin);
        payload.locked_by_admin = isLocked;
        payload.status = isLocked ? 'LOCKED' : 'UNLOCKED';
      }

      if (updates.color_accent !== undefined) {
        payload.color_accent = updates.color_accent;
      }

      const { data, error } = await supabase
        .from('modules')
        .update(payload)
        .eq('id', moduleId)
        .select('*, lessons(*)')
        .single();

      if (error || !data) {
        return { data: null, error: 'Failed to update module.' };
      }

      return { data: mapModuleRow(data), error: null };
    } catch {
      return { data: null, error: 'An error occurred while updating the module.' };
    }
  },

  /**
   * Admin deletes a module after performing safety checks on dependent records
   */
  async deleteModule(moduleId: string): Promise<ServiceResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database service is currently unavailable.' };
    }

    try {
      // 1. Safety check: Check if lessons exist for this module
      const { count: lessonCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', moduleId);

      if (lessonCount && lessonCount > 0) {
        return {
          data: null,
          error: `Cannot delete this module because it contains ${lessonCount} active lesson${lessonCount > 1 ? 's' : ''}. Please remove or reassign the lessons first.`,
        };
      }

      // 2. Safety check: Check if user progress exists for this module
      const { count: progressCount } = await supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', moduleId);

      if (progressCount && progressCount > 0) {
        return {
          data: null,
          error: 'Cannot delete this module because student learning progress is recorded for it.',
        };
      }

      // 3. Safety check: Check if resources reference this module
      const { count: resourceCount } = await supabase
        .from('resources')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', moduleId);

      if (resourceCount && resourceCount > 0) {
        return {
          data: null,
          error: 'Cannot delete this module because learning resources are linked to it.',
        };
      }

      // 4. Safe deletion
      const { error } = await supabase.from('modules').delete().eq('id', moduleId);

      if (error) {
        return {
          data: null,
          error: 'Cannot delete module due to existing database dependencies.',
        };
      }

      return { data: true, error: null };
    } catch {
      return { data: null, error: 'Failed to delete module.' };
    }
  },

  /**
   * Admin toggles the lock state of a module
   */
  async toggleModuleLock(moduleId: string, isLocked: boolean): Promise<ServiceResult<ModuleItem>> {
    return this.updateModule(moduleId, { locked_by_admin: isLocked });
  },

  /**
   * Student marks a lesson complete in Supabase user_progress
   */
  async markLessonComplete(moduleId: string, lessonId: string, completed: boolean): Promise<ServiceResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: false, error: 'Service unavailable' };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return { data: false, error: 'Authentication required' };
      }

      const { error } = await supabase.from('user_progress').upsert({
        user_id: session.user.id,
        module_id: moduleId,
        lesson_id: lessonId,
        completed,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { data: false, error: error.message };
      }

      return { data: true, error: null };
    } catch {
      return { data: false, error: 'Failed to record progress' };
    }
  },

  /**
   * Allows the Admin to seed the standard SkillLab curriculum into Supabase if empty
   */
  async seedInitialModules(): Promise<ServiceResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: false, error: 'Database service is unavailable.' };
    }

    try {
      for (const mod of INITIAL_MODULES) {
        const { data: createdMod, error: modErr } = await supabase
          .from('modules')
          .insert({
            title: mod.title,
            description: mod.description,
            order_index: mod.order_index,
            locked_by_admin: Boolean(mod.locked_by_admin),
            status: mod.locked_by_admin ? 'LOCKED' : (mod.status || 'UNLOCKED'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (!modErr && createdMod && mod.lessons?.length > 0) {
          const lessonInserts = mod.lessons.map(l => ({
            module_id: createdMod.id,
            title: l.title,
            description: l.description,
            duration_minutes: l.duration_minutes,
            order_index: l.order_index,
            created_at: new Date().toISOString(),
          }));

          await supabase.from('lessons').insert(lessonInserts);
        }
      }

      return { data: true, error: null };
    } catch {
      return { data: false, error: 'Failed to seed curriculum.' };
    }
  },
};
