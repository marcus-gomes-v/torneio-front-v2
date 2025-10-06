'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../contexts/AuthContext';
import { organizationsService, Organization } from '../../../../services/organizations';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { PageLayout } from '../../../../components/layout/PageLayout';

type OrganizationFormData = Omit<Organization, '_id'>;

export default function NewOrganization() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      await organizationsService.create(data);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      alert('Erro ao criar organização. Por favor, tente novamente.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f29] to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#e1b450] mx-auto mb-6" size={64} strokeWidth={2} />
          <div className="text-3xl font-semibold text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f29] to-[#0f1419]">
      <PageLayout maxWidth="md">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-[#e1b450] hover:text-[#ffc015] mb-12 transition-all duration-300 group"
        >
          <ArrowLeft size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg font-semibold">Voltar para Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1f4baf] to-[#2557c4] mb-8 shadow-2xl shadow-[#1f4baf]/30">
            <Building2 size={48} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Nova Organização
          </h1>
          <p className="text-xl text-[#a0aec0] max-w-2xl mx-auto leading-relaxed">
            Preencha os dados para criar sua nova organização e começar a gerenciar torneios e rankings
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Basic Information Card */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e1b450] to-[#ffc015] flex items-center justify-center shadow-lg shadow-[#e1b450]/20">
                  <Building2 size={24} className="text-[#0f1419]" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-2xl">Informações Básicas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Type */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                    Tipo de Organização
                    <span className="text-[#e1b450] ml-1">*</span>
                  </label>
                  <select
                    {...register('type', { required: 'Campo obrigatório' })}
                    className={`
                      w-full px-6 py-4
                      bg-[#1a1f29]/50
                      border-2 ${errors.type ? 'border-red-500' : 'border-[#2d3748]'}
                      rounded-xl
                      text-white text-lg font-medium
                      placeholder-[#6a6c6e]
                      focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                      transition-all duration-300
                      hover:border-[#e1b450]/50
                    `}
                  >
                    <option value="" className="bg-[#1a1f29] text-[#a0aec0]">Selecione o tipo...</option>
                    <option value="academia" className="bg-[#1a1f29] text-white">Academia</option>
                    <option value="liga" className="bg-[#1a1f29] text-white">Liga</option>
                    <option value="federacao" className="bg-[#1a1f29] text-white">Federação</option>
                  </select>
                  {errors.type && (
                    <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                    Nome da Organização
                    <span className="text-[#e1b450] ml-1">*</span>
                  </label>
                  <input
                    {...register('name', { required: 'Campo obrigatório' })}
                    type="text"
                    placeholder="Digite o nome da organização"
                    className={`
                      w-full px-6 py-4
                      bg-[#1a1f29]/50
                      border-2 ${errors.name ? 'border-red-500' : 'border-[#2d3748]'}
                      rounded-xl
                      text-white text-lg font-medium
                      placeholder-[#6a6c6e]
                      focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                      transition-all duration-300
                      hover:border-[#e1b450]/50
                    `}
                  />
                  {errors.name && (
                    <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                      Telefone
                      <span className="text-[#e1b450] ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Phone size={20} className="text-[#e1b450]" strokeWidth={2.5} />
                      </div>
                      <input
                        {...register('phone', { required: 'Campo obrigatório' })}
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className={`
                          w-full pl-14 pr-6 py-4
                          bg-[#1a1f29]/50
                          border-2 ${errors.phone ? 'border-red-500' : 'border-[#2d3748]'}
                          rounded-xl
                          text-white text-lg font-medium
                          placeholder-[#6a6c6e]
                          focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                          transition-all duration-300
                          hover:border-[#e1b450]/50
                        `}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                      Email
                      <span className="text-[#e1b450] ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Mail size={20} className="text-[#e1b450]" strokeWidth={2.5} />
                      </div>
                      <input
                        {...register('email', {
                          required: 'Campo obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido',
                          },
                        })}
                        type="email"
                        placeholder="email@exemplo.com"
                        className={`
                          w-full pl-14 pr-6 py-4
                          bg-[#1a1f29]/50
                          border-2 ${errors.email ? 'border-red-500' : 'border-[#2d3748]'}
                          rounded-xl
                          text-white text-lg font-medium
                          placeholder-[#6a6c6e]
                          focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                          transition-all duration-300
                          hover:border-[#e1b450]/50
                        `}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1e2530]/50 to-[#1a1f29]/50 border-[#2d3748] shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <MapPin size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-2xl">Endereço</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Country */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                    País
                    <span className="text-[#e1b450] ml-1">*</span>
                  </label>
                  <input
                    {...register('address.country', { required: 'Campo obrigatório' })}
                    type="text"
                    placeholder="Brasil"
                    className={`
                      w-full px-6 py-4
                      bg-[#1a1f29]/50
                      border-2 ${errors.address?.country ? 'border-red-500' : 'border-[#2d3748]'}
                      rounded-xl
                      text-white text-lg font-medium
                      placeholder-[#6a6c6e]
                      focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                      transition-all duration-300
                      hover:border-[#e1b450]/50
                    `}
                  />
                  {errors.address?.country && (
                    <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {errors.address.country.message}
                    </p>
                  )}
                </div>

                {/* State and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                      Estado
                      <span className="text-[#e1b450] ml-1">*</span>
                    </label>
                    <input
                      {...register('address.state', { required: 'Campo obrigatório' })}
                      type="text"
                      placeholder="SP"
                      className={`
                        w-full px-6 py-4
                        bg-[#1a1f29]/50
                        border-2 ${errors.address?.state ? 'border-red-500' : 'border-[#2d3748]'}
                        rounded-xl
                        text-white text-lg font-medium
                        placeholder-[#6a6c6e]
                        focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                        transition-all duration-300
                        hover:border-[#e1b450]/50
                      `}
                    />
                    {errors.address?.state && (
                      <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {errors.address.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                      Cidade
                      <span className="text-[#e1b450] ml-1">*</span>
                    </label>
                    <input
                      {...register('address.city', { required: 'Campo obrigatório' })}
                      type="text"
                      placeholder="São Paulo"
                      className={`
                        w-full px-6 py-4
                        bg-[#1a1f29]/50
                        border-2 ${errors.address?.city ? 'border-red-500' : 'border-[#2d3748]'}
                        rounded-xl
                        text-white text-lg font-medium
                        placeholder-[#6a6c6e]
                        focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                        transition-all duration-300
                        hover:border-[#e1b450]/50
                      `}
                    />
                    {errors.address?.city && (
                      <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {errors.address.city.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                    Bairro
                    <span className="text-[#e1b450] ml-1">*</span>
                  </label>
                  <input
                    {...register('address.neighborhood', { required: 'Campo obrigatório' })}
                    type="text"
                    placeholder="Centro"
                    className={`
                      w-full px-6 py-4
                      bg-[#1a1f29]/50
                      border-2 ${errors.address?.neighborhood ? 'border-red-500' : 'border-[#2d3748]'}
                      rounded-xl
                      text-white text-lg font-medium
                      placeholder-[#6a6c6e]
                      focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                      transition-all duration-300
                      hover:border-[#e1b450]/50
                    `}
                  />
                  {errors.address?.neighborhood && (
                    <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {errors.address.neighborhood.message}
                    </p>
                  )}
                </div>

                {/* Street and Zip Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                      Rua
                      <span className="text-[#e1b450] ml-1">*</span>
                    </label>
                    <input
                      {...register('address.street', { required: 'Campo obrigatório' })}
                      type="text"
                      placeholder="Rua das Flores, 123"
                      className={`
                        w-full px-6 py-4
                        bg-[#1a1f29]/50
                        border-2 ${errors.address?.street ? 'border-red-500' : 'border-[#2d3748]'}
                        rounded-xl
                        text-white text-lg font-medium
                        placeholder-[#6a6c6e]
                        focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                        transition-all duration-300
                        hover:border-[#e1b450]/50
                      `}
                    />
                    {errors.address?.street && (
                      <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {errors.address.street.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wide">
                      CEP
                      <span className="text-[#e1b450] ml-1">*</span>
                    </label>
                    <input
                      {...register('address.zipCode', { required: 'Campo obrigatório' })}
                      type="text"
                      placeholder="00000-000"
                      className={`
                        w-full px-6 py-4
                        bg-[#1a1f29]/50
                        border-2 ${errors.address?.zipCode ? 'border-red-500' : 'border-[#2d3748]'}
                        rounded-xl
                        text-white text-lg font-medium
                        placeholder-[#6a6c6e]
                        focus:border-[#e1b450] focus:ring-4 focus:ring-[#e1b450]/20
                        transition-all duration-300
                        hover:border-[#e1b450]/50
                      `}
                    />
                    {errors.address?.zipCode && (
                      <p className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {errors.address.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-lg py-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={isSubmitting}
              className="flex-1 text-lg py-6 shadow-2xl shadow-[#e1b450]/20 hover:shadow-[#e1b450]/30 transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={22} strokeWidth={2.5} />
                  <span className="font-semibold">Criando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={22} strokeWidth={2.5} />
                  <span className="font-semibold">Criar Organização</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </PageLayout>
    </div>
  );
}
