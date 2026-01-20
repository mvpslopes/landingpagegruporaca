/**
 * Google Drive Direct Upload Utility
 * 
 * Faz upload direto do navegador para Google Drive sem passar pelo servidor
 */

// Configuração do OAuth (vem do backend)
const GOOGLE_CLIENT_ID = 'REDACTED-CLIENT-ID.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file';

// Cache do token de acesso
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

/**
 * Inicializar Google Drive API (não necessário mais, mas mantido para compatibilidade)
 */
export async function initGoogleDriveAPI(): Promise<boolean> {
  // Não precisamos mais inicializar auth2, pois usamos token centralizado
  // Mas mantemos a função para compatibilidade
  return true;
}

/**
 * Verificar se token centralizado está disponível
 */
export async function isAuthenticated(): Promise<boolean> {
  // Sempre verificar com o servidor (token centralizado)
  try {
    const response = await fetch('/api/get-drive-token.php', {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Obter token de acesso centralizado do servidor
 */
export async function getAccessToken(): Promise<string | null> {
  // Verificar cache
  if (cachedAccessToken && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }

  try {
    // Obter token centralizado do servidor
    const response = await fetch('/api/get-drive-token.php', {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao obter token');
    }

    const data = await response.json();
    cachedAccessToken = data.access_token;
    // Token expira em expires_in segundos, renovar 5 minutos antes
    const expiresIn = (data.expires_in || 3600) - 300;
    tokenExpiryTime = Date.now() + expiresIn * 1000;

    return cachedAccessToken;
  } catch (error: any) {
    console.error('Erro ao obter token:', error);
    return null;
  }
}

/**
 * Verificar se Google Drive está autorizado (token centralizado)
 */
export async function checkAuthorization(): Promise<boolean> {
  try {
    const response = await fetch('/api/get-drive-token.php', {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Fazer logout (não aplicável para token centralizado)
 */
export async function signOut(): Promise<void> {
  // Token centralizado não pode ser revogado pelo usuário individual
  // Apenas admin pode revogar
  cachedAccessToken = null;
  tokenExpiryTime = 0;
}

/**
 * Obter ID da pasta no Google Drive
 * Usa backend para buscar pasta (mais confiável, suporta Shared Drives)
 */
async function getFolderId(folderPath: string, accessToken: string): Promise<string> {
  // Se for pasta raiz, buscar do backend
  if (folderPath === '*') {
    try {
      const response = await fetch('/api/folders.php?action=getFolderId&path=*', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.folderId) {
          return data.folderId;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar root folder ID do backend, usando fallback');
    }
    // Fallback: usar ID do config (hardcoded como último recurso)
    return '1bXf338lIktS_6ss1-WoKuMfI-gpWryjn';
  }

  try {
    // Usar backend para buscar pasta (mais confiável, suporta Shared Drives e case-insensitive)
    console.log(`🔍 Buscando pasta: '${folderPath}' via backend...`);
    const response = await fetch(`/api/folders.php?action=getFolderId&path=${encodeURIComponent(folderPath)}`, {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.folderId) {
        if (data.warning) {
          console.warn(`⚠️ ${data.warning}`);
        } else {
          console.log(`✅ Pasta encontrada via backend: '${folderPath}' → ID: ${data.folderId}`);
        }
        return data.folderId;
      } else {
        console.warn('⚠️ Backend não retornou folderId');
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`⚠️ Erro ao buscar pasta via backend: ${response.status} - ${errorData.error || 'Erro desconhecido'}`);
    }

    // Se backend retornou erro, tentar busca direta como fallback
    console.warn('Backend não retornou folderId, tentando busca direta via API...');
    
    // Se folderPath contém '/', buscar pasta recursivamente
    const parts = folderPath.split('/').filter(p => p);
    let currentFolderId = '1bXf338lIktS_6ss1-WoKuMfI-gpWryjn'; // Começar na raiz

    for (const folderName of parts) {
      // Buscar todas as pastas na pasta atual
      // Usar supportsAllDrives para suportar Shared Drives
      const query = `'${currentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      
      // Adicionar corpora=allDrives para buscar em Shared Drives
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true&corpora=allDrives`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Erro ao buscar pasta '${folderName}': ${response.status} - ${errorText}`);
        break;
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        // Comparar case-insensitive (normalizar para maiúsculas)
        const normalizedSearchName = folderName.toUpperCase().trim();
        const found = data.files.find((f: any) => {
          const normalizedFileName = f.name.toUpperCase().trim();
          return normalizedFileName === normalizedSearchName;
        });
        
        if (found) {
          currentFolderId = found.id;
          console.log(`✅ Pasta encontrada: '${folderName}' (ID: ${found.id})`);
        } else {
          // Listar pastas disponíveis para debug
          const availableFolders = data.files.map((f: any) => f.name).join(', ');
          console.warn(`⚠️ Pasta '${folderName}' não encontrada. Pastas disponíveis: ${availableFolders}`);
          console.warn(`⚠️ Usando pasta pai (ID: ${currentFolderId})`);
          break;
        }
      } else {
        console.warn(`⚠️ Nenhuma pasta encontrada em '${currentFolderId}'`);
        break;
      }
    }

    return currentFolderId;
  } catch (error: any) {
    console.error('❌ Erro ao buscar pasta:', error);
    // Em caso de erro, tentar obter root folder ID do backend
    try {
      const response = await fetch('/api/folders.php?action=getFolderId&path=*', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.folderId) {
          console.warn('⚠️ Retornando pasta raiz devido ao erro');
          return data.folderId;
        }
      }
    } catch (rootError) {
      console.warn('⚠️ Erro ao buscar root folder ID, usando fallback');
    }
    // Fallback: usar ID hardcoded como último recurso
    return '1bXf338lIktS_6ss1-WoKuMfI-gpWryjn';
  }
}

/**
 * Criar sessão de upload resumável
 */
async function createResumableUploadSession(
  fileName: string,
  mimeType: string,
  folderId: string,
  accessToken: string
): Promise<string> {
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  // Adicionar supportsAllDrives=true para suportar Shared Drives
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': '0', // Será atualizado durante upload
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao criar sessão de upload: ${response.status} - ${error}`);
  }

  const uploadUrl = response.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('URL de upload não retornada');
  }

  return uploadUrl;
}

/**
 * Fazer upload em chunks para Google Drive
 * Suporta recriação de sessão se expirar (404)
 */
async function uploadChunks(
  file: File,
  uploadUrl: string,
  accessToken: string,
  fileName: string,
  mimeType: string,
  folderId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const CHUNK_SIZE = 256 * 1024; // 256KB por chunk
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedBytes = 0;
  let currentUploadUrl = uploadUrl; // Pode ser recriada se expirar

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const rangeStart = start;
    const rangeEnd = end - 1;
    const contentLength = end - start;

    let retries = 5;
    let success = false;
    let lastError: Error | null = null;

    while (retries > 0 && !success) {
      try {
        const response = await fetch(currentUploadUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Length': contentLength.toString(),
            'Content-Range': `bytes ${rangeStart}-${rangeEnd}/${file.size}`,
          },
          body: chunk,
        });

        if (response.status === 308) {
          // Upload parcial bem-sucedido, continuar
          success = true;
          uploadedBytes += contentLength;
          
          if (onProgress) {
            const progress = Math.round((uploadedBytes / file.size) * 100);
            onProgress(progress);
          }
        } else if (response.status === 200 || response.status === 201) {
          // Upload completo
          const fileData = await response.json();
          if (onProgress) {
            onProgress(100);
          }
          return fileData.id;
        } else if (response.status === 404) {
          // Sessão de upload expirada - recriar sessão
          console.warn(`⚠️ Sessão de upload expirada (404) no chunk ${chunkIndex + 1}/${totalChunks}. Recriando sessão...`);
          
          // Se já enviamos muitos chunks, recriar sessão e recomeçar pode ser melhor
          // Mas vamos tentar recriar e continuar
          if (chunkIndex === 0 || retries > 2) {
            // Primeiro chunk ou muitas tentativas - apenas recriar e tentar novamente
            try {
              const newUploadUrl = await createResumableUploadSession(
                fileName,
                mimeType,
                folderId,
                accessToken
              );
              currentUploadUrl = newUploadUrl;
              console.log(`✅ Sessão recriada. Tentando novamente chunk ${chunkIndex + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue; // Tentar novamente sem decrementar retries
            } catch (recreateError: any) {
              lastError = new Error(`Erro ao recriar sessão de upload: ${recreateError.message}`);
              retries--;
              if (retries === 0) {
                throw lastError;
              }
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } else {
            // Chunks intermediários - recriar sessão e tentar novamente
            try {
              // Tentar renovar token antes de recriar sessão
              try {
                const newToken = await getAccessToken();
                if (newToken && newToken !== accessToken) {
                  accessToken = newToken;
                  console.log('✅ Token renovado antes de recriar sessão');
                }
              } catch (tokenError) {
                console.warn('⚠️ Não foi possível renovar token');
              }
              
              const newUploadUrl = await createResumableUploadSession(
                fileName,
                mimeType,
                folderId,
                accessToken
              );
              currentUploadUrl = newUploadUrl;
              console.log(`✅ Sessão recriada. Tentando novamente chunk ${chunkIndex + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue; // Tentar novamente sem decrementar retries
            } catch (recreateError: any) {
              lastError = new Error(`Erro ao recriar sessão: ${recreateError.message}`);
              retries--;
              if (retries === 0) {
                throw lastError;
              }
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        } else if (response.status === 503) {
          // Service Unavailable - erro temporário do Google
          lastError = new Error(`Google Drive temporariamente indisponível (503). Tentando novamente... (${6 - retries}/5)`);
          retries--;
          
          if (retries > 0) {
            // Aguardar mais tempo para erro 503 (backoff exponencial mais agressivo)
            const waitTime = Math.min(5000 * Math.pow(2, 5 - retries), 60000); // Máximo 60 segundos
            console.warn(`⏳ Google Drive indisponível (503). Aguardando ${Math.round(waitTime/1000)}s antes de tentar novamente... (${6 - retries}/5)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Se ainda temos retries e é um erro 503 persistente, tentar renovar token
            if (retries > 0) {
              try {
                console.log('🔄 Tentando renovar token de acesso...');
                const newToken = await getAccessToken();
                if (newToken && newToken !== accessToken) {
                  // Token foi renovado, atualizar
                  accessToken = newToken;
                  console.log('✅ Token renovado com sucesso');
                }
              } catch (tokenError) {
                console.warn('⚠️ Não foi possível renovar token:', tokenError);
              }
            }
          } else {
            // Última tentativa falhou - lançar erro mais descritivo
            throw new Error('Google Drive está temporariamente indisponível (503). O serviço pode estar sobrecarregado. Por favor, tente novamente em alguns minutos.');
          }
        } else {
          const errorText = await response.text();
          let errorMessage = `Erro no upload: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorMessage;
          } catch {
            errorMessage += ` - ${errorText.substring(0, 200)}`;
          }
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        lastError = error;
        retries--;
        if (retries === 0) {
          throw new Error(`Erro ao fazer upload do chunk ${chunkIndex + 1}/${totalChunks}: ${error.message || error}`);
        }
        // Aguardar antes de tentar novamente (backoff exponencial)
        const waitTime = Math.min(1000 * Math.pow(2, 5 - retries), 5000); // Máximo 5 segundos
        console.warn(`⏳ Erro no chunk ${chunkIndex + 1}, aguardando ${waitTime}ms antes de tentar novamente... (${6 - retries}/5)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (!success) {
      throw lastError || new Error(`Falha ao fazer upload do chunk ${chunkIndex + 1}/${totalChunks} após 5 tentativas`);
    }
  }

  throw new Error('Upload não completado');
}

/**
 * Upload simples (multipart) para arquivos pequenos
 * Com retry automático para erros temporários
 */
async function uploadFileSimple(
  file: File,
  folderId: string,
  accessToken: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const result = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.id);
            } catch (e) {
              reject(new Error('Erro ao processar resposta do upload'));
            }
          } else if (xhr.status === 503) {
            // Service Unavailable - tentar novamente
            reject(new Error('503_SERVICE_UNAVAILABLE'));
          } else if (xhr.status === 404) {
            // 404 pode ser pasta não encontrada ou token inválido
            let errorMessage = 'Pasta não encontrada ou sem permissão de acesso';
            try {
              const error = JSON.parse(xhr.responseText);
              errorMessage = error.error?.message || errorMessage;
            } catch {
              errorMessage += ` - ${xhr.responseText?.substring(0, 200) || 'Erro desconhecido'}`;
            }
            reject(new Error(`404_NOT_FOUND:${errorMessage}`));
          } else {
            let errorMessage = `Erro no upload: ${xhr.status}`;
            try {
              const error = JSON.parse(xhr.responseText);
              errorMessage = error.error?.message || errorMessage;
            } catch {
              errorMessage += ` - ${xhr.responseText?.substring(0, 200) || 'Erro desconhecido'}`;
            }
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede durante upload'));
        });

        // Adicionar supportsAllDrives=true para suportar Shared Drives
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true');
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.send(formData);
      });

      return result;
    } catch (error: any) {
      lastError = error;
      retries--;

      // Tratar diferentes tipos de erro
      if (error.message === '503_SERVICE_UNAVAILABLE' && retries > 0) {
        // Service Unavailable - tentar renovar token e tentar novamente
        console.warn(`⚠️ Google Drive indisponível (503). Tentando renovar token e tentar novamente... (${4 - retries}/3)`);
        
        try {
          const newToken = await getAccessToken();
          if (newToken && newToken !== accessToken) {
            accessToken = newToken;
            console.log('✅ Token renovado');
          }
        } catch (tokenError) {
          console.warn('⚠️ Não foi possível renovar token');
        }

        // Aguardar antes de tentar novamente (backoff exponencial)
        const waitTime = Math.min(3000 * Math.pow(2, 3 - retries), 15000); // Máximo 15 segundos
        console.warn(`⏳ Aguardando ${Math.round(waitTime/1000)}s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (error.message?.startsWith('404_NOT_FOUND:') && retries > 0) {
        // 404 - Pasta não encontrada ou sem permissão - tentar renovar token
        console.warn(`⚠️ Erro 404 (pasta não encontrada ou sem permissão). Tentando renovar token... (${4 - retries}/3)`);
        
        try {
          const newToken = await getAccessToken();
          if (newToken && newToken !== accessToken) {
            accessToken = newToken;
            console.log('✅ Token renovado');
          }
        } catch (tokenError) {
          console.warn('⚠️ Não foi possível renovar token');
        }

        // Aguardar antes de tentar novamente
        const waitTime = 2000;
        console.warn(`⏳ Aguardando ${waitTime}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (retries === 0) {
        throw lastError || new Error('Erro ao fazer upload após 3 tentativas');
      } else {
        // Outros erros - aguardar um pouco e tentar novamente
        const waitTime = 2000;
        console.warn(`⏳ Erro no upload, aguardando ${waitTime}ms antes de tentar novamente... (${4 - retries}/3)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Upload falhou após 3 tentativas');
}

/**
 * Fazer upload direto para Google Drive
 * Usa token OAuth centralizado (conta com 1TB)
 * Para arquivos pequenos (< 10MB), usa upload simples (multipart)
 * Para arquivos grandes, usa upload resumável
 */
export async function uploadFileToDrive(
  file: File,
  folderPath: string,
  onProgress?: (progress: number) => void
): Promise<{ id: string; name: string; webViewLink: string; webContentLink: string }> {
  // 1. Verificar autenticação (token centralizado)
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error('Google Drive não autorizado. Um administrador precisa autorizar o acesso OAuth primeiro. Acesse: /api/oauth-drive.php');
  }

  // 2. Obter token de acesso centralizado
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Não foi possível obter token de acesso. Verifique se o Google Drive está autorizado.');
  }

  // 3. Obter ID da pasta
  const folderId = await getFolderId(folderPath, accessToken);

  // 4. Decidir entre upload simples ou resumável
  const FILE_SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB
  const useSimpleUpload = file.size < FILE_SIZE_THRESHOLD;

  if (useSimpleUpload) {
    // Upload simples (multipart) para arquivos pequenos - mais rápido e confiável
    console.log(`📤 Usando upload simples (multipart) para arquivo de ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (onProgress) {
      onProgress(0);
    }

    const fileId = await uploadFileSimple(file, folderId, accessToken, onProgress);
    
    if (onProgress) {
      onProgress(100);
    }
    
    // Obter informações do arquivo (adicionar supportsAllDrives para Shared Drives)
    const fileInfoResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink&supportsAllDrives=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!fileInfoResponse.ok) {
      throw new Error('Erro ao obter informações do arquivo');
    }

    const fileInfo = await fileInfoResponse.json();

    return {
      id: fileInfo.id,
      name: fileInfo.name,
      webViewLink: fileInfo.webViewLink || '',
      webContentLink: fileInfo.webContentLink || '',
    };
  } else {
    // Upload resumável para arquivos grandes
    console.log(`📤 Usando upload resumável para arquivo de ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (onProgress) {
      onProgress(0);
    }

    const uploadUrl = await createResumableUploadSession(
      file.name,
      file.type || 'application/octet-stream',
      folderId,
      accessToken
    );

    if (onProgress) {
      onProgress(5);
    }

    // Fazer upload em chunks (passar parâmetros necessários para recriar sessão se expirar)
    const fileId = await uploadChunks(
      file, 
      uploadUrl, 
      accessToken,
      file.name,
      file.type || 'application/octet-stream',
      folderId,
      (progress) => {
        // Ajustar progresso: 5% para setup, 95% para upload
        if (onProgress) {
          onProgress(5 + Math.round(progress * 0.95));
        }
      }
    );

    // 6. Obter informações do arquivo (adicionar supportsAllDrives para Shared Drives)
    const fileInfoResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink&supportsAllDrives=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!fileInfoResponse.ok) {
      throw new Error('Erro ao obter informações do arquivo');
    }

    const fileInfo = await fileInfoResponse.json();

    return {
      id: fileInfo.id,
      name: fileInfo.name,
      webViewLink: fileInfo.webViewLink || '',
      webContentLink: fileInfo.webContentLink || '',
    };
  }
}

// Declaração de tipos para window.gapi
declare global {
  interface Window {
    gapi: any;
  }
}
