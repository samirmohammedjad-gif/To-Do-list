
import React, { useState, useEffect } from 'react';
import { ResourceItem } from '../types';
import { Plus, Trash2, ExternalLink, Globe, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ResourceManagerProps {
  resources: ResourceItem[];
  addResource: (item: ResourceItem) => void;
}

const QURAN_VERSES = [
  "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
  "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا",
  "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
  "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ",
  "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
  "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
  "وَقُل رَّبِّ زِدْنِي عِلْمًا",
  "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
  "وَقَالُوا الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنَّا الْحَزَنَ"
];

const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, addResource }) => {
  const { t } = useLanguage();
  const [newPlatform, setNewPlatform] = useState({ title: '', url: '' });
  const [isAdding, setIsAdding] = useState(false);
  
  // Animation State for Verse
  const [verseIndex, setVerseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Verse Rotation Logic
  useEffect(() => {
    const interval = setInterval(() => {
        setFade(false); // Start fade out
        setTimeout(() => {
            setVerseIndex(prev => (prev + 1) % QURAN_VERSES.length);
            setFade(true); // Start fade in
        }, 1000); // Wait for fade out to complete
    }, 60000); // Change verse every 1 minute (60000 ms)

    return () => clearInterval(interval);
  }, []);

  const handleAddPlatform = () => {
    if (newPlatform.title && newPlatform.url) {
      let formattedUrl = newPlatform.url;
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      addResource({
        id: Date.now().toString(),
        title: newPlatform.title,
        type: 'link',
        url: formattedUrl
      });
      setNewPlatform({ title: '', url: '' });
      setIsAdding(false);
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      
      {/* Quranic Verse Section */}
      <div className="relative rounded-[2rem] p-6 md:p-12 text-center bg-brand-brown text-white shadow-xl overflow-hidden group border-4 border-brand-beige">
        
        {/* Decorative Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="absolute top-4 right-4 text-white opacity-20">
             <BookOpen className="w-12 h-12 md:w-16 md:h-16" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
            
            <h3 className="text-xs md:text-sm font-bold text-gray-300 mb-6 uppercase tracking-[0.2em] opacity-80">{t('quranVerse')}</h3>
            
            {/* Verse Container with Smooth Transition */}
            <div className={`transition-all duration-1000 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} flex flex-col items-center gap-4 md:gap-6 max-w-3xl mx-auto`}>
                 
                 {/* Basmala */}
                 <span className="text-lg md:text-xl font-quran text-gray-400 opacity-80 tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                 </span>

                 {/* Verse */}
                 <p className="text-xl md:text-4xl font-quran leading-relaxed drop-shadow-md text-white px-2 md:px-4">
                    <span className="text-brand-brown mx-2 inline-block transform translate-y-2">"</span>
                    {QURAN_VERSES[verseIndex]}
                    <span className="text-brand-brown mx-2 inline-block transform translate-y-2">"</span>
                 </p>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
             <Globe className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin-slow" />
             {t('resources')}
          </h2>
          <p className="text-gray-400 mt-1 font-bold">{t('resourceHub')}</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-full md:w-auto bg-brand-brown text-white border-2 border-white/20 px-6 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-white hover:text-brand-brown transition-all shadow-lg"
        >
            <Plus className="w-5 h-5" /> {t('addPlatform')}
        </button>
      </div>

      {/* Add Platform Form */}
      {isAdding && (
        <div className="bg-brand-beige p-6 rounded-2xl border-2 border-brand-brown shadow-lg animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4 text-white">{t('addPlatform')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1">{t('platformName')}</label>
              <input 
                type="text"
                value={newPlatform.title}
                onChange={(e) => setNewPlatform({...newPlatform, title: e.target.value})}
                className="w-full bg-brand-brown/10 border-2 border-brand-brown/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white font-medium"
                placeholder="Ex: منصة نجوى, Udemy, مستر فلان..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1">{t('platformLink')}</label>
              <input 
                type="text"
                value={newPlatform.url}
                onChange={(e) => setNewPlatform({...newPlatform, url: e.target.value})}
                className="w-full bg-brand-brown/10 border-2 border-brand-brown/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white font-medium ltr:text-left text-left"
                placeholder="www.example.com"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
               <button 
                 onClick={() => setIsAdding(false)}
                 className="px-6 py-2 text-gray-400 hover:text-white rounded-lg font-bold"
               >
                 {t('cancel')}
               </button>
               <button 
                 onClick={handleAddPlatform}
                 className="px-8 py-2 bg-brand-brown text-white rounded-lg font-bold hover:bg-white hover:text-brand-brown shadow-md border border-brand-brown"
               >
                 {t('saveCourse')}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Platforms Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {resources.filter(r => r.type === 'link').map((platform, index) => (
           <a 
             key={platform.id} 
             href={platform.url} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="group bg-brand-beige p-6 rounded-2xl border-2 border-brand-brown hover:border-white shadow-sm hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden animate-fade-in-up"
             style={{ animationDelay: `${index * 100}ms` }}
           >
             {/* Dynamic Favicon */}
             <div className="w-16 h-16 bg-brand-brown rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
               <img 
                 src={getFavicon(platform.url || '')} 
                 alt={platform.title}
                 className="w-10 h-10 object-contain"
                 onError={(e) => {
                   (e.target as HTMLImageElement).style.display = 'none';
                   (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                 }}
               />
               <Globe className="w-8 h-8 text-gray-400 hidden" />
             </div>

             <div>
                <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-gray-200 transition-colors">
                  {platform.title}
                </h3>
                <span className="text-xs text-gray-500 font-mono mt-1 block truncate max-w-[150px] mx-auto font-bold">
                  {new URL(platform.url || 'http://localhost').hostname}
                </span>
             </div>

             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
               <ExternalLink className="w-4 h-4 text-white" />
             </div>
           </a>
        ))}

        {/* Empty State / Add Button */}
        {resources.filter(r => r.type === 'link').length === 0 && !isAdding && (
           <button 
             onClick={() => setIsAdding(true)}
             className="col-span-full py-12 border-3 border-dashed border-brand-brown rounded-3xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-white hover:bg-brand-brown/10 transition-all cursor-pointer group animate-pulse"
           >
             <div className="w-16 h-16 bg-brand-brown rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Plus className="w-8 h-8 text-white" />
             </div>
             <p className="font-bold text-lg">{t('addPlatform')}</p>
             <p className="text-sm opacity-60 font-medium">اضف منصاتك ومدرسينك هنا للوصول السريع</p>
           </button>
        )}
      </div>

    </div>
  );
};

export default ResourceManager;
