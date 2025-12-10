import React, { useState } from 'react';
import { HealthLog } from '../types';
import { Droplets, Moon, Smile, Utensils, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HealthTrackerProps {
  stats: HealthLog;
  updateStats: (newStats: HealthLog) => void;
}

const HEALTHY_SNACKS = [
  "طبق سلطة فواكه 🍎🍌",
  "زبادي بالعسل 🍯",
  "حفنة مكسرات نية 🥜",
  "ساندوتش جبنة قريش بالطماطم 🧀",
  "عصير برتقال فريش 🍊",
  "بيض مسلوق 🥚",
  "فيشار معمول في البيت 🍿"
];

const STRESS_TIPS = [
  "خد نفس عميق 4 ثواني.. اكتمه 4.. طلعه في 4.",
  "قوم اتمشى 5 دقايق في الأوضة.",
  "اشرب كوباية ينسون دافي.",
  "اسمع قرآن بصوت هادي.",
  "اغسل وشك بميه ساقعة."
];

const HealthTracker: React.FC<HealthTrackerProps> = ({ stats, updateStats }) => {
  const { t } = useLanguage();
  const [snack, setSnack] = useState(HEALTHY_SNACKS[0]);
  const [stressTip, setStressTip] = useState(STRESS_TIPS[0]);

  const addWater = () => {
    if (stats.waterCups < 10) {
      updateStats({ ...stats, waterCups: stats.waterCups + 1 });
    }
  };

  const setSleep = (hours: number) => {
    updateStats({ ...stats, sleepHours: hours });
  };

  const getWaterMessage = () => {
    if (stats.waterCups >= 8) return "ممتاز! جسمك رطب وجاهز للتركيز 💧";
    if (stats.waterCups >= 4) return "عاش.. كمل للنص التاني 🥤";
    return "لازم تشرب ميه عشان صداع المذاكرة يروح! 🤕";
  };

  const randomizeSnack = () => {
    setSnack(HEALTHY_SNACKS[Math.floor(Math.random() * HEALTHY_SNACKS.length)]);
  };

  const randomizeStressTip = () => {
    setStressTip(STRESS_TIPS[Math.floor(Math.random() * STRESS_TIPS.length)]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Water Tracker */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-3xl p-6 flex flex-col items-center text-center">
        <Droplets className="w-12 h-12 text-blue-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('waterTracker')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 min-h-[40px]">{getWaterMessage()}</p>
        
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={`w-8 h-12 rounded-full border-2 border-blue-400 transition-all duration-500 ${i < stats.waterCups ? 'bg-blue-500 scale-110' : 'bg-transparent'}`}
            ></div>
          ))}
        </div>
        
        <button 
          onClick={addWater}
          className="bg-blue-500 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
        >
          + كوباية
        </button>
      </div>

      {/* Sleep Tracker */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 flex flex-col items-center text-center">
        <Moon className="w-12 h-12 text-indigo-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('sleepTracker')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">نمت كام ساعة امبارح؟ (المثالي 7-8)</p>
        
        <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-6">
          {stats.sleepHours} <span className="text-lg text-gray-400">ساعة</span>
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => setSleep(Math.max(0, stats.sleepHours - 1))} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 font-bold text-xl">-</button>
          <button onClick={() => setSleep(Math.min(12, stats.sleepHours + 1))} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 font-bold text-xl">+</button>
        </div>
      </div>

      {/* Wellness & Food */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-3xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-lg text-green-800 dark:text-green-400 mb-2">
            <Utensils className="w-5 h-5" /> {t('healthySnack')}
          </h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-100 dark:border-green-900/50 shadow-sm cursor-pointer hover:bg-green-50 transition-colors" onClick={randomizeSnack}>
            <p className="font-medium text-gray-800 dark:text-gray-200">{snack}</p>
            <p className="text-xs text-gray-400 mt-1">(اضغط لاقتراح تاني)</p>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-bold text-lg text-purple-800 dark:text-purple-400 mb-2">
            <Smile className="w-5 h-5" /> {t('stressRelief')}
          </h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm cursor-pointer hover:bg-purple-50 transition-colors" onClick={randomizeStressTip}>
             <p className="font-medium text-gray-800 dark:text-gray-200">{stressTip}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HealthTracker;