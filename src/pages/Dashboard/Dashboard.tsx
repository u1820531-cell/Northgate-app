import React, { useEffect, useRef } from 'react';
import { useNorthgateStore } from '../../store/useNorthgateStore';
import { 
  Flame, 
  FolderPlus, 
  Plus, 
  CheckSquare, 
  Layers, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { day: 'Mon', completions: 4 },
  { day: 'Tue', completions: 7 },
  { day: 'Wed', completions: 2 },
  { day: 'Thu', completions: 8 },
  { day: 'Fri', completions: 10 },
  { day: 'Sat', completions: 5 },
  { day: 'Sun', completions: 9 },
];

export const Dashboard: React.FC = () => {
  // Selective Zustand selectors
  const projects = useNorthgateStore((state) => state.projects);
  const todayTasks = useNorthgateStore((state) => state.todayTasks);
  const recentNotes = useNorthgateStore((state) => state.recentNotes);
  const streak = useNorthgateStore((state) => state.streak);
  const activeWorkspace = useNorthgateStore((state) => state.activeWorkspace);
  const initialize = useNorthgateStore((state) => state.initialize);
  const toggleTask = useNorthgateStore((state) => state.toggleTask);
  const addNote = useNorthgateStore((state) => state.addNote);
  const addProject = useNorthgateStore((state) => state.addProject);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize();
  }, [initialize]);

  const activeProjects = projects.filter((p) => p.status === 'active');
  const totalTasksCount = todayTasks.length;
  const completedTasksCount = todayTasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  const handleQuickNote = async () => {
    const title = prompt('Enter Note Title:');
    if (!title) return;
    const todayStr = new Date().toISOString().split('T')[0];
    await addNote({
      title,
      content: '',
      workspace: activeWorkspace === 'All' ? 'Personal' : activeWorkspace,
      tags: ['quick'],
      date: todayStr,
      attachments: [],
    });
  };

  const handleQuickProject = async () => {
    const name = prompt('Enter Project Name:');
    if (!name) return;
    await addProject({
      name,
      description: 'Newly created workspace project',
      status: 'active',
      goals: [],
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] p-6 md:p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-inter">Northgate</h1>
          <p className="text-slate-400 text-sm mt-1">Measure progress. Build consistency.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>Workspace: <strong className="text-white">{activeWorkspace}</strong></span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f172a] border border-emerald-500/10 rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Consistency Habit</span>
            <h2 className="text-4xl font-extrabold text-white mt-1">{streak} Days</h2>
            <p className="text-slate-400 text-xs mt-2">Active post streak</p>
          </div>
          <div className="bg-emerald-500/10 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Flame className="h-8 w-8 text-emerald-400 fill-emerald-500/10" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Daily Execution</span>
            <h2 className="text-4xl font-extrabold text-white mt-1">{taskCompletionRate}%</h2>
            <p className="text-slate-400 text-xs mt-2">{completedTasksCount} of {totalTasksCount} tasks completed</p>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
              <circle cx="40" cy="40" r="34" className="stroke-emerald-500 transition-all duration-500" strokeWidth="6" fill="transparent" 
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - taskCompletionRate / 100)}
              />
            </svg>
            <CheckSquare className="absolute h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Command Center</span>
            <p className="text-slate-400 text-xs mt-1">Deploy rapid workspace operations</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={handleQuickNote}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Note
            </button>
            <button 
              onClick={handleQuickProject}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium transition-all"
            >
              <FolderPlus className="h-3.5 w-3.5" /> Project
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Productivity Velocity</h3>
              </div>
              <span className="text-xs text-slate-400">Weekly Output Analysis</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletions)" name="Work Items Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-white">Active Projects</h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">
                {activeProjects.length} Active
              </span>
            </div>
            
            {activeProjects.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-sm">No active projects found.</p>
                <button onClick={handleQuickProject} className="text-emerald-400 text-xs font-semibold mt-2 hover:underline">
                  Launch your first Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.map((project) => {
                  const completedGoals = project.goals.filter((g) => g.completed).length;
                  const totalGoals = project.goals.length;
                  const progressPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

                  return (
                    <div key={project.id} className="bg-[#090d16] border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm">{project.name}</h4>
                        <span className="text-[10px] uppercase font-mono text-slate-500">proj</span>
                      </div>
                      <p className="text-slate-400 text-xs overflow-hidden text-ellipsis display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Goals</span>
                          <span className="text-slate-300 font-semibold">{completedGoals}/{totalGoals} ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-emerald-500 to-sky-500 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-semibold text-white mb-4">Focus Agenda</h3>
            {todayTasks.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">All clear for today!</p>
            ) : (
              <ul className="space-y-3">
                {todayTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-3 text-xs border-b border-slate-800/50 pb-2">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      className="mt-0.5 accent-emerald-500 rounded border-slate-800 cursor-pointer"
                    />
                    <span className={`leading-relaxed ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {task.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-white">Recent Notes</h3>
              <button className="text-slate-400 hover:text-white transition-colors">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            {recentNotes.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No records written yet.</p>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#090d16] hover:bg-[#111827] rounded-lg border border-slate-800 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate max-w-[150px]">
                        {note.title || 'Untitled Note'}
                      </h4>
                      <span className="text-[10px] text-slate-500">{note.date}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="bg-[#0f172a] text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-800">
                        {note.workspace}
                      </span>
                      {note.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="bg-slate-800/40 text-sky-400 text-[10px] px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

