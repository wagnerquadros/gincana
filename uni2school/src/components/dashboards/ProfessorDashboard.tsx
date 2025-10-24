import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { GraduationCap, Users, FileText, BarChart3, LogOut, Trophy, Calendar, Eye, EyeOff, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import CreateTeamModal from '../modals/CreateTeamModal';
import CreateProvaModal from '../modals/CreateProvaModal';
import EditProvaModal from '../modals/EditProvaModal';
import DeleteProvaModal from '../modals/DeleteProvaModal';
import TeamManagementList from '../TeamManagementList';
import SubmissionList from '../SubmissionList';
import TeamRanking from '../TeamRanking';
import ReviewList from '../ReviewList';
import type { Prova } from '../../types/user';

export default function ProfessorDashboard() {
  const { userProfile, signOut } = useAuth();
  const { teams, provas, rankingSettings, loading, toggleRankingVisibility, toggleProvaStatus } = useGame();
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateProvaModal, setShowCreateProvaModal] = useState(false);
  const [showEditProvaModal, setShowEditProvaModal] = useState(false);
  const [showDeleteProvaModal, setShowDeleteProvaModal] = useState(false);
  const [selectedProva, setSelectedProva] = useState<Prova | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'provas' | 'evaluations' | 'ranking' | 'reviews'>('overview');

  const totalStudents = teams.reduce((acc, team) => acc + team.members.length, 0);

  // Função para calcular pontuação real das equipes baseada nas provas avaliadas
  const calculateTeamPoints = (teamId: string): number => {
    let totalPoints = 0;
    
    provas.forEach(prova => {
      const teamSubmissions = prova.submissions.filter(
        submission => submission.teamId === teamId && 
        submission.points !== undefined && 
        submission.isGradeVisible
      );
      
      teamSubmissions.forEach(submission => {
        totalPoints += submission.points || 0;
      });
    });
    
    return totalPoints;
  };

  const handleEditProva = (prova: Prova) => {
    setSelectedProva(prova);
    setShowEditProvaModal(true);
  };

  const handleDeleteProva = (prova: Prova) => {
    setSelectedProva(prova);
    setShowDeleteProvaModal(true);
  };

  const handleToggleProvaStatus = async (prova: Prova) => {
    try {
      await toggleProvaStatus(prova.id, !prova.isActive);
    } catch (error) {
      console.error('Erro ao alterar status da prova:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-emerald-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-800">Dashboard do Professor</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, Prof. {userProfile?.displayName}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'teams'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestão de Equipes
            </button>
            <button
              onClick={() => setActiveTab('provas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'provas'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Provas
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'evaluations'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Avaliações
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'ranking'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ranking
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'reviews'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solicitações de Revisão
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Painel de Controle
                </h2>
                <p className="text-gray-600">
                  Gerencie atividades, equipes e avaliações
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateTeamModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  <Users className="w-5 h-5" />
                  Nova Equipe
                </button>
                <button 
                  onClick={() => setShowCreateProvaModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <FileText className="w-5 h-5" />
                  Nova Prova
                </button>
              </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-800">{totalStudents}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Atividades Criadas</p>
                <p className="text-3xl font-bold text-gray-800">{provas.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Equipes</p>
                <p className="text-3xl font-bold text-gray-800">{teams.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avaliações Pendentes</p>
                <p className="text-3xl font-bold text-gray-800">{totalStudents}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Provas Criadas
            </h3>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2">Carregando...</p>
              </div>
            ) : provas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma prova criada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {provas.slice(0, 5).map((prova) => (
                  <div key={prova.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{prova.title}</h4>
                        <p className="text-sm text-gray-600">{prova.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Trophy className="w-4 h-4" />
                          {prova.maxPoints} pts
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {prova.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Equipes Criadas
            </h3>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2">Carregando...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma equipe criada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.members.length} membros</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Trophy className="w-4 h-4" />
                          {calculateTeamPoints(team.id)} pts
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === 'teams' && (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Gestão de Equipes
                </h2>
                <p className="text-gray-600">
                  Gerencie todas as equipes da gincana
                </p>
              </div>
              <button 
                onClick={() => setShowCreateTeamModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                <Users className="w-5 h-5" />
                Nova Equipe
              </button>
            </div>
            <TeamManagementList />
          </div>
        )}

        {activeTab === 'provas' && (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Gestão de Provas
                </h2>
                <p className="text-gray-600">
                  Gerencie todas as provas da gincana
                </p>
              </div>
              <button 
                onClick={() => setShowCreateProvaModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <FileText className="w-5 h-5" />
                Nova Prova
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Provas Criadas
              </h3>
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Carregando...</p>
                </div>
              ) : provas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma prova criada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {provas.map((prova) => (
                    <div key={prova.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-800">{prova.title}</h4>
                            <div className="flex items-center gap-2">
                              {prova.isActive ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                  Ativa
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                  Inativa
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{prova.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {prova.maxPoints} pontos
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {prova.submissions.length} submissões
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {prova.createdAt.toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleProvaStatus(prova)}
                            className={`p-2 rounded-lg transition ${
                              prova.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={prova.isActive ? 'Desativar prova' : 'Ativar prova'}
                          >
                            {prova.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditProva(prova)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar prova"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProva(prova)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir prova"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Avaliações de Provas
              </h2>
              <p className="text-gray-600">
                Avalie as provas submetidas pelos alunos
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando avaliações...</p>
              </div>
            ) : provas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Nenhuma prova criada
                </h3>
                <p>Crie provas para começar a receber submissões dos alunos.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {provas.map((prova) => (
                  <div key={prova.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {prova.title}
                        </h3>
                        <p className="text-gray-600">{prova.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Trophy className="w-4 h-4" />
                          {prova.maxPoints} pontos máximos
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {prova.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <SubmissionList 
                      submissions={prova.submissions} 
                      provaTitle={prova.title}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Ranking das Equipes
                </h2>
                <p className="text-gray-600">
                  Controle a visibilidade do ranking para os alunos
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleRankingVisibility(!rankingSettings?.isVisible)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                    rankingSettings?.isVisible
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {rankingSettings?.isVisible ? (
                    <>
                      <EyeOff className="w-5 h-5" />
                      Ocultar Ranking
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      Mostrar Ranking
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <TeamRanking 
              isVisible={rankingSettings?.isVisible || false}
              showControls={true}
              onToggleVisibility={(visible) => toggleRankingVisibility(visible)}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Solicitações de Revisão
              </h2>
              <p className="text-gray-600">
                Gerencie as solicitações de revisão e contestações das equipes
              </p>
            </div>
            
            <ReviewList showControls={true} />
          </div>
        )}
      </main>

      <CreateTeamModal 
        isOpen={showCreateTeamModal} 
        onClose={() => setShowCreateTeamModal(false)} 
      />
      <CreateProvaModal 
        isOpen={showCreateProvaModal} 
        onClose={() => setShowCreateProvaModal(false)} 
      />
      {selectedProva && (
        <>
          <EditProvaModal 
            isOpen={showEditProvaModal} 
            onClose={() => {
              setShowEditProvaModal(false);
              setSelectedProva(null);
            }}
            prova={selectedProva}
          />
          <DeleteProvaModal 
            isOpen={showDeleteProvaModal} 
            onClose={() => {
              setShowDeleteProvaModal(false);
              setSelectedProva(null);
            }}
            prova={selectedProva}
          />
        </>
      )}
    </div>
  );
}
