import api from '../lib/api';

export interface Ranking {
  _id: string;
  organizationId: string;
  type: string;
  sportId: string;
  visible: boolean;
  name: string;
  category: string;
  image?: string;
  description?: string;
  gender: 'masculino' | 'feminino' | 'misto' | 'livre';
  minAge?: number;
  maxAge?: number;
  registrationValue?: string;
  prizesDescription?: string;
  prizeValue?: string;
  regulationsComplement?: string;
}

export const rankingsService = {
  getAll: (organizationId: string) => api.get<Ranking[]>(`/rankings?organizationId=${organizationId}`),
  getOne: (id: string) => api.get<Ranking>(`/rankings/${id}`),
  create: (data: Omit<Ranking, '_id'>) => api.post<Ranking>('/rankings', data),
  update: (id: string, data: Partial<Ranking>) => api.patch<Ranking>(`/rankings/${id}`, data),
  delete: (id: string) => api.delete(`/rankings/${id}`),
};
