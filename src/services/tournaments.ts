import api from '../lib/api';

export interface Tournament {
  _id: string;
  organizationId: string;
  name: string;
  sportId: string | { _id: string; label: string; value: string };
  visible?: boolean;
  avatar?: string;
  banner?: string;
  playerInfo?: string;
  registrationStartDate: string;
  registrationEndDate: string;
  gamesStartDate: string;
  gamesEndDate: string;
  automate: boolean;
  whoCanRegister: string;
  maxCategoriesPerPlayer: number;
  feeKind?: string;
  chargingKind?: string;
  fees?: Record<string, number>;
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
  locations?: Array<{
    country: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    zipCode: string;
  }>;
  team?: Array<{
    userId: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: string;
  }>;
  showTeamContact?: boolean;
  allowWaitingList?: boolean;
  automaticWaitingListInclusion?: boolean;
  hideWaitingListPlayers?: boolean;
  allowTimeRestrictions?: boolean;
  showInstagramField?: boolean;
  provideShirts?: boolean;
  showOpponentContact?: boolean;
  allowPartnerChange?: boolean;
  hideRegisteredPlayers?: boolean;
  requireCPF?: boolean;
  requireCity?: boolean;
  autoDeleteUnpaidRegistrations?: boolean;
  whoCanInsertScore: string;
  gameScheduling: string;
  waitingListOrientation?: string;
  waitingListGuidance?: string;
  prizeDescription?: string;
  prizesDescription?: string;
  totalPrizeValue?: number | string;
  tournamentRules?: string;
  regulations?: string;
}

export const tournamentsService = {
  getAll: (organizationId: string) => api.get<Tournament[]>(`/tournaments?organizationId=${organizationId}`),
  getOne: (id: string) => api.get<Tournament>(`/tournaments/${id}`),
  create: (data: Omit<Tournament, '_id'>) => api.post<Tournament>('/tournaments', data),
  update: (id: string, data: Partial<Tournament>) => api.patch<Tournament>(`/tournaments/${id}`, data),
  delete: (id: string) => api.delete(`/tournaments/${id}`),
};
