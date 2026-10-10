
import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';

import { attendanceService } from '../../../services/attendanceService';
import type { AttendanceSession } from '../../../types';

import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDate = (date?: string) => {
  if (!date) return 'Date unavailable';

  const parts = date.split('-');
  if (parts.length !== 3) return date;

  const parsed = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const getSessionTime = (session: AttendanceSession) => {
  return `${session.start_time || '—'} – ${session.end_time || '—'}`;
};

export  function AdminAttendancePage() {
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedSession, setSelectedSession] =
    useState<AttendanceSession | null>(null);

  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:30 AM');
  const [batch, setBatch] = useState('');

  const [creating, setCreating] = useState(false);
  const [closing, setClosing] = useState(false);

  // Fetch sessions. Background refreshes do not replace the page with a loader.
  const loadSessions = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const response = await attendanceService.getSessions();

      if (response.error) {
        console.error('Failed to load attendance sessions:', response.error);
        return;
      }

      if (response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Failed to load attendance sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Statuses are calculated by attendanceService from the scheduled date/time.
  // Refresh periodically so the admin page reflects those transitions.
  useEffect(() => {
    void loadSessions(true);

    const intervalId = window.setInterval(() => {
      void loadSessions(false);
    }, 15000);

    const handleFocus = () => {
      void loadSessions(false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadSessions]);

  const activeSession =
    sessions.find((session) => session.status === 'ACTIVE') ?? null;

  const scheduledSessions = sessions
    .filter((session) => session.status === 'SCHEDULED')
    .sort((a, b) => {
      const aTime = `${a.date} ${a.start_time || ''}`;
      const bTime = `${b.date} ${b.start_time || ''}`;
      return aTime.localeCompare(bTime);
    });

  const previousSessions = sessions
    .filter((session) => session.status === 'CLOSED')
    .sort((a, b) => {
      const aTime = `${a.date} ${a.start_time || ''}`;
      const bTime = `${b.date} ${b.start_time || ''}`;
      return bTime.localeCompare(aTime);
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions(false);
  };

  const handleOpenCreateModal = () => {
    setTopic('');
    setDate(getLocalDateString());
    setStartTime('10:00 AM');
    setEndTime('11:30 AM');
    setBatch('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSession = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!topic.trim() || !date || !startTime.trim() || !endTime.trim() || !batch.trim()) {
      showToast(
        'Missing information',
        'Please fill in all session details.',
        'error'
      );
      return;
    }

    setCreating(true);

    try {
      const response = await attendanceService.createSession({
        topic: topic.trim(),
        date,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        batch: batch.trim(),
      });

      if (response.error || !response.data) {
        showToast(
          'Could not schedule session',
          response.error || 'Please check the date, times, and existing sessions.',
          'error'
        );
        return;
      }

      const createdSession = response.data;
      const isScheduled = createdSession.status === 'SCHEDULED';

      showToast(
        isScheduled ? 'Session Scheduled' : 'Attendance Session Started',
        isScheduled
          ? `${createdSession.topic} is scheduled for ${formatDate(createdSession.date)} at ${createdSession.start_time}.`
          : `${createdSession.topic} is active. Students can now submit attendance.`,
        'success'
      );

      setIsCreateModalOpen(false);
      await loadSessions(false);
    } catch (error) {
      console.error('Failed to create attendance session:', error);
      showToast(
        'Something went wrong',
        'The attendance session could not be created.',
        'error'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmCloseSession = async () => {
    if (!activeSession) return;

    setClosing(true);

    try {
      const response = await attendanceService.closeSession(activeSession.id);

      if (response.error) {
        showToast(
          'Could not close session',
          response.error,
          'error'
        );
        return;
      }

      showToast(
        'Session Closed',
        'Students can no longer submit attendance for this session.',
        'success'
      );

      setIsCloseModalOpen(false);
      await loadSessions(false);
    } catch (error) {
      console.error('Failed to close attendance session:', error);
      showToast(
        'Something went wrong',
        'The session could not be closed.',
        'error'
      );
    } finally {
      setClosing(false);
    }
  };

  const handleViewDetails = (session: AttendanceSession) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  const responseCount = (session: AttendanceSession) => {
    const records = (session as any).attendance_records;
    return Array.isArray(records) ? records.length : 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading attendance sessions...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Schedule attendance windows and monitor student responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Active Sessions
            </p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {activeSession ? 1 : 0}
          </p>
        </Card>

        <Card className="border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Upcoming Sessions
            </p>
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {scheduledSessions.length}
          </p>
        </Card>

        <Card className="border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Closed Sessions
            </p>
            <XCircle className="h-5 w-5 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {previousSessions.length}
          </p>
        </Card>
      </div>

      {/* CURRENT ATTENDANCE WINDOW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Attendance Window
          </h2>
          {activeSession && (
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          )}
        </div>

        {activeSession ? (
          <Card className="border border-emerald-200 bg-white p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge>Active</Badge>
                  <span className="text-xs text-slate-500">
                    {activeSession.batch}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {activeSession.topic}
                </h3>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(activeSession.date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {getSessionTime(activeSession)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {responseCount(activeSession)} responses
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCloseModalOpen(true)}
              >
                <X className="mr-2 h-4 w-4" />
                Close Early
              </Button>
            </div>

            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
              Students can submit attendance while this session is active.
              It will close automatically at the scheduled end time.
            </div>
          </Card>
        ) : (
          <Card className="border border-dashed border-slate-300 bg-white p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-700">
              No Active Attendance Session
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              A scheduled session will become active automatically at its start time.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule a Session
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* SCHEDULED SESSIONS */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Scheduled Sessions ({scheduledSessions.length})
        </h2>

        {scheduledSessions.length === 0 ? (
          <Card className="border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No upcoming attendance sessions.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scheduledSessions.map((session) => (
              <Card
                key={session.id}
                className="border border-amber-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <Clock className="h-4 w-4" />
                    Scheduled
                  </span>
                  <Badge>Upcoming</Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {session.topic}
                </h3>

                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(session.date)}
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-4 w-4" />
                  {getSessionTime(session)}
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Users className="h-4 w-4" />
                  {session.batch}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* PREVIOUS / CLOSED SESSIONS */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Previous Sessions ({previousSessions.length})
        </h2>

        {previousSessions.length === 0 ? (
          <Card className="border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No closed sessions yet. Sessions will appear here after their end
            time or when you close them early.
          </Card>
        ) : (
          <div className="space-y-3">
            {previousSessions.map((session) => (
              <Card
                key={session.id}
                className="border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>Closed</Badge>
                      <span className="text-xs text-slate-500">
                        {session.batch}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {session.topic}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {getSessionTime(session)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {responseCount(session)} responses
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDetails(session)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CREATE / SCHEDULE SESSION MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !creating && setIsCreateModalOpen(false)}
        title="Schedule Attendance"
        subtitle="Choose when students should be able to submit attendance."
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label
              htmlFor="attendance-topic"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Session Topic
            </label>
            <input
              id="attendance-topic"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Data Structures - Week 4"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="attendance-batch"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Batch / Class
            </label>
            <input
              id="attendance-batch"
              type="text"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              placeholder="e.g. AIML - H2"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="attendance-date"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Session Date
            </label>
            <input
              id="attendance-date"
              type="date"
              value={date}
              min={getLocalDateString()}
              onChange={(event) => setDate(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="attendance-start"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Start Time
              </label>
              <input
                id="attendance-start"
                type="text"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                placeholder="10:00 AM"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Example: 10:00 AM
              </p>
            </div>

            <div>
              <label
                htmlFor="attendance-end"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                End Time
              </label>
              <input
                id="attendance-end"
                type="text"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                placeholder="11:30 AM"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Example: 11:30 AM
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-indigo-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-[11px] leading-relaxed text-indigo-800">
              Students will see the attendance prompt only during the scheduled
              window. The session becomes active at the start time and closes
              automatically at the end time. You can close an active session
              early.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={creating}
            >
              {creating ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CLOSE SESSION CONFIRMATION MODAL */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => !closing && setIsCloseModalOpen(false)}
        title="Close Attendance Session?"
        subtitle="This will stop students from submitting attendance for this session."
      >
        <div className="space-y-4">
          {activeSession && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {activeSession.topic}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(activeSession.date)} · {getSessionTime(activeSession)}
              </p>
            </div>
          )}

          <p className="text-sm leading-relaxed text-slate-600">
            Are you sure you want to close this session before its scheduled
            end time?
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCloseModalOpen(false)}
              disabled={closing}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmCloseSession}
              disabled={closing}
            >
              {closing ? 'Closing...' : 'Close Session'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* SESSION DETAILS MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Attendance Session Details"
        subtitle="Review the details of this completed session."
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge>Closed</Badge>
                <span className="text-xs text-slate-500">
                  {selectedSession.batch}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {selectedSession.topic}
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formatDate(selectedSession.date)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {getSessionTime(selectedSession)}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  {responseCount(selectedSession)} recorded responses
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">
              This view displays the session summary. Student response details
              depend on the attendance records returned by your service.
            </p>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
