'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { rankingsService, Ranking } from '../../../../../../services/rankings';
import { sportsService, Sport } from '../../../../../../services/sports';
import { ArrowLeft, Trophy } from 'lucide-react';
import { ImageUpload } from '../../../../../../components/ui/ImageUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type RankingFormData = Omit<Ranking, '_id'>;

export default function NewRanking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [step, setStep] = useState<'model' | 'form'>('model');
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [image, setImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RankingFormData>({
    defaultValues: {
      organizationId: orgId,
      visible: true,
      gender: 'livre',
      type: 'corrida',
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

  const handleModelSelect = () => {
    setValue('type', 'corrida');
    setStep('form');
  };

  const onSubmit = async (data: RankingFormData) => {
    try {
      await rankingsService.create({
        ...data,
        organizationId: orgId,
        type: 'corrida',
        image: image || undefined,
      });
      router.push(`/dashboard/organizations/${orgId}`);
    } catch (error) {
      console.error('Erro ao criar ranking:', error);
      alert('Erro ao criar ranking. Por favor, tente novamente.');
    }
  };

  if (authLoading || loadingSports) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => step === 'form' ? setStep('model') : router.push(`/dashboard/organizations/${orgId}`)}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 'form' ? 'Voltar para Seleção de Modelo' : 'Voltar para Organização'}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Novo Ranking</h1>
          <p className="mt-2 text-sm text-gray-400">
            {step === 'model' ? 'Escolha o modelo de ranking que deseja configurar' : 'Preencha os dados do ranking'}
          </p>
        </div>

        {/* Model Selection */}
        {step === 'model' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Selecione o Modelo</h2>
              <p className="text-sm text-gray-400">
                Escolha qual formato de ranking você deseja configurar
              </p>
            </div>

            <div className="space-y-4">
              {/* Corrida Model - Active */}
              <button
                onClick={handleModelSelect}
                className="w-full text-left bg-gray-900 rounded-lg p-6 border-2 border-gray-800 hover:border-indigo-500 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                      <Trophy className="h-6 w-6 text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">Corrida</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Os jogadores disputam torneios que valem pontos para o ranking, e ao término de cada torneio é atualizada a classificação.
                      Este é o modelo mais comum para rankings baseados em torneios.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </button>

              {/* Future Models - Coming Soon */}
              <div className="bg-gray-900/50 rounded-lg p-6 border-2 border-gray-800 opacity-50 cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                      <Trophy className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Outros Modelos</h3>
                    <p className="text-sm text-gray-600">
                      Novos modelos de ranking estarão disponíveis em breve
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
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
                      onClick={() => setStep('model')}
                      className="text-sm/6 font-semibold text-white"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Criando...' : 'Criar Ranking'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
