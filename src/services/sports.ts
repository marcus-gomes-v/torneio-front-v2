import api from '../lib/api';

export interface Sport {
  _id: string;
  label: string;
  active: boolean;
}

export const sportsService = {
  getAll: () => api.get<Sport[]>('/sports'),
};
