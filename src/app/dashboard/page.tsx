'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { organizationsService, Organization } from '../../services/organizations';
import { Trash2, Edit, Eye, Plus, LogOut, Building2, Mail, Phone, MapPin, Trophy, Users, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; org: Organization | null }>({ open: false, org: null });
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadOrganizations();
    }
  }, [user]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsService.getAll();
      setOrganizations(response.data);
    } catch (err) {
      setError('Erro ao carregar organizações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.org) return;

    try {
      setDeleting(true);
      await organizationsService.delete(deleteDialog.org._id);
      setOrganizations(organizations.filter(org => org._id !== deleteDialog.org!._id));
      setDeleteDialog({ open: false, org: null });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const getTypeLabel = (type: string) => {
    const types = {
      academia: 'Academia',
      liga: 'Liga',
      federacao: 'Federação'
    };
    return types[type as keyof typeof types] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      academia: 'bg-blue-500/10 text-blue-400 inset-ring inset-ring-blue-500/20',
      liga: 'bg-purple-500/10 text-purple-400 inset-ring inset-ring-purple-500/20',
      federacao: 'bg-green-500/10 text-green-400 inset-ring inset-ring-green-500/20'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 inset-ring inset-ring-gray-500/20';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">{error}</p>
          <Button variant="primary" onClick={loadOrganizations} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-sm font-semibold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">{user?.name}</h1>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLogoutDialog(true)}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-gray-900 px-4 py-5 shadow-sm sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-400">Organizações</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{organizations.length}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-gray-900 px-4 py-5 shadow-sm sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-400">Torneios</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">0</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-gray-900 px-4 py-5 shadow-sm sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-400">Atletas</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">0</dd>
          </div>
        </dl>
      </div>

      {/* Organizations Section */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold text-white">Minhas Organizações</h2>
            <p className="mt-2 text-sm text-gray-400">
              {organizations.length === 0
                ? 'Nenhuma organização cadastrada'
                : `${organizations.length} ${organizations.length === 1 ? 'organização' : 'organizações'}`}
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button variant="primary" onClick={() => router.push('/dashboard/organizations/new')}>
              <Plus className="h-4 w-4" />
              Nova Organização
            </Button>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="mt-6 text-center">
            <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900 px-6 py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-4 text-sm font-semibold text-white">Nenhuma organização</h3>
              <p className="mt-2 text-sm text-gray-400">
                Comece criando sua primeira organização
              </p>
              <div className="mt-6">
                <Button variant="primary" onClick={() => router.push('/dashboard/organizations/new')}>
                  <Plus className="h-4 w-4" />
                  Nova Organização
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ul role="list" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <li key={org._id} className="col-span-1 divide-y divide-gray-800 rounded-lg bg-gray-900 shadow-sm">
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-x-4 mb-6">
                    <div className="flex items-center gap-x-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-xl font-bold text-white shadow-lg">
                        {org.profileImage ? (
                          <img src={org.profileImage} alt={org.name} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          org.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-white">{org.name}</h3>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${getTypeBadgeColor(org.type)}`}>
                      <Building2 className="h-3 w-3" />
                      {getTypeLabel(org.type)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-x-2 text-xs text-gray-400">
                      <Mail className="h-4 w-4" />
                      <p className="truncate">{org.email}</p>
                    </div>
                    <div className="flex items-center gap-x-2 text-xs text-gray-400">
                      <Phone className="h-4 w-4" />
                      <p>{org.phone}</p>
                    </div>
                    <div className="flex items-center gap-x-2 text-xs text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <p>{org.address.city}, {org.address.state}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="-mt-px flex divide-x divide-gray-800">
                  <div className="flex w-0 flex-1">
                    <button
                      onClick={() => router.push(`/dashboard/organizations/${org._id}`)}
                      className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-300 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </button>
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      onClick={() => router.push(`/dashboard/organizations/${org._id}/edit`)}
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-2 border border-transparent py-4 text-sm font-semibold text-gray-300 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      onClick={() => setDeleteDialog({ open: true, org })}
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, org: null })}
        title="Deletar Organização"
        description={`Tem certeza que deseja deletar "${deleteDialog.org?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        title="Sair"
        description="Deseja realmente sair da sua conta?"
        onConfirm={handleLogout}
        confirmText="Sair"
        cancelText="Cancelar"
      />
    </div>
  );
}
