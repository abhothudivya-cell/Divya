import { useState, useEffect, useMemo } from 'react';
import { Task, StudyGoal, StudySession, Note, ScheduleItem } from './types';
import DashboardView from './components/DashboardView';
import TaskView from './components/TaskView';
import PlannerView from './components/PlannerView';
import TimerView from './components/TimerView';
import NotesView from './components/NotesView';
import ProgressView from './components/ProgressView';
import { 
  BookOpen, 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Timer, 
  Notebook, 
  BarChart2, 
  Sun, 
  Moon,
  Sparkles,
  Flame
} from 'lucide-react';

// INITIAL DATA SEEDS (for a premium immediate user experience)
const TODAY_STR = new Date().toISOString().split('T')[0];
const YESTERDAY_STR = (() => {
  const yes = new Date();
  yes.setDate(yes.getDate() - 1);
  return yes.toISOString().split('T')[0];
})();

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review Organic Chemistry Lecture Notes',
    description: 'Read slides on carbon hybridization. Bring study sheet to class.',
    priority: 'high',
    dueDate: TODAY_STR,
    completed: false,
    subject: 'Chemistry',
  },
  {
    id: 't2',
    title: 'Calculus Exercises Set 4',
    description: 'Solve questions 1 through 10. Check results against manual.',
    priority: 'medium',
    dueDate: TODAY_STR,
    completed: true,
    subject: 'Mathematics',
    estimatedHours: 2,
  },
  {
    id: 't3',
    title: 'English Literature Syllabus Outline',
    description: 'Annotate the primary reading list and write a summary paragraph.',
    priority: 'low',
    dueDate: TODAY_STR,
    completed: false,
    subject: 'English',
  },
  {
    id: 't4',
    title: 'Physics Lab Report Drafting',
    description: 'Plot precision charts and write down measurement error tolerances.',
    priority: 'high',
    dueDate: (() => {
      const future = new Date();
      future.setDate(future.getDate() + 3);
      return future.toISOString().split('T')[0];
    })(),
    completed: false,
    subject: 'Physics',
    estimatedHours: 4,
  }
];

const INITIAL_GOALS: StudyGoal[] = [
  {
    id: 'g1',
    title: 'Solve Calculus problem sheets',
    timeframe: 'weekly',
    currentProgress: 2,
    targetValue: 5,
    unit: 'sheets',
    completed: false,
  },
  {
    id: 'g2',
    title: 'Draft Essay Segments',
    timeframe: 'weekly',
    currentProgress: 3,
    targetValue: 3,
    unit: 'segments',
    completed: true,
  },
  {
    id: 'g3',
    title: 'Read Physics Modules',
    timeframe: 'monthly',
    currentProgress: 4,
    targetValue: 12,
    unit: 'chapters',
    completed: false,
  },
  {
    id: 'g4',
    title: 'Study Vocabulary sets',
    timeframe: 'weekly',
    currentProgress: 5,
    targetValue: 7,
    unit: 'days',
    completed: false,
  }
];

const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 's1',
    date: YESTERDAY_STR,
    durationMinutes: 25,
    subject: 'Mathematics',
  },
  {
    id: 's2',
    date: YESTERDAY_STR,
    durationMinutes: 50,
    subject: 'Chemistry',
  },
  {
    id: 's3',
    date: TODAY_STR,
    durationMinutes: 25,
    subject: 'Physics',
  }
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sc1',
    time: '09:00',
    title: 'Read Chemistry Hybridization Slides',
    subject: 'Chemistry',
    completed: true,
  },
  {
    id: 'sc2',
    time: '11:00',
    title: 'Practice Calculus Derivatives',
    subject: 'Mathematics',
    completed: false,
  },
  {
    id: 'sc3',
    time: '14:30',
    title: 'Read English Poetry Syllabus',
    subject: 'English',
    completed: false,
  },
  {
    id: 'sc4',
    time: '18:00',
    title: 'Write draft of Thesis introduction outline',
    subject: 'Syllabus',
    completed: false,
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Calculus: Common Derivations',
    content: "d/dx [sin(x)] = cos(x)\nd/dx [cos(x)] = -sin(x)\nd/dx [ln(x)] = 1/x\nProduct Rule: (uv)' = u'v + uv'\nQuotient Rule: (u/v)' = (u'v - uv') / v²",
    lastUpdated: new Date().toISOString(),
    color: 'bg-amber-50/90 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/40',
  },
  {
    id: 'n2',
    title: 'Physics Lab: Calibration Errors',
    content: "1. Zero meter error: subtract 0.05mm from all micro gauge values\n2. Standard deviation weight calculation: use formula 2B\n- Resistor color code tolerance ranges: gold=5%, silver=10%. Maintain logs.",
    lastUpdated: new Date().toISOString(),
    color: 'bg-pink-50/90 dark:bg-pink-950/25 border-pink-200 dark:border-pink-900/40',
  },
  {
    id: 'n3',
    title: 'History essay bibliography papers',
    content: "1. Smith (2018) 'Renaissance Guild structures'\n2. Alvarez (2021) 'Late-Medieval economic shifts'\n3. Yale supplementary folder 14 (available at reserve desk)",
    lastUpdated: new Date().toISOString(),
    color: 'bg-sky-50/90 dark:bg-sky-950/25 border-sky-200 dark:border-sky-900/40',
  }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('study_planner_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Root states containing localStorage backups
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('study_planner_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [goals, setGoals] = useState<StudyGoal[]>(() => {
    const saved = localStorage.getItem('study_planner_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_planner_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('study_planner_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('study_planner_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [currentTab, setCurrentTab] = useState('dashboard');

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('study_planner_theme', theme);
  }, [theme]);

  // Sync back state properties
  useEffect(() => {
    localStorage.setItem('study_planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('study_planner_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('study_planner_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_planner_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('study_planner_notes', JSON.stringify(notes));
  }, [notes]);

  // Task Handlers
  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: `task_${Date.now()}`,
      completed: false,
    };
    setTasks(prev => [task, ...prev]);
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Goal Handlers
  const handleAddGoal = (newGoal: Omit<StudyGoal, 'id' | 'completed'>) => {
    const goal: StudyGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      completed: false,
    };
    setGoals(prev => [goal, ...prev]);
  };

  const handleIncrementGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextProgress = Math.min(g.currentProgress + amount, g.targetValue);
        return {
          ...g,
          currentProgress: nextProgress,
          completed: nextProgress >= g.targetValue,
        };
      }
      return g;
    }));
  };

  const handleDecrementGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextProgress = Math.max(0, g.currentProgress - amount);
        return {
          ...g,
          currentProgress: nextProgress,
          completed: nextProgress >= g.targetValue,
        };
      }
      return g;
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Schedule Handlers
  const handleUpdateScheduleItem = (updatedItem: ScheduleItem) => {
    setSchedule(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleAddScheduleItem = (newScheduleItem: Omit<ScheduleItem, 'id' | 'completed'>) => {
    const item: ScheduleItem = {
      ...newScheduleItem,
      id: `sched_${Date.now()}`,
      completed: false,
    };
    setSchedule(prev => [...prev, item]);
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule(prev => prev.filter(i => i.id !== id));
  };

  // Notes Handlers
  const handleAddNote = (newNote: Omit<Note, 'id' | 'lastUpdated'>) => {
    const note: Note = {
      ...newNote,
      id: `note_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    setNotes(prev => [note, ...prev]);
  };

  const handleEditNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Pomodoro Callback Sessions Appender
  const handleAddSession = (minutes: number, subject?: string) => {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: minutes,
      subject: subject,
    };
    setSessions(prev => [...prev, session]);

    // Also see if any active goal references "hours" or the current subject, and increment.
    // Auto-update matched weekly goals!
    goals.forEach(goal => {
      if (!goal.completed && 
         (goal.unit.toLowerCase().includes('hour') || 
          goal.unit.toLowerCase().includes('minute') ||
          (subject && goal.title.toLowerCase().includes(subject.toLowerCase()))
         )
      ) {
        // Increment goal progress by 1 or duration equivalent
        const hoursFraction = Math.max(1, Math.round(minutes / 25)); // count focus blocks
        handleIncrementGoal(goal.id, hoursFraction);
      }
    });
  };

  // Navigation Items Mapping
  const tabItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', name: 'Task Manager', icon: CheckSquare },
    { id: 'planner', name: 'Planner & Goals', icon: CalendarDays },
    { id: 'timer', name: 'Pomodoro', icon: Timer },
    { id: 'notes', name: 'Scratchpad', icon: Notebook },
    { id: 'progress', name: 'Statistics', icon: BarChart2 },
  ];

  const currentStreak = useMemo(() => {
    const uniqueSessionDays = Array.from(new Set(sessions.map(s => s.date))).sort();
    if (uniqueSessionDays.length === 0) return 0;
    
    // Quick streak logic helper
    const todayString = TODAY_STR;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const lastSessionDate = uniqueSessionDays[uniqueSessionDays.length - 1];
    
    if (lastSessionDate === todayString || lastSessionDate === yesterdayString) {
      let currentStreakVal = 1;
      let checkDate = new Date(lastSessionDate);
      for (let i = uniqueSessionDays.length - 2; i >= 0; i--) {
        const prevDate = new Date(uniqueSessionDays[i] as string);
        const diffTime = Math.abs(checkDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreakVal++;
          checkDate = prevDate;
        } else if (diffDays > 1) {
          break;
        }
      }
      return currentStreakVal;
    }
    return 0;
  }, [sessions]);
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row bg-[#f8fafc] dark:bg-slate-950 font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20">
      
      {/* 1. DESKTOP SIDEBAR NAVIGATION (hidden md:flex) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shrink-0">
        <div className="p-6 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-indigo-650 rounded-lg flex items-center justify-center text-white font-extrabold shadow-sm shadow-indigo-200 dark:shadow-none bg-indigo-600">
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">StudyFlow</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Companion</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {tabItems.map(item => {
            const IconComponent = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-sidebar-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-750 dark:bg-indigo-950/45 dark:text-indigo-400 bg-indigo-50/90 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-300'
                }`}
              >
                <IconComponent className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-3">
          {currentStreak > 0 && (
            <div 
              className="bg-orange-50/70 border border-orange-100/50 dark:bg-orange-950/20 dark:border-orange-950/45 p-3 rounded-xl flex items-center gap-2.5"
              title={`${currentStreak} days studying streak! Keep it up!`}
            >
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">STREAK</p>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-none">{currentStreak} Day Streak</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs text-slate-500 dark:text-slate-450 font-semibold">
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <button
              onClick={() => setTheme(p => p === 'light' ? 'dark' : 'light')}
              id="desktop-theme-toggle-btn"
              name="theme-toggle"
              aria-label={`Switch theme`}
              className="p-2 rounded-lg border border-slate-200/50 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 cursor-pointer h-8 w-8 flex items-center justify-center transition-all"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION (md:hidden block) */}
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 h-15 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold shadow-sm">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">StudyFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(p => p === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 transition-all cursor-pointer h-8 w-8 flex items-center justify-center"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Sticky Horizontal tab panel */}
      <div className="md:hidden sticky top-15 z-40 border-b border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 flex items-center shadow-xs shrink-0 overflow-y-hidden">
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {tabItems.map(item => {
            const IconComponent = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-mobile-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main id="main-content-stage" className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 pb-12">
        {/* Top Header Row for Welcome Back greeting & Quote inline */}
        <header className="hidden md:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-8 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">Welcome Back! Let's study.</h1>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium border-l border-slate-250 dark:border-slate-750 pl-3 italic">
              "Success is the sum of small efforts, repeated day in and day out."
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-455 font-bold px-3 py-1 rounded-full">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Dynamic active view component viewport */}
        <div className="p-4 md:p-6 lg:p-8 flex-1">
          <div className="animate-fadeIn max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                tasks={tasks}
                goals={goals}
                sessions={sessions}
                onToggleTask={handleToggleTask}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'tasks' && (
              <TaskView
                tasks={tasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleTask={handleToggleTask}
              />
            )}

            {currentTab === 'planner' && (
              <PlannerView
                goals={goals}
                schedule={schedule}
                onAddGoal={handleAddGoal}
                onIncrementGoal={handleIncrementGoal}
                onDecrementGoal={handleDecrementGoal}
                onDeleteGoal={handleDeleteGoal}
                onUpdateScheduleItem={handleUpdateScheduleItem}
                onAddScheduleItem={handleAddScheduleItem}
                onDeleteScheduleItem={handleDeleteScheduleItem}
              />
            )}

            {currentTab === 'timer' && (
              <TimerView
                onAddSession={handleAddSession}
                sessions={sessions}
              />
            )}

            {currentTab === 'notes' && (
              <NotesView
                notes={notes}
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressView
                tasks={tasks}
                goals={goals}
                sessions={sessions}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );;
}
