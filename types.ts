export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  credits: number;
  totalAnalyses: number;
  createdAt: string;
}

export interface DashboardKPIs {
  totalAudits: number;
  avgScore: number;
  scaleCount: number;
  optimizeCount: number;
  pauseCount: number;
  creditsRemaining: number;
  historicalTrend: number[];
}

export interface CreativeAudit {
  id: string;
  userId: string;
  imageUrl: string;
  fileType: 'image' | 'video';
  platform: string;
  objective: string;
  tipo: string;
  score_geral: number;
  zona_decisao: any;
  scores_por_criterio: any[];
  diagnostico_perda_dinheiro: any[];
  plano_melhorias_praticas: any[];
  nova_versao_sugerida: any;
  ganchos_extras: string[];
  ctas_extras: string[];
  simulador_performance: any;
  mapa_atencao_simulado: any;
  checklist_vencedor: any[];
  video_frames: any[];
  termometro: any;
  createdAt: string;
}
