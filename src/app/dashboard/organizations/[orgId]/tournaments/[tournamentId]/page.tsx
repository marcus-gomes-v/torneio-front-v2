'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../../contexts/AuthContext';
import { tournamentsService, Tournament } from '../../../../../../../services/tournaments';
import { categoriesService, Category } from '../../../../../../../services/categories';
import { ArrowLeft, Plus, Calendar, MapPin, Users, DollarSign, Award, Settings } from 'lucide-react';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222325]">
        <div className="text-2xl text-[#dddcda]">Carregando...</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222325]">
        <div className="text-2xl text-red-500">{error || 'Torneio não encontrado'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222325] text-[#dddcda]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
          className="flex items-center gap-2 text-[#e1b450] hover:text-[#d4a43d] mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          Voltar para Organização
        </button>

        {/* Tournament Header */}
        <div className="bg-[#2a2c2e] rounded-lg p-8 mb-8 border border-[#3a3c3e]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#e1b450] mb-2">
                {tournament.name}
              </h1>
              {tournament.automate && (
                <span className="inline-block bg-[#1f4baf] text-white text-sm px-4 py-1 rounded-full">
                  Automatizado
                </span>
              )}
            </div>
          </div>

          {/* Tournament Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dates */}
            <div className="bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={20} className="text-[#e1b450]" />
                <h3 className="font-semibold">Datas</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="opacity-70">Inscrições:</span>
                  <div className="font-medium">
                    {formatDate(tournament.registrationStartDate)} - {formatDate(tournament.registrationEndDate)}
                  </div>
                </div>
                <div>
                  <span className="opacity-70">Jogos:</span>
                  <div className="font-medium">
                    {formatDate(tournament.gamesStartDate)} - {formatDate(tournament.gamesEndDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={20} className="text-[#e1b450]" />
                <h3 className="font-semibold">Local</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div>{tournament.location.street}</div>
                <div>{tournament.location.neighborhood}</div>
                <div>
                  {tournament.location.city}, {tournament.location.state}
                </div>
                <div>{tournament.location.zipCode}</div>
              </div>
            </div>

            {/* Registration */}
            <div className="bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-[#e1b450]" />
                <h3 className="font-semibold">Inscrições</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="opacity-70">Quem pode:</span>
                  <div className="font-medium capitalize">{tournament.whoCanRegister}</div>
                </div>
                <div>
                  <span className="opacity-70">Máx. categorias:</span>
                  <div className="font-medium">{tournament.maxCategoriesPerPlayer}</div>
                </div>
                <div>
                  <span className="opacity-70">Valor:</span>
                  <div className="font-medium">{tournament.registrationValue}</div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={20} className="text-[#e1b450]" />
                <h3 className="font-semibold">Pagamento</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="opacity-70">Método:</span>
                  <div className="font-medium">{tournament.paymentMethod}</div>
                </div>
                {tournament.totalPrizeValue && (
                  <div>
                    <span className="opacity-70">Premiação Total:</span>
                    <div className="font-medium">R$ {tournament.totalPrizeValue.toLocaleString('pt-BR')}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <div className="flex items-center gap-2 mb-3">
                <Settings size={20} className="text-[#e1b450]" />
                <h3 className="font-semibold">Configurações</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="opacity-70">Inserir placar:</span>
                  <div className="font-medium capitalize">{tournament.whoCanInsertScore}</div>
                </div>
                <div>
                  <span className="opacity-70">Agendamento:</span>
                  <div className="font-medium capitalize">{tournament.gameScheduling}</div>
                </div>
              </div>
            </div>

            {/* Prizes Info */}
            {tournament.prizesDescription && (
              <div className="bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={20} className="text-[#e1b450]" />
                  <h3 className="font-semibold">Prêmios</h3>
                </div>
                <div className="text-sm">
                  {tournament.prizesDescription}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {tournament.playerInfo && (
            <div className="mt-6 bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <h3 className="font-semibold mb-2">Informações do Jogador</h3>
              <p className="text-sm opacity-80">{tournament.playerInfo}</p>
            </div>
          )}

          {tournament.waitingListGuidance && (
            <div className="mt-4 bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <h3 className="font-semibold mb-2">Lista de Espera</h3>
              <p className="text-sm opacity-80">{tournament.waitingListGuidance}</p>
            </div>
          )}

          {tournament.regulations && (
            <div className="mt-4 bg-[#222325] rounded-lg p-4 border border-[#3a3c3e]">
              <h3 className="font-semibold mb-2">Regulamento</h3>
              <p className="text-sm opacity-80 whitespace-pre-wrap">{tournament.regulations}</p>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#e1b450]">
              Categorias
              <span className="ml-3 text-lg text-[#dddcda] opacity-60">
                ({categories.length})
              </span>
            </h2>
            <button
              onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}/categories/new`)}
              className="flex items-center gap-2 bg-[#1f4baf] hover:bg-[#1a3d8f] text-white font-semibold py-3 px-5 rounded-lg transition-colors duration-200"
            >
              <Plus size={20} />
              Nova Categoria
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="bg-[#2a2c2e] rounded-lg p-12 text-center border border-[#3a3c3e]">
              <Award size={48} className="mx-auto mb-4 text-[#e1b450] opacity-50" />
              <p className="text-lg mb-4 opacity-70">Nenhuma categoria cadastrada</p>
              <button
                onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}/categories/new`)}
                className="inline-flex items-center gap-2 bg-[#e1b450] hover:bg-[#d4a43d] text-[#222325] font-semibold py-3 px-5 rounded-lg transition-colors duration-200"
              >
                <Plus size={20} />
                Criar primeira categoria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => router.push(`/dashboard/categories/${category._id}`)}
                  className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e] hover:border-[#e1b450] transition-all duration-200 cursor-pointer"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}

                  <h3 className="text-xl font-bold text-[#e1b450] mb-4">
                    {category.name}
                  </h3>

                  <div className="space-y-3 text-sm">
                    {/* Dispute Model */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#3a3c3e]">
                      <span className="opacity-70">Modelo:</span>
                      <span className="font-semibold">{getDisputeModelLabel(category.disputeModel)}</span>
                    </div>

                    {/* Game Format */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#3a3c3e]">
                      <span className="opacity-70">Formato:</span>
                      <span className="font-semibold capitalize">{category.gameFormat.type}</span>
                    </div>

                    {/* Participant Limit */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#3a3c3e]">
                      <span className="opacity-70">Limite:</span>
                      <span className="font-semibold">{category.participantLimit} participantes</span>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#3a3c3e]">
                      <span className="opacity-70">Gênero:</span>
                      <span className="font-semibold">{getGenderLabel(category.audience.gender)}</span>
                    </div>

                    {/* Age Range */}
                    {(category.audience.minAge || category.audience.maxAge) && (
                      <div className="flex items-center justify-between pb-3 border-b border-[#3a3c3e]">
                        <span className="opacity-70">Idade:</span>
                        <span className="font-semibold">
                          {category.audience.minAge && category.audience.maxAge
                            ? `${category.audience.minAge} - ${category.audience.maxAge} anos`
                            : category.audience.minAge
                            ? `${category.audience.minAge}+ anos`
                            : `Até ${category.audience.maxAge} anos`}
                        </span>
                      </div>
                    )}

                    {/* Combined Age */}
                    {category.audience.combinedAge && (
                      <div className="flex items-center justify-between">
                        <span className="opacity-70">Idade Combinada:</span>
                        <span className="font-semibold">{category.audience.combinedAge} anos</span>
                      </div>
                    )}

                    {/* Schedule */}
                    <div className="pt-3 mt-3 border-t border-[#3a3c3e]">
                      <div className="text-xs opacity-70 mb-1">Período de Inscrições</div>
                      <div className="font-medium text-xs">
                        {formatDate(category.schedule.registrationStart)} - {formatDate(category.schedule.registrationEnd)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
