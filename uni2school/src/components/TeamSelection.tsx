import { useState } from 'react';
import { Users, Check, X } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

interface TeamSelectionProps {
  onTeamSelected: () => void;
}

export default function TeamSelection({ onTeamSelected }: TeamSelectionProps) {
  const { teams, joinTeam, loading } = useGame();
  const { userProfile } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinTeam = async () => {
    if (!selectedTeamId) return;

    setIsJoining(true);
    try {
      await joinTeam(selectedTeamId);
      onTeamSelected();
    } catch (error) {
      console.error('Erro ao entrar na equipe:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando equipes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Escolha sua Equipe
        </h3>
        <p className="text-gray-600">
          Selecione uma equipe para participar da gincana
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma equipe disponível no momento</p>
          <p className="text-sm mt-2">Aguarde o professor criar as equipes</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                selectedTeamId === team.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{team.name}</h4>
                    <p className="text-sm text-gray-600">{team.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {team.members.length} membros
                  </span>
                  {selectedTeamId === team.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {teams.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={handleJoinTeam}
            disabled={!selectedTeamId || isJoining}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Entrando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Entrar na Equipe
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
