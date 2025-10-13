'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Edit, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { categoryTemplatesService, CategoryTemplate, CreateCategoryTemplateDto } from '@/services/category-templates';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Sport {
  _id: string;
  label: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CategoryTemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CategoryTemplate | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<CreateCategoryTemplateDto>();
  const selectedSport = watch('sportId');
  const [selectedCompatibleTemplates, setSelectedCompatibleTemplates] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'sportId' | 'level' | 'gameFormat.type' | 'audience.gender' | 'age'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      loadTemplates();
      loadSports();
    }
  }, [orgId, user, authLoading]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await categoryTemplatesService.getAll(orgId);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Erro ao carregar templates de categoria');
    } finally {
      setLoading(false);
    }
  };

  const loadSports = async () => {
    try {
      const response = await axios.get<Sport[]>(`${API_URL}/sports`);
      setSports(response.data);
    } catch (error) {
      console.error('Error loading sports:', error);
    }
  };

  const onSubmit = async (data: CreateCategoryTemplateDto) => {
    try {
      const payload = {
        ...data,
        organizationId: orgId,
        compatibleTemplates: selectedCompatibleTemplates,
      };

      if (editingTemplate) {
        await categoryTemplatesService.update(editingTemplate._id, payload);
      } else {
        await categoryTemplatesService.create(payload);
      }

      await loadTemplates();
      setShowForm(false);
      setEditingTemplate(null);
      setSelectedCompatibleTemplates([]);
      reset();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Erro ao salvar template');
    }
  };

  const handleEdit = (template: CategoryTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);

    const sportId = typeof template.sportId === 'object' ? template.sportId._id : template.sportId;
    const compatibleIds = template.compatibleTemplates.map((t) =>
      typeof t === 'string' ? t : t._id
    );

    setValue('sportId', sportId);
    setValue('name', template.name);
    setValue('level', template.level);
    setValue('gameFormat.type', template.gameFormat.type);
    setValue('audience.gender', template.audience.gender);
    if (template.audience.minAge) setValue('audience.minAge', template.audience.minAge);
    if (template.audience.maxAge) setValue('audience.maxAge', template.audience.maxAge);
    setSelectedCompatibleTemplates(compatibleIds);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      await categoryTemplatesService.delete(id);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erro ao excluir template');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setSelectedCompatibleTemplates([]);
    reset();
  };

  const toggleCompatibleTemplate = (templateId: string) => {
    setSelectedCompatibleTemplates((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const availableTemplatesForCompatibility = templates.filter((t) => {
    const sportId = typeof t.sportId === 'object' ? t.sportId._id : t.sportId;
    return sportId === selectedSport && t._id !== editingTemplate?._id;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter((template) => {
      const searchLower = searchQuery.toLowerCase();
      const sportName = typeof template.sportId === 'object' ? template.sportId.label?.toLowerCase() || '' : '';

      return (
        template.name.toLowerCase().includes(searchLower) ||
        template.level.toLowerCase().includes(searchLower) ||
        template.gameFormat.type.toLowerCase().includes(searchLower) ||
        template.audience.gender.toLowerCase().includes(searchLower) ||
        sportName.includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'gameFormat.type') {
        aValue = a.gameFormat.type;
        bValue = b.gameFormat.type;
      } else if (sortField === 'audience.gender') {
        aValue = a.audience.gender;
        bValue = b.audience.gender;
      } else if (sortField === 'sportId') {
        aValue = typeof a.sportId === 'object' ? a.sportId.label : '';
        bValue = typeof b.sportId === 'object' ? b.sportId.label : '';
      } else if (sortField === 'age') {
        // Sort by minAge, if not present use maxAge, if neither use 999 to put at end
        aValue = a.audience.minAge || a.audience.maxAge || 999;
        bValue = b.audience.minAge || b.audience.maxAge || 999;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [templates, searchQuery, sortField, sortDirection]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Templates de Categoria</h1>
              <p className="text-gray-400 mt-1">
                Gerencie os templates de categorias da sua organização
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Novo Template
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                {/* Esporte */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium leading-6 text-white">Esporte *</label>
                  <div className="mt-2">
                    <select
                      {...register('sportId', { required: true })}
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">Selecione um esporte</option>
                      {sports.map((sport) => (
                        <option key={sport._id} value={sport._id}>
                          {sport.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nível */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium leading-6 text-white">Nível *</label>
                  <div className="mt-2">
                    <select
                      {...register('level', { required: true })}
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">Selecione um nível</option>
                      <option value="1ª CLASSE">1ª CLASSE</option>
                      <option value="2ª CLASSE">2ª CLASSE</option>
                      <option value="3ª CLASSE">3ª CLASSE</option>
                      <option value="4ª CLASSE">4ª CLASSE</option>
                      <option value="5ª CLASSE">5ª CLASSE</option>
                      <option value="6ª CLASSE">6ª CLASSE</option>
                      <option value="7ª CLASSE">7ª CLASSE</option>
                      <option value="8ª CLASSE">8ª CLASSE</option>
                      <option value="PROFISSIONAL">PROFISSIONAL</option>
                      <option value="ESPECIAL">ESPECIAL</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                      <option value="AVANÇADO">AVANÇADO</option>
                      <option value="INTERMEDIÁRIO">INTERMEDIÁRIO</option>
                      <option value="INICIANTE">INICIANTE</option>
                      <option value="PRINCIPIANTE">PRINCIPIANTE</option>
                      <option value="ESTREANTE">ESTREANTE</option>
                      <option value="DIAMANTE">DIAMANTE</option>
                      <option value="OURO">OURO</option>
                      <option value="PRATA">PRATA</option>
                      <option value="BRONZE">BRONZE</option>
                      <option value="BOLA VERMELHA">BOLA VERMELHA</option>
                      <option value="BOLA LARANJA">BOLA LARANJA</option>
                      <option value="BOLA AMARELA">BOLA AMARELA</option>
                      <option value="BOLA VERDE">BOLA VERDE</option>
                      <option value="OPEN">OPEN</option>
                      <option value="LIVRE">LIVRE</option>
                      <option value="FUN">FUN</option>
                      <option value="IDADE">IDADE</option>
                      <option value="SOMA DE IDADE">SOMA DE IDADE</option>
                    </select>
                  </div>
                </div>

                {/* Tipo */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium leading-6 text-white">Tipo de jogo *</label>
                  <div className="mt-2">
                    <select
                      {...register('gameFormat.type', { required: true })}
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="simples">Simples</option>
                      <option value="dupla">Duplas</option>
                      <option value="equipe">Equipe</option>
                    </select>
                  </div>
                </div>

                {/* Gênero */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium leading-6 text-white">Gênero *</label>
                  <div className="mt-2">
                    <select
                      {...register('audience.gender', { required: true })}
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="misto">Misto</option>
                      <option value="livre">Livre</option>
                    </select>
                  </div>
                </div>

                {/* Nome */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium leading-6 text-white">Nome *</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      {...register('name', { required: true })}
                      placeholder="Ex: Dupla Feminina A"
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Idade Mínima */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium leading-6 text-white">Idade mínima</label>
                  <div className="mt-2">
                    <select
                      {...register('audience.minAge')}
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">Sem idade mínima</option>
                      {Array.from({ length: 99 }, (_, i) => i + 1).map((age) => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Idade Máxima */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium leading-6 text-white">Idade máxima</label>
                  <div className="mt-2">
                    <select
                      {...register('audience.maxAge')}
                      className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">Sem idade máxima</option>
                      {Array.from({ length: 99 }, (_, i) => 99 - i).map((age) => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Categorias Compatíveis */}
              {selectedSport && availableTemplatesForCompatibility.length > 0 && (
                <>
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h3 className="text-base font-semibold text-white mb-2">
                      CATEGORIAS QUE PODE JOGAR JUNTO
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Selecione as categorias compatíveis para prevenir fraudes nas inscrições
                    </p>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {availableTemplatesForCompatibility.map((template) => (
                      <label
                        key={template._id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompatibleTemplates.includes(template._id)}
                          onChange={() => toggleCompatibleTemplate(template._id)}
                          className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-gray-900"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white">{template.name}</div>
                          <div className="text-sm text-gray-400">
                            Level: {template.level} | Tipo: {template.gameFormat.type} | Gênero: {template.audience.gender}
                            {(template.audience.minAge || template.audience.maxAge) && (
                              <span> | Idade: {template.audience.minAge || '?'} - {template.audience.maxAge || '?'}</span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  {editingTemplate ? 'Salvar' : 'Criar Template'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Filter */}
        {!showForm && templates.length > 0 && (
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-white mb-2">
              Buscar templates
            </label>
            <div className="flex rounded-md bg-white/5 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
              <div className="flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, nível, tipo ou gênero..."
                className="block min-w-0 grow px-3 py-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm bg-transparent"
              />
            </div>
          </div>
        )}

        {/* Templates Table */}
        {!showForm && templates.length > 0 && (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm outline-1 -outline-offset-1 outline-white/10 sm:rounded-lg">
                  <table className="relative min-w-full divide-y divide-white/15">
                    <thead className="bg-gray-800/75">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-200 sm:pl-6 cursor-pointer hover:bg-gray-800/50"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Nome
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 cursor-pointer hover:bg-gray-800/50"
                          onClick={() => handleSort('sportId')}
                        >
                          <div className="flex items-center gap-2">
                            Esporte
                            {sortField === 'sportId' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 cursor-pointer hover:bg-gray-800/50"
                          onClick={() => handleSort('level')}
                        >
                          <div className="flex items-center gap-2">
                            Nível
                            {sortField === 'level' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 cursor-pointer hover:bg-gray-800/50"
                          onClick={() => handleSort('gameFormat.type')}
                        >
                          <div className="flex items-center gap-2">
                            Tipo
                            {sortField === 'gameFormat.type' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 cursor-pointer hover:bg-gray-800/50"
                          onClick={() => handleSort('audience.gender')}
                        >
                          <div className="flex items-center gap-2">
                            Gênero
                            {sortField === 'audience.gender' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 cursor-pointer hover:bg-gray-800/50"
                          onClick={() => handleSort('age')}
                        >
                          <div className="flex items-center gap-2">
                            Idade
                            {sortField === 'age' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-6">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-gray-800/50">
                      {filteredAndSortedTemplates.map((template) => (
                        <tr key={template._id} className="hover:bg-gray-800/75 transition-colors">
                          <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-6">
                            {template.name}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                            {typeof template.sportId === 'object' ? template.sportId.label : ''}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                            {template.level}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400 capitalize">
                            {template.gameFormat.type}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400 capitalize">
                            {template.audience.gender}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                            {template.audience.minAge || template.audience.maxAge
                              ? `${template.audience.minAge || '?'} - ${template.audience.maxAge || '?'}`
                              : 'Sem idade'}
                          </td>
                          <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(template)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(template._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {templates.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum template cadastrado.</p>
            <p className="text-sm mt-2">Clique em "Novo Template" para criar o primeiro.</p>
          </div>
        )}

        {filteredAndSortedTemplates.length === 0 && templates.length > 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum template encontrado com os filtros aplicados.</p>
            <p className="text-sm mt-2">Tente ajustar sua busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
