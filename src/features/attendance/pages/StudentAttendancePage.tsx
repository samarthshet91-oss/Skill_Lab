import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import { AttendanceRecord, AttendanceSession, AttendanceStatus } from '../../../types';
import { Card } from '../../../components/common/Card';
import { StatCard } from '../../../components/common/StatCard';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Radio,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export function StudentAttendancePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    percentage: number;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    records: AttendanceRecord[];
    activeSession: AttendanceSession | null;
    activeSessionResponse: AttendanceStatus | null;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!user) return;
    const res = await attendanceService.getStudentAttendance(user.id);
    if (res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleActiveResponse = async (status: AttendanceStatus) => {
    if (!data?.activeSession || !user) return;

    setIsSubmitting(true);
    const res = await attendanceService.submitStudentResponse({
      sessionId: data.activeSession.id,
      studentId: user.id,
      studentName: user.full_name,
      studentNumber: user.student_number,
      status,
    });
    setIsSubmitting(false);

    if (res.data) {
      showToast(
        'Attendance Recorded',
        `You marked yourself as ${status === 'PRESENT' ? 'Present' : 'Absent'} for ${data.activeSession.topic}.`,
        'success'
      );
      loadAttendance();
    } else {
      showToast(
        'Submission Error',
        'Unable to submit attendance. Please try again.',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading attendance history...
      </div>
    );
  }

  const totalSessions = data?.totalSessions ?? 0;
  const percentage = totalSessions > 0 ? data?.percentage ?? 100 : 100;
  const isGoodStanding = percentage >= 85;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            Official Attendance Transcript
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance & Lab Participation
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            SkillLab policy requires an overall 85% attendance rate across laboratory workshops for certification eligibility.
          </p>
        </div>
      </div>

      {/* ACTIVE SESSION CARD (IF ACTIVE SESSION EXISTS) */}
      {data?.activeSession && (
        <Card className="p-6 border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Lab Session Open
              </span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {data.activeSession.start_time || '10:00 AM'} – {data.activeSession.end_time || '11:30 AM'}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Session Date: <strong className="text-slate-800">{data.activeSession.date}</strong>
            </div>
          </div>

          <div className="py-4">
            <h3 className="text-lg font-extrabold text-slate-900">
              {data.activeSession.topic}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cohort: {data.activeSession.batch}
            </p>
          </div>

          {/* Student's response status for this active session */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {data.activeSessionResponse ? (
              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
                    data.activeSessionResponse === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {data.activeSessionResponse === 'PRESENT' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600" />
                  )}
                  <span>You are recorded as {data.activeSessionResponse}</span>
                </div>
                <span className="text-xs text-slate-500">
                  Response verified for your account
                </span>
              </div>
            ) : (
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Your attendance is pending for this session
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Are you present in this lab workshop? Record your status below.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleActiveResponse('PRESENT')}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3"
                  >
                    ✓ Mark Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActiveResponse('ABSENT')}
                    disabled={isSubmitting}
                    className="text-xs px-3"
                  >
                    Mark Absent
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Attendance Rate"
          value={`${percentage}%`}
          subtitle={
            totalSessions === 0
              ? 'No sessions completed yet'
              : isGoodStanding
              ? 'Academic Standing: Good'
              : 'Standing: Warning'
          }
          trend={{ value: 'Target: >85%', positive: isGoodStanding }}
          icon={<CalendarCheck className="w-5 h-5" />}
          accentColor={isGoodStanding ? 'emerald' : 'amber'}
        />

        <StatCard
          title="Total Lab Sessions"
          value={totalSessions}
          subtitle="Recorded in transcript"
          icon={<Calendar className="w-5 h-5" />}
          accentColor="indigo"
        />

        <StatCard
          title="Sessions Attended"
          value={data?.presentCount ?? 0}
          subtitle="Verified full participation"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Absences"
          value={data?.absentCount ?? 0}
          subtitle={data?.lateCount ? `${data.lateCount} late records logged` : '0 late records'}
          trend={{
            value: 'Excused absences tracked',
            positive: (data?.absentCount ?? 0) <= 1,
          }}
          icon={<XCircle className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Attendance History Table */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Lab Session Participation History
            </h3>
            <p className="text-xs text-slate-500">
              Verified attendance records from completed laboratory sessions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Session Date</th>
                <th className="py-3 px-5">Lab Topic</th>
                <th className="py-3 px-5">Student Account</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.records && data.records.length > 0 ? (
                data.records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {record.date}
                    </td>
                    <td className="py-3.5 px-5 text-slate-900 font-medium">
                      {record.topic}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {user?.full_name}
                      {user?.student_number && (
                        <span className="font-mono text-slate-400 text-[11px] ml-1">
                          ({user.student_number})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge
                        variant={
                          record.status === 'PRESENT'
                            ? 'success'
                            : record.status === 'LATE'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-400 font-medium">
                      {record.submitted_at || 'Recorded'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 space-y-1">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No attendance records yet.</p>
                    <p className="text-xs text-slate-400">
                      When you participate in lab sessions, your verified attendance will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
