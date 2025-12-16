'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, ArrowRight, Shield, TrendingUp, LayoutDashboard, Loader2, Database, Github, Linkedin, Smartphone, Rocket, Mail, Phone, ExternalLink, Globe, MapPin, Heart, CheckCircle, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    // Simulate initial loading for polished feel
    const timer = setTimeout(() => setIsMounting(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  const [bubbles] = useState(() => Array.from({ length: 20 }).map(() => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 15}s`,
    size: Math.random() * 20 + 10,
    opacity: Math.random() * 0.5 + 0.3
  })));

  // SKELETON (Updates to remove icon space if needed)
  if (isMounting) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content Skeleton */}
          <div className="space-y-10 w-full animate-pulse flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="space-y-6 w-full flex flex-col items-center lg:items-start">
              <div className="h-24 w-3/4 bg-white/10 rounded-3xl" />
              <div className="space-y-3 w-full flex flex-col items-center lg:items-start">
                <div className="h-4 w-full bg-white/5 rounded max-w-md" />
                <div className="h-4 w-5/6 bg-white/5 rounded max-w-sm" />
              </div>
            </div>
            <div className="h-16 w-56 rounded-2xl bg-white/20 mt-8" />
          </div>
          <div className="space-y-8 w-full hidden lg:block">
            {/* Cards Skeleton logic ... */}
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-white/5 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col relative overflow-hidden text-white font-sans selection:bg-rose-500/30">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-float"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              opacity: b.opacity,
              animationDelay: b.animationDelay,
              bottom: '-50px'
            }}
          />
        ))}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="flex-1 container mx-auto px-6 pt-12 pb-32 lg:py-24 flex flex-col justify-center relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* LEFT COLUMN: Text & CTA */}
          {/* Added: items-center for mobile, lg:items-start for desktop. text-center for mobile, lg:text-left for desktop. */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-12 animate-fadeIn transition-all duration-700">

            <div className="space-y-8 flex flex-col items-center lg:items-start w-full">
              {/* Enhanced Title */}
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-2xl leading-[1.1] text-white">
                  <span className="bg-gradient-to-r from-sky-300 via-blue-100 to-indigo-200 text-transparent bg-clip-text relative inline-block pb-4">
                    Pharma
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-500 italic font-serif ml-1 relative">
                      Care
                      <Sparkles className="w-8 h-8 md:w-12 md:h-12 absolute -top-4 -right-8 text-yellow-300 animate-pulse fill-yellow-300" />
                    </span>
                  </span>
                </h1>

                {/* Moving Underline: The 'walking' line */}
                <div className="h-2 w-full max-w-[300px] bg-white/10 rounded-full mt-2 overflow-hidden mx-auto lg:mx-0">
                  <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-slide-line rounded-full"></div>
                </div>

                <span className="text-2xl md:text-4xl font-light text-blue-100/90 block mt-6 tracking-wide">
                  Medical Solution.
                </span>
              </div>

              <p className="text-lg md:text-2xl text-blue-100/80 leading-relaxed font-light max-w-2xl lg:border-l-4 lg:border-rose-500/50 lg:pl-6 pt-4 lg:pt-0">
                Mfumo wa Kisasa wa Kusimamia Famasi, Stoo na Mauzo.
                <span className="block text-base mt-4 text-rose-200 font-medium flex items-center justify-center lg:justify-start gap-2 bg-rose-500/10 py-2 px-4 rounded-full w-fit mx-auto lg:mx-0 border border-rose-500/20">
                  <CheckCircle className="w-5 h-5 text-rose-400" /> Rahisi kutumia. Salama. Uhakika.
                </span>
              </p>
            </div>

            <div className="pt-2 w-full flex justify-center lg:justify-start">
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="group relative inline-flex items-center space-x-5 px-12 py-6 bg-white text-blue-950 rounded-full hover:scale-105 transition-all duration-300 text-xl font-bold shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(244,63,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ring-4 ring-rose-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                    <span className="text-rose-900">Inafunguka...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10 tracking-wide font-bold bg-gradient-to-r from-rose-600 to-pink-600 text-transparent bg-clip-text">Ingia Mfumo</span>
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform relative z-10">
                      <ArrowRight className="w-6 h-6 text-rose-600" />
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Feature Cards */}
          <div className="lg:col-span-5 space-y-8 lg:pl-4 mt-12 lg:mt-0">
            {/* Card 1: Stoo */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 shrink-0 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/40 transition-colors border border-white/5 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <LayoutDashboard className="w-8 h-8 text-blue-200 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Usimamizi wa Stoo</h3>
                  <p className="text-blue-100/70 leading-relaxed text-base">
                    ABC Analysis, Expiry Alerts na ufuatiliaji wa dawa zinazoisha.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Ripoti */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 shrink-0 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/40 transition-colors border border-white/5 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <TrendingUp className="w-8 h-8 text-purple-200 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Ripoti & Mauzo</h3>
                  <p className="text-blue-100/70 leading-relaxed text-base">
                    Ripoti za kina za mauzo, faida na mwenendo wa biashara.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Backup */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 shrink-0 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/40 transition-colors border border-white/5 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Database className="w-8 h-8 text-emerald-200 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Usalama na Backup</h3>
                  <p className="text-blue-100/70 leading-relaxed text-base">
                    Data encryption na automatic backup kwa usalama wa uhakika.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN FOOTER (Big Text) */}
      <footer className="relative bg-black/60 backdrop-blur-3xl border-t border-white/5 mt-auto">
        {/* Gradient Top Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>

        <div className="container mx-auto px-8 py-20">
          <div className="grid md:grid-cols-4 gap-16 mb-16">
            {/* Brand / About */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h4 className="text-3xl font-black text-white tracking-tight">Pharma<span className="text-rose-500 italic font-serif">Care.</span></h4>
                <p className="text-lg text-blue-100/60 mt-4 leading-relaxed">
                  Mfumo bora wa afya kwa ajili ya ustawi wa biashara yako.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-500/20 cursor-pointer transition-colors group"><Globe className="w-6 h-6 text-blue-300 group-hover:text-rose-300" /></div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-500/20 cursor-pointer transition-colors group"><MapPin className="w-6 h-6 text-blue-300 group-hover:text-rose-300" /></div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block">Mawasiliano</h5>
              <ul className="space-y-6 text-base text-blue-100/80">
                <li className="flex items-center gap-4 hover:text-white transition-colors group">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rose-500/20 transition-colors"><Mail className="w-5 h-5 text-rose-300" /></div>
                  <a href="mailto:shamili.selemani@urasaccos.co.tz">shamili...urasaccos.co.tz</a>
                </li>
                <li className="flex items-center gap-4 hover:text-white transition-colors group">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500/20 transition-colors"><Phone className="w-5 h-5 text-emerald-300" /></div>
                  <a href="https://wa.me/255675839840">+255 675 839 840</a>
                </li>
              </ul>
            </div>

            {/* Projects */}
            <div>
              <h5 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block">Miradi Mingine</h5>
              <ul className="space-y-6 text-base text-blue-100/80">
                <li><a href="https://open-projects.streamlit.app" target="_blank" className="hover:text-rose-300 transition-colors flex items-center gap-3 group"><ExternalLink className="w-5 h-5 text-white/50 group-hover:text-rose-300" /> Streamlit App</a></li>
                <li><a href="https://play.google.com/store/apps/details?id=com.streaming2.media" target="_blank" className="hover:text-rose-300 transition-colors flex items-center gap-3 group"><Smartphone className="w-5 h-5 text-white/50 group-hover:text-rose-300" /> Media App</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h5 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block">Mitandao</h5>
              <div className="flex gap-4">
                <a href="https://linkedin.com/in/sameer-saidi-016006292" target="_blank" className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-blue-400 border border-blue-500/20 hover:scale-110">
                  <Linkedin className="w-7 h-7" />
                </a>
                <a href="https://github.com/shamiraty" target="_blank" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all text-white/60 border border-white/10 hover:scale-110">
                  <Github className="w-7 h-7" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/40 font-medium">
              &copy; {new Date().getFullYear()} PharmaCare. All rights reserved.
            </p>
            <p className="text-sm text-white/40 flex items-center gap-2 font-medium">
              Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" /> by Shamiraty
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
