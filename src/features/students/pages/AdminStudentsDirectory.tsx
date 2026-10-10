import React, { useState } from 'react';
import { StudentProgressSummary } from '../../../types';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Users,
  Search,
  Mail,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminStudentsDirectoryProps {
  students: StudentProgressSummary[];
}

export function AdminStudentsDirectory({ students }: AdminStudentsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_TRACK' | 'NEEDS_ATTENTION'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressSummary | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            Enrolled Cohort Roster (Fall 2026)
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory & Performance</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Live overview of enrolled students ({students.length}). Track module completion, attendance thresholds, and identify students requiring academic assistance.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student name, ID or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('ON_TRACK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ON_TRACK' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            On Track ({students.filter(s => s.status === 'ON_TRACK').length})
          </button>
          <button
            onClick={() => setStatusFilter('NEEDS_ATTENTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'NEEDS_ATTENTION' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Needs Attention ({students.filter(s => s.status === 'NEEDS_ATTENTION').length})
          </button>
        </div>
      </div>

      {/* 30 Students Data Table */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-5">Student ID</th>
                <th className="py-3 px-5">Current Module</th>
                <th className="py-3 px-5">Overall Progress</th>
                <th className="py-3 px-5">Attendance</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {students.length === 0
                      ? 'No enrolled students found in the cohort yet.'
                      : 'No students match your search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar_url}
                          alt={student.student_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.student_name}</p>
                          <p className="text-[11px] text-slate-500">{student.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-600 font-medium">{student.student_number}</td>
                    <td className="py-3 px-5 text-slate-800 font-medium">{student.current_module}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{student.overall_progress}%</span>
                        <span className="text-[11px] text-slate-400">({student.completed_lessons_count}/{student.total_lessons_count})</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`font-bold ${student.attendance_percentage >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {student.attendance_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <Badge
                        variant={student.status === 'ON_TRACK' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {student.status === 'ON_TRACK' ? 'On Track' : 'Needs Review'}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                        className="text-xs"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.student_name}
          subtitle={`Student Profile: ${selectedStudent.student_number}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedStudent.avatar_url}
                alt={selectedStudent.student_name}
                className="w-12 h-12 rounded-full object-cover border border-slate-300"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedStudent.student_name}</h4>
                <p className="text-xs text-slate-500">{selectedStudent.student_email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedStudent.status === 'ON_TRACK' ? 'success' : 'warning'} size="sm">
                    {selectedStudent.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400">Active: {selectedStudent.last_active}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Overall Progress</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">{selectedStudent.overall_progress}%</span>
                <span className="text-[11px] text-slate-400">{selectedStudent.completed_lessons_count} lessons completed</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Lab Attendance</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">{selectedStudent.attendance_percentage}%</span>
                <span className="text-[11px] text-slate-400">5 sessions logged</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500 block font-semibold">Active Unit</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedStudent.current_module}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
