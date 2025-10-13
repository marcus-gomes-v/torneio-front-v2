'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesService, Category } from '@/services/categories';
import { ArrowLeft, Pencil, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CategoryDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && categoryId) {
      loadCategory();
    }
  }, [user, categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getOne(categoryId);
      setCategory(response.data);
    } catch (err) {
      setError('Erro ao carregar categoria');
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

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">{error || 'Categoria não encontrada'}</p>
          <Button variant="primary" onClick={loadCategory} className="mt-4">
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
          onClick={() => router.back()}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        {/* Category Header */}
        <div className="mb-12">
          <div className="overflow-hidden rounded-lg bg-gray-900 shadow-sm">
            {/* Banner/Image */}
            {category.image && (
              <div className="relative h-48 overflow-hidden">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
              </div>
            )}

            {/* Info */}
            <div className="px-6 py-8">
              <div className="flex items-center gap-x-6 mb-8">
                <div className={`relative ${category.image ? '-mt-20' : ''} flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-3xl font-bold text-white shadow-lg`}>
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <Trophy className="h-12 w-12" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-white">{category.name}</h1>
                  <p className="mt-1 text-sm text-gray-400">Detalhes da categoria</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/categories/${categoryId}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar Categoria
                </Button>
              </div>

              {/* Info Grid */}
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Trophy className="h-4 w-4" />
                    Modelo de Disputa
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {getDisputeModelLabel(category.disputeModel)}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Users className="h-4 w-4" />
                    Formato do Jogo
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white capitalize">
                    {category.gameFormat.type}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    <Users className="h-4 w-4" />
                    Limite de Participantes
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {category.participantLimit}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                    Gênero
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    {getGenderLabel(category.audience.gender)}
                  </dd>
                </div>
              </dl>

              {/* Schedule Section */}
              <div className="mt-6">
                <h3 className="text-base font-semibold text-white mb-4">Cronograma</h3>
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                    <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Inscrições
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {formatDate(category.schedule.registrationStart)} - {formatDate(category.schedule.registrationEnd)}
                    </dd>
                  </div>
                  <div className="overflow-hidden rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                    <dt className="flex items-center gap-x-2 text-sm font-medium text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Jogos
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {formatDate(category.schedule.gamesStart)} - {formatDate(category.schedule.gamesEnd)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Game Format Details */}
              <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Formato do Jogo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Tipo de Pontuação:</span>
                    <span className="ml-2 font-medium text-white">{category.gameFormat.scoreType === 'sets_games' ? 'Sets e Games' : 'Sets e Pontos'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sets:</span>
                    <span className="ml-2 font-medium text-white">{category.gameFormat.sets}</span>
                  </div>
                  {category.gameFormat.games && (
                    <div>
                      <span className="text-gray-400">Games:</span>
                      <span className="ml-2 font-medium text-white">{category.gameFormat.games}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audience Details */}
              <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Público-Alvo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {category.audience.minAge && (
                    <div>
                      <span className="text-gray-400">Idade Mínima:</span>
                      <span className="ml-2 font-medium text-white">{category.audience.minAge} anos</span>
                    </div>
                  )}
                  {category.audience.maxAge && (
                    <div>
                      <span className="text-gray-400">Idade Máxima:</span>
                      <span className="ml-2 font-medium text-white">{category.audience.maxAge} anos</span>
                    </div>
                  )}
                  {category.audience.combinedAge && (
                    <div>
                      <span className="text-gray-400">Idade Combinada:</span>
                      <span className="ml-2 font-medium text-white">{category.audience.combinedAge} anos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Round Robin Details */}
              {category.roundRobin && (
                <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Configuração Round Robin</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Número de Grupos:</span>
                      <span className="ml-2 font-medium text-white">{category.roundRobin.numberOfGroups}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Classificados por Grupo:</span>
                      <span className="ml-2 font-medium text-white">{category.roundRobin.qualifiedPerGroup}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Options */}
              {(category.randomTeams || category.teamRaffleCriteria) && (
                <div className="mt-6 rounded-lg bg-gray-800/50 px-4 py-5 sm:p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Opções Adicionais</h3>
                  <div className="space-y-2 text-sm">
                    {category.randomTeams && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-white">Times Aleatórios Habilitado</span>
                      </div>
                    )}
                    {category.teamRaffleCriteria && (
                      <div>
                        <span className="text-gray-400">Critério de Sorteio:</span>
                        <span className="ml-2 font-medium text-white">{category.teamRaffleCriteria}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
