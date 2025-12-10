
import React, { useState } from 'react';
import { Send, FileText, Bell, Users, Heart, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TelegramChannel: React.FC = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  // Features list
  const features = [
    { icon: FileText, title: t('tg_f_summary') },
    { icon: Bell, title: t('tg_f_alerts') },
    { icon: Users, title: t('tg_f_community') },
    { icon: Heart, title: t('tg_f_peace') },
  ];

  const handleGoClick = () => {
      setShowModal(true);
  };

  const confirmAndRedirect = () => {
      setShowModal(false);
      window.open('https://t.me/sanawygad', '_blank');
  };

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      
      {/* Hero Section */}
      <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-brand-brown text-white p-8 md:p-16 text-center border-4 border-brand-card shadow-xl">
          {/* Background pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-block bg-white text-brand-brown px-6 py-2 rounded-full font-black border-2 border-brand-beige mb-4 transform -rotate-2">
                  <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Send className="w-4 h-4" /> {t('telegramChannel')}
                  </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 text-white drop-shadow-md">
                  {t('tg_title')}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-bold opacity-90">
                  {t('tg_desc')}
              </p>

              <div className="pt-8">
                  <button 
                    onClick={handleGoClick}
                    className="group relative inline-flex items-center gap-3 bg-white text-brand-brown px-10 py-5 rounded-2xl font-black text-xl hover:translate-y-1 hover:shadow-none transition-all duration-200 shadow-[0_6px_0_0_#ccc] border-2 border-brand-brown"
                  >
                      {t('tg_go_btn')}
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
              </div>
          </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
              <div key={idx} className={`bg-brand-card p-6 rounded-2xl border-2 border-brand-brown/20 shadow-sm hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center gap-4 group hover:border-brand-brown`}>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-brand-brown text-white border-2 border-white/10 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-brand-text">{feature.title}</h3>
              </div>
          ))}
      </div>

      {/* Prayer Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-brand-card rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl scale-100 animate-fade-in-up border-4 border-brand-brown">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-brand-brown transition-colors"
                  >
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="w-20 h-20 bg-brand-brown rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-white fill-current animate-pulse" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-brand-text mb-4">
                      {t('tg_modal_title')}
                  </h3>
                  
                  <p className="text-lg text-brand-subtext mb-8 leading-relaxed font-medium">
                      {t('tg_modal_desc')}
                  </p>
                  
                  <button 
                    onClick={confirmAndRedirect}
                    className="w-full bg-brand-brown text-white py-4 rounded-xl font-black text-lg hover:bg-brand-brown/90 transition-colors shadow-lg"
                  >
                      {t('tg_modal_confirm')}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default TelegramChannel;
