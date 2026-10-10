import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceSession, AttendanceStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  AlertCircle,
  X,
  BellRing,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function StudentActiveAttendancePrompt() {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const checkActiveSession = useCallback(async () => {
    if (!user?.id || role !== 'STUDENT') return;

    try {
      const { activeSession: session, hasResponded: responded } =
        await attendanceService.getActiveSessionForStudent(user.id);

      setActiveSession(session);
      setHasResponded(responded);

      if (session && !responded) {
        // Only open if the student hasn't dismissed it in the current view
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setIsMinimized(false);
      }
    } catch {
      // Non-blocking
    }
  }, [user?.id, role]);

  useEffect(() => {
    if (!user || role !== 'STUDENT') return;

    // Initial check
    checkActiveSession();

    // Check periodically every 10 seconds
    const interval = setInterval(checkActiveSession, 10000);

    // Check on window focus
    const handleFocus = () => checkActiveSession();
    window.addEventListener('focus', handleFocus);

    // Supabase Realtime subscription if available
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('attendance_active_listener')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'attendance_sessions' },
            () => {
              checkActiveSession();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'attendance_records' },
            () => {
              checkActiveSession();
            }
          )
          .subscribe();
      } catch {
        // Fallback to interval
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, role, checkActiveSession]);

  const handleResponse = async (status: AttendanceStatus) => {
    if (!activeSession || !user) return;

    setIsSubmitting(true);
    const res = await attendanceService.submitStudentResponse({
      sessionId: activeSession.id,
      studentId: user.id,
      studentName: user.full_name,
      studentNumber: user.student_number,
      status,
    });
    setIsSubmitting(false);

    if (res.data) {
      setHasResponded(true);
      setIsOpen(false);
      setIsMinimized(false);
      showToast(
        'Attendance Recorded',
        `You marked yourself as ${status === 'PRESENT' ? 'Present' : 'Absent'} for ${activeSession.topic}.`,
        'success'
      );
    } else {
      showToast(
        'Attendance Submission',
        'Unable to submit attendance. Please try again.',
        'error'
      );
    }
  };

  if (!user || role !== 'STUDENT' || !activeSession || hasResponded) {
    return null;
  }

  return (
    <>
      {/* Floating alert pill if minimized */}
      {isMinimized && !hasResponded && (
        <aside
          aria-label="Attendance alert"
          className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-indigo-400/40 animate-bounce cursor-pointer hover:bg-indigo-700 transition-all"
          onClick={() => setIsMinimized(false)}
        >
          <BellRing className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Attendance is open: </span>
            <span className="opacity-90">{activeSession.topic}</span>
          </div>
          <button
            type="button"
            aria-label="Expand attendance prompt"
            className="text-xs font-bold underline ml-1 cursor-pointer"
          >
            Respond
          </button>
        </aside>
      )}

      {/* Main Prominent Prompt Modal */}
      {!isMinimized && isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="attendance-prompt-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-7 relative animate-in zoom-in-95 duration-200">
            {/* Close / Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Respond later"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Active Indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Attendance is open
              </span>
            </div>

            {/* Session Topic & Details */}
            <h2 id="attendance-prompt-title" className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              {activeSession.topic}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 pb-4 border-b border-slate-100">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                {activeSession.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {activeSession.start_time || '10:00 AM'} – {activeSession.end_time || '11:30 AM'}
              </span>
            </div>

            {/* Prompt Question */}
            <div className="py-5 text-center">
              <p className="text-base font-bold text-slate-900">
                Are you present for this session?
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Recording participation for{' '}
                <strong className="text-slate-700">{user.full_name}</strong>
                {user.student_number && (
                  <span className="font-mono text-slate-500"> ({user.student_number})</span>
                )}
                . You can only respond once.
              </p>
            </div>

            {/* Response Buttons */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleResponse('PRESENT')}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                <span>{isSubmitting ? 'Saving...' : '✓ Present'}</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => handleResponse('ABSENT')}
                disabled={isSubmitting}
                className="border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
                <span>{isSubmitting ? 'Saving...' : 'Absent'}</span>
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-4">
              Responses are saved directly to your permanent academic lab transcript.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
