'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../contexts/AuthContext';
import { rankingsService, Ranking } from '../../../../../services/rankings';
import { sportsService, Sport } from '../../../../../services/sports';
import { ArrowLeft } from 'lucide-react';
import { ImageUpload } from '../../../../../components/ui/ImageUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type RankingFormData = Omit<Ranking, '_id'>;

export default function EditRanking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const rankingId = params.rankingId as string;

  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [image, setImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RankingFormData>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadSports();
    loadRanking();
  }, [rankingId]);

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

  const loadRanking = async () => {
    try {
      setLoadingRanking(true);
      const response = await rankingsService.getOne(rankingId);
      const rankingData = response.data;
      setRanking(rankingData);
      setImage(rankingData.image || null);

      // Reset form with ranking data
      reset({
        ...rankingData,
        sportId: typeof rankingData.sportId === 'object' ? (rankingData.sportId as any)._id : rankingData.sportId,
      });
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      alert('Erro ao carregar ranking');
    } finally {
      setLoadingRanking(false);
    }
  };

  const onSubmit = async (data: RankingFormData) => {
    try {
      // Remove fields that shouldn't be sent to backend
      const {
        _id,
        createdAt,
        updatedAt,
        __v,
        ...cleanData
      } = data as any;

      await rankingsService.update(rankingId, {
        ...cleanData,
        image: image || undefined,
      });
      router.push(`/dashboard/organizations/${ranking?.organizationId}`);
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error);
      alert('Erro ao atualizar ranking. Por favor, tente novamente.');
    }
  };

  if (authLoading || loadingSports || loadingRanking) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/dashboard/organizations/${ranking?.organizationId}`)}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Organização
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Editar Ranking</h1>
          <p className="mt-2 text-sm text-gray-400">
            Atualize os dados do ranking
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8 divide-y divide-white/10">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3 pb-8">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Informações Básicas</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Dados principais do ranking.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Name */}
                    <div className="sm:col-span-4">
                      <label htmlFor="name" className="block text-sm/6 font-medium text-white">
                        Nome do Ranking *
                      </label>
                      <div className="mt-2">
                        <input
                          id="name"
                          type="text"
                          {...register('name', { required: 'Campo obrigatório' })}
                          placeholder="Ex: Ranking Regional 2024"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.name ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Sport */}
                    <div className="sm:col-span-3">
                      <label htmlFor="sportId" className="block text-sm/6 font-medium text-white">
                        Esporte *
                      </label>
                      <div className="mt-2">
                        <select
                          id="sportId"
                          {...register('sportId', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.sportId ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 [&>option]:text-gray-900 [&>option]:bg-white`}
                        >
                          <option value="" className="bg-gray-900">Selecione...</option>
                          {sports.map((sport) => (
                            <option key={sport._id} value={sport._id} className="bg-gray-900">
                              {sport.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.sportId && (
                        <p className="mt-2 text-sm text-red-400">{errors.sportId.message}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="sm:col-span-3">
                      <label htmlFor="category" className="block text-sm/6 font-medium text-white">
                        Categoria *
                      </label>
                      <div className="mt-2">
                        <input
                          id="category"
                          type="text"
                          {...register('category', { required: 'Campo obrigatório' })}
                          placeholder="Ex: Profissional, Amador, etc."
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.category ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.category && (
                        <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
                      )}
                    </div>

                    {/* Visible Checkbox */}
                    <div className="col-span-full">
                      <div className="flex items-center gap-x-3">
                        <input
                          id="visible"
                          type="checkbox"
                          {...register('visible')}
                          className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                        />
                        <label htmlFor="visible" className="block text-sm/6 font-medium text-white">
                          Ranking visível publicamente
                        </label>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="col-span-full">
                      <ImageUpload
                        label="Imagem do Ranking"
                        value={image || undefined}
                        onChange={setImage}
                        helpText="Imagem que representa o ranking. Recomendado: 800x400px"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-full">
                      <label htmlFor="description" className="block text-sm/6 font-medium text-white">
                        Descrição
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          {...register('description')}
                          rows={4}
                          placeholder="Descreva o ranking..."
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-8 md:grid-cols-3 pb-8">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Público-Alvo</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Defina o público que pode participar deste ranking.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Gender */}
                    <div className="sm:col-span-3">
                      <label htmlFor="gender" className="block text-sm/6 font-medium text-white">
                        Gênero *
                      </label>
                      <div className="mt-2">
                        <select
                          id="gender"
                          {...register('gender', { required: 'Campo obrigatório' })}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 [&>option]:text-gray-900 [&>option]:bg-white"
                        >
                          <option value="livre" className="bg-gray-900">Livre</option>
                          <option value="masculino" className="bg-gray-900">Masculino</option>
                          <option value="feminino" className="bg-gray-900">Feminino</option>
                          <option value="misto" className="bg-gray-900">Misto</option>
                        </select>
                      </div>
                      {errors.gender && (
                        <p className="mt-2 text-sm text-red-400">{errors.gender.message}</p>
                      )}
                    </div>

                    {/* Age Range */}
                    <div className="sm:col-span-3">
                      <label htmlFor="minAge" className="block text-sm/6 font-medium text-white">
                        Idade Mínima
                      </label>
                      <div className="mt-2">
                        <input
                          id="minAge"
                          type="number"
                          {...register('minAge', { valueAsNumber: true })}
                          placeholder="Ex: 18"
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="maxAge" className="block text-sm/6 font-medium text-white">
                        Idade Máxima
                      </label>
                      <div className="mt-2">
                        <input
                          id="maxAge"
                          type="number"
                          {...register('maxAge', { valueAsNumber: true })}
                          placeholder="Ex: 65"
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration and Prizes */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-8 md:grid-cols-3 pb-8">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Inscrição e Premiação</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Informações sobre valores e prêmios.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Registration Value */}
                    <div className="col-span-full">
                      <label htmlFor="registrationValue" className="block text-sm/6 font-medium text-white">
                        Valor da Inscrição
                      </label>
                      <div className="mt-2">
                        <input
                          id="registrationValue"
                          type="text"
                          {...register('registrationValue')}
                          placeholder="Ex: R$ 50,00 ou Gratuito"
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* Prize Value */}
                    <div className="col-span-full">
                      <label htmlFor="prizeValue" className="block text-sm/6 font-medium text-white">
                        Valor do Prêmio
                      </label>
                      <div className="mt-2">
                        <input
                          id="prizeValue"
                          type="text"
                          {...register('prizeValue')}
                          placeholder="Ex: R$ 5.000,00"
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* Prizes Description */}
                    <div className="col-span-full">
                      <label htmlFor="prizesDescription" className="block text-sm/6 font-medium text-white">
                        Descrição dos Prêmios
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="prizesDescription"
                          {...register('prizesDescription')}
                          rows={4}
                          placeholder="Descreva os prêmios oferecidos..."
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regulations */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-8 md:grid-cols-3 pb-8">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Regulamento</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Informações complementares sobre as regras.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
                    <div className="col-span-full">
                      <label htmlFor="regulationsComplement" className="block text-sm/6 font-medium text-white">
                        Complemento do Regulamento
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="regulationsComplement"
                          {...register('regulationsComplement')}
                          rows={6}
                          placeholder="Informações adicionais sobre o regulamento..."
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-white/10 px-4 py-4 sm:px-8">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/organizations/${ranking?.organizationId}`)}
                    className="text-sm/6 font-semibold text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
