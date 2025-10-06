import api from '../lib/api';

export interface Organization {
  _id: string;
  type: 'academia' | 'liga' | 'federacao';
  profileImage?: string;
  coverImage?: string;
  name: string;
  phone: string;
  email: string;
  address: {
    country: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    zipCode: string;
  };
}

export const organizationsService = {
  getAll: () => api.get<Organization[]>('/organizations'),
  getOne: (id: string) => api.get<Organization>(`/organizations/${id}`),
  create: (data: Omit<Organization, '_id'>) => api.post<Organization>('/organizations', data),
  update: (id: string, data: Partial<Organization>) => api.patch<Organization>(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
};
