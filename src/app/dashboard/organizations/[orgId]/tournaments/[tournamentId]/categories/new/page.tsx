'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../../../../contexts/AuthContext';
import { categoriesService, Category } from '../../../../../../../../services/categories';
import { rankingsService, Ranking } from '../../../../../../../../services/rankings';
import { ArrowLeft } from 'lucide-react';

type CategoryFormData = Omit<Category, '_id'>;

export default function NewCategory() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;

  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      tournamentId,
      gameFormat: {
        type: 'simples',
        scoreType: 'sets_games',
      },
      audience: {
        gender: 'livre',
      },
    },
  });

  const scoreType = watch('gameFormat.scoreType');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoadingRankings(true);
        const response = await rankingsService.getAll(orgId);
        setRankings(response.data);
      } catch (error) {
        console.error('Erro ao buscar rankings:', error);
      } finally {
        setLoadingRankings(false);
      }
    };

    if (orgId) {
      fetchRankings();
    }
  }, [orgId]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Remove rankingId se for "sem-ranking"
      const submitData = {
        ...data,
        rankingId: data.rankingId === 'sem-ranking' ? undefined : data.rankingId,
        tournamentId,
      };

      await categoriesService.create(submitData);
      router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria. Por favor, tente novamente.');
    }
  };

  if (authLoading || loadingRankings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222325]">
        <div className="text-2xl text-[#dddcda]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222325] text-[#dddcda]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`)}
            className="flex items-center gap-2 text-[#e1b450] hover:text-[#d4a43d] mb-4 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Voltar para Torneio
          </button>
          <h1 className="text-4xl font-bold text-[#e1b450] mb-2">
            Nova Categoria
          </h1>
          <p className="text-lg text-[#dddcda] opacity-80">
            Preencha os dados da categoria do torneio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sessão Geral */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Informações Gerais
            </h2>

            <div className="space-y-4">
              {/* Ranking */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ranking (Opcional)
                </label>
                <select
                  {...register('rankingId')}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="sem-ranking">Sem Ranking</option>
                  {rankings.map((ranking) => (
                    <option key={ranking._id} value={ranking._id}>
                      {ranking.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: Masculino A, Feminino B, etc."
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  URL da Imagem (Opcional)
                </label>
                <input
                  type="url"
                  {...register('image')}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {/* Dispute Model */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Modelo de Disputa *
                </label>
                <select
                  {...register('disputeModel', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="">Selecione...</option>
                  <option value="eliminacao-simples">Eliminação Simples</option>
                  <option value="eliminacao-dupla">Eliminação Dupla</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="grupos-eliminacao">Grupos + Eliminação</option>
                </select>
                {errors.disputeModel && (
                  <p className="text-red-500 text-sm mt-1">{errors.disputeModel.message}</p>
                )}
              </div>

              {/* Participant Limit */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Limite de Participantes *
                </label>
                <input
                  type="number"
                  {...register('participantLimit', {
                    required: 'Campo obrigatório',
                    min: { value: 2, message: 'Mínimo de 2 participantes' },
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: 16, 32, 64"
                />
                {errors.participantLimit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.participantLimit.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cronograma */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Cronograma
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registration Start */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Início das Inscrições *
                </label>
                <input
                  type="datetime-local"
                  {...register('schedule.registrationStart', {
                    required: 'Campo obrigatório',
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                />
                {errors.schedule?.registrationStart && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.schedule.registrationStart.message}
                  </p>
                )}
              </div>

              {/* Registration End */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Fim das Inscrições *
                </label>
                <input
                  type="datetime-local"
                  {...register('schedule.registrationEnd', {
                    required: 'Campo obrigatório',
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                />
                {errors.schedule?.registrationEnd && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.schedule.registrationEnd.message}
                  </p>
                )}
              </div>

              {/* Games Start */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Início dos Jogos *
                </label>
                <input
                  type="datetime-local"
                  {...register('schedule.gamesStart', {
                    required: 'Campo obrigatório',
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                />
                {errors.schedule?.gamesStart && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.schedule.gamesStart.message}
                  </p>
                )}
              </div>

              {/* Games End */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Fim dos Jogos *
                </label>
                <input
                  type="datetime-local"
                  {...register('schedule.gamesEnd', {
                    required: 'Campo obrigatório',
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                />
                {errors.schedule?.gamesEnd && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.schedule.gamesEnd.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Formato dos Jogos */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Formato dos Jogos
            </h2>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tipo de Jogo *
                </label>
                <select
                  {...register('gameFormat.type', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="simples">Simples</option>
                  <option value="dupla">Dupla</option>
                  <option value="equipe">Equipe</option>
                </select>
                {errors.gameFormat?.type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gameFormat.type.message}
                  </p>
                )}
              </div>

              {/* Score Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tipo de Pontuação *
                </label>
                <select
                  {...register('gameFormat.scoreType', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="sets_games">Sets e Games</option>
                  <option value="sets_pontos">Sets e Pontos</option>
                </select>
                {errors.gameFormat?.scoreType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gameFormat.scoreType.message}
                  </p>
                )}
              </div>

              {/* Sets */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Configuração de Sets *
                </label>
                <input
                  type="text"
                  {...register('gameFormat.sets', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: melhor de 3, melhor de 5"
                />
                {errors.gameFormat?.sets && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gameFormat.sets.message}
                  </p>
                )}
              </div>

              {/* Games (condicional) */}
              {scoreType === 'sets_games' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Configuração de Games
                  </label>
                  <input
                    type="text"
                    {...register('gameFormat.games')}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Ex: primeiro a 6 games"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Público */}
          <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
            <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
              Público-Alvo
            </h2>

            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Gênero *
                </label>
                <select
                  {...register('audience.gender', { required: 'Campo obrigatório' })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="misto">Misto</option>
                  <option value="livre">Livre</option>
                </select>
                {errors.audience?.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.audience.gender.message}
                  </p>
                )}
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Idade Mínima
                  </label>
                  <input
                    type="number"
                    {...register('audience.minAge', {
                      min: { value: 0, message: 'Idade não pode ser negativa' },
                    })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Ex: 18"
                  />
                  {errors.audience?.minAge && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.audience.minAge.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Idade Máxima
                  </label>
                  <input
                    type="number"
                    {...register('audience.maxAge', {
                      min: { value: 0, message: 'Idade não pode ser negativa' },
                    })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Ex: 65"
                  />
                  {errors.audience?.maxAge && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.audience.maxAge.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Combined Age */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Idade Combinada (para duplas/equipes)
                </label>
                <input
                  type="number"
                  {...register('audience.combinedAge', {
                    min: { value: 0, message: 'Idade não pode ser negativa' },
                  })}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Ex: 80 (soma das idades)"
                />
                {errors.audience?.combinedAge && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.audience.combinedAge.message}
                  </p>
                )}
                <p className="text-sm text-[#dddcda] opacity-60 mt-1">
                  Soma das idades de todos os participantes da dupla/equipe
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`)}
              className="flex-1 bg-[#3a3c3e] hover:bg-[#4a4c4e] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1f4baf] hover:bg-[#1a3d8f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando...' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
