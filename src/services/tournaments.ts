import api from '../lib/api';

export interface Tournament {
  _id: string;
  organizationId: string;
  name: string;
  sportId: string;
  playerInfo?: string;
  registrationStartDate: string;
  registrationEndDate: string;
  gamesStartDate: string;
  gamesEndDate: string;
  automate: boolean;
  whoCanRegister: string;
  maxCategoriesPerPlayer: number;
  registrationValue: string;
  paymentMethod: string;
  prices: {
    first: number;
    second: number;
    third: number;
    fourth: number;
    fifth: number;
    sixth: number;
    seventh: number;
  };
  location: {
    country: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    zipCode: string;
  };
  whoCanInsertScore: string;
  gameScheduling: string;
  waitingListGuidance?: string;
  prizesDescription?: string;
  totalPrizeValue?: number;
  regulations?: string;
}

export const tournamentsService = {
  getAll: (organizationId: string) => api.get<Tournament[]>(`/tournaments?organizationId=${organizationId}`),
  getOne: (id: string) => api.get<Tournament>(`/tournaments/${id}`),
  create: (data: Omit<Tournament, '_id'>) => api.post<Tournament>('/tournaments', data),
  update: (id: string, data: Partial<Tournament>) => api.patch<Tournament>(`/tournaments/${id}`, data),
  delete: (id: string) => api.delete(`/tournaments/${id}`),
};
