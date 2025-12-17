import { useState, useEffect } from 'react';
import { 
  LogIn, X, Search, Upload, Eye, Download, Trash2, 
  Database, Image as ImageIcon, Lock, LogOut, User as UserIcon, Users, Plus, Settings
} from 'lucide-react';
import Loading from './Loading';
import Modal from './Modal';
import * as api from '../lib/api';
import type { User, FileItem } from '../lib/api';

export default function DatabasePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('*');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar autenticação ao carregar
    checkAuth();
  }, []);

  // Ajustar pasta inicial quando usuário é carregado
  useEffect(() => {
    if (user) {
      if (user.role === 'user') {
        setCurrentFolder(user.folder || '*');
      } else {
        setCurrentFolder('*');
      }
    }
  }, [user]);

  // Recarregar arquivos quando a pasta atual mudar (após usuário carregado)
  useEffect(() => {
    if (user) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api.checkAuth();
      if (response.user && !response.error) {
        setUser(response.user);
        setIsAuthenticated(true);
        setShowLogin(false);
        await loadFiles();
      } else {
        // Verificar localStorage como fallback
        const savedUser = localStorage.getItem('database_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setShowLogin(false);
          await loadFiles();
        }
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const baseFolder =
        user.role === 'user'
          ? (user.folder || '*')
          : (currentFolder || '*');

      const folder = baseFolder;
      const response = await api.getFiles(folder);
      
      if (response.files) {
        setFiles(response.files);

        // Atualizar lista de pastas disponíveis com base nos arquivos retornados
        const folderSet = new Set<string>();
        response.files.forEach((file) => {
          if (file.folder) {
            folderSet.add(file.folder);
          }
        });

        // Para ROOT/ADMIN, permitir ver todas as pastas; para USER, apenas a dele
        let derivedFolders = Array.from(folderSet).sort();
        if (user.role === 'user') {
          derivedFolders = derivedFolders.filter((f) =>
            f === user.folder || f.startsWith(`${user.folder}/`)
          );
          // Garante que a pasta base do usuário apareça
          if (user.folder && !derivedFolders.includes(user.folder)) {
            derivedFolders.unshift(user.folder);
          }
        } else {
          // Para ROOT/ADMIN, adiciona opção especial "Todas"
          if (!derivedFolders.includes('*')) {
            derivedFolders.unshift('*');
          }
        }

        setFolders(derivedFolders);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await api.login(loginEmail, loginPassword);
      
      if (response.user && !response.error) {
        setUser(response.user);
        setIsAuthenticated(true);
        setShowLogin(false);
        localStorage.setItem('database_user', JSON.stringify(response.user));
        await loadFiles();
      } else {
        setLoginError(response.error || 'Email ou senha incorretos');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setShowLogin(true);
      localStorage.removeItem('database_user');
      setLoading(false);
      // Redirecionar para a página principal
      window.location.href = '/';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
      
      if (!fileInput?.files || fileInput.files.length === 0) {
        setError('Selecione pelo menos um arquivo');
        setLoading(false);
        return;
      }

      // Definir pasta efetiva para upload
      let folder: string;
      if (user.role === 'user') {
        // USER fica restrito à pasta configurada (pode futuramente permitir subpastas)
        folder = user.folder || '*';
      } else {
        // ROOT / ADMIN usam a pasta atualmente selecionada; "*" significa todas (sem pasta específica)
        folder = currentFolder || '*';
      }
      const animalName = formData.get('animal_name') as string || '';
      const animalId = formData.get('animal_id') as string || '';
      const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];

      // Upload de cada arquivo
      for (const file of Array.from(fileInput.files)) {
        const response = await api.uploadFile(file, folder, {
          animal_name: animalName,
          animal_id: animalId,
          tags: tags.length > 0 ? tags : undefined
        });

        if (response.error) {
          setError(response.error);
          break;
        }
      }

      if (!error) {
        setShowUploadModal(false);
        await loadFiles(); // Recarregar lista
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, folder: string) => {
    if (!user || !user.permissions?.delete) return;
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) return;

    setLoading(true);
    try {
      const response = await api.deleteFile(fileId, folder);
      if (response.error) {
        setError(response.error);
      } else {
        await loadFiles(); // Recarregar lista
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar arquivo');
    } finally {
      setLoading(false);
    }
  };

  // Verificar permissões
  const canUpload = user?.permissions?.upload ?? false;
  const canDelete = user?.permissions?.delete ?? false;
  const canManageUsers = user?.role === 'root';

  if (showLogin && !isAuthenticated) {
    return (
      <>
        {loading && <Loading message="Autenticando..." />}
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Database size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">Banco de Dados de Fotos</h2>
              <p className="text-gray-600">Acesso para designers e fotógrafos</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {loginError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Entrando...'
                ) : (
                  <>
                    <LogIn size={20} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold mb-2">Sistema de Banco de Dados</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Entre com seu email e senha cadastrados</p>
                <p className="mt-2 text-gray-400">Senha padrão de teste: <strong>password</strong></p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Database size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Banco de Dados de Fotos</h1>
                <p className="text-sm text-gray-600">Gerencie e organize fotos dos cavalos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon size={16} />
                <div>
                  <span className="font-medium">{user?.name}</span>
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded text-xs">
                    {user?.role === 'root' ? 'ROOT' : user?.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </div>
              </div>
              {canManageUsers && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Users size={16} />
                  Gerenciar Usuários
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black">Galeria de Arquivos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {files.length} arquivo{files.length !== 1 ? 's' : ''} cadastrado{files.length !== 1 ? 's' : ''}
                {user && (
                  <span className="ml-2 text-gray-500">
                    • Pasta atual:{' '}
                    {user.role === 'user'
                      ? (currentFolder || user.folder || 'Pasta padrão')
                      : (currentFolder === '*' ? 'Todas' : currentFolder || 'Todas')}
                  </span>
                )}
              </p>
            </div>
            {canUpload && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
              >
                <Upload size={16} />
                Upload Arquivos
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por animal, raça ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files
                .filter(file => 
                  file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                )
                .map(file => (
                <div key={file.id} className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-black transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {file.url ? (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        {file.url && (
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                          >
                            <Eye size={16} className="text-black" />
                          </a>
                        )}
                        {file.url && (
                          <a 
                            href={file.url} 
                            download
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                          >
                            <Download size={16} className="text-black" />
                          </a>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => handleDeleteFile(file.id, file.folder)}
                            className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-black mb-1 truncate">{file.name}</h3>
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {file.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{file.size}</span>
                      <span>{new Date(file.uploaded_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Por: {file.uploaded_by}</p>
                  </div>
                </div>
              ))}
            </div>

            {files.length === 0 && !loading && (
              <div className="text-center py-12">
                <Database size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Nenhum arquivo cadastrado</p>
                <p className="text-sm text-gray-500 mt-1">
                  {canUpload 
                    ? 'Comece fazendo upload de arquivos' 
                    : 'Aguardando integração com Google Drive'}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-black">{files.length}</p>
                <p className="text-sm text-gray-600">Total de Arquivos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {user?.role === 'root' ? 'ROOT' : user?.role === 'admin' ? 'ADMIN' : 'USER'}
                </p>
                <p className="text-sm text-gray-600">Nível de Acesso</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {user?.folder === '*' ? 'Todas' : user?.folder || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Pasta de Acesso</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Gerenciamento de Usuários (ROOT) */}
      {showUserManagement && canManageUsers && (
        <UserManagementModal 
          onClose={() => setShowUserManagement(false)} 
          user={user!}
        />
      )}

      {/* Modal de Upload */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload de Arquivos">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Animal</label>
            <input 
              name="animal_name" 
              type="text" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
              placeholder="Ex: Thunder"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ID do Animal (opcional)</label>
            <input 
              name="animal_id" 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
              placeholder="Ex: 001"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fotos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors">
              <input 
                type="file" 
                name="photos" 
                multiple 
                accept="image/*" 
                required 
                className="hidden" 
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">Clique para selecionar fotos</p>
                <p className="text-xs text-gray-500">ou arraste e solte aqui</p>
                <p className="text-xs text-gray-400 mt-2">Formatos: JPG, PNG, WEBP (máx. 10MB por foto)</p>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (separadas por vírgula)</label>
            <input 
              name="tags" 
              type="text" 
              placeholder="Ex: Mangalarga, Macho, Perfil" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
            />
            <p className="text-xs text-gray-500 mt-1">Adicione tags para facilitar a busca</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              <Upload size={16} className="inline mr-2" />
              Fazer Upload
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Componente de Gerenciamento de Usuários (apenas ROOT)
function UserManagementModal({ onClose, user }: { onClose: () => void; user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'root' | 'admin' | 'user',
    folder: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      if (response.users) {
        setUsers(response.users);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.createUser(formData);
      if (response.user) {
        setShowCreateForm(false);
        setFormData({ email: '', password: '', name: '', role: 'user', folder: '' });
        await loadUsers();
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    setLoading(true);
    try {
      const response = await api.deleteUser(userId);
      if (response.error) {
        setError(response.error);
      } else {
        await loadUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Gerenciar Usuários">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Lista de Usuários</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Novo Usuário
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nível</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'root' | 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              >
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
                <option value="root">ROOT</option>
              </select>
            </div>
            {formData.role === 'user' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pasta</label>
                <input
                  type="text"
                  value={formData.folder}
                  onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                  placeholder="Ex: fotografos ou midias/nome-da-midia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Pasta que o usuário terá acesso</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ email: '', password: '', name: '', role: 'user', folder: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </form>
        )}

        <div className="max-h-96 overflow-y-auto">
          {loading && users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{u.name}</span>
                      <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    {u.folder && u.folder !== '*' && (
                      <p className="text-xs text-gray-500">Pasta: {u.folder}</p>
                    )}
                  </div>
                  {u.role !== 'root' && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                    >
                      Deletar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

