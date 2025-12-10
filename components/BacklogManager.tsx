
import React, { useState, useEffect } from 'react';
import { Course, StudyConfig, DailyPlan, BacklogItemType } from '../types';
import { generateBacklogPlan } from '../services/geminiService';
import { CheckCircle2, AlertOctagon, GraduationCap, Clock, Bookmark, Calculator, Beaker, BookOpen, Edit3, Save, X, Bot, PlayCircle, Sparkles, Loader2, CalendarDays, Brain } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BacklogManagerProps {
  courses: Course[];
  updateCourse: (course: Course) => void;
  addCourse: (course: Course) => void;
}

// Standard Subjects Database
const STANDARD_SUBJECTS = {
    common: [
      { name: 'اللغة العربية', color: '#10b981' },
      { name: 'اللغة الإنجليزية', color: '#f59e0b' },
      { name: 'اللغة الثانية (فرنساوي/ألماني/إيطالي)', color: '#8b5cf6' }
    ],
    arts: [
      { name: 'التاريخ', color: '#ef4444' },
      { name: 'الجغرافيا', color: '#3b82f6' },
      { name: 'الفلسفة والمنطق', color: '#ec4899' },
      { name: 'علم النفس والاجتماع', color: '#f97316' }
    ],
    sci_science: [
      { name: 'الفيزياء', color: '#6366f1' },
      { name: 'الكيمياء', color: '#14b8a6' },
      { name: 'الأحياء', color: '#84cc16' },
      { name: 'الجيولوجيا', color: '#a855f7' }
    ],
    sci_math: [
      { name: 'الفيزياء', color: '#6366f1' },
      { name: 'الكيمياء', color: '#14b8a6' },
      { name: 'الرياضيات البحتة (تفاضل/جبر)', color: '#06b6d4' },
      { name: 'الرياضيات التطبيقية (استاتيكا/ديناميكا)', color: '#f43f5e' }
    ]
};

const WEEK_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const BacklogManager: React.FC<BacklogManagerProps> = ({ courses, updateCourse, addCourse }) => {
  const { t } = useLanguage();
  
  // State for Navigation
  const [step, setStep] = useState<'track' | 'subtrack' | 'list'>('track');
  const [selectedTrack, setSelectedTrack] = useState<'arts' | 'sci' | null>(null);
  const [selectedSubTrack, setSelectedSubTrack] = useState<'science' | 'math' | null>(null);

  // State for Modal Editing
  const [editingSubject, setEditingSubject] = useState<{name: string, color: string} | null>(null);
  const [configForm, setConfigForm] = useState<StudyConfig>({
      accumulatedChapters: 0,
      backlogType: 'chapter',
      backlogCount: 0,
      itemDuration: 1.5, // Default lecture time
      studyDuration: 2, // Default study time
      mode: 'center',
      studyHoursPerDay: 2,
      studyDays: [],
      lectureDays: [] // Default no specific days
  });

  // AI Plan State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<DailyPlan[]>([]);

  // Load Saved Preference
  useEffect(() => {
    const savedTrack = localStorage.getItem('userTrack');
    const savedSubTrack = localStorage.getItem('userSubTrack');
    
    if (savedTrack === 'arts') {
        setSelectedTrack('arts');
        setStep('list');
    } else if (savedTrack === 'sci') {
        setSelectedTrack('sci');
        if (savedSubTrack) {
            setSelectedSubTrack(savedSubTrack as 'science' | 'math');
            setStep('list');
        } else {
            setStep('subtrack');
        }
    }
  }, []);

  const handleTrackSelect = (track: 'arts' | 'sci') => {
      setSelectedTrack(track);
      localStorage.setItem('userTrack', track);
      if (track === 'arts') {
          setStep('list');
      } else {
          setStep('subtrack');
      }
  };

  const handleSubTrackSelect = (sub: 'science' | 'math') => {
      setSelectedSubTrack(sub);
      localStorage.setItem('userSubTrack', sub);
      setStep('list');
  };

  const resetSelection = () => {
      localStorage.removeItem('userTrack');
      localStorage.removeItem('userSubTrack');
      setSelectedTrack(null);
      setSelectedSubTrack(null);
      setStep('track');
  };

  const getSubjectsList = () => {
    let subjects = [...STANDARD_SUBJECTS.common];
    if (selectedTrack === 'arts') {
      subjects = [...subjects, ...STANDARD_SUBJECTS.arts];
    } else if (selectedTrack === 'sci') {
      if (selectedSubTrack === 'science') {
        subjects = [...subjects, ...STANDARD_SUBJECTS.sci_science];
      } else {
        subjects = [...subjects, ...STANDARD_SUBJECTS.sci_math];
      }
    }
    return subjects;
  };

  const openConfigModal = (subject: {name: string, color: string}) => {
      const existingCourse = courses.find(c => c.name === subject.name);
      
      if (existingCourse && existingCourse.studyConfig) {
          setConfigForm(existingCourse.studyConfig);
      } else {
          // Default
          setConfigForm({
              accumulatedChapters: 0,
              backlogType: 'chapter',
              backlogCount: 0,
              itemDuration: 1.5,
              studyDuration: 2,
              mode: 'center',
              studyHoursPerDay: 2,
              studyDays: [],
              lectureDays: []
          });
      }
      setEditingSubject(subject);
  };

  const saveConfiguration = () => {
      if (!editingSubject) return;

      const existingCourse = courses.find(c => c.name === editingSubject.name);

      if (existingCourse) {
          // Update existing
          updateCourse({
              ...existingCourse,
              studyConfig: configForm
          });
      } else {
          // Create new
          addCourse({
              id: Date.now().toString(),
              name: editingSubject.name,
              credits: 4, // Default weight
              difficulty: 'Medium',
              color: editingSubject.color,
              currentGrade: 0,
              units: [], 
              studyConfig: configForm
          });
      }
      setEditingSubject(null);
  };

  const handleGeneratePlan = async () => {
      setIsGenerating(true);
      const plan = await generateBacklogPlan(courses);
      setAiPlan(plan);
      setIsGenerating(false);
      
      // Scroll to plan
      setTimeout(() => {
          document.getElementById('ai-plan-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const toggleLectureDay = (day: string) => {
      setConfigForm(prev => {
          const days = prev.lectureDays || [];
          if (days.includes(day)) {
              return { ...prev, lectureDays: days.filter(d => d !== day) };
          } else {
              return { ...prev, lectureDays: [...days, day] };
          }
      });
  };

  // --- RENDERERS ---

  if (step === 'track') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center max-w-3xl mx-auto p-4">
          <div className="w-full bg-[#121212] p-10 rounded-[2.5rem] border border-brand-brown/30 shadow-2xl relative overflow-hidden">
             <div className="w-20 h-20 bg-brand-brown rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-[0_0_30px_rgba(72,22,32,0.5)] transform rotate-3">
                 <GraduationCap className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-3xl font-black text-white mb-3">{t('selectTrackTitle')}</h2>
             <p className="text-lg text-gray-400 mb-10">{t('selectTrackSubtitle')}</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => handleTrackSelect('sci')} className="group p-8 rounded-3xl bg-[#1e1e1e] border border-white/5 hover:border-brand-brown hover:bg-brand-brown/10 transition-all">
                   <Beaker className="w-12 h-12 text-gray-500 group-hover:text-brand-brown mx-auto mb-4 transition-colors" />
                   <h3 className="text-2xl font-bold text-white group-hover:text-brand-brown transition-colors">{t('trackSci')}</h3>
                </button>
                <button onClick={() => handleTrackSelect('arts')} className="group p-8 rounded-3xl bg-[#1e1e1e] border border-white/5 hover:border-brand-brown hover:bg-brand-brown/10 transition-all">
                   <BookOpen className="w-12 h-12 text-gray-500 group-hover:text-brand-brown mx-auto mb-4 transition-colors" />
                   <h3 className="text-2xl font-bold text-white group-hover:text-brand-brown transition-colors">{t('trackArts')}</h3>
                </button>
             </div>
          </div>
        </div>
      );
  }

  if (step === 'subtrack') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center max-w-3xl mx-auto p-4">
          <div className="w-full bg-[#121212] p-10 rounded-[2.5rem] border border-brand-brown/30 shadow-2xl">
             <h2 className="text-3xl font-black text-white mb-10">علمي علوم ولا رياضة؟</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <button onClick={() => handleSubTrackSelect('science')} className="group p-8 rounded-3xl bg-[#1e1e1e] border border-white/5 hover:border-brand-brown hover:bg-brand-brown/10 transition-all">
                 <Beaker className="w-12 h-12 text-gray-500 group-hover:text-brand-brown mx-auto mb-4 transition-colors" />
                 <h3 className="text-2xl font-bold text-white">{t('trackSciScience')}</h3>
               </button>
               <button onClick={() => handleSubTrackSelect('math')} className="group p-8 rounded-3xl bg-[#1e1e1e] border border-white/5 hover:border-brand-brown hover:bg-brand-brown/10 transition-all">
                 <Calculator className="w-12 h-12 text-gray-500 group-hover:text-brand-brown mx-auto mb-4 transition-colors" />
                 <h3 className="text-2xl font-bold text-white">{t('trackSciMath')}</h3>
               </button>
             </div>
             <button onClick={() => setStep('track')} className="text-gray-500 hover:text-white mt-8 underline font-bold transition-colors">رجوع</button>
          </div>
        </div>
      );
  }

  // --- LIST VIEW (Main Interface) ---
  const subjectList = getSubjectsList();
  
  // Calculate total backlog for dashboard summary
  let totalAccumulated = 0;
  courses.forEach(c => totalAccumulated += (c.studyConfig?.backlogCount || 0));

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      
      {/* 1. Header & Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0a0a0a] p-6 rounded-[2rem] border border-brand-brown/30">
          <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                 <AlertOctagon className="w-8 h-8 text-brand-brown" />
                 {t('backlogTitle')}
              </h1>
              <p className="text-gray-400 mt-2 font-medium max-w-xl">
                 اختار المادة، حدد مواعيدك الثابتة (سنتر/أونلاين)، وكمان عندك إيه متراكم، والـ AI هيعملك جدول يلم الدنيا دي كلها.
              </p>
          </div>
          <div className="bg-brand-brown/10 px-6 py-4 rounded-2xl border border-brand-brown/30 text-center min-w-[150px]">
              <div className="text-4xl font-black text-white mb-1">{totalAccumulated}</div>
              <div className="text-xs font-bold text-brand-brown uppercase tracking-wider">إجمالي المتراكم</div>
          </div>
      </div>

      <div className="flex justify-between items-center px-2">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <Bookmark className="w-5 h-5 text-brand-brown" />
               مواد شعبتك ({selectedTrack === 'sci' ? (selectedSubTrack === 'science' ? 'علمي علوم' : 'علمي رياضة') : 'أدبي'})
           </h3>
           <button onClick={resetSelection} className="text-xs text-gray-500 hover:text-red-400 underline transition-colors">
               تغيير الشعبة
           </button>
      </div>

      {/* 2. Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectList.map((subject, idx) => {
              const courseData = courses.find(c => c.name === subject.name);
              const isConfigured = !!courseData?.studyConfig;
              const backlog = courseData?.studyConfig?.backlogCount || 0;
              const type = courseData?.studyConfig?.backlogType || 'chapter';
              const lectureDays = courseData?.studyConfig?.lectureDays || [];

              return (
                  <button 
                    key={idx}
                    onClick={() => openConfigModal(subject)}
                    className={`relative p-6 rounded-3xl border-2 text-right transition-all duration-300 group hover:-translate-y-1 ${
                        isConfigured 
                        ? 'bg-[#121212] border-brand-brown/40 hover:border-brand-brown hover:shadow-lg hover:shadow-brand-brown/10' 
                        : 'bg-[#0f0f0f] border-white/5 hover:border-white/20'
                    }`}
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: subject.color }}>
                              <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          {isConfigured ? (
                              <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg">
                                  <CheckCircle2 className="w-5 h-5" />
                              </div>
                          ) : (
                              <div className="bg-white/5 text-gray-600 px-2 py-1 rounded-lg">
                                  <Edit3 className="w-5 h-5" />
                              </div>
                          )}
                      </div>

                      <h3 className={`text-xl font-bold mb-2 ${isConfigured ? 'text-white' : 'text-gray-400'}`}>
                          {subject.name}
                      </h3>

                      {isConfigured ? (
                          <div className="text-sm text-gray-400 space-y-1">
                              {lectureDays.length > 0 && (
                                  <p className="flex items-center gap-2">
                                     <CalendarDays className="w-3 h-3 text-blue-400" />
                                     <span>{lectureDays.map(d => t(`day_${d}` as any)).join('، ')}</span>
                                  </p>
                              )}
                              <p className="flex items-center gap-2">
                                  <AlertOctagon className={`w-3 h-3 ${backlog > 0 ? 'text-red-500' : 'text-green-500'}`} /> 
                                  <span>{backlog > 0 ? `${backlog} ${t(`type_${type}` as any)}` : 'مفيش تراكمات'}</span>
                              </p>
                          </div>
                      ) : (
                          <p className="text-sm text-gray-600 font-medium">اضغط لتسجيل بيانات المادة</p>
                      )}
                  </button>
              );
          })}
      </div>

      {/* 3. AI GENERATION BUTTON */}
      <div className="flex justify-center pt-8">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="group relative bg-brand-brown hover:bg-white text-white hover:text-brand-brown px-8 py-5 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(72,22,32,0.6)] transition-all hover:scale-105 border-2 border-brand-brown disabled:opacity-50 disabled:cursor-wait"
          >
              <div className="flex items-center gap-3">
                  {isGenerating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Bot className="w-8 h-8" />}
                  <span>{isGenerating ? t('ai_analyzing') : t('generate_plan')}</span>
              </div>
              <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-400 animate-spin-slow group-hover:scale-125 transition-transform" />
          </button>
      </div>

      {/* 4. AI PLAN RESULTS (WEEKLY TIMELINE) */}
      {aiPlan.length > 0 && (
          <div id="ai-plan-section" className="bg-[#121212] rounded-[2.5rem] border-2 border-brand-brown/30 overflow-hidden shadow-2xl animate-fade-in-up mt-8">
              <div className="bg-brand-brown p-6 border-b border-brand-brown/50 flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      <Bookmark className="w-6 h-6" />
                      {t('plan_title')}
                  </h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 gap-6">
                  {aiPlan.map((dayPlan, idx) => (
                      <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-brand-brown/30 transition-colors">
                          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                              <h4 className="text-xl font-black text-white">{t(`day_${dayPlan.day}` as any)}</h4>
                              <div className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-300">
                                  {dayPlan.totalHours} ساعة مذاكرة
                              </div>
                          </div>
                          
                          <div className="space-y-3">
                              {dayPlan.tasks.map((task, tIdx) => (
                                  <div key={tIdx} className={`flex items-center gap-4 p-3 rounded-xl border-l-4 ${task.type === 'Lecture' ? 'bg-blue-900/20 border-blue-500' : 'bg-red-900/10 border-red-500'}`}>
                                      <div className={`p-2 rounded-lg ${task.type === 'Lecture' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                                          {task.type === 'Lecture' ? <PlayCircle className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                                      </div>
                                      <div>
                                          <p className="font-bold text-white text-lg">{task.subject}</p>
                                          <div className="flex items-center gap-2 text-sm text-gray-400">
                                              <span>{task.details}</span>
                                              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                              <span>{task.duration} ساعة</span>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                              {dayPlan.tasks.length === 0 && (
                                  <p className="text-center text-gray-500 text-sm font-medium py-2">مفيش مهام في اليوم ده.. راحة 🌴</p>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 5. Configuration Modal */}
      {editingSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#121212] w-full max-w-lg rounded-[2.5rem] border border-brand-brown shadow-2xl relative flex flex-col animate-fade-in-up overflow-hidden max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="p-8 border-b border-white/10 bg-gradient-to-r from-brand-brown/20 to-transparent flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: editingSubject.color }}>
                              <Bookmark className="w-6 h-6 text-white" />
                          </div>
                          <div>
                              <h2 className="text-2xl font-black text-white">{editingSubject.name}</h2>
                              <p className="text-gray-400 text-xs font-bold">تعديل بيانات المادة</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingSubject(null)} className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-white transition-colors">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                      
                      {/* Q1: Lecture Days (The New Important Part) */}
                      <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-brand-brown" /> 
                              {t('lecture_days_label')}
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {WEEK_DAYS.map(day => (
                                  <button
                                    key={day}
                                    onClick={() => toggleLectureDay(day)}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                                        (configForm.lectureDays || []).includes(day)
                                        ? 'bg-brand-brown text-white border-brand-brown'
                                        : 'bg-[#1e1e1e] text-gray-500 border-white/10 hover:border-white/30'
                                    }`}
                                  >
                                      {t(`day_${day}` as any)}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Q2: Item Type */}
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                              <Bookmark className="w-4 h-4 text-blue-400" /> 
                              {t('backlog_type')}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                              {['chapter', 'unit', 'lesson', 'lecture'].map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setConfigForm({...configForm, backlogType: type as BacklogItemType})}
                                    className={`py-2 rounded-xl font-bold border-2 transition-all ${configForm.backlogType === type ? 'bg-brand-brown border-brand-brown text-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                                  >
                                      {t(`type_${type}` as any)}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Q3: Count */}
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                              <AlertOctagon className="w-4 h-4 text-red-400" /> 
                              {t('backlog_count')}
                          </label>
                          <input 
                              type="number" 
                              min="0"
                              className="w-full bg-[#1e1e1e] border-2 border-white/5 focus:border-brand-brown rounded-xl px-4 py-4 font-black text-xl text-center text-white focus:outline-none transition-colors"
                              value={configForm.backlogCount}
                              onChange={(e) => setConfigForm({...configForm, backlogCount: parseInt(e.target.value) || 0})}
                          />
                      </div>

                      {/* Q4: Time Allocation (Split) */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-400">
                                   {configForm.backlogType === 'lecture' ? 'وقت المحاضرة' : 'شرح/فيديو'} (ساعات)
                               </label>
                               <input 
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-center text-white font-bold"
                                  value={configForm.itemDuration}
                                  onChange={(e) => setConfigForm({...configForm, itemDuration: parseFloat(e.target.value) || 0})}
                               />
                          </div>
                          <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-400">
                                   وقت المذاكرة/الحل (ساعات)
                               </label>
                               <input 
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-center text-white font-bold"
                                  value={configForm.studyDuration}
                                  onChange={(e) => setConfigForm({...configForm, studyDuration: parseFloat(e.target.value) || 0})}
                               />
                          </div>
                      </div>

                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-white/10 bg-[#0f0f0f]">
                      <button 
                        onClick={saveConfiguration}
                        className="w-full bg-brand-brown text-white py-4 rounded-xl font-black text-lg hover:bg-white hover:text-brand-brown transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                          <Save className="w-5 h-5" />
                          حفظ التغييرات
                      </button>
                  </div>

              </div>
          </div>
      )}

    </div>
  );
};

export default BacklogManager;
