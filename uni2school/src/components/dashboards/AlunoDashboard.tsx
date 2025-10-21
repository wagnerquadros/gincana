import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, Trophy, Users, LogOut } from 'lucide-react';
import TeamSelection from '../TeamSelection';
import ProvaList from '../ProvaList';
import TeamRanking from '../TeamRanking';

export default function AlunoDashboard() {
  const { userProfile, signOut } = useAuth();
  const { teams, provas, rankingSettings } = useGame();

  const userTeam = teams.find(team => team.members.includes(userProfile?.uid || ''));
  const hasTeam = !!userProfile?.teamId || !!userTeam;

  // Calcular estatísticas das provas
  const userSubmissions = provas.flatMap(prova => 
    prova.submissions.filter(sub => sub.studentId === userProfile?.uid)
  );
  const evaluatedSubmissions = userSubmissions.filter(sub => sub.points !== undefined && sub.isGradeVisible);
  const totalPoints = evaluatedSubmissions.reduce((acc, sub) => acc + (sub.points || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-800">Dashboard do Aluno</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, {userProfile?.displayName}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo à Gincana!
          </h2>
          <p className="text-gray-600">
            Acompanhe suas atividades e pontuação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pontos Totais</p>
                <p className="text-3xl font-bold text-gray-800">{totalPoints}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Atividades</p>
                <p className="text-3xl font-bold text-gray-800">{userSubmissions.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Equipe</p>
                <p className="text-lg font-bold text-gray-800">
                  {userTeam ? userTeam.name : '-'}
                </p>
                {userTeam && (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: userTeam.color }}
                    />
                    <span className="text-xs text-gray-500">
                      {userTeam.totalPoints} pontos
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {!hasTeam ? (
          <TeamSelection onTeamSelected={() => {}} />
        ) : (
          <div className="space-y-8">
            <ProvaList />
            
            {/* Ranking das Equipes */}
            <TeamRanking 
              isVisible={rankingSettings?.isVisible || false}
              showControls={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
