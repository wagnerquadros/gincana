import { useState } from 'react';
import { Edit, Trash2, Users, Eye, MoreVertical } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Team } from '../types/user';
import EditTeamModal from './modals/EditTeamModal';
import TeamMembersModal from './modals/TeamMembersModal';
import DeleteTeamModal from './modals/DeleteTeamModal';

export default function TeamManagementList() {
  const { teams, deleteTeam, loading } = useGame();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingMembers, setViewingMembers] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;

    setIsDeleting(true);
    try {
      await deleteTeam(deletingTeam.id);
      setDeletingTeam(null);
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando equipes...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Nenhuma equipe criada
        </h3>
        <p>Crie sua primeira equipe para começar a gincana.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {team.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {team.members.length} membros
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Criada em {team.createdAt.toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingMembers(team)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Ver membros"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Editar equipe"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingTeam(team)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Excluir equipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {team.members.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Membros:</span>
                  <div className="flex flex-wrap gap-1">
                    {team.members.slice(0, 5).map((memberId, index) => (
                      <div
                        key={memberId}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        Membro {index + 1}
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{team.members.length - 5} mais
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <EditTeamModal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
      />

      <TeamMembersModal
        isOpen={!!viewingMembers}
        onClose={() => setViewingMembers(null)}
        team={viewingMembers}
      />

      <DeleteTeamModal
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={handleDeleteTeam}
        teamName={deletingTeam?.name || ''}
        memberCount={deletingTeam?.members.length || 0}
        isLoading={isDeleting}
      />
    </>
  );
}
