
import React, { useState, useEffect, useRef } from 'react';
import { Task, Course, UserStats } from '../types';
import { Clock, AlertTriangle, Sparkles, Quote, Edit2, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  tasks: Task[];
  courses: Course[];
  stats: UserStats;
  onNavigateTo: (view: string) => void;
}

const MOTIVATIONAL_QUOTES = [
  "التعب هيروح.. بس الفرحة والمجموع هيفضلوا معاك العمر كله. استرجل!",
  "قوم دلوقتي وافرم، محدش هيحقق حلمك غيرك.",
  "كل دقيقة تعب دلوقتي = راحة سنين قدام.",
  "انت مش قليل.. انت تقدر تعمل المعجزة.",
  "فرحة أهلك يوم النتيجة تستاهل إنك تموت نفسك مذاكرة.",
  "متخليش السرير يسرق مستقبلك، قوم!",
  "الدحيح مش أحسن منك، هو بس بدأ بدري عنك.. ابدأ دلوقتي.",
  "عافر.. حلمك مش ببلاش.",
  "اللي ذاكر ذاكر؟ لا طبعاً.. العبرة بالخواتيم يا بطل.",
  "يا جبل ما يهزك ريح، الثانوية دي مجرد سلمة لمجدك.",
  "انت قدها وقدود، وربنا مبيحطش حلم في قلبك غير وهو عارف إنك تقدر عليه.",
  "بكرة تفتكر الأيام دي وتضحك وتقول: عداها الوحش.",
  "النجاح مش صدفة، النجاح قرار.. خد القرار دلوقتي.",
  "كل مسألة بتحلها بتقربك خطوة لحلمك.",
  "متستناش الظروف تتحسن، اصنع انت الظروف.",
  "خاف من الفشل؟ لا، خاف إنك متكونش حاولت كفاية.",
  "خليك فاكر: (وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ).",
  "المجموع الكبير عايز قلب حديد ومجهود جبار.",
  "قوم اغسل وشك واستعذ بالله وابدأ.. البداية نص الطريق.",
  "الوقت كالسيف.. اقطعه بمذاكرتك قبل ما يقطع أحلامك.",
  "ركز في ورقتك، ملكش دعوة بغيرك، انت في سباق مع نفسك.",
  "صاحب الناس اللي تشدك لفوق، وابعد عن المحبطين.",
  "تخيل اسمك في كشوف الأوائل.. الإحساس ده يستاهل.",
  "مفيش مستحيل طالما فيه نفس داخل وطالع.",
  "كل ما تتعب افتكر فرحة أمك وهي بتزغرط يوم النتيجة.",
  "اجمد.. الأبطال بيبانوا في الأمتار الأخيرة.",
  "ذاكر كأن مستقبلك كله واقف على الكلمة دي.",
  "السهر والتعب والهالات السوداء.. دي نياشين الشرف لطالب ثانوية.",
  "متيأسش.. لسه في وقت تلم اللي فاتك وتسبق كمان.",
  "خليك طماع في درجاتك، متسيبش ولا نص درجة.",
  "نظم وقتك، رتب أولوياتك، وشوف السحر هيحصل إزاي.",
  "المذاكرة مش عقاب، دي وسيلة عشان تعيش حياة كريمة.",
  "كونك طالب ثانوية عامة دي مسؤولية ورجولة.. كن قدر المسؤولية.",
  "ارمي التليفون شوية.. الدنيا مش هتطير، بس مستقبلك ممكن يطير.",
  "عافر عشان تلبس البالطو الأبيض أو خوذة المهندس.",
  "ربنا كريم أوي، بس لازم يشوف منك السعي.",
  "متذاكرش عشان تنجح، ذاكر عشان تتميز.",
  "خلي طموحك يناطح السحاب.",
  "انت بطل حكايتك.. اكتب نهاية سعيدة.",
  "الفشل هو إنك تبطل تحاول.. طول ما بتحاول انت ناجح.",
  "استغل كل دقيقة، الدقيقة في ثانوية عامة بدرجات.",
  "متخليش حاجة تشتتك، هدفك واضح قدام عينك.",
  "ثق في نفسك وفي قدراتك، انت تقدر تفرم المنهج.",
  "المعافرة هي سر الوصول.",
  "اصبر.. (إِنَّ مَعَ الْعُسْرِ يُسْرًا).",
  "كل درس بتخلصه هو انتصار صغير.",
  "كافئ نفسك بعد كل إنجاز، عشان تقدر تكمل.",
  "نام كويس، كل كويس، وافرم مذاكرة.. المعادلة بسيطة.",
  "اكتب حلمك وعلقه قدامك.. خليه هو البوصلة.",
  "انت مش لوحدك، ربنا معاك ودعوات أهلك سنداك.",
  "بلاش تأجيل.. التسويف هو مقبرة الأحلام.",
  "ابدأ بالصعب وارتاح، ولا تبدأ بالسهل وتكسل.",
  "حل كتير.. الحل هو اللي بيثبت المعلومة.",
  "اغلط دلوقتي في التدريبات عشان متغلطش في الامتحان.",
  "كل غلطة بتتعلم منها بتقربك للدرجة النهائية.",
  "خليك ذكي في مذاكرتك، افهم قبل ما تحفظ.",
  "الكتب دي هي سلاحك في المعركة، حافظ عليها وافهمها.",
  "خليك رخم في المذاكرة، متسيبش المعلومة غير لما تفهمها.",
  "اسأل المدرس، ابحث، دور.. العلم بيحب اللحوح.",
  "تخيل نفسك وانت داخل الكلية اللي بتحلم بيها.",
  "يوم النتيجة هتقول: الحمد لله الذي بنعمته تتم الصالحات.",
  "مجهودك مش هيضيع، ربنا عادل.",
  "خلي عندك يقين بالله.",
  "التوتر طبيعي، حوله لطاقة مذاكرة.",
  "خد نفس عميق وقول: يا رب.",
  "انت مشروع عظيم.. استثمر في نفسك.",
  "الدنيا بتمطر فرص، وانت لازم تكون جاهز.",
  "بلاش حجج.. الناجح بيخلق طريق.",
  "القمة تسع الجميع، بس محتاجة اللي يتعب لها.",
  "متسمعش لكلام الناس اللي بيقولوا (المواد صعبة).. انت أصعب.",
  "المادة الصعبة محتاجة تكرار مش يأس.",
  "راجع أول بأول، التراكمات هي العدو.",
  "خليك منظم، الفوضى بتضيع الوقت.",
  "صلي وادعي.. الدعاء بيغير القدر.",
  "بر الوالدين مفتاح النجاح.. اطلب رضاهم.",
  "خليك إيجابي.. تفاءلوا بالخير تجدوه.",
  "انت قد التحدي.. اثبت لنفسك إنك بطل.",
  "مفيش حاجة اسمها (أنا فاشل).. فيه حاجة اسمها (أنا لسه بحاول).",
  "كل العظماء بدأوا بخطوة.. ابدأ خطوتك.",
  "النجاح طعمه حلو أوي، يستاهل كل مرارة التعب.",
  "اتعب دلوقتي وارتاح بقية عمرك.",
  "اصنع لنفسك مجداً.",
  "الكتب أوفى صديق ليك السنة دي.",
  "بلاش تضيع وقت في الخروجات، بكرة تخرج وتسافر العالم كله.",
  "ركز في هدفك زي الصقر.",
  "خليك عنيد مع المسائل الصعبة.",
  "متستقلش بقدراتك، عقلك ده كنز.",
  "المذاكرة عبادة.. جدد نيتك.",
  "ساعد زمايلك، (والله في عون العبد ما كان العبد في عون أخيه).",
  "ابعد عن الغش، النجاح الحرام ملوش طعم.",
  "خليك أمين مع نفسك في المذاكرة.",
  "قيم مستواك بصدق وحاول تحسن.",
  "اسمع نصايح المدرسين، هما الخبرة.",
  "بلاش توتر الامتحانات، الامتحان مجرد ورق، وانت أكبر منه.",
  "خليك واثق، الثقة نص النجاح.",
  "يا رب توفيقك.. دي الكلمة اللي تريح قلبك.",
  "استعينوا بالصبر والصلاة.",
  "ربنا مبيظلمش حد.. اطمن.",
  "اجتهد.. ولكل مجتهد نصيب.",
  "السنة دي هي سنة الحصاد.. ازرع صح تحصد دهب.",
  "كلنا فخورين بيك وبمجهودك.. كمل يا بطل!"
];

const Dashboard: React.FC<DashboardProps> = ({ tasks, courses, stats, onNavigateTo }) => {
  const { t } = useLanguage();
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [fadeKey, setFadeKey] = useState(0);

  // Background Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [examDate, setExamDate] = useState<Date>(() => {
    const saved = localStorage.getItem('examDate');
    return saved ? new Date(saved) : new Date('2026-06-20T00:00:00');
  });
  const [isEditingDate, setIsEditingDate] = useState(false);

  // Canvas Effect (Particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {x: number, y: number, r: number, dx: number, dy: number, a: number}[] = [];
    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init Particles
    for(let i=0; i<30; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            a: Math.random() * 0.5
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if(p.x < 0) p.x = canvas.width;
            if(p.x > canvas.width) p.x = 0;
            if(p.y < 0) p.y = canvas.height;
            if(p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.a})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    // Random Quote on Load
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    
    const interval = setInterval(() => {
      setFadeKey(prev => prev + 1);
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote(randomQuote);
    }, 15000); // Faster Rotation (15s)
    return () => clearInterval(interval);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      setExamDate(newDate);
      localStorage.setItem('examDate', newDate.toISOString());
      setIsEditingDate(false);
    }
  };

  const daysLeft = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            {/* Responsive Text Size */}
            <h1 className="text-3xl md:text-5xl font-black text-brand-text flex items-center gap-2 animate-float" style={{ animationDuration: '8s' }}>
              {t('hello')}
            </h1>
            <p className="text-brand-subtext mt-2 text-lg md:text-xl font-medium">{t('dashboardSubtitle')}</p>
        </div>
        
        <div className="relative group animate-fade-in-up w-full md:w-auto" style={{ animationDelay: '0.1s' }}>
          {/* Days Left Card - Night Bordeaux */}
          <div 
            className="bg-brand-brown text-white px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-xl flex items-center justify-between md:justify-start gap-4 cursor-pointer hover:bg-brand-brown/80 transition-colors border border-white/10 w-full relative overflow-hidden" 
            onClick={() => setIsEditingDate(true)}
          >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                  <Clock className="w-8 h-8 text-white/80 animate-pulse-slow" />
                  <div>
                      {isEditingDate ? (
                        <input 
                          type="date" 
                          className="bg-brand-black border border-brand-brown rounded p-1 text-white text-sm focus:outline-none"
                          defaultValue={examDate.toISOString().split('T')[0]}
                          onBlur={() => setIsEditingDate(false)}
                          onChange={handleDateChange}
                          autoFocus
                        />
                      ) : (
                        <>
                          <p className="text-3xl md:text-4xl font-black leading-none drop-shadow-sm">{Math.max(0, daysLeft)}</p>
                          <p className="text-xs font-bold text-white/80 uppercase tracking-wide mt-1">{t('daysLeft')}</p>
                        </>
                      )}
                  </div>
              </div>
          </div>
          {!isEditingDate && (
             <div className="absolute -top-2 -right-2 bg-brand-brown rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white border border-white/20">
               <Edit2 className="w-3 h-3" />
             </div>
          )}
        </div>
      </header>

      {/* Motivational Card - Night Bordeaux with Particles */}
      <div className="w-full relative p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden group transition-all duration-500 hover:shadow-brand-brown/50 border-4 border-brand-brown animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 bg-brand-brown"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-transparent to-white/5"></div>
            
            {/* Canvas for Particles */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"></canvas>

            {/* Quote Icons */}
            <Quote className="hidden md:block w-20 h-20 text-white/10 absolute top-4 right-6 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
            <Quote className="hidden md:block w-20 h-20 text-white/10 absolute bottom-4 left-6 rotate-12 scale-x-[-1] transition-transform duration-700 group-hover:rotate-0 group-hover:scale-x-[-1] group-hover:scale-110" />
            
            {/* Content */}
            <div key={fadeKey} className="relative z-10 flex flex-col items-center justify-center min-h-[180px] text-center animate-fade-in-up">
              <Sparkles className="w-8 h-8 text-yellow-400 mb-6 animate-spin-slow opacity-80" />
              <p className="text-2xl md:text-4xl font-black leading-snug text-white drop-shadow-md font-cairo max-w-4xl px-2">
                  "{quote}"
              </p>
              <div className="mt-8 w-24 h-1.5 bg-white/20 rounded-full group-hover:w-48 transition-all duration-700 ease-out"></div>
            </div>
      </div>

      {/* Task Inbox - Updated to Dark Theme + Bordeaux Border */}
      <div className="grid grid-cols-1 gap-8 pt-6">
          <div className="bg-brand-card rounded-[2rem] md:rounded-[2.5rem] border-2 border-brand-brown shadow-[0_4px_20px_-10px_rgba(72,22,32,0.3)] p-6 md:p-8 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
              {/* Subtle Texture */}
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

              <div className="flex justify-between items-center mb-6 relative z-10">
                 <h3 className="text-xl md:text-2xl font-black text-brand-text flex items-center gap-3">
                   <div className="p-2 bg-brand-brown rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white fill-current" />
                   </div>
                   {t('taskOrganizer')}
                 </h3>
                 <button onClick={() => onNavigateTo('tasks')} className="bg-brand-brown/20 border border-brand-brown p-2 rounded-xl hover:bg-brand-brown hover:text-white transition-all text-brand-brown">
                     <AlertTriangle className="w-5 h-5" />
                 </button>
             </div>
             
             <div className="space-y-4 relative z-10">
                 {tasks.slice(0, 3).map((task, idx) => (
                     <div key={task.id} className="flex items-center gap-4 p-4 md:p-5 bg-brand-beige rounded-2xl border border-brand-brown/10 hover:border-brand-brown hover:bg-brand-brown/5 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}>
                         <div className={`w-4 h-4 rounded-full shadow-sm ring-2 ring-offset-2 ring-offset-brand-beige flex-shrink-0 ${task.priority === 'High' ? 'bg-red-500 ring-red-500/50 animate-pulse' : 'bg-gray-500 ring-gray-400'}`}></div>
                         <div className="flex-1 min-w-0">
                             <p className="text-base md:text-lg font-bold text-brand-text line-clamp-1 group-hover:text-brand-brown transition-colors truncate">{task.title}</p>
                             <p className="text-xs text-brand-subtext font-medium mt-1">{new Date(task.dueDate).toLocaleDateString()}</p>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-2 h-2 rounded-full bg-brand-brown"></div>
                         </div>
                     </div>
                 ))}
                 
                 {tasks.length === 0 && (
                     <div className="py-10 text-center bg-brand-beige rounded-2xl border-2 border-dashed border-brand-brown/20">
                        <p className="text-brand-subtext font-bold">{t('noTasksFound')}</p>
                     </div>
                 )}
                 
                 <button 
                    onClick={() => onNavigateTo('tasks')}
                    className="w-full py-4 md:py-5 text-center text-sm font-bold text-gray-400 border-2 border-dashed border-brand-brown/30 rounded-2xl hover:bg-brand-brown hover:text-white hover:border-brand-brown mt-4 transition-all duration-300 hover:scale-[1.01]"
                 >
                     + {t('addTaskNaturally')}
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
