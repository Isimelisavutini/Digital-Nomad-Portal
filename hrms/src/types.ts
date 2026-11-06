export type NavSection =
  | 'dashboard'
  | 'employees'
  | 'recruitment'
  | 'onboarding'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'training'
  | 'settings';

export type EmployeeStatus = 'active' | 'probation' | 'on_leave' | 'suspended' | 'terminated';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  managerId?: string;
  joinDate: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  salary: number;
  bankAccount?: string;
  taxId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  avatarColor: string;
}

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'compassionate' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  unpaid: number;
  maternity: number;
  other: number;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day' | 'on_leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  notes?: string;
}

export type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: CandidateStatus;
  appliedAt: string;
  source: string;
  notes?: string;
  resumeUrl?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: EmploymentType;
  status: 'open' | 'closed' | 'on_hold';
  openings: number;
  postedAt: string;
  description: string;
}

export type OnboardingTaskStatus = 'pending' | 'in_progress' | 'completed';

export interface OnboardingTask {
  id: string;
  employeeId: string;
  title: string;
  assignee: 'hr' | 'manager' | 'employee' | 'it';
  status: OnboardingTaskStatus;
  dueDate: string;
  completedAt?: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  runDate: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: 'draft' | 'processed' | 'paid';
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  gross: number;
  tax: number;
  otherDeductions: number;
  net: number;
  status: 'generated' | 'paid';
}

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';
export type ReviewStatus = 'draft' | 'submitted' | 'reviewed' | 'finalized';

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetDate: string;
  status: GoalStatus;
  progress: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  selfRating?: number;
  managerRating?: number;
  overallRating?: number;
  strengths?: string;
  improvements?: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  durationHours: number;
  description: string;
  mandatory: boolean;
}

export interface TrainingAssignment {
  id: string;
  courseId: string;
  employeeId: string;
  assignedAt: string;
  dueDate: string;
  completedAt?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
}

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}
