import { useState, useEffect, useCallback } from 'react';
import { 
  LogIn, X, Search, Upload, Eye, Download, Trash2, 
  Database, Image as ImageIcon, Lock, LogOut, User as UserIcon, Users, Plus, Settings, Folder, FolderPlus, ChevronRight, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, CheckCircle
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
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [error, setError] = useState('');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [oauthStatus, setOAuthStatus] = useState<{ hasToken: boolean; canAuthorize: boolean; tokenInfo?: any } | null>(null);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewImageError, setPreviewImageError] = useState(false);
  const [previewImageLoading, setPreviewImageLoading] = useState(true);
  
  // Função para obter lista de imagens filtradas
  const getImageFiles = useCallback(() => {
    return files.filter(file => 
      (file as any).mimeType?.startsWith('image/') &&
      (file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))))
    );
  }, [files, searchTerm]);
  
  // Função para navegar entre imagens
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const imageFiles = getImageFiles();
    if (imageFiles.length === 0 || !previewFile) return;
    
    const currentIndex = imageFiles.findIndex(f => f.id === previewFile.id);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % imageFiles.length;
    } else {
      newIndex = currentIndex === 0 ? imageFiles.length - 1 : currentIndex - 1;
    }
    
    const newFile = imageFiles[newIndex];
    if (newFile) {
      setPreviewImageError(false);
      setPreviewImageLoading(true);
      setPreviewFile(newFile);
    }
  }, [previewFile, getImageFiles]);
  
  // Adicionar listeners de teclado para navegação
  useEffect(() => {
    if (!previewFile) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateImage('next');
      } else if (e.key === 'Escape') {
        setPreviewFile(null);
        setPreviewImageError(false);
        setPreviewImageLoading(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [previewFile, navigateImage]);
  
  // Timeout para preview que não carrega
  useEffect(() => {
    if (!previewFile || !previewImageLoading) return;
    
    const timeout = setTimeout(() => {
      console.warn('Timeout ao carregar preview - verificando...');
      // Verificar se a imagem realmente falhou ou está apenas demorando
      const img = document.querySelector('.preview-image') as HTMLImageElement;
      if (img && !img.complete) {
        console.warn('Imagem ainda carregando após 10 segundos');
        // Tentar recarregar
        const currentSrc = img.src;
        img.src = '';
        setTimeout(() => {
          img.src = currentSrc.split('&t=')[0] + '&t=' + Date.now();
        }, 100);
      }
    }, 10000); // 10 segundos
    
    return () => clearTimeout(timeout);
  }, [previewFile, previewImageLoading]);

  useEffect(() => {
    // Verificar autenticação ao carregar
    checkAuth();
    // Animação de entrada do login
    if (showLogin) {
      setTimeout(() => setLoginVisible(true), 100);
    }
  }, []);

  // Função para verificar status OAuth
  const checkOAuthStatus = useCallback(async () => {
    if (!user || (user.role !== 'root' && user.role !== 'admin')) {
      return;
    }

    try {
      const response = await api.checkOAuthStatus();
      if (response.data) {
        setOAuthStatus(response.data);
      } else if (response.error) {
        // Se houver erro, definir status padrão
        setOAuthStatus({ hasToken: false, canAuthorize: true });
      }
    } catch (err) {
      console.error('Erro ao verificar status OAuth:', err);
      // Definir status padrão em caso de erro
      setOAuthStatus({ hasToken: false, canAuthorize: true });
    }
  }, [user]);

  // Verificar status OAuth quando usuário estiver autenticado
  useEffect(() => {
    if (user && (user.role === 'root' || user.role === 'admin')) {
      checkOAuthStatus();
    }
  }, [user, checkOAuthStatus]);

  // Ajustar pasta inicial e carregar dados quando usuário é carregado
  useEffect(() => {
    if (user) {
      console.log('useEffect [user]: usuário carregado', user.role, user.email);
      if (user.role === 'user') {
        setCurrentFolder(user.folder || '*');
      } else {
        setCurrentFolder('*');
      }
      // Carregar arquivos e pastas quando usuário estiver disponível
      loadFiles();
    }
  }, [user]);

  // Recarregar arquivos quando a pasta atual mudar (após usuário carregado)
  useEffect(() => {
    if (user) {
      console.log('useEffect [currentFolder]: pasta mudou para', currentFolder);
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder]);

  // Inatividade: deslogar após 5 minutos sem interação
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutos

    const resetActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('touchstart', resetActivity);

    const interval = window.setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_LIMIT_MS) {
        console.log('Inatividade detectada. Fazendo logout automático...');
        clearInterval(interval);
        window.removeEventListener('mousemove', resetActivity);
        window.removeEventListener('keydown', resetActivity);
        window.removeEventListener('click', resetActivity);
        window.removeEventListener('touchstart', resetActivity);
        handleLogout();
      }
    }, 30 * 1000); // verifica a cada 30 segundos

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
    };
  }, [isAuthenticated, user, lastActivity]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api.checkAuth();
      if (response.user && !response.error) {
        console.log('checkAuth: usuário autenticado', response.user.role);
        setUser(response.user);
        setIsAuthenticated(true);
        setShowLogin(false);
        // Não chamar loadFiles aqui - será chamado pelo useEffect quando user mudar
      } else {
        // Verificar localStorage como fallback
        const savedUser = localStorage.getItem('database_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('checkAuth: usuário do localStorage', parsedUser.role);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setShowLogin(false);
          // Não chamar loadFiles aqui - será chamado pelo useEffect quando user mudar
        }
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    if (!user) {
      console.log('loadFiles: usuário não encontrado');
      return;
    }
    
    console.log('loadFiles: iniciando para usuário', user.role, user.email);
    setLoading(true);
    try {
      const baseFolder =
        user.role === 'user'
          ? (user.folder || '*')
          : (currentFolder || '*');

      const folder = baseFolder;
      console.log('loadFiles: pasta base:', folder);
      
      // Para ROOT/ADMIN, carregar pastas disponíveis do Google Drive
      if (user.role === 'root' || user.role === 'admin') {
        console.log('loadFiles: é ROOT/ADMIN, carregando pastas...');
        
        // Inicializar com "Todas" enquanto carrega
        if (folders.length === 0) {
          console.log('loadFiles: inicializando folders com ["*"]');
          setFolders(['*']);
        }
        
        // Carregar pastas de forma assíncrona (não bloquear o carregamento de arquivos)
        console.log('loadFiles: chamando api.getFolders()...');
        api.getFolders().then((foldersResponse) => {
          console.log('✅ Resposta completa de pastas:', JSON.stringify(foldersResponse, null, 2));
          
          if (foldersResponse.folders && Array.isArray(foldersResponse.folders) && foldersResponse.folders.length > 0) {
            const folderNames = foldersResponse.folders.map(f => {
              const path = f.path || f.name || f.id;
              console.log('Processando pasta:', f, '→ path:', path);
              return path;
            });
            console.log('✅ Pastas processadas, atualizando estado:', folderNames);
            setFolders(folderNames);
          } else {
            console.warn('⚠️ Nenhuma pasta encontrada na resposta:', foldersResponse);
            setFolders(['*']);
          }
        }).catch((err) => {
          console.error('❌ Erro ao carregar pastas:', err);
          setFolders(['*']);
        });
      } else {
        console.log('loadFiles: não é ROOT/ADMIN, pulando carregamento de pastas');
      }
      
      const response = await api.getFiles(folder);
      
      if (response.files) {
        setFiles(response.files);

        // Se for USER, atualizar lista de pastas com base nos arquivos
        if (user.role === 'user') {
          const folderSet = new Set<string>();
          response.files.forEach((file) => {
            if (file.folder) {
              folderSet.add(file.folder);
            }
          });
          
          let derivedFolders = Array.from(folderSet).sort();
          derivedFolders = derivedFolders.filter((f) =>
            f === user.folder || f.startsWith(`${user.folder}/`)
          );
          // Garante que a pasta base do usuário apareça
          if (user.folder && !derivedFolders.includes(user.folder)) {
            derivedFolders.unshift(user.folder);
          }
          
          setFolders(derivedFolders);
        }
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
    setLoginSuccess(false);

    try {
      // Delay mínimo para feedback visual (800ms)
      const [response] = await Promise.all([
        api.login(loginEmail, loginPassword),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      
      if (response.user && !response.error) {
        // Mostrar animação de sucesso
        setLoginSuccess(true);
        setLoading(false);
        
        // Aguardar um pouco antes de continuar (animação de sucesso)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('database_user', JSON.stringify(response.user));
        
        // Fade out do login
        setLoginVisible(false);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setShowLogin(false);
        await loadFiles();
      } else {
        setLoginError(response.error || 'Email ou senha incorretos');
        setLoading(false);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Tem certeza que deseja sair?')) {
      return;
    }

    setIsLoggingOut(true);
    setLoading(true);
    
    try {
      // Delay para feedback visual
      await Promise.all([
        api.logout(),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Fade out antes de limpar
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('database_user');
      setLoading(false);
      setIsLoggingOut(false);
      
      // Redirecionar para a página principal
      window.location.href = '/';
    }
  };

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    if (uploadFiles.length === 0) {
      setError('Selecione pelo menos um arquivo');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress({});

    try {
      // Definir pasta efetiva para upload - usar a pasta atual
      let folder: string = currentFolder || '*';
      
      // Para usuários, garantir que a pasta está dentro da pasta base do usuário
      if (user.role === 'user' && user.folder) {
        const baseFolder = user.folder;
        // Se currentFolder for '*', usar a pasta base do usuário
        if (folder === '*') {
          folder = baseFolder;
        } else if (!folder.startsWith(baseFolder + '/') && folder !== baseFolder) {
          // Se a pasta atual não começar com a pasta base, usar a pasta base
          folder = baseFolder;
        }
        // Se folder já começa com baseFolder, usar diretamente (permite subpastas)
      }
      
      console.log('Upload - Pasta selecionada:', folder, 'CurrentFolder:', currentFolder, 'User folder:', user.folder);

      // Upload de cada arquivo com progresso
      const uploadPromises = uploadFiles.map(async (file) => {
        const fileName = file.name;
        setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
        
        try {
          const response = await api.uploadFile(file, folder);
          
          if (response.error) {
            setUploadProgress(prev => ({ ...prev, [fileName]: -1 })); // -1 = erro
            throw new Error(response.error);
          }
          
          setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
          return response;
        } catch (err: any) {
          setUploadProgress(prev => ({ ...prev, [fileName]: -1 }));
          throw err;
        }
      });

      await Promise.all(uploadPromises);

      // Limpar e recarregar
      setUploadFiles([]);
      setUploadProgress({});
      setShowUploadModal(false);
      await loadFiles(); // Recarregar lista
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadFiles(Array.from(files));
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError('Nome da pasta é obrigatório');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.createFolder(newFolderName.trim(), currentFolder);
      if (response.error) {
        setError(response.error);
      } else {
        setShowCreateFolderModal(false);
        setNewFolderName('');
        await loadFiles(); // Recarregar lista
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pasta');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o caminho completo da pasta atual (breadcrumb)
  const getCurrentFolderPath = () => {
    if (!user) return '';
    
    if (user.role === 'user') {
      return currentFolder || user.folder || 'Pasta padrão';
    }
    
    if (currentFolder === '*') {
      return 'Todas';
    }
    
    return currentFolder;
  };

  // Função para obter partes do caminho (para breadcrumb)
  const getFolderParts = () => {
    if (!user) return [];
    
    if (currentFolder === '*') {
      return [{ name: 'Todas', path: '*' }];
    }
    
    const parts = currentFolder.split('/').filter(p => p);
    const breadcrumb = [{ name: 'Todas', path: '*' }];
    
    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath = index === 0 ? part : `${currentPath}/${part}`;
      breadcrumb.push({ name: part, path: currentPath });
    });
    
    return breadcrumb;
  };

  // Função para voltar uma pasta
  const goBackFolder = () => {
    if (currentFolder === '*') return;
    
    const parts = currentFolder.split('/').filter(p => p);
    if (parts.length > 1) {
      // Voltar para a pasta pai
      const newPath = parts.slice(0, -1).join('/');
      setCurrentFolder(newPath);
    } else {
      // Voltar para raiz
      setCurrentFolder('*');
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
          <div 
            className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative transition-all duration-300 ${
              loginVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
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
                disabled={loading || loginSuccess}
                className={`w-full text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                  loginSuccess 
                    ? 'bg-green-600' 
                    : 'bg-black hover:bg-gray-800 disabled:opacity-50'
                }`}
              >
                {loginSuccess ? (
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
                onClick={() => window.location.href = '/'}
                disabled={loading || loginSuccess}
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

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-black mb-2">Saindo do sistema...</h3>
            <p className="text-gray-600">Aguarde um momento</p>
          </div>
        </div>
      )}
      <div className={`min-h-screen bg-gray-50 transition-opacity duration-300 ${isLoggingOut ? 'opacity-50' : 'opacity-100'}`}>
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
              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedFiles.size} arquivo(s) selecionado(s)
                  </span>
                  <button
                    onClick={async () => {
                      // Fazer download de todos os arquivos selecionados
                      const filesToDownload = files.filter(f => selectedFiles.has(f.id));
                      for (const file of filesToDownload) {
                        try {
                          const response = await fetch(`/api/download-file.php?id=${file.id}`, {
                            credentials: 'include'
                          });
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            // Pequeno delay entre downloads para evitar bloqueio do navegador
                            await new Promise(resolve => setTimeout(resolve, 300));
                          }
                        } catch (error) {
                          console.error(`Erro ao fazer download de ${file.name}:`, error);
                        }
                      }
                      setSelectedFiles(new Set());
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    Baixar Selecionados ({selectedFiles.size})
                  </button>
                  <button
                    onClick={() => setSelectedFiles(new Set())}
                    className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    Limpar Seleção
                  </button>
                </div>
              )}
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
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Saindo...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Sair
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-black">Galeria de Arquivos</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Total: {files.length} arquivo{files.length !== 1 ? 's' : ''} cadastrado{files.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {canUpload && (
                  <>
                    <button 
                      onClick={() => setShowCreateFolderModal(true)}
                      className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium touch-manipulation min-h-[44px]"
                      title="Criar subpasta"
                    >
                      <FolderPlus size={18} />
                      <span className="hidden sm:inline">Nova Pasta</span>
                      <span className="sm:hidden">Pasta</span>
                    </button>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium touch-manipulation min-h-[44px]"
                    >
                      <Upload size={18} />
                      <span className="hidden sm:inline">Upload Arquivos</span>
                      <span className="sm:hidden">Upload</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Breadcrumb da Pasta Atual */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-wrap">
              {(currentFolder !== '*' && (user?.role === 'root' || user?.role === 'admin')) && (
                <button
                  onClick={goBackFolder}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  title="Voltar para pasta anterior"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              )}
              <Folder size={18} className="text-gray-600 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Pasta atual:</span>
                {(user?.role === 'root' || user?.role === 'admin') && currentFolder !== '*' ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {getFolderParts().map((part, index, array) => (
                      <span key={part.path} className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentFolder(part.path)}
                          className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
                            index === array.length - 1
                              ? 'text-black bg-white border border-gray-300 cursor-default'
                              : 'text-gray-600 hover:text-black hover:bg-gray-100'
                          }`}
                        >
                          {part.name}
                        </button>
                        {index < array.length - 1 && (
                          <ChevronRight size={14} className="text-gray-400" />
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-black bg-white px-3 py-1 rounded border border-gray-300">
                    {getCurrentFolderPath()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6">
            {/* Seletor de Pastas para ROOT/ADMIN */}
            {(() => {
              const isRootOrAdmin = user?.role === 'root' || user?.role === 'admin';
              
              if (!isRootOrAdmin) {
                return null;
              }
              
              return (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selecionar Pasta:
                  </label>
                  <select
                    value={currentFolder}
                    onChange={(e) => {
                      console.log('Pasta alterada para:', e.target.value);
                      setCurrentFolder(e.target.value);
                    }}
                    className="w-full md:w-auto px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-base md:text-sm touch-manipulation"
                  >
                    {folders.length > 0 ? (
                      folders.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder === '*' ? 'Todas' : folder}
                        </option>
                      ))
                    ) : (
                      <option value="*">Todas</option>
                    )}
                  </select>
                  {folders.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Carregando pastas...
                    </p>
                  )}
                  {folders.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {folders.length} pasta(s) disponível(is)
                    </p>
                  )}
                </div>
              );
            })()}
            
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {files
                .filter(file => 
                  file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                )
                .map(file => {
                  // Verificar se é pasta (pode vir do tipo ou do mimeType)
                  const isFolder = (file as any).type === 'folder' || (file as any).mimeType === 'application/vnd.google-apps.folder';
                  
                  if (isFolder) {
                    // Card de Pasta - Design menor e preto (estilo Grupo Raça)
                    return (
                      <div 
                        key={file.id} 
                        onClick={() => {
                          // Navegar para dentro da pasta
                          if (user?.role === 'root' || user?.role === 'admin') {
                            // Evitar duplicação: se já está na pasta, não adicionar novamente
                            const folderPath = currentFolder === '*' ? file.name : `${currentFolder}/${file.name}`;
                            // Verificar se não está duplicando
                            if (!folderPath.endsWith(`/${file.name}/${file.name}`)) {
                              setCurrentFolder(folderPath);
                            }
                          } else if (user?.role === 'user') {
                            // Para usuários, usar currentFolder atual (que já inclui a pasta base do usuário)
                            // Se currentFolder for igual à pasta base do usuário ou '*', começar da pasta base
                            const baseFolder = user.folder || '*';
                            const currentPath = currentFolder === '*' ? baseFolder : currentFolder;
                            
                            // Verificar se já estamos na pasta base ou em uma subpasta
                            if (currentPath === baseFolder || currentPath.startsWith(baseFolder + '/')) {
                              // Estamos dentro da pasta do usuário, adicionar a nova pasta ao caminho atual
                              const newPath = currentPath === baseFolder ? `${baseFolder}/${file.name}` : `${currentPath}/${file.name}`;
                              // Verificar se não está duplicando
                              if (!newPath.endsWith(`/${file.name}/${file.name}`)) {
                                setCurrentFolder(newPath);
                              }
                            } else {
                              // Se não, começar da pasta base
                              const newPath = baseFolder === '*' ? file.name : `${baseFolder}/${file.name}`;
                              setCurrentFolder(newPath);
                            }
                          }
                        }}
                        className="group bg-black border-2 border-black rounded-lg overflow-hidden hover:bg-gray-900 hover:border-gray-700 transition-all duration-300 hover:shadow-2xl cursor-pointer transform hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-6">
                          <Folder size={40} className="text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                        </div>
                        <div className="p-2.5 bg-black">
                          <h3 className="font-semibold text-white text-xs truncate text-center">{file.name}</h3>
                        </div>
                      </div>
                    );
                  }
                  
                  // Card de Arquivo - Design original
                  const isSelected = selectedFiles.has(file.id);
                  return (
                    <div 
                      key={file.id} 
                      className={`group bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                        isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-black'
                      }`}
                      onClick={(e) => {
                        // Se clicar no checkbox, não abrir modal
                        if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                          return;
                        }
                        
                        // Se for imagem, abrir modal de visualização
                        const isImage = (file as any).mimeType?.startsWith('image/');
                        if (isImage && file.url) {
                          setPreviewImageError(false);
                          setPreviewImageLoading(true);
                          setPreviewFile(file);
                        }
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {/* Checkbox para seleção múltipla */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSelected = new Set(selectedFiles);
                              if (e.target.checked) {
                                newSelected.add(file.id);
                              } else {
                                newSelected.delete(file.id);
                              }
                              setSelectedFiles(newSelected);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        {file.url && (file as any).mimeType?.startsWith('image/') ? (
                          <img 
                            src={file.url} 
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              // Se falhar, tentar usar viewLink ou downloadLink
                              const target = e.target as HTMLImageElement;
                              const fallbackUrl = (file as any).downloadLink || (file as any).viewLink;
                              if (fallbackUrl && target.src !== fallbackUrl) {
                                console.error('Erro ao carregar miniatura, tentando fallback:', fallbackUrl);
                                target.src = fallbackUrl;
                              } else {
                                console.error('Erro ao carregar miniatura e nenhum fallback disponível', {
                                  id: file.id,
                                  url: file.url,
                                  downloadLink: (file as any).downloadLink,
                                  viewLink: (file as any).viewLink
                                });
                                // Mostrar placeholder de erro
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.error-placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'error-placeholder w-full h-full flex items-center justify-center bg-gray-200 text-gray-400';
                                  placeholder.innerHTML = '<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                  parent.appendChild(placeholder);
                                }
                              }
                            }}
                            onLoad={() => {
                              console.log('Miniatura carregada com sucesso');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={48} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 md:group-hover:opacity-100 transition-opacity md:opacity-0">
                          <div className="flex gap-2">
                            {file.url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isImage = (file as any).mimeType?.startsWith('image/');
                                  if (isImage) {
                                    setPreviewImageError(false);
                                    setPreviewImageLoading(true);
                                    setPreviewFile(file);
                                  } else {
                                    // Se não for imagem, abrir em nova aba
                                    window.open(file.url, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                                className="p-2.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                <Eye size={18} className="text-black md:w-4 md:h-4" />
                              </button>
                            )}
                            {file.url && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  // Fazer download via fetch para não abrir nova aba
                                  try {
                                    const response = await fetch(`/api/download-file.php?id=${file.id}`, {
                                      credentials: 'include'
                                    });
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = file.name;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      window.URL.revokeObjectURL(url);
                                    } else {
                                      console.error('Erro ao fazer download');
                                    }
                                  } catch (error) {
                                    console.error('Erro ao fazer download:', error);
                                  }
                                }}
                                className="p-2.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                <Download size={18} className="text-black md:w-4 md:h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => handleDeleteFile(file.id, file.folder)}
                                className="p-2.5 md:p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                <Trash2 size={18} className="text-white md:w-4 md:h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Botões sempre visíveis no mobile */}
                        <div className="md:hidden absolute top-2 right-2">
                          <div className="flex gap-2">
                            {file.url && (
                              <button
                                onClick={() => {
                                  setPreviewImageError(false);
                                  setPreviewImageLoading(true);
                                  setPreviewFile(file);
                                }}
                                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                <Eye size={18} className="text-black" />
                              </button>
                            )}
                            {file.url && (
                              <a 
                                href={file.url} 
                                download
                                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                <Download size={18} className="text-black" />
                              </a>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => handleDeleteFile(file.id, file.folder)}
                                className="p-2.5 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                <Trash2 size={18} className="text-white" />
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
                  );
                })}
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

      {/* Modal de Criar Pasta */}
      {showCreateFolderModal && (
        <Modal isOpen={showCreateFolderModal} onClose={() => {
          setShowCreateFolderModal(false);
          setNewFolderName('');
          setError('');
        }} title="Criar Nova Subpasta">
          <form onSubmit={handleCreateFolder} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Pasta
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ex: Eventos 2024"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                A pasta será criada dentro de: <strong>{getCurrentFolderPath()}</strong>
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !newFolderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FolderPlus size={16} />
                {loading ? 'Criando...' : 'Criar Pasta'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Upload */}
      <Modal isOpen={showUploadModal} onClose={() => {
        setShowUploadModal(false);
        setUploadFiles([]);
        setUploadProgress({});
        setError('');
      }} title="Upload de Arquivos">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecionar Arquivos</label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              <input 
                type="file" 
                name="files" 
                multiple 
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" 
                className="hidden" 
                id="file-upload"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <ImageIcon size={48} className={`mx-auto mb-3 ${isDragging ? 'text-black' : 'text-gray-400'}`} />
                <p className="text-base font-medium text-gray-700 mb-1">
                  {isDragging ? 'Solte os arquivos aqui' : 'Clique para selecionar arquivos'}
                </p>
                <p className="text-sm text-gray-500 mb-3">ou arraste e solte aqui</p>
                <p className="text-xs text-gray-400">Formatos: Imagens, Vídeos, PDF, Documentos (máx. 100MB por arquivo)</p>
              </label>
            </div>
            
            {/* Lista de arquivos selecionados */}
            {uploadFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {uploadFiles.length} arquivo(s) selecionado(s):
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uploadFiles.map((file, index) => {
                    const progress = uploadProgress[file.name];
                    const isError = progress === -1;
                    const isComplete = progress === 100;
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          {loading && progress !== undefined && (
                            <>
                              {isError ? (
                                <span className="text-red-500 text-xs">Erro</span>
                              ) : isComplete ? (
                                <CheckCircle className="text-green-500" size={20} />
                              ) : (
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-black transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {!loading && (
                            <button
                              type="button"
                              onClick={() => {
                                setUploadFiles(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => {
                setShowUploadModal(false);
                setUploadFiles([]);
                setUploadProgress({});
                setError('');
              }} 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || uploadFiles.length === 0}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              {loading ? 'Enviando...' : `Fazer Upload (${uploadFiles.length})`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização de Imagem - Flutuante */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setPreviewFile(null);
            setPreviewImageError(false);
            setPreviewImageLoading(true);
          }}
        >
          <div 
            className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => {
                setPreviewFile(null);
                setPreviewImageError(false);
                setPreviewImageLoading(true);
              }}
              className="absolute top-4 right-4 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>
            
            {/* Setas de Navegação */}
            {getImageFiles().length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Imagem anterior"
                >
                  <ArrowLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Próxima imagem"
                >
                  <ArrowRight size={24} />
                </button>
              </>
            )}
            
            {/* Imagem */}
            <div className="relative w-full h-full flex items-center justify-center">
              {previewFile.mimeType?.startsWith('image/') ? (
                <>
                  {previewImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {previewImageError ? (
                    <div className="text-white text-center p-8">
                      <p className="text-lg mb-2">Erro ao carregar imagem</p>
                      <p className="text-sm opacity-75 mb-4">{previewFile.name}</p>
                      <button
                        onClick={() => {
                          setPreviewImageError(false);
                          setPreviewImageLoading(true);
                          // Forçar recarregamento da imagem
                          const img = document.querySelector('.preview-image') as HTMLImageElement;
                          if (img) {
                            img.src = `/api/view-file.php?id=${previewFile.id}&t=${Date.now()}`;
                          }
                        }}
                        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors text-sm"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  ) : (
                    <img 
                      key={`${previewFile.id}-${Date.now()}`}
                      src={`/api/view-file.php?id=${previewFile.id}&t=${Date.now()}`}
                      alt={previewFile.name}
                      className="preview-image max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onError={async (e) => {
                        console.error('Erro ao carregar imagem no modal', {
                          fileId: previewFile.id,
                          url: (e.target as HTMLImageElement).src
                        });
                        const target = e.target as HTMLImageElement;
                        
                        // Tentar verificar se o problema é de autenticação ou formato
                        try {
                          const response = await fetch(`/api/view-file.php?id=${previewFile.id}&t=${Date.now()}`, {
                            credentials: 'include'
                          });
                          const contentType = response.headers.get('content-type');
                          
                          if (!response.ok) {
                            // Se não for OK, tentar ler como JSON para ver o erro
                            const errorText = await response.text();
                            let errorData = null;
                            try {
                              errorData = JSON.parse(errorText);
                            } catch {
                              // Não é JSON, usar o texto direto
                            }
                            console.error('Erro do servidor:', response.status, errorData || errorText);
                            setPreviewImageLoading(false);
                            setPreviewImageError(true);
                          } else if (contentType && contentType.startsWith('image/')) {
                            // Se a resposta é uma imagem, usar blob URL
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            target.src = blobUrl;
                            setPreviewImageError(false);
                            setPreviewImageLoading(false);
                          } else {
                            // Content-Type não é imagem
                            console.error('Resposta não é uma imagem:', contentType);
                            setPreviewImageLoading(false);
                            setPreviewImageError(true);
                          }
                        } catch (fetchError) {
                          console.error('Erro ao verificar URL:', fetchError);
                          setPreviewImageLoading(false);
                          setPreviewImageError(true);
                        }
                      }}
                      onLoad={() => {
                        console.log('Imagem carregada com sucesso no modal');
                        setPreviewImageLoading(false);
                        setPreviewImageError(false);
                      }}
                      onLoadStart={() => {
                        console.log('Iniciando carregamento da imagem');
                        setPreviewImageLoading(true);
                      }}
                      style={{ display: previewImageLoading ? 'none' : 'block' }}
                    />
                  )}
                </>
              ) : (
                <div className="text-white text-center p-8">
                  <p className="text-lg mb-2">Arquivo não é uma imagem</p>
                  <p className="text-sm opacity-75">{previewFile.name}</p>
                </div>
              )}
            </div>
            
            {/* Informações na parte inferior */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-lg">
              <p className="text-sm font-medium text-center">{previewFile.name}</p>
              {getImageFiles().length > 1 && (
                <p className="text-xs text-center mt-1 opacity-75">
                  {getImageFiles().findIndex(f => f.id === previewFile.id) + 1} de {getImageFiles().length}
                </p>
              )}
              <div className="flex gap-3 mt-2 justify-center">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Fazer download via fetch para não abrir nova aba
                    try {
                      const response = await fetch(`/api/download-file.php?id=${previewFile.id}`, {
                        credentials: 'include'
                      });
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = previewFile.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } else {
                        console.error('Erro ao fazer download');
                      }
                    } catch (error) {
                      console.error('Erro ao fazer download:', error);
                    }
                  }}
                  className="px-4 py-1.5 border border-white text-white rounded hover:bg-white/10 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
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

