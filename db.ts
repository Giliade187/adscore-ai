
import { createClient } from '@supabase/supabase-js';
import { CreativeAudit, DashboardKPIs, User } from './types';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

const SESSION_KEY = 'adscore_session_supabase';
const ADMIN_EMAIL = 'bartolomeugiliade@gmail.com';

export const db = {
  register: async (email: string, name: string, password: string): Promise<User | null> => {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (existing) return null;

      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          password,
          credits: email === ADMIN_EMAIL ? 999999 : 2,
          total_analyses: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        return null;
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        password: data.password,
        credits: data.credits,
        totalAnalyses: data.total_analyses,
        createdAt: data.created_at
      };

      db.setSession(user);
      return user;
    } catch (error) {
      console.error('Register error:', error);
      return null;
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) return null;

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        password: data.password,
        credits: data.credits,
        totalAnalyses: data.total_analyses,
        createdAt: data.created_at
      };

      db.setSession(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getSession: async (): Promise<User | null> => {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      
      const sessionUser = JSON.parse(data);
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error || !userData) return null;

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        password: userData.password,
        credits: userData.email === ADMIN_EMAIL ? 999999 : userData.credits,
        totalAnalyses: userData.total_analyses,
        createdAt: userData.created_at
      };

      return user;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  getUsers: (): User[] => [],

  checkCredits: async (userId: string): Promise<{ hasCredits: boolean; balance: number }> => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('credits, email')
        .eq('id', userId)
        .single();

      if (!user) return { hasCredits: false, balance: 0 };

      if (user.email === ADMIN_EMAIL) {
        return { hasCredits: true, balance: 999999 };
      }

      const balance = user.credits || 0;
      return { hasCredits: balance > 0, balance };
    } catch (error) {
      console.error('Check credits error:', error);
      return { hasCredits: false, balance: 0 };
    }
  },

  useCredit: async (userId: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) return false;

      if (user.email === ADMIN_EMAIL) {
        await supabase
          .from('users')
          .update({ total_analyses: user.total_analyses + 1 })
          .eq('id', userId);
        return true;
      }

      if (user.credits <= 0) return false;

      const { error } = await supabase
        .from('users')
        .update({
          credits: user.credits - 1,
          total_analyses: user.total_analyses + 1
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Use credit error:', error);
      return false;
    }
  },

  addCredits: async (userId: string, amount: number) => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({ credits: user.credits + amount })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Add credits error:', error);
    }
  },

     saveAudit: async (audit: CreativeAudit) => {
       try {
         console.log('💾 [DB] Iniciando salvamento da auditoria:', audit.id);
         const { data, error } = await supabase.from('audits').insert({
           id: audit.id,
           user_id: audit.userId,
           image_url: audit.imageUrl,
           file_type: audit.fileType,
           platform: audit.platform,
           objective: audit.objective,
           tipo: audit.tipo,
           score_geral: audit.score_geral,
           zona_decisao: audit.zona_decisao,
           scores_por_criterio: audit.scores_por_criterio,
           diagnostico_perda_dinheiro: audit.diagnostico_perda_dinheiro,
           plano_melhorias_praticas: audit.plano_melhorias_praticas,
           nova_versao_sugerida: audit.nova_versao_sugerida,
           ganchos_extras: audit.ganchos_extras || [],
           ctas_extras: audit.ctas_extras || [],
           simulador_performance: audit.simulador_performance,
           mapa_atencao_simulado: audit.mapa_atencao_simulado,
           checklist_vencedor: audit.checklist_vencedor,
           video_frames: audit.video_frames || [],
           termometro: audit.termometro,
           created_at: audit.createdAt
         }).select();
         
        if (error) {
          console.error('❌ [DB] Erro ao salvar auditoria:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Erro ao salvar no banco: ${error.message}`);
        }
        
        console.log('✅ [DB] Auditoria salva com sucesso:', data);
      } catch (error: any) {
        console.error('❌ [DB] Save audit error:', error);
        throw new Error(error.message || 'Erro desconhecido ao salvar auditoria');
      }
     },

  getAudits: async (userId: string): Promise<CreativeAudit[]> => {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
        id: d.id,
        userId: d.user_id,
        imageUrl: d.image_url,
        fileType: d.file_type,
        platform: d.platform,
        objective: d.objective,
        tipo: d.tipo,
        score_geral: d.score_geral,
        zona_decisao: d.zona_decisao,
        scores_por_criterio: d.scores_por_criterio,
        diagnostico_perda_dinheiro: d.diagnostico_perda_dinheiro,
        plano_melhorias_praticas: d.plano_melhorias_praticas,
        nova_versao_sugerida: d.nova_versao_sugerida,
        ganchos_extras: d.ganchos_extras || [],
        ctas_extras: d.ctas_extras || [],
        simulador_performance: d.simulador_performance,
        mapa_atencao_simulado: d.mapa_atencao_simulado,
        checklist_vencedor: d.checklist_vencedor,
        video_frames: d.video_frames || [],
        termometro: d.termometro,
        createdAt: d.created_at
      }));
    } catch (error) {
      console.error('Get audits error:', error);
      return [];
    }
  },

  getAuditById: async (id: string): Promise<CreativeAudit | undefined> => {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return undefined;

      return {
        id: data.id,
        userId: data.user_id,
        imageUrl: data.image_url,
        fileType: data.file_type,
        platform: data.platform,
        objective: data.objective,
        tipo: data.tipo,
        score_geral: data.score_geral,
        zona_decisao: data.zona_decisao,
        scores_por_criterio: data.scores_por_criterio,
        diagnostico_perda_dinheiro: data.diagnostico_perda_dinheiro,
        plano_melhorias_praticas: data.plano_melhorias_praticas,
        nova_versao_sugerida: data.nova_versao_sugerida,
        ganchos_extras: data.ganchos_extras || [],
        ctas_extras: data.ctas_extras || [],
        simulador_performance: data.simulador_performance,
        mapa_atencao_simulado: data.mapa_atencao_simulado,
        checklist_vencedor: data.checklist_vencedor,
        video_frames: data.video_frames || [],
        termometro: data.termometro,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Get audit by id error:', error);
      return undefined;
    }
  },

  getKPIs: async (userId: string): Promise<DashboardKPIs> => {
    try {
      const audits = await db.getAudits(userId);
      
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const isAdmin = user?.email === ADMIN_EMAIL;

      return {
        totalAudits: audits.length,
        avgScore: audits.length ? Math.round(audits.reduce((acc, curr) => acc + curr.score_geral, 0) / audits.length) : 0,
        scaleCount: audits.filter(a => a.zona_decisao.recomendacao === 'escalar').length,
        optimizeCount: audits.filter(a => a.zona_decisao.recomendacao === 'ajustar').length,
        pauseCount: audits.filter(a => a.zona_decisao.recomendacao === 'matar').length,
        creditsRemaining: isAdmin ? 999999 : (user?.credits || 0),
        historicalTrend: audits.slice(0, 7).map(a => a.score_geral).reverse()
      };
    } catch (error) {
      console.error('Get KPIs error:', error);
      return {
        totalAudits: 0,
        avgScore: 0,
        scaleCount: 0,
        optimizeCount: 0,
        pauseCount: 0,
        creditsRemaining: 0,
        historicalTrend: []
      };
    }
  }
};
