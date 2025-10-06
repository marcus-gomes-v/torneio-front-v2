'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { tournamentsService, Tournament } from '../../../../../../services/tournaments';
import { sportsService, Sport } from '../../../../../../services/sports';
import { ArrowLeft } from 'lucide-react';

type TournamentFormData = Omit<Tournament, '_id'>;

export default function NewTournament() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TournamentFormData>({
    defaultValues: {
      organizationId: orgId,
      automate: false,
      maxCategoriesPerPlayer: 1,
      prices: {
        first: 0,
        second: 0,
        third: 0,
        fourth: 0,
        fifth: 0,
        sixth: 0,
        seventh: 0,
      },
      location: {
        country: '',
        state: '',
        city: '',
        neighborhood: '',
        street: '',
        zipCode: '',
      },
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const response = await sportsService.getAll();
      setSports(response.data);
    } catch (error) {
      console.error('Erro ao carregar esportes:', error);
    } finally {
      setLoadingSports(false);
    }
  };

  const onSubmit = async (data: TournamentFormData) => {
    try {
      await tournamentsService.create({
        ...data,
        organizationId: orgId,
      });
      router.push(`/dashboard/organizations/${orgId}`);
    } catch (error) {
      console.error('Erro ao criar torneio:', error);
      alert('Erro ao criar torneio. Por favor, tente novamente.');
    }
  };

  if (authLoading || loadingSports) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222325] text-[#dddcda]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
            className="flex items-center gap-2 text-[#e1b450] hover:text-[#d4a43d] mb-4 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Voltar para Organização
          </button>
          <h1 className="text-4xl font-bold text-[#e1b450] mb-2">
            Novo Torneio
          </h1>
          <p className="text-lg text-[#dddcda] opacity-80">
            Preencha os dados do torneio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Section */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Informações Gerais
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nome do Torneio *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: Campeonato Regional 2024"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Sport */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Esporte *
                </label>
                <select
                  {...register('sportId', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="">Selecione...</option>
                  {sports.map((sport) => (
                    <option key={sport._id} value={sport._id}>
                      {sport.label}
                    </option>
                  ))}
                </select>
                {errors.sportId && (
                  <p className="text-red-500 text-sm mt-1">{errors.sportId.message}</p>
                )}
              </div>

              {/* Player Info */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Informações do Jogador
                </label>
                <textarea
                  {...register('playerInfo')}
                  rows={3}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Informações adicionais sobre os jogadores..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Início das Inscrições *
                  </label>
                  <input
                    type="date"
                    {...register('registrationStartDate', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  />
                  {errors.registrationStartDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationStartDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Fim das Inscrições *
                  </label>
                  <input
                    type="date"
                    {...register('registrationEndDate', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  />
                  {errors.registrationEndDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationEndDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Início dos Jogos *
                  </label>
                  <input
                    type="date"
                    {...register('gamesStartDate', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  />
                  {errors.gamesStartDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.gamesStartDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Fim dos Jogos *
                  </label>
                  <input
                    type="date"
                    {...register('gamesEndDate', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  />
                  {errors.gamesEndDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.gamesEndDate.message}</p>
                  )}
                </div>
              </div>

              {/* Automate Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('automate')}
                  id="automate"
                  className="w-5 h-5 bg-[#222325] border border-[#3a3c3e] rounded focus:outline-none focus:ring-2 focus:ring-[#e1b450]"
                />
                <label htmlFor="automate" className="text-sm font-semibold">
                  Automatizar torneio
                </label>
              </div>
            </div>
          </div>

          {/* Registration Section */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Inscrições
            </h2>

            <div className="space-y-4">
              {/* Who Can Register */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Quem Pode se Inscrever *
                </label>
                <select
                  {...register('whoCanRegister', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="">Selecione...</option>
                  <option value="todos">Todos</option>
                  <option value="membros">Apenas Membros</option>
                  <option value="convidados">Apenas Convidados</option>
                </select>
                {errors.whoCanRegister && (
                  <p className="text-red-500 text-sm mt-1">{errors.whoCanRegister.message}</p>
                )}
              </div>

              {/* Max Categories Per Player */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Máximo de Categorias por Jogador *
                </label>
                <input
                  type="number"
                  {...register('maxCategoriesPerPlayer', {
                    required: 'Campo obrigatório',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Mínimo 1 categoria' }
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: 2"
                />
                {errors.maxCategoriesPerPlayer && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxCategoriesPerPlayer.message}</p>
                )}
              </div>

              {/* Registration Value */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Valor da Inscrição *
                </label>
                <input
                  type="text"
                  {...register('registrationValue', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: R$ 100,00 ou Gratuito"
                />
                {errors.registrationValue && (
                  <p className="text-red-500 text-sm mt-1">{errors.registrationValue.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Forma de Pagamento *
                </label>
                <input
                  type="text"
                  {...register('paymentMethod', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: PIX, Cartão, Dinheiro"
                />
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Prices */}
              <div>
                <label className="block text-sm font-semibold mb-4">
                  Valores de Inscrição por Posição
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs mb-1 opacity-70">1º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.first', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 opacity-70">2º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.second', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 opacity-70">3º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.third', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 opacity-70">4º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.fourth', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 opacity-70">5º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.fifth', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 opacity-70">6º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.sixth', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 opacity-70">7º Lugar</label>
                    <input
                      type="number"
                      {...register('prices.seventh', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-3 py-2 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Local
            </h2>

            <div className="space-y-4">
              {/* Country */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  País *
                </label>
                <input
                  type="text"
                  {...register('location.country', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Brasil"
                />
                {errors.location?.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.country.message}</p>
                )}
              </div>

              {/* State and City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    {...register('location.state', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="SP"
                  />
                  {errors.location?.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    {...register('location.city', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="São Paulo"
                  />
                  {errors.location?.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>
                  )}
                </div>
              </div>

              {/* Neighborhood */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  {...register('location.neighborhood', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Centro"
                />
                {errors.location?.neighborhood && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.neighborhood.message}</p>
                )}
              </div>

              {/* Street and Zip Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    {...register('location.street', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Rua das Flores, 123"
                  />
                  {errors.location?.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    {...register('location.zipCode', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="00000-000"
                  />
                  {errors.location?.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customizations Section */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Personalizações
            </h2>

            <div className="space-y-4">
              {/* Who Can Insert Score */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Quem Pode Inserir Placar *
                </label>
                <select
                  {...register('whoCanInsertScore', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="">Selecione...</option>
                  <option value="admin">Apenas Administrador</option>
                  <option value="jogadores">Jogadores</option>
                  <option value="todos">Todos</option>
                </select>
                {errors.whoCanInsertScore && (
                  <p className="text-red-500 text-sm mt-1">{errors.whoCanInsertScore.message}</p>
                )}
              </div>

              {/* Game Scheduling */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Agendamento de Jogos *
                </label>
                <select
                  {...register('gameScheduling', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="">Selecione...</option>
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                  <option value="jogadores">Jogadores Decidem</option>
                </select>
                {errors.gameScheduling && (
                  <p className="text-red-500 text-sm mt-1">{errors.gameScheduling.message}</p>
                )}
              </div>

              {/* Waiting List Guidance */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Orientação Lista de Espera
                </label>
                <textarea
                  {...register('waitingListGuidance')}
                  rows={3}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Informações sobre lista de espera..."
                />
              </div>
            </div>
          </div>

          {/* Prizes Section */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Premiação
            </h2>

            <div className="space-y-4">
              {/* Prizes Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Descrição dos Prêmios
                </label>
                <textarea
                  {...register('prizesDescription')}
                  rows={4}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Descreva os prêmios oferecidos..."
                />
              </div>

              {/* Total Prize Value */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Valor Total da Premiação
                </label>
                <input
                  type="number"
                  {...register('totalPrizeValue', { valueAsNumber: true })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: 10000"
                />
              </div>

              {/* Regulations */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Regulamento
                </label>
                <textarea
                  {...register('regulations')}
                  rows={6}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Regulamento completo do torneio..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
              className="flex-1 bg-[#3a3c3e] hover:bg-[#4a4c4e] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1f4baf] hover:bg-[#1a3d8f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando...' : 'Criar Torneio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
