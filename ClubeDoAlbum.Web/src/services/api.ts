import axios from 'axios';
import type {
  Album,
  AlbumDetail,
  CuratorRankingItem,
  RankingItem,
  Review,
  SpotifySearchResult,
  User,
  UserReviewDetail,
  Edicao,
  MembroIndicacoesStatus,
} from '../types';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5046/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_clube_do_album');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, senha: string) => {
    const res = await api.post<{ token: string; usuario: User }>('/auth/login', { email, senha });
    return res.data;
  },
  register: async (dados: { nome: string; email: string; senha: string; avatarUrl?: string }) => {
    const res = await api.post<{ token: string; usuario: User }>('/auth/register', dados);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  getAllUsers: async () => {
    const res = await api.get<User[]>('/auth/users');
    return res.data;
  },
  updateProfile: async (dados: { nome: string; avatarUrl?: string }) => {
    const res = await api.put<User>('/auth/profile', dados);
    return res.data;
  },
  updatePassword: async (dados: { senhaAtual?: string; novaSenha: string }) => {
    const res = await api.put<{ message: string }>('/auth/password', dados);
    return res.data;
  },
};

// Albums API
export const albumsApi = {
  getAlbums: async (params?: { status?: string; edicaoId?: string; userId?: string }) => {
    const res = await api.get<Album[]>('/albums', { params });
    return res.data;
  },
  getAlbumById: async (id: string) => {
    const res = await api.get<AlbumDetail>(`/albums/${id}`);
    return res.data;
  },
  createAlbum: async (data: {
    spotifyInput?: string;
    titulo?: string;
    artista?: string;
    anoLancamento?: number;
    capaUrl?: string;
    spotifyUrl?: string;
    spotifyId?: string;
    edicaoId?: string;
    indicadoPorUserId?: string;
    status?: string;
  }) => {
    const res = await api.post<Album>('/albums', data);
    return res.data;
  },
  createRetroativo: async (data: {
    spotifyInput?: string;
    spotifyId?: string;
    titulo?: string;
    artista?: string;
    anoLancamento?: number;
    capaUrl?: string;
    spotifyUrl?: string;
    indicadoPorNome?: string;
    indicadoPorUserId?: string;
    temaEdicao?: string;

    numeroEdicao?: number;
    dataReuniao?: string;
    avaliacoes: Array<{
      nomeUsuario?: string;
      userId?: string;
      nota: number;
      comentario?: string;
    }>;
  }) => {
    const res = await api.post<AlbumDetail>('/albums/retroativo', data);
    return res.data;
  },
  updateStatus: async (id: string, status: 'EstaSemana' | 'JaOuvido', edicaoId?: string) => {
    const res = await api.patch(`/albums/${id}/status`, { status, edicaoId });
    return res.data;
  },
  deleteAlbum: async (id: string) => {
    await api.delete(`/albums/${id}`);
  },
};

// Reviews API
export const reviewsApi = {
  createReview: async (data: { albumId: string; nota: number; comentario?: string; userId?: string }) => {
    const res = await api.post<Review>('/reviews', data);
    return res.data;
  },
  getReviewsByAlbum: async (albumId: string) => {
    const res = await api.get<Review[]>(`/reviews/album/${albumId}`);
    return res.data;
  },
  getReviewsByUser: async (userId: string) => {
    const res = await api.get<UserReviewDetail[]>(`/reviews/user/${userId}`);
    return res.data;
  },
};

// Ranking API
export const rankingApi = {
  getRanking: async (apenasAvaliados: boolean = true) => {
    const res = await api.get<RankingItem[]>('/ranking', { params: { apenasAvaliados } });
    return res.data;
  },
  getCurators: async (ordem: 'desc' | 'asc' = 'desc') => {
    const res = await api.get<CuratorRankingItem[]>('/ranking/curators', { params: { ordem } });
    return res.data;
  },
};

// Spotify API
export const spotifyApi = {
  resolve: async (input: string) => {
    const res = await api.get<SpotifySearchResult>('/spotify/resolve', { params: { input } });
    return res.data;
  },
  search: async (query: string, limit: number = 5) => {
    const res = await api.get<SpotifySearchResult[]>('/spotify/search', { params: { query, limit } });
    return res.data;
  },
};

// Edicoes API
export const edicoesApi = {
  getEdicoes: async () => {
    const res = await api.get<Edicao[]>('/edicoes');
    return res.data;
  },
  getEdicaoAtiva: async () => {
    const res = await api.get<Edicao | null>('/edicoes/ativa');
    return res.data;
  },
  getMembrosStatus: async () => {
    const res = await api.get<MembroIndicacoesStatus[]>('/edicoes/ativa/membros-status');
    return res.data;
  },
  createEdicao: async (dados: {
    numero?: number;
    tema: string;
    descricao?: string;
    dataReuniao?: string;
    ativarImediatamente?: boolean;
  }) => {
    const res = await api.post<Edicao>('/edicoes', dados);
    return res.data;
  },
  encerrarEdicao: async (id: string) => {
    const res = await api.post<Edicao>(`/edicoes/${id}/encerrar`);
    return res.data;
  },
  ativarEdicao: async (id: string) => {
    const res = await api.post<Edicao>(`/edicoes/${id}/ativar`);
    return res.data;
  },
};
