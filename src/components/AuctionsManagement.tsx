import { useState, useEffect } from 'react';
import { 
  X, Plus, Edit2, Trash2, Calendar, Image as ImageIcon, 
  Upload, Save, Loader2, Award, Eye, EyeOff
} from 'lucide-react';
import Modal from './Modal';
import ToastContainer, { type Toast } from './Toast';
import * as api from '../lib/api';
import type { Auction } from '../lib/api';

interface AuctionsManagementProps {
  onClose?: () => void;
  user: api.User;
  useModal?: boolean; // Se true, usa Modal; se false, renderiza como página
}

export default function AuctionsManagement({ onClose, user, useModal = true }: AuctionsManagementProps) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'EM_BREVE' | 'NO_AR' | 'ENCERRADO'>('all');
  const [onlyActive, setOnlyActive] = useState(false);
  const [previewAuction, setPreviewAuction] = useState<Auction | null>(null);
  const [auctionStats, setAuctionStats] = useState<any | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loadingStats, setLoadingStats] = useState(false);
  const [auctionClicks, setAuctionClicks] = useState<any[] | null>(null);
  const [loadingClicks, setLoadingClicks] = useState(false);

  // Normaliza datas para <input type="date" /> (precisa ser YYYY-MM-DD)
  // Aceita formatos comuns vindos do backend: "YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS", "YYYY-MM-DDTHH:MM:SSZ"
  const toDateInputValue = (value?: string | null) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    // Se tiver tempo junto, manter só a parte da data
    if (raw.length >= 10) return raw.slice(0, 10);
    return raw;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    breed: '',
    start_date: '',
    end_date: '',
    image_path: '',
    image_drive_id: '',
    link_url: '',
    active: true
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imagePreviewLoading, setImagePreviewLoading] = useState(false);

  const addToast = (message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadAuctions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getAuctions();
      if (response.data) {
        setAuctions(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leilões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  // Carregar resumo de estatísticas de leilões
  useEffect(() => {
    const loadAuctionStats = async () => {
      setLoadingStats(true);
      try {
        const response = await api.getStatistics('auctions', statsPeriod);
        if (response.data) {
          setAuctionStats(response.data);
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas de leilões:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadAuctionStats();
  }, [statsPeriod]);

  // Carregar cliques por leilão
  useEffect(() => {
    const loadAuctionClicks = async () => {
      setLoadingClicks(true);
      try {
        const response = await api.getStatistics('auction_clicks', statsPeriod);
        if (response.data && response.data.clicks_by_auction) {
          setAuctionClicks(response.data.clicks_by_auction);
        } else {
          setAuctionClicks([]);
        }
      } catch (err) {
        console.error('Erro ao carregar cliques por leilão:', err);
        setAuctionClicks([]);
      } finally {
        setLoadingClicks(false);
      }
    };
    loadAuctionClicks();
  }, [statsPeriod]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      // 1. Upload para Google Drive na pasta IMAGENS_LEILOES_SITE (ou LEILOES se não existir)
      let uploadResponse = await api.uploadFileDirectToDrive(file, 'IMAGENS_LEILOES_SITE');
      
      // Se a pasta IMAGENS_LEILOES_SITE não existir, tentar LEILOES
      if (uploadResponse.error && (uploadResponse.error.includes('não encontrada') || uploadResponse.error.includes('not found'))) {
        console.log('Pasta IMAGENS_LEILOES_SITE não encontrada, tentando LEILOES...');
        uploadResponse = await api.uploadFileDirectToDrive(file, 'LEILOES');
      }
      
      if (uploadResponse.error) {
        console.error('❌ Erro no upload:', uploadResponse.error);
        throw new Error(uploadResponse.error);
      }
      
      console.log('📤 Upload response completo:', uploadResponse);
      
      // O uploadFileDirectToDrive retorna { id, name, ... } diretamente ou { error }
      const fileId = (uploadResponse as any).id;
      console.log('📤 File ID obtido:', fileId);
      
      if (!fileId || typeof fileId !== 'string') {
        console.error('❌ ID do arquivo não retornado ou inválido');
        console.error('❌ uploadResponse completo:', uploadResponse);
        throw new Error('ID do arquivo não retornado após upload. Verifique o console para mais detalhes.');
      }
      
      // 2. Criar link público para a imagem
      console.log('🔗 Criando link público para file_id:', fileId);
      const linkResponse = await fetch('/api/create-public-image-link.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ file_id: fileId })
      });
      
      console.log('🔗 Link response status:', linkResponse.status);
      
      if (!linkResponse.ok) {
        const errorText = await linkResponse.text();
        console.error('❌ Erro ao criar link público:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Erro HTTP ${linkResponse.status}`);
        } catch {
          throw new Error(`Erro HTTP ${linkResponse.status}: ${errorText}`);
        }
      }
      
      let linkData;
      try {
        const responseText = await linkResponse.text();
        console.log('🔗 Link response text:', responseText);
        linkData = JSON.parse(responseText);
        console.log('🔗 Link data parseado:', linkData);
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta:', parseError);
        throw new Error('Resposta inválida do servidor ao criar link público');
      }
      
      // Validar resposta
      if (!linkData || typeof linkData !== 'object') {
        throw new Error('Resposta inválida do servidor');
      }
      
      if (linkData.error) {
        throw new Error(linkData.error);
      }
      
      let imageUrl = linkData.recommended_url || linkData.proxy_url || linkData.direct_url || linkData.thumbnail_url;
      
      if (!imageUrl) {
        console.error('❌ Nenhuma URL de imagem encontrada na resposta:', linkData);
        throw new Error('Link público não foi gerado. Verifique os logs.');
      }
      
      // Garantir que URLs relativas sejam absolutas
      if (imageUrl.startsWith('/')) {
        // URL relativa - manter como está (será resolvida pelo navegador)
        imageUrl = imageUrl;
      } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // Se não começar com / ou http, adicionar /
        imageUrl = '/' + imageUrl;
      }
      
      console.log('✅ URL da imagem obtida:', imageUrl);
      
      // 3. Salvar link direto no formData
      try {
        setFormData(prev => {
          const updated = {
            ...prev,
            image_path: imageUrl, // Link direto do Google Drive
            image_drive_id: fileId
          };
          console.log('✅ FormData atualizado:', updated);
          return updated;
        });
        
      // Criar preview usando o link direto
      setImagePreviewLoading(true);
      setImagePreviewError(false);
      setImagePreview(imageUrl);
      console.log('✅ Preview atualizado com URL:', imageUrl);
      
      // Verificar se a imagem carrega
      const testImg = new Image();
      testImg.onload = () => {
        setImagePreviewLoading(false);
        setImagePreviewError(false);
        console.log('✅ Preview carregado com sucesso');
      };
      testImg.onerror = () => {
        console.warn('⚠️ Preview não carregou, mas URL foi salva');
        setImagePreviewLoading(false);
        // Não marcar como erro ainda, pode ser apenas lento
      };
      testImg.src = imageUrl;
      
      addToast('Imagem enviada e link público criado com sucesso', 'success');
      } catch (stateError) {
        console.error('❌ Erro ao atualizar estado:', stateError);
        // Mesmo com erro no estado, salvar os dados manualmente
        setFormData(prev => ({
          ...prev,
          image_path: imageUrl,
          image_drive_id: fileId
        }));
        setImagePreview(imageUrl);
        addToast('Imagem enviada com sucesso', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Erro ao enviar imagem', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.createAuction(formData);
      if (response.data) {
        addToast('Leilão criado com sucesso', 'success');
        setShowCreateForm(false);
        resetForm();
        await loadAuctions();
      } else if (response.error) {
        setError(response.error);
        addToast(response.error, 'error');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar leilão');
      addToast(err.message || 'Erro ao criar leilão', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuction) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.updateAuction(editingAuction.id, formData);
      if (response.data) {
        addToast('Leilão atualizado com sucesso', 'success');
        setEditingAuction(null);
        resetForm();
        await loadAuctions();
      } else if (response.error) {
        setError(response.error);
        addToast(response.error, 'error');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar leilão');
      addToast(err.message || 'Erro ao atualizar leilão', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.deleteAuction(auctionId);
      if (!response.error) {
        addToast('Leilão deletado com sucesso', 'success');
        setShowDeleteConfirm(null);
        await loadAuctions();
      } else {
        setError(response.error);
        addToast(response.error, 'error');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar leilão');
      addToast(err.message || 'Erro ao deletar leilão', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      breed: '',
      start_date: '',
      end_date: '',
      image_path: '',
      image_drive_id: '',
      link_url: '',
      active: true
    });
    setImagePreview(null);
    setImagePreviewError(false);
    setImagePreviewLoading(false);
  };

  const handleEditAuction = (auction: Auction) => {
    setEditingAuction(auction);
    setFormData({
      title: auction.title,
      breed: auction.breed,
      start_date: toDateInputValue(auction.start_date),
      end_date: toDateInputValue(auction.end_date),
      image_path: auction.image_path || '',
      image_drive_id: auction.image_drive_id || '',
      link_url: auction.link_url || '',
      active: auction.active
    });
    
    // Se tiver imagem, criar preview
    setImagePreviewLoading(true);
    setImagePreviewError(false);
    
    if (auction.image_path) {
      setImagePreview(auction.image_path);
    } else if (auction.image_drive_id) {
      // Se não tiver image_path mas tiver image_drive_id, usar proxy do servidor
      setImagePreview(`/api/view-auction-image.php?id=${auction.image_drive_id}`);
    } else {
      setImagePreview(null);
      setImagePreviewLoading(false);
    }
    
    setShowCreateForm(false);
    setError('');
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      'EM_BREVE': { label: 'EM BREVE', className: 'bg-black/70 text-white' },
      'NO_AR': { label: 'NO AR', className: 'bg-green-500/90 text-white' },
      'ENCERRADO': { label: 'ENCERRADO', className: 'bg-gray-500/90 text-white' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ENCERRADO'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const buildPreviewAuction = (): Auction => {
    const today = new Date();
    const start = formData.start_date ? new Date(formData.start_date) : null;
    const end = formData.end_date ? new Date(formData.end_date) : null;

    let status: 'EM_BREVE' | 'NO_AR' | 'ENCERRADO' = 'EM_BREVE';
    if (start && end) {
      if (today < start) {
        status = 'EM_BREVE';
      } else if (today >= start && today <= end) {
        status = 'NO_AR';
      } else {
        status = 'ENCERRADO';
      }
    }

    let dateDisplay = '';
    if (start && end) {
      const format = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      dateDisplay = `${format(start)} a ${format(end)}`;
    }

    return {
      id: editingAuction?.id || 0,
      title: formData.title || 'Nome do Leilão',
      breed: formData.breed || 'Raça não definida',
      start_date: formData.start_date,
      end_date: formData.end_date,
      image_path: formData.image_path,
      image_drive_id: formData.image_drive_id,
      link_url: formData.link_url,
      active: formData.active,
      status,
      date_display: dateDisplay,
    };
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      !searchTerm ||
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.breed.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (auction.status as 'EM_BREVE' | 'NO_AR' | 'ENCERRADO' | undefined) === statusFilter;

    const matchesActive = !onlyActive || auction.active;

    return matchesSearch && matchesStatus && matchesActive;
  });

  const content = (
    <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Lista de Leilões</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">Estatísticas de leilões ({statsPeriod === 'all' ? 'todo período' : `últimos ${statsPeriod.replace('d', ' dias')}`}):</span>
                {loadingStats ? (
                  <span>Carregando...</span>
                ) : auctionStats ? (
                  <>
                    <span>Ativos: {auctionStats.active_count || 0}</span>
                    <span>• Encerrados: {auctionStats.completed_count || 0}</span>
                    <span>• Lotes: {auctionStats.total_lots || 0}</span>
                    <span>• Vendidos: {auctionStats.total_sold || 0}</span>
                    <span>• Conversão: {auctionStats.conversion_rate || 0}%</span>
                  </>
                ) : null}
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingAuction(null);
                setShowCreateForm(!showCreateForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Novo Leilão
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-1 md:col-span-1">
              <input
                type="text"
                placeholder="Buscar por nome ou raça..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="EM_BREVE">Em breve</option>
                <option value="NO_AR">No ar</option>
                <option value="ENCERRADO">Encerrado</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                Mostrar apenas leilões ativos no site
              </label>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Período das estatísticas:</span>
                <select
                  value={statsPeriod}
                  onChange={(e) => setStatsPeriod(e.target.value as any)}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-xs"
                >
                  <option value="7d">7 dias</option>
                  <option value="30d">30 dias</option>
                  <option value="90d">90 dias</option>
                  <option value="all">Todo período</option>
                </select>
              </div>
            </div>
          </div>

          {showCreateForm || editingAuction ? (
            <form onSubmit={editingAuction ? handleUpdateAuction : handleCreateAuction} className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Leilão *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Ex: Leilão Haras Santos & Convidados"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Raça do Cavalo *</label>
                <select
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                >
                  <option value="">Selecione a raça</option>
                  <option value="Mangalarga Marchador">Mangalarga Marchador</option>
                  <option value="Campolina Marchador">Campolina Marchador</option>
                  <option value="Quarto de Milha">Quarto de Milha</option>
                  <option value="Árabe">Árabe</option>
                  <option value="Outra">Outra</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data Início *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data Fim *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link do Leilão (opcional)</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="https://exemplo.com/pagina-do-leilao"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esse link será usado no botão “Ver Detalhes” do card no site. Se deixar vazio, usa o link padrão.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Foto do Leilão</label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      {imagePreviewLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                      )}
                      {imagePreviewError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
                          <p className="text-sm text-gray-600 text-center mb-2">Erro ao carregar imagem</p>
                          <button
                            onClick={() => {
                              setImagePreviewError(false);
                              setImagePreviewLoading(true);
                              // Tentar novamente
                              const img = new Image();
                              img.onload = () => {
                                setImagePreviewLoading(false);
                                setImagePreviewError(false);
                              };
                              img.onerror = () => {
                                setImagePreviewLoading(false);
                                setImagePreviewError(true);
                              };
                              img.src = imagePreview;
                            }}
                            className="text-xs px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                          >
                            Tentar Novamente
                          </button>
                        </div>
                      ) : (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                          onLoad={() => {
                            setImagePreviewLoading(false);
                            setImagePreviewError(false);
                          }}
                          onError={(e) => {
                            console.error('❌ Erro ao carregar preview:', imagePreview);
                            setImagePreviewLoading(false);
                            setImagePreviewError(true);
                            
                            // Se for proxy, tentar link direto do Google Drive como fallback
                            if (imagePreview.includes('/api/view-auction-image.php?id=')) {
                              const fileId = imagePreview.split('id=')[1];
                              if (fileId) {
                                const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                                console.log('🔄 Tentando fallback com link direto:', directUrl);
                                setTimeout(() => {
                                  setImagePreview(directUrl);
                                  setImagePreviewError(false);
                                  setImagePreviewLoading(true);
                                }, 500);
                              }
                            }
                          }}
                          style={{ display: imagePreviewLoading ? 'none' : 'block' }}
                        />
                      )}
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                    {uploadingImage ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Selecionar Imagem</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Leilão ativo (aparece no site)
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingAuction ? 'Atualizar' : 'Criar'} Leilão
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAuction(buildPreviewAuction())}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Pré-visualizar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingAuction(null);
                    setShowCreateForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}

          {loading && !showCreateForm && !editingAuction ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2 max-h-[500px] overflow-y-auto lg:col-span-2">
                {filteredAuctions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum leilão cadastrado
                  </div>
                ) : (
                  filteredAuctions.map((auction) => (
                    <div
                      key={auction.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-black">{auction.title}</h4>
                            {getStatusBadge(auction.status)}
                            {!auction.active && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                                Inativo
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Award size={14} />
                              <span>{auction.breed}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>{auction.date_display || `${auction.start_date} a ${auction.end_date}`}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditAuction(auction)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(auction.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 max-h-[500px] overflow-y-auto">
                <h4 className="text-sm font-semibold text-black flex items-center justify-between">
                  Cliques por Leilão
                  <span className="text-[11px] text-gray-500">
                    {statsPeriod === 'all' ? 'Todo período' : `Últimos ${statsPeriod.replace('d', ' dias')}`}
                  </span>
                </h4>
                {loadingClicks ? (
                  <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                    Carregando cliques...
                  </div>
                ) : !auctionClicks || auctionClicks.length === 0 ? (
                  <div className="py-4 text-xs text-gray-500">
                    Ainda não há cliques registrados nos botões de leilão.
                  </div>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {auctionClicks.map((item) => (
                      <li
                        key={item.auction_id}
                        className="flex items-center justify-between border border-gray-100 rounded-md px-2 py-1.5"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-gray-800 truncate">{item.title}</p>
                          <p className="text-[11px] text-gray-500">
                            {item.total_clicks} clique{item.total_clicks !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          ID {item.auction_id}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
  );

  // Se usar modal, envolver em Modal; senão, retornar conteúdo direto
  if (useModal && onClose) {
    return (
      <>
        <Modal isOpen={true} onClose={onClose} title="Cadastro de Leilões">
          {content}
        </Modal>
        {previewAuction && (
          <Modal
            isOpen={true}
            onClose={() => setPreviewAuction(null)}
            title="Pré-visualização do Leilão"
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="relative h-56 bg-gray-100">
                {previewAuction.image_path ? (
                  <img
                    src={previewAuction.image_path}
                    alt={previewAuction.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Nenhuma imagem selecionada
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(previewAuction.status)}
                  {!previewAuction.active && (
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-lg font-bold text-black uppercase">{previewAuction.title}</h4>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Award size={14} />
                  {previewAuction.breed}
                </p>
                {previewAuction.date_display && (
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Calendar size={14} />
                    {previewAuction.date_display}
                  </p>
                )}
              </div>
            </div>
          </Modal>
        )}
        {showDeleteConfirm && (
          <Modal
            isOpen={true}
            onClose={() => setShowDeleteConfirm(null)}
            title="Confirmar Exclusão"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Tem certeza que deseja deletar este leilão? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteAuction(showDeleteConfirm)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Deletando...' : 'Deletar'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  // Versão sem modal (para Dashboard)
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-black">Leilões</h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1">Gerencie os leilões exibidos no site</p>
      </div>
      <div className="p-4 md:p-6">
        {content}
      </div>
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja deletar este leilão? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteAuction(showDeleteConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Deletando...' : 'Deletar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
      {previewAuction && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewAuction(null)}
          title="Pré-visualização do Leilão"
        >
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="relative h-56 bg-gray-100">
              {previewAuction.image_path ? (
                <img
                  src={previewAuction.image_path}
                  alt={previewAuction.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Nenhuma imagem selecionada
                </div>
              )}
              <div className="absolute top-4 right-4">
                {getStatusBadge(previewAuction.status)}
                {!previewAuction.active && (
                  <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                    Inativo
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="text-lg font-bold text-black uppercase">{previewAuction.title}</h4>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Award size={14} />
                {previewAuction.breed}
              </p>
              {previewAuction.date_display && (
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar size={14} />
                  {previewAuction.date_display}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
