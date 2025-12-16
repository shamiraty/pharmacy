'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, ArrowRight, Shield, TrendingUp, LayoutDashboard, Loader2, Database, Github, Linkedin, Smartphone, Rocket, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-primary-700 to-primary-900 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8 md:py-16 flex flex-col justify-center relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto animate-fadeIn">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors"></div>
              <Pill className="w-14 h-14 text-white group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            Pharma<span className="text-blue-300">Care</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-light">
            Mfumo wa Kisasa wa Kusimamia Famasi, Stoo na Mauzo kwa ajili ya Wafanyabiashara wa Tanzania.
          </p>
        </div>

        {/* CTA Section (Moved ABOVE cards) */}
        <div className="text-center mb-20 animate-fadeIn delay-100">
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="group relative inline-flex items-center space-x-4 px-10 py-5 bg-white text-blue-900 rounded-2xl hover:bg-blue-50 transition-all text-lg font-bold shadow-2xl hover:shadow-blue-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ring-4 ring-white/10"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Inafunguka...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Ingia Kwenye Mfumo</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2 -skew-x-12 translate-x-[-150%] group-hover:animate-shine" />
              </>
            )}
          </button>
        </div>

        {/* Feature Grid (Moved BELOW CTA) */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 max-w-6xl mx-auto">
          {/* Cards with increased opacity (bg-white/15) */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all hover:-translate-y-1 duration-300 group shadow-lg">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
              <LayoutDashboard className="w-6 h-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Usimamizi wa Stoo</h3>
            <p className="text-blue-100/90 leading-relaxed font-medium">
              Fuatilia dawa zinazoisha, zilizouzwa sana (ABC Analysis), na zinazokaribia kuisha muda wake (Expiry Alerts).
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all hover:-translate-y-1 duration-300 group shadow-lg">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Ripoti & Mauzo</h3>
            <p className="text-blue-100/90 leading-relaxed font-medium">
              Pata ripoti za mauzo, faida, na mwenendo wa biashara kwa siku, wiki au mwezi. Fanya maamuzi kwa data.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all hover:-translate-y-1 duration-300 group shadow-lg">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Usalama na Backup</h3>
            <p className="text-blue-100/90 leading-relaxed font-medium">
              Data zako ziko salama. Mfumo unakuwezesha kufanya backup na kurudisha data (restore) wakati wowote.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-12 text-white relative z-10">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-sm">
          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-blue-300 flex items-center gap-2">
              <Mail className="w-5 h-5" /> Contact
            </h4>
            <div className="space-y-3">
              <a href="mailto:shamili.selemani@urasaccos.co.tz" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <span>shamili.selemani@urasaccos.co.tz</span>
              </a>
              <a href="https://wa.me/255675839840" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> <span>+255 675 839 840 (WhatsApp)</span>
              </a>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-purple-300 flex items-center gap-2">
              <Rocket className="w-5 h-5" /> My Projects
            </h4>
            <div className="space-y-3">
              <a href="https://open-projects.streamlit.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" /> <span>Sample App (Streamlit)</span>
              </a>
              <a href="https://share.streamlit.io/user/shamiraty" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Database className="w-4 h-4" /> <span>All Python Projects</span>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.streaming2.media" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Smartphone className="w-4 h-4" /> <span>Media App (PlayStore)</span>
              </a>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-300 flex items-center gap-2">
              <Github className="w-5 h-5" /> Connect
            </h4>
            <div className="space-y-3">
              <a href="https://github.com/shamiraty" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Github className="w-4 h-4" /> <span>GitHub Profile</span>
              </a>
              <a href="https://linkedin.com/in/sameer-saidi-016006292" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" /> <span>LinkedIn</span>
              </a>
              <a href="https://play.google.com/store/apps/dev?id=7334720987169992827" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Smartphone className="w-4 h-4" /> <span>PlayStore Developer</span>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-white/10 text-white/40 text-xs">
          <p>&copy; 2024 PharmaCare System. Developed by Shamiraty.</p>
        </div>
      </footer>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
