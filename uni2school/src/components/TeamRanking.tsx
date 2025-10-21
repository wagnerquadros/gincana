import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy, Medal, Award, Eye, EyeOff, Crown } from 'lucide-react';
import type { TeamRanking } from '../types/user';

interface TeamRankingProps {
  isVisible: boolean;
  onToggleVisibility?: (visible: boolean) => void;
  showControls?: boolean;
}

export default function TeamRanking({ 
  isVisible, 
  onToggleVisibility, 
  showControls = false 
}: TeamRankingProps) {
  const { userProfile } = useAuth();
  const { teams, provas, loading } = useGame();
  const [ranking, setRanking] = useState<TeamRanking[]>([]);

  // Calcular pontuação das equipes baseado nas provas avaliadas
  useEffect(() => {
    if (teams.length === 0) {
      setRanking([]);
      return;
    }

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

    const teamsWithPoints = teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      totalPoints: calculateTeamPoints(team.id),
      memberCount: team.members.length,
    }));

    // Ordenar por pontuação (decrescente)
    const sortedTeams = teamsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

    // Adicionar posição
    const rankedTeams = sortedTeams.map((team, index) => ({
      ...team,
      position: index + 1,
    }));

    setRanking(rankedTeams);
  }, [teams, provas]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600 bg-gray-100 rounded-full">
          {position}
        </span>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'border-yellow-400 bg-yellow-50';
      case 2:
        return 'border-gray-300 bg-gray-50';
      case 3:
        return 'border-amber-400 bg-amber-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (!isVisible) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <EyeOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Ranking Oculto
          </h3>
          <p className="text-gray-600">
            O ranking das equipes está temporariamente oculto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-800">
            Ranking das Equipes
          </h3>
        </div>
        {showControls && onToggleVisibility && (
          <button
            onClick={() => onToggleVisibility(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <EyeOff className="w-4 h-4" />
            Ocultar
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando ranking...</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            Nenhuma pontuação ainda
          </h4>
          <p>As pontuações aparecerão aqui conforme as provas forem avaliadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((team) => (
            <div
              key={team.teamId}
              className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getPositionColor(team.position)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getPositionIcon(team.position)}
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.teamColor }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {team.teamName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {team.memberCount} {team.memberCount === 1 ? 'membro' : 'membros'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-800">
                      {team.totalPoints}
                    </span>
                    <span className="text-sm text-gray-600">pts</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {ranking.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total de {ranking.length} equipes</span>
            <span>
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
