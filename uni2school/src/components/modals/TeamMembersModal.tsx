import { useState, useEffect } from 'react';
import { X, Users, User, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Team, MemberInfo } from '../../types/user';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import TransferMemberModal from './TransferMemberModal';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export default function TeamMembersModal({ isOpen, onClose, team }: TeamMembersModalProps) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferringMember, setTransferringMember] = useState<MemberInfo | null>(null);

  useEffect(() => {
    if (isOpen && team) {
      loadMembers();
    }
  }, [isOpen, team]);

  const loadMembers = async () => {
    if (!team) return;

    setLoading(true);
    try {
      const memberPromises = team.members.map(async (memberId) => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            uid: memberId,
            email: userData.email,
            displayName: userData.displayName,
            joinedAt: userData.createdAt?.toDate() || new Date(),
          };
        }
        return null;
      });

      const memberResults = await Promise.all(memberPromises);
      setMembers(memberResults.filter(Boolean) as MemberInfo[]);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Membros da Equipe
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm text-gray-600">{team.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando membros...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro nesta equipe</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {members.length} {members.length === 1 ? 'membro' : 'membros'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {members.length} ativo{members.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.uid}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {member.displayName || 'Usuário'}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {member.joinedAt?.toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setTransferringMember(member)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Transferir membro"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Fechar
          </button>
        </div>
      </div>

      <TransferMemberModal
        isOpen={!!transferringMember}
        onClose={() => setTransferringMember(null)}
        member={transferringMember}
        currentTeam={team}
      />
    </div>
  );
}
