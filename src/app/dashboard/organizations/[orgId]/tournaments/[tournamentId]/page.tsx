'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { tournamentsService, Tournament } from '../../../../../../services/tournaments';
import { categoriesService, Category } from '../../../../../../services/categories';
import { ArrowLeft, Plus, Calendar, MapPin, Users, Trophy, Settings, Award, Pencil, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TournamentDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && tournamentId) {
      loadTournamentData();
    }
  }, [user, tournamentId]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentResponse, categoriesResponse] = await Promise.all([
        tournamentsService.getOne(tournamentId),
        categoriesService.getAll(tournamentId),
      ]);

      setTournament(tournamentResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados do torneio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      masculino: 'Masculino',
      feminino: 'Feminino',
      misto: 'Misto',
      livre: 'Livre',
    };
    return labels[gender] || gender;
  };

  const getDisputeModelLabel = (model: string) => {
    const labels: Record<string, string> = {
      'mata-mata': 'Mata-Mata',
      'grupos': 'Grupos',
      'grupos-mata-mata': 'Grupos + Mata-Mata',
      'round-robin': 'Round Robin',
    };
    return labels[model] || model;
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">{error || 'Torneio não encontrado'}</p>
          <Button variant="primary" onClick={loadTournamentData} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Organização
        </button>

        {/* Tournament Header */}
        <div className="mb-12">
          <div className="overflow-hidden rounded-lg bg-gray-900 shadow-sm">
            {/* Banner */}
            <div className="relative h-48 overflow-hidden">
              {tournament.banner ? (
                <img src={tournament.banner} alt={tournament.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-indigo-800" />
              )}
              <div className="absolute right-6 top-6 flex gap-2">
                {tournament.visible && (
                  <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 inset-ring inset-ring-green-500/20">
                    Visível
                  </span>
                )}
                {tournament.automate && (
                  <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 inset-ring inset-ring-blue-500/20">
                    Automatizado
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="px-6 py-8">
              <div className="flex items-center gap-x-6 mb-8">
                <div className="relative -mt-20 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-3xl font-bold text-white shadow-lg">
                  {tournament.avatar ? (
                    <img src={tournament.avatar} alt={tournament.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <Trophy className="h-12 w-12" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-white">{tournament.name}</h1>
                  <p className="mt-1 text-sm text-gray-400">Detalhes e categorias do torneio</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar Torneio
                </Button>
              </div>

              {/* Info Grid */}
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Inscrições
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {formatDate(tournament.registrationStartDate)} - {formatDate(tournament.registrationEndDate)}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Jogos
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {formatDate(tournament.gamesStartDate)} - {formatDate(tournament.gamesEndDate)}
                  </dd>
                </div>
                {tournament.locations && tournament.locations.length > 0 && (
                  <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                    <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                      <MapPin className="h-4 w-4" />
                      Local
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {tournament.locations[0].city}, {tournament.locations[0].state}
                    </dd>
                  </div>
                )}
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Users className="h-4 w-4" />
                    Máx. Categorias
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {tournament.maxCategoriesPerPlayer} por jogador
                  </dd>
                </div>
              </dl>

              {/* Additional Info Sections */}
              {tournament.playerInfo && (
                <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Informações para Jogadores</h3>
                  <p className="text-sm text-white whitespace-pre-wrap">{tournament.playerInfo}</p>
                </div>
              )}

              {tournament.prizeDescription && (
                <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Premiação
                  </h3>
                  <p className="text-sm text-white whitespace-pre-wrap">{tournament.prizeDescription}</p>
                  {tournament.totalPrizeValue && (
                    <p className="mt-2 text-sm font-semibold text-indigo-400">
                      Valor Total: {tournament.totalPrizeValue}
                    </p>
                  )}
                </div>
              )}

              {tournament.tournamentRules && (
                <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Regulamento
                  </h3>
                  <p className="text-sm text-white whitespace-pre-wrap">{tournament.tournamentRules}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="sm:flex sm:items-center mb-8">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold text-white">Categorias</h2>
              <p className="mt-2 text-sm text-gray-400">
                {categories.length === 0
                  ? 'Nenhuma categoria criada ainda'
                  : `${categories.length} ${categories.length === 1 ? 'categoria' : 'categorias'}`}
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                variant="primary"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}/categories/new`)}
              >
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center rounded-lg border border-dashed border-gray-700 bg-gray-900 px-6 py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-4 text-sm font-semibold text-white">Nenhuma categoria</h3>
              <p className="mt-2 text-sm text-gray-400">
                Comece criando a primeira categoria do torneio
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}/categories/new`)}
                >
                  <Plus className="h-4 w-4" />
                  Nova Categoria
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow-sm outline-1 -outline-offset-1 outline-white/10 sm:rounded-lg">
                    <table className="relative min-w-full divide-y divide-white/15">
                      <thead className="bg-gray-800/75">
                        <tr>
                          <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-200 sm:pl-6">
                            Nome
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                            Modelo
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                            Formato
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                            Gênero
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                            Limite
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                            Idade
                          </th>
                          <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-6">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 bg-gray-800/50">
                        {categories.map((category) => (
                          <tr key={category._id} className="hover:bg-gray-800/75 transition-colors">
                            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-6">
                              {category.name}
                            </td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                              {getDisputeModelLabel(category.disputeModel)}
                            </td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400 capitalize">
                              {category.gameFormat.type}
                            </td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400 capitalize">
                              {getGenderLabel(category.audience.gender)}
                            </td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                              {category.participantLimit}
                            </td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                              {category.audience.minAge || category.audience.maxAge
                                ? category.audience.minAge && category.audience.maxAge
                                  ? `${category.audience.minAge} - ${category.audience.maxAge}`
                                  : category.audience.minAge
                                  ? `${category.audience.minAge}+`
                                  : `Até ${category.audience.maxAge}`
                                : 'Livre'}
                            </td>
                            <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => router.push(`/dashboard/categories/${category._id}`)}
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                  title="Visualizar"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => router.push(`/dashboard/categories/${category._id}/edit`)}
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
}
