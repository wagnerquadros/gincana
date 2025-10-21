import { useState } from 'react';
import { X, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Team, MemberInfo } from '../../types/user';

interface TransferMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberInfo | null;
  currentTeam: Team | null;
}

export default function TransferMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  currentTeam 
}: TransferMemberModalProps) {
  const { teams, transferMember } = useGame();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);

  const availableTeams = teams.filter(team => team.id !== currentTeam?.id);

  const handleTransfer = async () => {
    if (!member || !currentTeam || !selectedTeamId) return;

    setIsTransferring(true);
    try {
      await transferMember(member.uid, currentTeam.id, selectedTeamId);
      setSelectedTeamId('');
      onClose();
    } catch (error) {
      console.error('Erro ao transferir membro:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isOpen || !member || !currentTeam) return null;

  const destinationTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Transferir Membro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isTransferring}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do membro */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Membro a ser transferido:</h3>
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {member.displayName || 'Usuário'}
                </p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
            </div>
          </div>

          {/* Equipe atual */}
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Equipe atual:</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentTeam.color }}
              />
              <span className="font-medium text-gray-800">{currentTeam.name}</span>
            </div>
          </div>

          {/* Seleção da equipe de destino */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">
              Transferir para:
            </label>
            {availableTeams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma outra equipe disponível</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition ${
                      selectedTeamId === team.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{team.name}</h4>
                        <p className="text-sm text-gray-600">
                          {team.members.length} membros
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview da transferência */}
          {selectedTeamId && destinationTeam && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: currentTeam.color }}
                  />
                  <p className="text-sm font-medium text-gray-800">{currentTeam.name}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
                <div className="text-center">
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: destinationTeam.color }}
                  />
                  <p className="text-sm font-medium text-gray-800">{destinationTeam.name}</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {member.displayName || 'Usuário'} será transferido
              </p>
            </div>
          )}

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">
                  Confirmação necessária
                </h4>
                <p className="text-sm text-yellow-700">
                  Esta ação moverá o membro permanentemente para a nova equipe. 
                  O membro perderá acesso às provas da equipe atual.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isTransferring}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedTeamId || isTransferring}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {isTransferring ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Transferindo...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Transferir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
