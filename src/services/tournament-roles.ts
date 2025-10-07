import axios from 'axios';
import { auth } from '../lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TournamentRole {
  _id: string;
  value: string;
  label: string;
  category: string;
  order: number;
}

const getAuthHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export const tournamentRolesService = {
  async getAll() {
    const headers = await getAuthHeader();
    return axios.get<TournamentRole[]>(`${API_URL}/tournament-roles`, { headers });
  },
};
