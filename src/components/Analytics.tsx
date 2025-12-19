import { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, Users, Globe, Smartphone, 
  TrendingUp, Eye, Clock, Monitor, Tablet, Phone,
  Calendar, ArrowUpRight, RefreshCw, Activity, 
  TrendingDown, ExternalLink, Link as LinkIcon, 
  Zap, Globe2, Calendar as CalendarIcon, MapPin, HelpCircle, X
} from 'lucide-react';
import { getStatistics } from '../lib/api';

interface AnalyticsProps {
  user: any;
}

export default function Analytics({ user }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [overview, setOverview] = useState<any>(null);
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [devices, setDevices] = useState<any>(null);
  const [flow, setFlow] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);
  const [locations, setLocations] = useState<any>(null);
  const [assessors, setAssessors] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [helpTooltip, setHelpTooltip] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<any>({});
  const animationRefs = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    loadAnalytics();
    // Carregar dados em tempo real
    loadRealtime();
    const realtimeInterval = setInterval(loadRealtime, 30000); // Atualizar a cada 30s
    
    return () => clearInterval(realtimeInterval);
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [overviewRes, pageviewsRes, devicesRes, flowRes, locationsRes, assessorsRes] = await Promise.all([
        getStatistics('overview', period),
        getStatistics('pageviews', period),
        getStatistics('devices', period),
        getStatistics('flow', period),
        getStatistics('locations', period),
        getStatistics('assessors', period).catch((err) => {
          console.error('Erro ao carregar assessores:', err);
          return { data: null };
        }),
      ]);

      if (overviewRes.data) {
        const data = overviewRes.data;
        setOverview(data);
        
        // Resetar valores animados antes de iniciar nova animação
        setAnimatedValues({});
        
        // Pequeno delay para garantir que o estado foi atualizado
        setTimeout(() => {
          // Iniciar animação dos valores
          animateValue('unique_visitors', 0, data.unique_visitors || 0, 1500);
          animateValue('total_pageviews', 0, data.total_pageviews || 0, 1500);
          animateValue('total_clicks', 0, data.total_clicks || 0, 1500);
          animateValue('avg_time_on_page', 0, data.avg_time_on_page || 0, 1500);
          animateValue('bounce_rate', 0, data.bounce_rate || 0, 1500);
          animateValue('avg_session_duration', 0, data.avg_session_duration || 0, 1500);
          animateValue('conversion_rate', 0, data.total_visits > 0 
            ? ((data.total_clicks / data.total_visits) * 100) 
            : 0, 1500);
          animateValue('pages_per_session', 0, data.total_visits > 0 
            ? (data.total_pageviews / data.total_visits) 
            : 0, 1500);
          animateValue('total_visits', 0, data.total_visits || 0, 1500);
        }, 100);
      }
      if (pageviewsRes.data?.pages) setPageviews(pageviewsRes.data.pages);
      if (devicesRes.data) setDevices(devicesRes.data);
      if (flowRes.data) setFlow(flowRes.data);
      if (locationsRes.data) setLocations(locationsRes.data);
      if (assessorsRes.data) setAssessors(assessorsRes.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
      console.error('Erro ao carregar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtime = async () => {
    try {
      const response = await getStatistics('realtime', period);
      if (response.data) {
        setRealtime(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados em tempo real:', err);
    }
  };

  // Função para animar valores numéricos
  const animateValue = (key: string, start: number, end: number, duration: number) => {
    // Limpar animação anterior se existir
    if (animationRefs.current[key]) {
      cancelAnimationFrame(animationRefs.current[key]);
    }
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;
      
      setAnimatedValues((prev: any) => ({
        ...prev,
        [key]: current
      }));
      
      if (progress < 1) {
        animationRefs.current[key] = requestAnimationFrame(animate);
      } else {
        // Garantir valor final exato
        setAnimatedValues((prev: any) => ({
          ...prev,
          [key]: end
        }));
      }
    };
    
    animationRefs.current[key] = requestAnimationFrame(animate);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.floor(num));
  };

  const formatTime = (seconds: number) => {
    const secs = Math.floor(seconds);
    if (secs < 60) return `${secs}s`;
    const minutes = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${minutes}m ${remainingSecs}s`;
  };
  
  // Limpar animações ao desmontar ou mudar período
  useEffect(() => {
    return () => {
      Object.values(animationRefs.current).forEach(id => {
        if (id) cancelAnimationFrame(id);
      });
    };
  }, [period]);

  const periodOptions = [
    { value: '1d', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const metricExplanations: { [key: string]: string } = {
    'unique_visitors': 'Visitantes Únicos: Número total de pessoas diferentes que visitaram o site no período selecionado. Cada pessoa é contada apenas uma vez, mesmo que visite múltiplas vezes.',
    'total_pageviews': 'Visualizações: Número total de páginas visualizadas por todos os visitantes. Uma mesma pessoa pode gerar múltiplas visualizações ao navegar pelo site.',
    'total_clicks': 'Total de Cliques: Número total de cliques registrados em elementos interativos do site, como botões, links e outros elementos clicáveis.',
    'avg_time_on_page': 'Tempo Médio: Tempo médio que os visitantes permanecem em uma página antes de navegar para outra ou sair do site.',
    'bounce_rate': 'Taxa de Saída: Percentual de visitantes que visualizaram apenas uma página e saíram do site. Pode indicar que encontraram a informação desejada rapidamente ou que o conteúdo precisa ser mais atrativo.',
    'avg_session_duration': 'Duração Média de Sessão: Tempo médio total que os visitantes permanecem no site durante uma sessão, desde a entrada até a saída.',
    'conversion_rate': 'Taxa de Conversão: Percentual de visitas que resultaram em cliques em elementos importantes do site. Indica o nível de engajamento dos visitantes.',
    'pages_per_session': 'Páginas por Sessão: Número médio de páginas visualizadas por cada visitante durante uma sessão. Valores maiores indicam maior exploração do site.',
  };

  const HelpButton = ({ metricKey }: { metricKey: string }) => {
    const explanation = metricExplanations[metricKey];
    if (!explanation) return null;

    return (
      <div className="relative group help-button-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setHelpTooltip(helpTooltip === metricKey ? null : metricKey);
          }}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
          title="Clique para mais informações"
        >
          <HelpCircle size={16} className="text-gray-400 hover:text-gray-600" />
        </button>
        {helpTooltip === metricKey && (
          <div className="absolute z-50 right-0 top-8 w-72 md:w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-sm text-gray-700">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-black text-base">Sobre esta métrica</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHelpTooltip(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors touch-manipulation"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs md:text-sm leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    );
  };

  // Fechar tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpTooltip && !(event.target as Element).closest('.help-button-container')) {
        setHelpTooltip(null);
      }
    };
    if (helpTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [helpTooltip]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtro de Período e Tempo Real */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-black">Período</h2>
            {realtime && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm text-gray-600">
                  {realtime.online_visitors || 0} visitante{realtime.online_visitors !== 1 ? 's' : ''} online agora
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors touch-manipulation ${
                  period === opt.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={loadAnalytics}
              className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
              title="Atualizar"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 md:p-3 rounded-lg">
                  <Users size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
                  <HelpButton metricKey="unique_visitors" />
                </div>
              </div>
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Visitantes Únicos</p>
              <p className="text-2xl md:text-3xl font-bold text-black">{formatNumber(animatedValues.unique_visitors ?? overview?.unique_visitors ?? 0)}</p>
              <p className="text-xs text-gray-500 mt-2">Total de visitas: {formatNumber(animatedValues.total_visits ?? overview?.total_visits ?? 0)}</p>
            </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 md:p-3 rounded-lg">
                <Eye size={20} className="md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
                <HelpButton metricKey="total_pageviews" />
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Visualizações</p>
            <p className="text-2xl md:text-3xl font-bold text-black">{formatNumber(animatedValues.total_pageviews ?? overview?.total_pageviews ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-2">Média por visita: {overview?.total_visits > 0 ? ((animatedValues.total_pageviews ?? overview.total_pageviews ?? 0) / (overview.total_visits || 1)).toFixed(1) : 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 md:p-3 rounded-lg">
                <Zap size={20} className="md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
                <HelpButton metricKey="total_clicks" />
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Total de Cliques</p>
            <p className="text-2xl md:text-3xl font-bold text-black">{formatNumber(animatedValues.total_clicks ?? overview?.total_clicks ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-2">Interações registradas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 md:p-3 rounded-lg">
                <Clock size={20} className="md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
                <HelpButton metricKey="avg_time_on_page" />
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Tempo Médio</p>
            <p className="text-2xl md:text-3xl font-bold text-black">{formatTime(animatedValues.avg_time_on_page ?? overview?.avg_time_on_page ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-2">Tempo médio na página</p>
          </div>
      </div>

      {/* Segunda Linha de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 md:p-3 rounded-lg">
                  <TrendingDown size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <HelpButton metricKey="bounce_rate" />
              </div>
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Taxa de Saída</p>
              <p className="text-2xl md:text-3xl font-bold text-black">{Math.round(animatedValues.bounce_rate ?? overview?.bounce_rate ?? 0)}%</p>
              <p className="text-xs text-gray-500 mt-2">Sessões com apenas 1 página</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 md:p-3 rounded-lg">
                  <Activity size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <HelpButton metricKey="avg_session_duration" />
              </div>
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Duração Média de Sessão</p>
              <p className="text-2xl md:text-3xl font-bold text-black">{formatTime(animatedValues.avg_session_duration ?? overview?.avg_session_duration ?? 0)}</p>
              <p className="text-xs text-gray-500 mt-2">Tempo médio por sessão</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-2.5 md:p-3 rounded-lg">
                  <Zap size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <HelpButton metricKey="conversion_rate" />
              </div>
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Taxa de Conversão</p>
              <p className="text-2xl md:text-3xl font-bold text-black">
                {(animatedValues.conversion_rate ?? (overview?.total_visits > 0 
                  ? ((overview.total_clicks / overview.total_visits) * 100) 
                  : 0)).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Cliques por visita</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 relative">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2.5 md:p-3 rounded-lg">
                  <Globe2 size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <HelpButton metricKey="pages_per_session" />
              </div>
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Páginas por Sessão</p>
              <p className="text-2xl md:text-3xl font-bold text-black">
                {(animatedValues.pages_per_session ?? (overview?.total_visits > 0 
                  ? (overview.total_pageviews / overview.total_visits) 
                  : 0)).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Média de páginas visitadas</p>
            </div>
      </div>

      {/* Horários de Pico e Dias da Semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Horários de Pico</h3>
          <div className="space-y-2">
            {overview?.peak_hours && overview.peak_hours.length > 0 ? (
              overview.peak_hours.map((hour: any, index: number) => {
                const maxVisits = Math.max(...overview.peak_hours.map((h: any) => h.visits));
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-sm text-gray-600 font-medium">
                      {String(hour.hour).padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(hour.visits / maxVisits) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{hour.visits}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Atividade por Dia da Semana</h3>
          <div className="space-y-2">
            {overview?.week_days && overview.week_days.length > 0 ? (
              overview.week_days.map((day: any, index: number) => {
                const maxVisits = Math.max(...overview.week_days.map((d: any) => d.visits));
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-gray-600 font-medium">
                      {day.day_name || dayNames[day.day_num - 1]}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(day.visits / maxVisits) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{day.visits}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Visitantes */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
        <h3 className="text-lg md:text-xl font-bold text-black mb-4">Visitantes ao Longo do Tempo</h3>
        <div className="space-y-3">
          {overview?.visits_chart && overview.visits_chart.length > 0 ? (
            overview.visits_chart.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{new Date(item.date).toLocaleDateString('pt-BR')}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.visits / (overview.total_visits || 1)) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{item.visits}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      {/* Páginas Mais Visitadas */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
        <h3 className="text-lg md:text-xl font-bold text-black mb-4">Páginas Mais Visitadas</h3>
        <div className="space-y-3">
          {pageviews.length > 0 ? (
            pageviews.slice(0, 10).map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-black">{page.page_path || '/'}</p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(page.views || 0)} visualizações
                    {page.avg_time && ` • ${formatTime(page.avg_time)} médio`}
                  </p>
                </div>
                <ArrowUpRight size={16} className="text-gray-400" />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      {/* Dispositivos, Navegadores e OS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
            <h3 className="text-lg md:text-xl font-bold text-black mb-4">Dispositivos</h3>
            <div className="space-y-3">
              {devices && devices.device_summary && devices.device_summary.length > 0 ? (
                devices.device_summary.map((device: any, index: number) => {
                const Icon = device.device_type === 'mobile' ? Phone : device.device_type === 'tablet' ? Tablet : Monitor;
                const percentage = overview?.total_visits > 0 
                  ? ((device.sessions || 0) / overview.total_visits * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} className="text-gray-600" />
                      <span className="font-semibold text-black capitalize">
                        {device.device_type || 'Desktop'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-black">{formatNumber(device.sessions || 0)}</p>
                    <p className="text-xs text-gray-500">{percentage}% do total</p>
                  </div>
                );
              })
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
              )}
            </div>
          </div>

          {/* Navegadores */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
            <h3 className="text-lg md:text-xl font-bold text-black mb-4">Navegadores</h3>
            <div className="space-y-2">
              {devices && devices.browsers && devices.browsers.length > 0 ? (
                devices.browsers.slice(0, 5).map((browser: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-black">{browser.browser}</span>
                    <span className="text-xs text-gray-600">{formatNumber(browser.sessions)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">Nenhum dado disponível</p>
              )}
            </div>
          </div>

          {/* Sistemas Operacionais */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
            <h3 className="text-lg md:text-xl font-bold text-black mb-4">Sistemas Operacionais</h3>
            <div className="space-y-2">
              {devices && devices.operating_systems && devices.operating_systems.length > 0 ? (
                devices.operating_systems.slice(0, 5).map((os: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-black">{os.os}</span>
                    <span className="text-xs text-gray-600">{formatNumber(os.sessions)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>

      {/* Origem do Tráfego e Páginas de Saída */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Origem do Tráfego</h3>
          <div className="space-y-3">
            {flow && flow.traffic_sources && flow.traffic_sources.length > 0 ? (
              flow.traffic_sources.map((source: any, index: number) => {
                const maxSessions = Math.max(...flow.traffic_sources.map((s: any) => s.sessions));
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600 font-medium">{source.source}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(source.sessions / maxSessions) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{source.sessions}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Páginas de Saída</h3>
          <div className="space-y-2">
            {flow && flow.exit_pages && flow.exit_pages.length > 0 ? (
              flow.exit_pages.slice(0, 10).map((page: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="text-gray-400" />
                    <span className="font-medium text-black">{page.page_path || '/'}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{formatNumber(page.exit_count || 0)} saídas</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>

      {/* Fluxo de Navegação */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
        <h3 className="text-lg md:text-xl font-bold text-black mb-4">Páginas de Entrada</h3>
        <div className="space-y-2">
          {flow && flow.entry_pages && flow.entry_pages.length > 0 ? (
            flow.entry_pages.slice(0, 5).map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" />
                  <span className="font-medium text-black">{page.page || '/'}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{formatNumber(page.count || 0)} entradas</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      {/* Localização dos Acessos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4 flex items-center gap-2">
            <MapPin size={20} className="md:w-6 md:h-6" />
            Acessos por País
          </h3>
          <div className="space-y-3">
            {locations && locations.countries && locations.countries.length > 0 ? (
              locations.countries.slice(0, 15).map((country: any, index: number) => {
                const maxSessions = Math.max(...locations.countries.map((c: any) => c.sessions));
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600 font-medium">{country.country || 'Desconhecido'}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(country.sessions / maxSessions) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{country.sessions}</span>
                      </div>
                    </div>
                    <div className="w-16 text-xs text-gray-500 text-right">
                      {formatNumber(country.pageviews)} views
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4 flex items-center gap-2">
            <MapPin size={20} className="md:w-6 md:h-6" />
            Acessos por Cidade
          </h3>
          <div className="space-y-2">
            {locations && locations.cities && locations.cities.length > 0 ? (
              locations.cities.slice(0, 20).map((city: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-black">
                      {city.city || 'Desconhecida'}
                      {city.country && (
                        <span className="text-xs text-gray-500 ml-2">({city.country})</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(city.sessions)} sessões • {formatNumber(city.pageviews)} visualizações
                    </p>
                  </div>
                  <MapPin size={16} className="text-gray-400" />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas de Assessores */}
      {assessors && (
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-black">Estatísticas de Assessores</h2>
          
          {/* Cards por Categoria */}
          {assessors.categories && assessors.categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {assessors.categories.map((cat: any, index: number) => {
                const categoryNames: { [key: string]: string } = {
                  'grupo_raca': 'Grupo Raça',
                  'campolina': 'Campolina',
                  'parceiras': 'Parceiras'
                };
                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-black mb-2">{categoryNames[cat.category] || cat.category}</h3>
                    <p className="text-3xl font-bold text-black">{formatNumber(cat.total || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total de assessores</p>
                    <p className="text-sm text-gray-600 mt-2">{formatNumber(cat.active_count || 0)} ativos</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Assessores Mais Clicados */}
          {assessors.top_assessors && assessors.top_assessors.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
              <h3 className="text-lg md:text-xl font-bold text-black mb-4">Assessores Mais Clicados</h3>
              <div className="space-y-3">
                {assessors.top_assessors.slice(0, 10).map((assessor: any, index: number) => {
                  const categoryNames: { [key: string]: string } = {
                    'grupo_raca': 'Grupo Raça',
                    'campolina': 'Campolina',
                    'parceiras': 'Parceiras'
                  };
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-black">{assessor.name}</p>
                        <p className="text-xs text-gray-500">
                          {categoryNames[assessor.category] || assessor.category}
                          {assessor.total_clicks > 0 && ` • ${formatNumber(assessor.total_clicks)} cliques`}
                        </p>
                      </div>
                      {assessor.total_clicks > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-600">
                            📞 {formatNumber(assessor.phone_clicks || 0)} • 
                            💬 {formatNumber(assessor.whatsapp_clicks || 0)} • 
                            ✉️ {formatNumber(assessor.email_clicks || 0)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
              <h3 className="text-lg md:text-xl font-bold text-black mb-4">Assessores Mais Clicados</h3>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Aguardando dados de cliques</p>
                <p className="text-xs text-gray-400">Os assessores mais clicados aparecerão aqui quando houver interações registradas</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
