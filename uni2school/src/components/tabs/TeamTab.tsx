import { Users, Trophy, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface MemberInfo {
  uid: string;
  displayName?: string;
  email: string;
}

export default function TeamTab() {
  const { userProfile } = useAuth();
  const { teams } = useGame();
  const [membersInfo, setMembersInfo] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const userTeam = teams.find(team => team.members.includes(userProfile?.uid || ''));

  // Buscar informações dos membros
  useEffect(() => {
    const fetchMembersInfo = async () => {
      if (!userTeam) {
        setLoading(false);
        return;
      }

      try {
        const membersPromises = userTeam.members.map(async (memberId) => {
          const userDoc = await getDoc(doc(db, 'users', memberId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              uid: memberId,
              displayName: userData.displayName,
              email: userData.email
            };
          }
          return {
            uid: memberId,
            displayName: 'Usuário',
            email: 'email@exemplo.com'
          };
        });

        const members = await Promise.all(membersPromises);
        setMembersInfo(members);
      } catch (error) {
        console.error('Erro ao buscar informações dos membros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembersInfo();
  }, [userTeam]);

  if (!userTeam) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Você não está em nenhuma equipe
          </h3>
          <p className="text-gray-600">
            Entre em uma equipe para participar da gincana
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 tab-content-padding">
      {/* Header da Equipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: userTeam.color }}
          >
            {userTeam.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{userTeam.name}</h2>
            <p className="text-gray-600">{userTeam.description || 'Sem descrição'}</p>
          </div>
        </div>

        {/* Estatísticas da Equipe */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Membros</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{userTeam.members.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Pontos</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{userTeam.totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Membros da Equipe
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando membros...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {membersInfo.map((member) => (
              <div key={member.uid} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {member.displayName || 'Usuário'}
                  </p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                {member.uid === userProfile?.uid && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    Você
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
