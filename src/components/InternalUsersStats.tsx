import { useState, useEffect } from 'react';
import { 
  Users, Clock, Activity, Calendar, 
  RefreshCw, User as UserIcon, TrendingUp,
  LogIn, LogOut, Globe, Monitor
} from 'lucide-react';
import { getStatistics } from '../lib/api';

interface InternalUsersStatsProps {
  user: any;
}

export default function InternalUsersStats({ user }: InternalUsersStatsProps) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getStatistics('internal_users', period);
      if (response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Erro ao carregar estatísticas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
      console.error('Erro ao carregar estatísticas de usuários internos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds === 0) return '0s';
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.floor(num || 0));
  };

  const periodOptions = [
    { value: '1d', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
  ];

  if (loading) {
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtro de Período */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-base md:text-lg font-bold text-black">Período</h2>
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
              onClick={loadStats}
              className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
              title="Atualizar"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 md:p-3 rounded-lg">
              <Users size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
          </div>
          <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Usuários Únicos</p>
          <p className="text-2xl md:text-3xl font-bold text-black">{formatNumber(data.total_users || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">Usuários que acessaram o sistema</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 md:p-3 rounded-lg">
              <Activity size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
          </div>
          <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Total de Sessões</p>
          <p className="text-2xl md:text-3xl font-bold text-black">{formatNumber(data.total_sessions || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">Logins realizados no período</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 md:p-3 rounded-lg">
              <Clock size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <TrendingUp size={14} className="md:w-4 md:h-4 text-green-600" />
          </div>
          <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Tempo Médio de Sessão</p>
          <p className="text-2xl md:text-3xl font-bold text-black">{formatTime(data.avg_session_duration || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">Duração média por sessão</p>
        </div>
      </div>

      {/* Gráfico de Acessos */}
      {data.sessions_chart && data.sessions_chart.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Acessos ao Longo do Tempo</h3>
          <div className="space-y-3">
            {data.sessions_chart.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{new Date(item.date).toLocaleDateString('pt-BR')}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.sessions / (data.total_sessions || 1)) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{item.sessions} sessões</span>
                  </div>
                </div>
                <div className="w-20 text-xs text-gray-500 text-right">
                  {item.unique_users} usuários
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Usuários */}
      {data.users && data.users.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Usuários do Sistema</h3>
          <div className="space-y-3">
            {data.users.map((userData: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <UserIcon size={18} className="text-gray-600" />
                    <p className="font-semibold text-black">{userData.name}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      userData.role === 'root' ? 'bg-red-100 text-red-700' :
                      userData.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {userData.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-7">{userData.email}</p>
                  <p className="text-xs text-gray-400 ml-7 mt-1">
                    Último acesso: {new Date(userData.last_login).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">
                    {formatNumber(userData.total_sessions)} sessões
                  </p>
                  {userData.avg_duration && (
                    <p className="text-xs text-gray-500">
                      Média: {formatTime(userData.avg_duration)}
                    </p>
                  )}
                  {userData.total_time && userData.total_time > 0 && (
                    <p className="text-xs text-gray-500">
                      Total: {formatTime(userData.total_time)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4">Usuários do Sistema</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário encontrado no período selecionado</p>
          </div>
        </div>
      )}

      {/* Histórico Geral de Acessos */}
      {data.access_history && data.access_history.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Histórico Geral de Acessos
          </h3>
          <div className="overflow-x-auto">
            {/* Desktop: Tabela */}
            <table className="hidden md:table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Perfil</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Logout</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duração</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.access_history.map((session: any, index: number) => (
                  <tr key={session.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-black text-sm">{session.name}</p>
                        <p className="text-xs text-gray-500">{session.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.role === 'root' ? 'bg-red-100 text-red-700' :
                        session.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {session.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <LogIn size={14} className="text-green-600" />
                        <span>{new Date(session.login_time).toLocaleString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.logout_time ? (
                        <div className="flex items-center gap-2">
                          <LogOut size={14} className="text-red-600" />
                          <span>{new Date(session.logout_time).toLocaleString('pt-BR')}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Em andamento</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.session_duration ? (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-600" />
                          <span>{formatTime(session.session_duration)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {session.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-3">
              {data.access_history.map((session: any, index: number) => (
                <div key={session.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UserIcon size={16} className="text-gray-600" />
                        <p className="font-semibold text-black text-sm">{session.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          session.role === 'root' ? 'bg-red-100 text-red-700' :
                          session.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{session.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <LogIn size={14} className="text-green-600" />
                      <span className="font-medium">Login:</span>
                      <span>{new Date(session.login_time).toLocaleString('pt-BR')}</span>
                    </div>
                    
                    {session.logout_time ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <LogOut size={14} className="text-red-600" />
                        <span className="font-medium">Logout:</span>
                        <span>{new Date(session.logout_time).toLocaleString('pt-BR')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <LogOut size={14} />
                        <span className="italic">Sessão em andamento</span>
                      </div>
                    )}
                    
                    {session.session_duration && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-blue-600" />
                        <span className="font-medium">Duração:</span>
                        <span>{formatTime(session.session_duration)}</span>
                      </div>
                    )}
                    
                    {session.ip_address && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Globe size={14} />
                        <span className="font-medium">IP:</span>
                        <span className="font-mono">{session.ip_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {data.access_history.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                Total de {formatNumber(data.access_history.length)} sessões no período selecionado
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Histórico Geral de Acessos
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum acesso registrado no período selecionado</p>
          </div>
        </div>
      )}
    </div>
  );
}

