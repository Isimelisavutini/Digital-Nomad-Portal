import type {
  Employee, LeaveRequest, LeaveBalance, AttendanceRecord,
  Candidate, JobOpening, OnboardingTask, PayrollRun, Payslip,
  PerformanceGoal, PerformanceReview, TrainingCourse, TrainingAssignment,
  Department
} from './types';

export const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Engineering', headId: 'e1' },
  { id: 'd2', name: 'Human Resources', headId: 'e2' },
  { id: 'd3', name: 'Finance', headId: 'e3' },
  { id: 'd4', name: 'Sales', headId: 'e4' },
  { id: 'd5', name: 'Operations', headId: 'e5' },
  { id: 'd6', name: 'Marketing' },
];

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export const EMPLOYEES: Employee[] = [
  {
    id: 'e1', employeeCode: 'EMP-001', firstName: 'James', lastName: 'Wilson',
    email: 'james.wilson@company.com', phone: '+1 555-0101',
    department: 'Engineering', position: 'Engineering Manager',
    joinDate: '2022-03-15', status: 'active', employmentType: 'full_time',
    salary: 95000, bankAccount: '****4521', taxId: 'TX-8821',
    emergencyContact: 'Sarah Wilson', emergencyPhone: '+1 555-0102',
    address: '142 Maple Ave, Austin, TX', avatarColor: AVATAR_COLORS[0],
  },
  {
    id: 'e2', employeeCode: 'EMP-002', firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.sharma@company.com', phone: '+1 555-0201',
    department: 'Human Resources', position: 'HR Manager',
    joinDate: '2021-08-01', status: 'active', employmentType: 'full_time',
    salary: 78000, bankAccount: '****8832', taxId: 'TX-3341',
    emergencyContact: 'Raj Sharma', emergencyPhone: '+1 555-0202',
    address: '88 Oak St, Austin, TX', avatarColor: AVATAR_COLORS[1],
  },
  {
    id: 'e3', employeeCode: 'EMP-003', firstName: 'Michael', lastName: 'Chen',
    email: 'michael.chen@company.com', phone: '+1 555-0301',
    department: 'Finance', position: 'Finance Director',
    joinDate: '2020-01-20', status: 'active', employmentType: 'full_time',
    salary: 110000, bankAccount: '****2219', taxId: 'TX-5512',
    emergencyContact: 'Lisa Chen', emergencyPhone: '+1 555-0302',
    address: '55 Cedar Ln, Round Rock, TX', avatarColor: AVATAR_COLORS[2],
  },
  {
    id: 'e4', employeeCode: 'EMP-004', firstName: 'Aisha', lastName: 'Patel',
    email: 'aisha.patel@company.com', phone: '+1 555-0401',
    department: 'Sales', position: 'Sales Lead',
    joinDate: '2023-02-10', status: 'active', employmentType: 'full_time',
    salary: 72000, bankAccount: '****6674', taxId: 'TX-7789',
    emergencyContact: 'Dev Patel', emergencyPhone: '+1 555-0402',
    address: '210 Pine Rd, Austin, TX', avatarColor: AVATAR_COLORS[3],
  },
  {
    id: 'e5', employeeCode: 'EMP-005', firstName: 'Carlos', lastName: 'Rivera',
    email: 'carlos.rivera@company.com', phone: '+1 555-0501',
    department: 'Operations', position: 'Operations Manager',
    joinDate: '2022-11-05', status: 'active', employmentType: 'full_time',
    salary: 82000, bankAccount: '****3390', taxId: 'TX-1122',
    emergencyContact: 'Maria Rivera', emergencyPhone: '+1 555-0502',
    address: '17 Birch Ct, Cedar Park, TX', avatarColor: AVATAR_COLORS[4],
  },
  {
    id: 'e6', employeeCode: 'EMP-006', firstName: 'Emily', lastName: 'Nguyen',
    email: 'emily.nguyen@company.com', phone: '+1 555-0601',
    department: 'Engineering', position: 'Senior Developer', managerId: 'e1',
    joinDate: '2023-05-22', status: 'active', employmentType: 'full_time',
    salary: 88000, bankAccount: '****5518', taxId: 'TX-4455',
    emergencyContact: 'Tom Nguyen', emergencyPhone: '+1 555-0602',
    address: '90 Elm Blvd, Austin, TX', avatarColor: AVATAR_COLORS[5],
  },
  {
    id: 'e7', employeeCode: 'EMP-007', firstName: 'David', lastName: 'Okoye',
    email: 'david.okoye@company.com', phone: '+1 555-0701',
    department: 'Engineering', position: 'Developer', managerId: 'e1',
    joinDate: '2024-01-15', status: 'probation', employmentType: 'full_time',
    salary: 70000, bankAccount: '****9921', taxId: 'TX-6677',
    emergencyContact: 'Grace Okoye', emergencyPhone: '+1 555-0702',
    address: '33 Willow Way, Austin, TX', avatarColor: AVATAR_COLORS[6],
  },
  {
    id: 'e8', employeeCode: 'EMP-008', firstName: 'Sofia', lastName: 'Martinez',
    email: 'sofia.martinez@company.com', phone: '+1 555-0801',
    department: 'Marketing', position: 'Marketing Specialist',
    joinDate: '2023-09-01', status: 'active', employmentType: 'full_time',
    salary: 62000, bankAccount: '****1144', taxId: 'TX-8899',
    emergencyContact: 'Luis Martinez', emergencyPhone: '+1 555-0802',
    address: '71 Spruce Dr, Austin, TX', avatarColor: AVATAR_COLORS[7],
  },
  {
    id: 'e9', employeeCode: 'EMP-009', firstName: 'Liam', lastName: 'Brooks',
    email: 'liam.brooks@company.com', phone: '+1 555-0901',
    department: 'Sales', position: 'Account Executive', managerId: 'e4',
    joinDate: '2024-03-18', status: 'active', employmentType: 'full_time',
    salary: 58000, bankAccount: '****7755', taxId: 'TX-2233',
    emergencyContact: 'Nina Brooks', emergencyPhone: '+1 555-0902',
    address: '12 Ash St, Austin, TX', avatarColor: AVATAR_COLORS[0],
  },
  {
    id: 'e10', employeeCode: 'EMP-010', firstName: 'Hannah', lastName: 'Kim',
    email: 'hannah.kim@company.com', phone: '+1 555-1001',
    department: 'Human Resources', position: 'HR Coordinator', managerId: 'e2',
    joinDate: '2024-06-01', status: 'probation', employmentType: 'full_time',
    salary: 52000, bankAccount: '****3366', taxId: 'TX-9900',
    emergencyContact: 'Jin Kim', emergencyPhone: '+1 555-1002',
    address: '45 Poplar Ave, Austin, TX', avatarColor: AVATAR_COLORS[1],
  },
];

export const LEAVE_BALANCES: LeaveBalance[] = EMPLOYEES.map(e => ({
  employeeId: e.id,
  annual: 18,
  sick: 10,
  unpaid: 5,
  maternity: e.id === 'e8' || e.id === 'e10' ? 90 : 0,
  other: 3,
}));

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr1', employeeId: 'e6', leaveType: 'annual',
    startDate: '2026-11-10', endDate: '2026-11-12', days: 3,
    reason: 'Family trip', status: 'approved', requestedAt: '2026-10-20',
    reviewedBy: 'e1', reviewedAt: '2026-10-21',
  },
  {
    id: 'lr2', employeeId: 'e7', leaveType: 'sick',
    startDate: '2026-11-05', endDate: '2026-11-05', days: 1,
    reason: 'Flu', status: 'approved', requestedAt: '2026-11-05',
    reviewedBy: 'e1', reviewedAt: '2026-11-05',
  },
  {
    id: 'lr3', employeeId: 'e9', leaveType: 'annual',
    startDate: '2026-11-20', endDate: '2026-11-24', days: 5,
    reason: 'Vacation', status: 'pending', requestedAt: '2026-11-01',
  },
  {
    id: 'lr4', employeeId: 'e4', leaveType: 'annual',
    startDate: '2026-12-22', endDate: '2026-12-31', days: 7,
    reason: 'Year-end holiday', status: 'pending', requestedAt: '2026-11-03',
  },
  {
    id: 'lr5', employeeId: 'e8', leaveType: 'sick',
    startDate: '2026-11-04', endDate: '2026-11-04', days: 1,
    reason: 'Medical appointment', status: 'approved', requestedAt: '2026-11-03',
    reviewedBy: 'e2', reviewedAt: '2026-11-03',
  },
];

function generateAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date('2026-11-06');
  for (let d = 0; d < 10; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().slice(0, 10);
    EMPLOYEES.filter(e => e.status === 'active' || e.status === 'probation').forEach((emp, idx) => {
      const isLeave = LEAVE_REQUESTS.some(
        lr => lr.employeeId === emp.id && lr.status === 'approved' &&
          dateStr >= lr.startDate && dateStr <= lr.endDate
      );
      if (isLeave) {
        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id, date: dateStr, status: 'on_leave',
        });
        return;
      }
      const late = idx % 7 === d % 5;
      records.push({
        id: `att-${emp.id}-${dateStr}`,
        employeeId: emp.id, date: dateStr,
        clockIn: late ? '09:22' : '08:55',
        clockOut: '17:30',
        status: late ? 'late' : 'present',
        hoursWorked: late ? 8.1 : 8.5,
      });
    });
  }
  return records;
}

export const ATTENDANCE: AttendanceRecord[] = generateAttendance();

export const JOB_OPENINGS: JobOpening[] = [
  {
    id: 'j1', title: 'Full-Stack Developer', department: 'Engineering',
    location: 'Austin, TX (Hybrid)', type: 'full_time', status: 'open',
    openings: 2, postedAt: '2026-10-15',
    description: 'Build and maintain our core product platform using React and Node.js.',
  },
  {
    id: 'j2', title: 'Sales Development Representative', department: 'Sales',
    location: 'Austin, TX', type: 'full_time', status: 'open',
    openings: 1, postedAt: '2026-10-28',
    description: 'Generate and qualify leads for the enterprise sales team.',
  },
  {
    id: 'j3', title: 'HR Intern', department: 'Human Resources',
    location: 'Austin, TX', type: 'intern', status: 'open',
    openings: 1, postedAt: '2026-11-01',
    description: 'Support recruitment, onboarding, and HR operations.',
  },
];

export const CANDIDATES: Candidate[] = [
  {
    id: 'c1', firstName: 'Alex', lastName: 'Turner', email: 'alex.t@email.com',
    phone: '+1 555-2001', position: 'Full-Stack Developer', department: 'Engineering',
    status: 'interview', appliedAt: '2026-10-20', source: 'LinkedIn',
    notes: 'Strong React background. Interview scheduled.',
  },
  {
    id: 'c2', firstName: 'Maya', lastName: 'Singh', email: 'maya.s@email.com',
    phone: '+1 555-2002', position: 'Full-Stack Developer', department: 'Engineering',
    status: 'screening', appliedAt: '2026-10-25', source: 'Company Website',
  },
  {
    id: 'c3', firstName: 'Jordan', lastName: 'Lee', email: 'jordan.l@email.com',
    phone: '+1 555-2003', position: 'Sales Development Representative', department: 'Sales',
    status: 'offer', appliedAt: '2026-10-18', source: 'Referral',
    notes: 'Offer sent. Awaiting response.',
  },
  {
    id: 'c4', firstName: 'Taylor', lastName: 'Reed', email: 'taylor.r@email.com',
    phone: '+1 555-2004', position: 'HR Intern', department: 'Human Resources',
    status: 'applied', appliedAt: '2026-11-02', source: 'University Portal',
  },
  {
    id: 'c5', firstName: 'Casey', lastName: 'Morgan', email: 'casey.m@email.com',
    phone: '+1 555-2005', position: 'Full-Stack Developer', department: 'Engineering',
    status: 'rejected', appliedAt: '2026-10-12', source: 'LinkedIn',
    notes: 'Skills mismatch.',
  },
];

export const ONBOARDING_TASKS: OnboardingTask[] = [
  { id: 'ot1', employeeId: 'e7', title: 'Sign employment contract', assignee: 'employee', status: 'completed', dueDate: '2024-01-15', completedAt: '2024-01-15' },
  { id: 'ot2', employeeId: 'e7', title: 'Complete tax & bank forms', assignee: 'employee', status: 'completed', dueDate: '2024-01-16', completedAt: '2024-01-16' },
  { id: 'ot3', employeeId: 'e7', title: 'Provision laptop & accounts', assignee: 'it', status: 'completed', dueDate: '2024-01-17', completedAt: '2024-01-17' },
  { id: 'ot4', employeeId: 'e7', title: 'Team introduction meeting', assignee: 'manager', status: 'completed', dueDate: '2024-01-18', completedAt: '2024-01-18' },
  { id: 'ot5', employeeId: 'e7', title: 'Complete security training', assignee: 'employee', status: 'completed', dueDate: '2024-01-22', completedAt: '2024-01-20' },
  { id: 'ot6', employeeId: 'e10', title: 'Sign employment contract', assignee: 'employee', status: 'completed', dueDate: '2024-06-01', completedAt: '2024-06-01' },
  { id: 'ot7', employeeId: 'e10', title: 'Complete tax & bank forms', assignee: 'employee', status: 'completed', dueDate: '2024-06-02', completedAt: '2024-06-02' },
  { id: 'ot8', employeeId: 'e10', title: 'Provision laptop & accounts', assignee: 'it', status: 'completed', dueDate: '2024-06-03', completedAt: '2024-06-03' },
  { id: 'ot9', employeeId: 'e10', title: 'HR orientation session', assignee: 'hr', status: 'in_progress', dueDate: '2024-06-05' },
  { id: 'ot10', employeeId: 'e10', title: 'Complete compliance training', assignee: 'employee', status: 'pending', dueDate: '2024-06-10' },
];

export const PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr1', period: 'October 2026', runDate: '2026-10-28',
    employeeCount: 10, totalGross: 77500, totalDeductions: 18600, totalNet: 58900, status: 'paid',
  },
  {
    id: 'pr2', period: 'September 2026', runDate: '2026-09-28',
    employeeCount: 10, totalGross: 77500, totalDeductions: 18600, totalNet: 58900, status: 'paid',
  },
];

export const PERFORMANCE_GOALS: PerformanceGoal[] = [
  { id: 'g1', employeeId: 'e6', title: 'Ship Q4 feature set', description: 'Deliver the new reporting module to production', targetDate: '2026-12-15', status: 'in_progress', progress: 65 },
  { id: 'g2', employeeId: 'e6', title: 'Improve code review turnaround', description: 'Average review time under 24 hours', targetDate: '2026-11-30', status: 'in_progress', progress: 80 },
  { id: 'g3', employeeId: 'e7', title: 'Complete onboarding project', description: 'Finish first production feature under guidance', targetDate: '2026-12-01', status: 'in_progress', progress: 40 },
  { id: 'g4', employeeId: 'e9', title: 'Close 8 new deals', description: 'Q4 sales target', targetDate: '2026-12-31', status: 'in_progress', progress: 50 },
  { id: 'g5', employeeId: 'e4', title: 'Grow team pipeline 30%', description: 'Increase qualified leads QoQ', targetDate: '2026-12-31', status: 'in_progress', progress: 55 },
];

export const PERFORMANCE_REVIEWS: PerformanceReview[] = [
  {
    id: 'rv1', employeeId: 'e6', reviewerId: 'e1', period: 'H1 2026',
    selfRating: 4, managerRating: 4, overallRating: 4,
    strengths: 'Strong technical delivery and collaboration.',
    improvements: 'Take more ownership of cross-team initiatives.',
    status: 'finalized', createdAt: '2026-07-15',
  },
];

export const TRAINING_COURSES: TrainingCourse[] = [
  { id: 'tc1', title: 'Workplace Security Awareness', category: 'Compliance', durationHours: 2, description: 'Mandatory annual security training.', mandatory: true },
  { id: 'tc2', title: 'Effective Communication', category: 'Soft Skills', durationHours: 4, description: 'Improve written and verbal communication.', mandatory: false },
  { id: 'tc3', title: 'React Advanced Patterns', category: 'Technical', durationHours: 8, description: 'Hooks, performance, and architecture.', mandatory: false },
  { id: 'tc4', title: 'Manager Essentials', category: 'Leadership', durationHours: 6, description: 'For new and aspiring managers.', mandatory: false },
  { id: 'tc5', title: 'Data Privacy & GDPR Basics', category: 'Compliance', durationHours: 1.5, description: 'Handling personal data responsibly.', mandatory: true },
];

export const TRAINING_ASSIGNMENTS: TrainingAssignment[] = [
  { id: 'ta1', courseId: 'tc1', employeeId: 'e7', assignedAt: '2024-01-20', dueDate: '2024-02-01', completedAt: '2024-01-25', status: 'completed' },
  { id: 'ta2', courseId: 'tc5', employeeId: 'e7', assignedAt: '2024-01-20', dueDate: '2024-02-01', completedAt: '2024-01-26', status: 'completed' },
  { id: 'ta3', courseId: 'tc1', employeeId: 'e10', assignedAt: '2024-06-05', dueDate: '2024-06-20', status: 'in_progress' },
  { id: 'ta4', courseId: 'tc3', employeeId: 'e6', assignedAt: '2026-10-01', dueDate: '2026-11-15', status: 'assigned' },
  { id: 'ta5', courseId: 'tc4', employeeId: 'e4', assignedAt: '2026-09-15', dueDate: '2026-11-30', status: 'in_progress' },
];

export function getEmployeeName(id: string, employees: Employee[] = EMPLOYEES): string {
  const e = employees.find(x => x.id === id);
  return e ? `${e.firstName} ${e.lastName}` : 'Unknown';
}

export function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
