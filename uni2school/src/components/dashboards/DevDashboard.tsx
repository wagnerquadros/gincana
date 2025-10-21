import { useAuth } from '../../contexts/AuthContext';
import { Code2, Database, Settings, Activity, LogOut, Users, Shield } from 'lucide-react';

export default function DevDashboard() {
  const { userProfile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Code2 className="w-8 h-8 text-cyan-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Dev Dashboard - Acesso Total</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                {userProfile?.displayName} (DEV)
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Sistema de Administração
          </h2>
          <p className="text-slate-400">
            Controle total sobre configurações e dados do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Usuários Total</p>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-cyan-900 p-3 rounded-full">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Database Status</p>
                <p className="text-xl font-bold text-green-400">Online</p>
              </div>
              <div className="bg-green-900 p-3 rounded-full">
                <Database className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Permissões</p>
                <p className="text-xl font-bold text-yellow-400">Admin</p>
              </div>
              <div className="bg-yellow-900 p-3 rounded-full">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Sistema</p>
                <p className="text-xl font-bold text-blue-400">Active</p>
              </div>
              <div className="bg-blue-900 p-3 rounded-full">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 hover:border-cyan-500 transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-cyan-900 p-3 rounded-lg">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Gerenciar Usuários</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Visualizar, editar e gerenciar todos os usuários do sistema
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 hover:border-green-500 transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-900 p-3 rounded-lg">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Database Admin</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Acesso direto ao banco de dados e ferramentas de administração
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 hover:border-purple-500 transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-900 p-3 rounded-lg">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Configurações</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Configurações avançadas do sistema e parâmetros globais
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Logs do Sistema
          </h3>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
            <div className="space-y-2">
              <div className="text-green-400">
                [INFO] Sistema inicializado com sucesso
              </div>
              <div className="text-cyan-400">
                [DEBUG] Firebase conectado - projeto: rp-vi-3fb68
              </div>
              <div className="text-blue-400">
                [INFO] Usuário {userProfile?.email} autenticado como DEV
              </div>
              <div className="text-slate-500">
                [INFO] Aguardando atividade...
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
