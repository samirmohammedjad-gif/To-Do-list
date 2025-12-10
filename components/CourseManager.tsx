
import React, { useState } from 'react';
import { Course } from '../types';
import { Plus, Book, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CourseManagerProps {
  courses: Course[];
  addCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
}

const CourseManager: React.FC<CourseManagerProps> = ({ courses, addCourse, deleteCourse }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    credits: 3,
    difficulty: 'Medium',
    currentGrade: 90,
    color: '#6366f1'
  });
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourse.name) {
      addCourse({
        id: Date.now().toString(),
        name: newCourse.name,
        credits: newCourse.credits || 3,
        difficulty: newCourse.difficulty as 'Easy' | 'Medium' | 'Hard',
        color: newCourse.color || '#6366f1',
        currentGrade: newCourse.currentGrade,
        units: []
      });
      setIsAdding(false);
      setNewCourse({ name: '', credits: 3, difficulty: 'Medium', currentGrade: 90, color: '#6366f1' });
    }
  };

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('courses')}</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('addCourse')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg animate-fade-in-down">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('courseName')}</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newCourse.name}
                onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                placeholder="e.g. Advanced Calculus"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('credits')}</label>
              <input 
                type="number" 
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newCourse.credits}
                onChange={e => setNewCourse({...newCourse, credits: Number(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentGrade')}</label>
              <input 
                type="number" 
                min="0" max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newCourse.currentGrade}
                onChange={e => setNewCourse({...newCourse, currentGrade: Number(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('difficulty')}</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newCourse.difficulty}
                onChange={e => setNewCourse({...newCourse, difficulty: e.target.value as any})}
              >
                <option value="Easy">{t('easy')}</option>
                <option value="Medium">{t('medium')}</option>
                <option value="Hard">{t('hard')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('colorTag')}</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCourse({...newCourse, color: c})}
                    className={`w-6 h-6 rounded-full border-2 ${newCourse.color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {t('saveCourse')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="h-2" style={{ backgroundColor: course.color }}></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Book className="w-6 h-6 text-gray-600" />
                </div>
                <button 
                  onClick={() => deleteCourse(course.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{course.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{course.credits} Credits • {course.difficulty}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Grade</span>
                  <span style={{ color: course.color }}>{course.currentGrade}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ width: `${course.currentGrade}%`, backgroundColor: course.color }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManager;
