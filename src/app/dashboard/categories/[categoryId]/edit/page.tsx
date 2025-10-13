'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../contexts/AuthContext';
import { categoriesService, Category } from '../../../../../services/categories';
import { rankingsService, Ranking } from '../../../../../services/rankings';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { ImageUpload } from '../../../../../components/ui/ImageUpload';

type CategoryFormData = Omit<Category, '_id'>;

export default function EditCategory() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [orgId, setOrgId] = useState<string>('');
  const [tournamentId, setTournamentId] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>();

  const scoreType = watch('gameFormat.scoreType');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    if (orgId) {
      fetchRankings();
    }
  }, [orgId]);

  const loadCategory = async () => {
    try {
      setLoadingCategory(true);
      const response = await categoriesService.getOne(categoryId);
      const categoryData = response.data;
      setCategory(categoryData);
      setTournamentId(categoryData.tournamentId);
      setImage(categoryData.image || null);

      // Get orgId from tournament
      const { tournamentsService } = await import('../../../../../services/tournaments');
      const tournamentResponse = await tournamentsService.getOne(categoryData.tournamentId);
      setOrgId(tournamentResponse.data.organizationId);

      reset(categoryData);
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      alert('Erro ao carregar categoria');
    } finally {
      setLoadingCategory(false);
    }
  };

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

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submitData = {
        ...data,
        rankingId: data.rankingId === 'sem-ranking' ? undefined : data.rankingId,
        tournamentId,
        image: image || undefined,
      };

      await categoriesService.update(categoryId, submitData);
      router.push(`/dashboard/categories/${categoryId}`);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria. Por favor, tente novamente.');
    }
  };

  if (authLoading || loadingRankings || loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/categories/${categoryId}`)}
              className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Categoria
            </button>
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-white sm:text-3xl sm:tracking-tight">
                  Editar Categoria
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Atualize os dados da categoria
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/categories/${categoryId}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Atualizando...' : 'Atualizar Categoria'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Informações Gerais */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-white">Informações Gerais</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Dados básicos da categoria
                </p>
              </div>

              <div className="bg-gray-900 shadow-sm ring-1 ring-gray-800 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="rankingId" className="block text-sm font-medium text-white">
                        Ranking
                      </label>
                      <div className="mt-2">
                        <select
                          {...register('rankingId')}
                          id="rankingId"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="sem-ranking">Sem Ranking</option>
                          {rankings.map((ranking) => (
                            <option key={ranking._id} value={ranking._id}>
                              {ranking.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">Opcional - vincule esta categoria a um ranking</p>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="name" className="block text-sm font-medium text-white">
                        Nome da Categoria *
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register('name', { required: 'Campo obrigatório' })}
                          id="name"
                          placeholder="Ex: Masculino A, Feminino B, etc."
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <ImageUpload
                        label="Imagem da Categoria"
                        value={image || undefined}
                        onChange={setImage}
                        helpText="Imagem de capa da categoria. Recomendado: 800x400px"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="disputeModel" className="block text-sm font-medium text-white">
                        Modelo de Disputa *
                      </label>
                      <div className="mt-2">
                        <select
                          {...register('disputeModel', { required: 'Campo obrigatório' })}
                          id="disputeModel"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Selecione...</option>
                          <option value="eliminacao-simples">Eliminação Simples</option>
                          <option value="eliminacao-dupla">Eliminação Dupla</option>
                          <option value="round-robin">Round Robin</option>
                          <option value="grupos-eliminacao">Grupos + Eliminação</option>
                        </select>
                      </div>
                      {errors.disputeModel && (
                        <p className="mt-2 text-sm text-red-400">{errors.disputeModel.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="participantLimit" className="block text-sm font-medium text-white">
                        Limite de Participantes *
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          {...register('participantLimit', {
                            required: 'Campo obrigatório',
                            min: { value: 2, message: 'Mínimo de 2 participantes' },
                          })}
                          id="participantLimit"
                          placeholder="Ex: 16, 32, 64"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.participantLimit && (
                        <p className="mt-2 text-sm text-red-400">{errors.participantLimit.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cronograma */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-white">Cronograma</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Datas de inscrições e jogos
                </p>
              </div>

              <div className="bg-gray-900 shadow-sm ring-1 ring-gray-800 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="registrationStart" className="block text-sm font-medium text-white">
                        Início das Inscrições *
                      </label>
                      <div className="mt-2">
                        <input
                          type="datetime-local"
                          {...register('schedule.registrationStart', { required: 'Campo obrigatório' })}
                          id="registrationStart"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.schedule?.registrationStart && (
                        <p className="mt-2 text-sm text-red-400">{errors.schedule.registrationStart.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="registrationEnd" className="block text-sm font-medium text-white">
                        Fim das Inscrições *
                      </label>
                      <div className="mt-2">
                        <input
                          type="datetime-local"
                          {...register('schedule.registrationEnd', { required: 'Campo obrigatório' })}
                          id="registrationEnd"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.schedule?.registrationEnd && (
                        <p className="mt-2 text-sm text-red-400">{errors.schedule.registrationEnd.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="gamesStart" className="block text-sm font-medium text-white">
                        Início dos Jogos *
                      </label>
                      <div className="mt-2">
                        <input
                          type="datetime-local"
                          {...register('schedule.gamesStart', { required: 'Campo obrigatório' })}
                          id="gamesStart"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.schedule?.gamesStart && (
                        <p className="mt-2 text-sm text-red-400">{errors.schedule.gamesStart.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="gamesEnd" className="block text-sm font-medium text-white">
                        Fim dos Jogos *
                      </label>
                      <div className="mt-2">
                        <input
                          type="datetime-local"
                          {...register('schedule.gamesEnd', { required: 'Campo obrigatório' })}
                          id="gamesEnd"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.schedule?.gamesEnd && (
                        <p className="mt-2 text-sm text-red-400">{errors.schedule.gamesEnd.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formato dos Jogos */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-white">Formato dos Jogos</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Configurações de pontuação e formato
                </p>
              </div>

              <div className="bg-gray-900 shadow-sm ring-1 ring-gray-800 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="gameType" className="block text-sm font-medium text-white">
                        Tipo de Jogo *
                      </label>
                      <div className="mt-2">
                        <select
                          {...register('gameFormat.type', { required: 'Campo obrigatório' })}
                          id="gameType"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="simples">Simples</option>
                          <option value="dupla">Dupla</option>
                          <option value="equipe">Equipe</option>
                        </select>
                      </div>
                      {errors.gameFormat?.type && (
                        <p className="mt-2 text-sm text-red-400">{errors.gameFormat.type.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="scoreType" className="block text-sm font-medium text-white">
                        Tipo de Pontuação *
                      </label>
                      <div className="mt-2">
                        <select
                          {...register('gameFormat.scoreType', { required: 'Campo obrigatório' })}
                          id="scoreType"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="sets_games">Sets e Games</option>
                          <option value="sets_pontos">Sets e Pontos</option>
                        </select>
                      </div>
                      {errors.gameFormat?.scoreType && (
                        <p className="mt-2 text-sm text-red-400">{errors.gameFormat.scoreType.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="sets" className="block text-sm font-medium text-white">
                        Configuração de Sets *
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register('gameFormat.sets', { required: 'Campo obrigatório' })}
                          id="sets"
                          placeholder="Ex: melhor de 3, melhor de 5"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.gameFormat?.sets && (
                        <p className="mt-2 text-sm text-red-400">{errors.gameFormat.sets.message}</p>
                      )}
                    </div>

                    {scoreType === 'sets_games' && (
                      <div className="sm:col-span-6">
                        <label htmlFor="games" className="block text-sm font-medium text-white">
                          Configuração de Games
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            {...register('gameFormat.games')}
                            id="games"
                            placeholder="Ex: primeiro a 6 games"
                            className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Público-Alvo */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-white">Público-Alvo</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Restrições de gênero e idade
                </p>
              </div>

              <div className="bg-gray-900 shadow-sm ring-1 ring-gray-800 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="gender" className="block text-sm font-medium text-white">
                        Gênero *
                      </label>
                      <div className="mt-2">
                        <select
                          {...register('audience.gender', { required: 'Campo obrigatório' })}
                          id="gender"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="misto">Misto</option>
                          <option value="livre">Livre</option>
                        </select>
                      </div>
                      {errors.audience?.gender && (
                        <p className="mt-2 text-sm text-red-400">{errors.audience.gender.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="minAge" className="block text-sm font-medium text-white">
                        Idade Mínima
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          {...register('audience.minAge', {
                            min: { value: 0, message: 'Idade não pode ser negativa' },
                          })}
                          id="minAge"
                          placeholder="Ex: 18"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.audience?.minAge && (
                        <p className="mt-2 text-sm text-red-400">{errors.audience.minAge.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="maxAge" className="block text-sm font-medium text-white">
                        Idade Máxima
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          {...register('audience.maxAge', {
                            min: { value: 0, message: 'Idade não pode ser negativa' },
                          })}
                          id="maxAge"
                          placeholder="Ex: 65"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.audience?.maxAge && (
                        <p className="mt-2 text-sm text-red-400">{errors.audience.maxAge.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="combinedAge" className="block text-sm font-medium text-white">
                        Idade Combinada (para duplas/equipes)
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          {...register('audience.combinedAge', {
                            min: { value: 0, message: 'Idade não pode ser negativa' },
                          })}
                          id="combinedAge"
                          placeholder="Ex: 80 (soma das idades)"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      {errors.audience?.combinedAge && (
                        <p className="mt-2 text-sm text-red-400">{errors.audience.combinedAge.message}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-400">Soma das idades de todos os participantes da dupla/equipe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
