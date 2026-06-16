import { useMemo, useState } from 'react';
import { Task, StudyGoal, StudySession } from '../types';
import { getRandomQuote, Quote } from '../utils/quotes';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Flame, 
  ArrowRight,
  BookOpen,
  Sparkles,
  RotateCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  tasks: Task[];
  goals: StudyGoal[];
  sessions: StudySession[];
  onToggleTask: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  tasks,
  goals,
  sessions,
  onToggleTask,
  onNavigate,
}: DashboardViewProps) {
  // Rotate quotes
  const [currentQuote, setCurrentQuote] = useState<Quote>(() => getRandomQuote());
  
  const handleNewQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  // Safe greeting message
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute Statistics
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Total hours focused from sessions
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Goal stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const goalPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Streak Calculation (consecutive days with at least 1 study session)
    const uniqueSessionDays = Array.from(new Set(sessions.map(s => s.date))).sort();
    let currentStreak = 0;
    if (uniqueSessionDays.length > 0) {
      const todayString = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const lastSessionDate = uniqueSessionDays[uniqueSessionDays.length - 1];
      
      // Only compute active streak if they studied yesterday or today
      if (lastSessionDate === todayString || lastSessionDate === yesterdayString) {
        currentStreak = 1;
        let checkDate = new Date(lastSessionDate);
        for (let i = uniqueSessionDays.length - 2; i >= 0; i--) {
          const prevDate = new Date(uniqueSessionDays[i]);
          const diffTime = Math.abs(checkDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
            checkDate = prevDate;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
    }

    return {
      completedTasks,
      totalTasks,
      taskPercent,
      totalHours,
      completedGoals,
      totalGoals,
      goalPercent,
      currentStreak
    };
  }, [tasks, goals, sessions]);

  // Today's Date
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Filter tasks
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const highPriorityAlerts = useMemo(() => {
    return tasks
      .filter(t => !t.completed && t.priority === 'high')
      .slice(0, 3);
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter(t => !t.completed && t.dueDate && t.dueDate > todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);
  }, [tasks, todayStr]);

  return (
    <div className="space-y-6">
      {/* Welcome Card & Motivation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-slate-800/50 dark:to-emerald-950/20 p-6 rounded-2xl border border-indigo-100/40 dark:border-slate-800 transition-colors">
        <div>
          <h2 id="dashboard-heading" className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {greeting}, Scholar! <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            "Your preparation today determines your confidence tomorrow." Ready to excel?
          </p>
        </div>
        <button
          onClick={() => onNavigate('timer')}
          id="btn-goto-timer"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-5 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:translate-y-[-2px] active:translate-y-[0px] transition-transform text-sm cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          Start Pomodoro Session
        </button>
      </div>

      {/* Bento Grid Stats Tracker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-all duration-300">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl">
            <Flame className="w-6 h-6 fill-orange-500 animate-bounce" />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">STUDY STREAK</div>
            <div className="text-2xl font-bold text-slate-810 dark:text-slate-100 mt-0.5">
              {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        {/* Study Hours Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-all duration-300">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">FOCUS HOURS</div>
            <div className="text-2xl font-bold text-slate-810 dark:text-slate-100 mt-0.5">
              {stats.totalHours} <span className="text-sm font-normal text-slate-400">hours</span>
            </div>
          </div>
        </div>

        {/* Complete Task Ratio Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-all duration-300">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">TASKS COMPLETED</div>
            <div className="text-2xl font-bold text-slate-810 dark:text-slate-100 mt-0.5">
              {stats.completedTasks} <span className="text-sm font-normal text-slate-400">/ {stats.totalTasks}</span>
            </div>
            {stats.totalTasks > 0 && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1 rounded-full" 
                  style={{ width: `${stats.taskPercent}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Study Goal Milestone Ratio */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-all duration-300">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">GOALS PROGRESS</div>
            <div className="text-2xl font-bold text-slate-810 dark:text-slate-100 mt-0.5">
              {stats.goalPercent}%
            </div>
            <div className="text-[10px] text-slate-400">
              {stats.completedGoals} of {stats.totalGoals} goals met
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Info boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2 cols span on large): Today's task & deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                Today's Focus Tasks
              </h3>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                View all tasks <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800/60 p-4">
                <p className="text-sm text-slate-400 dark:text-slate-500">No tasks are due today!</p>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {todayTasks.map(task => (
                  <div
                    key={task.id}
                    id={`today-task-${task.id}`}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                      task.completed
                        ? 'bg-slate-50/70 border-slate-100 dark:bg-slate-800/10 dark:border-slate-800/40 text-slate-400 line-through'
                        : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div>
                        <div className="font-medium text-sm leading-tight">{task.title}</div>
                        {task.subject && (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
                            {task.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        task.priority === 'high' 
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Upcoming Study Deadlines
            </h3>

            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800/60 p-4">
                <p className="text-sm text-slate-400 dark:text-slate-500">No upcoming deadlines after today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingDeadlines.map(task => {
                  const deadlineDate = new Date(task.dueDate);
                  const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div 
                      key={task.id}
                      className="p-3.5 bg-slate-50/65 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                            {task.subject || 'GENERAL STUDY'}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 font-bold">
                            {task.dueDate}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mt-1 lines-clamp-1">{task.title}</h4>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {daysLeft <= 0 ? 'Due today' : `${daysLeft}d left`}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500 animate-pulse' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-300'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Motivational quote & high priority alerts */}
        <div className="space-y-6">
          {/* Motivational Quote Side card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 dark:from-slate-900 dark:to-indigo-950/80 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Decors */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-emerald-500/10 rounded-full blur-lg pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">
                <span>Inspirational Note</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-800/50 text-[10px] border border-indigo-700">
                  {currentQuote.category}
                </span>
              </div>
              <p className="text-base font-medium leading-relaxed italic text-indigo-50/90 relative z-10">
                "{currentQuote.text}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-indigo-800/60 relative z-10">
              <span className="text-xs text-indigo-300 font-medium">
                — {currentQuote.author}
              </span>
              <button 
                onClick={handleNewQuote}
                id="btn-next-quote"
                className="p-1 px-2.5 rounded-lg bg-indigo-800/50 hover:bg-indigo-800 text-xs text-indigo-200 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                title="Get another quote"
              >
                <RotateCw className="w-3 h-3 text-indigo-200" />
                Next
              </button>
            </div>
          </div>

          {/* High Priority Alerts Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Critical Tasks
            </h3>
            
            {highPriorityAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No high-priority tasks pending. Nice! Let's sustain this pace.
              </div>
            ) : (
              <div className="space-y-3">
                {highPriorityAlerts.map(task => (
                  <div 
                    key={task.id}
                    className="p-3 bg-red-50/40 dark:bg-red-950/20 border border-red-100/50 dark:border-red-950/50 rounded-xl flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-250 leading-tight">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-red-600 dark:text-red-400/80 font-semibold mt-1">
                        Due: {task.dueDate || 'No specified date'}
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="px-2 py-1 rounded-md bg-red-100 hover:bg-emerald-500 hover:text-white dark:bg-red-900/60 dark:hover:bg-emerald-600 text-[10px] text-red-700 dark:text-red-300 font-bold transition-all cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
