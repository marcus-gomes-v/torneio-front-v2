'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { organizationsService, Organization } from '../../../../services/organizations';
import { tournamentsService, Tournament } from '../../../../services/tournaments';
import { rankingsService, Ranking } from '../../../../services/rankings';
import { ArrowLeft, Plus, Trophy, Award, Mail, Phone, MapPin, Building2, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export default function OrganizationDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'rankings'>('tournaments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && orgId) {
      loadData();
    }
  }, [user, orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgResponse, tournamentsResponse, rankingsResponse] = await Promise.all([
        organizationsService.getOne(orgId),
        tournamentsService.getAll(orgId),
        rankingsService.getAll(orgId),
      ]);
      setOrganization(orgResponse.data);
      setTournaments(tournamentsResponse.data);
      setRankings(rankingsResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOrgTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      academia: 'Academia',
      liga: 'Liga',
      federacao: 'Federação',
    };
    return types[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      academia: 'bg-blue-500/10 text-blue-400 inset-ring inset-ring-blue-500/20',
      liga: 'bg-purple-500/10 text-purple-400 inset-ring inset-ring-purple-500/20',
      federacao: 'bg-green-500/10 text-green-400 inset-ring inset-ring-green-500/20'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 inset-ring inset-ring-gray-500/20';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">{error || 'Organização não encontrada'}</p>
          <Button variant="primary" onClick={loadData} className="mt-4">
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
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Dashboard
        </button>

        {/* Organization Header */}
        <div className="mb-12">
          <div className="overflow-hidden rounded-lg bg-gray-900 shadow-sm">
            {/* Cover */}
            <div className="relative h-48 overflow-hidden">
              {organization.coverImage ? (
                <img src={organization.coverImage} alt={organization.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-indigo-800" />
              )}
              <div className="absolute right-6 top-6">
                <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${getTypeBadgeColor(organization.type)}`}>
                  <Building2 className="h-3 w-3" />
                  {getOrgTypeLabel(organization.type)}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 py-8">
              <div className="flex items-center gap-x-6 mb-8">
                <div className="relative -mt-20 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-3xl font-bold text-white shadow-lg">
                  {organization.profileImage ? (
                    <img src={organization.profileImage} alt={organization.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    organization.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-white">{organization.name}</h1>
                  <p className="mt-1 text-sm text-gray-400">Informações completas da organização</p>
                </div>
              </div>

              {/* Contact Grid */}
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Mail className="h-4 w-4" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white truncate">{organization.email}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">{organization.phone}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {organization.address.city}, {organization.address.state}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-x-2 border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'tournaments'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              <Trophy className="h-5 w-5" />
              Torneios
              <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                activeTab === 'tournaments' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-800 text-gray-400'
              }`}>
                {tournaments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-x-2 border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'rankings'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              <Award className="h-5 w-5" />
              Rankings
              <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                activeTab === 'rankings' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-800 text-gray-400'
              }`}>
                {rankings.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'tournaments' && (
          <div>
            <div className="sm:flex sm:items-center mb-8">
              <div className="sm:flex-auto">
                <h2 className="text-base font-semibold text-white">Torneios</h2>
                <p className="mt-2 text-sm text-gray-400">
                  {tournaments.length === 0
                    ? 'Nenhum torneio criado ainda'
                    : `${tournaments.length} ${tournaments.length === 1 ? 'torneio' : 'torneios'}`}
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/new`)}
                >
                  <Plus className="h-4 w-4" />
                  Novo Torneio
                </Button>
              </div>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center rounded-lg border border-dashed border-gray-700 bg-gray-900 px-6 py-12">
                <Trophy className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-4 text-sm font-semibold text-white">Nenhum torneio</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Comece criando seu primeiro torneio
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/new`)}
                  >
                    <Plus className="h-4 w-4" />
                    Novo Torneio
                  </Button>
                </div>
              </div>
            ) : (
              <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map((tournament) => (
                  <li
                    key={tournament._id}
                    onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournament._id}`)}
                    className="col-span-1 divide-y divide-gray-800 rounded-lg bg-gray-900 shadow-sm hover:bg-gray-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-x-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
                            <Trophy className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="truncate text-sm font-medium text-white">{tournament.name}</h3>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-x-2 text-xs text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <p>{new Date(tournament.gamesStartDate).toLocaleDateString('pt-BR')} - {new Date(tournament.gamesEndDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-x-2 text-xs text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <p>{tournament.location.city}/{tournament.location.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'rankings' && (
          <div>
            <div className="sm:flex sm:items-center mb-8">
              <div className="sm:flex-auto">
                <h2 className="text-base font-semibold text-white">Rankings</h2>
                <p className="mt-2 text-sm text-gray-400">
                  {rankings.length === 0
                    ? 'Nenhum ranking criado ainda'
                    : `${rankings.length} ${rankings.length === 1 ? 'ranking' : 'rankings'}`}
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/rankings/new`)}
                >
                  <Plus className="h-4 w-4" />
                  Novo Ranking
                </Button>
              </div>
            </div>

            {rankings.length === 0 ? (
              <div className="text-center rounded-lg border border-dashed border-gray-700 bg-gray-900 px-6 py-12">
                <Award className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-4 text-sm font-semibold text-white">Nenhum ranking</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Comece criando seu primeiro ranking
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/dashboard/organizations/${orgId}/rankings/new`)}
                  >
                    <Plus className="h-4 w-4" />
                    Novo Ranking
                  </Button>
                </div>
              </div>
            ) : (
              <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rankings.map((ranking) => (
                  <li key={ranking._id} className="col-span-1 divide-y divide-gray-800 rounded-lg bg-gray-900 shadow-sm">
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center justify-between gap-x-3 mb-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            ranking.visible
                              ? 'bg-green-500/10 text-green-400 inset-ring inset-ring-green-500/20'
                              : 'bg-red-500/10 text-red-400 inset-ring inset-ring-red-500/20'
                          }`}>
                            {ranking.visible ? 'Visível' : 'Oculto'}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-white mb-4">{ranking.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Categoria</span>
                            <span className="font-medium text-white">{ranking.category}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Gênero</span>
                            <span className="font-medium text-white">{ranking.gender}</span>
                          </div>
                          {ranking.minAge && ranking.maxAge && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Faixa Etária</span>
                              <span className="font-medium text-white">{ranking.minAge} - {ranking.maxAge} anos</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
