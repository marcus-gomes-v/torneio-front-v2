'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../contexts/AuthContext';
import { organizationsService, Organization } from '../../../../services/organizations';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Dialog } from '../../../../components/ui/Dialog';
import { ImageUpload } from '../../../../components/ui/ImageUpload';

type OrganizationFormData = Omit<Organization, '_id'>;

export default function NewOrganization() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
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
      const organizationData = {
        ...data,
        profileImage: profileImage || undefined,
        coverImage: coverImage || undefined,
      };
      await organizationsService.create(organizationData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      setErrorDialog({ open: true, message: 'Erro ao criar organização. Por favor, tente novamente.' });
    }
  };

  if (authLoading) {
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Dashboard
        </button>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="divide-y divide-white/10">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Informações Básicas</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Dados essenciais sobre a organização que serão exibidos publicamente.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Type */}
                    <div className="sm:col-span-3">
                      <label htmlFor="type" className="block text-sm/6 font-medium text-white">
                        Tipo de Organização
                      </label>
                      <div className="mt-2">
                        <select
                          id="type"
                          {...register('type', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.type ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        >
                          <option value="" className="bg-gray-900">Selecione o tipo...</option>
                          <option value="academia" className="bg-gray-900">Academia</option>
                          <option value="liga" className="bg-gray-900">Liga</option>
                          <option value="federacao" className="bg-gray-900">Federação</option>
                        </select>
                      </div>
                      {errors.type && (
                        <p className="mt-2 text-sm text-red-400">{errors.type.message}</p>
                      )}
                    </div>

                    {/* Name */}
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm/6 font-medium text-white">
                        Nome da Organização
                      </label>
                      <div className="mt-2">
                        <input
                          id="name"
                          type="text"
                          {...register('name', { required: 'Campo obrigatório' })}
                          placeholder="Digite o nome"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.name ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm/6 font-medium text-white">
                        Telefone
                      </label>
                      <div className="mt-2">
                        <input
                          id="phone"
                          type="tel"
                          {...register('phone', { required: 'Campo obrigatório' })}
                          placeholder="(00) 00000-0000"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.phone ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-400">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm/6 font-medium text-white">
                        Email
                      </label>
                      <div className="mt-2">
                        <input
                          id="email"
                          type="email"
                          {...register('email', {
                            required: 'Campo obrigatório',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email inválido',
                            },
                          })}
                          placeholder="email@exemplo.com"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.email ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Profile Picture */}
                    <div className="col-span-full">
                      <ImageUpload
                        label="Foto de Perfil"
                        value={profileImage || undefined}
                        onChange={setProfileImage}
                        helpText="Imagem que representa a organização. Recomendado: 400x400px"
                      />
                    </div>

                    {/* Cover Image */}
                    <div className="col-span-full">
                      <ImageUpload
                        label="Banner de Capa"
                        value={coverImage || undefined}
                        onChange={setCoverImage}
                        helpText="Imagem de fundo para o perfil. Recomendado: 1200x400px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Endereço</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Localização completa da organização para contato.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Country */}
                    <div className="sm:col-span-3">
                      <label htmlFor="country" className="block text-sm/6 font-medium text-white">
                        País
                      </label>
                      <div className="mt-2">
                        <input
                          id="country"
                          type="text"
                          {...register('address.country', { required: 'Campo obrigatório' })}
                          placeholder="Brasil"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.address?.country ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.address?.country && (
                        <p className="mt-2 text-sm text-red-400">{errors.address.country.message}</p>
                      )}
                    </div>

                    {/* State */}
                    <div className="sm:col-span-3">
                      <label htmlFor="state" className="block text-sm/6 font-medium text-white">
                        Estado
                      </label>
                      <div className="mt-2">
                        <input
                          id="state"
                          type="text"
                          {...register('address.state', { required: 'Campo obrigatório' })}
                          placeholder="SP"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.address?.state ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.address?.state && (
                        <p className="mt-2 text-sm text-red-400">{errors.address.state.message}</p>
                      )}
                    </div>

                    {/* City */}
                    <div className="sm:col-span-2 sm:col-start-1">
                      <label htmlFor="city" className="block text-sm/6 font-medium text-white">
                        Cidade
                      </label>
                      <div className="mt-2">
                        <input
                          id="city"
                          type="text"
                          {...register('address.city', { required: 'Campo obrigatório' })}
                          placeholder="São Paulo"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.address?.city ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.address?.city && (
                        <p className="mt-2 text-sm text-red-400">{errors.address.city.message}</p>
                      )}
                    </div>

                    {/* Neighborhood */}
                    <div className="sm:col-span-2">
                      <label htmlFor="neighborhood" className="block text-sm/6 font-medium text-white">
                        Bairro
                      </label>
                      <div className="mt-2">
                        <input
                          id="neighborhood"
                          type="text"
                          {...register('address.neighborhood', { required: 'Campo obrigatório' })}
                          placeholder="Centro"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.address?.neighborhood ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.address?.neighborhood && (
                        <p className="mt-2 text-sm text-red-400">{errors.address.neighborhood.message}</p>
                      )}
                    </div>

                    {/* Zip Code */}
                    <div className="sm:col-span-2">
                      <label htmlFor="zipCode" className="block text-sm/6 font-medium text-white">
                        CEP
                      </label>
                      <div className="mt-2">
                        <input
                          id="zipCode"
                          type="text"
                          {...register('address.zipCode', { required: 'Campo obrigatório' })}
                          placeholder="00000-000"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.address?.zipCode ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.address?.zipCode && (
                        <p className="mt-2 text-sm text-red-400">{errors.address.zipCode.message}</p>
                      )}
                    </div>

                    {/* Street */}
                    <div className="col-span-full">
                      <label htmlFor="street" className="block text-sm/6 font-medium text-white">
                        Rua
                      </label>
                      <div className="mt-2">
                        <input
                          id="street"
                          type="text"
                          {...register('address.street', { required: 'Campo obrigatório' })}
                          placeholder="Rua das Flores, 123"
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.address?.street ? 'outline-red-500' : 'outline-white/10'
                          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.address?.street && (
                        <p className="mt-2 text-sm text-red-400">{errors.address.street.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-white/10 px-4 py-4 sm:px-8">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="text-sm/6 font-semibold text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Organização'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Error Dialog */}
        <Dialog
          open={errorDialog.open}
          onClose={() => setErrorDialog({ open: false, message: '' })}
          title="Erro"
          description={errorDialog.message}
        />
      </div>
    </div>
  );
}
