import api from '../lib/api';

export interface Category {
  _id: string;
  tournamentId: string;
  rankingId?: string;
  name: string;
  image?: string;
  disputeModel: string;
  participantLimit: number;
  schedule: {
    registrationStart: string;
    registrationEnd: string;
    gamesStart: string;
    gamesEnd: string;
  };
  gameFormat: {
    type: 'simples' | 'dupla' | 'equipe';
    scoreType: 'sets_games' | 'sets_pontos';
    sets: string;
    games?: string;
  };
  audience: {
    gender: 'masculino' | 'feminino' | 'misto' | 'livre';
    minAge?: number;
    maxAge?: number;
    combinedAge?: number;
  };
}

export const categoriesService = {
  getAll: (tournamentId: string) => api.get<Category[]>(`/categories?tournamentId=${tournamentId}`),
  getOne: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (data: Omit<Category, '_id'>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
