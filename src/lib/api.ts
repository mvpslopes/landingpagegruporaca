/**
 * API Client para o Sistema de Banco de Dados
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'root' | 'admin' | 'user';
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

export async function checkAuth(): Promise<ApiResponse<User>> {
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
  role: 'root' | 'admin' | 'user';
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

export async function uploadFile(file: File, folder: string): Promise<ApiResponse<FileItem>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${API_BASE_URL}/files.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer upload');
    }

    return data;
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer upload' };
  }
}

export async function deleteFile(fileId: string, folder: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/files.php?id=${encodeURIComponent(fileId)}&folder=${encodeURIComponent(folder)}`, {
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

