import { useMemo } from 'react';
import { Task, StudyGoal, StudySession } from '../types';
import { 
  BarChart2, 
  CheckCircle, 
  Clock, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ProgressViewProps {
  tasks: Task[];
  goals: StudyGoal[];
  sessions: StudySession[];
}

export default function ProgressView({
  tasks,
  goals,
  sessions,
}: ProgressViewProps) {
  // Aggregate stats
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskRatio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const completedGoals = goals.filter(g => g.completed).length;
    const totalGoals = goals.length;
    const goalRatio = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return {
      totalSessions,
      totalHours,
      avgMinutes,
      completedTasks,
      totalTasks,
      taskRatio,
      completedGoals,
      totalGoals,
      goalRatio,
    };
  }, [tasks, goals, sessions]);

  // Compute 7-day study history bars (Today + preceding 6 days)
  const historyData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayDate = d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
      
      // Accumulate minutes spent on this day
      const dayMins = sessions
        .filter(s => s.date === dateString)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
        
      days.push({
        dateString,
        label: `${dayName} ${dayDate}`,
        minutes: dayMins,
      });
    }
    return days;
  }, [sessions]);

  // Max minutes in the last 7 days (governs SVG column ratios scaling)
  const maxMinutes = useMemo(() => {
    const maxVal = Math.max(...historyData.map(d => d.minutes));
    return maxVal > 0 ? maxVal : 60; // default cap scale
  }, [historyData]);

  // subject-wise distribution meters
  const subjectDistribution = useMemo(() => {
    const subjectMins: { [sub: string]: number } = {};
    
    sessions.forEach(s => {
      const sub = s.subject?.trim() || 'General Study';
      subjectMins[sub] = (subjectMins[sub] || 0) + s.durationMinutes;
    });

    const totalWeightedMins = Object.values(subjectMins).reduce((a, b) => a + b, 0);
    
    return Object.entries(subjectMins)
      .map(([subject, minutes]) => {
        const percent = totalWeightedMins > 0 ? Math.round((minutes / totalWeightedMins) * 100) : 0;
        const hours = (minutes / 60).toFixed(1);
        return { subject, hours, percent, minutes };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Progress Tracking & Insights
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your scholarly velocity, hours logged, and completion accuracy across semesters.
        </p>
      </div>

      {/* High-level performance row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Study Hours Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Aggregate Workload</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.totalHours} h</span>
            <span className="text-xs text-slate-400 block mt-1">Focus study time registered</span>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        {/* Task Completion percentage card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Task Resolution Rate</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.taskRatio}%</span>
            <span className="text-xs text-slate-400 block mt-1">
              Resolved {metrics.completedTasks} of {metrics.totalTasks} study tasks
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle className="w-7 h-7" />
          </div>
        </div>

        {/* Average Session lengths */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Focus Depth index</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.avgMinutes} m</span>
            <span className="text-xs text-slate-400 block mt-1">Average study session duration</span>
          </div>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Flame className="w-7 h-7 fill-amber-500/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly focus columns column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
            <BarChart2 className="w-4.5 h-4.5 text-indigo-500" />
            Weekly Focus Volume (Minutes Studied)
          </h3>
          <p className="text-xs text-slate-400 mb-6 font-medium">Daily prep intervals measured over the past 7 days.</p>

          {/* Pure customizable SVG Column chart */}
          <div className="flex items-end justify-between h-48 pt-6 border-b border-dashed border-slate-100 dark:border-slate-850 px-2">
            {historyData.map((day, idx) => {
              // Calculate responsive heights
              const colHeightPercent = Math.min((day.minutes / maxMinutes) * 100, 100);
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group gap-2.5">
                  {/* Floating tooltip hover popup panel */}
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white dark:bg-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-30 pointer-events-none whitespace-nowrap">
                      {day.minutes} mins
                    </span>
                  </div>

                  {/* Vertical Column graph container */}
                  <div className="w-6 sm:w-8 md:w-10 bg-slate-100 dark:bg-slate-850 h-32 rounded-xl flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-550 to-indigo-600 rounded-t-lg transition-all duration-500 shadow-sm"
                      style={{ height: `${colHeightPercent}%` }}
                    />
                  </div>

                  {/* Calendar tag labels */}
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 font-sans">
                      {day.label.split(' ')[0]}
                    </span>
                    <span className="block text-[8px] text-slate-400 font-mono mt-0.5">
                      {day.label.split(' ')[1]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Preparation Density distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
              Course Concentration Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-6">Aggregate time investment categorized across academic courses.</p>

            {subjectDistribution.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400">
                Log subject-tagged study blocks inside the Pomodoro panel to populate courses mapping lists.
              </div>
            ) : (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {subjectDistribution.map(item => (
                  <div key={item.subject} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-655 dark:text-slate-205">{item.subject}</span>
                      <span className="font-mono text-slate-450">{item.hours} hours ({item.percent}%)</span>
                    </div>

                    {/* Progress tracking rail scale */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-401 bg-slate-50 dark:bg-slate-850 border border-slate-50/50 p-3 rounded-xl mt-4">
            💡 <strong>Efficiency Tip:</strong> High ratios in general studying indicate unstructured focus. Try assigning specific course codes in Pomodoro tags to refine subject concentration graphs!
          </div>
        </div>
      </div>
    </div>
  );
}
