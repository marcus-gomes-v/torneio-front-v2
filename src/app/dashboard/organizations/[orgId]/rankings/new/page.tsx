'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { rankingsService, Ranking } from '../../../../../../services/rankings';
import { sportsService, Sport } from '../../../../../../services/sports';
import { ArrowLeft } from 'lucide-react';

type RankingFormData = Omit<Ranking, '_id'>;

type RankingType = 'corrida' | 'tenis' | 'beach-tennis' | 'padel';

export default function NewRanking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<RankingType | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);

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

  const handleTypeSelect = (type: RankingType) => {
    if (type !== 'corrida') return; // Only corrida is active
    setSelectedType(type);
    setValue('type', type);
    setStep('form');
  };

  const onSubmit = async (data: RankingFormData) => {
    try {
      await rankingsService.create({
        ...data,
        organizationId: orgId,
        type: selectedType!,
      });
      router.push(`/dashboard/organizations/${orgId}`);
    } catch (error) {
      console.error('Erro ao criar ranking:', error);
      alert('Erro ao criar ranking. Por favor, tente novamente.');
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            Novo Ranking
          </h1>
          <p className="text-lg text-[#dddcda] opacity-80">
            {step === 'type' ? 'Escolha o tipo de ranking' : 'Preencha os dados do ranking'}
          </p>
        </div>

        {/* Type Selection */}
        {step === 'type' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Corrida - Active */}
            <button
              onClick={() => handleTypeSelect('corrida')}
              className="bg-[#2a2c2e] rounded-lg p-8 border-2 border-[#3a3c3e] hover:border-[#e1b450] transition-all duration-200 text-left"
            >
              <h3 className="text-2xl font-bold text-[#e1b450] mb-2">Corrida</h3>
              <p className="text-[#dddcda] opacity-70">
                Ranking para competições de corrida e atletismo
              </p>
            </button>

            {/* Tenis - Disabled */}
            <div className="bg-[#2a2c2e] rounded-lg p-8 border-2 border-[#3a3c3e] opacity-50 cursor-not-allowed text-left">
              <h3 className="text-2xl font-bold text-[#dddcda] mb-2">Tênis</h3>
              <p className="text-[#dddcda] opacity-70">
                Em breve
              </p>
            </div>

            {/* Beach Tennis - Disabled */}
            <div className="bg-[#2a2c2e] rounded-lg p-8 border-2 border-[#3a3c3e] opacity-50 cursor-not-allowed text-left">
              <h3 className="text-2xl font-bold text-[#dddcda] mb-2">Beach Tennis</h3>
              <p className="text-[#dddcda] opacity-70">
                Em breve
              </p>
            </div>

            {/* Padel - Disabled */}
            <div className="bg-[#2a2c2e] rounded-lg p-8 border-2 border-[#3a3c3e] opacity-50 cursor-not-allowed text-left">
              <h3 className="text-2xl font-bold text-[#dddcda] mb-2">Padel</h3>
              <p className="text-[#dddcda] opacity-70">
                Em breve
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
              <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
                Informações Básicas
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nome do Ranking *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Ex: Ranking Regional de Corrida 2024"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Sport and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Categoria *
                    </label>
                    <input
                      type="text"
                      {...register('category', { required: 'Campo obrigatório' })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="Ex: 5km, 10km, Maratona"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Visible Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('visible')}
                    id="visible"
                    className="w-5 h-5 bg-[#222325] border border-[#3a3c3e] rounded focus:outline-none focus:ring-2 focus:ring-[#e1b450]"
                  />
                  <label htmlFor="visible" className="text-sm font-semibold">
                    Ranking visível publicamente
                  </label>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    {...register('image')}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Descrição
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Descreva o ranking..."
                  />
                </div>
              </div>
            </div>

            {/* Audience */}
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
                    {...register('gender', { required: 'Campo obrigatório' })}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  >
                    <option value="livre">Livre</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="misto">Misto</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
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
                      {...register('minAge', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="Ex: 18"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Idade Máxima
                    </label>
                    <input
                      type="number"
                      {...register('maxAge', { valueAsNumber: true })}
                      className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                      placeholder="Ex: 65"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registration and Prizes */}
            <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
              <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
                Inscrição e Premiação
              </h2>

              <div className="space-y-4">
                {/* Registration Value */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Valor da Inscrição
                  </label>
                  <input
                    type="text"
                    {...register('registrationValue')}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Ex: R$ 50,00 ou Gratuito"
                  />
                </div>

                {/* Prize Value */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Valor do Prêmio
                  </label>
                  <input
                    type="text"
                    {...register('prizeValue')}
                    className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                    placeholder="Ex: R$ 5.000,00"
                  />
                </div>

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
              </div>
            </div>

            {/* Regulations */}
            <div className="bg-[#2a2c2e] rounded-lg p-6 border border-[#3a3c3e]">
              <h2 className="text-2xl font-bold text-[#e1b450] mb-4">
                Regulamento
              </h2>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Complemento do Regulamento
                </label>
                <textarea
                  {...register('regulationsComplement')}
                  rows={6}
                  className="w-full bg-[#222325] border border-[#3a3c3e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#e1b450] transition-colors"
                  placeholder="Informações adicionais sobre o regulamento..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="flex-1 bg-[#3a3c3e] hover:bg-[#4a4c4e] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#1f4baf] hover:bg-[#1a3d8f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando...' : 'Criar Ranking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
