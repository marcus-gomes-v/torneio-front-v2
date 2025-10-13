'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../../../../contexts/AuthContext';
import { categoriesService, Category } from '../../../../../../../../services/categories';
import { rankingsService, Ranking } from '../../../../../../../../services/rankings';
import { categoryTemplatesService, CategoryTemplate } from '../../../../../../../../services/category-templates';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../../../../components/ui/Button';
import { ImageUpload } from '../../../../../../../../components/ui/ImageUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CompatibleCategoriesDialog } from '@/components/ui/CompatibleCategoriesDialog';

type CategoryFormData = Omit<Category, '_id'>;

export default function NewCategory() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;

  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(true);
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CategoryTemplate | null>(null);
  const [showCompatibleDialog, setShowCompatibleDialog] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const disputeModel = watch('disputeModel');
  const gameType = watch('gameFormat.type');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRankings(true);
        setLoadingTemplates(true);
        const [rankingsResponse, templatesResponse] = await Promise.all([
          rankingsService.getAll(orgId),
          categoryTemplatesService.getAll(orgId),
        ]);
        setRankings(rankingsResponse.data);
        setTemplates(templatesResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoadingRankings(false);
        setLoadingTemplates(false);
      }
    };

    if (orgId) {
      fetchData();
    }
  }, [orgId]);

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t._id === templateId);
    if (!template) {
      setSelectedTemplate(null);
      return;
    }

    setSelectedTemplate(template);
    setValue('categoryTemplateId', templateId);
    setValue('name', template.name);
    setValue('gameFormat.type', template.gameFormat.type as 'simples' | 'dupla' | 'equipe');
    setValue('audience.gender', template.audience.gender as 'masculino' | 'feminino' | 'misto' | 'livre');
    if (template.audience.minAge) setValue('audience.minAge', template.audience.minAge);
    if (template.audience.maxAge) setValue('audience.maxAge', template.audience.maxAge);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submitData = {
        ...data,
        rankingId: data.rankingId === 'sem-ranking' ? undefined : data.rankingId,
        tournamentId,
        image: image || undefined,
      };

      await categoriesService.create(submitData);
      router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria. Por favor, tente novamente.');
    }
  };

  if (authLoading || loadingRankings || loadingTemplates) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`)}
              className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Torneio
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl sm:tracking-tight">
                Nova Categoria
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Preencha os dados da categoria do torneio
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold text-white">Template</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Selecione um template pré-configurado (opcional)
                  </p>
                </div>

                <div className="bg-gray-900 shadow-sm ring-1 ring-gray-800 sm:rounded-xl md:col-span-2">
                  <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="template" className="block text-sm font-medium text-white">
                          Usar Template
                        </label>
                        <div className="mt-2">
                          <select
                            id="template"
                            onChange={(e) => applyTemplate(e.target.value)}
                            defaultValue=""
                            className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                          >
                            <option value="">Selecione um template...</option>
                            {templates.map((template) => (
                              <option key={template._id} value={template._id}>
                                {template.name} ({template.level} - {template.gameFormat.type})
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          Ao selecionar um template, os campos serão preenchidos automaticamente
                        </p>
                        {selectedTemplate && (
                          <div className="mt-4 rounded-md bg-indigo-500/10 px-4 py-3 border border-indigo-500/20">
                            <p className="text-sm text-indigo-300">
                              Pode jogar junto com{' '}
                              {Array.isArray(selectedTemplate.compatibleTemplates)
                                ? selectedTemplate.compatibleTemplates.length
                                : 0}{' '}
                              {Array.isArray(selectedTemplate.compatibleTemplates) && selectedTemplate.compatibleTemplates.length === 1 ? 'categoria' : 'categorias'}.
                              {' '}
                              <button
                                type="button"
                                className="font-semibold underline hover:text-indigo-200"
                                onClick={() => setShowCompatibleDialog(true)}
                              >
                                Clique aqui para visualizar
                              </button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
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
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
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

                    {(disputeModel === 'round-robin' || disputeModel === 'grupos-eliminacao') && (
                      <>
                        <div className="sm:col-span-3">
                          <label htmlFor="numberOfGroups" className="block text-sm font-medium text-white">
                            Número de Grupos *
                          </label>
                          <div className="mt-2">
                            <input
                              type="number"
                              {...register('roundRobin.numberOfGroups', {
                                required: disputeModel === 'round-robin' || disputeModel === 'grupos-eliminacao' ? 'Campo obrigatório' : false,
                                min: { value: 2, message: 'Mínimo de 2 grupos' },
                              })}
                              id="numberOfGroups"
                              placeholder="Ex: 4"
                              className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          {errors.roundRobin?.numberOfGroups && (
                            <p className="mt-2 text-sm text-red-400">{errors.roundRobin.numberOfGroups.message}</p>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="qualifiedPerGroup" className="block text-sm font-medium text-white">
                            Classificados por Grupo *
                          </label>
                          <div className="mt-2">
                            <input
                              type="number"
                              {...register('roundRobin.qualifiedPerGroup', {
                                required: disputeModel === 'round-robin' || disputeModel === 'grupos-eliminacao' ? 'Campo obrigatório' : false,
                                min: { value: 1, message: 'Mínimo de 1 classificado' },
                              })}
                              id="qualifiedPerGroup"
                              placeholder="Ex: 2"
                              className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          {errors.roundRobin?.qualifiedPerGroup && (
                            <p className="mt-2 text-sm text-red-400">{errors.roundRobin.qualifiedPerGroup.message}</p>
                          )}
                        </div>
                      </>
                    )}

                    {gameType === 'dupla' && (
                      <div className="sm:col-span-3">
                        <label htmlFor="teamRaffleCriteria" className="block text-sm font-medium text-white">
                          Critério de Sorteio de Duplas
                        </label>
                        <div className="mt-2">
                          <input
                            type="number"
                            {...register('teamRaffleCriteria', {
                              min: { value: 0, message: 'Valor não pode ser negativo' },
                            })}
                            id="teamRaffleCriteria"
                            placeholder="Ex: 5 (diferença máxima de nível)"
                            className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          Diferença máxima de nível permitida para formação automática de duplas
                        </p>
                        {errors.teamRaffleCriteria && (
                          <p className="mt-2 text-sm text-red-400">{errors.teamRaffleCriteria.message}</p>
                        )}
                      </div>
                    )}

                    <div className="sm:col-span-6">
                      <div className="flex items-center gap-x-3">
                        <input
                          type="checkbox"
                          {...register('randomTeams')}
                          id="randomTeams"
                          className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                        />
                        <label htmlFor="randomTeams" className="text-sm font-medium text-white">
                          Sortear equipes/duplas automaticamente
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        Quando ativado, o sistema criará equipes ou duplas aleatoriamente após o encerramento das inscrições
                      </p>
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
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
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
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                        >
                          <option value="sets_games">Sets e Games</option>
                          <option value="sets_pontos">Sets e Pontos</option>
                        </select>
                      </div>
                      {errors.gameFormat?.scoreType && (
                        <p className="mt-2 text-sm text-red-400">{errors.gameFormat.scoreType.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="sets" className="block text-sm font-medium text-white">
                        Sets *
                      </label>
                      <div className="mt-2">
                        <select
                          {...register('gameFormat.sets', { required: 'Campo obrigatório' })}
                          id="sets"
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                        >
                          <option value="">Selecione...</option>
                          <option value="1">1 Set</option>
                          <option value="2">2 Sets + Super Tiebreak</option>
                          <option value="3">3 Sets</option>
                          <option value="4">4 Sets + Super Tiebreak</option>
                          <option value="5">5 Sets</option>
                        </select>
                      </div>
                      {errors.gameFormat?.sets && (
                        <p className="mt-2 text-sm text-red-400">{errors.gameFormat.sets.message}</p>
                      )}
                    </div>

                    {scoreType === 'sets_games' && (
                      <div className="sm:col-span-3">
                        <label htmlFor="games" className="block text-sm font-medium text-white">
                          Games *
                        </label>
                        <div className="mt-2">
                          <select
                            {...register('gameFormat.games', scoreType === 'sets_games' ? { required: 'Campo obrigatório' } : {})}
                            id="games"
                            className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="1">1 Game</option>
                            <option value="201">1 Game com tiebreak no 1 a 1</option>
                            <option value="2">2 Games</option>
                            <option value="102">2 Games com tiebreak no 1 a 1</option>
                            <option value="202">2 Games com tiebreak no 2 a 2</option>
                            <option value="3">3 Games</option>
                            <option value="103">3 Games com tiebreak no 2 a 2</option>
                            <option value="203">3 Games com tiebreak no 3 a 3</option>
                            <option value="4">4 Games</option>
                            <option value="104">4 Games com tiebreak no 3 a 3</option>
                            <option value="204">4 Games com tiebreak no 4 a 4</option>
                            <option value="5">5 Games</option>
                            <option value="105">5 Games com tiebreak no 4 a 4</option>
                            <option value="205">5 Games com tiebreak no 5 a 5</option>
                            <option value="6">6 Games</option>
                            <option value="106">6 Games com tiebreak no 5 a 5</option>
                            <option value="206">6 Games com tiebreak no 6 a 6</option>
                            <option value="7">7 Games</option>
                            <option value="107">7 Games com tiebreak no 6 a 6</option>
                            <option value="207">7 Games com tiebreak no 7 a 7</option>
                            <option value="8">8 Games</option>
                            <option value="108">8 Games com tiebreak no 7 a 7</option>
                            <option value="208">8 Games com tiebreak no 8 a 8</option>
                            <option value="9">9 Games</option>
                            <option value="109">9 Games com tiebreak no 8 a 8</option>
                            <option value="209">9 Games com tiebreak no 9 a 9</option>
                            <option value="10">10 Games</option>
                            <option value="110">10 Games com tiebreak no 9 a 9</option>
                            <option value="210">10 Games com tiebreak no 10 a 10</option>
                            <option value="11">11 Games</option>
                            <option value="111">11 Games com tiebreak no 10 a 10</option>
                            <option value="211">11 Games com tiebreak no 11 a 11</option>
                            <option value="21">21 Games</option>
                          </select>
                        </div>
                        {errors.gameFormat?.games && (
                          <p className="mt-2 text-sm text-red-400">{errors.gameFormat.games.message}</p>
                        )}
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
                          className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm [&>option]:text-gray-900 [&>option]:bg-white"
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

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-x-6 pt-8 border-t border-white/10">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Categoria'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Compatible Categories Dialog */}
      {selectedTemplate && (
        <CompatibleCategoriesDialog
          isOpen={showCompatibleDialog}
          onClose={() => setShowCompatibleDialog(false)}
          selectedTemplate={selectedTemplate}
          allTemplates={templates}
        />
      )}
    </div>
  );
}
