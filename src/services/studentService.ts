import { supabase, isSupabaseConfigured, ServiceResult } from '../lib/supabase';
import { StudentProgressSummary } from '../types';

const STUDENTS_STORAGE_KEY = 'skilllab_students_cohort';

function getStoredStudents(): StudentProgressSummary[] {
  const saved = localStorage.getItem(STUDENTS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
}

export const studentService = {
  async getStudents(): Promise<ServiceResult<StudentProgressSummary[]>> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'STUDENT')
          .order('full_name', { ascending: true });

        if (!error && data) {
          const mapped: StudentProgressSummary[] = data.map((d, i) => ({
            student_id: d.id,
            student_name: d.full_name || 'Enrolled Student',
            student_email: d.email || `student${i + 1}@skilllab.edu`,
            student_number: d.student_number || `SL-2026-${String(i + 1).padStart(3, '0')}`,
            avatar_url: d.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            overall_progress: d.overall_progress || 0,
            attendance_percentage: d.attendance_percentage ?? 100,
            current_module: d.current_module || '1. Modern Development Foundation',
            completed_lessons_count: d.completed_lessons_count || 0,
            total_lessons_count: 32,
            last_active: d.last_active || 'Recently',
            status: d.status || 'ON_TRACK',
          }));
          return { data: mapped, error: null };
        }
      } catch (err: unknown) {
        console.warn('Supabase student query warning:', err);
      }
    }

    return { data: getStoredStudents(), error: null };
  },

  async getCohortMetrics(): Promise<{
    totalStudents: number;
    totalAdmins: number;
    averageAttendance: number;
    averageProgress: number;
    activeCurrentModule: string;
  }> {
    const res = await this.getStudents();
    const students = res.data || [];
    const totalStudents = students.length;
    const totalAdmins = 1;

    const totalAttendance = students.reduce((acc, s) => acc + s.attendance_percentage, 0);
    const averageAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 100;

    const totalProgress = students.reduce((acc, s) => acc + s.overall_progress, 0);
    const averageProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    return {
      totalStudents,
      totalAdmins,
      averageAttendance,
      averageProgress,
      activeCurrentModule: '1. Modern Development Foundation',
    };
  }
};
