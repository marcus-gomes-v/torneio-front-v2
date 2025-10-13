'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../../../contexts/AuthContext';
import { tournamentsService, Tournament } from '../../../../../../../services/tournaments';
import { sportsService, Sport } from '../../../../../../../services/sports';
import { tournamentRolesService, TournamentRole } from '../../../../../../../services/tournament-roles';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Dialog } from '../../../../../../../components/ui/Dialog';
import { ImageUpload } from '../../../../../../../components/ui/ImageUpload';
import { UserEmailAutocomplete } from '../../../../../../../components/ui/UserEmailAutocomplete';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type TournamentFormData = Omit<Tournament, '_id'>;

interface User {
  _id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface TeamMember {
  user: User | null;
  role: string;
}

interface Location {
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  zipCode: string;
}

export default function EditTournament() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [tournamentRoles, setTournamentRoles] = useState<TournamentRole[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ user: null, role: '' }]);
  const [locations, setLocations] = useState<Location[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TournamentFormData>();


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadSports();
    loadTournamentRoles();
    loadTournament();
  }, [tournamentId]);

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

  const loadTournamentRoles = async () => {
    try {
      const response = await tournamentRolesService.getAll();
      setTournamentRoles(response.data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadTournament = async () => {
    try {
      setLoadingTournament(true);
      const response = await tournamentsService.getOne(tournamentId);
      const tournamentData = response.data;
      setTournament(tournamentData);

      // Set avatar and banner
      setAvatar(tournamentData.avatar || null);
      setBanner(tournamentData.banner || null);

      // Set locations
      setLocations(tournamentData.locations || []);

      // Set team members
      if (tournamentData.team && tournamentData.team.length > 0) {
        setTeamMembers(tournamentData.team.map((member: any) => ({
          user: {
            _id: member.userId,
            email: member.email,
            displayName: member.displayName,
            photoURL: member.photoURL,
          },
          role: member.role,
        })));
      }

      // Format dates to YYYY-MM-DD for date inputs
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      // Extract fee fields from fees Map
      const feeFields: any = {};
      if (tournamentData.fees) {
        Object.entries(tournamentData.fees).forEach(([key, value]) => {
          feeFields[key] = value;
        });
      }

      // Reset form with properly formatted tournament data
      reset({
        ...tournamentData,
        organizationId: orgId,
        sportId: typeof tournamentData.sportId === 'object' ? tournamentData.sportId._id : tournamentData.sportId,
        registrationStartDate: formatDateForInput(tournamentData.registrationStartDate),
        registrationEndDate: formatDateForInput(tournamentData.registrationEndDate),
        gamesStartDate: formatDateForInput(tournamentData.gamesStartDate),
        gamesEndDate: formatDateForInput(tournamentData.gamesEndDate),
        ...feeFields,
      });
    } catch (error) {
      console.error('Erro ao carregar torneio:', error);
      setErrorDialog({ open: true, message: 'Erro ao carregar torneio' });
    } finally {
      setLoadingTournament(false);
    }
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { user: null, role: '' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMemberUser = (index: number, user: User | null) => {
    const updated = [...teamMembers];
    updated[index].user = user;
    setTeamMembers(updated);
  };

  const updateTeamMemberRole = (index: number, role: string) => {
    const updated = [...teamMembers];
    updated[index].role = role;
    setTeamMembers(updated);
  };

  const addLocation = (location: Location) => {
    setLocations([...locations, location]);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TournamentFormData) => {
    try {
      // Remove fields that shouldn't be sent to backend
      const {
        _id,
        createdAt,
        updatedAt,
        __v,
        ownerId,
        fees,
        team: _team,
        locations: _locations,
        ...cleanData
      } = data as any;

      await tournamentsService.update(tournamentId, {
        ...cleanData,
        organizationId: orgId,
        avatar: avatar || undefined,
        banner: banner || undefined,
        team: teamMembers
          .filter(m => m.user && m.role)
          .map(m => ({
            userId: m.user!._id,
            email: m.user!.email,
            displayName: m.user!.displayName,
            role: m.role,
          })),
        locations,
      });
      router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`);
    } catch (error) {
      console.error('Erro ao atualizar torneio:', error);
      setErrorDialog({ open: true, message: 'Erro ao atualizar torneio. Por favor, tente novamente.' });
    }
  };

  if (authLoading || loadingSports || loadingRoles || loadingTournament) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/dashboard/organizations/${orgId}/tournaments/${tournamentId}`)}
          className="inline-flex items-center gap-x-2 text-sm font-semibold text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Torneio
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Editar Torneio</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="divide-y divide-white/10">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">Informações Gerais</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Dados básicos sobre o torneio.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Name */}
                    <div className="sm:col-span-4">
                      <label htmlFor="name" className="block text-sm/6 font-medium text-white">
                        Nome do Torneio *
                      </label>
                      <div className="mt-2">
                        <input
                          id="name"
                          type="text"
                          {...register('name', { required: 'Campo obrigatório' })}
                          placeholder="Ex: Campeonato Regional 2024"
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
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
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
                          Visível
                        </label>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="col-span-full">
                      <ImageUpload
                        label="Avatar"
                        value={avatar || undefined}
                        onChange={setAvatar}
                        helpText="Logo que representa o torneio. Recomendado: 400x400px"
                      />
                    </div>

                    {/* Banner */}
                    <div className="col-span-full">
                      <ImageUpload
                        label="Cartaz"
                        value={banner || undefined}
                        onChange={setBanner}
                        helpText="Imagem de capa do torneio. Recomendado: 1920x400px"
                      />
                    </div>

                    {/* Player Info */}
                    <div className="col-span-full">
                      <label htmlFor="playerInfo" className="block text-sm/6 font-medium text-white">
                        Informações e observações aos jogadores
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="playerInfo"
                          {...register('playerInfo')}
                          rows={4}
                          placeholder="Informações adicionais sobre os jogadores..."
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="sm:col-span-3">
                      <label htmlFor="registrationStartDate" className="block text-sm/6 font-medium text-white">
                        Início das inscrições *
                      </label>
                      <div className="mt-2">
                        <input
                          id="registrationStartDate"
                          type="date"
                          {...register('registrationStartDate', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.registrationStartDate ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.registrationStartDate && (
                        <p className="mt-2 text-sm text-red-400">{errors.registrationStartDate.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="registrationEndDate" className="block text-sm/6 font-medium text-white">
                        Fim das inscrições *
                      </label>
                      <div className="mt-2">
                        <input
                          id="registrationEndDate"
                          type="date"
                          {...register('registrationEndDate', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.registrationEndDate ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.registrationEndDate && (
                        <p className="mt-2 text-sm text-red-400">{errors.registrationEndDate.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="gamesStartDate" className="block text-sm/6 font-medium text-white">
                        Início dos jogos *
                      </label>
                      <div className="mt-2">
                        <input
                          id="gamesStartDate"
                          type="date"
                          {...register('gamesStartDate', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.gamesStartDate ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.gamesStartDate && (
                        <p className="mt-2 text-sm text-red-400">{errors.gamesStartDate.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="gamesEndDate" className="block text-sm/6 font-medium text-white">
                        Fim dos jogos *
                      </label>
                      <div className="mt-2">
                        <input
                          id="gamesEndDate"
                          type="date"
                          {...register('gamesEndDate', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.gamesEndDate ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        />
                      </div>
                      {errors.gamesEndDate && (
                        <p className="mt-2 text-sm text-red-400">{errors.gamesEndDate.message}</p>
                      )}
                    </div>

                    {/* Automate Checkbox */}
                    <div className="col-span-full">
                      <div className="flex items-center gap-x-3">
                        <input
                          id="automate"
                          type="checkbox"
                          {...register('automate')}
                          className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                        />
                        <label htmlFor="automate" className="block text-sm/6 font-medium text-white">
                          Automatizar abertura e encerramento das inscrições
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1 - Registration Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">1 - Inscrições</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Configurações de inscrição e pagamento.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Who Can Register */}
                    <div className="sm:col-span-3">
                      <label htmlFor="whoCanRegister" className="block text-sm/6 font-medium text-white">
                        Quem pode se inscrever *
                      </label>
                      <div className="mt-2">
                        <select
                          id="whoCanRegister"
                          {...register('whoCanRegister', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.whoCanRegister ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        >
                          <option value="" className="bg-gray-900">Selecione...</option>
                          <option value="1" className="bg-gray-900">Apenas administradores podem inscrever os jogadores no torneio</option>
                          <option value="2" className="bg-gray-900">Apenas jogadores que pertencem ao ranking</option>
                          <option value="3" className="bg-gray-900">Apenas membros associados a este perfil</option>
                          <option value="4" className="bg-gray-900">Qualquer jogador da plataforma</option>
                        </select>
                      </div>
                      {errors.whoCanRegister && (
                        <p className="mt-2 text-sm text-red-400">{errors.whoCanRegister.message}</p>
                      )}
                    </div>

                    {/* Max Categories Per Player */}
                    <div className="sm:col-span-3">
                      <label htmlFor="maxCategoriesPerPlayer" className="block text-sm/6 font-medium text-white">
                        Máximo de categorias por jogador *
                      </label>
                      <div className="mt-2">
                        <select
                          id="maxCategoriesPerPlayer"
                          {...register('maxCategoriesPerPlayer', {
                            required: 'Campo obrigatório',
                            valueAsNumber: true,
                          })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.maxCategoriesPerPlayer ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        >
                          <option value="" className="bg-gray-900">Selecione...</option>
                          <option value="1" className="bg-gray-900">1</option>
                          <option value="2" className="bg-gray-900">2</option>
                          <option value="3" className="bg-gray-900">3</option>
                          <option value="4" className="bg-gray-900">4</option>
                          <option value="5" className="bg-gray-900">5</option>
                          <option value="6" className="bg-gray-900">6</option>
                          <option value="7" className="bg-gray-900">7</option>
                        </select>
                      </div>
                      {errors.maxCategoriesPerPlayer && (
                        <p className="mt-2 text-sm text-red-400">{errors.maxCategoriesPerPlayer.message}</p>
                      )}
                    </div>

                    {/* Fee Kind - Registration Value Type */}
                    <div className="sm:col-span-3">
                      <label htmlFor="feeKind" className="block text-sm/6 font-medium text-white">
                        Valor da inscrição *
                      </label>
                      <div className="mt-2">
                        <select
                          id="feeKind"
                          {...register('feeKind', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.feeKind ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        >
                          <option value="" className="bg-gray-900">Selecione...</option>
                          <option value="1" className="bg-gray-900">Fixo com cobrança única para a dupla/equipe</option>
                          <option value="2" className="bg-gray-900">Fixo com cobrança separada para cada jogador da dupla</option>
                          <option value="3" className="bg-gray-900">Variável de acordo com o número da inscrição</option>
                        </select>
                      </div>
                      {errors.feeKind && (
                        <p className="mt-2 text-sm text-red-400">{errors.feeKind.message}</p>
                      )}
                    </div>

                    {/* Charging Kind - Payment Method */}
                    <div className="sm:col-span-3">
                      <label htmlFor="chargingKind" className="block text-sm/6 font-medium text-white">
                        Forma de cobrança *
                      </label>
                      <div className="mt-2">
                        <select
                          id="chargingKind"
                          {...register('chargingKind', { required: 'Campo obrigatório' })}
                          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                            errors.chargingKind ? 'outline-red-500' : 'outline-white/10'
                          } focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                        >
                          <option value="" className="bg-gray-900">Selecione...</option>
                          <option value="1" className="bg-gray-900">Não farei o recebimento via plataforma</option>
                          <option value="2" className="bg-gray-900">Cartão de Crédito</option>
                          <option value="3" className="bg-gray-900">PIX</option>
                          <option value="4" className="bg-gray-900">Cartão de Crédito e PIX</option>
                        </select>
                      </div>
                      {errors.chargingKind && (
                        <p className="mt-2 text-sm text-red-400">{errors.chargingKind.message}</p>
                      )}
                    </div>

                    {/* Variable Registration Fields - Show only if feeKind is 3 */}
                    {watch('feeKind') === '3' && watch('maxCategoriesPerPlayer') && (
                      <>
                        {Array.from({ length: parseInt(String(watch('maxCategoriesPerPlayer') || '0')) }, (_, index) => {
                          const position = index + 1;
                          const fieldName = `fee_${position}` as any;
                          const positionLabel = position === 1 ? '1ª' : position === 2 ? '2ª' : position === 3 ? '3ª' : `${position}ª`;

                          return (
                            <div key={position} className="sm:col-span-3">
                              <label htmlFor={fieldName} className="block text-sm/6 font-medium text-white">
                                {positionLabel} inscrição *
                              </label>
                              <div className="mt-2">
                                <input
                                  id={fieldName}
                                  type="number"
                                  step="0.01"
                                  {...register(fieldName, {
                                    required: 'Campo obrigatório',
                                    valueAsNumber: true,
                                  })}
                                  placeholder="0.00"
                                  className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
                                    (errors as any)[fieldName] ? 'outline-red-500' : 'outline-white/10'
                                  } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                                />
                              </div>
                              {(errors as any)[fieldName] && (
                                <p className="mt-2 text-sm text-red-400">{(errors as any)[fieldName].message}</p>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2 - Location Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">2 - Local do Torneio</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Ao definir o local do torneio os jogadores poderão ver o endereço no mapa
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="space-y-4">
                    {locations.map((location, index) => (
                      <div key={index} className="flex items-start justify-between rounded-lg bg-white/5 p-4">
                        <div className="text-sm text-white">
                          <p className="font-medium">{location.street}</p>
                          <p className="text-gray-400">
                            {location.neighborhood && `${location.neighborhood}, `}
                            {location.city} - {location.state}
                          </p>
                          {location.zipCode && <p className="text-gray-400">CEP: {location.zipCode}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}

                    <LocationForm onAdd={addLocation} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3 - Team Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">3 - Equipe</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  A equipe de gestão do torneio é exposta no perfil e nas inscrições
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="space-y-6">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="space-y-4 rounded-lg bg-white/5 p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm/6 font-medium text-white">
                              E-mail do membro *
                            </label>
                            <div className="mt-2">
                              <UserEmailAutocomplete
                                value={member.user}
                                onChange={(user) => updateTeamMemberUser(index, user)}
                                placeholder="Digite o e-mail e selecione o usuário"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                              Digite o @ para buscar usuários cadastrados
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm/6 font-medium text-white">
                              Cargo *
                            </label>
                            <div className="mt-2">
                              <select
                                value={member.role}
                                onChange={(e) => updateTeamMemberRole(index, e.target.value)}
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                              >
                                <option value="" className="bg-gray-900">Selecione...</option>
                                {tournamentRoles.map((role) => (
                                  <option key={role._id} value={role.value} className="bg-gray-900">
                                    {role.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        {teamMembers.length > 1 && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeTeamMember(index)}
                              className="inline-flex items-center gap-x-2 rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="inline-flex items-center gap-x-2 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400"
                    >
                      <Plus className="h-4 w-4" />
                      Pessoa
                    </button>

                    <div className="pt-4">
                      <div className="flex items-center gap-x-3">
                        <input
                          id="showTeamContact"
                          type="checkbox"
                          {...register('showTeamContact')}
                          className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                        />
                        <label htmlFor="showTeamContact" className="block text-sm/6 font-medium text-white">
                          Exibir e-mail e telefone para contato?
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 - Automations Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">4 - Automações</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Configure automações e permissões do torneio.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-x-3">
                      <input
                        id="allowWaitingList"
                        type="checkbox"
                        {...register('allowWaitingList')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="allowWaitingList" className="block text-sm/6 text-white">
                        Permite fila de espera?
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="automaticWaitingListInclusion"
                        type="checkbox"
                        {...register('automaticWaitingListInclusion')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="automaticWaitingListInclusion" className="block text-sm/6 text-white">
                        Automatizar inclusão dos jogadores da fila de espera
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="hideWaitingListPlayers"
                        type="checkbox"
                        {...register('hideWaitingListPlayers')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="hideWaitingListPlayers" className="block text-sm/6 text-white">
                        Não exibir os inscritos da fila de espera para jogadores
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="allowTimeRestrictions"
                        type="checkbox"
                        {...register('allowTimeRestrictions')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="allowTimeRestrictions" className="block text-sm/6 text-white">
                        Permitir ao jogador informar suas restrições de horário?
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="showInstagramField"
                        type="checkbox"
                        {...register('showInstagramField')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="showInstagramField" className="block text-sm/6 text-white">
                        Exibe campo para os jogadores informarem o perfil do instagram?
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="provideShirts"
                        type="checkbox"
                        {...register('provideShirts')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="provideShirts" className="block text-sm/6 text-white">
                        Irei disponibilizar camisetas
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="showOpponentContact"
                        type="checkbox"
                        {...register('showOpponentContact')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="showOpponentContact" className="block text-sm/6 text-white">
                        Jogadores podem visualizar o contato dos adversários?
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="allowPartnerChange"
                        type="checkbox"
                        {...register('allowPartnerChange')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="allowPartnerChange" className="block text-sm/6 text-white">
                        Jogador pode realizar a troca de parceiro?
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="hideRegisteredPlayers"
                        type="checkbox"
                        {...register('hideRegisteredPlayers')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="hideRegisteredPlayers" className="block text-sm/6 text-white">
                        Não exibir os inscritos do torneio para os jogadores
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="requireCPF"
                        type="checkbox"
                        {...register('requireCPF')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="requireCPF" className="block text-sm/6 text-white">
                        Jogador deve informar o CPF ao se inscrever
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="requireCity"
                        type="checkbox"
                        {...register('requireCity')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="requireCity" className="block text-sm/6 text-white">
                        Jogador deve informar sua cidade ao se inscrever
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="autoDeleteUnpaidRegistrations"
                        type="checkbox"
                        {...register('autoDeleteUnpaidRegistrations')}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="autoDeleteUnpaidRegistrations" className="block text-sm/6 text-white">
                        Excluir automaticamente as inscrições realizadas pelo jogador e que não foram pagas em até 24 horas
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 - Customizations Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">5 - Personalizações</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Personalize configurações específicas do torneio.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Who Can Insert Score */}
                    <div className="col-span-full">
                      <label htmlFor="whoCanInsertScore" className="block text-sm/6 font-medium text-white">
                        Quem pode inserir o placar? *
                      </label>
                      <div className="mt-2">
                        <select
                          id="whoCanInsertScore"
                          {...register('whoCanInsertScore')}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        >
                          <option value="admin" className="bg-gray-900">Apenas os administradores</option>
                          <option value="players" className="bg-gray-900">Jogadores</option>
                        </select>
                      </div>
                    </div>

                    {/* Game Scheduling */}
                    <div className="col-span-full">
                      <label htmlFor="gameScheduling" className="block text-sm/6 font-medium text-white">
                        Agendamento dos jogos
                      </label>
                      <div className="mt-2">
                        <select
                          id="gameScheduling"
                          {...register('gameScheduling')}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        >
                          <option value="admin" className="bg-gray-900">Administrador definirá o horário do jogo</option>
                          <option value="automatic" className="bg-gray-900">Agendamento automático</option>
                        </select>
                      </div>
                    </div>

                    {/* Waiting List Orientation */}
                    <div className="col-span-full">
                      <label htmlFor="waitingListOrientation" className="block text-sm/6 font-medium text-white">
                        Orientação fila de espera
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="waitingListOrientation"
                          {...register('waitingListOrientation')}
                          rows={4}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 - Prize and Rules Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-white">6 - Premiação e Regulamento</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  Informações sobre premiação e regras do torneio.
                </p>
              </div>

              <div className="bg-gray-800/50 shadow-xs outline -outline-offset-1 outline-white/10 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Prize Description */}
                    <div className="col-span-full">
                      <label htmlFor="prizeDescription" className="block text-sm/6 font-medium text-white">
                        Descrição da Premiação
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="prizeDescription"
                          {...register('prizeDescription')}
                          rows={4}
                          placeholder="Descreva os prêmios oferecidos..."
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* Total Prize Value */}
                    <div className="col-span-full">
                      <label htmlFor="totalPrizeValue" className="block text-sm/6 font-medium text-white">
                        Valor total da Premiação
                      </label>
                      <div className="mt-2">
                        <input
                          id="totalPrizeValue"
                          type="text"
                          {...register('totalPrizeValue')}
                          placeholder="Ex: R$ 5.000,00"
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* Tournament Rules */}
                    <div className="col-span-full">
                      <label htmlFor="tournamentRules" className="block text-sm/6 font-medium text-white">
                        Regulamento do Torneio
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="tournamentRules"
                          {...register('tournamentRules')}
                          rows={6}
                          placeholder="Descreva o regulamento do torneio..."
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-white/10 px-4 py-4 sm:px-8">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
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

// Location Form Component
function LocationForm({ onAdd }: { onAdd: (location: Location) => void }) {
  const [location, setLocation] = useState<Location>({
    country: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    zipCode: '',
  });

  const handleAdd = () => {
    if (location.street && location.city && location.state && location.country) {
      onAdd(location);
      setLocation({
        country: '',
        state: '',
        city: '',
        neighborhood: '',
        street: '',
        zipCode: '',
      });
    }
  };

  const isValid = location.street && location.city && location.state && location.country;
  const hasAnyValue = location.country || location.state || location.city || location.neighborhood || location.street || location.zipCode;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm/6 font-medium text-white">País</label>
          <input
            type="text"
            value={location.country}
            onChange={(e) => setLocation({ ...location, country: e.target.value })}
            placeholder="Brasil"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
        </div>
        <div>
          <label className="block text-sm/6 font-medium text-white">Estado</label>
          <input
            type="text"
            value={location.state}
            onChange={(e) => setLocation({ ...location, state: e.target.value })}
            placeholder="SP"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
        </div>
        <div>
          <label className="block text-sm/6 font-medium text-white">Cidade</label>
          <input
            type="text"
            value={location.city}
            onChange={(e) => setLocation({ ...location, city: e.target.value })}
            placeholder="São Paulo"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
        </div>
        <div>
          <label className="block text-sm/6 font-medium text-white">Bairro</label>
          <input
            type="text"
            value={location.neighborhood}
            onChange={(e) => setLocation({ ...location, neighborhood: e.target.value })}
            placeholder="Centro"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
        </div>
        <div>
          <label className="block text-sm/6 font-medium text-white">CEP</label>
          <input
            type="text"
            value={location.zipCode}
            onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
            placeholder="00000-000"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
        </div>
        <div>
          <label className="block text-sm/6 font-medium text-white">Rua</label>
          <input
            type="text"
            value={location.street}
            onChange={(e) => setLocation({ ...location, street: e.target.value })}
            placeholder="Rua das Flores, 123"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
        </div>
      </div>
      {hasAnyValue && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {isValid ? 'Campos obrigatórios preenchidos. Clique em adicionar para salvar este local.' : 'Preencha País, Estado, Cidade e Rua para adicionar o local.'}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!isValid}
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}
