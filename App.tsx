
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, History, ChevronRight, Upload, X,
  Loader2, Sparkles, BrainCircuit, Zap, 
  ShieldCheck, 
  ArrowRight, Activity, Target, AlertOctagon, XCircle, Printer,
  ChevronLeft, Moon, Sun, Shield, AlertTriangle, 
  LogOut, Mail, Lock, User as UserIcon, CreditCard, RefreshCw
} from 'lucide-react';
import { db } from './db';
import { analyzeCreative } from './gemini';
import { CreativeAudit, DashboardKPIs, User } from './types';

// --- Reusable Components ---
const GlassCard = ({ children, className = "" }: any) => (
  <div className={`bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-xl p-6 lg:p-8 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = 'slate' }: any) => {
  const colors: any = {
    slate: 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    indigo: 'bg-slate-900 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-slate-100'
  };
  return (
    <span className={`px-2 py-0.5 text-[8px] lg:text-[9px] font-black uppercase tracking-widest border rounded ${colors[color]}`}>
      {children}
    </span>
  );
};

const PerformanceThermometer = ({ score }: { score: number }) => {
  const rotation = (score / 100) * 180 - 90; 
  const getStatus = () => {
    if (score <= 40) return { label: "CRÍTICO", color: "text-rose-500", hex: "#E53935" };
    if (score <= 65) return { label: "PRECISA AJUSTES", color: "text-amber-500", hex: "#FBC02D" };
    if (score <= 85) return { label: "BOA PERFORMANCE", color: "text-emerald-500", hex: "#43A047" };
    return { label: "ALTA PERFORMANCE", color: "text-emerald-700", hex: "#1B5E20" };
  };
  const status = getStatus();
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-18 lg:w-48 lg:h-24 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10,50 A 40,40 0 0,1 33.5,17.6" fill="none" stroke={score > 0 ? "#E53935" : "transparent"} strokeWidth="8" />
          <path d="M 33.5,17.6 A 40,40 0 0,1 61.4,12.5" fill="none" stroke={score > 40 ? "#FBC02D" : "transparent"} strokeWidth="8" />
          <path d="M 61.4,12.5 A 40,40 0 0,1 84.6,32.4" fill="none" stroke={score > 65 ? "#43A047" : "transparent"} strokeWidth="8" />
          <path d="M 84.6,32.4 A 40,40 0 0,1 90,50" fill="none" stroke={score > 85 ? "#1B5E20" : "transparent"} strokeWidth="8" />
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 100%', transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <line x1="50" y1="50" x2="50" y2="15" stroke={status.hex} strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4.5" fill={status.hex} stroke="white" strokeWidth="1" />
          </g>
        </svg>
      </div>
      <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] ${status.color}`}>
        {status.label}
      </p>
    </div>
  );
};

// --- View: Upgrade Overlay (Blocking & Sales) ---
const UpgradeOverlay = ({ user, onClose, refreshUser }: { user: User, onClose: () => void, refreshUser: () => void }) => {
  const plans = [
    {
      id: 'essencial',
      title: '🟢 ESSENCIAL',
      price: 'R$47',
      credits: 200,
      desc: 'Ideal para quem testa poucos criativos',
      link: process.env.CAKTO_LINK_ESSENCIAL || 'https://pay.cakto.com.br/jh6vzzk_769049',
      color: 'emerald'
    },
    {
      id: 'pro',
      title: '🔵 PROFISSIONAL',
      price: 'R$67',
      credits: 500,
      desc: 'Para quem analisa campanhas diariamente',
      link: process.env.CAKTO_LINK_PRO || 'https://pay.cakto.com.br/y9i6qmr',
      color: 'blue',
      popular: true
    },
    {
      id: 'escala',
      title: '🟣 ESCALA',
      price: 'R$137',
      credits: 1000,
      desc: 'Para agências e gestores de alto volume',
      link: process.env.CAKTO_LINK_ESCALA || 'https://pay.cakto.com.br/9vaa5ib',
      color: 'purple'
    }
  ];

  const handlePurchaseClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-y-auto animate-fadeIn">
      <div className="max-w-6xl w-full py-12 space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-white drop-shadow-lg">
            Seus créditos <span className="text-rose-400">acabaram.</span> <br/>
            <span className="text-emerald-400">Desbloqueie análises ilimitadas agora.</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-slate-300 text-lg font-medium">
              Você usou seus 2 créditos gratuitos. Cada análise evita perder dinheiro com criativos ruins.
            </p>
            <p className="text-emerald-300 text-base font-bold">
              ✅ Liberação automática após pagamento
            </p>
            <p className="text-white text-xl font-black uppercase tracking-tighter drop-shadow-lg">
              Não é sobre relatório. É sobre parar de desperdiçar verba.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative p-10 rounded-[3rem] bg-slate-800/90 backdrop-blur-xl border-2 ${plan.popular ? 'border-emerald-500 scale-105 shadow-2xl shadow-emerald-500/30' : 'border-slate-700'} space-y-10 flex flex-col items-center text-center group transition-all hover:bg-slate-800`}>
              {plan.popular && <div className="absolute -top-4 bg-emerald-500 text-slate-900 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg">✨ Recomendado</div>}
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase text-white drop-shadow-lg">{plan.title}</h3>
                <p className="text-base text-slate-200 font-medium">{plan.desc}</p>
              </div>
              <div className="space-y-2">
                <div className="text-7xl font-black text-white drop-shadow-lg">{plan.credits}</div>
                <div className="text-[11px] font-black uppercase text-slate-300 tracking-widest">Créditos de Auditoria</div>
              </div>
              <div className="text-5xl font-black text-emerald-400 drop-shadow-lg">{plan.price}</div>
              <div className="w-full pt-6 border-t border-slate-600 space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compra Única • Sem Mensalidade</p>
                <button 
                  onClick={() => handlePurchaseClick(plan.link)}
                  className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${plan.popular ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-105' : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-105'}`}
                >
                  🚀 Liberar Créditos Agora
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-8">
           <div className="flex flex-col items-center gap-4">
              <p className="text-[16px] font-bold uppercase tracking-wider italic text-slate-100">“Cada criativo rodando sem análise pode estar drenando seu orçamento.”</p>
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    const btn = document.getElementById('refresh-credits-btn');
                    if (btn) btn.innerText = '⏳ Atualizando...';
                    await refreshUser();
                    if (btn) btn.innerText = '✅ Atualizado!';
                    setTimeout(() => {
                      if (btn) btn.innerText = '🔄 Já paguei, atualizar saldo';
                    }, 2000);
                  }}
                  id="refresh-credits-btn"
                  className="flex items-center gap-2 px-6 py-4 bg-slate-800 border-2 border-emerald-500 rounded-xl text-[12px] font-black uppercase text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 transition-all shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" /> Já paguei, atualizar saldo
                </button>
                <button onClick={onClose} className="px-6 py-4 bg-slate-800 border-2 border-slate-600 rounded-xl text-[12px] font-black uppercase text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-lg">Voltar ao Dashboard</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- View: Auth ---
const AuthView = ({ setUser }: { setUser: (u: User) => void }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const user = await db.login(email, password);
      if (user) {
        setUser(user);
        navigate('/app');
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } else if (mode === 'register') {
      if (!name || !email || !password || !confirmPassword) {
        setError('Preencha todos os campos.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não conferem.');
        return;
      }
      if (!agree) {
        setError('Você precisa concordar com os termos.');
        return;
      }
      const user = await db.register(email, name, password);
      console.log('Resultado do registro:', user);
      if (user) {
        setUser(user);
        navigate('/app');
      } else {
        setError('Erro ao criar conta. Verifique os dados ou tente novamente.');
      }
    } else {
      // MODO: Esqueci Senha (não implementado ainda)
      if (!email) {
        setError('Informe seu e-mail.');
        return;
      }
      setError('Recurso de recuperação de senha ainda não disponível. Entre em contato com suporte.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div className="text-center space-y-4">
          <Link to="/" className="text-4xl font-black tracking-tighter uppercase text-white inline-block">ADSCORE<span className="text-emerald-500">AI</span></Link>
          <p className="text-slate-400 font-medium uppercase text-[10px] tracking-widest italic">Acesso à Inteligência de Performance</p>
        </div>

        <GlassCard className="!bg-slate-900/80 border-white/10 p-10 space-y-8 shadow-2xl">
          <div className="flex bg-slate-800/50 p-1 rounded-xl">
            <button onClick={() => setMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>Entrar</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'register' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>Criar Conta</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 transition-all" placeholder="Seu nome" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">E-mail corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 transition-all" placeholder="exemplo@empresa.com" />
              </div>
            </div>
            {mode !== 'forgot' && (
              <>
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••" />
                  </div>
                </div>
                {mode === 'register' && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••" />
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === 'register' && (
              <div className="flex items-center gap-2 ml-1">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-emerald-500" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Li e concordo com os termos</span>
              </div>
            )}

            {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest animate-shake">{error}</div>}
            {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-bold text-center uppercase tracking-widest">{success}</div>}

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-6 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-emerald-500/20 transition-all active:scale-95">
              {mode === 'login' ? 'Entrar no Sistema' : mode === 'register' ? 'Criar Conta e Liberar 2 Auditorias Gratuitas' : 'Enviar Link de Redefinição'}
            </button>
            
            <div className="flex flex-col gap-4 text-center">
              {mode === 'login' && (
                <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Esqueci minha senha</button>
              )}
              {(mode === 'forgot' || mode === 'register') && (
                <button type="button" onClick={() => setMode('login')} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Já tenho uma conta. Fazer Login</button>
              )}
            </div>
          </form>
        </GlassCard>

        {mode === 'register' && (
          <p className="text-center text-[11px] text-slate-500 font-bold uppercase italic tracking-widest">
             Você receberá <span className="text-emerald-500">2 créditos gratuitos</span> automaticamente.
          </p>
        )}
      </div>
    </div>
  );
};

// --- View: Dashboard ---
const DashboardView = ({ user }: { user: User }) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [audits, setAudits] = useState<CreativeAudit[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      const [kpisData, auditsData] = await Promise.all([
        db.getKPIs(user.id),
        db.getAudits(user.id)
      ]);
      setKpis(kpisData);
      setAudits(auditsData);
    };
    loadData();
  }, [user.id, user.credits]);
  
  if (!kpis) return null;

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-[1400px] mx-auto page-transition pb-32">
       <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 no-print">
          <div className="space-y-1">
             <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase">Visão Geral</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Motor AdScore Ativo • Licença Vitalícia</p>
          </div>
          
          <GlassCard className="flex items-center gap-10 !py-6 !px-10 border-emerald-500/30 bg-emerald-500/5">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">📊 Seus Créditos</p>
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  {user.credits >= 999999 ? '∞' : user.credits} <span className="text-slate-300 dark:text-slate-700">/ 2</span>
                </div>
             </div>
             <Link to="/app/analisar" className="bg-emerald-500 text-slate-900 p-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
                <PlusCircle className="w-6 h-6" />
             </Link>
          </GlassCard>
       </header>

       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 no-print">
          {[
            { label: 'Auditorias Totais', val: kpis.totalAudits, icon: Activity },
            { label: 'Score Médio', val: `${kpis.avgScore}%`, icon: Target },
            { label: 'Ativos Vencedores', val: kpis.scaleCount, icon: Zap, color: 'text-emerald-500' },
            { label: 'Alertas Vermelhos', val: kpis.pauseCount, icon: AlertOctagon, color: 'text-rose-500' }
          ].map((k, i) => (
            <GlassCard key={i} className="flex flex-col justify-between h-36 lg:h-44 group hover:border-slate-300 dark:hover:border-slate-600 transition-all">
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k.label}</span>
                  <k.icon className="w-4 h-4 text-slate-300 dark:text-slate-600" />
               </div>
               <div className={`text-3xl lg:text-5xl font-black ${k.color || 'text-slate-900 dark:text-white'}`}>{k.val}</div>
            </GlassCard>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
             <Link to="/app/analisar" className="group">
                <div className="bg-slate-900 dark:bg-emerald-600 p-10 rounded-[2.5rem] text-white space-y-12 group-hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden">
                   <Zap className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                   <div className="flex justify-between items-center"><Sparkles className="w-8 h-8 text-emerald-400" /><PlusCircle className="w-12 h-12" /></div>
                   <div className="space-y-2">
                      <p className="text-2xl font-black uppercase tracking-tighter">Nova Auditoria</p>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Processamento Visual Real em Segundos</p>
                   </div>
                </div>
             </Link>
          </div>

          <div className="lg:col-span-2 space-y-8">
             <div className="flex justify-between items-center no-print">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Performance Recente</h3>
                <Link to="/app/historico" className="text-[10px] font-black uppercase text-emerald-500 hover:underline">Ver Todos</Link>
             </div>
             <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                         <tr>
                            <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Ativo</th>
                            <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Score</th>
                            <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Ação</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                         {audits.length === 0 ? (
                           <tr><td colSpan={3} className="px-8 py-16 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest">Sem auditorias registradas.</td></tr>
                         ) : audits.slice(0, 5).map(a => (
                           <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                              <td className="px-8 py-6"><div className="flex items-center gap-4"><img src={a.imageUrl} className="w-12 h-12 object-cover rounded-xl" /><p className="text-[11px] font-black uppercase">{a.platform}</p></div></td>
                              <td className="px-8 py-6 font-black text-lg">{a.score_geral}%</td>
                              <td className="px-8 py-6"><Link to={`/app/resultado/${a.id}`} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-900 dark:hover:bg-emerald-600 hover:text-white transition-all inline-block"><ChevronRight className="w-4 h-4"/></Link></td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- View: Analyze (Process Data) ---
const AnalyzeView = ({ user, refreshUser, openUpgrade }: { user: User, refreshUser: () => void, openUpgrade: () => void }) => {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ url: string, type: 'image'|'video', file: File }|null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('Meta Ads');
  const [objective, setObjective] = useState('Venda');
  const [nicho, setNicho] = useState('');

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          const jump = Math.random() * 5;
          return Math.min(prev + jump, 98);
        });
      }, 400);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const extractVideoFrame = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => { video.currentTime = 1.0; };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(video.src);
      resolve(b64);
    };
    video.onerror = () => reject("Erro ao ler vídeo");
  });

  const compressImage = (f: File, maxWidth = 800): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(f);
  });

  const onStart = async () => {
    if (!fileData) return;
    if (!nicho) { alert("Informe o nicho do anúncio."); return; }
    
    // VERIFICAÇÃO DE CRÉDITO ANTES DE INICIAR
    const creditCheck = await db.checkCredits(user.id);
    if (!creditCheck.hasCredits) {
      openUpgrade();
      return;
    }

    setLoading(true);
    setStatus('Digitalizando arquivo...');
    try {
      let base64 = "";
      if (fileData.type === 'video') {
        setStatus('Escaneando frames de alta performance...');
        base64 = await extractVideoFrame(fileData.file);
      } else {
        setStatus('Otimizando mapa de atenção...');
        base64 = await compressImage(fileData.file);
      }

      setStatus('Motor AdScore auditando elementos visuais...');
      console.log('🤖 Chamando analyzeCreative...');
      const res = await analyzeCreative({ frames: [base64], platform, objective, fileType: fileData.type });
      console.log('✅ Análise concluída:', res);
      
      // VALIDAR SE AUDITORIA FOI BEM SUCEDIDA
      if (!res || typeof res.score_geral !== 'number') {
        throw new Error('Auditoria retornou dados inválidos');
      }
      
      setStatus('Finalizando relatório técnico...');
      setProgress(100);
      
      console.log('📊 Tamanho do base64:', (base64.length / 1024).toFixed(2), 'KB');
      
      const audit: CreativeAudit = { 
        ...res, 
        userId: user.id, 
        imageUrl: base64, 
        id: crypto.randomUUID(), 
        createdAt: new Date().toISOString(), 
        platform, 
        objective, 
        fileType: fileData.type 
      };
      
      console.log('💾 Salvando auditoria com ID:', audit.id);
      
      // SALVAR AUDITORIA PRIMEIRO
      await db.saveAudit(audit);
      console.log('✅ Auditoria salva!');
      
      // CONSUMIR CRÉDITO APENAS APÓS AUDITORIA BEM SUCEDIDA E SALVA
      await db.useCredit(user.id);
      console.log('💳 Crédito consumido!');
      
      await refreshUser();
      console.log('🔄 Usuário atualizado!');
      
      console.log('🚀 Navegando para resultado:', audit.id);
      
      // Garantir que loading seja desligado antes de navegar
      setLoading(false);
      
      // Verificar se realmente salvou antes de navegar
      const verificacao = await db.getAuditById(audit.id);
      if (verificacao) {
        console.log('✅ Verificação OK: Auditoria encontrada no banco');
        navigate(`/app/resultado/${audit.id}`);
      } else {
        console.error('❌ ERRO: Auditoria não foi salva corretamente!');
        alert('Erro ao salvar auditoria. Por favor, tente novamente.');
      }
    } catch (e: any) {
      console.error('❌ [AUDITORIA] Erro durante o processo:', e);
      setLoading(false);
      alert("Falha técnica no processamento. Tente novamente. Erro: " + e.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row page-transition bg-white dark:bg-transparent relative">
       <button 
         onClick={() => navigate('/app')} 
         className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[11px] font-black uppercase transition-all shadow-lg"
       >
         <ChevronLeft className="w-4 h-4" /> Voltar
       </button>
       <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 lg:p-20 order-2 lg:order-1">
          {fileData ? (
             <div className="max-w-xs lg:max-w-md w-full relative group p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-3xl overflow-hidden">
                {fileData.type === 'video' ? <video src={fileData.url} className="w-full rounded-2xl" controls muted /> : <img src={fileData.url} className="w-full rounded-2xl" />}
                {loading && <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center gap-8">
                   <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                        <circle className="text-emerald-500 transition-all duration-300" strokeWidth="6" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-black text-xl">{Math.floor(progress)}%</div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[11px] font-black uppercase tracking-[0.3em]">{status}</p>
                     <p className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2"><Shield className="w-3 h-3"/> Diagnóstico Criptografado</p>
                   </div>
                </div>}
                {!loading && <button onClick={() => setFileData(null)} className="absolute top-4 right-4 bg-slate-900 text-white p-3 rounded-2xl hover:bg-rose-500 transition-colors shadow-lg"><X className="w-5 h-5" /></button>}
             </div>
          ) : (
             <div onClick={() => document.getElementById('file-up')?.click()} className="w-full max-w-sm aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-slate-900 dark:hover:border-emerald-500 transition-all p-10 text-center group">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-[12px] font-black uppercase text-slate-400 tracking-widest group-hover:text-slate-900 dark:group-hover:text-emerald-500">Subir Criativo para Auditoria</p>
                <p className="text-[10px] text-slate-400 mt-2">Imagem ou Vídeo (Max 50MB)</p>
                <input id="file-up" type="file" className="hidden" accept="image/*,video/*" onChange={e => {
                   const f = e.target.files?.[0]; 
                   if (f) setFileData({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image', file: f });
                }} />
             </div>
          )}
       </div>
       <div className="w-full lg:w-1/2 p-8 lg:p-24 flex items-center justify-center order-1 lg:order-2">
          <div className="max-w-sm w-full space-y-12">
             <div className="space-y-2"><h2 className="text-3xl lg:text-6xl font-black uppercase tracking-tighter">Configuração</h2></div>
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Nicho / Produto</label>
                   <input type="text" value={nicho} onChange={e => setNicho(e.target.value)} className="w-full py-5 px-5 rounded-2xl text-[11px] font-black uppercase border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500/50 transition-all" placeholder="Ex: Info, E-com, Dropshipping..." />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Canal de Mídia</label>
                   <div className="grid grid-cols-2 gap-4">
                      {['Meta Ads', 'TikTok Ads'].map(p => (
                        <button key={p} onClick={() => setPlatform(p)} className={`py-5 rounded-2xl text-[11px] font-black uppercase border transition-all ${platform === p ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>{p}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Objetivo Estratégico</label>
                   <select value={objective} onChange={e => setObjective(e.target.value)} className="w-full py-5 px-5 rounded-2xl text-[11px] font-black uppercase border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500/50 transition-all">
                      <option>Venda Direta</option>
                      <option>Captação de Leads</option>
                      <option>Awareness / Branding</option>
                   </select>
                </div>
                <button disabled={!fileData || loading} onClick={onStart} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-6 text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-2xl disabled:opacity-50 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-3">
                  {loading ? <><Loader2 className="w-4 animate-spin"/> Auditando...</> : <><BrainCircuit className="w-6 h-6" /> Auditar Criativo</>}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- View: History / Result ---
const HistoryView = ({ user }: { user: User }) => {
  const [audits, setAudits] = useState<CreativeAudit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAudits = async () => {
      const data = await db.getAudits(user.id);
      setAudits(data);
    };
    loadAudits();
  }, [user.id]);

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto page-transition pb-32">
      <button 
        onClick={() => navigate('/app')} 
        className="flex items-center gap-2 px-4 py-2 mb-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[11px] font-black uppercase transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar ao Dashboard
      </button>
      <div className="space-y-2">
        <h2 className="text-3xl lg:text-6xl font-black uppercase tracking-tighter">Arquivo Histórico</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memória de Performance do seu Tráfego</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {audits.length === 0 ? (
          <div className="col-span-full py-32 text-center space-y-6">
            <History className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto" />
            <p className="text-[12px] font-black uppercase text-slate-400">Nenhuma auditoria encontrada.</p>
            <Link to="/app/analisar" className="inline-block bg-emerald-500 text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase">Nova Auditoria</Link>
          </div>
        ) : (
          audits.map(a => (
            <Link key={a.id} to={`/app/resultado/${a.id}`} className="group">
              <GlassCard className="!p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col gap-6 !rounded-[2rem]">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={a.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 dark:bg-slate-900/95 rounded-lg text-[10px] font-black uppercase shadow-sm">
                    {a.score_geral}%
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <div>
                    <p className="text-[11px] font-black uppercase truncate">{a.platform}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(a.createdAt).toLocaleDateString()} às {new Date(a.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </GlassCard>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

const ResultView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<CreativeAudit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudit = async () => {
      if (id) {
        console.log('🔍 Buscando audit com ID:', id);
        const data = await db.getAuditById(id);
        console.log('📊 Audit encontrado:', data);
        setAudit(data || null);
        setLoading(false);
      }
    };
    loadAudit();
  }, [id]);

  if (loading) return (
    <div className="p-20 text-center space-y-6">
      <Loader2 className="w-16 h-16 animate-spin mx-auto text-emerald-500" />
      <div className="text-2xl font-black uppercase">Carregando resultado...</div>
    </div>
  );

  if (!audit) return (
    <div className="p-20 text-center space-y-6">
      <AlertTriangle className="w-16 h-16 mx-auto text-rose-500" />
      <div className="text-2xl font-black uppercase text-rose-500">Auditoria não encontrada</div>
      <button onClick={() => navigate('/app')} className="px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-black text-sm uppercase hover:bg-emerald-400">
        Voltar ao Dashboard
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-[1400px] mx-auto page-transition pb-32">
      <header className="flex justify-between items-center no-print">
        <button onClick={() => navigate('/app')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar ao Hub
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase">
          <Printer className="w-4 h-4" /> PDF
        </button>
      </header>

      <div className="grid lg:grid-cols-12 gap-16">
         <div className="lg:col-span-4 space-y-10">
            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden">
               <img src={audit.imageUrl} className="w-full rounded-[1.5rem]" />
            </div>
            
            <div className="flex flex-col items-center gap-6 p-10 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl">
               <div className="text-8xl font-black">{audit.score_geral}<span className="text-emerald-500">%</span></div>
               <PerformanceThermometer score={audit.score_geral} />
               <div className="w-full h-px bg-white/10" />
               <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 text-center">{audit.zona_decisao.justificativa_curta}</p>
            </div>
         </div>

         <div className="lg:col-span-8 space-y-20">
            <section className="space-y-8">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                 <Zap className="w-5 h-5 text-emerald-500" /> Diagnóstico Estratégico
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {audit.scores_por_criterio.map((c, i) => (
                   <GlassCard key={i} className="space-y-4 !rounded-[2rem]">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black uppercase">{c.criterio}</span>
                        <span className="text-lg font-black">{c.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${c.score}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase leading-relaxed">{c.porque}</p>
                   </GlassCard>
                 ))}
               </div>
            </section>

            <section className="space-y-8">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-500 flex items-center gap-3">
                 <AlertOctagon className="w-5 h-5" /> Onde o dinheiro está vazando
               </h3>
               <div className="space-y-4">
                 {audit.diagnostico_perda_dinheiro.map((d, i) => (
                   <div key={i} className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] space-y-4">
                     <div className="flex justify-between items-center"><Badge color="rose">Prioridade {d.prioridade}</Badge><XCircle className="w-5 h-5 text-rose-500" /></div>
                     <p className="text-xl font-black uppercase leading-tight">{d.problema}</p>
                     <p className="text-[10px] text-slate-500 font-black uppercase">Impacto: {d.impacto_estimado}</p>
                     <p className="text-[11px] font-black uppercase text-rose-500 pt-2 border-t border-rose-500/10">Solução Prática: {d.acao_pratica}</p>
                   </div>
                 ))}
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

// --- View: LandingPage ---
const LandingPage = ({ user }: { user: User | null }) => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-20 sticky top-0 bg-[#0F172A]/80 backdrop-blur-xl z-50 no-print">
        <div className="text-3xl font-black tracking-tighter uppercase">ADSCORE<span className="text-emerald-500">AI</span></div>
        <div className="flex items-center gap-8">
          {user ? (
            <Link to="/app" className="bg-emerald-500 text-slate-900 px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition-all">Ir para Dashboard</Link>
          ) : (
            <Link to="/auth" className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Começar Agora</Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 lg:py-40 space-y-32">
        <div className="text-center space-y-12 animate-fadeIn">
          <div className="flex justify-center">
            <Badge color="emerald">Beta VIP Ativo</Badge>
          </div>
          <h1 className="text-6xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85]">
            Sua verba não merece <br/>
            <span className="text-emerald-500">ser desperdiçada.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg lg:text-xl font-medium">
            O primeiro motor de auditoria visual do mundo que utiliza visão computacional real para prever a performance de criativos antes de você gastar 1 real em tráfego.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth" className="w-full sm:w-auto bg-emerald-500 text-slate-900 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3">
              Fazer Primeira Auditoria Grátis <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">2 Créditos Gratuitos no Cadastro</p>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">© 2025 ADSCORE AI • Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

// --- App Shell / Layout ---
const InternalApp = ({ user, refreshUser, handleLogout, theme, toggleTheme }: { user: User, refreshUser: () => void, handleLogout: () => void, theme: string, toggleTheme: () => void }) => {
  const loc = useLocation();
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (user.credits <= 0 && loc.pathname === '/app/analisar') {
      setShowUpgrade(true);
    }
  }, [user.credits, loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white transition-colors duration-300">
       {showUpgrade && <UpgradeOverlay user={user} refreshUser={refreshUser} onClose={() => setShowUpgrade(false)} />}
       
       <nav className="hidden lg:flex w-72 bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-slate-800 h-screen fixed left-0 top-0 flex-col p-10 z-50 no-print">
          <Link to="/" className="text-2xl font-black tracking-tighter mb-16 uppercase">ADSCORE<span className="text-emerald-500">AI</span></Link>
          <div className="flex-1 space-y-3">
             {[ 
               { icon: LayoutDashboard, label: 'Dashboard', path: '/app' }, 
               { icon: PlusCircle, label: 'Auditoria', path: '/app/analisar' }, 
               { icon: History, label: 'Histórico', path: '/app/historico' } 
             ].map(m => (
               <Link key={m.path} to={m.path} className={`flex items-center gap-4 px-6 py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${loc.pathname === m.path || (m.path === '/app' && loc.pathname === '/app/') ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-2xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}><m.icon className="w-5 h-5" /> {m.label}</Link>
             ))}
             <button onClick={() => setShowUpgrade(true)} className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all">
               <CreditCard className="w-5 h-5" /> Recarregar Créditos
             </button>
             <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all mt-10">
               <LogOut className="w-5 h-5" /> Sair do Sistema
             </button>
          </div>
          <div className="pt-10 border-t border-slate-50 dark:border-slate-800">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400">Plano Ativo</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {user.credits >= 999999 ? 'Administrador' : user.credits > 0 ? 'Premium' : 'Bloqueado'}
                </span>
                <span className="text-[10px] font-black text-emerald-500 uppercase">
                  {user.credits >= 999999 ? '∞' : user.credits} CRÉD.
                </span>
              </div>
            </div>
          </div>
       </nav>
       <div className="flex-1 lg:ml-72 bg-white dark:bg-[#0F172A] min-h-screen">
          <header className="h-20 border-b border-slate-50 dark:border-slate-800 px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl z-40 no-print">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 tracking-widest"><ShieldCheck className="w-5 h-5 text-emerald-500"/> Auditoria Real-Time</div>
             <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                <div className="text-right hidden sm:block"><p className="text-[11px] font-black uppercase">{user.name}</p></div>
                <div className="w-10 h-10 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm">{user.name.charAt(0)}</div>
             </div>
          </header>
          <main className="w-full">
             <Routes>
               <Route index element={<DashboardView user={user} />} />
               <Route path="analisar" element={<AnalyzeView user={user} refreshUser={refreshUser} openUpgrade={() => setShowUpgrade(true)} />} />
               <Route path="resultado/:id" element={<ResultView />} />
               <Route path="historico" element={<HistoryView user={user} />} />
             </Routes>
          </main>
       </div>
    </div>
  );
};

// --- Protected Route ---
// Fix: Use React.ReactNode for children to ensure proper TypeScript recognition of nested elements.
const ProtectedRoute = ({ user, children }: { user: User | null, children?: React.ReactNode }) => {
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

// --- Main App Entry ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('adscore-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const loadSession = async () => {
      const session = await db.getSession();
      setUser(session);
    };
    loadSession();
  }, []);

  const refreshUser = async () => {
    const session = await db.getSession();
    setUser(session);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('adscore-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/auth" element={user ? <Navigate to="/app" replace /> : <AuthView setUser={setUser} />} />
        <Route path="/app/*" element={
          <ProtectedRoute user={user!}>
            <InternalApp user={user!} refreshUser={refreshUser} handleLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

const Root = () => (<App />);
export default Root;
