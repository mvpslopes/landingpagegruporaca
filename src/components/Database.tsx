import { useState, useEffect, useCallback } from 'react';
import { 
  LogIn, X, Search, Upload, Eye, Download, Trash2, 
  Database, Image as ImageIcon, Lock, LogOut, User as UserIcon, Users, Plus, Settings, Folder, FolderPlus, ChevronRight, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, CheckCircle, FileText, Video, Music, Grid3x3, List, Edit2, Move, Loader2
} from 'lucide-react';
import Loading from './Loading';
import Modal from './Modal';
import ToastContainer, { type Toast } from './Toast';
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
  const [showUsersSummary, setShowUsersSummary] = useState(false);
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
  const [previewImageBlobUrl, setPreviewImageBlobUrl] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ fileId: string; folder: string; fileName: string; type?: 'file' | 'folder' } | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showRenameModal, setShowRenameModal] = useState<{ file: FileItem; type: 'file' | 'folder' } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showMoveModal, setShowMoveModal] = useState<{ file: FileItem } | null>(null);
  const [loadingFolder, setLoadingFolder] = useState<string | null>(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  
  // Função helper para adicionar toast
  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  // Função helper para remover toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // Função para obter lista de imagens filtradas
  const getImageFiles = useCallback(() => {
    return files.filter(file => 
      (file as any).mimeType?.startsWith('image/') &&
      (file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))))
    );
  }, [files, searchTerm]);

  // Função para obter lista de mídias (imagens e vídeos) filtradas
  const getMediaFiles = useCallback(() => {
    return files.filter(file => 
      ((file as any).mimeType?.startsWith('image/') || (file as any).mimeType?.startsWith('video/')) &&
      (file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))))
    );
  }, [files, searchTerm]);
  
  // Função para navegar entre imagens e vídeos
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const mediaFiles = getMediaFiles();
    if (mediaFiles.length === 0 || !previewFile) return;
    
    const currentIndex = mediaFiles.findIndex(f => f.id === previewFile.id);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % mediaFiles.length;
    } else {
      newIndex = currentIndex === 0 ? mediaFiles.length - 1 : currentIndex - 1;
    }
    
    const newFile = mediaFiles[newIndex];
    if (newFile) {
      // Limpar blob URL anterior
      if (previewImageBlobUrl) {
        window.URL.revokeObjectURL(previewImageBlobUrl);
        setPreviewImageBlobUrl(null);
      }
      setPreviewImageError(false);
      setPreviewImageLoading(true);
      setPreviewFile(newFile);
    }
  }, [previewFile, getMediaFiles, previewImageBlobUrl]);
  
  // Adicionar listeners de teclado para navegação e atalhos
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Se estiver em um input ou textarea, não processar atalhos
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Apenas processar Escape para fechar modais
        if (e.key === 'Escape') {
          if (previewFile) {
            if (previewImageBlobUrl) {
              window.URL.revokeObjectURL(previewImageBlobUrl);
              setPreviewImageBlobUrl(null);
            }
            setPreviewFile(null);
            setPreviewImageError(false);
            setPreviewImageLoading(true);
          } else if (showUploadModal) {
            setShowUploadModal(false);
          } else if (showCreateFolderModal) {
            setShowCreateFolderModal(false);
          } else if (showDeleteConfirm) {
            setShowDeleteConfirm(null);
          } else if (showRenameModal) {
            setShowRenameModal(null);
          } else if (showMoveModal) {
            setShowMoveModal(null);
          }
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Atalhos globais
      if (ctrlKey && e.key === 'u' && !showUploadModal && !showCreateFolderModal) {
        e.preventDefault();
        setShowUploadModal(true);
      } else if (ctrlKey && e.key === 'n' && !showUploadModal && !showCreateFolderModal) {
        e.preventDefault();
        setShowCreateFolderModal(true);
      } else if (e.key === 'Delete' && selectedFiles.size > 0 && !showDeleteConfirm) {
        e.preventDefault();
        // Deletar primeiro arquivo selecionado
        const firstSelected = Array.from(selectedFiles)[0];
        const file = files.find(f => f.id === firstSelected);
        if (file && user?.permissions?.delete) {
          handleDeleteFile(file.id, file.folder, file.name);
        }
      } else if (ctrlKey && e.key === 'a' && !showUploadModal && !showCreateFolderModal) {
        e.preventDefault();
        // Selecionar todos os arquivos
        const allFileIds = new Set(files.map(f => f.id));
        setSelectedFiles(allFileIds);
      } else if (e.key === 'Escape') {
        // Fechar modais
        if (previewFile) {
          if (previewImageBlobUrl) {
            window.URL.revokeObjectURL(previewImageBlobUrl);
            setPreviewImageBlobUrl(null);
          }
          setPreviewFile(null);
          setPreviewImageError(false);
          setPreviewImageLoading(true);
        } else if (showUploadModal) {
          setShowUploadModal(false);
        } else if (showCreateFolderModal) {
          setShowCreateFolderModal(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(null);
        } else if (showRenameModal) {
          setShowRenameModal(null);
        } else if (showMoveModal) {
          setShowMoveModal(null);
        } else {
          // Limpar seleção
          setSelectedFiles(new Set());
        }
      }

      // Navegação de imagens no preview
      if (previewFile) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateImage('prev');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateImage('next');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [previewFile, navigateImage, previewImageBlobUrl, showUploadModal, showCreateFolderModal, showDeleteConfirm, showRenameModal, showMoveModal, selectedFiles, files, user]);

  // Carregar imagem ou vídeo usando fetch com credentials quando previewFile mudar
  useEffect(() => {
    if (!previewFile || (!previewFile.mimeType?.startsWith('image/') && !previewFile.mimeType?.startsWith('video/'))) {
      return;
    }

    // Limpar blob URL anterior
    if (previewImageBlobUrl) {
      window.URL.revokeObjectURL(previewImageBlobUrl);
      setPreviewImageBlobUrl(null);
    }

    setPreviewImageLoading(true);
    setPreviewImageError(false);

    const loadFile = async () => {
      try {
        const isImage = previewFile.mimeType?.startsWith('image/');
        const isVideo = previewFile.mimeType?.startsWith('video/');
        
        // Para imagens e vídeos, usar view-file.php (agora suporta ambos)
        const endpoint = `/api/view-file.php?id=${previewFile.id}&t=${Date.now()}`;
        
        const response = await fetch(endpoint, {
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData = null;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // Não é JSON
          }
          console.error(`Erro ao carregar ${isImage ? 'imagem' : 'vídeo'}:`, response.status, errorData || errorText);
          setPreviewImageLoading(false);
          setPreviewImageError(true);
          return;
        }

        if (isImage) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.startsWith('image/')) {
            console.error('Resposta não é uma imagem:', contentType);
            setPreviewImageLoading(false);
            setPreviewImageError(true);
            return;
          }
        }

        // Criar blob URL
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        setPreviewImageBlobUrl(blobUrl);
        setPreviewImageLoading(false);
        setPreviewImageError(false);
      } catch (error) {
        console.error(`Erro ao carregar ${previewFile.mimeType?.startsWith('image/') ? 'imagem' : 'vídeo'}:`, error);
        setPreviewImageLoading(false);
        setPreviewImageError(true);
      }
    };

    loadFile();

    // Cleanup: revogar blob URL quando componente desmontar ou previewFile mudar
    return () => {
      // Não usar previewImageBlobUrl aqui pois pode estar desatualizado
      // O cleanup será feito quando o novo previewFile for carregado
    };
  }, [previewFile?.id]); // Depender apenas do ID para evitar recarregamentos desnecessários

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
    if (!user || (user.role !== 'root' && user.role !== 'admin' && user.role !== 'viewer')) {
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
    if (user && (user.role === 'root' || user.role === 'admin' || user.role === 'viewer')) {
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

  // Inatividade: deslogar após 2 horas sem interação (aumentado para uploads grandes)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas (para permitir uploads grandes sem expirar sessão)

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

  // Fazer logout quando a página for fechada
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleBeforeUnload = () => {
      // Tentar fazer logout usando sendBeacon (mais confiável para beforeunload)
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      try {
        if (navigator.sendBeacon) {
          // sendBeacon funciona melhor com FormData ou Blob simples
          const formData = new FormData();
          formData.append('action', 'logout');
          navigator.sendBeacon(`${apiUrl}/auth.php?action=logout`, formData);
        } else {
          // Fallback: tentar fazer logout via XHR síncrono (pode não funcionar em beforeunload)
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${apiUrl}/auth.php?action=logout`, false);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.send('action=logout');
        }
      } catch (err) {
        console.error('Erro ao fazer logout ao fechar página:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [isAuthenticated, user]);

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
    console.log('loadFiles: currentFolder atual:', currentFolder);
    setLoading(true);
    try {
      // Usar currentFolder para todos os tipos de usuário
      // Para usuários, o currentFolder já foi ajustado no useEffect inicial
      let folder = currentFolder || '*';
      
      // Para usuários, garantir que o folder comece com a pasta base do usuário
      if (user.role === 'user' && user.folder && user.folder !== '*') {
        // Se currentFolder é '*' ou não começa com a pasta base, usar a pasta base
        if (folder === '*' || !folder.startsWith(user.folder)) {
          folder = user.folder;
        }
        // Caso contrário, usar currentFolder (que já inclui a pasta base)
      }
      
      console.log('loadFiles: pasta final a ser carregada:', folder);
      
      // Para ROOT/ADMIN, carregar pastas disponíveis do Google Drive
      if (user.role === 'root' || user.role === 'admin' || user.role === 'viewer') {
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
          
          // Acessar folders através da propriedade correta do ApiResponse
          const foldersList = (foldersResponse as any).folders || [];
          if (Array.isArray(foldersList) && foldersList.length > 0) {
            const folderNames = foldersList.map((f: any) => {
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
      
      console.log('loadFiles: chamando api.getFiles com folder:', folder);
      const response = await api.getFiles(folder);
      console.log('loadFiles: resposta recebida:', {
        hasFiles: !!response.files,
        filesCount: response.files?.length || 0,
        error: response.error
      });
      
      if (response.files) {
        console.log('loadFiles: atualizando lista de arquivos, total:', response.files.length);
        // Limpar qualquer erro pendente ao carregar arquivos com sucesso
        setError('');
        setFiles(response.files);

        // Se for USER, garantir que só veja arquivos de sua pasta
        if (user.role === 'user') {
          const userFolder = user.folder || '';
          if (userFolder && userFolder !== '*') {
            // Filtrar arquivos para mostrar apenas os da pasta do usuário
            const filteredFiles = response.files.filter((file: any) => {
              const fileFolder = file.folder || '';
              // Permitir apenas arquivos da pasta do usuário ou subpastas
              return fileFolder === userFolder || fileFolder.startsWith(`${userFolder}/`);
            });
            setFiles(filteredFiles);
            
            // Atualizar lista de pastas apenas com a pasta do usuário e subpastas
            const folderSet = new Set<string>();
            folderSet.add(userFolder); // Sempre incluir a pasta base
            filteredFiles.forEach((file: any) => {
              if (file.folder && file.folder.startsWith(`${userFolder}/`)) {
                folderSet.add(file.folder);
              }
            });
            
            const derivedFolders = Array.from(folderSet).sort();
            setFolders(derivedFolders);
          }
        }
      } else if (response.error) {
        setError(response.error);
        // Se for erro de acesso à pasta, limpar mensagem depois de alguns segundos
        if (response.error.includes('Sem acesso a esta pasta')) {
          setTimeout(() => {
            setError('');
          }, 5000); // 5 segundos
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos');
    } finally {
      setLoading(false);
      setLoadingFolder(null); // Limpar estado de carregamento da pasta
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
        
        // Mostrar aviso sobre logout após login bem-sucedido
        // Verificar se o usuário já optou por não mostrar novamente
        const dontShowAgain = localStorage.getItem('database_logout_warning_dismissed');
        if (!dontShowAgain) {
          setTimeout(() => {
            setShowLogoutWarning(true);
          }, 500); // Pequeno delay para não sobrepor a animação de login
        }
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

      // Validar tamanho dos arquivos antes de começar
      const maxSize = 1024 * 1024 * 1024; // 1GB
      const oversizedFiles = uploadFiles.filter(f => f.size > maxSize);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        setError(`Arquivo(s) muito grande(s): ${fileNames}. Tamanho máximo: 1GB por arquivo.`);
        setLoading(false);
        return;
      }

      // Upload direto para Google Drive (todos os tamanhos)
      // O arquivo vai direto do navegador para Google Drive, sem passar pelo servidor
      let successCount = 0;
      let errorCountLocal = 0;

      for (const file of uploadFiles) {
        const fileName = file.name;
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`📁 Preparando upload direto: ${fileName} (${fileSizeMB} MB)`);
        setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

        try {
          // Upload direto para Google Drive
          const response = await api.uploadFileDirectToDrive(
            file,
            folder,
            (progress) => {
              // Atualizar progresso em tempo real
              setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
            }
          );

          if (response.error) {
            setUploadProgress(prev => ({ ...prev, [fileName]: -1 })); // -1 = erro
            errorCountLocal += 1;
            console.error(`❌ Erro ao enviar ${fileName}:`, response.error);
            
            // Se erro for de autenticação, mostrar mensagem específica
            if (response.error.includes('não autenticado') || response.error.includes('autorizar')) {
              setError('Por favor, autorize o Google Drive primeiro. O sistema tentará autorizar automaticamente na próxima tentativa.');
            }
          } else {
            setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
            successCount += 1;
            console.log(`✅ Upload direto concluído: ${fileName}`);
          }
        } catch (err: any) {
          setUploadProgress(prev => ({ ...prev, [fileName]: -1 }));
          errorCountLocal += 1;
          console.error(`❌ Exceção ao enviar ${fileName}:`, err?.message || err);
          
          // Se erro for de autenticação, mostrar mensagem específica
          if (err?.message?.includes('não autenticado') || err?.message?.includes('autorizar')) {
            setError('Por favor, autorize o Google Drive primeiro. O sistema tentará autorizar automaticamente na próxima tentativa.');
          }
        }
      }

      // Limpar e recarregar
      setUploadFiles([]);
      setUploadProgress({});
      setShowUploadModal(false);
      if (successCount > 0) {
        addToast(`${successCount} arquivo(s) enviado(s) com sucesso`, 'success');
      }
      if (errorCountLocal > 0) {
        addToast(`${errorCountLocal} arquivo(s) falharam no upload`, 'error', 6000);
      }
      await loadFiles(); // Recarregar lista
    } catch (err: any) {
      const errorCount = Object.values(uploadProgress).filter(p => p === -1).length;
      if (errorCount > 0) {
        // Verificar se é erro 413
        const is413Error = err.message && err.message.includes('ERRO 413');
        if (is413Error) {
          // Mostrar mensagem detalhada para erro 413
          addToast(
            'Servidor rejeitando upload: arquivo muito grande. Verifique as configurações do servidor.',
            'error',
            10000 // 10 segundos para dar tempo de ler
          );
          setError(
            'O servidor está rejeitando o upload porque o arquivo é muito grande. ' +
            'O limite configurado no servidor precisa ser ajustado. ' +
            'Entre em contato com o administrador do servidor ou consulte o arquivo "api/RESOLVER_ERRO_413.md" para instruções.'
          );
        } else {
          addToast(`${errorCount} arquivo(s) falharam no upload`, 'error', 5000);
        }
      } else {
        // Verificar se é erro 413 na mensagem
        const is413Error = err.message && err.message.includes('ERRO 413');
        if (is413Error) {
          addToast(
            'Servidor rejeitando upload: arquivo muito grande. Verifique as configurações do servidor.',
            'error',
            10000
          );
          setError(err.message);
        } else {
          addToast(err.message || 'Erro ao fazer upload', 'error', 5000);
        }
      }
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

  const handleDeleteFile = async (fileId: string, folder: string, fileName?: string) => {
    if (!user || !user.permissions?.delete) return;
    
    // Mostrar modal de confirmação
    const file = files.find(f => f.id === fileId);
    const isFolder = (file as any)?.type === 'folder' || (file as any)?.mimeType === 'application/vnd.google-apps.folder';
    setShowDeleteConfirm({ 
      fileId, 
      folder, 
      fileName: fileName || file?.name || 'este item',
      type: isFolder ? 'folder' : 'file'
    });
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    
    const { fileId, folder, type = 'file' } = showDeleteConfirm;
    setLoading(true);
    setShowDeleteConfirm(null);
    
    try {
      const response = await api.deleteFile(fileId, folder, type);
      if (response.error) {
        addToast(response.error, 'error');
      } else {
        addToast((type === 'folder' ? 'Pasta' : 'Arquivo') + ' deletado com sucesso', 'success');
        await loadFiles(); // Recarregar lista
      }
    } catch (err: any) {
      addToast(err.message || 'Erro ao deletar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const folderName = newFolderName.trim();
    
    if (!folderName) {
      addToast('Nome da pasta é obrigatório', 'warning');
      return;
    }

    // Validar que não há letras minúsculas
    if (/[a-z]/.test(folderName)) {
      addToast('O nome da pasta deve estar em MAIÚSCULAS. Letras minúsculas não são permitidas.', 'warning');
      return;
    }

    // Converter para maiúsculas antes de enviar
    const folderNameUpper = folderName.toUpperCase();

    setLoading(true);
    setError('');
    try {
      const response = await api.createFolder(folderNameUpper, currentFolder);
      if (response.error) {
        addToast(response.error, 'error');
      } else {
        addToast('Pasta criada com sucesso', 'success');
        setShowCreateFolderModal(false);
        setNewFolderName('');
        await loadFiles(); // Recarregar lista
      }
    } catch (err: any) {
      addToast(err.message || 'Erro ao criar pasta', 'error');
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
    
    // Para usuários "user", começar da pasta base
    if (user.role === 'user') {
      const userFolder = user.folder || '';
      if (!userFolder) return [];
      
      if (currentFolder === userFolder) {
        return [{ name: userFolder, path: userFolder }];
      }
      
      // Se está em uma subpasta, criar breadcrumb a partir da pasta base
      if (currentFolder.startsWith(userFolder + '/')) {
        const subPath = currentFolder.substring(userFolder.length + 1);
        const parts = subPath.split('/').filter(p => p);
        const breadcrumb = [{ name: userFolder, path: userFolder }];
        
        let currentPath = userFolder;
        parts.forEach((part) => {
          currentPath = `${currentPath}/${part}`;
          breadcrumb.push({ name: part, path: currentPath });
        });
        
        return breadcrumb;
      }
      
      return [{ name: userFolder, path: userFolder }];
    }
    
    // Para ROOT/ADMIN, usar lógica original
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
    if (!user) return;
    
    // Para usuários "user", não permitir voltar além da pasta base
    if (user.role === 'user') {
      const userFolder = user.folder || '';
      if (!userFolder || currentFolder === userFolder) return;
      
      const parts = currentFolder.split('/').filter(p => p);
      if (parts.length > 1) {
        // Voltar para a pasta pai, mas não além da pasta base
        const newPath = parts.slice(0, -1).join('/');
        if (newPath === userFolder || newPath.startsWith(userFolder + '/')) {
          setCurrentFolder(newPath);
        } else {
          setCurrentFolder(userFolder);
        }
      } else {
        // Voltar para pasta base
        setCurrentFolder(userFolder);
      }
      return;
    }
    
    // Para ROOT/ADMIN, usar lógica original
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
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 md:p-6">
          <div 
            className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 relative transition-all duration-300 ${
              loginVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            <div className="text-center mb-6 md:mb-8">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Database size={28} className="md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Banco de Dados de Fotos</h2>
              <p className="text-sm md:text-base text-gray-600">Acesso para designers e fotógrafos</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base">
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
                  autoComplete="email"
                  className="w-full px-4 py-3 md:py-3 text-base md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none touch-manipulation"
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
                  autoComplete="current-password"
                  className="w-full px-4 py-3 md:py-3 text-base md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none touch-manipulation"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || loginSuccess}
                className={`w-full text-white py-3.5 md:py-3 rounded-lg font-semibold text-base md:text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed touch-manipulation min-h-[48px] ${
                  loginSuccess 
                    ? 'bg-green-600' 
                    : 'bg-black hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50'
                }`}
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Login realizado com sucesso!</span>
                  </>
                ) : loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Entrar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.location.href = '/'}
                disabled={loading || loginSuccess}
                className="w-full bg-gray-100 text-gray-700 py-3.5 md:py-3 rounded-lg font-semibold text-base md:text-sm hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
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
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 transition-opacity duration-300 ${isLoggingOut ? 'opacity-50' : 'opacity-100'}`}>
      {/* Header Moderno com Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-black via-gray-800 to-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-black/10">
                <Database size={20} className="md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent truncate">
                  Banco de Dados de Fotos
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Gerencie e organize os arquivos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                    {selectedFiles.size} selecionado(s)
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
                    className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 active:scale-95 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold touch-manipulation min-h-[44px] shadow-lg hover:shadow-xl"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Baixar ({selectedFiles.size})</span>
                    <span className="sm:hidden">{selectedFiles.size}</span>
                  </button>
                  <button
                    onClick={() => setSelectedFiles(new Set())}
                    className="px-3 md:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 active:scale-95 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold touch-manipulation min-h-[44px] shadow-md hover:shadow-lg border border-gray-300/50"
                  >
                    <span className="hidden sm:inline">Limpar</span>
                    <span className="sm:hidden">X</span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 hidden sm:flex">
                <UserIcon size={14} className="md:w-4 md:h-4" />
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="font-medium truncate max-w-[100px] md:max-w-none">{user?.name}</span>
                  <span className="px-1.5 md:px-2 py-0.5 bg-gray-200 rounded text-xs flex-shrink-0">
                    {user?.role === 'root' ? 'ROOT' : user?.role === 'admin' ? 'ADMIN' : user?.role === 'viewer' ? 'VIEWER' : 'USER'}
                  </span>
                </div>
              </div>
              {canManageUsers && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold touch-manipulation min-h-[44px] shadow-lg hover:shadow-xl"
                >
                  <Users size={14} className="md:w-4 md:h-4" />
                  <span className="hidden md:inline">Gerenciar Usuários</span>
                  <span className="md:hidden">Usuários</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:scale-95 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] border border-gray-200/50 shadow-sm hover:shadow-md"
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
          <div className="p-4 md:p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white">
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
                      className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-300 text-sm font-semibold touch-manipulation min-h-[44px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      title="Criar subpasta"
                    >
                      <FolderPlus size={18} />
                      <span className="hidden sm:inline">Nova Pasta</span>
                      <span className="sm:hidden">Pasta</span>
                    </button>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black rounded-xl transition-all duration-300 text-sm font-semibold touch-manipulation min-h-[44px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
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
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 overflow-x-auto scrollbar-hide shadow-inner">
              <div className="flex items-center gap-2 md:gap-3 min-w-max">
                {(() => {
                  // Mostrar botão "Voltar" se não estiver na pasta raiz/base
                  const isRootOrAdmin = user?.role === 'root' || user?.role === 'admin' || user?.role === 'viewer';
                  const isUserAtBase = user?.role === 'user' && currentFolder === user?.folder;
                  const canGoBack = (isRootOrAdmin && currentFolder !== '*') || (!isUserAtBase && user?.role === 'user');
                  
                  return canGoBack ? (
                    <button
                      onClick={goBackFolder}
                      className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 bg-white border border-gray-300/80 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white active:scale-95 transition-all duration-300 text-xs md:text-sm font-semibold text-gray-700 touch-manipulation min-h-[36px] flex-shrink-0 shadow-sm hover:shadow-md"
                      title="Voltar para pasta anterior"
                    >
                      <ArrowLeft size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </button>
                  ) : null;
                })()}
                <Folder size={16} className="md:w-[18px] md:h-[18px] text-gray-600 flex-shrink-0" />
                <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
                <span className="text-sm font-medium text-gray-700">Pasta atual:</span>
                {(() => {
                  const folderParts = getFolderParts();
                  const hasMultipleParts = folderParts.length > 1;
                  const isRootOrAdmin = user?.role === 'root' || user?.role === 'admin' || user?.role === 'viewer';
                  
                  // Para ROOT/ADMIN, sempre mostrar breadcrumb navegável (mesmo na raiz)
                  // Para USER, mostrar breadcrumb navegável apenas se houver múltiplas partes
                  if (isRootOrAdmin || hasMultipleParts) {
                    return (
                      <div className="flex items-center gap-1 flex-wrap">
                        {folderParts.map((part, index, array) => (
                          <span key={part.path} className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setCurrentFolder(part.path)}
                              className={`text-xs md:text-sm font-semibold px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl transition-all duration-300 uppercase touch-manipulation min-h-[32px] ${
                                index === array.length - 1
                                  ? 'text-black bg-gradient-to-r from-white to-gray-50 border-2 border-gray-300 cursor-default shadow-sm'
                                  : 'text-gray-600 hover:text-black hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 active:scale-95 border border-gray-300/50 shadow-sm hover:shadow-md'
                              }`}
                            >
                              {part.name}
                            </button>
                            {index < array.length - 1 && (
                              <ChevronRight size={12} className="md:w-[14px] md:h-[14px] text-gray-400 flex-shrink-0" />
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  }
                  
                  // Mostrar apenas o caminho atual se não houver navegação (apenas para USER na pasta base)
                  return (
                    <span className="text-xs md:text-sm font-semibold text-black bg-gradient-to-r from-white to-gray-50 px-2.5 md:px-3 py-1 md:py-1.5 rounded-xl border border-gray-300/80 uppercase flex-shrink-0 shadow-sm">
                      {getCurrentFolderPath()}
                    </span>
                  );
                })()}
                </div>
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
                    className="w-full md:w-auto px-4 py-3 md:py-2 border-2 border-gray-300/80 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none bg-gradient-to-r from-white to-gray-50 text-base md:text-sm touch-manipulation min-h-[44px] shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                  >
                    {folders.length > 0 ? (
                      folders.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder === '*' ? 'Todas' : folder.toUpperCase()}
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
                  className="w-full pl-10 pr-4 py-3 md:py-2 text-base md:text-sm border-2 border-gray-300/80 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none touch-manipulation min-h-[44px] bg-gradient-to-r from-white to-gray-50/50 shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-300 font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-300/80 text-red-700 px-4 py-3 rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {/* Filtros e controles de visualização */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Filtro por tipo */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filtrar:</label>
                <select
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                  className="px-3 py-2.5 md:py-1.5 border-2 border-gray-300/80 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none text-base md:text-sm touch-manipulation min-h-[44px] bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                >
                  <option value="all">Todos</option>
                  <option value="image">Imagens</option>
                  <option value="video">Vídeos</option>
                  <option value="document">Documentos</option>
                  <option value="folder">Pastas</option>
                </select>
              </div>
              
              {/* Toggle visualização */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-0.5 md:p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 md:p-1.5 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center ${
                    viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  title="Visualização em grade"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 md:p-1.5 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center ${
                    viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  title="Visualização em lista"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Área de drag & drop para upload */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDragging) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsDragging(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  handleFileSelect(files);
                  setShowUploadModal(true);
                }
              }}
              className={`mb-4 rounded-lg border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 p-8'
                  : 'border-transparent'
              }`}
            >
              {isDragging && (
                <div className="text-center">
                  <Upload size={48} className="mx-auto mb-3 text-blue-500" />
                  <p className="text-lg font-semibold text-blue-700">Solte os arquivos aqui para fazer upload</p>
                </div>
              )}
            </div>

            {/* Renderização Grid ou Lista */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {files
                .filter(file => 
                  file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                )
                .map(file => {
                  // Verificar se é pasta (pode vir do tipo ou do mimeType)
                  const isFolder = (file as any).type === 'folder' || (file as any).mimeType === 'application/vnd.google-apps.folder';
                  const canDelete = user?.permissions?.delete ?? false;
                  
                  if (isFolder) {
                    // Card de Pasta - Design menor e preto (estilo Grupo Raça)
                    // Calcular o caminho completo da pasta
                    let folderPath: string;
                    if (file.folder && file.folder !== '*') {
                      folderPath = `${file.folder}/${file.name}`;
                    } else {
                      folderPath = file.name;
                    }
                    
                    // Verificar se está carregando ou selecionada
                    const isFolderLoading = loadingFolder === folderPath;
                    const isFolderSelected = currentFolder === folderPath || currentFolder.startsWith(folderPath + '/');
                    
                    return (
                      <div 
                        key={file.id} 
                        onClick={() => {
                          // Navegar para dentro da pasta
                          // file.folder contém o caminho onde a pasta está localizada
                          // file.name é o nome da pasta
                          // O caminho completo será: file.folder + '/' + file.name (se file.folder não for '*')
                          
                          let newPath: string;
                          
                          if (file.folder && file.folder !== '*') {
                            // Se file.folder existe e não é '*', construir caminho completo
                            newPath = `${file.folder}/${file.name}`;
                          } else {
                            // Se file.folder é '*' ou não existe, a pasta está na raiz
                            newPath = file.name;
                          }
                          
                          // Para usuários "user", verificar se a pasta está dentro da pasta base
                          if (user?.role === 'user') {
                            const userFolder = user.folder || '';
                            if (userFolder) {
                              // Verificar se newPath está dentro da pasta do usuário
                              if (newPath !== userFolder && !newPath.startsWith(userFolder + '/')) {
                                setError('Você não tem permissão para acessar esta pasta');
                                return;
                              }
                            }
                          }
                          
                          // Verificar se não está tentando navegar para o mesmo lugar
                          if (newPath !== currentFolder) {
                            setLoadingFolder(newPath); // Marcar pasta como carregando
                            setCurrentFolder(newPath);
                          }
                        }}
                        className={`group bg-black border-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer transform hover:-translate-y-1 ${
                          isFolderSelected 
                            ? 'border-yellow-400 bg-gray-900 shadow-lg ring-2 ring-yellow-400/50' 
                            : 'border-black hover:bg-gray-900 hover:border-gray-700'
                        } ${isFolderLoading ? 'opacity-75' : ''}`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-6">
                          {isFolderLoading ? (
                            <Loader2 size={40} className="text-yellow-400 animate-spin" strokeWidth={2} />
                          ) : (
                            <Folder 
                              size={40} 
                              className={`transition-transform duration-300 ${
                                isFolderSelected ? 'text-yellow-400 scale-110' : 'text-white group-hover:scale-110'
                              }`} 
                              strokeWidth={2} 
                            />
                          )}
                          {/* Botões de ação no hover (desktop) - sempre visíveis para debug */}
                          <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-20">
                            <div className="flex gap-2">
                              {user?.permissions?.upload && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowRenameModal({ file, type: 'folder' });
                                      setRenameValue(file.name);
                                    }}
                                    className="p-2.5 md:p-2 bg-blue-500/90 backdrop-blur-sm rounded-lg hover:bg-blue-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Renomear"
                                  >
                                    <Edit2 size={18} className="text-white md:w-4 md:h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowMoveModal({ file });
                                    }}
                                    className="p-2.5 md:p-2 bg-yellow-500/90 backdrop-blur-sm rounded-lg hover:bg-yellow-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Mover"
                                  >
                                    <Move size={18} className="text-white md:w-4 md:h-4" />
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFile(file.id, file.folder, file.name);
                                  }}
                                  className="p-2.5 md:p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Deletar"
                                >
                                  <Trash2 size={18} className="text-white md:w-4 md:h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Botões sempre visíveis no mobile */}
                          <div className="md:hidden absolute top-2 right-2 z-10">
                            <div className="flex gap-2">
                              {user?.permissions?.upload && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowRenameModal({ file, type: 'folder' });
                                      setRenameValue(file.name);
                                    }}
                                    className="p-2.5 bg-blue-500/90 backdrop-blur-sm rounded-lg hover:bg-blue-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Renomear"
                                  >
                                    <Edit2 size={18} className="text-white" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowMoveModal({ file });
                                    }}
                                    className="p-2.5 bg-yellow-500/90 backdrop-blur-sm rounded-lg hover:bg-yellow-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Mover"
                                  >
                                    <Move size={18} className="text-white" />
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFile(file.id, file.folder, file.name);
                                  }}
                                  className="p-2.5 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Deletar"
                                >
                                  <Trash2 size={18} className="text-white" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5 bg-black">
                          <h3 className={`font-semibold text-xs truncate text-center uppercase ${
                            isFolderSelected ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {file.name}
                          </h3>
                        </div>
                      </div>
                    );
                  }
                  
                  // Card de Arquivo - Design Moderno
                  const isSelected = selectedFiles.has(file.id);
                  return (
                    <div 
                      key={file.id} 
                      className={`group bg-white border-2 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 ${
                        isSelected 
                          ? 'border-blue-500 ring-4 ring-blue-200 shadow-2xl shadow-blue-500/20' 
                          : 'border-gray-200/80 hover:border-gray-300 hover:shadow-2xl shadow-lg'
                      }`}
                      onClick={(e) => {
                        // Se clicar no checkbox, botão ou link, não abrir modal
                        if (
                          (e.target as HTMLElement).closest('input[type="checkbox"]') ||
                          (e.target as HTMLElement).closest('button') ||
                          (e.target as HTMLElement).closest('a')
                        ) {
                          return;
                        }
                        
                        const isImage = (file as any).mimeType?.startsWith('image/');
                        const isVideo = (file as any).mimeType?.startsWith('video/');
                        
                        // Se for imagem ou vídeo, abrir modal de visualização
                        if ((isImage || isVideo) && file.url) {
                          // Limpar blob URL anterior se existir
                          if (previewImageBlobUrl) {
                            window.URL.revokeObjectURL(previewImageBlobUrl);
                            setPreviewImageBlobUrl(null);
                          }
                          setPreviewImageError(false);
                          setPreviewImageLoading(true);
                          setPreviewFile(file);
                        }
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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
                        {(() => {
                          const isImage = (file as any).mimeType?.startsWith('image/');
                          const isVideo = (file as any).mimeType?.startsWith('video/');
                          // Verificar se tem thumbnail: 
                          // - Para imagens: sempre tentar exibir (pode ser thumbnailLink ou nosso proxy)
                          // - Para vídeos: verificar se a URL é um thumbnailLink (googleusercontent.com) ou nosso proxy
                          // - Não exibir se for um viewLink do Google Drive
                          const isViewLink = file.url && (
                            file.url.includes('drive.google.com/file/d/') || 
                            file.url.includes('drive.google.com/open')
                          );
                          const hasThumbnail = file.url && (
                            (isImage && !isViewLink) || 
                            (isVideo && !isViewLink && (
                              file.url.includes('googleusercontent.com') || 
                              file.url.includes('/api/view-file.php')
                            ))
                          );
                          
                          if (hasThumbnail) {
                            const isImage = (file as any).mimeType?.startsWith('image/');
                            const isVideo = (file as any).mimeType?.startsWith('video/');
                            return (
                              <img 
                                src={file.url} 
                                alt={file.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isImage && file.url) {
                                    // Limpar blob URL anterior se existir
                                    if (previewImageBlobUrl) {
                                      window.URL.revokeObjectURL(previewImageBlobUrl);
                                      setPreviewImageBlobUrl(null);
                                    }
                                    setPreviewImageError(false);
                                    setPreviewImageLoading(true);
                                    setPreviewFile(file);
                                  } else if (isVideo && file.url) {
                                    // Limpar blob URL anterior se existir
                                    if (previewImageBlobUrl) {
                                      window.URL.revokeObjectURL(previewImageBlobUrl);
                                      setPreviewImageBlobUrl(null);
                                    }
                                    setPreviewImageError(false);
                                    setPreviewImageLoading(true);
                                    setPreviewFile(file);
                                  }
                                }}
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
                            );
                          } else if (isVideo) {
                            // Para vídeos sem thumbnail, mostrar ícone de vídeo com mensagem de processamento
                            return (
                              <div 
                                className="w-full h-full flex flex-col items-center justify-center bg-gray-100 relative cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (file.url) {
                                    // Limpar blob URL anterior se existir
                                    if (previewImageBlobUrl) {
                                      window.URL.revokeObjectURL(previewImageBlobUrl);
                                      setPreviewImageBlobUrl(null);
                                    }
                                    setPreviewImageError(false);
                                    setPreviewImageLoading(true);
                                    setPreviewFile(file);
                                  }
                                }}
                              >
                                <Video size={48} className="text-gray-400 mb-3" />
                                <span className="text-xs text-gray-500 text-center px-2 line-clamp-2 mb-2">
                                  {file.name}
                                </span>
                                <div className="px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg max-w-[90%]">
                                  <p className="text-xs text-yellow-700 font-medium text-center">
                                    Arquivo sendo processado
                                  </p>
                                  <p className="text-xs text-yellow-600 text-center mt-0.5">
                                    O thumbnail aparecerá em breve
                                  </p>
                                </div>
                              </div>
                            );
                          } else {
                            // Para outros tipos de arquivo, mostrar ícone genérico
                            return (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={48} className="text-gray-400" />
                              </div>
                            );
                          }
                        })()}
                        <div className="absolute top-2 right-2 opacity-0 md:group-hover:opacity-100 transition-opacity md:opacity-0">
                          <div className="flex gap-2">
                            {file.url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isImage = (file as any).mimeType?.startsWith('image/');
                                  const isVideo = (file as any).mimeType?.startsWith('video/');
                                  if (isImage) {
                                    // Limpar blob URL anterior se existir
                                    if (previewImageBlobUrl) {
                                      window.URL.revokeObjectURL(previewImageBlobUrl);
                                      setPreviewImageBlobUrl(null);
                                    }
                                    setPreviewImageError(false);
                                    setPreviewImageLoading(true);
                                    setPreviewFile(file);
                                  } else if (isVideo && file.url) {
                                    // Limpar blob URL anterior se existir
                                    if (previewImageBlobUrl) {
                                      window.URL.revokeObjectURL(previewImageBlobUrl);
                                      setPreviewImageBlobUrl(null);
                                    }
                                    setPreviewImageError(false);
                                    setPreviewImageLoading(true);
                                    setPreviewFile(file);
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
                            {user?.permissions?.upload && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRenameModal({ file, type: isFolder ? 'folder' : 'file' });
                                    setRenameValue(file.name);
                                  }}
                                  className="p-2.5 md:p-2 bg-blue-500/90 backdrop-blur-sm rounded-lg hover:bg-blue-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Renomear"
                                >
                                  <Edit2 size={18} className="text-white md:w-4 md:h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMoveModal({ file });
                                  }}
                                  className="p-2.5 md:p-2 bg-yellow-500/90 backdrop-blur-sm rounded-lg hover:bg-yellow-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Mover"
                                >
                                  <Move size={18} className="text-white md:w-4 md:h-4" />
                                </button>
                              </>
                            )}
                            {canDelete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file.id, file.folder, file.name);
                                }}
                                className="p-2.5 md:p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                title="Deletar"
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
                                  // Limpar blob URL anterior se existir
                                  if (previewImageBlobUrl) {
                                    window.URL.revokeObjectURL(previewImageBlobUrl);
                                    setPreviewImageBlobUrl(null);
                                  }
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
                      <div className="p-4 bg-gradient-to-b from-white to-gray-50/50">
                        <h3 className="font-bold text-gray-900 mb-2 truncate text-sm group-hover:text-black transition-colors">{file.name}</h3>
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {file.tags.map((tag: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs rounded-full font-medium border border-gray-200/50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span className="font-medium">{file.size}</span>
                          <span className="font-medium">{new Date(file.uploaded_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Por: {file.uploaded_by}</p>
                        {/* Botão de download sempre visível na parte inferior para vídeos */}
                        {(file as any).mimeType?.startsWith('video/') && file.url && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
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
                            className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-black to-gray-800 text-white text-sm font-semibold rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                            title="Baixar vídeo"
                          >
                            <Download size={16} />
                            Baixar Vídeo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Visualização em Lista
              <div className="space-y-2">
                {files
                  .filter(file => {
                    // Filtro por tipo
                    if (fileTypeFilter !== 'all') {
                      if (fileTypeFilter === 'folder' && file.type === 'folder') return true;
                      if (fileTypeFilter === 'image' && (file as any).mimeType?.startsWith('image/')) return true;
                      if (fileTypeFilter === 'video' && (file as any).mimeType?.startsWith('video/')) return true;
                      if (fileTypeFilter === 'document') {
                        const mime = (file as any).mimeType || '';
                        return mime.includes('pdf') || mime.includes('document') || mime.includes('spreadsheet');
                      }
                      if (fileTypeFilter !== 'folder' && file.type === 'folder') return false;
                    }
                    return true;
                  })
                  .filter(file =>
                    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (file.tags && file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                  )
                  .map(file => {
                    const isSelected = selectedFiles.has(file.id);
                    const isFolder = (file as any).type === 'folder' || (file as any).mimeType === 'application/vnd.google-apps.folder';
                    const canDelete = user?.permissions?.delete ?? false;
                    
                    // Calcular o caminho completo da pasta se for uma pasta
                    let folderPath: string | null = null;
                    let isFolderLoading = false;
                    let isFolderSelected = false;
                    
                    if (isFolder) {
                      if (file.folder && file.folder !== '*') {
                        folderPath = `${file.folder}/${file.name}`;
                      } else {
                        folderPath = file.name;
                      }
                      isFolderLoading = loadingFolder === folderPath;
                      isFolderSelected = currentFolder === folderPath || currentFolder.startsWith(folderPath + '/');
                    }
                    
                    return (
                      <div
                        key={file.id}
                        onClick={isFolder ? () => {
                          if (!folderPath) return;
                          
                          // Para usuários "user", verificar se a pasta está dentro da pasta base
                          if (user?.role === 'user') {
                            const userFolder = user.folder || '';
                            if (userFolder) {
                              // Verificar se folderPath está dentro da pasta do usuário
                              if (folderPath !== userFolder && !folderPath.startsWith(userFolder + '/')) {
                                setError('Você não tem permissão para acessar esta pasta');
                                return;
                              }
                            }
                          }
                          
                          // Verificar se não está tentando navegar para o mesmo lugar
                          if (folderPath && folderPath !== currentFolder) {
                            setLoadingFolder(folderPath); // Marcar pasta como carregando
                            setCurrentFolder(folderPath);
                          }
                        } : undefined}
                        className={`flex items-center gap-2 md:gap-4 p-3 md:p-3 bg-white border-2 rounded-lg transition-all ${
                          isFolder ? 'cursor-pointer active:bg-gray-50' : ''
                        } ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 
                          isFolderSelected ? 'border-yellow-400 bg-yellow-50 shadow-md' : 
                          'border-gray-200 hover:shadow-md'
                        } ${isFolderLoading ? 'opacity-75' : ''}`}
                      >
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
                          className="w-5 h-5 md:w-5 md:h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 touch-manipulation"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isFolder ? (
                          isFolderLoading ? (
                            <Loader2 size={20} className="md:w-6 md:h-6 text-yellow-400 animate-spin flex-shrink-0" />
                          ) : (
                            <Folder size={20} className={`md:w-6 md:h-6 flex-shrink-0 ${isFolderSelected ? 'text-yellow-400' : 'text-gray-600'}`} />
                          )
                        ) : (file as any).mimeType?.startsWith('image/') ? (
                          <ImageIcon size={20} className="md:w-6 md:h-6 text-gray-600 flex-shrink-0" />
                        ) : (
                          <FileText size={20} className="md:w-6 md:h-6 text-gray-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm md:text-base font-semibold truncate uppercase ${
                            isFolderSelected ? 'text-yellow-600' : 'text-black'
                          }`}>
                            {file.name}
                          </h3>
                          <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                            {(file as any).size && (
                              <span>{(parseInt((file as any).size) / 1024 / 1024).toFixed(2)} MB</span>
                            )}
                            {(file as any).mimeType && (
                              <span>{(file as any).mimeType}</span>
                            )}
                            {(file as any).modifiedTime && (
                              <span>{new Date((file as any).modifiedTime).toLocaleDateString('pt-BR')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                          {file.url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const isImage = (file as any).mimeType?.startsWith('image/');
                                if (isImage) {
                                  if (previewImageBlobUrl) {
                                    window.URL.revokeObjectURL(previewImageBlobUrl);
                                    setPreviewImageBlobUrl(null);
                                  }
                                  setPreviewImageError(false);
                                  setPreviewImageLoading(true);
                                  setPreviewFile(file);
                                } else if ((file as any).mimeType?.startsWith('video/') && file.url) {
                                  // Limpar blob URL anterior se existir
                                  if (previewImageBlobUrl) {
                                    window.URL.revokeObjectURL(previewImageBlobUrl);
                                    setPreviewImageBlobUrl(null);
                                  }
                                  setPreviewImageError(false);
                                  setPreviewImageLoading(true);
                                  setPreviewFile(file);
                                }
                              }}
                              className="p-2.5 md:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                              title="Visualizar"
                            >
                              <Eye size={18} className="text-gray-600" />
                            </button>
                          )}
                          {user?.permissions?.upload && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowRenameModal({ file, type: isFolder ? 'folder' : 'file' });
                                  setRenameValue(file.name);
                                }}
                                className="p-2.5 md:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                                title="Renomear"
                              >
                                <Edit2 size={18} className="text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMoveModal({ file });
                                }}
                                className="p-2.5 md:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                                title="Mover"
                              >
                                <Move size={18} className="text-gray-600" />
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.id, file.folder, file.name);
                              }}
                            className="p-2.5 md:p-2 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                            title="Deletar"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

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
                <p className="text-2xl font-bold text-black">
                  {files.filter(file => (file as any).type === 'folder' || (file as any).mimeType === 'application/vnd.google-apps.folder').length}
                </p>
                <p className="text-sm text-gray-600">Total de Pastas</p>
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
                onChange={(e) => {
                  // Converter para maiúsculas automaticamente enquanto digita
                  const upperValue = e.target.value.toUpperCase();
                  setNewFolderName(upperValue);
                }}
                placeholder="Ex: EVENTOS 2024 (apenas MAIÚSCULAS)"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                style={{ textTransform: 'uppercase' }}
                autoFocus
              />
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
                accept="image/*,video/*,.mp4,.mov,.avi,.wmv,.webm,.mkv,.mpeg,.mpg,.pdf,.doc,.docx,.xls,.xlsx" 
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
                <p className="text-xs text-gray-400">Formatos: Imagens, Vídeos, PDF, Documentos (máx. 1GB por arquivo)</p>
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
                          {progress !== undefined && (
                            <>
                              {isError ? (
                                <span className="text-red-500 text-xs font-medium">Erro</span>
                              ) : isComplete ? (
                                <CheckCircle className="text-green-500" size={20} />
                              ) : progress === 0 ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="animate-spin text-blue-600" size={16} />
                                  <span className="text-xs text-gray-600 font-medium">
                                    Preparando...
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 transition-all duration-300"
                                      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium min-w-[3rem] text-right">
                                    {progress}%
                                  </span>
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
            <div className={`p-4 rounded-lg border-2 ${
              error.includes('ERRO 413') || error.includes('rejeitando')
                ? 'bg-red-100 border-red-400 text-red-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-semibold mb-1">
                    {error.includes('ERRO 413') || error.includes('rejeitando')
                      ? '⚠️ Servidor Rejeitando Upload'
                      : 'Erro no Upload'}
                  </p>
                  <p className="text-sm leading-relaxed">{error}</p>
                  {(error.includes('ERRO 413') || error.includes('rejeitando')) && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-xs">
                      <p className="font-semibold mb-1">💡 Solução:</p>
                      <p>
                        O servidor precisa ter suas configurações ajustadas para aceitar arquivos grandes. 
                        Entre em contato com o administrador do servidor ou consulte o arquivo 
                        <strong> "api/RESOLVER_ERRO_413.md"</strong> para instruções detalhadas de como configurar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
            // Limpar blob URL ao fechar
            if (previewImageBlobUrl) {
              window.URL.revokeObjectURL(previewImageBlobUrl);
              setPreviewImageBlobUrl(null);
            }
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
                // Limpar blob URL ao fechar
                if (previewImageBlobUrl) {
                  window.URL.revokeObjectURL(previewImageBlobUrl);
                  setPreviewImageBlobUrl(null);
                }
                setPreviewFile(null);
                setPreviewImageError(false);
                setPreviewImageLoading(true);
              }}
              className="absolute top-4 right-4 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>
            
            {/* Setas de Navegação */}
            {getMediaFiles().length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm"
                  aria-label={previewFile.mimeType?.startsWith('video/') ? 'Vídeo anterior' : 'Imagem anterior'}
                >
                  <ArrowLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm"
                  aria-label={previewFile.mimeType?.startsWith('video/') ? 'Próximo vídeo' : 'Próxima imagem'}
                >
                  <ArrowRight size={24} />
                </button>
              </>
            )}
            
            {/* Imagem ou Vídeo */}
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
                        onClick={async () => {
                          setPreviewImageError(false);
                          setPreviewImageLoading(true);
                          // Recarregar imagem usando fetch
                          try {
                            const response = await fetch(`/api/view-file.php?id=${previewFile.id}&t=${Date.now()}`, {
                              credentials: 'include'
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              // Limpar blob URL anterior se existir
                              if (previewImageBlobUrl) {
                                window.URL.revokeObjectURL(previewImageBlobUrl);
                              }
                              setPreviewImageBlobUrl(blobUrl);
                              setPreviewImageError(false);
                              setPreviewImageLoading(false);
                            } else {
                              setPreviewImageError(true);
                              setPreviewImageLoading(false);
                            }
                          } catch (error) {
                            console.error('Erro ao recarregar imagem:', error);
                            setPreviewImageError(true);
                            setPreviewImageLoading(false);
                          }
                        }}
                        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors text-sm"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  ) : previewImageBlobUrl ? (
                    <img 
                      key={previewFile.id}
                      src={previewImageBlobUrl}
                      alt={previewFile.name}
                      className="preview-image max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onError={() => {
                        console.error('Erro ao exibir imagem do blob URL');
                        setPreviewImageError(true);
                        setPreviewImageLoading(false);
                      }}
                      onLoad={() => {
                        console.log('Imagem carregada com sucesso no modal');
                        setPreviewImageLoading(false);
                        setPreviewImageError(false);
                      }}
                      style={{ display: previewImageLoading ? 'none' : 'block' }}
                    />
                  ) : (
                    <div className="text-white text-center p-8">
                      <p className="text-lg mb-2">Carregando imagem...</p>
                    </div>
                  )}
                </>
              ) : previewFile.mimeType?.startsWith('video/') ? (
                <>
                  {previewImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {previewImageError ? (
                    <div className="text-white text-center p-8">
                      <p className="text-lg mb-2">Erro ao carregar vídeo</p>
                      <p className="text-sm opacity-75 mb-4">{previewFile.name}</p>
                      <button
                        onClick={async () => {
                          setPreviewImageError(false);
                          setPreviewImageLoading(true);
                          // Recarregar vídeo usando fetch
                          try {
                            const response = await fetch(`/api/download-file.php?id=${previewFile.id}&t=${Date.now()}`, {
                              credentials: 'include'
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              // Limpar blob URL anterior se existir
                              if (previewImageBlobUrl) {
                                window.URL.revokeObjectURL(previewImageBlobUrl);
                              }
                              setPreviewImageBlobUrl(blobUrl);
                              setPreviewImageError(false);
                              setPreviewImageLoading(false);
                            } else {
                              setPreviewImageError(true);
                              setPreviewImageLoading(false);
                            }
                          } catch (error) {
                            console.error('Erro ao recarregar vídeo:', error);
                            setPreviewImageError(true);
                            setPreviewImageLoading(false);
                          }
                        }}
                        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors text-sm"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  ) : previewImageBlobUrl ? (
                    <video 
                      key={previewFile.id}
                      src={previewImageBlobUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                      onError={() => {
                        console.error('Erro ao exibir vídeo do blob URL');
                        setPreviewImageError(true);
                        setPreviewImageLoading(false);
                      }}
                      onLoadedData={() => {
                        console.log('Vídeo carregado com sucesso no modal');
                        setPreviewImageLoading(false);
                        setPreviewImageError(false);
                      }}
                      style={{ display: previewImageLoading ? 'none' : 'block' }}
                    >
                      Seu navegador não suporta a tag de vídeo.
                    </video>
                  ) : (
                    <div className="text-white text-center p-8">
                      <p className="text-lg mb-2">Carregando vídeo...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-white text-center p-8">
                  <p className="text-lg mb-2">Tipo de arquivo não suportado</p>
                  <p className="text-sm opacity-75">{previewFile.name}</p>
                </div>
              )}
            </div>
            
            {/* Informações melhoradas na parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{previewFile.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                      {(previewFile as any).size && (
                        <span>{(parseInt((previewFile as any).size) / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                      {(previewFile as any).mimeType && (
                        <span>{(previewFile as any).mimeType}</span>
                      )}
                      {(previewFile as any).modifiedTime && (
                        <span>{new Date((previewFile as any).modifiedTime).toLocaleDateString('pt-BR')}</span>
                      )}
                      {getMediaFiles().length > 1 && (
                        <span>{getMediaFiles().findIndex(f => f.id === previewFile.id) + 1} de {getMediaFiles().length}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
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
                            addToast('Download iniciado', 'success');
                          } else {
                            addToast('Erro ao fazer download', 'error');
                          }
                        } catch (error) {
                          addToast('Erro ao fazer download', 'error');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download size={18} />
                      <span>Download</span>
                    </button>
                    {user?.permissions?.upload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isPreviewFolder = (previewFile as any).type === 'folder' || (previewFile as any).mimeType === 'application/vnd.google-apps.folder';
                          setShowRenameModal({ file: previewFile, type: isPreviewFolder ? 'folder' : 'file' });
                          setRenameValue(previewFile.name);
                          setPreviewFile(null);
                        }}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Edit2 size={18} />
                        <span>Renomear</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contador de Imagens */}
            {getMediaFiles().length > 1 && (
              <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/70 text-white rounded-full backdrop-blur-sm text-sm">
                {getMediaFiles().findIndex(f => f.id === previewFile.id) + 1} de {getMediaFiles().length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Renomear */}
      {showRenameModal && (
        <Modal
          isOpen={!!showRenameModal}
          onClose={() => {
            setShowRenameModal(null);
            setRenameValue('');
          }}
          title={`Renomear ${showRenameModal.type === 'folder' ? 'Pasta' : 'Arquivo'}`}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!showRenameModal || !renameValue.trim()) return;
              
              setLoading(true);
              try {
                const newName = renameValue.trim().toUpperCase();
                const response = await api.renameFile(
                  showRenameModal.file.id,
                  newName,
                  showRenameModal.file.folder,
                  showRenameModal.type
                );
                
                if (response.error) {
                  addToast(response.error, 'error');
                } else {
                  addToast(`${showRenameModal.type === 'folder' ? 'Pasta' : 'Arquivo'} renomeado com sucesso`, 'success');
                  setShowRenameModal(null);
                  setRenameValue('');
                  await loadFiles();
                }
              } catch (err: any) {
                addToast(err.message || 'Erro ao renomear', 'error');
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Novo Nome
              </label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setRenameValue(upperValue);
                }}
                placeholder={showRenameModal.file.name}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                style={{ textTransform: 'uppercase' }}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRenameModal(null);
                  setRenameValue('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !renameValue.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Renomeando...' : 'Renomear'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Mover */}
      {showMoveModal && (
        <Modal
          isOpen={!!showMoveModal}
          onClose={() => setShowMoveModal(null)}
          title="Mover Arquivo"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!showMoveModal) return;
              
              const formData = new FormData(e.currentTarget);
              const toFolder = formData.get('toFolder') as string;
              
              if (!toFolder) {
                addToast('Selecione uma pasta de destino', 'warning');
                return;
              }
              
              setLoading(true);
              try {
                const response = await api.moveFile(
                  showMoveModal.file.id,
                  showMoveModal.file.folder,
                  toFolder,
                  showMoveModal.file.type === 'folder' ? 'folder' : 'file'
                );
                
                if (response.error) {
                  addToast(response.error, 'error');
                } else {
                  addToast('Arquivo movido com sucesso', 'success');
                  setShowMoveModal(null);
                  await loadFiles();
                }
              } catch (err: any) {
                addToast(err.message || 'Erro ao mover arquivo', 'error');
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mover para:
              </label>
              <select
                name="toFolder"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                defaultValue={currentFolder}
              >
                {folders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder === '*' ? 'Todas' : folder.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMoveModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Movendo...' : 'Mover'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Modal de Aviso sobre Logout */}
      {showLogoutWarning && (
        <Modal
          isOpen={showLogoutWarning}
          onClose={() => setShowLogoutWarning(false)}
          title="⚠️ Aviso Importante"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                    Como sair do sistema corretamente
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Para evitar problemas de autenticação, <strong>sempre use o botão "Sair"</strong> quando quiser encerrar sua sessão.
                  </p>
                  <div className="bg-white rounded p-3 mb-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">✅ Faça assim:</p>
                    <p className="text-xs text-gray-700">Clique no botão <strong>"Sair"</strong> localizado no menu lateral ou no rodapé do sistema.</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs text-red-600 font-medium mb-1">❌ Evite fazer:</p>
                    <p className="text-xs text-gray-700">Fechar a janela do navegador ou a aba sem clicar no botão "Sair". Isso pode causar problemas de autenticação na próxima vez que você acessar o sistema.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dontShowAgain"
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                onChange={(e) => {
                  if (e.target.checked) {
                    localStorage.setItem('database_logout_warning_dismissed', 'true');
                  }
                }}
              />
              <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-700">
                Não mostrar esta mensagem novamente
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLogoutWarning(false)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Entendi
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação de Delete */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja deletar <strong>{showDeleteConfirm.fileName}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </Modal>
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'root' | 'admin' | 'viewer' | 'user' | 'assessor',
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

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      password: '', // Não preencher senha
      name: userToEdit.name,
      role: userToEdit.role as 'root' | 'admin' | 'viewer' | 'user' | 'assessor',
      folder: userToEdit.folder || ''
    });
    setShowCreateForm(false);
    setError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        folder: formData.folder
      };

      // Só incluir senha se foi preenchida
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await api.updateUser(editingUser.id, updateData);
      if (response.user) {
        setEditingUser(null);
        setFormData({ email: '', password: '', name: '', role: 'user', folder: '' });
        await loadUsers();
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar usuário');
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

        {(showCreateForm || editingUser) && (
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="bg-gray-50 p-4 rounded-lg space-y-3">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Senha {editingUser && <span className="text-xs text-gray-500 font-normal">(deixe em branco para não alterar)</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
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
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'root' | 'admin' | 'viewer' | 'user' | 'assessor' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              >
                <option value="user">USER</option>
                <option value="assessor">ASSESSOR</option>
                <option value="viewer">VIEWER</option>
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
                  onBlur={(e) => {
                    // Se o campo estiver vazio, gerar automaticamente a partir do email
                    if (!e.target.value && formData.email) {
                      const emailPrefix = formData.email.split('@')[0];
                      // Remover caracteres especiais e converter para minúsculas
                      const folderName = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
                      if (folderName) {
                        setFormData({ ...formData, folder: folderName });
                      }
                    }
                  }}
                  placeholder="Ex: mangalargamarchador (gerado automaticamente do email se vazio)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pasta que o usuário terá acesso. Se deixar vazio, será gerada automaticamente a partir do email.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingUser(null);
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
                {editingUser ? 'Atualizar' : 'Criar'}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(u)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                      >
                        Deletar
                      </button>
                    </div>
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

