
import React from 'react';
import { LayoutDashboard, CheckSquare, Map, Menu, X, GraduationCap, Rocket, Library, Layers, Sunset, Info, Moon, Sun, Instagram, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  userLevel: number;
  userXP: number;
}

const ChatGPTLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4533l-.142.0805L8.704 5.4596a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { t, dir } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'schedule', label: t('schedule'), icon: Sunset },
    { id: 'curriculum', label: t('courses'), icon: Map },
    { id: 'study_zone', label: t('health'), icon: Rocket }, 
    { id: 'telegram', label: t('telegramChannel'), icon: Send },
    { id: 'backlog', label: t('backlog'), icon: Layers }, 
    { id: 'ai', label: t('aiAssistant'), icon: ChatGPTLogo }, 
    { id: 'tasks', label: t('tasks'), icon: CheckSquare },
    { id: 'resources', label: t('resources'), icon: Library },
    { id: 'guide', label: t('appGuide'), icon: Info },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleNavClick = (viewId: string) => {
    onChangeView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    // Use h-[100dvh] to handle mobile browser address bars correctly
    <div className={`flex h-[100dvh] overflow-hidden bg-brand-beige transition-colors duration-500 font-cairo`} dir={dir}>
      {/* Sidebar (Desktop) - Night Bordeaux */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-brown border-e border-white/10 z-20 shadow-2xl transition-colors flex-shrink-0">
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white text-brand-brown rounded-xl flex items-center justify-center shadow-lg animate-float">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">{t('appTitle')}</span>
          </div>
        </div>
        
        {/* User Stats Widget */}
        <div className="px-6 py-4 mx-4 mb-6 bg-white/10 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300 cursor-default border border-white/10 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold opacity-90">{t('premiumPlan')}</span>
            <span className="text-xl animate-pulse-slow">🔥</span>
          </div>
          <p className="text-lg font-bold">{t('studentUser')}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center w-full px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                currentView === item.id
                  ? 'bg-white text-brand-brown shadow-lg scale-105'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon className={`w-5 h-5 rtl:ms-0 rtl:me-3 ltr:mr-3 ltr:ml-0 ${currentView === item.id ? 'text-brand-brown' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Theme Toggle */}
        <div className="p-4">
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center justify-center gap-2 bg-black/20 hover:bg-black/40 text-white py-3 rounded-xl transition-all border border-white/10 font-bold"
           >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-brand-brown border-b border-white/10 z-30 px-4 py-3 flex justify-between items-center shadow-lg h-16">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-brown font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-lg">{t('appTitle')}</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-white bg-white/10 p-2 rounded-lg active:bg-white/20">
               {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={toggleMobileMenu} className="text-white hover:text-gray-300 active:scale-95 transition-transform">
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-brand-beige z-20 pt-20 px-6 md:hidden overflow-y-auto animate-fade-in-up">
          <div className="space-y-3 pb-24">
             {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center w-full px-4 py-4 text-lg font-bold rounded-xl border-2 transition-all active:scale-95 ${
                   currentView === item.id
                  ? 'bg-brand-brown border-brand-brown text-white shadow-lg'
                  : 'bg-brand-beige border-brand-brown text-brand-dark'
                }`}
              >
                <item.icon className="w-6 h-6 rtl:ms-0 rtl:me-4 ltr:mr-4 ltr:ml-0" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden md:p-8 p-4 pt-20 md:pt-8 bg-brand-beige relative transition-colors duration-300 scroll-smooth">
        {/* If current view is AI, we remove default padding via negative margins or logic. 
            However, cleanest way in React without routing is just to pass styles or render children.
            We will make the AI component take full space. */}
        <div className={`${currentView === 'ai' ? 'fixed inset-0 z-40 md:static md:h-full md:w-full md:inset-auto' : 'max-w-7xl mx-auto animate-fade-in-up relative z-10 pb-10'}`} key={currentView}>
          {children}
        </div>

        {/* --- APP FOOTER (Rights & Credits) - Hide on AI View --- */}
        {currentView !== 'ai' && (
          <footer className="mt-8 mb-6 py-6 border-t border-brand-brown/10 flex flex-col items-center justify-center gap-4 opacity-90">
               <div className="flex items-center gap-2 text-brand-subtext text-xs md:text-sm font-bold tracking-wide">
                   <span>صُنِع بكل ❤️ من أجل</span>
                   <span className="text-brand-brown bg-brand-brown/10 px-2 py-0.5 rounded-md">دفعة 2026</span>
               </div>

               <a 
                 href="https://www.instagram.com/samirjadofficial?igsh=MTdzaDVicDd5eDE5aw=="
                 target="_blank"
                 rel="noopener noreferrer"
                 className="group flex items-center gap-3 bg-brand-card hover:bg-gradient-to-tr hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-brand-text hover:text-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-brown/20 hover:border-transparent hover:-translate-y-1"
               >
                   <Instagram className="w-5 h-5 group-hover:animate-bounce" />
                   <span className="font-black text-sm md:text-base">بشمهندس / سمير جاد</span>
               </a>
          </footer>
        )}

      </main>
    </div>
  );
};

export default Layout;
