
import React, { useState, useEffect, useRef } from 'react';
import { ScheduleBlock } from '../types';
import { Moon, MapPin, Heart, Bell, BellOff, CheckCircle2, Repeat, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ScheduleManagerProps {
  schedule: ScheduleBlock[];
  addBlock: (block: ScheduleBlock) => void;
  deleteBlock: (id: string) => void;
}

interface PrayerTime {
  name: string;
  time: string; // HH:MM (24h)
  displayTime: string; // 12h Format
  dateObj?: string; // Stored as ISO string for serialization
  key: string;
}

interface DhikrItem {
  text: string;
  count: number;
  source: string;
  virtue?: string;
}

// Quranic Messages per Prayer
const PRAYER_MESSAGES: Record<string, string> = {
  Fajr: "أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا",
  Sunrise: "وَالضُّحَىٰ * وَاللَّيْلِ إِذَا سَجَىٰ * مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
  Dhuhr: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ",
  Asr: "وَالْعَصْرِ * إِنَّ الْإِنسَانَ لَفِي خُسْرٍ * إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ",
  Maghrib: "فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ",
  Isha: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
};

const TASBEEH_WORDS = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "لَا إِلَهَ إِلَّا اللَّهُ", "اللَّهُ أَكْبَرُ", "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ"];

const ATHKAR_DATA: Record<string, DhikrItem[]> = {
    morning: [
        { text: "اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ", count: 1, source: "آية الكرسي - البقرة:255" },
        { text: "أصبحنا على فطرة الإسلام وكلِمة الإخلاص، ودين نبينا محمد صلى الله عليه وسلم، ومِلَّةِ أبينا إبراهيم، حنيفاً مسلماً، وما كان من المشركين.", count: 1, source: "رواه أحمد" },
        { text: "رضيت بالله ربا، وبالإسلام دينا، وبمحمد صلى الله عليه وسلم نبياً.", count: 3, source: "رواه أصحاب السنن" },
        { text: "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً.", count: 1, source: "رواه ابن ماجه" },
        { text: "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.", count: 1, source: "رواه أصحاب السنن" },
        { text: "لا إله إلا الله وحده، لا شريك له، له الملك، وله الحمد، وهو على كل شيء قدير.", count: 1, source: "رواه البزار والطبراني" },
        { text: "يا حيُّ يا قيوم برحمتك أستغيثُ، أصلح لي شأني كله، ولا تَكلني إلى نفسي طَرْفَةَ عين أبدًا.", count: 1, source: "رواه البزار" },
        { text: "اللهم أنت ربي، لا إله إلا أنت، خلقتني وأنا عبدُك, وأنا على عهدِك ووعدِك ما استطعتُ، أعوذ بك من شر ما صنعتُ، أبوءُ لَكَ بنعمتكَ عَلَيَّ، وأبوء بذنبي، فاغفر لي، فإنه لا يغفرُ الذنوب إلا أنت.", count: 1, source: "سيد الاستغفار - رواه البخاري" },
        { text: "اللهم فاطر السموات والأرض، عالم الغيب والشهادة، رب كل شيء ومليكه، أشهد أن لا إله إلا أنت, أعوذ بك من شرّ نفسي، ومن شرّ الشيطان وشركه، وأن أقترف على نفسي سوءا، أو أجره إلى مسلم.", count: 1, source: "رواه الترمذي" },
        { text: "أصبحنا وأصبح الملك لله، والحمد لله ولا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير، أسألك خير ما في هذا اليوم، وخير ما بعده، وأعوذ بك من شر هذا اليوم، وشر ما بعده، وأعوذ بك من الكسل وسوء الكبر، وأعوذ بك من عذاب النار وعذاب القبر.", count: 1, source: "رواه مسلم" },
        { text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة، اللهم أسألك العفو والعافية في ديني ودنياي وأهلي ومالي، اللهم استر عوراتي، وآمن روعاتي، واحفظني من بين يدي، ومن خلفي، وعن يميني، وعن شمالي، ومن فوقي، وأعوذ بك أن أغتال من تحتي.", count: 1, source: "رواه أبو داود وابن ماجه" },
        { text: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم.", count: 3, source: "رواه أصحاب السنن" },
        { text: "سبحان الله عدد خلقه، سبحان الله رضا نفسه، سبحان الله زنة عرشه، سبحان الله مداد كلماته.", count: 3, source: "رواه مسلم" },
        { text: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت، اللهم إني أعوذ بك من الكفر والفقر، اللهم إني أعوذ بك من عذاب القبر، لا إله إلا أنت.", count: 3, source: "رواه أبو داود" },
        { text: "قراءة سور: الإخلاص، والفلق، والناس.", count: 3, source: "رواه الترمذي" },
        { text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم", count: 7, source: "رواه أبو داود" },
        { text: "اللهم إني أصبحت، أُشهدك وأُشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله، وحدك لا شريك لك وأن محمداً عبدك ورسولك.", count: 4, source: "أبو داود والترمذي" },
        { text: "لا إله إلا الله وحده، لا شريك له، له الملك، وله الحمد، يحيي ويميت، وهو على كل شيء قدير.", count: 10, source: "رواه ابن حبان" },
        { text: "سبحان الله وبحمده.", count: 100, source: "رواه مسلم" },
        { text: "أستغفر الله.", count: 100, source: "رواه ابن أبي شيبة" },
        { text: "سبحان الله، والحمد لله، والله أكبر, لا إله إلا الله وحده، لا شريك له، له الملك، وله الحمد، وهوعلى كل شيء قدير.", count: 100, source: "رواه الترمذي" }
    ],
    evening: [
        { text: "اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ...", count: 1, source: "آية الكرسي" },
        { text: "أمسينا على فطرة الإسلام وكلِمة الإخلاص، ودين نبينا محمد صلى الله عليه وسلم، ومِلَّةِ أبينا إبراهيم، حنيفاً مسلماً، وما كان من المشركين.", count: 1, source: "رواه أحمد" },
        { text: "رضيت بالله ربا، وبالإسلام دينا، وبمحمد صلى الله عليه وسلم نبياً.", count: 3, source: "رواه أصحاب السنن" },
        { text: "اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير.", count: 1, source: "رواه أصحاب السنن" },
        { text: "لا إله إلا الله وحده، لا شريك له، له الملك، وله الحمد، وهو على كل شيء قدير.", count: 1, source: "رواه البزار والطبراني" },
        { text: "يا حيُّ يا قيوم برحمتك أستغيثُ، أصلح لي شأني كله، ولا تَكلني إلى نفسي طَرْفَةَ عين أبدًا.", count: 1, source: "رواه البزار" },
        { text: "اللهم أنت ربي، لا إله إلا أنت، خلقتني وأنا عبدُك, وأنا على عهدِك ووعدِك ما استطعتُ...", count: 1, source: "سيد الاستغفار" },
        { text: "اللهم فاطر السموات والأرض، عالم الغيب والشهادة، رب كل شيء ومليكه...", count: 1, source: "رواه الترمذي" },
        { text: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له...", count: 1, source: "رواه مسلم" },
        { text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة...", count: 1, source: "رواه أبو داود" },
        { text: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم.", count: 3, source: "رواه أصحاب السنن" },
        { text: "أعوذ بكلمات الله التامَّات من شر ما خلق.", count: 3, source: "رواه مسلم" },
        { text: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري...", count: 3, source: "رواه أبو داود" },
        { text: "قراءة سور: الإخلاص، والفلق، والناس.", count: 3, source: "رواه الترمذي" },
        { text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم", count: 7, source: "رواه أبو داود" },
        { text: "اللهم إني أمسيت أُشهدك، وأُشهد حملة عرشك، وملائكتك وجميع خلقك...", count: 4, source: "رواه أبو داود والترمذي" },
        { text: "لا إله إلا الله وحده، لا شريك له، له الملك، وله الحمد، يحيي ويميت، وهو على كل شيء قدير.", count: 10, source: "رواه ابن حبان" },
        { text: "سبحان الله وبحمده.", count: 100, source: "رواه مسلم" },
        { text: "أستغفر الله.", count: 100, source: "رواه ابن أبي شيبة" },
        { text: "سبحان الله، والحمد لله، والله أكبر, لا إله إلا الله وحده...", count: 100, source: "رواه الترمذي" }
    ],
    study: [
        { text: "اللهم لا سهل إلا ما جعلته سهلاً، وأنت تجعل الحزن إذا شئت سهلاً.", count: 1, source: "دعاء الاستفتاح" },
        { text: "رب اشرح لي صدري ويسر لي أمري واحلل عقدة من لساني يفقهوا قولي.", count: 1, source: "طه:25-28" },
        { text: "اللهم إني أستودعك ما قرأت وما حفظت وما تعلمت فرده عند حاجتي إليه.", count: 1, source: "دعاء الحفظ" },
        { text: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.", count: 1, source: "دعاء الكرب" }
    ]
};

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ schedule }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'prayers' | 'athkar'>('prayers');
  const [counts, setCounts] = useState<Record<string, number>>({});
  
  // Location
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  
  // Prayers State - Initialize from LocalStorage for instant load
  const [prayers, setPrayers] = useState<PrayerTime[]>(() => {
    try {
        const cached = localStorage.getItem('cached_prayers');
        const cachedDate = localStorage.getItem('cached_prayers_date');
        const today = new Date().toDateString();
        
        if (cached && cachedDate === today) {
            return JSON.parse(cached);
        }
    } catch(e) { console.error(e) }
    return [];
  });

  const [nextPrayerIndex, setNextPrayerIndex] = useState<number>(-1);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Features
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentAthkarCategory, setCurrentAthkarCategory] = useState<'morning' | 'evening' | 'study'>('morning');
  const [tasbeehIndex, setTasbeehIndex] = useState(0);
  
  // Alarm State
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const [alarmPlayedFor, setAlarmPlayedFor] = useState<string>(''); // Tracks which prayer triggered alarm

  // Helper: Format Time 12h
  const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const m = parseInt(minutes);
    const ampm = h >= 12 ? t('pm') : t('am');
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
  };

  const handleDhikrClick = (key: string, target: number) => {
    setCounts(prev => {
        const current = prev[key] || 0;
        if (current < target) {
            // Optional: Vibrate on mobile if supported
            if (navigator.vibrate) navigator.vibrate(50);
            return { ...prev, [key]: current + 1 };
        }
        return prev;
    });
  };

  // Tasbeeh Rotation
  useEffect(() => {
    const interval = setInterval(() => {
        setTasbeehIndex(prev => (prev + 1) % TASBEEH_WORDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1. Initial Load (Location & Prefs)
  useEffect(() => {
    const notifPref = localStorage.getItem('notificationsEnabled');
    if (notifPref === 'true') setNotificationsEnabled(true);
    
    // Init Audio
    alarmRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    address: "Detected Location"
                });
            },
            (error) => {
                console.error("Location Error:", error);
                // Fallback to Cairo if permission denied
                setLocation({ lat: 30.0444, lng: 31.2357, address: "Cairo (Default)" });
            }
        );
    } else {
        setLocation({ lat: 30.0444, lng: 31.2357, address: "Cairo (Default)" });
    }
  }, []);

  // 2. Fetch Data (Prayers Only) - Background Update
  useEffect(() => {
    if (!location) return;

    const fetchData = async () => {
        try {
            const date = new Date();
            const dateStr = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
            
            // Prayers
            const prayerRes = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${location.lat}&longitude=${location.lng}&method=5`);
            const prayerData = await prayerRes.json();
            
            if (prayerData.data && prayerData.data.timings) {
                const timings = prayerData.data.timings;
                const pList: PrayerTime[] = [
                    { name: t('prayerFajr'), time: timings.Fajr, displayTime: formatTime12h(timings.Fajr), key: 'Fajr' },
                    { name: t('prayerSunrise'), time: timings.Sunrise, displayTime: formatTime12h(timings.Sunrise), key: 'Sunrise' },
                    { name: t('prayerDhuhr'), time: timings.Dhuhr, displayTime: formatTime12h(timings.Dhuhr), key: 'Dhuhr' },
                    { name: t('prayerAsr'), time: timings.Asr, displayTime: formatTime12h(timings.Asr), key: 'Asr' },
                    { name: t('prayerMaghrib'), time: timings.Maghrib, displayTime: formatTime12h(timings.Maghrib), key: 'Maghrib' },
                    { name: t('prayerIsha'), time: timings.Isha, displayTime: formatTime12h(timings.Isha), key: 'Isha' },
                ];
                
                // Add Date Objects strings for caching compatibility
                pList.forEach(p => {
                    const [hours, minutes] = p.time.split(':');
                    const d = new Date();
                    d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    p.dateObj = d.toISOString();
                });
                
                setPrayers(pList);
                
                // Cache Data
                localStorage.setItem('cached_prayers', JSON.stringify(pList));
                localStorage.setItem('cached_prayers_date', new Date().toDateString());
            }

        } catch (err) {
            console.error("API Error", err);
        }
    };

    fetchData();
  }, [location, t]);

  // 3. Timer Logic & ALARM TRIGGER
  useEffect(() => {
    if (prayers.length === 0) return;

    const timer = setInterval(() => {
        const now = new Date();
        let nextIdx = -1;
        
        for (let i = 0; i < prayers.length; i++) {
            if (prayers[i].dateObj && new Date(prayers[i].dateObj!) > now) {
                nextIdx = i;
                break;
            }
        }

        if (nextIdx === -1) {
            setNextPrayerIndex(0);
            setTimeRemaining("غداً");
        } else {
            setNextPrayerIndex(nextIdx);
            if (prayers[nextIdx].dateObj) {
                const targetTime = new Date(prayers[nextIdx].dateObj!);
                const diff = targetTime.getTime() - now.getTime();
                
                // --- ALARM LOGIC START ---
                // If remaining time is <= 5 minutes (300,000 ms) AND notifications enabled
                if (diff <= 300000 && diff > 0 && notificationsEnabled) {
                    const prayerKey = prayers[nextIdx].key;
                    // Only play if we haven't played for this specific prayer instance yet
                    if (alarmPlayedFor !== prayerKey) {
                        if (alarmRef.current) {
                            alarmRef.current.currentTime = 0;
                            alarmRef.current.play().catch(e => console.error("Alarm play failed", e));
                            setAlarmPlayedFor(prayerKey); // Mark as played
                            
                            // Send visual notification if supported
                            if (Notification.permission === 'granted') {
                                new Notification(t('prayerAlertTitle'), {
                                    body: `${t('prayerAlertBody')} - ${prayers[nextIdx].name}`
                                });
                            }
                        }
                    }
                }
                // --- ALARM LOGIC END ---

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeRemaining(`${hours}:${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`);
            }
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [prayers, notificationsEnabled, alarmPlayedFor, t]);

  // Toggle Notification Handler
  const toggleNotifications = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent card clicks if on card

    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('notificationsEnabled', String(newState));

    if (newState) {
        // Request Permission if turning ON
        if ("Notification" in window && Notification.permission !== 'granted') {
             Notification.requestPermission();
        }
        // Play sound check
        if (alarmRef.current) {
            alarmRef.current.play().then(() => {
                setTimeout(() => alarmRef.current?.pause(), 500);
            }).catch(() => {});
        }
    } else {
        // Stop sound if turning OFF
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
    }
  };

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8 pb-32">
      
      {/* 1. Main Prayer Card */}
      <div 
        className="relative w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(72,22,32,0.5)] transition-all duration-1000 text-white min-h-[450px] md:min-h-[500px] flex flex-col justify-between border-4 border-brand-brown group"
      >
          {/* Animated Background - BRAND COLOR */}
          <div className="absolute inset-0 bg-brand-brown">
              <div className="absolute inset-0 bg-gradient-to-br from-[#481620] via-[#5d1e2b] to-[#2a0d12] animate-pulse-slow"></div>
              <div className="absolute -top-20 -left-20 w-60 h-60 md:w-80 md:h-80 bg-white/5 rounded-full blur-[80px] md:blur-[100px] animate-float"></div>
              <div className="absolute -bottom-20 -right-20 w-60 h-60 md:w-80 md:h-80 bg-black/30 rounded-full blur-[80px] md:blur-[100px] animate-float" style={{animationDelay: '3s'}}></div>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
          </div>

          {/* Top Bar */}
          <div className="relative z-10 p-6 md:p-8 flex justify-between items-start">
              <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-2">
                       <Moon className="w-6 h-6 md:w-8 md:h-8 text-white fill-white/20 animate-pulse-slow" />
                       <h2 className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-lg text-white font-amiri">{t('schedule')}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-2 bg-white/5 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full w-fit border border-white/10 hover:bg-white/10 transition-colors">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white/70" />
                      <span className="text-xs md:text-sm font-bold text-white/90 truncate max-w-[150px]">{location ? t('location') : "..."}</span>
                  </div>
              </div>

              {/* Quick Notification Toggle - Toggle Switch Style */}
              <div className="flex flex-col items-center gap-1 animate-fade-in-up">
                  <button 
                      dir="ltr"
                      onClick={toggleNotifications}
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center shadow-lg border border-white/10 ${notificationsEnabled ? 'bg-green-500 justify-end' : 'bg-[#1f2937] justify-start'}`}
                      title={notificationsEnabled ? "إيقاف التنبيهات" : "تفعيل التنبيهات"}
                  >
                      <div className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300"></div>
                  </button>
                  <span className="text-[10px] font-bold text-white/70 tracking-wide">
                      {notificationsEnabled ? 'تنبيه مفعل' : 'تنبيه معطل'}
                  </span>
              </div>
          </div>

          {/* Center Countdown - ACTIVE PULSE */}
          <div className="relative z-10 text-center px-4 flex flex-col items-center justify-center flex-1">
              <div className="inline-block py-1.5 px-4 md:px-6 rounded-full bg-white/10 border border-white/20 text-white text-xs md:text-sm font-black uppercase tracking-widest mb-4 md:mb-6 shadow-lg backdrop-blur-sm animate-fade-in-up">
                  {t('nextPrayer')}
              </div>
              
              <h1 className="text-6xl md:text-9xl font-black drop-shadow-2xl mb-2 md:mb-4 text-white font-amiri animate-float" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  {prayers[nextPrayerIndex]?.name || "--"}
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-white/90 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <div className="text-4xl md:text-6xl font-mono font-bold tracking-widest drop-shadow-lg tabular-nums animate-pulse">
                      {timeRemaining}
                  </div>
              </div>
          </div>

          {/* QURAN MESSAGE for Next Prayer */}
          <div className="relative z-10 px-6 pb-2 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="inline-block bg-black/20 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/10 shadow-lg max-w-2xl mx-auto">
                  <p className="text-sm md:text-lg text-white font-amiri font-bold leading-relaxed">
                      {PRAYER_MESSAGES[prayers[nextPrayerIndex]?.key || ''] || "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"}
                  </p>
              </div>
          </div>

          {/* Bottom Prayer List (Horizontal Scroll) */}
          <div className="relative z-10 bg-black/20 backdrop-blur-lg border-t border-white/10 p-4 md:p-6 overflow-x-auto scrollbar-hide snap-x">
             <div className="flex justify-between items-center min-w-[500px] md:min-w-0 gap-3">
                 {prayers.map((p, idx) => {
                     const isActive = idx === nextPrayerIndex;
                     return (
                         <div key={idx} className={`snap-center flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl transition-all duration-300 cursor-default border ${isActive ? 'bg-white text-brand-brown border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110 z-10' : 'bg-transparent border-transparent hover:bg-white/5 text-white/60'}`}>
                             <span className={`text-[10px] md:text-xs font-bold uppercase ${isActive ? 'opacity-100' : 'opacity-70'}`}>{p.name}</span>
                             <span className={`text-lg md:text-xl font-black ${isActive ? 'font-mono' : ''}`}>{p.displayTime}</span>
                             {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-brown mt-1 animate-ping"></div>}
                         </div>
                     )
                 })}
             </div>
          </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex bg-brand-card p-2 rounded-3xl shadow-sm border border-brand-brown">
          {[
              { id: 'prayers', icon: Moon, label: t('schedule') },
              { id: 'athkar', icon: Heart, label: t('athkar') },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 py-3 md:py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-brand-brown text-white shadow-lg' : 'text-gray-400 hover:bg-brand-brown/10'}`}
              >
                  <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
          ))}
      </div>

      {/* 3. Content Sections */}

      {/* --- ATHKAR SELECTION --- */}
      {activeTab === 'athkar' && (
          <div className="space-y-6 animate-fade-in-up">
              {/* Categories */}
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                      {id: 'morning', label: 'أذكار الصباح ☀️'},
                      {id: 'evening', label: 'أذكار المساء 🌙'},
                      {id: 'study', label: 'أدعية المذاكرة 📖'}
                  ].map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setCurrentAthkarCategory(cat.id as any)} 
                        className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${currentAthkarCategory === cat.id ? 'bg-brand-brown text-white shadow-lg scale-105' : 'bg-brand-card text-brand-text border border-brand-brown/30'}`}
                      >
                          {cat.label}
                      </button>
                  ))}
              </div>
              
              {/* Athkar Cards Grid */}
              <div className="grid gap-6">
                  {ATHKAR_DATA[currentAthkarCategory].map((dhikr, idx) => {
                      const countKey = `${currentAthkarCategory}-${idx}`;
                      const currentCount = counts[countKey] || 0;
                      const isDone = currentCount >= dhikr.count;
                      
                      return (
                          <div 
                             key={idx} 
                             onClick={() => handleDhikrClick(countKey, dhikr.count)}
                             className={`relative overflow-hidden bg-brand-card p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer group shadow-sm ${
                                 isDone 
                                 ? 'border-green-500/50 bg-green-500/5 dark:bg-green-900/10' 
                                 : 'border-brand-brown/20 hover:border-brand-brown hover:shadow-lg'
                             }`}
                          >
                              {/* Background Pattern */}
                              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>

                              <div className="flex flex-col gap-4 relative z-10">
                                  {/* Text */}
                                  <p className={`text-xl md:text-2xl font-amiri leading-loose text-center ${isDone ? 'text-green-700 dark:text-green-400 opacity-80' : 'text-brand-text'}`}>
                                      {dhikr.text}
                                  </p>
                                  
                                  {/* Divider */}
                                  <div className="h-px w-1/3 bg-brand-brown/10 mx-auto"></div>

                                  {/* Footer: Source & Counter */}
                                  <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs font-bold text-brand-subtext bg-brand-brown/5 px-3 py-1 rounded-full">
                                          {dhikr.source}
                                      </span>

                                      {/* Interactive Counter */}
                                      <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${isDone ? 'bg-green-500 text-white' : 'bg-brand-brown text-white shadow-lg'}`}>
                                          {isDone ? (
                                              <>
                                                 <span className="font-bold text-sm">تم</span>
                                                 <CheckCircle2 className="w-5 h-5" />
                                              </>
                                          ) : (
                                              <>
                                                 <span className="font-black text-lg font-mono">{dhikr.count - currentCount}</span>
                                                 <Repeat className="w-4 h-4 opacity-80" />
                                              </>
                                          )}
                                      </div>
                                  </div>

                                  {/* Progress Bar (if count > 1) */}
                                  {dhikr.count > 1 && (
                                      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                                          <div 
                                            className={`h-full transition-all duration-300 ${isDone ? 'bg-green-500' : 'bg-brand-brown'}`} 
                                            style={{ width: `${(currentCount / dhikr.count) * 100}%` }}
                                          ></div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* --- TASBEEH 3D (New Section at Bottom) --- */}
      {activeTab === 'prayers' && (
          <div className="mt-8 flex flex-col items-center justify-center min-h-[200px] animate-fade-in-up">
               <div className="relative group cursor-pointer" onClick={() => setTasbeehIndex(prev => (prev + 1) % TASBEEH_WORDS.length)}>
                   {/* Glow Effect */}
                   <div className="absolute inset-0 bg-brand-brown/20 blur-3xl rounded-full animate-pulse-slow"></div>
                   
                   {/* 3D Text Container */}
                   <h1 
                    className="relative z-10 text-5xl md:text-7xl font-amiri font-black text-center transition-all duration-700 select-none text-transparent bg-clip-text bg-gradient-to-br from-brand-text to-brand-brown dark:from-white dark:to-brand-brown leading-relaxed py-4"
                    style={{
                        textShadow: "0px 4px 3px rgba(0,0,0,0.2), 0px 8px 13px rgba(0,0,0,0.1), 0px 18px 23px rgba(0,0,0,0.1)"
                    }}
                   >
                       {TASBEEH_WORDS[tasbeehIndex]}
                   </h1>
                   
                   <p className="text-center text-brand-subtext text-xs md:text-sm font-bold tracking-[0.5em] mt-2 opacity-50 uppercase">
                       {t('athkar')}
                   </p>
               </div>
          </div>
      )}

    </div>
  );
};

export default ScheduleManager;
