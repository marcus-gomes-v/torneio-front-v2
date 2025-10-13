'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Users, Award, Shield, Zap, BarChart3 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-950 ">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-8">
              <div className="rounded-2xl bg-indigo-600 p-4">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Torneio.app
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-400 sm:text-xl/8">
              Plataforma completa para gerenciamento de torneios esportivos
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-indigo-600 to-violet-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Tudo que você precisa</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Gerencie seus torneios com facilidade
          </p>
          <p className="mt-6 text-lg/8 text-gray-400">
            Uma plataforma completa para organizar, gerenciar e acompanhar torneios esportivos
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                <div className="rounded-lg bg-indigo-600 p-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                Torneios
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                <p className="flex-auto">Crie e gerencie torneios completos com múltiplas categorias e chaves</p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                <div className="rounded-lg bg-indigo-600 p-2">
                  <Award className="h-5 w-5 text-white" />
                </div>
                Rankings
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                <p className="flex-auto">Sistema inteligente para acompanhar desempenho dos atletas</p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                <div className="rounded-lg bg-indigo-600 p-2">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Organizações
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                <p className="flex-auto">Gerencie academias, ligas e federações em um só lugar</p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                <div className="rounded-lg bg-indigo-600 p-2">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Rápido e Eficiente
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                <p className="flex-auto">Interface moderna e intuitiva para agilizar sua gestão</p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                <div className="rounded-lg bg-indigo-600 p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Seguro
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                <p className="flex-auto">Autenticação segura com Google e proteção de dados</p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                <div className="rounded-lg bg-indigo-600 p-2">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Estatísticas
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                <p className="flex-auto">Acompanhe métricas detalhadas em tempo real</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-gray-400">
            Crie sua conta gratuitamente e comece a organizar torneios profissionais hoje mesmo
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Começar Agora
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="border-t border-white/10 pt-8">
          <p className="text-center text-sm/6 text-gray-400">
            © 2025 Torneio.app - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
