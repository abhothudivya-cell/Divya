import React, { useState } from 'react';
import { StudyGoal, ScheduleItem, Timeframe } from '../types';
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Target, 
  CalendarDays, 
  Sparkles, 
  AlertCircle,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  Clock3,
  X
} from 'lucide-react';

interface PlannerViewProps {
  goals: StudyGoal[];
  schedule: ScheduleItem[];
  onAddGoal: (goal: Omit<StudyGoal, 'id' | 'completed'>) => void;
  onIncrementGoal: (id: string, amount: number) => void;
  onDecrementGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateScheduleItem: (updatedItem: ScheduleItem) => void;
  onAddScheduleItem: (item: Omit<ScheduleItem, 'id' | 'completed'>) => void;
  onDeleteScheduleItem: (id: string) => void;
}

export default function PlannerView({
  goals,
  schedule,
  onAddGoal,
  onIncrementGoal,
  onDecrementGoal,
  onDeleteGoal,
  onUpdateScheduleItem,
  onAddScheduleItem,
  onDeleteScheduleItem,
}: PlannerViewProps) {
  // Goal and schedule tabs
  const [plannerTab, setPlannerTab] = useState<'daily' | 'goals'>('daily');

  // Daily Planner: dynamic item form
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleSubject, setScheduleSubject] = useState('');

  // Goals Form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTimeframe, setGoalTimeframe] = useState<Timeframe>('weekly');
  const [goalTargetValue, setGoalTargetValue] = useState<number>(5);
  const [goalUnit, setGoalUnit] = useState('hours');

  // Handle goals addition
  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || goalTargetValue <= 0) return;

    onAddGoal({
      title: goalTitle.trim(),
      timeframe: goalTimeframe,
      currentProgress: 0,
      targetValue: Number(goalTargetValue),
      unit: goalUnit.trim() || 'units',
    });

    // Reset Goal Form
    setGoalTitle('');
    setGoalTargetValue(5);
    setGoalUnit('hours');
    setShowGoalForm(false);
  };

  // Handle schedule addition
  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    onAddScheduleItem({
      time: scheduleTime,
      title: scheduleTitle.trim(),
      subject: scheduleSubject.trim() || undefined,
    });

    setScheduleTitle('');
    setScheduleSubject('');
  };

  // Sort schedule items by time (chrono)
  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

  // Filter goals
  const weeklyGoals = goals.filter(g => g.timeframe === 'weekly');
  const monthlyGoals = goals.filter(g => g.timeframe === 'monthly');

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Study Planner & Goals
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Map out your academic schedule and set dynamic milestones for the week and month.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-1.5 rounded-xl self-start">
          <button
            onClick={() => setPlannerTab('daily')}
            id="tab-view-daily"
            className={`py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wide cursor-pointer transition-all ${
              plannerTab === 'daily'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Daily Schedule
          </button>
          <button
            onClick={() => setPlannerTab('goals')}
            id="tab-view-goals"
            className={`py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wide cursor-pointer transition-all ${
              plannerTab === 'goals'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Milestone Goals
          </button>
        </div>
      </div>

      {plannerTab === 'daily' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Addition Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3.5 flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-indigo-500" />
              Add Schedule Item
            </h3>

            <form onSubmit={handleAddScheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={scheduleTime}
                  id="sched-time-input"
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">
                  Activity Context
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics lecture revision, French essay"
                  value={scheduleTitle}
                  id="sched-title-input"
                  onChange={e => setScheduleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">
                  Subject Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics, French"
                  value={scheduleSubject}
                  id="sched-subj-input"
                  onChange={e => setScheduleSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                id="btn-add-sched"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer"
              >
                Schedule Block
              </button>
            </form>
          </div>

          {/* Schedule Slots Timeline Display */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
              <span>Today's Time Block Agenda</span>
              <span className="text-xs text-slate-400 font-medium">({schedule.length} blocked slots)</span>
            </h3>

            {sortedSchedule.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl p-6 border border-dashed border-slate-100 dark:border-slate-800/80">
                <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2.5" />
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Your agenda is wide open today!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Block some hours on the sidebar to build a focused study day.</p>
              </div>
            ) : (
              <div className="relative border-l border-indigo-150/50 dark:border-indigo-950 pl-5.5 ml-3.5 space-y-4">
                {sortedSchedule.map((item) => {
                  // Compare status
                  return (
                    <div 
                      key={item.id}
                      className="group relative flex items-start justify-between p-4 bg-slate-50/45 border border-slate-100/50 dark:bg-slate-900 dark:border-slate-800/80 rounded-2xl hover:border-indigo-100 dark:hover:border-slate-700/65 transition-all"
                    >
                      {/* Interactive timing circular badge dot overlay */}
                      <span className={`absolute -left-9 top-6.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        item.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-white border-indigo-150 dark:bg-slate-950 dark:border-slate-700 text-slate-600 dark:text-slate-405'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight bg-indigo-50/70 dark:bg-indigo-950/20 px-2 py-0.5 rounded-lg">
                            {item.time}
                          </span>
                          
                          {item.subject && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                              {item.subject}
                            </span>
                          )}
                        </div>

                        <p className={`text-sm font-medium ${
                          item.completed 
                            ? 'text-slate-400 dark:text-slate-500 line-through' 
                            : 'text-slate-700 dark:text-slate-200'
                        }`}>
                          {item.title}
                        </p>
                      </div>

                      {/* Item controls */}
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => onUpdateScheduleItem({ ...item, completed: !item.completed })}
                          id={`toggle-agenda-${item.id}`}
                          aria-label={`Toggle schedule item ${item.title}`}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            item.completed
                              ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400'
                              : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-emerald-600 dark:bg-slate-950 dark:border-slate-800'
                          }`}
                        >
                          Check
                        </button>
                        <button
                          onClick={() => onDeleteScheduleItem(item.id)}
                          id={`delete-agenda-${item.id}`}
                          aria-label={`Delete schedule item ${item.title}`}
                          className="p-1.5 border border-slate-100 hover:border-red-100 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Milestones Add triggers */}
          <div className="flex justify-end">
            {!showGoalForm ? (
              <button
                onClick={() => setShowGoalForm(true)}
                id="btn-trigger-add-goal"
                className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs uppercase tracking-wide rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Study Goal
              </button>
            ) : (
              <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl animate-fadeIn text-left">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-205">Configure Study Milestone</h4>
                  <button 
                    onClick={() => setShowGoalForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddGoalSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <input
                      required
                      type="text"
                      placeholder="e.g. Work on thesis draft, Finish Calculus sets"
                      value={goalTitle}
                      id="goal-title-input"
                      onChange={e => setGoalTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    />
                  </div>

                  <div>
                    <select
                      value={goalTimeframe}
                      id="goal-timeframe-input"
                      onChange={e => setGoalTimeframe(e.target.value as Timeframe)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-350 rounded-xl focus:outline-none text-sm cursor-pointer"
                    >
                      <option value="weekly">Weekly Goal</option>
                      <option value="monthly">Monthly Goal</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Target"
                      value={goalTargetValue}
                      id="goal-target-input"
                      onChange={e => setGoalTargetValue(Number(e.target.value))}
                      className="w-16 px-2 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-105 rounded-xl focus:outline-none text-center text-sm"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Unit (e.g. hours, papers)"
                      value={goalUnit}
                      id="goal-unit-input"
                      onChange={e => setGoalUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-105 rounded-xl focus:outline-none text-sm"
                    />
                  </div>

                  <div className="md:col-span-4 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoalForm(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-semibold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-save-goal"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase"
                    >
                      Save Goal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Goals section layout: Weekly and Monthly rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weekly study goals */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4.5 h-4.5 text-indigo-500" />
                  Weekly Milestones
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-950/45 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {weeklyGoals.filter(w => w.completed).length} / {weeklyGoals.length} met
                </span>
              </h3>

              {weeklyGoals.length === 0 ? (
                <p className="text-sm text-slate-405 dark:text-slate-500 text-center py-10">No active weekly milestones created.</p>
              ) : (
                <div className="space-y-4">
                  {weeklyGoals.map(goal => (
                    <GoalCard 
                      key={goal.id}
                      goal={goal}
                      onIncrement={onIncrementGoal}
                      onDecrement={onDecrementGoal}
                      onDelete={onDeleteGoal}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Monthly study goals */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4.5 h-4.5 text-emerald-500" />
                  Monthly Roadmaps
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {monthlyGoals.filter(m => m.completed).length} / {monthlyGoals.length} met
                </span>
              </h3>

              {monthlyGoals.length === 0 ? (
                <p className="text-sm text-slate-405 dark:text-slate-500 text-center py-10 font-medium">No active monthly roadmap milestones created.</p>
              ) : (
                <div className="space-y-4">
                  {monthlyGoals.map(goal => (
                    <GoalCard 
                      key={goal.id}
                      goal={goal}
                      onIncrement={onIncrementGoal}
                      onDecrement={onDecrementGoal}
                      onDelete={onDeleteGoal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subgoal element generator
interface GoalCardProps {
  key?: string;
  goal: StudyGoal;
  onIncrement: (id: string, amount: number) => void;
  onDecrement: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

function GoalCard({ goal, onIncrement, onDecrement, onDelete }: GoalCardProps) {
  const percent = Math.min(Math.round((goal.currentProgress / goal.targetValue) * 100), 100);

  return (
    <div 
      className={`p-4 rounded-xl border transition-all ${
        goal.completed
          ? 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100 dark:border-emerald-900/30'
          : 'bg-slate-50/55 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700/60 shadow-xs'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className={`text-sm font-semibold leading-tight ${
            goal.completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-700 dark:text-slate-205'
          }`}>
            {goal.title}
          </h4>
          <span className="text-xs text-slate-400 font-mono mt-1.5 block">
            {goal.currentProgress} / {goal.targetValue} {goal.unit}
          </span>
        </div>

        {/* Delete Goal Button */}
        <button
          onClick={() => onDelete(goal.id)}
          id={`delete-goal-${goal.id}`}
          name={`delete-g-${goal.id}`}
          aria-label={`Delete goal ${goal.title}`}
          className="p-1 rounded bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 dark:bg-slate-950 dark:border-slate-800 transition-colors shadow-xs cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress slider bar representation */}
      <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 relative">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            goal.completed ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        <span className={`font-semibold ${goal.completed ? 'text-emerald-600 dark:text-emerald-450' : 'text-indigo-600 dark:text-indigo-400'}`}>
          {percent}% Met
        </span>

        {/* Counter controller */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDecrement(goal.id, 1)}
            id={`dec-goal-${goal.id}`}
            disabled={goal.currentProgress <= 0}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Decrement"
          >
            <MinusCircle className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => onIncrement(goal.id, 1)}
            id={`inc-goal-${goal.id}`}
            disabled={goal.completed}
            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-40 cursor-pointer"
            title="Increment"
          >
            <PlusCircle className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
