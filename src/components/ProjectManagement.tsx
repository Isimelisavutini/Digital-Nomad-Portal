import React, { useState } from 'react';
import { ProjectItem, ProjectTask, ProjectStatus, CostConfiguration } from '../types';
import { formatCurrencyValue } from '../constants';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  X,
  Waves,
} from 'lucide-react';

interface ProjectManagementProps {
  projects: ProjectItem[];
  tasks: ProjectTask[];
  onAddProject: (newProject: Omit<ProjectItem, 'id'>) => void;
  onAddTask: (newTask: Omit<ProjectTask, 'id'>) => void;
  onToggleTaskStatus: (taskId: string) => void;
  config: CostConfiguration;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  tasks,
  onAddProject,
  onAddTask,
  onToggleTaskStatus,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New Project Form State
  const [newProjName, setNewProjName] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjCategory, setNewProjCategory] = useState('Full-Stack Cloud');
  const [newProjBudgetFjd, setNewProjBudgetFjd] = useState('25000');
  const [newProjDeadline, setNewProjDeadline] = useState('2026-12-31');
  const [newProjDescription, setNewProjDescription] = useState('');

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState(projects[0]?.id || '');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Isimeli G.');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskHours, setNewTaskHours] = useState('8');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-11-20');

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // KPI Computations
  const totalBudgetFjd = projects.reduce((acc, p) => acc + p.budgetFjd, 0);
  const totalBudgetUsd = projects.reduce((acc, p) => acc + p.budgetUsd, 0);
  const totalActualSpendFjd = projects.reduce((acc, p) => acc + p.actualSpendFjd, 0);
  const totalActualSpendUsd = projects.reduce((acc, p) => acc + p.actualSpendUsd, 0);
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const budgetDisplay = formatCurrencyValue(totalBudgetFjd, totalBudgetUsd, config.currencyMode);
  const spendDisplay = formatCurrencyValue(totalActualSpendFjd, totalActualSpendUsd, config.currencyMode);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const bFjd = parseFloat(newProjBudgetFjd) || 10000;
    const bUsd = bFjd / config.exchangeRateFJD;

    onAddProject({
      name: newProjName.trim(),
      client: newProjClient.trim() || 'Internal Client',
      category: newProjCategory,
      status: 'planning',
      budgetFjd: bFjd,
      budgetUsd: bUsd,
      actualSpendFjd: 0,
      actualSpendUsd: 0,
      deadline: newProjDeadline,
      progressPercent: 0,
      team: ['Isimeli G.'],
      description: newProjDescription.trim() || 'Pacific digital transformation project.',
    });

    setNewProjName('');
    setNewProjClient('');
    setNewProjDescription('');
    setShowNewProjectModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      projectId: newTaskProjectId,
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee,
      priority: newTaskPriority,
      status: 'todo',
      estimatedHours: parseFloat(newTaskHours) || 8,
      dueDate: newTaskDueDate,
    });

    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EAF4F8] text-[#164B91] border border-[#164B91]/25">In Progress</span>;
      case 'review':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#6941A5]/10 text-[#6941A5] border border-[#6941A5]/25">Review</span>;
      case 'completed':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#D9F1EC] text-[#19A7A0] border border-[#19A7A0]/30">Completed</span>;
      case 'planning':
      default:
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F5F7FA] text-[#24344D]/70 border border-[#D9F1EC]">Planning</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Metrics */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#164B91]" />
              <h2 className="text-base font-bold text-[#24344D] font-heading flex items-center gap-1.5">
                <span>Projects Management</span>
                <Waves className="w-4 h-4 text-[#19A7A0]" />
              </h2>
            </div>
            <p className="text-xs text-[#24344D]/70 mt-1">
              Active client delivery pipelines, sprint milestones, and budget vs actual delivery spend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#D9F1EC] text-[#164B91] hover:bg-[#EAF4F8] transition-all shadow-2xs cursor-pointer font-heading"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs transition-all cursor-pointer font-heading"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Pipeline Projects</span>
              <Layers className="w-4 h-4 text-[#164B91]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#164B91]">{projects.length}</div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              {projects.filter((p) => p.status === 'in_progress').length} In Active Production
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Committed Budget</span>
              <DollarSign className="w-4 h-4 text-[#19A7A0]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#24344D] truncate">
              {budgetDisplay.primary}
            </div>
            {budgetDisplay.secondary && (
              <div className="text-[11px] text-[#24344D]/60 font-mono mt-0.5">{budgetDisplay.secondary}</div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Actual Spend to Date</span>
              <TrendingUp className="w-4 h-4 text-[#F28C28]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#24344D] truncate">
              {spendDisplay.primary}
            </div>
            {spendDisplay.secondary && (
              <div className="text-[11px] text-[#24344D]/60 font-mono mt-0.5">{spendDisplay.secondary}</div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Sprint Completion</span>
              <CheckCircle2 className="w-4 h-4 text-[#6941A5]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#6941A5]">{taskCompletionRate}%</div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              {completedTasksCount} of {tasks.length} deliverables closed
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#D9F1EC] shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FA] rounded-lg border border-[#D9F1EC]">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-heading ${
              activeTab === 'projects'
                ? 'bg-[#164B91] text-white shadow-xs'
                : 'text-[#24344D]/70 hover:text-[#164B91]'
            }`}
          >
            Projects Overview ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-heading ${
              activeTab === 'tasks'
                ? 'bg-[#164B91] text-white shadow-xs'
                : 'text-[#24344D]/70 hover:text-[#164B91]'
            }`}
          >
            Sprint Tasks ({tasks.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#24344D]/40" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[#24344D] placeholder:text-[#24344D]/40 focus:outline-none focus:bg-white focus:border-[#164B91]"
            />
          </div>

          {/* Status filter */}
          {activeTab === 'projects' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg py-1.5 px-2.5 text-xs text-[#24344D] focus:outline-none focus:border-[#164B91]"
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: PROJECTS GRID */}
      {activeTab === 'projects' && (
        <div>
          {filteredProjects.length === 0 ? (
            <div className="bg-white border border-dashed border-[#D9F1EC] rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4F8] text-[#164B91] flex items-center justify-center mx-auto text-xl font-mono">
                ▣
              </div>
              <h3 className="text-sm font-bold text-[#24344D] font-heading">
                No projects found
              </h3>
              <p className="text-xs text-[#24344D]/60 max-w-sm mx-auto">
                No projects match your active search or filters. Create a project to start planning deliverables and budgets.
              </p>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 rounded-lg bg-[#164B91] text-white text-xs font-bold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
              >
                + Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => {
                const bFjdStr = `$${proj.budgetFjd.toLocaleString()} FJD`;
                const sFjdStr = `$${proj.actualSpendFjd.toLocaleString()} FJD`;
                const spendRatio = Math.round((proj.actualSpendFjd / (proj.budgetFjd || 1)) * 100);

                return (
                  <div
                    key={proj.id}
                    className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-4 hover:border-[#164B91]/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#24344D] font-heading">{proj.name}</h3>
                        </div>
                        <p className="text-xs text-[#24344D]/60 mt-0.5 font-medium">{proj.client}</p>
                      </div>
                      <div>{getStatusBadge(proj.status)}</div>
                    </div>

                    <p className="text-xs text-[#24344D]/80 leading-relaxed line-clamp-2">
                      {proj.description}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#24344D]/70 font-heading">Milestone Progress:</span>
                        <span className="font-mono font-bold text-[#164B91]">
                          {proj.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-[#D9F1EC] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#164B91] h-full rounded-full transition-all duration-300"
                          style={{ width: `${proj.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial comparison & team */}
                    <div className="pt-3 border-t border-[#EAF4F8] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[11px] text-[#24344D]/50 font-heading">Budget vs Actual Spend</div>
                        <div className="font-mono font-semibold text-[#24344D]">
                          {sFjdStr} <span className="text-[#24344D]/50 font-normal">/ {bFjdStr}</span>{' '}
                          <span className="text-[10px] text-[#F28C28] font-bold font-mono">({spendRatio}%)</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <div className="text-[11px] text-[#24344D]/50 flex items-center gap-1 justify-end font-heading">
                          <Calendar className="w-3 h-3" /> Deadline
                        </div>
                        <div className="font-mono font-medium text-[#24344D]">{proj.deadline}</div>
                      </div>
                    </div>

                    {/* Team Avatars */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#24344D]/60">
                      <span className="font-mono bg-[#EAF4F8] text-[#164B91] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#164B91]/15">
                        {proj.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#164B91]" />
                        <span>{proj.team.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TASKS SPRINT BOARD */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#24344D] font-heading">Sprint Backlog & Deliverables</h3>
            <span className="text-xs text-[#24344D]/60">
              Click circle to mark completed or active
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#D9F1EC] rounded-xl bg-[#F5F7FA]/50 space-y-2">
              <p className="text-xs text-[#24344D]/60">No sprint tasks created yet.</p>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#164B91] text-white text-xs font-semibold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
              >
                + Add First Sprint Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EAF4F8]">
              {tasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    onClick={() => onToggleTaskStatus(task.id)}
                    className="py-3 px-2 flex items-start gap-3 hover:bg-[#F5F7FA] rounded-lg cursor-pointer transition-colors"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[#24344D]/40 hover:text-[#164B91] transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#19A7A0]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-stone-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? 'line-through text-[#24344D]/40' : 'text-[#24344D]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                              task.priority === 'high'
                                ? 'bg-[#F28C28]/15 text-[#F28C28] border border-[#F28C28]/30'
                                : task.priority === 'medium'
                                ? 'bg-[#6941A5]/10 text-[#6941A5] border border-[#6941A5]/25'
                                : 'bg-[#D9F1EC] text-[#164B91] border border-[#19A7A0]/30'
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-[11px] font-mono text-[#24344D]/60">
                            {task.estimatedHours}h
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-[11px] text-[#24344D]/60">
                        <span className="text-[#164B91] font-semibold">{project?.name || 'General Task'}</span>
                        <span>·</span>
                        <span>Assignee: {task.assignee}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24344D]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#D9F1EC] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF4F8] pb-3">
              <h3 className="text-sm font-bold text-[#24344D] font-heading">Create New Project</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-[#24344D]/50 hover:text-[#24344D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#24344D] font-semibold mb-1 font-heading">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Pacific Logistics AI Platform"
                  className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#24344D] font-semibold mb-1 font-heading">Client Name</label>
                <input
                  type="text"
                  required
                  value={newProjClient}
                  onChange={(e) => setNewProjClient(e.target.value)}
                  placeholder="e.g. Fiji Ports Terminal Ltd"
                  className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#24344D] font-semibold mb-1 font-heading">Budget (FJD)</label>
                  <input
                    type="number"
                    value={newProjBudgetFjd}
                    onChange={(e) => setNewProjBudgetFjd(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] font-mono focus:outline-none focus:border-[#164B91] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#24344D] font-semibold mb-1 font-heading">Target Deadline</label>
                  <input
                    type="date"
                    value={newProjDeadline}
                    onChange={(e) => setNewProjDeadline(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#24344D] font-semibold mb-1 font-heading">Category</label>
                <select
                  value={newProjCategory}
                  onChange={(e) => setNewProjCategory(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91]"
                >
                  <option value="Full-Stack Cloud">Full-Stack Cloud</option>
                  <option value="AI & Mobile">AI & Mobile</option>
                  <option value="ERP & Bookkeeping">ERP & Bookkeeping</option>
                  <option value="Security & DevOps">Security & DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-[#24344D] font-semibold mb-1 font-heading">Description</label>
                <textarea
                  rows={2}
                  value={newProjDescription}
                  onChange={(e) => setNewProjDescription(e.target.value)}
                  placeholder="High level scope and architecture requirements..."
                  className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#D9F1EC] text-[#24344D]/70 hover:bg-[#F5F7FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#164B91] text-white font-semibold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24344D]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#D9F1EC] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF4F8] pb-3">
              <h3 className="text-sm font-bold text-[#24344D] font-heading">Add Sprint Task</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-[#24344D]/50 hover:text-[#24344D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#24344D] font-semibold mb-1 font-heading">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Configure Supabase RLS and storage buckets"
                  className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#24344D] font-semibold mb-1 font-heading">Related Project</label>
                <select
                  value={newTaskProjectId}
                  onChange={(e) => setNewTaskProjectId(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#24344D] font-semibold mb-1 font-heading">Assignee</label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#24344D] font-semibold mb-1 font-heading">Est. Hours</label>
                  <input
                    type="number"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] font-mono focus:outline-none focus:border-[#164B91] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#24344D] font-semibold mb-1 font-heading">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#24344D] font-semibold mb-1 font-heading">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#D9F1EC] rounded-lg p-2 text-[#24344D] focus:outline-none focus:border-[#164B91] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#D9F1EC] text-[#24344D]/70 hover:bg-[#F5F7FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#164B91] text-white font-semibold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
