import { useState, useEffect } from 'react';
import { LogIn, X, CheckCircle } from 'lucide-react';
import { login } from '../lib/api';
import Loading from './Loading';

interface LoginProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function Login({ onClose, onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Delay mínimo para feedback visual (800ms)
      const [response] = await Promise.all([
        login(email, password),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // A API retorna { success: true, user: {...} }
      if (!response.user) {
        setError('Email ou senha incorretos');
        setLoading(false);
        return;
      }

      // Verificar se o usuário tem permissão para acessar o sistema interno
      // Apenas admin e root podem acessar
      if (response.user.role !== 'admin' && response.user.role !== 'root') {
        setError('Você não tem permissão de acesso habilitada. Apenas administradores podem acessar o sistema interno.');
        setLoading(false);
        return;
      }

      // Salvar usuário no localStorage
      localStorage.setItem('gruporaca_user', JSON.stringify(response.user));
      
      // Mostrar animação de sucesso
      setSuccess(true);
      setLoading(false);
      
      // Aguardar um pouco antes de fechar (animação de sucesso)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Fade out antes de fechar
      setIsVisible(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSuccess(response.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setIsVisible(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    onClose();
  };

  return (
    <>
      {loading && <Loading message="Autenticando..." />}
      <div 
        className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">Sistema Interno</h2>
          <p className="text-gray-600">Acesso restrito ao pessoal autorizado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              success 
                ? 'bg-green-600' 
                : 'bg-black hover:bg-gray-800 disabled:opacity-50'
            }`}
          >
            {success ? (
              <>
                <CheckCircle size={20} />
                Login realizado com sucesso!
              </>
            ) : loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Autenticando...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Entrar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading || success}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </form>
        </div>
      </div>
    </>
  );
}

