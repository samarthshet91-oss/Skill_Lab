import { ModuleItem, LearningResource, StudentProgressSummary, AttendanceRecord, AttendanceSession, UserProfile } from '../types';

export const ADMIN_USERS: UserProfile[] = [
  {
    id: 'admin-01',
    email: 'admin.lead@skilllab.edu',
    full_name: 'Dr. Marcus Vance',
    role: 'ADMIN',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cohort: 'Lead Instructor'
  },
  {
    id: 'admin-02',
    email: 'sarah.lin@skilllab.edu',
    full_name: 'Prof. Sarah Lin',
    role: 'ADMIN',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    cohort: 'Lab Director'
  }
];

export const INITIAL_STUDENTS: StudentProgressSummary[] = [
  { student_id: 'std-01', student_name: 'Alex Rivera', student_email: 'alex.rivera@skilllab.edu', student_number: 'SL-2026-001', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80', overall_progress: 68, attendance_percentage: 95, current_module: 'APIs & JSON', completed_lessons_count: 22, total_lessons_count: 36, last_active: '15 mins ago', status: 'ON_TRACK' },
  { student_id: 'std-02', student_name: 'Priya Sharma', student_email: 'priya.s@skilllab.edu', student_number: 'SL-2026-002', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', overall_progress: 82, attendance_percentage: 100, current_module: 'Databases', completed_lessons_count: 26, total_lessons_count: 36, last_active: '1 hour ago', status: 'ON_TRACK' },
  { student_id: 'std-03', student_name: 'Liam Chen', student_email: 'liam.chen@skilllab.edu', student_number: 'SL-2026-003', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', overall_progress: 74, attendance_percentage: 92, current_module: 'APIs & JSON', completed_lessons_count: 24, total_lessons_count: 36, last_active: '3 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-04', student_name: 'Elena Rostova', student_email: 'elena.r@skilllab.edu', student_number: 'SL-2026-004', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', overall_progress: 45, attendance_percentage: 78, current_module: 'Project Creation', completed_lessons_count: 14, total_lessons_count: 36, last_active: 'Yesterday', status: 'NEEDS_ATTENTION' },
  { student_id: 'std-05', student_name: 'David O\'Connor', student_email: 'david.oc@skilllab.edu', student_number: 'SL-2026-005', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', overall_progress: 70, attendance_percentage: 88, current_module: 'APIs & JSON', completed_lessons_count: 23, total_lessons_count: 36, last_active: '2 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-06', student_name: 'Aisha Al-Mansoor', student_email: 'aisha.m@skilllab.edu', student_number: 'SL-2026-006', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', overall_progress: 89, attendance_percentage: 96, current_module: 'Databases', completed_lessons_count: 29, total_lessons_count: 36, last_active: 'Just now', status: 'ON_TRACK' },
  { student_id: 'std-07', student_name: 'Mateo Morales', student_email: 'mateo.m@skilllab.edu', student_number: 'SL-2026-007', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80', overall_progress: 58, attendance_percentage: 84, current_module: 'Project Creation', completed_lessons_count: 18, total_lessons_count: 36, last_active: '4 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-08', student_name: 'Zoe Washington', student_email: 'zoe.w@skilllab.edu', student_number: 'SL-2026-008', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80', overall_progress: 65, attendance_percentage: 91, current_module: 'APIs & JSON', completed_lessons_count: 21, total_lessons_count: 36, last_active: '5 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-09', student_name: 'Lucas Silva', student_email: 'lucas.s@skilllab.edu', student_number: 'SL-2026-009', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', overall_progress: 52, attendance_percentage: 80, current_module: 'Git & GitHub', completed_lessons_count: 16, total_lessons_count: 36, last_active: 'Yesterday', status: 'ON_TRACK' },
  { student_id: 'std-10', student_name: 'Hana Tanaka', student_email: 'hana.t@skilllab.edu', student_number: 'SL-2026-010', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', overall_progress: 78, attendance_percentage: 96, current_module: 'Databases', completed_lessons_count: 25, total_lessons_count: 36, last_active: '30 mins ago', status: 'ON_TRACK' },
  { student_id: 'std-11', student_name: 'Benjamin Ross', student_email: 'ben.ross@skilllab.edu', student_number: 'SL-2026-011', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', overall_progress: 63, attendance_percentage: 89, current_module: 'APIs & JSON', completed_lessons_count: 20, total_lessons_count: 36, last_active: '6 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-12', student_name: 'Fatima Zahra', student_email: 'fatima.z@skilllab.edu', student_number: 'SL-2026-012', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80', overall_progress: 85, attendance_percentage: 98, current_module: 'Databases', completed_lessons_count: 27, total_lessons_count: 36, last_active: '2 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-13', student_name: 'Gabriel Santos', student_email: 'gabriel.s@skilllab.edu', student_number: 'SL-2026-013', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', overall_progress: 41, attendance_percentage: 72, current_module: 'Git & GitHub', completed_lessons_count: 12, total_lessons_count: 36, last_active: '2 days ago', status: 'NEEDS_ATTENTION' },
  { student_id: 'std-14', student_name: 'Chloe Dubois', student_email: 'chloe.d@skilllab.edu', student_number: 'SL-2026-014', avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80', overall_progress: 72, attendance_percentage: 93, current_module: 'APIs & JSON', completed_lessons_count: 23, total_lessons_count: 36, last_active: '3 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-15', student_name: 'Tariq Hassan', student_email: 'tariq.h@skilllab.edu', student_number: 'SL-2026-015', avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80', overall_progress: 69, attendance_percentage: 90, current_module: 'APIs & JSON', completed_lessons_count: 22, total_lessons_count: 36, last_active: '1 hour ago', status: 'ON_TRACK' },
  { student_id: 'std-16', student_name: 'Kavita Patel', student_email: 'kavita.p@skilllab.edu', student_number: 'SL-2026-016', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', overall_progress: 77, attendance_percentage: 95, current_module: 'Databases', completed_lessons_count: 25, total_lessons_count: 36, last_active: '4 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-17', student_name: 'Ethan Wright', student_email: 'ethan.w@skilllab.edu', student_number: 'SL-2026-017', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80', overall_progress: 60, attendance_percentage: 86, current_module: 'Project Creation', completed_lessons_count: 19, total_lessons_count: 36, last_active: 'Yesterday', status: 'ON_TRACK' },
  { student_id: 'std-18', student_name: 'Sofia Gomez', student_email: 'sofia.g@skilllab.edu', student_number: 'SL-2026-018', avatar_url: 'https://images.unsplash.com/photo-1534751516642-a171ed27e289?w=120&auto=format&fit=crop&q=80', overall_progress: 81, attendance_percentage: 94, current_module: 'Databases', completed_lessons_count: 26, total_lessons_count: 36, last_active: '1 hour ago', status: 'ON_TRACK' },
  { student_id: 'std-19', student_name: 'Noah Campbell', student_email: 'noah.c@skilllab.edu', student_number: 'SL-2026-019', avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&auto=format&fit=crop&q=80', overall_progress: 55, attendance_percentage: 82, current_module: 'Git & GitHub', completed_lessons_count: 17, total_lessons_count: 36, last_active: '5 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-20', student_name: 'Ananya Rao', student_email: 'ananya.r@skilllab.edu', student_number: 'SL-2026-020', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', overall_progress: 91, attendance_percentage: 100, current_module: 'Databases', completed_lessons_count: 30, total_lessons_count: 36, last_active: 'Just now', status: 'ON_TRACK' },
  { student_id: 'std-21', student_name: 'Samuel Kim', student_email: 'samuel.k@skilllab.edu', student_number: 'SL-2026-021', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', overall_progress: 64, attendance_percentage: 88, current_module: 'APIs & JSON', completed_lessons_count: 20, total_lessons_count: 36, last_active: '4 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-22', student_name: 'Maya Lin', student_email: 'maya.lin@skilllab.edu', student_number: 'SL-2026-022', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80', overall_progress: 73, attendance_percentage: 92, current_module: 'APIs & JSON', completed_lessons_count: 23, total_lessons_count: 36, last_active: '2 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-23', student_name: 'Oliver Scott', student_email: 'oliver.s@skilllab.edu', student_number: 'SL-2026-023', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', overall_progress: 49, attendance_percentage: 75, current_module: 'Git & GitHub', completed_lessons_count: 15, total_lessons_count: 36, last_active: '2 days ago', status: 'NEEDS_ATTENTION' },
  { student_id: 'std-24', student_name: 'Layla Nasser', student_email: 'layla.n@skilllab.edu', student_number: 'SL-2026-024', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', overall_progress: 80, attendance_percentage: 97, current_module: 'Databases', completed_lessons_count: 26, total_lessons_count: 36, last_active: '1 hour ago', status: 'ON_TRACK' },
  { student_id: 'std-25', student_name: 'Isaac Newton Jr.', student_email: 'isaac.n@skilllab.edu', student_number: 'SL-2026-025', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', overall_progress: 76, attendance_percentage: 91, current_module: 'APIs & JSON', completed_lessons_count: 24, total_lessons_count: 36, last_active: '3 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-26', student_name: 'Camila Rodriguez', student_email: 'camila.r@skilllab.edu', student_number: 'SL-2026-026', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', overall_progress: 67, attendance_percentage: 89, current_module: 'APIs & JSON', completed_lessons_count: 21, total_lessons_count: 36, last_active: '6 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-27', student_name: 'Daniel Park', student_email: 'daniel.p@skilllab.edu', student_number: 'SL-2026-027', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', overall_progress: 59, attendance_percentage: 85, current_module: 'Project Creation', completed_lessons_count: 18, total_lessons_count: 36, last_active: 'Yesterday', status: 'ON_TRACK' },
  { student_id: 'std-28', student_name: 'Amina Idris', student_email: 'amina.i@skilllab.edu', student_number: 'SL-2026-028', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80', overall_progress: 88, attendance_percentage: 99, current_module: 'Databases', completed_lessons_count: 28, total_lessons_count: 36, last_active: '30 mins ago', status: 'ON_TRACK' },
  { student_id: 'std-29', student_name: 'Felix Meyer', student_email: 'felix.m@skilllab.edu', student_number: 'SL-2026-029', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', overall_progress: 62, attendance_percentage: 87, current_module: 'APIs & JSON', completed_lessons_count: 20, total_lessons_count: 36, last_active: '5 hours ago', status: 'ON_TRACK' },
  { student_id: 'std-30', student_name: 'Zara Qureshi', student_email: 'zara.q@skilllab.edu', student_number: 'SL-2026-030', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', overall_progress: 79, attendance_percentage: 94, current_module: 'Databases', completed_lessons_count: 25, total_lessons_count: 36, last_active: '1 hour ago', status: 'ON_TRACK' }
];

export const INITIAL_MODULES: ModuleItem[] = [
  {
    id: 'mod-1',
    title: '1. Modern Development Foundation',
    description: 'Master contemporary web paradigms, TypeScript mechanics, modern runtime environments, and engineering practices.',
    order_index: 1,
    status: 'COMPLETED',
    lesson_count: 4,
    completed_lessons: 4,
    locked_by_admin: false,
    lessons: [
      { id: 'les-101', module_id: 'mod-1', title: 'ESNext Syntax & Type Systems', description: 'Deep dive into strict typing, interfaces, and unions.', duration_minutes: 45, order_index: 1, is_completed: true },
      { id: 'les-102', module_id: 'mod-1', title: 'Modern Component Architectures', description: 'Functional component patterns, state lifecycles, and hooks.', duration_minutes: 50, order_index: 2, is_completed: true },
      { id: 'les-103', module_id: 'mod-1', title: 'Vite & Bundling Mechanics', description: 'ES modules, HMR internals, and asset pipelines.', duration_minutes: 40, order_index: 3, is_completed: true },
      { id: 'les-104', module_id: 'mod-1', title: 'Modern CSS & Tailwind Foundations', description: 'Utility-first layout, design tokens, and fluid typography.', duration_minutes: 35, order_index: 4, is_completed: true }
    ]
  },
  {
    id: 'mod-2',
    title: '2. Git & GitHub',
    description: 'Collaborative development, branch management, merge strategies, pull requests, and automated CI workflows.',
    order_index: 2,
    status: 'COMPLETED',
    lesson_count: 4,
    completed_lessons: 4,
    locked_by_admin: false,
    lessons: [
      { id: 'les-201', module_id: 'mod-2', title: 'Git Internals & Trees', description: 'Blobs, trees, commits, and detached HEAD states explained.', duration_minutes: 40, order_index: 1, is_completed: true },
      { id: 'les-202', module_id: 'mod-2', title: 'Branching & Rebase Workflows', description: 'Feature branches, interactive rebase, and squash merging.', duration_minutes: 55, order_index: 2, is_completed: true },
      { id: 'les-203', module_id: 'mod-2', title: 'Resolving Merge Conflicts', description: 'Three-way merge resolution and conflict prevention tactics.', duration_minutes: 45, order_index: 3, is_completed: true },
      { id: 'les-204', module_id: 'mod-2', title: 'GitHub PR Reviews & Actions', description: 'Peer reviews, status checks, and automated linting workflows.', duration_minutes: 50, order_index: 4, is_completed: true }
    ]
  },
  {
    id: 'mod-3',
    title: '3. Project Creation',
    description: 'Scaffolding full-stack architectures, folder organization, configuration discipline, and linting standards.',
    order_index: 3,
    status: 'COMPLETED',
    lesson_count: 4,
    completed_lessons: 4,
    locked_by_admin: false,
    lessons: [
      { id: 'les-301', module_id: 'mod-3', title: 'Monorepos vs Polyrepos', description: 'Evaluating codebase topologies and workspace setups.', duration_minutes: 40, order_index: 1, is_completed: true },
      { id: 'les-302', module_id: 'mod-3', title: 'Linting, Prettier & Typecheck Rules', description: 'Strict ESLint rules and automated pre-commit hooks.', duration_minutes: 45, order_index: 2, is_completed: true },
      { id: 'les-303', module_id: 'mod-3', title: 'Environment Variables & Secrets Management', description: 'Dotenv discipline, .env.example, and server-side secret boundaries.', duration_minutes: 50, order_index: 3, is_completed: true },
      { id: 'les-304', module_id: 'mod-3', title: 'Project Scaffolding Lab', description: 'Hands-on creation of a production Vite + TypeScript application.', duration_minutes: 60, order_index: 4, is_completed: true }
    ]
  },
  {
    id: 'mod-4',
    title: '4. APIs & JSON',
    description: 'RESTful API consumption, HTTP status codes, error boundaries, request optimization, and typed schema validation.',
    order_index: 4,
    status: 'IN PROGRESS',
    lesson_count: 5,
    completed_lessons: 3,
    locked_by_admin: false,
    lessons: [
      { id: 'les-401', module_id: 'mod-4', title: 'HTTP/2, Headers & Status Codes', description: 'Semantics of GET, POST, PUT, DELETE, PATCH, 401 vs 403.', duration_minutes: 45, order_index: 1, is_completed: true },
      { id: 'les-402', module_id: 'mod-4', title: 'Fetch API, Axios & AbortController', description: 'Clean async requests with cancellation and timeout handling.', duration_minutes: 50, order_index: 2, is_completed: true },
      { id: 'les-403', module_id: 'mod-4', title: 'JSON Schema Validation with Zod', description: 'Runtime type validation and input sanitization.', duration_minutes: 55, order_index: 3, is_completed: true },
      { id: 'les-404', module_id: 'mod-4', title: 'Error Boundaries & Optimistic UI', description: 'Graceful failure degradation and instant UI updates.', duration_minutes: 50, order_index: 4, is_completed: false },
      { id: 'les-405', module_id: 'mod-4', title: 'Practical Lab: Consuming College APIs', description: 'Build an interactive query client consuming student records.', duration_minutes: 60, order_index: 5, is_completed: false }
    ]
  },
  {
    id: 'mod-5',
    title: '5. Databases',
    description: 'Relational data modeling, PostgreSQL fundamentals, Supabase integration, indexes, and Row Level Security.',
    order_index: 5,
    status: 'UNLOCKED',
    lesson_count: 5,
    completed_lessons: 0,
    locked_by_admin: false,
    lessons: [
      { id: 'les-501', module_id: 'mod-5', title: 'Relational Schema Design & Normalization', description: 'Primary keys, foreign keys, 1:N and N:M relationships.', duration_minutes: 50, order_index: 1, is_completed: false },
      { id: 'les-502', module_id: 'mod-5', title: 'PostgreSQL Essentials & Joins', description: 'Filtering, grouping, aggregating, and index optimization.', duration_minutes: 60, order_index: 2, is_completed: false },
      { id: 'les-503', module_id: 'mod-5', title: 'Supabase Client & Auth Sessions', description: 'Connecting the client, handling JWTs, and secure queries.', duration_minutes: 55, order_index: 3, is_completed: false },
      { id: 'les-504', module_id: 'mod-5', title: 'Row Level Security (RLS) Deep Dive', description: 'Designing robust auth.uid() security policies.', duration_minutes: 50, order_index: 4, is_completed: false },
      { id: 'les-505', module_id: 'mod-5', title: 'Supabase Storage Buckets & Policies', description: 'Managing binary assets and public vs private download URLs.', duration_minutes: 45, order_index: 5, is_completed: false }
    ]
  },
  {
    id: 'mod-6',
    title: '6. AI Development',
    description: 'Integrating Large Language Models, prompt engineering, structured outputs, and streaming server-side endpoints.',
    order_index: 6,
    status: 'LOCKED',
    lesson_count: 5,
    completed_lessons: 0,
    locked_by_admin: true,
    lessons: [
      { id: 'les-601', module_id: 'mod-6', title: 'LLM Fundamentals & Tokenization', description: 'Context windows, tokens, temperature, and sampling params.', duration_minutes: 45, order_index: 1, is_completed: false },
      { id: 'les-602', module_id: 'mod-6', title: 'Gemini 2.5 Flash SDK Integration', description: 'Server-side API calls with @google/genai TypeScript SDK.', duration_minutes: 50, order_index: 2, is_completed: false },
      { id: 'les-603', module_id: 'mod-6', title: 'System Instructions & Few-Shot Prompts', description: 'Steering LLM responses for educational accuracy.', duration_minutes: 45, order_index: 3, is_completed: false },
      { id: 'les-604', module_id: 'mod-6', title: 'Streaming Responses to React UIs', description: 'ReadableStream and SSE handling in frontend interfaces.', duration_minutes: 55, order_index: 4, is_completed: false },
      { id: 'les-605', module_id: 'mod-6', title: 'Defensive Prompting & Guardrails', description: 'Preventing prompt injection and handling API errors.', duration_minutes: 40, order_index: 5, is_completed: false }
    ]
  },
  {
    id: 'mod-7',
    title: '7. RAG & AI Applications',
    description: 'Retrieval Augmented Generation, vector embeddings, chunking strategies, and grounded semantic search.',
    order_index: 7,
    status: 'LOCKED',
    lesson_count: 5,
    completed_lessons: 0,
    locked_by_admin: true,
    lessons: [
      { id: 'les-701', module_id: 'mod-7', title: 'Why RAG? Hallucinations & Context Injection', description: 'Overcoming context limitations through external retrieval.', duration_minutes: 45, order_index: 1, is_completed: false },
      { id: 'les-702', module_id: 'mod-7', title: 'Embeddings & Vector Cosine Similarity', description: 'Transforming text into high-dimensional semantic vectors.', duration_minutes: 50, order_index: 2, is_completed: false },
      { id: 'les-703', module_id: 'mod-7', title: 'Document Chunking Strategies for PDF/Notes', description: 'Recursive character splitting and metadata preservation.', duration_minutes: 45, order_index: 3, is_completed: false },
      { id: 'les-704', module_id: 'mod-7', title: 'Building a SkillLab Document Retriever', description: 'Connecting college course notes with Gemini query synthesis.', duration_minutes: 60, order_index: 4, is_completed: false },
      { id: 'les-705', module_id: 'mod-7', title: 'Evaluating Retrieval Precision & Recall', description: 'Benchmarking grounding accuracy against student prompts.', duration_minutes: 45, order_index: 5, is_completed: false }
    ]
  },
  {
    id: 'mod-8',
    title: '8. Final Project',
    description: 'Capstone end-to-end full-stack application development, peer review, automated testing, and production deployment.',
    order_index: 8,
    status: 'LOCKED',
    lesson_count: 4,
    completed_lessons: 0,
    locked_by_admin: true,
    lessons: [
      { id: 'les-801', module_id: 'mod-8', title: 'Capstone Architecture & Spec Submission', description: 'Drafting project requirements and data models.', duration_minutes: 60, order_index: 1, is_completed: false },
      { id: 'les-802', module_id: 'mod-8', title: 'Full-Stack Implementation Sprint', description: 'Integrating Supabase, React, and Gemini into your capstone.', duration_minutes: 90, order_index: 2, is_completed: false },
      { id: 'les-803', module_id: 'mod-8', title: 'Security Audit & RLS Verification', description: 'Checking permission policies and securing public endpoints.', duration_minutes: 50, order_index: 3, is_completed: false },
      { id: 'les-804', module_id: 'mod-8', title: 'Production Deployment & Demo Day', description: 'Deploying to Vercel and presenting to the academic committee.', duration_minutes: 60, order_index: 4, is_completed: false }
    ]
  }
];

export const INITIAL_RESOURCES: LearningResource[] = [
  {
    id: 'res-01',
    title: 'Modern TypeScript Core Cheatsheet',
    description: 'Quick reference for generic types, utility types, conditional types, and keyof operator.',
    file_type: 'CHEATSHEET',
    file_size: '420 KB',
    file_path: 'resources/ts-core-cheatsheet.pdf',
    module_id: 'mod-1',
    module_title: '1. Modern Development Foundation',
    download_count: 58,
    created_at: '2026-09-12',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-02',
    title: 'Git Branching & Rebase Visual Guide',
    description: 'Comprehensive PDF diagram depicting rebase vs merge, fast-forwarding, and git cherry-pick.',
    file_type: 'PDF',
    file_size: '880 KB',
    file_path: 'resources/git-branching-guide.pdf',
    module_id: 'mod-2',
    module_title: '2. Git & GitHub',
    download_count: 84,
    created_at: '2026-09-14',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-03',
    title: 'Git Interactive Merge Conflict Starter Kit',
    description: 'ZIP archive containing a dummy Git repo with pre-staged conflicts for student practice.',
    file_type: 'ZIP',
    file_size: '640 KB',
    file_path: 'resources/merge-conflict-kit.zip',
    module_id: 'mod-2',
    module_title: '2. Git & GitHub',
    download_count: 72,
    created_at: '2026-09-15',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-04',
    title: 'Vite + React 19 Starter Scaffolding',
    description: 'Production template with Tailwind CSS v4, TypeScript path aliases, and lint configuration.',
    file_type: 'CODE',
    file_size: '210 KB',
    file_path: 'resources/vite-react19-starter.zip',
    module_id: 'mod-3',
    module_title: '3. Project Creation',
    download_count: 91,
    created_at: '2026-09-17',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-05',
    title: 'Environment Variables & .env Security Standards',
    description: 'College engineering document outlining secret leakage prevention and runtime configs.',
    file_type: 'NOTES',
    file_size: '340 KB',
    file_path: 'resources/env-vars-guidelines.pdf',
    module_id: 'mod-3',
    module_title: '3. Project Creation',
    download_count: 65,
    created_at: '2026-09-18',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-06',
    title: 'HTTP Status Codes & REST Conventions',
    description: 'Two-page printable reference sheet for REST headers, idempotency, and error codes.',
    file_type: 'CHEATSHEET',
    file_size: '310 KB',
    file_path: 'resources/http-rest-cheatsheet.pdf',
    module_id: 'mod-4',
    module_title: '4. APIs & JSON',
    download_count: 99,
    created_at: '2026-09-20',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-07',
    title: 'Zod Validation Schema Samples',
    description: 'Collection of TypeScript snippets demonstrating API payload parsing and safe error maps.',
    file_type: 'CODE',
    file_size: '95 KB',
    file_path: 'resources/zod-validation-snippets.ts',
    module_id: 'mod-4',
    module_title: '4. APIs & JSON',
    download_count: 77,
    created_at: '2026-09-21',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-08',
    title: 'PostgreSQL Relational Design Master Notes',
    description: 'Comprehensive course notes covering 1st through 3rd normal forms and foreign key indexes.',
    file_type: 'NOTES',
    file_size: '720 KB',
    file_path: 'resources/postgres-design-notes.pdf',
    module_id: 'mod-5',
    module_title: '5. Databases',
    download_count: 63,
    created_at: '2026-09-22',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-09',
    title: 'Supabase RLS Policy Design Matrix',
    description: 'Security rules patterns for multi-tenant, student, and admin permission boundaries.',
    file_type: 'PDF',
    file_size: '510 KB',
    file_path: 'resources/supabase-rls-matrix.pdf',
    module_id: 'mod-5',
    module_title: '5. Databases',
    download_count: 54,
    created_at: '2026-09-23',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-10',
    title: 'SQL Joins & Aggregations Practice Exercises',
    description: 'Hands-on practice problems with expected output queries for database lab sessions.',
    file_type: 'CHEATSHEET',
    file_size: '480 KB',
    file_path: 'resources/sql-joins-practice.pdf',
    module_id: 'mod-5',
    module_title: '5. Databases',
    download_count: 46,
    created_at: '2026-09-23',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-11',
    title: 'Gemini 2.5 Flash API Implementation Boilerplate',
    description: 'Clean Node.js/TypeScript server wrapper calling @google/genai with streaming hooks.',
    file_type: 'CODE',
    file_size: '180 KB',
    file_path: 'resources/gemini-api-boilerplate.zip',
    module_id: 'mod-6',
    module_title: '6. AI Development',
    download_count: 42,
    created_at: '2026-09-24',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-12',
    title: 'Prompt Engineering for Software Engineers',
    description: 'PDF guide on system prompts, few-shot examples, JSON output schemas, and guardrails.',
    file_type: 'PDF',
    file_size: '920 KB',
    file_path: 'resources/prompt-engineering-handbook.pdf',
    module_id: 'mod-6',
    module_title: '6. AI Development',
    download_count: 38,
    created_at: '2026-09-24',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-13',
    title: 'Vector Embeddings & Cosine Math Fundamentals',
    description: 'Visual notes explaining high-dimensional embeddings and vector distances.',
    file_type: 'NOTES',
    file_size: '610 KB',
    file_path: 'resources/embeddings-explained.pdf',
    module_id: 'mod-7',
    module_title: '7. RAG & AI Applications',
    download_count: 29,
    created_at: '2026-09-25',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-14',
    title: 'Document Chunking & Markdown Splitting Script',
    description: 'Python and TypeScript helper utilities for recursive chunking of college notes.',
    file_type: 'CODE',
    file_size: '120 KB',
    file_path: 'resources/chunking-utilities.zip',
    module_id: 'mod-7',
    module_title: '7. RAG & AI Applications',
    download_count: 31,
    created_at: '2026-09-25',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-15',
    title: 'Capstone Project Proposal Template',
    description: 'Standard college template for architecture diagrams, schema definition, and milestones.',
    file_type: 'PDF',
    file_size: '350 KB',
    file_path: 'resources/capstone-template.pdf',
    module_id: 'mod-8',
    module_title: '8. Final Project',
    download_count: 24,
    created_at: '2026-09-26',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-16',
    title: 'Vercel Deployment Checklist & Production Headers',
    description: 'Checklist for SSL, CSP headers, serverless timeout limits, and environment sync.',
    file_type: 'CHEATSHEET',
    file_size: '290 KB',
    file_path: 'resources/vercel-deployment-checklist.pdf',
    module_id: 'mod-8',
    module_title: '8. Final Project',
    download_count: 19,
    created_at: '2026-09-26',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-17',
    title: 'CSS Grid & Flexbox Complete Visual Reference',
    description: 'Printable layout cheat sheet for responsive SaaS interfaces.',
    file_type: 'CHEATSHEET',
    file_size: '560 KB',
    file_path: 'resources/flex-grid-reference.pdf',
    module_id: 'mod-1',
    module_title: '1. Modern Development Foundation',
    download_count: 73,
    created_at: '2026-09-13',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-18',
    title: 'Web Security: CORS, CSRF & XSS Defenses',
    description: 'College security guide detailing header configuration and input sanitization.',
    file_type: 'NOTES',
    file_size: '830 KB',
    file_path: 'resources/web-security-notes.pdf',
    module_id: 'mod-4',
    module_title: '4. APIs & JSON',
    download_count: 59,
    created_at: '2026-09-21',
    author_name: 'Dr. Marcus Vance'
  },
  {
    id: 'res-19',
    title: 'Async/Await & Promise Combinators Masterclass',
    description: 'Code examples for Promise.all, Promise.allSettled, race, and retry backoffs.',
    file_type: 'CODE',
    file_size: '75 KB',
    file_path: 'resources/async-promise-combinators.ts',
    module_id: 'mod-1',
    module_title: '1. Modern Development Foundation',
    download_count: 67,
    created_at: '2026-09-14',
    author_name: 'Prof. Sarah Lin'
  },
  {
    id: 'res-20',
    title: 'Final Capstone Rubric & Evaluation Criteria',
    description: 'Scoring breakdown across code quality, database RLS security, UX design, and presentation.',
    file_type: 'PDF',
    file_size: '410 KB',
    file_path: 'resources/capstone-rubric.pdf',
    module_id: 'mod-8',
    module_title: '8. Final Project',
    download_count: 22,
    created_at: '2026-09-26',
    author_name: 'Dr. Marcus Vance'
  }
];

export const UPCOMING_SESSION = {
  date: 'Wednesday, Sept 30, 2026',
  time: '10:00 AM - 12:00 PM',
  topic: 'Supabase Storage Buckets & Realtime Subscriptions',
  instructor: 'Dr. Marcus Vance',
  location: 'Lab Room 402 / Virtual Stream',
  status: 'SCHEDULED'
};
