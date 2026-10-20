export type AlbumStatus = 'EstaSemana' | 'JaOuvido';

export type TierClassificacao =
  | 'Absolute Porcaria'
  | 'Ruim'
  | 'Meia Boca'
  | 'Bom'
  | 'É o Aço'
  | 'Masterpiece';

export interface User {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface Review {
  id: string;
  albumId: string;
  nota: number;
  comentario?: string;
  createdAt: string;
  updatedAt?: string;
  usuario: User;
}

export interface Album {
  id: string;
  titulo: string;
  artista: string;
  anoLancamento: number;
  capaUrl?: string;
  spotifyUrl?: string;
  spotifyId?: string;
  status: AlbumStatus;
  notaMedia: number;
  classificacao: TierClassificacao;
  totalAvaliacoes: number;
  createdAt: string;
  edicaoId?: string;
  edicaoTema?: string;
  indicadoPor?: User;
}

export interface AlbumDetail extends Album {
  avaliacoes: Review[];
}

export interface TopComment {
  nomeUsuario: string;
  avatarUrl?: string;
  nota: number;
  comentario: string;
}

export interface RankingItem {
  posicao: number;
  albumId: string;
  titulo: string;
  artista: string;
  anoLancamento: number;
  capaUrl?: string;
  spotifyUrl?: string;
  notaMedia: number;
  classificacao: TierClassificacao;
  totalAvaliacoes: number;
  edicaoTema?: string;
  indicadoPorNome?: string;
  comentariosDestaque: TopComment[];
}

export interface CuratorRankingItem {
  posicao: number;
  userId: string;
  nome: string;
  avatarUrl?: string;
  totalAlbunsIndicados: number;
  totalAlbunsAvaliados: number;
  mediaDasIndicacoes: number;
  classificacaoCurador: TierClassificacao;
  melhorAlbumIndicado?: {
    albumId: string;
    titulo: string;
    artista: string;
    capaUrl?: string;
    notaMedia: number;
    classificacao: TierClassificacao;
  };
  piorAlbumIndicado?: {
    albumId: string;
    titulo: string;
    artista: string;
    capaUrl?: string;
    notaMedia: number;
    classificacao: TierClassificacao;
  };
}

export interface SpotifySearchResult {
  spotifyId: string;
  titulo: string;
  artista: string;
  anoLancamento: number;
  capaUrl?: string;
  spotifyUrl?: string;
}

export interface UserReviewDetail {
  id: string;
  albumId: string;
  albumTitulo: string;
  albumArtista: string;
  albumAnoLancamento?: number;
  albumCapaUrl?: string;
  albumSpotifyUrl?: string;
  albumNotaMedia: number;
  albumClassificacao: TierClassificacao;
  nota: number;
  comentario?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Edicao {
  id: string;
  numero: number;
  tema: string;
  descricao?: string;
  dataReuniao?: string;
  status: 'Planejada' | 'EmAndamento' | 'Finalizada';
  createdAt: string;
  totalAlbuns: number;
  notaMediaGeral?: number;
  albuns: Album[];
}

export interface MembroIndicacoesStatus {
  userId: string;
  nome: string;
  avatarUrl?: string;
  totalIndicados: number;
  limiteMaximo: number;
  podeIndicarMais: boolean;
  albunsIndicadosTitulos: string[];
}
