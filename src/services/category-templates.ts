import axios from 'axios';
import { auth } from '../lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CategoryTemplate {
  _id: string;
  organizationId: string;
  sportId: {
    _id: string;
    name: string;
    label?: string;
  } | string;
  name: string;
  level: string;
  gameFormat: {
    type: string;
  };
  audience: {
    gender: string;
    minAge?: number;
    maxAge?: number;
  };
  // Compatible templates are now fetched via a separate N-to-N relation collection
  // The backend returns them as populated objects
  compatibleTemplates?: Array<{
    _id: string;
    name: string;
    level: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryTemplateDto {
  organizationId: string;
  sportId: string;
  name: string;
  level: string;
  gameFormat: {
    type: string;
  };
  audience: {
    gender: string;
    minAge?: number;
    maxAge?: number;
  };
  compatibleTemplates?: string[];
}

export interface UpdateCategoryTemplateDto extends Partial<CreateCategoryTemplateDto> {}

const getAuthHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export const categoryTemplatesService = {
  async getAll(organizationId: string) {
    const headers = await getAuthHeader();
    return axios.get<CategoryTemplate[]>(`${API_URL}/category-templates?organizationId=${organizationId}`, { headers });
  },

  async getOne(id: string) {
    const headers = await getAuthHeader();
    return axios.get<CategoryTemplate>(`${API_URL}/category-templates/${id}`, { headers });
  },

  async create(data: CreateCategoryTemplateDto) {
    const headers = await getAuthHeader();
    return axios.post<CategoryTemplate>(`${API_URL}/category-templates`, data, { headers });
  },

  async update(id: string, data: UpdateCategoryTemplateDto) {
    const headers = await getAuthHeader();
    return axios.patch<CategoryTemplate>(`${API_URL}/category-templates/${id}`, data, { headers });
  },

  async delete(id: string) {
    const headers = await getAuthHeader();
    return axios.delete(`${API_URL}/category-templates/${id}`, { headers });
  },
};
