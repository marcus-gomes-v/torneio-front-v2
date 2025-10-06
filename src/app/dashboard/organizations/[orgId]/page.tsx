'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { organizationsService, Organization } from '../../../../services/organizations';
import { tournamentsService, Tournament } from '../../../../services/tournaments';
import { rankingsService, Ranking } from '../../../../services/rankings';
import { ArrowLeft, Plus, Trophy, Award, Mail, Phone, MapPin, Building2, Loader2, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { PageLayout } from '../../../../components/layout/PageLayout';

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
      academia: 'bg-gradient-to-r from-blue-500/90 to-blue-600/90',
      liga: 'bg-gradient-to-r from-purple-500/90 to-purple-600/90',
      federacao: 'bg-gradient-to-r from-green-500/90 to-green-600/90'
    };
    return colors[type as keyof typeof colors] || 'bg-gradient-to-r from-gray-500/90 to-gray-600/90';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f29] to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#e1b450] mx-auto mb-6" size={64} strokeWidth={2} />
          <div className="text-3xl font-semibold text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f29] to-[#0f1419] flex items-center justify-center">
        <PageLayout maxWidth="xl">
          <Card className="max-w-2xl mx-auto backdrop-blur-xl bg-[#1e2530]/50 border-[#2d3748]">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="text-3xl font-semibold text-red-500 mb-8">{error || 'Organização não encontrada'}</div>
                <Button variant="secondary" size="lg" onClick={loadData}>
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f29] to-[#0f1419]">
      <PageLayout maxWidth="xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-[#e1b450] hover:text-[#ffc015] mb-12 transition-all duration-300 group"
        >
          <ArrowLeft size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg font-semibold">Voltar para Dashboard</span>
        </button>

        {/* Hero Section - Organization Header */}
        <div className="mb-20">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] shadow-2xl overflow-hidden">
            {/* Cover Image/Gradient */}
            <div className="relative h-72 overflow-hidden">
              {organization.coverImage ? (
                <>
                  <img
                    src={organization.coverImage}
                    alt={organization.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e2530] via-[#1e2530]/60 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1f4baf] via-[#2557c4] to-[#1f4baf]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e2530] via-[#1e2530]/60 to-transparent" />
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-8 right-8">
                <span className={`inline-flex items-center gap-2 ${getTypeBadgeColor(organization.type)} text-white text-sm font-bold px-6 py-3 rounded-full backdrop-blur-sm shadow-2xl`}>
                  <Building2 size={18} strokeWidth={2.5} />
                  {getOrgTypeLabel(organization.type)}
                </span>
              </div>

              {/* Profile Image Overlay */}
              <div className="absolute -bottom-16 left-12">
                {organization.profileImage ? (
                  <img
                    src={organization.profileImage}
                    alt={organization.name}
                    className="w-32 h-32 rounded-3xl border-4 border-[#1e2530] shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#e1b450] to-[#ffc015] flex items-center justify-center text-5xl font-bold text-[#0f1419] border-4 border-[#1e2530] shadow-2xl">
                    {organization.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Organization Info */}
            <CardContent className="p-12 pt-24">
              <div className="mb-10">
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  {organization.name}
                </h1>
                <p className="text-xl text-[#a0aec0] leading-relaxed">
                  Informações completas da organização
                </p>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-6 bg-[#1a1f29]/50 rounded-2xl border border-[#2d3748] hover:border-[#e1b450]/30 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e1b450] to-[#ffc015] flex items-center justify-center shadow-lg shadow-[#e1b450]/20 group-hover:scale-110 transition-transform duration-300">
                    <Mail size={24} className="text-[#0f1419]" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm font-medium text-white truncate">{organization.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-[#1a1f29]/50 rounded-2xl border border-[#2d3748] hover:border-[#e1b450]/30 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f4baf] to-[#2557c4] flex items-center justify-center shadow-lg shadow-[#1f4baf]/20 group-hover:scale-110 transition-transform duration-300">
                    <Phone size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wide mb-1">Telefone</p>
                    <p className="text-sm font-medium text-white">{organization.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-[#1a1f29]/50 rounded-2xl border border-[#2d3748] hover:border-[#e1b450]/30 transition-all duration-300 group md:col-span-2 lg:col-span-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wide mb-1">Endereço</p>
                    <p className="text-sm font-medium text-white truncate">
                      {organization.address.street}, {organization.address.neighborhood}
                    </p>
                    <p className="text-xs text-[#a0aec0] mt-1">
                      {organization.address.city}/{organization.address.state} - {organization.address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs */}
        <div className="flex gap-6 mb-16 p-6 bg-[#1e2530]/50 backdrop-blur-xl rounded-2xl border border-[#2d3748] shadow-2xl">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`flex-1 flex items-center justify-center gap-3 py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'tournaments'
                ? 'bg-gradient-to-r from-[#1f4baf] to-[#2557c4] text-white shadow-2xl shadow-[#1f4baf]/30 scale-105'
                : 'text-[#a0aec0] hover:text-white hover:bg-[#2d3748]/50'
            }`}
          >
            <Trophy size={24} strokeWidth={2.5} />
            <span>Torneios</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
              activeTab === 'tournaments'
                ? 'bg-white/20'
                : 'bg-[#2d3748]'
            }`}>
              {tournaments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`flex-1 flex items-center justify-center gap-3 py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'rankings'
                ? 'bg-gradient-to-r from-[#1f4baf] to-[#2557c4] text-white shadow-2xl shadow-[#1f4baf]/30 scale-105'
                : 'text-[#a0aec0] hover:text-white hover:bg-[#2d3748]/50'
            }`}
          >
            <Award size={24} strokeWidth={2.5} />
            <span>Rankings</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
              activeTab === 'rankings'
                ? 'bg-white/20'
                : 'bg-[#2d3748]'
            }`}>
              {rankings.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tournaments' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-bold text-white mb-3 leading-tight">Torneios</h2>
                <p className="text-lg text-[#a0aec0] leading-relaxed">
                  {tournaments.length === 0
                    ? 'Nenhum torneio criado ainda'
                    : `${tournaments.length} ${tournaments.length === 1 ? 'torneio' : 'torneios'} cadastrado${tournaments.length === 1 ? '' : 's'}`
                  }
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/new`)}
                className="shadow-2xl shadow-[#e1b450]/20 hover:shadow-[#e1b450]/30 transition-all duration-300"
              >
                <Plus size={22} strokeWidth={2.5} />
                <span className="font-semibold">Novo Torneio</span>
              </Button>
            </div>

            {tournaments.length === 0 ? (
              <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] shadow-2xl">
                <CardContent className="p-20 text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1f4baf] to-[#2557c4] mb-12 shadow-2xl shadow-[#1f4baf]/20">
                    <Trophy size={64} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Nenhum torneio criado ainda
                  </h3>
                  <p className="text-xl text-[#a0aec0] mb-12 max-w-2xl mx-auto leading-relaxed">
                    Comece criando seu primeiro torneio para gerenciar competições, acompanhar resultados e organizar chaves de confronto.
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/new`)}
                    className="text-lg px-10 py-6 shadow-2xl shadow-[#e1b450]/20 hover:shadow-[#e1b450]/30 transition-all duration-300"
                  >
                    <Plus size={24} strokeWidth={2.5} />
                    <span className="font-semibold">Criar Primeiro Torneio</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {tournaments.map((tournament) => (
                  <Card
                    key={tournament._id}
                    className="group backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] hover:border-[#e1b450]/30 transition-all duration-500 shadow-2xl hover:shadow-[#e1b450]/10 cursor-pointer"
                    onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournament._id}`)}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e1b450] to-[#ffc015] flex items-center justify-center shadow-lg shadow-[#e1b450]/20 group-hover:scale-110 transition-transform duration-300">
                          <Trophy size={32} className="text-[#0f1419]" strokeWidth={2.5} />
                        </div>
                      </div>

                      <h4 className="text-2xl font-bold text-white mb-6 leading-tight group-hover:text-[#e1b450] transition-colors duration-300">
                        {tournament.name}
                      </h4>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[#a0aec0]">
                          <div className="w-10 h-10 rounded-xl bg-[#2d3748]/50 flex items-center justify-center">
                            <Calendar size={18} className="text-[#e1b450]" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1">Período</p>
                            <p className="text-sm font-medium text-white">
                              {new Date(tournament.gamesStartDate).toLocaleDateString('pt-BR')} - {new Date(tournament.gamesEndDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[#a0aec0]">
                          <div className="w-10 h-10 rounded-xl bg-[#2d3748]/50 flex items-center justify-center">
                            <MapPin size={18} className="text-[#e1b450]" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1">Localização</p>
                            <p className="text-sm font-medium text-white">
                              {tournament.location.city}/{tournament.location.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rankings' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-bold text-white mb-3 leading-tight">Rankings</h2>
                <p className="text-lg text-[#a0aec0] leading-relaxed">
                  {rankings.length === 0
                    ? 'Nenhum ranking criado ainda'
                    : `${rankings.length} ${rankings.length === 1 ? 'ranking' : 'rankings'} cadastrado${rankings.length === 1 ? '' : 's'}`
                  }
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/rankings/new`)}
                className="shadow-2xl shadow-[#e1b450]/20 hover:shadow-[#e1b450]/30 transition-all duration-300"
              >
                <Plus size={22} strokeWidth={2.5} />
                <span className="font-semibold">Novo Ranking</span>
              </Button>
            </div>

            {rankings.length === 0 ? (
              <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] shadow-2xl">
                <CardContent className="p-20 text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1f4baf] to-[#2557c4] mb-12 shadow-2xl shadow-[#1f4baf]/20">
                    <Award size={64} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Nenhum ranking criado ainda
                  </h3>
                  <p className="text-xl text-[#a0aec0] mb-12 max-w-2xl mx-auto leading-relaxed">
                    Crie rankings para acompanhar a classificação de atletas em diferentes categorias e faixas etárias.
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push(`/dashboard/organizations/${orgId}/rankings/new`)}
                    className="text-lg px-10 py-6 shadow-2xl shadow-[#e1b450]/20 hover:shadow-[#e1b450]/30 transition-all duration-300"
                  >
                    <Plus size={24} strokeWidth={2.5} />
                    <span className="font-semibold">Criar Primeiro Ranking</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {rankings.map((ranking) => (
                  <Card
                    key={ranking._id}
                    className="backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] hover:border-[#e1b450]/30 transition-all duration-500 shadow-2xl hover:shadow-[#e1b450]/10"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e1b450] to-[#ffc015] flex items-center justify-center shadow-lg shadow-[#e1b450]/20">
                          <Award size={32} className="text-[#0f1419]" strokeWidth={2.5} />
                        </div>
                        <span className={`text-xs px-4 py-2 rounded-full font-bold ${
                          ranking.visible
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {ranking.visible ? 'Visível' : 'Oculto'}
                        </span>
                      </div>

                      <h4 className="text-2xl font-bold text-white mb-6 leading-tight">
                        {ranking.name}
                      </h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#1a1f29]/50 rounded-xl border border-[#2d3748]">
                          <span className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wide">Categoria</span>
                          <span className="text-sm font-bold text-[#e1b450]">{ranking.category}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#1a1f29]/50 rounded-xl border border-[#2d3748]">
                          <span className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wide">Gênero</span>
                          <span className="text-sm font-bold text-white">{ranking.gender}</span>
                        </div>

                        {ranking.minAge && ranking.maxAge && (
                          <div className="flex items-center justify-between p-4 bg-[#1a1f29]/50 rounded-xl border border-[#2d3748]">
                            <span className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wide">Faixa Etária</span>
                            <span className="text-sm font-bold text-white">{ranking.minAge} - {ranking.maxAge} anos</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </PageLayout>
    </div>
  );
}
