/**
 * API Client para o Sistema de Banco de Dados
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'root' | 'admin' | 'viewer' | 'user';
  folder: string;
  permissions: {
    upload: boolean;
    download: boolean;
    delete: boolean;
    view_all: boolean;
    manage_users: boolean;
    manage_permissions: boolean;
  };
}

interface FileItem {
  id: string;
  name: string;
  url?: string;
  size: string;
  uploaded_at: string;
  uploaded_by: string;
  folder: string;
  tags?: string[];
  mimeType?: string;
  downloadLink?: string;
  viewLink?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
  user?: User;
  users?: User[];
  files?: FileItem[];
  message?: string;
}

/**
 * Autenticação
 */
export async function login(email: string, password: string): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer login');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao conectar com o servidor' };
  }
}

export async function logout(): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=logout`, {
      method: 'POST',
      credentials: 'include',
    });

    return await response.json();
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer logout' };
  }
}

export async function checkAuth(): Promise<ApiResponse<User & { last_activity?: number; timeout?: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=check`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'Não autenticado' };
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao verificar autenticação' };
  }
}

export async function cleanupExpiredSessions(): Promise<ApiResponse<{ cleaned: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=cleanup_expired`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao limpar sessões expiradas');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao limpar sessões expiradas' };
  }
}

/**
 * Usuários (apenas ROOT)
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users.php`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao listar usuários');
    }

    return { users: data.users || [] };
  } catch (error: any) {
    return { error: error.message || 'Erro ao listar usuários' };
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role: 'root' | 'admin' | 'viewer' | 'user';
  folder?: string;
}): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar usuário');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar usuário' };
  }
}

export async function updateUser(userId: number, userData: {
  name?: string;
  email?: string;
  password?: string;
  role?: 'root' | 'admin' | 'viewer' | 'user';
  folder?: string;
}): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users.php`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: userId, ...userData }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar usuário');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar usuário' };
  }
}

export async function deleteUser(userId: number): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users.php?id=${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao deletar usuário');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao deletar usuário' };
  }
}

/**
 * Pastas
 */
interface Folder {
  id: string;
  name: string;
  path: string;
}

export async function getFolders(): Promise<ApiResponse<{ folders: Folder[] }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/folders.php`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro na resposta de pastas:', data);
      // Retornar pelo menos "Todas" em caso de erro
      return { folders: [{ id: '*', name: 'Todas', path: '*' }] };
    }

    // Verificar se data.folders existe
    if (data.folders && Array.isArray(data.folders)) {
      return { folders: data.folders };
    }
    
    // Se não tiver pastas, retornar pelo menos "Todas"
    return { folders: [{ id: '*', name: 'Todas', path: '*' }] };
  } catch (error: any) {
    console.error('Erro ao buscar pastas:', error);
    // Em caso de erro, retornar pelo menos "Todas"
    return { folders: [{ id: '*', name: 'Todas', path: '*' }] };
  }
}

/**
 * Arquivos
 */
export async function getFiles(folder: string = '*'): Promise<ApiResponse<FileItem[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/files.php?folder=${encodeURIComponent(folder)}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao listar arquivos');
    }

    return { files: data.files || [] };
  } catch (error: any) {
    return { error: error.message || 'Erro ao listar arquivos' };
  }
}

export async function uploadFile(
  file: File, 
  folder: string, 
  onProgress?: (progress: number) => void
): Promise<ApiResponse<FileItem>> {
  try {
    // Tamanho do chunk reduzido para 5MB (para evitar timeouts)
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    
    // Limite para decidir quando usar chunks (arquivos maiores que 100MB)
    const CHUNK_THRESHOLD = 100 * 1024 * 1024; // 100MB
    
    // Se o arquivo for menor ou igual a 100MB, usar upload simples
    if (file.size <= CHUNK_THRESHOLD) {
      return uploadFileSimple(file, folder, onProgress);
    }
    
    // Para arquivos grandes, usar upload em chunks de 5MB
    return uploadFileChunked(file, folder, CHUNK_SIZE, onProgress);
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer upload' };
  }
}

// Upload simples para arquivos pequenos
async function uploadFileSimple(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<FileItem>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Log para debug
      console.log('🚀 Iniciando upload:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        folder: folder
      });

      // Monitorar progresso do upload
      if (onProgress) {
        // Atualizar progresso inicial imediatamente
        onProgress(0);
        
        xhr.upload.addEventListener('loadstart', () => {
          console.log('📤 Upload iniciado, enviando dados...');
          onProgress(1); // Mostrar que começou
        });
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            const rounded = Math.round(percentComplete);
            onProgress(rounded);
            
            // Log a cada 10% para não poluir o console
            if (rounded % 10 === 0 || rounded < 5) {
              console.log(`📊 Progresso: ${rounded}% (${(e.loaded / 1024 / 1024).toFixed(2)} MB / ${(e.total / 1024 / 1024).toFixed(2)} MB)`);
            }
          } else {
            // Se não conseguir calcular, mostrar que está enviando
            onProgress(1);
          }
        });
      }

      // Tratar resposta
      xhr.addEventListener('load', () => {
        console.log('✅ Resposta recebida:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('✅ Upload concluído com sucesso');
            resolve(data);
          } catch (e) {
            console.error('❌ Erro ao processar resposta:', e);
            reject(new Error('Erro ao processar resposta do servidor'));
          }
        } else {
          console.error('❌ Erro HTTP:', xhr.status, xhr.statusText);
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || 'Erro ao fazer upload'));
          } catch (e) {
            if (xhr.status === 413) {
              const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
              reject(new Error(
                `ERRO 413: O servidor está rejeitando o upload do arquivo (${fileSizeMB} MB). ` +
                `O limite configurado no servidor é menor que o tamanho do arquivo. ` +
                `É necessário ajustar as configurações do servidor (php.ini, Apache/Nginx) para permitir arquivos maiores. ` +
                `Consulte o arquivo 'api/RESOLVER_ERRO_413.md' para instruções detalhadas.`
              ));
            } else {
              reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
            }
          }
        }
      });

      // Tratar erros
      xhr.addEventListener('error', (e) => {
        console.error('❌ Erro de rede:', e);
        reject(new Error('Erro de rede ao fazer upload. Verifique sua conexão.'));
      });

      xhr.addEventListener('abort', () => {
        console.warn('⚠️ Upload cancelado pelo usuário');
        reject(new Error('Upload cancelado'));
      });

      xhr.addEventListener('timeout', () => {
        console.error('❌ Timeout no upload');
        reject(new Error('Tempo limite excedido. O upload está demorando muito.'));
      });

      // Iniciar upload
      const uploadUrl = `${API_BASE_URL}/files.php`;
      console.log('🔗 Conectando com:', uploadUrl);
      
      xhr.open('POST', uploadUrl);
      xhr.withCredentials = true; // Incluir cookies
      
      // Configurar timeout (1 hora para arquivos grandes)
      xhr.timeout = 3600000; // 1 hora em milissegundos
      
      console.log('📤 Enviando arquivo...');
      xhr.send(formData);
    });
}

// Upload em chunks para arquivos grandes
async function uploadFileChunked(
  file: File,
  folder: string,
  chunkSize: number,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<FileItem>> {
  try {
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    console.log(`📦 Dividindo arquivo em ${totalChunks} chunks de ${(chunkSize / 1024 / 1024).toFixed(2)} MB cada`);
    console.log(`📁 Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Gerar ID único para este upload (usado para identificar chunks do mesmo arquivo)
    const uploadId = `${file.name}_${file.size}_${Date.now()}`;
    
    // Enviar cada chunk sequencialmente
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const chunkFormData = new FormData();
      chunkFormData.append('chunk', chunk);
      chunkFormData.append('chunkIndex', i.toString());
      chunkFormData.append('totalChunks', totalChunks.toString());
      chunkFormData.append('fileName', file.name);
      chunkFormData.append('fileSize', file.size.toString());
      chunkFormData.append('folder', folder);
      
      // Calcular progresso
      // 90% para upload dos chunks, 10% reservado para processamento final no servidor
      // Usar (i+1) para alinhar com o console (chunks iniciados)
      const chunksInProgress = i + 1; // Chunks iniciados (incluindo o atual)
      const progressPercent = (chunksInProgress / totalChunks) * 90; // 90% máximo até processar
      
      if (onProgress) {
        onProgress(Math.round(progressPercent));
      }
      
      const consoleProgressPercent = ((i + 1) / totalChunks * 100).toFixed(1);
      console.log(`📤 Enviando chunk ${i + 1}/${totalChunks} (${consoleProgressPercent}% do arquivo total)...`);
      
      // Tentar enviar chunk com retry (até 3 tentativas)
      let response;
      let retries = 3;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          // Criar novo controller para cada tentativa
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutos por chunk
          
          console.log(`📤 Tentando enviar chunk ${i + 1}/${totalChunks}... (tentativa ${4 - retries}/3)`);
          
          response = await fetch(`${API_BASE_URL}/upload-chunk.php`, {
            method: 'POST',
            credentials: 'include',
            body: chunkFormData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          // Se chegou aqui, a requisição foi bem-sucedida
          break;
        } catch (error: any) {
          lastError = error;
          retries--;
          
          if (error.name === 'AbortError') {
            console.warn(`⏱️ Timeout no chunk ${i + 1}, tentando novamente... (${retries} tentativas restantes)`);
          } else {
            console.warn(`⚠️ Erro ao enviar chunk ${i + 1}, tentando novamente... (${retries} tentativas restantes):`, error.message);
          }
          
          if (retries > 0) {
            // Aguardar antes de tentar novamente (backoff: 2s, 4s, 6s)
            const waitTime = 2000 * (4 - retries);
            console.log(`⏳ Aguardando ${waitTime / 1000}s antes de tentar novamente...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            throw new Error(`Falha ao enviar chunk ${i + 1} após 3 tentativas: ${error.message || 'Erro desconhecido'}`);
          }
        }
      }
      
      if (!response) {
        throw lastError || new Error(`Não foi possível enviar chunk ${i + 1}`);
      }
      
      if (!response.ok) {
        // Tratamento especial para erro 504 (Gateway Timeout)
        if (response.status === 504) {
          if (retries > 0) {
            console.warn(`⏱️ Gateway Timeout no chunk ${i + 1}, tentando novamente...`);
            retries--;
            const waitTime = 2000 * (4 - retries);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Tentar novamente
          } else {
            throw new Error(`Gateway Timeout: O servidor está demorando muito para processar o chunk ${i + 1}. Tente novamente mais tarde ou entre em contato com o suporte.`);
          }
        }
        
        const errorData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errorData.error || `Erro ao enviar chunk ${i + 1} (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      
      console.log(`📥 Resposta do chunk ${i + 1}/${totalChunks}:`, {
        complete: data.complete,
        receivedChunks: data.receivedChunks,
        totalChunks: data.totalChunks,
        success: data.success
      });
      
      // Se for o último chunk e estiver completo, retornar resultado
      if (data.complete === true && i === totalChunks - 1) {
        if (onProgress) {
          onProgress(100);
        }
        console.log('✅ Todos os chunks enviados e arquivo montado com sucesso');
        return data;
      }
      
      // Se recebeu todos os chunks mas não retornou complete, pode ser que o último chunk ainda está processando
      if (data.receivedChunks === data.totalChunks && i === totalChunks - 1) {
        console.log('⏳ Todos os chunks recebidos, aguardando processamento final...');
        // Aguardar um pouco e verificar novamente (o servidor pode estar processando)
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Se chegou aqui e ainda não retornou, algo deu errado
        if (!data.complete) {
          throw new Error('Todos os chunks foram enviados, mas o servidor não completou o processamento. Verifique os logs do servidor.');
        }
        return data;
      }
      
      // Após chunk ser enviado com sucesso, atualizar progresso
      if (onProgress) {
        const chunksCompleted = i + 1; // Chunks completados (incluindo o atual)
        const progressPercent = (chunksCompleted / totalChunks) * 90; // 90% máximo até processar
        
        // Atualizar progresso baseado em chunks completados
        onProgress(Math.round(progressPercent));
      }
      
      // Verificar se o servidor reporta que está faltando chunks
      if (data.receivedChunks < data.totalChunks && i === totalChunks - 1) {
        const missingChunks = data.totalChunks - data.receivedChunks;
        console.warn(`⚠️ Servidor reporta que faltam ${missingChunks} chunk(s). Chunks recebidos: ${data.receivedChunks}/${data.totalChunks}`);
        
        // Se faltam chunks, tentar reenviar os que estão faltando
        if (missingChunks > 0 && missingChunks <= 3) {
          console.log(`🔄 Tentando reenviar chunks faltantes...`);
          // Por enquanto, apenas logar - em uma versão futura podemos implementar reenvio automático
        }
      }
      
      // Pequeno delay entre chunks para evitar sobrecarga no servidor
      // Com chunks menores (5MB), podemos reduzir o delay
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms entre chunks
      }
    }
    
    // Se chegou aqui, algo deu errado
    console.error('❌ Loop de chunks terminou sem completar o upload');
    throw new Error('Upload em chunks não foi completado corretamente. Todos os chunks foram enviados, mas o servidor não retornou confirmação de conclusão.');
    
  } catch (error: any) {
    console.error('❌ Erro no upload em chunks:', error);
    throw error;
  }
}

export async function deleteFile(fileId: string, folder: string, type: 'file' | 'folder' = 'file'): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/files.php?id=${encodeURIComponent(fileId)}&folder=${encodeURIComponent(folder)}&type=${type}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao deletar arquivo');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao deletar arquivo' };
  }
}

export async function renameFile(fileId: string, newName: string, folder: string, type: 'file' | 'folder'): Promise<ApiResponse<FileItem>> {
  try {
    const response = await fetch(`${API_BASE_URL}/files.php`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: fileId, name: newName, folder, type }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao renomear');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao renomear' };
  }
}

export async function moveFile(fileId: string, fromFolder: string, toFolder: string, type: 'file' | 'folder'): Promise<ApiResponse<FileItem>> {
  try {
    const response = await fetch(`${API_BASE_URL}/files.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: fileId, fromFolder, toFolder, type }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao mover arquivo');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao mover arquivo' };
  }
}

/**
 * Criar Subpasta
 */
export async function createFolder(folderName: string, parentFolder: string): Promise<ApiResponse<{ folder: Folder }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/create-folder.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ folderName, parentFolder }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar pasta');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar pasta' };
  }
}

/**
 * OAuth Google Drive
 */
export async function checkOAuthStatus(): Promise<ApiResponse<{ hasToken: boolean; tokenInfo?: any; canAuthorize: boolean }>> {
  try {
    const formData = new FormData();
    formData.append('action', 'check');

    const response = await fetch(`${API_BASE_URL}/oauth-drive.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao verificar status OAuth');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao verificar status OAuth' };
  }
}

export async function getOAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/oauth-drive.php`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao obter URL de autorização');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao obter URL de autorização' };
  }
}

export async function revokeOAuth(): Promise<ApiResponse<null>> {
  try {
    const formData = new FormData();
    formData.append('action', 'revoke');

    const response = await fetch(`${API_BASE_URL}/oauth-drive.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao revogar autorização');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao revogar autorização' };
  }
}

/**
 * Upload direto para Google Drive (do navegador)
 * Usa token OAuth centralizado (conta com 1TB)
 * Registra metadados no servidor após upload
 */
export async function uploadFileDirectToDrive(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<FileItem>> {
  try {
    // Importar utilitário do Google Drive
    const { 
      checkAuthorization,
      uploadFileToDrive 
    } = await import('./googleDrive');

    // Verificar se Google Drive está autorizado (token centralizado)
    const isAuthorized = await checkAuthorization();
    if (!isAuthorized) {
      throw new Error('Google Drive não autorizado. Um administrador precisa autorizar o acesso OAuth primeiro. Acesse: /api/oauth-drive.php');
    }

    // Fazer upload direto para Google Drive usando token centralizado
    const driveFile = await uploadFileToDrive(file, folder, onProgress);

    // Registrar metadados no servidor
    const registerResponse = await fetch(`${API_BASE_URL}/register-drive-file.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: driveFile.id,
        name: file.name,
        folder: folder,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        webViewLink: driveFile.webViewLink,
        webContentLink: driveFile.webContentLink,
      }),
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      throw new Error(errorData.error || 'Erro ao registrar arquivo no servidor');
    }

    const registeredData = await registerResponse.json();

    return {
      id: driveFile.id,
      name: file.name,
      type: 'file',
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      viewLink: driveFile.webViewLink,
      downloadLink: driveFile.webContentLink,
      url: driveFile.webViewLink,
      folder: folder,
    };
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer upload direto' };
  }
}

/**
 * Estatísticas (apenas admin/root)
 */
export async function getStatistics(action: string, period: string = '7d'): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics.php?action=${action}&period=${period}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar estatísticas');
    }

    return { data };
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar estatísticas' };
  }
}

export type { User, FileItem, ApiResponse, Folder };

