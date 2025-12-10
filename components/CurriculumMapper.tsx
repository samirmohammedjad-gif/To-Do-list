
import React, { useState } from 'react';
import { Course, Unit, LessonStatus } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, User, Wifi, MapPin, Layers, BookOpen, X, Edit3, Save, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CurriculumMapperProps {
  courses: Course[];
  updateCourse: (course: Course) => void;
  addCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
}

const CurriculumMapper: React.FC<CurriculumMapperProps> = ({ courses, updateCourse, addCourse, deleteCourse }) => {
  const { t } = useLanguage();
  
  // UI State
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lesson Modal State
  const [lessonModal, setLessonModal] = useState<{isOpen: boolean, courseId: string | null, unitId: string | null}>({
      isOpen: false,
      courseId: null,
      unitId: null
  });
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Course Form State
  const [formData, setFormData] = useState<{
      name: string;
      teacherName: string;
      mode: 'online' | 'offline';
      color: string;
      structureItems: string[]; // Temp storage for "Branches/Units" names
      tempItemInput: string;
  }>({
      name: '',
      teacherName: '',
      mode: 'online',
      color: '#6366f1',
      structureItems: [],
      tempItemInput: ''
  });

  const toggleCourse = (id: string) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const handleAddItemToStructure = () => {
      if (formData.tempItemInput.trim()) {
          setFormData(prev => ({
              ...prev,
              structureItems: [...prev.structureItems, prev.tempItemInput.trim()],
              tempItemInput: ''
          }));
      }
  };

  const handleRemoveItemFromStructure = (index: number) => {
      setFormData(prev => ({
          ...prev,
          structureItems: prev.structureItems.filter((_, i) => i !== index)
      }));
  };

  const handleSaveCourse = () => {
      if (!formData.name.trim()) return;

      // Convert structure items to Units
      const units: Unit[] = formData.structureItems.map((item, idx) => ({
          id: Date.now().toString() + idx,
          title: item,
          lessons: [] // Empty initially, user adds lessons inside
      }));

      const newCourse: Course = {
          id: Date.now().toString(),
          name: formData.name,
          teacherName: formData.teacherName,
          studyMode: formData.mode,
          color: formData.color,
          credits: 3, // Default
          difficulty: 'Medium',
          currentGrade: 0,
          units: units
      };

      addCourse(newCourse);
      
      // Reset and Close
      setFormData({
          name: '',
          teacherName: '',
          mode: 'online',
          color: '#6366f1',
          structureItems: [],
          tempItemInput: ''
      });
      setIsModalOpen(false);
  };

  // --- Handlers for Lesson Modal ---
  const openAddLessonModal = (courseId: string, unitId: string) => {
      setLessonModal({ isOpen: true, courseId, unitId });
      setNewLessonTitle('');
  };

  const handleSaveLesson = () => {
      if (!newLessonTitle.trim() || !lessonModal.courseId || !lessonModal.unitId) return;

      const course = courses.find(c => c.id === lessonModal.courseId);
      if (course) {
          const updatedUnits = course.units.map(u => {
              if (u.id === lessonModal.unitId) {
                  return {
                      ...u,
                      lessons: [...u.lessons, {
                          id: Date.now().toString(),
                          title: newLessonTitle,
                          status: 'pending' as LessonStatus
                      }]
                  };
              }
              return u;
          });
          updateCourse({ ...course, units: updatedUnits });
      }
      
      // Close and Reset
      setLessonModal({ isOpen: false, courseId: null, unitId: null });
      setNewLessonTitle('');
  };

  const cycleStatus = (courseId: string, unitId: string, lessonId: string) => {
      const statuses: LessonStatus[] = ['pending', 'reading', 'homework', 'review', 'mastered'];
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const updatedUnits = course.units.map(u => {
          if (u.id === unitId) {
              const updatedLessons = u.lessons.map(l => {
                  if (l.id === lessonId) {
                      const currentIndex = statuses.indexOf(l.status);
                      const nextIndex = (currentIndex + 1) % statuses.length;
                      return { ...l, status: statuses[nextIndex] };
                  }
                  return l;
              });
              return { ...u, lessons: updatedLessons };
          }
          return u;
      });
      updateCourse({ ...course, units: updatedUnits });
  };

  const getStatusColor = (status: LessonStatus) => {
      switch(status) {
          case 'pending': return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
          case 'reading': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
          case 'homework': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
          case 'review': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
          case 'mastered': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      }
  };

  const getStatusLabel = (status: LessonStatus) => {
    switch(status) {
        case 'pending': return t('st_pending');
        case 'reading': return t('st_reading');
        case 'homework': return t('st_homework');
        case 'review': return t('st_review');
        case 'mastered': return t('st_mastered');
    }
  };

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#78716c'];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* 1. TOP BANNER */}
      <div className="w-full bg-brand-brown rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden text-center border-4 border-white/5">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <h1 className="relative z-10 text-4xl md:text-6xl font-black text-white drop-shadow-lg font-cairo">
              {t('courses')}
          </h1>
          <p className="relative z-10 text-brand-beige/80 mt-2 font-bold text-lg">
             نظم منهجك .. ترتاح في المراجعة
          </p>
      </div>

      {/* 2. SUB-HEADER & ADD BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-card p-4 rounded-2xl border-r-4 border-brand-brown shadow-sm">
           <div>
               <h2 className="text-2xl font-black text-brand-text flex items-center gap-2">
                   <Layers className="w-6 h-6 text-brand-brown" />
                   المواد بتاعتي
               </h2>
               <p className="text-sm text-brand-subtext font-bold">كل موادك في مكان واحد، متقسمة زي ما تحب</p>
           </div>
           
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-brand-brown text-white px-6 py-3 rounded-xl font-black hover:bg-white hover:text-brand-brown border-2 border-brand-brown transition-all flex items-center gap-2 shadow-lg"
           >
               <Plus className="w-5 h-5" />
               إضافة مادة جديدة
           </button>
      </div>

      {/* 3. COURSES GRID */}
      <div className="grid grid-cols-1 gap-6">
          {courses.map(course => (
              <div key={course.id} className="bg-brand-card rounded-2xl border border-brand-brown/20 shadow-sm overflow-hidden hover:border-brand-brown transition-all duration-300">
                  
                  {/* Card Header */}
                  <div 
                    className="p-5 flex flex-wrap justify-between items-center cursor-pointer bg-gradient-to-l from-transparent to-brand-brown/5"
                    onClick={() => toggleCourse(course.id)}
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-3 h-12 rounded-full shadow-sm" style={{ backgroundColor: course.color }}></div>
                          <div>
                              <h3 className="text-xl font-black text-brand-text flex items-center gap-2">
                                  {course.name}
                                  {course.studyMode === 'online' && <Wifi className="w-4 h-4 text-blue-500" />}
                                  {course.studyMode === 'offline' && <MapPin className="w-4 h-4 text-orange-500" />}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-brand-subtext font-bold mt-1">
                                  {course.teacherName && <span className="flex items-center gap-1"><User className="w-3 h-3"/> {course.teacherName}</span>}
                                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> {course.units.length} فروع/وحدات</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 md:mt-0">
                          <button onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                          </button>
                          {expandedCourse === course.id ? <ChevronUp className="w-6 h-6 text-brand-brown" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                      </div>
                  </div>

                  {/* Expandable Content */}
                  {expandedCourse === course.id && (
                      <div className="border-t border-brand-brown/10 bg-brand-beige/50 p-5 animate-fade-in-down">
                          
                          {/* Units / Branches List */}
                          <div className="space-y-6">
                              {course.units.map((unit) => (
                                  <div key={unit.id} className="bg-brand-card border border-brand-brown/10 rounded-xl overflow-hidden">
                                      <div className="p-3 bg-brand-brown/5 border-b border-brand-brown/10 flex justify-between items-center">
                                          <h4 className="font-bold text-brand-text text-lg">{unit.title}</h4>
                                          <button 
                                            onClick={() => openAddLessonModal(course.id, unit.id)}
                                            className="text-xs bg-brand-brown text-white px-3 py-1.5 rounded-lg hover:bg-brand-brown/80 transition-colors flex items-center gap-1 font-bold"
                                          >
                                              <Plus className="w-3 h-3" /> إضافة درس/محاضرة
                                          </button>
                                      </div>
                                      
                                      <div className="p-2 space-y-2">
                                          {unit.lessons.length === 0 ? (
                                              <p className="text-center text-xs text-brand-subtext py-2 opacity-60">لسه مفيش دروس مضافة في الجزء ده</p>
                                          ) : (
                                              unit.lessons.map(lesson => (
                                                  <div 
                                                    key={lesson.id}
                                                    onClick={() => cycleStatus(course.id, unit.id, lesson.id)}
                                                    className={`flex justify-between items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:translate-x-1 ${getStatusColor(lesson.status)}`}
                                                  >
                                                      <span className="font-bold text-sm">{lesson.title}</span>
                                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/40 dark:bg-black/20">
                                                          {getStatusLabel(lesson.status)}
                                                      </span>
                                                  </div>
                                              ))
                                          )}
                                      </div>
                                  </div>
                              ))}

                              {course.units.length === 0 && (
                                  <div className="text-center py-8 text-brand-subtext font-bold">
                                      لسه مفيش محتوى للمادة دي.
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
              </div>
          ))}

          {courses.length === 0 && (
              <div className="text-center py-16 border-4 border-dashed border-brand-brown/20 rounded-3xl opacity-50">
                  <BookOpen className="w-16 h-16 text-brand-brown mx-auto mb-4" />
                  <p className="text-xl font-bold text-brand-text">لسه مضافتش مواد؟</p>
                  <p className="text-brand-subtext">اضغط على "إضافة مادة جديدة" وابدأ رحلة الفرم.</p>
              </div>
          )}
      </div>

      {/* 4. ADD COURSE MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-brand-card w-full max-w-2xl rounded-3xl border-4 border-brand-brown shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-brand-brown/20 bg-brand-brown text-white flex justify-between items-center">
                      <div>
                          <h2 className="text-2xl font-black">إضافة مادة جديدة</h2>
                          <p className="text-white/70 text-sm font-bold">دخل تفاصيل المادة عشان تظبطها صح</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                      
                      {/* 1. Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-brand-text mb-2">اسم المادة</label>
                              <input 
                                type="text"
                                placeholder="مثال: فيزياء، تاريخ..."
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-brand-beige border-2 border-brand-brown/20 rounded-xl px-4 py-3 text-brand-text focus:border-brand-brown focus:outline-none font-bold"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-brand-text mb-2">اسم المدرس (اختياري)</label>
                              <input 
                                type="text"
                                placeholder="مثال: مستر محمد عبد المعبود"
                                value={formData.teacherName}
                                onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                                className="w-full bg-brand-beige border-2 border-brand-brown/20 rounded-xl px-4 py-3 text-brand-text focus:border-brand-brown focus:outline-none font-bold"
                              />
                          </div>
                      </div>

                      {/* 2. Mode & Color */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-brand-text mb-2">نظام المذاكرة</label>
                              <div className="flex bg-brand-beige p-1 rounded-xl border-2 border-brand-brown/20">
                                  <button 
                                    onClick={() => setFormData({...formData, mode: 'online'})}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.mode === 'online' ? 'bg-brand-brown text-white shadow' : 'text-brand-subtext'}`}
                                  >
                                      أونلاين 🌐
                                  </button>
                                  <button 
                                    onClick={() => setFormData({...formData, mode: 'offline'})}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.mode === 'offline' ? 'bg-brand-brown text-white shadow' : 'text-brand-subtext'}`}
                                  >
                                      سنتر 🏫
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-brand-text mb-2">لون المادة</label>
                              <div className="flex gap-2 flex-wrap">
                                  {colors.map(c => (
                                      <button 
                                        key={c}
                                        onClick={() => setFormData({...formData, color: c})}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'border-brand-text scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                      />
                                  ))}
                              </div>
                          </div>
                      </div>

                      <hr className="border-brand-brown/10" />

                      {/* 3. Structure Builder */}
                      <div>
                          <label className="block text-sm font-bold text-brand-text mb-2 flex items-center justify-between">
                              <span>محتوى المادة (الفروع / الوحدات / الأبواب)</span>
                              <span className="text-xs text-brand-subtext bg-brand-beige px-2 py-1 rounded">اختياري</span>
                          </label>
                          <p className="text-xs text-brand-subtext mb-3">
                              اكتب اسم الفرع أو الباب واضغط إضافة. (مثال: الباب الأول، الكهربية، التفاضل...)
                              <br/>
                              * الدروس والمحاضرات هتضيفها جوه كل فرع بعد الحفظ.
                          </p>
                          
                          <div className="flex gap-2 mb-3">
                              <input 
                                type="text"
                                placeholder="اسم الفرع أو الباب"
                                value={formData.tempItemInput}
                                onChange={(e) => setFormData({...formData, tempItemInput: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddItemToStructure()}
                                className="flex-1 bg-brand-beige border-2 border-brand-brown/20 rounded-xl px-4 py-2 text-brand-text focus:border-brand-brown focus:outline-none font-bold"
                              />
                              <button 
                                onClick={handleAddItemToStructure}
                                className="bg-brand-brown text-white px-4 rounded-xl hover:bg-brand-brown/80 font-bold"
                              >
                                  <Plus className="w-6 h-6" />
                              </button>
                          </div>

                          {/* List of added items */}
                          <div className="flex flex-wrap gap-2">
                              {formData.structureItems.map((item, idx) => (
                                  <div key={idx} className="bg-brand-beige border border-brand-brown/30 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-fade-in">
                                      <span className="font-bold text-brand-text text-sm">{item}</span>
                                      <button onClick={() => handleRemoveItemFromStructure(idx)} className="text-red-500 hover:bg-red-100 rounded-full p-0.5">
                                          <X className="w-3 h-3" />
                                      </button>
                                  </div>
                              ))}
                              {formData.structureItems.length === 0 && (
                                  <span className="text-xs text-brand-subtext italic">لسه مفيش فروع مضافة..</span>
                              )}
                          </div>
                      </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-brand-brown/10 bg-brand-beige flex justify-end gap-3">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 rounded-xl font-bold text-brand-subtext hover:bg-black/5 transition-colors"
                      >
                          إلغاء
                      </button>
                      <button 
                        onClick={handleSaveCourse}
                        className="bg-brand-brown text-white px-8 py-3 rounded-xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                      >
                          <Save className="w-5 h-5" />
                          حفظ المادة
                      </button>
                  </div>

              </div>
          </div>
      )}

      {/* 5. ADD LESSON MODAL (THE NEW PART) */}
      {lessonModal.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-brand-card w-full max-w-md rounded-3xl border-4 border-brand-brown shadow-2xl relative flex flex-col animate-fade-in-up">
                  
                  <div className="p-6 border-b border-brand-brown/20 bg-brand-brown text-white flex justify-between items-center rounded-t-[1.3rem]">
                      <h2 className="text-xl font-black flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          إضافة درس جديد
                      </h2>
                      <button 
                        onClick={() => setLessonModal({ ...lessonModal, isOpen: false })} 
                        className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-brand-text mb-2">عنوان الدرس / المحاضرة</label>
                          <input 
                            type="text"
                            autoFocus
                            placeholder="مثال: الحث الكهرومغناطيسي، المحاضرة الثالثة..."
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveLesson()}
                            className="w-full bg-brand-beige border-2 border-brand-brown/20 rounded-xl px-4 py-3 text-brand-text focus:border-brand-brown focus:outline-none font-bold"
                          />
                      </div>
                  </div>

                  <div className="p-6 border-t border-brand-brown/10 bg-brand-beige rounded-b-[1.3rem] flex justify-end gap-3">
                      <button 
                        onClick={() => setLessonModal({ ...lessonModal, isOpen: false })}
                        className="px-6 py-2.5 rounded-xl font-bold text-brand-subtext hover:bg-black/5 transition-colors"
                      >
                          إلغاء
                      </button>
                      <button 
                        onClick={handleSaveLesson}
                        className="bg-brand-brown text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                      >
                          <Plus className="w-5 h-5" />
                          إضافة
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default CurriculumMapper;
