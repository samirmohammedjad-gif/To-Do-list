
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Palette, X, Volume2, BellOff, Bird, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TimerProps {
  onSessionComplete: (minutes: number) => void;
  onExit: () => void; // New prop to close the study room
}

// 🎨 Themes Configuration
const THEMES = [
  { id: 'midnight', name: 'ليالي الشتاء', bg: 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]', accent: 'text-indigo-400', ring: 'border-indigo-500' },
  { id: 'forest', name: 'هدوء الغابة', bg: 'bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b]', accent: 'text-emerald-400', ring: 'border-emerald-500' },
  { id: 'ocean', name: 'عمق المحيط', bg: 'bg-gradient-to-br from-[#082f49] via-[#0c4a6e] to-[#075985]', accent: 'text-sky-400', ring: 'border-sky-500' },
  { id: 'sunset', name: 'غروب ملهم', bg: 'bg-gradient-to-br from-[#4a044e] via-[#701a75] to-[#831843]', accent: 'text-fuchsia-400', ring: 'border-fuchsia-500' },
  { id: 'royal', name: 'الملكي', bg: 'bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#581c87]', accent: 'text-violet-400', ring: 'border-violet-500' },
];

const MOTIVATIONAL_PHRASES = [
  "ركز.. حلمك يستاهل المعافرة 💪",
  "كل دقيقة تعب دلوقتي = راحة سنين قدام",
  "انت أقوى من الكسل.. دوس!",
  "استعن بالله ولا تعجز",
  "المستقبل بيتشكل في اللحظة دي",
  "افصل عن العالم.. واتصل بحلمك",
  "يا جبل ما يهزك ريح",
  "هانت جداً.. كمل للنهاية",
  "اصنع مجدك بيدك",
  "فرحة النتيجة تستاهل التعب ده"
];

const Timer: React.FC<TimerProps> = ({ onSessionComplete, onExit }) => {
  const { t } = useLanguage();
  
  // --- State ---
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [quote, setQuote] = useState(MOTIVATIONAL_PHRASES[0]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  
  // Custom Focus Duration Selection
  const [selectedDuration, setSelectedDuration] = useState(30);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Init Audio ---
  useEffect(() => {
    // Using a loud mechanical clock ring
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/mechanic_clock_ring.ogg');
    audioRef.current.loop = true; // Make it loop until stopped!
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- Quote Rotation ---
  useEffect(() => {
    if (isActive && mode === 'focus') {
      const interval = setInterval(() => {
        setQuote(MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);
      }, 45000); // Change every 45s
      return () => clearInterval(interval);
    }
  }, [isActive, mode]);

  // --- Handlers ---
  const handleTimerComplete = () => {
    setIsActive(false);
    setIsRinging(true); // Trigger Alarm UI
    
    // Play Alarm
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  };

  const stopAlarmAndProceed = () => {
    setIsRinging(false);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    // Logic for next state
    if (mode === 'focus') {
      onSessionComplete(selectedDuration);
      const newCount = sessionsCount + 1;
      setSessionsCount(newCount);

      // Pomodoro Logic: 3 Focus -> Long Break (30m), else Short Break (5m)
      if (newCount % 3 === 0) {
        setMode('longBreak');
        setTimeLeft(30 * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      }
    } else {
      // Break is over, back to Focus
      setMode('focus');
      setTimeLeft(selectedDuration * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsRinging(false);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    
    if (mode === 'focus') setTimeLeft(selectedDuration * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(30 * 60);
  };

  const setDuration = (mins: number) => {
    setSelectedDuration(mins);
    if (mode === 'focus' && !isActive) {
        setTimeLeft(mins * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = mode === 'focus' ? selectedDuration * 60 : (mode === 'longBreak' ? 30 * 60 : 5 * 60);
    return ((total - timeLeft) / total) * 100;
  };

  return (
    // Z-Index 100 covers standard nav/sidebar, using fixed inset-0 to take over screen
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-1000 ${currentTheme.bg} overflow-hidden font-sans`}>
      
      {/* --- BACKGROUND ANIMATIONS (Birds) --- */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[10%] -left-[10%] animate-fly-right duration-[25s]">
            <Bird className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-[20%] -right-[10%] animate-fly-left duration-[30s]">
            <Bird className="w-8 h-8 text-white" />
        </div>
        <div className="absolute bottom-[30%] -left-[10%] animate-fly-right duration-[40s]">
             <Bird className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Close Button */}
      <button 
        onClick={onExit}
        className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-red-500 hover:text-white text-white p-3 rounded-full transition-all backdrop-blur-md"
        title="خروج من الغرفة"
      >
        <X className="w-6 h-6" />
      </button>

      {/* --- ALARM OVERLAY (When Ringing) --- */}
      {isRinging && (
          <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-pulse">
              <Volume2 className="w-24 h-24 text-red-500 mb-8 animate-bounce" />
              <h1 className="text-5xl font-black text-white mb-8">انتهى الوقت يا بطل!</h1>
              <button 
                onClick={stopAlarmAndProceed}
                className="bg-white text-red-600 px-12 py-6 rounded-full text-3xl font-black hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.5)]"
              >
                 إيقاف المنبه 🔕
              </button>
          </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center">
        
        {/* Header: Mode & Session Info */}
        <div className="flex flex-col items-center gap-4 mb-8">
            <div className={`px-6 py-2 rounded-full border ${currentTheme.ring} bg-white/5 backdrop-blur-sm flex items-center gap-3 shadow-2xl`}>
                {mode === 'focus' ? <Brain className="w-6 h-6 text-white" /> : <Coffee className="w-6 h-6 text-yellow-400" />}
                <span className="text-2xl font-bold text-white tracking-wide">
                    {mode === 'focus' ? 'مود المذاكرة (الكهف)' : mode === 'shortBreak' ? 'استراحة محارب (5د)' : 'مكافأة (30د)'}
                </span>
            </div>
            
            {/* Session Dots */}
            <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-3 h-3 rounded-full transition-all ${i < (sessionsCount % 3) ? 'bg-white scale-110 shadow-glow' : 'bg-white/20'}`} 
                    />
                ))}
            </div>
        </div>

        {/* TIMER DISPLAY */}
        <div className="relative mb-12 select-none group">
             <h1 className={`text-[18vw] md:text-[14rem] font-black text-white leading-none tracking-tighter drop-shadow-2xl tabular-nums transition-all ${isActive ? 'scale-105' : 'scale-100'}`}>
                {formatTime(timeLeft)}
             </h1>
             
             {/* Progress Ring / Line */}
             <div className="absolute -bottom-4 left-0 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-white transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                   style={{ width: `${getProgress()}%` }}
                 ></div>
             </div>
        </div>

        {/* MOTIVATIONAL QUOTE */}
        <div className="h-16 mb-8 text-center flex items-center justify-center w-full px-4">
            <p className={`text-xl md:text-3xl font-medium text-white/90 animate-fade-in-up transition-all duration-500 drop-shadow-md`}>
               {isActive ? `"${quote}"` : "جاهز للفرم؟ اضبط وقتك وابدأ 🚀"}
            </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-8 mb-12">
             <button 
               onClick={toggleTimer}
               className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 ${isActive ? 'bg-white/10 border-2 border-white/50 text-white' : 'bg-white text-gray-900 shadow-[0_0_50px_-10px_rgba(255,255,255,0.6)]'}`}
             >
                {isActive ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
             </button>

             <button 
               onClick={resetTimer}
               className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
               title="إعادة ضبط"
             >
                <RotateCcw className="w-6 h-6" />
             </button>
        </div>

        {/* SETTINGS (Duration & Theme) */}
        <div className="bg-black/30 backdrop-blur-xl p-6 rounded-3xl border border-white/10 w-full max-w-2xl">
            {/* Durations */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 pb-6 border-b border-white/10">
                <span className="text-white/60 font-bold uppercase tracking-wider text-sm">مدة التركيز:</span>
                <div className="flex flex-wrap gap-3 justify-center">
                    {[30, 50, 60, 120].map((mins) => (
                        <button
                            key={mins}
                            onClick={() => { setDuration(mins); setMode('focus'); setIsActive(false); }}
                            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${selectedDuration === mins && mode === 'focus' ? 'bg-white text-gray-900 shadow-lg scale-105' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                        >
                            {mins} دقيقة
                        </button>
                    ))}
                </div>
            </div>

            {/* Themes */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <span className="text-white/60 font-bold uppercase tracking-wider text-sm">لون المود:</span>
                <div className="flex gap-3 justify-center">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setCurrentTheme(theme)}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${theme.bg.split(' ')[2].replace('to-', 'bg-')} ${currentTheme.id === theme.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110' : 'border-transparent opacity-60'}`}
                            title={theme.name}
                        />
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Timer;
