
import React, { useState, useEffect } from 'react';
import { Task, Course } from '../types';
import { parseTaskWithAI } from '../services/geminiService';
import { Plus, Sparkles, Loader2, Calendar, Trash2, Filter, Target, CheckCircle2, Clock, Flame, Briefcase } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskManagerProps {
  tasks: Task[];
  courses: Course[];
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, courses, addTask, toggleTask, deleteTask }) => {
  const { t } = useLanguage();
  const [naturalInput, setNaturalInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  // Stats
  const pendingCount = tasks.filter(t => !t.isCompleted).length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleSmartAdd = async () => {
    if (!naturalInput.trim()) return;

    setIsProcessing(true);
    
    // Attempt AI Parse
    const result = await parseTaskWithAI(naturalInput, courses);
    
    let newTask: Task;

    if (result) {
      const matchedCourse = courses.find(c => c.name.toLowerCase() === result.courseName?.toLowerCase());
      newTask = {
        id: Date.now().toString(),
        title: result.title,
        dueDate: result.dueDate || new Date().toISOString(),
        priority: result.priority,
        isCompleted: false,
        courseId: matchedCourse?.id
      };
    } else {
      newTask = {
        id: Date.now().toString(),
        title: naturalInput,
        dueDate: new Date().toISOString(),
        priority: 'Medium',
        isCompleted: false
      };
    }

    addTask(newTask);
    setNaturalInput('');
    setIsProcessing(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'Pending') return !t.isCompleted;
    if (activeTab === 'Completed') return t.isCompleted;
    return true;
  });

  const getPriorityColor = (priority: string) => {
      switch(priority) {
          case 'High': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
          case 'Medium': return 'bg-yellow-500';
          default: return 'bg-blue-400';
      }
  };
  
  const getPriorityLabel = (priority: string) => {
      switch(priority) {
          case 'High': return t('taskPriorityHigh');
          case 'Medium': return t('taskPriorityMed');
          default: return t('taskPriorityLow');
      }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      
      {/* 1. Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-brand-card dark:bg-[#1a0f12] border border-brand-brown/10 dark:border-brand-brown/30 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                  <p className="text-brand-subtext dark:text-gray-400 font-bold text-sm mb-1">{t('taskStatPending')}</p>
                  <p className="text-4xl font-black text-brand-text dark:text-white">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-brand-brown rounded-2xl flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform shadow-lg">
                  <Target className="w-6 h-6" />
              </div>
              <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-brand-brown/10 dark:from-brand-brown/20 to-transparent"></div>
          </div>

          <div className="bg-brand-card dark:bg-[#0f1a12] border border-green-500/10 dark:border-green-900/30 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                  <p className="text-brand-subtext dark:text-gray-400 font-bold text-sm mb-1">{t('taskStatDone')}</p>
                  <p className="text-4xl font-black text-brand-text dark:text-white">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 dark:bg-green-900 rounded-2xl flex items-center justify-center text-white dark:text-green-400 relative z-10 group-hover:scale-110 transition-transform shadow-lg">
                  <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-green-500/10 dark:from-green-900/20 to-transparent"></div>
          </div>

          <div className="bg-brand-card dark:bg-[#161b22] border border-blue-500/10 dark:border-blue-900/30 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                  <p className="text-brand-subtext dark:text-gray-400 font-bold text-sm mb-1">{t('taskStatRate')}</p>
                  <p className="text-4xl font-black text-brand-text dark:text-white">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 dark:bg-blue-900 rounded-2xl flex items-center justify-center text-white dark:text-blue-400 relative z-10 group-hover:scale-110 transition-transform shadow-lg">
                  <Flame className="w-6 h-6" />
              </div>
              
              {/* Progress Ring Background */}
              <svg className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10" viewBox="0 0 36 36">
                <path className="text-gray-300 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-blue-500" strokeDasharray={`${completionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
          </div>
      </div>

      {/* 2. Smart Input Command Center */}
      <div className="relative">
         <div className="absolute -inset-1 bg-gradient-to-r from-brand-brown via-purple-500 dark:via-purple-900 to-brand-brown rounded-[2rem] blur opacity-20 dark:opacity-30 animate-pulse"></div>
         <div className="relative bg-white dark:bg-[#0a0a0a] p-2 rounded-[1.8rem] border border-gray-200 dark:border-white/10 flex items-center gap-2 shadow-xl dark:shadow-2xl">
             <div className="w-12 h-12 bg-brand-brown/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                 {isProcessing ? <Loader2 className="w-6 h-6 text-brand-brown animate-spin" /> : <Sparkles className="w-6 h-6 text-brand-brown" />}
             </div>
             
             <input
                type="text"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartAdd()}
                placeholder={t('smartAddPlaceholder')}
                className="flex-1 bg-transparent text-brand-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-bold text-lg px-2 focus:outline-none"
             />

             <button
                onClick={handleSmartAdd}
                disabled={!naturalInput.trim() || isProcessing}
                className="bg-brand-brown hover:bg-brand-brown/90 dark:hover:bg-white dark:hover:text-brand-brown text-white px-6 py-3 rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
             >
                 <Plus className="w-5 h-5" />
                 <span className="hidden md:inline">{t('smartAdd')}</span>
             </button>
         </div>
      </div>

      {/* 3. Task List & Filters */}
      <div>
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
              <button 
                onClick={() => setActiveTab('Pending')}
                className={`pb-2 text-lg font-bold transition-all relative ${activeTab === 'Pending' ? 'text-brand-text dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-brand-brown dark:hover:text-gray-300'}`}
              >
                  {t('pending')}
                  {activeTab === 'Pending' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-brown rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('Completed')}
                className={`pb-2 text-lg font-bold transition-all relative ${activeTab === 'Completed' ? 'text-brand-text dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-brand-brown dark:hover:text-gray-300'}`}
              >
                  {t('completed')}
                  {activeTab === 'Completed' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
              </button>
          </div>

          {/* List */}
          <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                  <div className="text-center py-16 bg-brand-card dark:bg-brand-brown/5 rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-brand-brown/20 flex flex-col items-center">
                      <Briefcase className="w-16 h-16 text-gray-300 dark:text-brand-brown/30 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">{t('noTasksFound')}</p>
                  </div>
              ) : (
                  filteredTasks.map((task) => {
                      const course = courses.find(c => c.id === task.courseId);
                      const isHovered = hoveredTask === task.id;

                      return (
                          <div 
                             key={task.id}
                             onMouseEnter={() => setHoveredTask(task.id)}
                             onMouseLeave={() => setHoveredTask(null)}
                             className={`group relative bg-brand-card dark:bg-[#121212] rounded-2xl p-5 border transition-all duration-300 ${
                                 task.isCompleted 
                                 ? 'border-green-500/30 dark:border-green-900/30 opacity-60' 
                                 : 'border-gray-100 dark:border-white/5 hover:border-brand-brown hover:shadow-lg hover:shadow-brand-brown/10 hover:-translate-y-1'
                             }`}
                          >
                              {/* Left Border Indicator */}
                              <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${course ? '' : 'bg-gray-300 dark:bg-gray-700'}`} style={{ backgroundColor: course?.color }}></div>

                              <div className="flex items-start md:items-center gap-4 pl-4">
                                  
                                  {/* Checkbox Button */}
                                  <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                                        task.isCompleted 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-gray-300 dark:border-gray-600 hover:border-brand-brown text-transparent'
                                    }`}
                                  >
                                      <CheckCircle2 className="w-5 h-5" />
                                  </button>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                          {course && (
                                              <span 
                                                className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                                                style={{ backgroundColor: `${course.color}20`, color: course.color }}
                                              >
                                                  {course.name}
                                              </span>
                                          )}
                                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 ${getPriorityColor(task.priority).split(' ')[0]}`}>
                                              {getPriorityLabel(task.priority)}
                                          </span>
                                      </div>
                                      
                                      <h3 className={`text-lg md:text-xl font-bold text-brand-text dark:text-white ${task.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                          {task.title}
                                      </h3>

                                      <div className="flex items-center gap-4 mt-2 text-xs md:text-sm font-medium text-brand-subtext dark:text-gray-500">
                                          <span className="flex items-center gap-1">
                                              <Clock className="w-4 h-4" />
                                              {new Date(task.dueDate).toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
                                          </span>
                                      </div>
                                  </div>

                                  {/* Actions */}
                                  <button 
                                    onClick={() => deleteTask(task.id)}
                                    className={`p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                  >
                                      <Trash2 className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>
                      );
                  })
              )}
          </div>
      </div>

    </div>
  );
};

export default TaskManager;
