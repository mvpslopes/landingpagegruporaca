import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usando valores de exemplo
// Em produção, essas variáveis devem estar em um arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dados fictícios para demonstração (mock data)
export const mockUsers = [
  {
    id: '1',
    email: 'admin@gruporaca.com.br',
    password: 'admin123', // Em produção, nunca armazene senhas em texto plano
    name: 'Administrador',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'teste@gruporaca.com.br',
    password: 'teste123',
    name: 'Usuário de Teste',
    role: 'user',
    created_at: new Date().toISOString()
  }
];

export const mockAuctions = [
  {
    id: '1',
    title: 'Leilão Elite 2024',
    date: '2024-12-15',
    location: 'Belo Horizonte, MG',
    status: 'em_breve',
    total_animals: 120,
    registered_bidders: 45,
    created_at: '2024-11-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Leilão Primavera',
    date: '2024-11-20',
    location: 'São Paulo, SP',
    status: 'no_ar',
    total_animals: 85,
    registered_bidders: 32,
    created_at: '2024-10-15T10:00:00Z'
  },
  {
    id: '3',
    title: 'Leilão Especial',
    date: '2025-01-05',
    location: 'Rio de Janeiro, RJ',
    status: 'em_breve',
    total_animals: 95,
    registered_bidders: 28,
    created_at: '2024-11-10T10:00:00Z'
  }
];

export const mockAnimals = [
  {
    id: '1',
    auction_id: '1',
    name: 'Thunder Storm',
    breed: 'Quarto de Milha',
    age: 5,
    gender: 'Macho',
    price: 85000,
    owner: 'Fazenda Santa Maria',
    status: 'disponivel',
    created_at: '2024-11-01T10:00:00Z'
  },
  {
    id: '2',
    auction_id: '1',
    name: 'Golden Star',
    breed: 'Árabe',
    age: 4,
    gender: 'Fêmea',
    price: 120000,
    owner: 'Haras Elite',
    status: 'disponivel',
    created_at: '2024-11-01T10:00:00Z'
  },
  {
    id: '3',
    auction_id: '2',
    name: 'Black Diamond',
    breed: 'Puro Sangue Inglês',
    age: 6,
    gender: 'Macho',
    price: 95000,
    owner: 'Cabanha Real',
    status: 'reservado',
    created_at: '2024-10-15T10:00:00Z'
  },
  {
    id: '4',
    auction_id: '2',
    name: 'Silver Moon',
    breed: 'Mangalarga Marchador',
    age: 3,
    gender: 'Fêmea',
    price: 65000,
    owner: 'Fazenda São José',
    status: 'disponivel',
    created_at: '2024-10-15T10:00:00Z'
  }
];

export const mockBidders = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(31) 99999-1111',
    cpf: '123.456.789-00',
    registered_auctions: ['1', '2'],
    total_bids: 5,
    created_at: '2024-10-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 99999-2222',
    cpf: '987.654.321-00',
    registered_auctions: ['1'],
    total_bids: 3,
    created_at: '2024-10-05T10:00:00Z'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    phone: '(21) 99999-3333',
    cpf: '456.789.123-00',
    registered_auctions: ['2'],
    total_bids: 2,
    created_at: '2024-10-10T10:00:00Z'
  }
];

// Função de autenticação mockada
export async function signIn(email: string, password: string) {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return { data: { user: userWithoutPassword }, error: null };
  }
  return { data: { user: null }, error: { message: 'Email ou senha incorretos' } };
}

// Função para obter dados
export async function getAuctions() {
  return { data: mockAuctions, error: null };
}

export async function getAnimals(auctionId?: string) {
  const animals = auctionId 
    ? mockAnimals.filter(a => a.auction_id === auctionId)
    : mockAnimals;
  return { data: animals, error: null };
}

export async function getBidders() {
  return { data: mockBidders, error: null };
}

