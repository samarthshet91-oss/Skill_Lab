
import {
  supabase,
  isSupabaseConfigured,
  ServiceResult,
} from '../lib/supabase';

import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  AttendanceSessionStatus,
} from '../types';

/**
 * Parse a time such as "09:30", "9:30 AM", or "2:15 PM"
 * into minutes after midnight.
 */
function parseTimeToMinutes(time: string): number | null {
  const value = time.trim();

  // HTML time input format: HH:mm (24-hour clock)
  const twentyFourHourMatch = value.match(/^(\d{2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
  }

  // 12-hour format: h:mm AM/PM
  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!twelveHourMatch) return null;

  let hours = Number(twelveHourMatch[1]);
  const minutes = Number(twelveHourMatch[2]);
  const period = twelveHourMatch[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes > 59) {
    return null;
  }

  hours %= 12;

  if (period === 'PM') {
    hours += 12;
  }

  return hours * 60 + minutes;
}

/**
 * Extract the scheduled time window from the batch metadata.
 */
function extractSessionTimes(batch: string | null | undefined): {
  startTime: string;
  endTime: string;
  hasTimeMetadata: boolean;
} {
  const match = (batch || '').match(/\[TIME:([^\]]+)\]/);

  if (!match?.[1]) {
    return {
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      hasTimeMetadata: false,
    };
  }

  const parts = match[1].split('-').map((part) => part.trim());

  return {
    startTime: parts[0] || '10:00 AM',
    endTime: parts[1] || '11:30 AM',
    hasTimeMetadata: Boolean(parts[0] && parts[1]),
  };
}

/**
 * Calculate a session's status using its date and scheduled times.
 *
 * Uses the browser/server's local timezone. Ensure the deployed
 * environment uses the same timezone as the college if relying on
 * server-side execution of this function.
 */
function getSessionStatus(
  date: string,
  startTime: string,
  endTime: string,
  manuallyClosed: boolean
): AttendanceSessionStatus {
  if (manuallyClosed) {
    return 'CLOSED';
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes
  ) {
    return 'CLOSED';
  }

  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateMatch) {
    return 'CLOSED';
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);

  const now = new Date();
  const sessionDate = new Date(year, month, day);

  if (
    sessionDate.getFullYear() !== year ||
    sessionDate.getMonth() !== month ||
    sessionDate.getDate() !== day
  ) {
    return 'CLOSED';
  }

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  if (sessionDate.getTime() > today.getTime()) {
    return 'SCHEDULED';
  }

  if (sessionDate.getTime() < today.getTime()) {
    return 'CLOSED';
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (currentMinutes < startMinutes) {
    return 'SCHEDULED';
  }

  if (currentMinutes >= endMinutes) {
    return 'CLOSED';
  }

  return 'ACTIVE';
}

/**
 * Determine a session's current status from its database row.
 */
function getStatusFromRow(
  item: any,
  startTime: string,
  endTime: string,
  hasTimeMetadata: boolean
): AttendanceSessionStatus {
  const rawBatch = item.batch || '';

  if (rawBatch.includes('[STATUS:CLOSED]')) {
    return 'CLOSED';
  }

  if (hasTimeMetadata) {
    return getSessionStatus(
      item.date,
      startTime,
      endTime,
      false
    );
  }

  // Backward compatibility for older sessions without time metadata.
  if (rawBatch.includes('[STATUS:SCHEDULED]')) {
    return 'SCHEDULED';
  }

  if (rawBatch.includes('[STATUS:ACTIVE]')) {
    return 'ACTIVE';
  }

  return 'CLOSED';
}

/**
 * Parse a database row from Supabase attendance_sessions.
 */
function parseSessionRow(item: any): AttendanceSession {
  const rawBatch = item.batch || 'Skill Lab Active Cohort';

  const {
    startTime,
    endTime,
    hasTimeMetadata,
  } = extractSessionTimes(rawBatch);

  const status = getStatusFromRow(
    item,
    startTime,
    endTime,
    hasTimeMetadata
  );

  const cleanBatch =
    rawBatch
      .replace(/\[STATUS:(ACTIVE|SCHEDULED|CLOSED)\]/g, '')
      .replace(/\[TIME:[^\]]+\]/g, '')
      .replace(/\|$/, '')
      .trim() || 'Skill Lab Active Cohort';

  const rawRecords = Array.isArray(item.attendance_records)
    ? item.attendance_records
    : [];

  const mappedRecords = rawRecords.map((record: any) => ({
    student_id: record.student_id,
    student_name: record.student_name || 'Enrolled Student',
    student_number: record.student_number,
    status: (record.status as AttendanceStatus) || 'PRESENT',
    submitted_at: record.created_at
      ? new Date(record.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : undefined,
  }));

  const presentCount = mappedRecords.filter(
    (record: any) => record.status === 'PRESENT'
  ).length;

  const absentCount = mappedRecords.filter(
    (record: any) => record.status === 'ABSENT'
  ).length;

  const lateCount = mappedRecords.filter(
    (record: any) => record.status === 'LATE'
  ).length;

  return {
    id: item.id,
    date: item.date,
    topic: item.topic,
    batch: cleanBatch,
    created_at: item.created_at || new Date().toISOString(),
    start_time: startTime,
    end_time: endTime,
    status,
    present_count: presentCount,
    absent_count: absentCount,
    late_count: lateCount,
    total_students: mappedRecords.length,
    records: mappedRecords,
  };
}

/**
 * Check whether a proposed session overlaps an existing session.
 * Sessions on different dates do not overlap.
 */
function sessionsOverlap(
  dateA: string,
  startA: string,
  endA: string,
  dateB: string,
  startB: string,
  endB: string
): boolean {
  if (dateA !== dateB) return false;

  const startAMinutes = parseTimeToMinutes(startA);
  const endAMinutes = parseTimeToMinutes(endA);
  const startBMinutes = parseTimeToMinutes(startB);
  const endBMinutes = parseTimeToMinutes(endB);

  if (
    startAMinutes === null ||
    endAMinutes === null ||
    startBMinutes === null ||
    endBMinutes === null
  ) {
    return true;
  }

  return (
    startAMinutes < endBMinutes &&
    startBMinutes < endAMinutes
  );
}

export const attendanceService = {
  /**
   * Fetch all attendance sessions from Supabase.
   * Status is calculated from the scheduled time window.
   */
  async getSessions(): Promise<ServiceResult<AttendanceSession[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: [],
        error: 'Database service is currently unavailable.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*, attendance_records(*)')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      if (!data || !Array.isArray(data)) {
        return { data: [], error: null };
      }

      return {
        data: data.map(parseSessionRow),
        error: null,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to query attendance sessions.';

      return { data: [], error: message };
    }
  },

  /**
   * Get the currently active session and the student's response.
   */
  async getActiveSessionForStudent(studentId: string): Promise<{
    activeSession: AttendanceSession | null;
    hasResponded: boolean;
    studentRecord: AttendanceRecord | null;
  }> {
    const result = await this.getSessions();
    const sessions = result.data || [];

    const active = sessions.find(
      (session) => session.status === 'ACTIVE'
    ) || null;

    if (!active) {
      return {
        activeSession: null,
        hasResponded: false,
        studentRecord: null,
      };
    }

    const record =
      active.records.find(
        (item) => item.student_id === studentId
      ) || null;

    return {
      activeSession: active,
      hasResponded: Boolean(record),
      studentRecord: record
        ? {
            id: `${active.id}-${studentId}`,
            session_id: active.id,
            date: active.date,
            topic: active.topic,
            status: record.status,
            student_id: studentId,
            student_name: record.student_name,
            student_number: record.student_number,
            submitted_at: record.submitted_at,
          }
        : null,
    };
  },

  /**
   * Create a session with its scheduled date and time window.
   *
   * Future sessions are stored as SCHEDULED. Creating a future
   * session does not close a currently active session.
   */
  async createSession(params: {
    date: string;
    topic: string;
    batch?: string;
    start_time?: string;
    end_time?: string;
  }): Promise<ServiceResult<AttendanceSession>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: null,
        error: 'Database service is not configured.',
      };
    }

    try {
      const baseBatch =
        params.batch?.trim() || 'Skill Lab Active Cohort';

      const startTime = params.start_time?.trim() || '10:00 AM';
      const endTime = params.end_time?.trim() || '11:30 AM';

      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(endTime);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
        return {
          data: null,
          error: 'Please provide a valid session date.',
        };
      }

      if (startMinutes === null || endMinutes === null) {
        return {
          data: null,
          error: 'Please provide valid start and end times.',
        };
      }

      if (endMinutes <= startMinutes) {
        return {
          data: null,
          error: 'End time must be later than start time.',
        };
      }

      if (!params.topic.trim()) {
        return {
          data: null,
          error: 'Please provide a session topic.',
        };
      }

      // Fetch existing sessions to prevent overlapping schedules.
      const { data: existingSessions, error: existingError } =
        await supabase
          .from('attendance_sessions')
          .select('id, date, batch, created_at');

      if (existingError) {
        return {
          data: null,
          error: existingError.message,
        };
      }

      const sessions = (existingSessions || []).map((item) => {
        const parsed = parseSessionRow(item);

        return {
          id: item.id,
          date: item.date,
          status: parsed.status,
          startTime: parsed.start_time || '10:00 AM',
          endTime: parsed.end_time || '11:30 AM',
          manuallyClosed: (item.batch || '').includes(
            '[STATUS:CLOSED]'
          ),
        };
      });

      for (const existing of sessions) {
        if (
          existing.manuallyClosed ||
          existing.status === 'CLOSED'
        ) {
          continue;
        }

        if (
          sessionsOverlap(
            params.date,
            startTime,
            endTime,
            existing.date,
            existing.startTime,
            existing.endTime
          )
        ) {
          return {
            data: null,
            error:
              'This time overlaps another scheduled or active attendance session. Please choose a different time.',
          };
        }
      }

      const initialStatus = getSessionStatus(
        params.date,
        startTime,
        endTime,
        false
      );

      const batchWithMetadata =
        `${baseBatch} [STATUS:${initialStatus}] ` +
        `[TIME:${startTime} - ${endTime}]`;

      // Only close other sessions if this new session is active now.
      if (initialStatus === 'ACTIVE') {
        const currentlyActive = sessions.filter(
          (session) => session.status === 'ACTIVE'
        );

        for (const session of currentlyActive) {
          const { data: currentRow, error: currentFetchError } =
            await supabase
              .from('attendance_sessions')
              .select('batch')
              .eq('id', session.id)
              .single();

          if (currentFetchError || !currentRow) {
            return {
              data: null,
              error:
                currentFetchError?.message ||
                'Could not verify the currently active session.',
            };
          }

          const updatedBatch = (currentRow.batch || '')
            .replace(/\[STATUS:(ACTIVE|SCHEDULED|CLOSED)\]/g, '')
            .trim() + ' [STATUS:CLOSED]';

          const { error: closeError } = await supabase
            .from('attendance_sessions')
            .update({ batch: updatedBatch })
            .eq('id', session.id);

          if (closeError) {
            return {
              data: null,
              error: closeError.message,
            };
          }
        }
      }

      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          date: params.date,
          topic: params.topic.trim(),
          batch: batchWithMetadata,
        })
        .select('*, attendance_records(*)')
        .single();

      if (error || !data) {
        return {
          data: null,
          error: error?.message || 'Could not create session.',
        };
      }

      return {
        data: parseSessionRow(data),
        error: null,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error creating session.';

      return { data: null, error: message };
    }
  },

  /**
   * Admin closes a session early.
   */
  async closeSession(
    sessionId: string
  ): Promise<ServiceResult<AttendanceSession>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: null,
        error: 'Database service is not configured.',
      };
    }

    try {
      const { data: currentSession, error: fetchError } =
        await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

      if (fetchError || !currentSession) {
        return {
          data: null,
          error: fetchError?.message || 'Session not found.',
        };
      }

      const rawBatch =
        currentSession.batch || 'Skill Lab Active Cohort';

      const updatedBatch =
        rawBatch
          .replace(/\[STATUS:(ACTIVE|SCHEDULED|CLOSED)\]/g, '')
          .trim() + ' [STATUS:CLOSED]';

      const { data: updatedData, error: updateError } =
        await supabase
          .from('attendance_sessions')
          .update({ batch: updatedBatch })
          .eq('id', sessionId)
          .select('*, attendance_records(*)')
          .single();

      if (updateError || !updatedData) {
        return {
          data: null,
          error: updateError?.message || 'Could not close session.',
        };
      }

      return {
        data: parseSessionRow(updatedData),
        error: null,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to close session.';

      return { data: null, error: message };
    }
  },

  /**
   * Submit a student's attendance response.
   */
  async submitStudentResponse(params: {
    sessionId: string;
    studentId: string;
    studentName?: string;
    studentNumber?: string;
    status: AttendanceStatus;
  }): Promise<ServiceResult<AttendanceRecord>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: null,
        error: 'Database service is currently unavailable.',
      };
    }

    try {
      const { data: sessionData, error: sessionError } =
        await supabase
          .from('attendance_sessions')
          .select('id, date, topic, batch')
          .eq('id', params.sessionId)
          .single();

      if (sessionError || !sessionData) {
        return {
          data: null,
          error: 'Attendance session was not found.',
        };
      }

      const rawBatch = sessionData.batch || '';
      const times = extractSessionTimes(rawBatch);

      const status = getStatusFromRow(
        sessionData,
        times.startTime,
        times.endTime,
        times.hasTimeMetadata
      );

      if (status === 'SCHEDULED') {
        return {
          data: null,
          error: 'Attendance has not started yet.',
        };
      }

      if (status !== 'ACTIVE') {
        return {
          data: null,
          error: 'This attendance session has already ended.',
        };
      }

      const { data: existingRecord, error: existingError } =
        await supabase
          .from('attendance_records')
          .select('id, status')
          .eq('session_id', params.sessionId)
          .eq('student_id', params.studentId)
          .maybeSingle();

      if (existingError) {
        return {
          data: null,
          error: 'Could not check your existing attendance.',
        };
      }

      // Do not allow a second submission to overwrite the first.
      if (existingRecord) {
        return {
          data: null,
          error: 'You have already submitted attendance for this session.',
        };
      }

      const { data: insertedRecord, error: insertError } =
        await supabase
          .from('attendance_records')
          .insert({
            session_id: params.sessionId,
            student_id: params.studentId,
            status: params.status,
          })
          .select()
          .single();

      if (insertError || !insertedRecord) {
        return {
          data: null,
          error:
            insertError?.message ||
            'Unable to submit attendance. Please try again.',
        };
      }

      return {
        data: {
          id: insertedRecord.id,
          session_id: params.sessionId,
          date: sessionData.date,
          topic: sessionData.topic,
          status: params.status,
          student_id: params.studentId,
          student_name: params.studentName,
          student_number: params.studentNumber,
          submitted_at: insertedRecord.created_at
            ? new Date(insertedRecord.created_at).toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' }
              )
            : undefined,
        },
        error: null,
      };
    } catch {
      return {
        data: null,
        error: 'Unable to submit attendance. Please try again.',
      };
    }
  },

  /**
   * Fetch the authenticated student's attendance transcript.
   */
  async getStudentAttendance(
    studentId: string
  ): Promise<ServiceResult<{
    percentage: number;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    records: AttendanceRecord[];
    activeSession: AttendanceSession | null;
    activeSessionResponse: AttendanceStatus | null;
  }>> {
    const sessionsResult = await this.getSessions();

    if (sessionsResult.error) {
      return {
        data: null,
        error: sessionsResult.error,
      };
    }

    const sessions = sessionsResult.data || [];
    const records: AttendanceRecord[] = [];

    let activeSession: AttendanceSession | null = null;
    let activeSessionResponse: AttendanceStatus | null = null;

    for (const session of sessions) {
      if (session.status === 'ACTIVE' && !activeSession) {
        activeSession = session;
      }

      const record = (session.records || []).find(
        (item) => item.student_id === studentId
      );

      if (!record) continue;

      if (session.id === activeSession?.id) {
        activeSessionResponse = record.status;
      }

      records.push({
        id: `${session.id}-${studentId}`,
        session_id: session.id,
        date: session.date,
        topic: session.topic,
        status: record.status,
        student_id: studentId,
        student_name: record.student_name,
        student_number: record.student_number,
        submitted_at: record.submitted_at,
      });
    }

    const totalSessions = records.length;

    const presentCount = records.filter(
      (record) => record.status === 'PRESENT'
    ).length;

    const absentCount = records.filter(
      (record) => record.status === 'ABSENT'
    ).length;

    const lateCount = records.filter(
      (record) => record.status === 'LATE'
    ).length;

    const weightedPresent = presentCount + lateCount * 0.5;

    const percentage =
      totalSessions > 0
        ? Math.round((weightedPresent / totalSessions) * 100)
        : 100;

    return {
      data: {
        percentage,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        records,
        activeSession,
        activeSessionResponse,
      },
      error: null,
    };
  },
};
