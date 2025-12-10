import React from 'react';
import { Course } from '../types';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PredictorProps {
  courses: Course[];
  updateCourse: (course: Course) => void;
}

const Predictor: React.FC<PredictorProps> = ({ courses, updateCourse }) => {
  const { t } = useLanguage();

  const calculateTotal = (useTarget = false) => {
      let totalWeightedScore = 0;
      let totalWeights = 0;

      courses.forEach(c => {
          const score = useTarget ? (c.targetGrade || c.currentGrade || 0) : (c.currentGrade || 0);
          totalWeightedScore += score * c.credits;
          totalWeights += c.credits;
      });

      return totalWeights === 0 ? 0 : (totalWeightedScore / totalWeights).toFixed(2);
  };

  const currentTotal = calculateTotal(false);
  const potentialTotal = calculateTotal(true);

  // Find motivation: Subject with biggest gap
  let biggestGapCourse = null;
  let maxGap = 0;
  courses.forEach(c => {
      const gap = (c.targetGrade || 0) - (c.currentGrade || 0);
      if (gap > maxGap) {
          maxGap = gap;
          biggestGapCourse = c;
      }
  });

  const handleGradeChange = (id: string, field: 'currentGrade' | 'targetGrade', value: string) => {
      const course = courses.find(c => c.id === id);
      if (!course) return;
      updateCourse({ ...course, [field]: Number(value) });
  };

  const simulateImprovement = () => {
      // Add 5% to the lowest scoring course
      const lowest = [...courses].sort((a,b) => (a.currentGrade || 0) - (b.currentGrade || 0))[0];
      if (lowest) {
          updateCourse({ ...lowest, currentGrade: Math.min(100, (lowest.currentGrade || 0) + 5) });
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <header>
            <h2 className="text-2xl font-bold text-gray-900">{t('predictorTitle')}</h2>
            <p className="text-gray-500">{t('predictorSubtitle')}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('currentTotal')}</span>
                <span className="text-6xl font-black text-gray-900 mt-2">{currentTotal}%</span>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg text-white flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-sm font-bold text-indigo-200 uppercase tracking-widest relative z-10">{t('potentialTotal')}</span>
                <span className="text-6xl font-black text-white mt-2 relative z-10">{potentialTotal}%</span>
                <TrendingUp className="absolute bottom-0 right-0 w-32 h-32 text-white/10" />
            </div>
        </div>

        {biggestGapCourse && (
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-yellow-800">Insight</h4>
                    <p className="text-yellow-700 text-sm">
                        {t('motivationMsg')
                            .replace('{subject}', (biggestGapCourse as Course).name)
                            .replace('{score}', potentialTotal.toString())}
                    </p>
                </div>
            </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Simulator</h3>
                <button 
                    onClick={simulateImprovement}
                    className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50"
                >
                    <RefreshCw className="w-3 h-3" /> {t('simulate')}
                </button>
            </div>
            <div className="divide-y divide-gray-100">
                {courses.map(course => (
                    <div key={course.id} className="p-4 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 flex items-center gap-3 w-full">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }}></div>
                            <div>
                                <h4 className="font-bold text-gray-900">{course.name}</h4>
                                <p className="text-xs text-gray-500">Weight: {course.credits}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Current</label>
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={course.currentGrade || 0}
                                    onChange={(e) => handleGradeChange(course.id, 'currentGrade', e.target.value)}
                                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center font-bold"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-indigo-500 mb-1 block">Target</label>
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={course.targetGrade || 0}
                                    onChange={(e) => handleGradeChange(course.id, 'targetGrade', e.target.value)}
                                    className="w-20 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg px-2 py-1 text-center font-bold"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Predictor;