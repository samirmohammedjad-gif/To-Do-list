
import React from 'react';
import { 
  LayoutDashboard, CheckSquare, Map, Sunset, 
  Layers, Bot, Library, Rocket, Heart, Shield, 
  Target, Zap, Clock, Brain 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AppGuide: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: LayoutDashboard,
      title: "غرفة العمليات (Dashboard)",
      desc: "دي مش مجرد شاشة رئيسية، دي لوحة قيادة حياتك. بتشوف فيها ملخص يومك، الامتحانات اللي قربت، وجرعة تحفيز يومية عشان تفوقك لو كسلت."
    },
    {
      icon: CheckSquare,
      title: "المهام القتالية (Tasks)",
      desc: "انسى الورقة والقلم اللي بيضيعوا. سجل واجباتك ومذاكرتك هنا. والميزه إنك ممكن تكتب بالعامية 'واجب فيزياء بكرة' والذكاء الاصطناعي هيفهمك ويسجلها بمعادها."
    },
    {
      icon: Map,
      title: "خريطة الطريق (Curriculum)",
      desc: "عشان متتوهش في المنهج. هنا بتضيف موادك، أبوابك، ودروسك. وبتحدد حالة كل درس (مذاكرة، حل، مراجعة، فرم). عينك دايماً على نسبة إنجازك."
    },
    {
      icon: Layers,
      title: "غرفة الطوارئ (Backlog)",
      desc: "التراكمات البعبع الكبير؟ هنا بنقطعهالك. بتحدد عندك كام باب متراكم، وهتذاكر كام ساعة، والتطبيق بيعملك خطة إنقاذ عشان تلم اللي فاتك مع الجديد."
    },
    {
      icon: Sunset,
      title: "صلواتي ووقتي (Schedule)",
      desc: "البركة في الوقت بتبدأ من الصلاة. هنا بتعرف مواعيد الصلاة، اتجاه القبلة، وأذكارك. وكمان بتنظم يومك كتل زمنية (مذاكرة، راحة، جيم) عشان يومك ميسيحش."
    },
    {
      icon: Bot,
      title: "المساعد الذكي (AI Genie)",
      desc: "عندك سؤال؟ محتار تبدأ بإيه؟ المساعد الذكي فاهم منهجك وجدولك. اسأله 'أعمل إيه النهاردة؟' أو 'لملي التراكمات' وهيرد عليك كأنه دحيح صاحبك."
    },
    {
      icon: Library,
      title: "منصاتي (Resources)",
      desc: "بدل ما تدور على لينكات المنصات والمدرسين كل شوية، جمعهم كلهم هنا. وكمان بيظهرلك آية قرآنية كل دقيقة تطمن قلبك."
    },
    {
      icon: Rocket,
      title: "StudyZone",
      desc: "ده كنز! مكان بيجمعلك كل المصادر التعليمية المجانية، فيديوهات شرح، ومراجعات. عشان توفر وقت البحث وتركز في المذاكرة وبس."
    }
  ];

  return (
    <div className="animate-fade-in-up space-y-12 pb-20">
      
      {/* Hero Section */}
      <div className="relative rounded-[2rem] overflow-hidden bg-brand-brown text-white p-8 md:p-16 text-center border-4 border-brand-card shadow-xl">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
         <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-brand-card rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg transform rotate-3">
               <Shield className="w-10 h-10 text-brand-brown" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-md">
               ليه التطبيق ده هو "سلاحك السري" في الثانوية؟
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed font-bold">
               ده مش مجرد جدول حصص.. ده "سيستم" كامل متصمم عشان يشيل من عليك هم التنظيم، التشتت، والخوف من التراكمات. ركز انت في المذاكرة، وسيب الباقي علينا.
            </p>
         </div>
      </div>

      {/* Philosophy Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card p-8 rounded-3xl border border-brand-brown/20 shadow-lg text-center">
             <Target className="w-12 h-12 text-brand-brown mx-auto mb-4" />
             <h3 className="text-xl font-black text-brand-text mb-2">التركيز اللي بجد</h3>
             <p className="text-brand-subtext font-medium">بنساعدك تفصل عن دوشة السوشيال ميديا وتركز في اللي وراك.</p>
          </div>
          <div className="bg-brand-card p-8 rounded-3xl border border-brand-brown/20 shadow-lg text-center">
             <Zap className="w-12 h-12 text-brand-brown mx-auto mb-4" />
             <h3 className="text-xl font-black text-brand-text mb-2">إنتاجية الضعف</h3>
             <p className="text-brand-subtext font-medium">بدل ما تضيع ساعة تفكر تذاكر إيه، التطبيق بيقولك ابدأ فوراً.</p>
          </div>
          <div className="bg-brand-card p-8 rounded-3xl border border-brand-brown/20 shadow-lg text-center">
             <Brain className="w-12 h-12 text-brand-brown mx-auto mb-4" />
             <h3 className="text-xl font-black text-brand-text mb-2">راحة البال</h3>
             <p className="text-brand-subtext font-medium">لما تشوف منهجك قدامك ونسبة إنجازك بتزيد، التوتر هيقل جداً.</p>
          </div>
      </div>

      {/* Features Detail */}
      <div>
         <h2 className="text-3xl font-black text-brand-text mb-8 text-center flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-brand-brown animate-pulse" />
            إزاي كل حتة في التطبيق بتخدمك؟
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((item, idx) => (
               <div key={idx} className="bg-brand-card p-6 rounded-2xl border border-brand-brown/20 hover:border-brand-brown shadow-sm hover:shadow-lg transition-all flex gap-5 items-start group">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-brown text-white group-hover:scale-110 transition-transform`}>
                     <item.icon className="w-7 h-7" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-brand-text mb-2">{item.title}</h3>
                     <p className="text-brand-subtext leading-relaxed text-sm font-medium">
                        {item.desc}
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Final Call to Action */}
      <div className="bg-brand-brown text-white rounded-3xl p-8 text-center border-4 border-brand-card shadow-2xl">
         <Clock className="w-12 h-12 mx-auto mb-4" />
         <h3 className="text-2xl font-black mb-4">
            مستني إيه؟ ابدأ دلوقتي!
         </h3>
         <p className="max-w-2xl mx-auto mb-6 font-bold text-lg opacity-80">
            كل دقيقة بتنظمها النهاردة، بتشتري بيها راحة ودرجات بكرة. التطبيق معاك، والأهم إن ربنا معاك. توكل على الله ودوس!
         </p>
         <div className="inline-block bg-white px-6 py-2 rounded-full border-2 border-brand-beige text-sm font-bold text-brand-brown shadow-sm">
            #دفعة_الأبطال_2026 🎓
         </div>
      </div>

    </div>
  );
};

export default AppGuide;
