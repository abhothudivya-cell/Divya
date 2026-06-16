import React, { useState, useMemo } from 'react';
import { Task, PriorityLevel } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Tag, 
  Calendar,
  X,
  Filter,
  CheckCircle,
  FolderMinus
} from 'lucide-react';

interface TaskViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onEditTask: (updatedTask: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export default function TaskView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
}: TaskViewProps) {
  // UI filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  // Add / Edit task state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskEstHours, setTaskEstHours] = useState('');

  // Extract unique subjects for the filter
  const uniqueSubjects = useMemo(() => {
    const subjects = tasks
      .map(t => t.subject?.trim())
      .filter((s): s is string => !!s);
    return Array.from(new Set(subjects));
  }, [tasks]);

  // Handle adding task
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const formattedDueDate = taskDueDate || new Date().toISOString().split('T')[0];

    if (editingTaskId) {
      onEditTask({
        id: editingTaskId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        dueDate: formattedDueDate,
        completed: tasks.find(t => t.id === editingTaskId)?.completed || false,
        subject: taskSubject.trim() || undefined,
        estimatedHours: taskEstHours ? Number(taskEstHours) : undefined,
      });
      setEditingTaskId(null);
    } else {
      onAddTask({
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        dueDate: formattedDueDate,
        subject: taskSubject.trim() || undefined,
        estimatedHours: taskEstHours ? Number(taskEstHours) : undefined,
      });
      setShowAddForm(false);
    }

    // Reset fields
    resetForm();
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskSubject('');
    setTaskEstHours('');
  };

  // Start editing task
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate);
    setTaskSubject(task.subject || '');
    setTaskEstHours(task.estimatedHours ? String(task.estimatedHours) : '');
    setShowAddForm(true);
    // Scroll to top or form container
    const formElement = document.getElementById('task-form-panel');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setShowAddForm(false);
    resetForm();
  };

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    const matchesTab = activeTab === 'completed' 
      ? tasks.filter(t => t.completed)
      : tasks.filter(t => !t.completed);

    const matchesSearch = matchesTab.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesPriority = matchesSearch.filter(t => 
      priorityFilter === 'all' ? true : t.priority === priorityFilter
    );

    const matchesSubject = matchesPriority.filter(t => 
      subjectFilter === 'all' ? true : t.subject === subjectFilter
    );

    // Sorting logic
    return [...matchesSubject].sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate || '9999-12-31';
        const dateB = b.dueDate || '9999-12-31';
        return dateA.localeCompare(dateB);
      } else {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
    });
  }, [tasks, activeTab, searchQuery, priorityFilter, subjectFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Task Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Task Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, prioritize, and check off your academic assignments and milestones.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setEditingTaskId(null); resetForm(); }}
            id="btn-trigger-add-task"
            className="flex items-center justify-center gap-1.5 self-start bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </button>
        )}
      </div>

      {/* Task Creation / Editing Panel */}
      {showAddForm && (
        <div 
          id="task-form-panel"
          className="bg-indigo-50/15 dark:bg-slate-900 border-2 border-indigo-100/50 dark:border-indigo-950/40 rounded-2xl p-5 md:p-6 shadow-sm transition-all animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">
              {editingTaskId ? 'Edit Task Details' : 'Create New Study Task'}
            </h3>
            <button 
              onClick={handleCancelEdit} 
              id="btn-cancel-task-form"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chemistry Assignment 3, Calculus Review..."
                  value={taskTitle}
                  id="task-title-input"
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Subject / Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chemistry, Calculus, History"
                  value={taskSubject}
                  id="task-subj-input"
                  onChange={e => setTaskSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  id="task-date-input"
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Priority level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as PriorityLevel[]).map(level => (
                    <button
                      key={level}
                      type="button"
                      id={`priority-btn-${level}`}
                      onClick={() => setTaskPriority(level)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                        taskPriority === level
                          ? level === 'high'
                            ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-150 dark:shadow-none'
                            : level === 'medium'
                            ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-md shadow-amber-50 dark:shadow-none'
                            : 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                          : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 dark:border-slate-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estimated study hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 1.5, 3"
                  value={taskEstHours}
                  id="task-hours-input"
                  onChange={e => setTaskEstHours(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description / Quick notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add details, link references, study plan..."
                  value={taskDescription}
                  id="task-desc-input"
                  onChange={e => setTaskDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-task"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors shadow-md cursor-pointer"
              >
                {editingTaskId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        
        {/* Toggle active vs completed tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('active')}
            id="tab-active-tasks"
            className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Active Tasks ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            id="tab-completed-tasks"
            className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Completed Tasks ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search study tasks..."
              value={searchQuery}
              id="search-task-query"
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-sm transition-all"
            />
          </div>

          {/* Priority filter */}
          <div className="sm:col-span-2.5 flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={priorityFilter}
              id="filter-task-priority"
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full bg-transparent focus:outline-none py-2 text-slate-600 dark:text-slate-300 pr-1 text-sm border-0 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>

          {/* Subject filter */}
          <div className="sm:col-span-2.5 flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm">
            <Tag className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={subjectFilter}
              id="filter-task-subject"
              onChange={e => setSubjectFilter(e.target.value)}
              className="w-full bg-transparent focus:outline-none py-2 text-slate-600 dark:text-slate-300 pr-1 text-sm border-0 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Sorting filter */}
          <div className="sm:col-span-2 flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm">
            <select
              value={sortBy}
              id="sort-task-by"
              onChange={e => setSortBy(e.target.value as 'dueDate' | 'priority')}
              className="w-full bg-transparent focus:outline-none py-2 text-slate-600 dark:text-slate-300 pr-1 text-sm border-0 cursor-pointer font-medium"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List Content */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <FolderMinus className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">No tasks matching conditions</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              Try modifying your selectors, checking your search queries, or creating a fresh assignment task!
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`group p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  task.completed ? 'opacity-85' : ''
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Selector Ring */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    id={`toggle-task-${task.id}`}
                    name={`toggle-${task.id}`}
                    aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                    className={`mt-1 h-5.5 w-5.5 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/10'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-semibold text-base leading-tight ${
                        task.completed 
                          ? 'text-slate-450 dark:text-slate-500 line-through' 
                          : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {task.title}
                      </h3>

                      {/* Badges row */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'high'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-450'
                      }`}>
                        {task.priority}
                      </span>

                      {task.subject && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          {task.subject}
                        </span>
                      )}

                      {task.estimatedHours && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {task.estimatedHours}h est.
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className={`text-sm ${
                        task.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'
                      } max-w-2xl`}>
                        {task.description}
                      </p>
                    )}

                    {/* Timeline Date */}
                    <div className="flex items-center gap-3.5 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due date: <span className="font-semibold text-slate-550 dark:text-slate-300">{task.dueDate || 'Unspecified'}</span>
                      </span>

                      {isOverdue && (
                        <span className="flex items-center gap-1.5 text-red-550 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex md:flex-col lg:flex-row items-center gap-1.5 self-end md:self-center">
                  <button
                    onClick={() => handleStartEdit(task)}
                    id={`edit-task-btn-${task.id}`}
                    name={`edit-${task.id}`}
                    aria-label={`Edit task ${task.title}`}
                    className="p-2 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="Edit task parameters"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    id={`delete-task-btn-${task.id}`}
                    name={`delete-${task.id}`}
                    aria-label={`Delete task ${task.title}`}
                    className="p-2 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/40 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="Delete task completely"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
