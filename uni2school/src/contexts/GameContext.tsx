import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Team, Prova, ProvaSubmission } from '../types/user';
import { useAuth } from './AuthContext';

interface GameContextType {
  teams: Team[];
  provas: Prova[];
  loading: boolean;
  createTeam: (name: string, description: string, color: string) => Promise<void>;
  updateTeam: (teamId: string, name: string, description: string, color: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  transferMember: (memberId: string, fromTeamId: string, toTeamId: string) => Promise<void>;
  createProva: (title: string, description: string, instructions: string, maxPoints: number) => Promise<void>;
  joinTeam: (teamId: string) => Promise<void>;
  submitProva: (provaId: string, content: string) => Promise<void>;
  evaluateSubmission: (provaId: string, submissionId: string, points: number, feedback: string, isGradeVisible: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();

  const refreshData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Buscar equipes
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Team[];

      // Buscar provas
      const provasSnapshot = await getDocs(
        query(collection(db, 'provas'), orderBy('createdAt', 'desc'))
      );
      const provasData = provasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        submissions: doc.data().submissions?.map((sub: any) => ({
          ...sub,
          submittedAt: sub.submittedAt?.toDate() || new Date(),
          evaluatedAt: sub.evaluatedAt?.toDate() || undefined,
        })) || [],
      })) as Prova[];

      setTeams(teamsData);
      setProvas(provasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description: string, color: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const teamData = {
        name,
        description,
        color,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        members: [],
        totalPoints: 0,
      };

      await addDoc(collection(db, 'teams'), teamData);
      await refreshData();
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      throw error;
    }
  };

  const updateTeam = async (teamId: string, name: string, description: string, color: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        name,
        description,
        color,
      });
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      throw error;
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const teamRef = doc(db, 'teams', teamId);
      
      // Remover teamId dos usuários que estavam nesta equipe
      const team = teams.find(t => t.id === teamId);
      if (team) {
        const updatePromises = team.members.map(memberId => {
          const userRef = doc(db, 'users', memberId);
          return updateDoc(userRef, { teamId: null });
        });
        await Promise.all(updatePromises);
      }
      
      await deleteDoc(teamRef);
      await refreshData();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      throw error;
    }
  };

  const transferMember = async (memberId: string, fromTeamId: string, toTeamId: string) => {
    if (!currentUser || !userProfile) return;

    try {
      // Remover membro da equipe de origem
      const fromTeamRef = doc(db, 'teams', fromTeamId);
      const fromTeam = teams.find(t => t.id === fromTeamId);
      if (fromTeam) {
        const updatedFromMembers = fromTeam.members.filter(id => id !== memberId);
        await updateDoc(fromTeamRef, { members: updatedFromMembers });
      }

      // Adicionar membro à equipe de destino
      const toTeamRef = doc(db, 'teams', toTeamId);
      const toTeam = teams.find(t => t.id === toTeamId);
      if (toTeam) {
        const updatedToMembers = [...toTeam.members, memberId];
        await updateDoc(toTeamRef, { members: updatedToMembers });
      }

      // Atualizar teamId do usuário
      const userRef = doc(db, 'users', memberId);
      await updateDoc(userRef, { teamId: toTeamId });

      await refreshData();
    } catch (error) {
      console.error('Erro ao transferir membro:', error);
      throw error;
    }
  };

  const createProva = async (title: string, description: string, instructions: string, maxPoints: number) => {
    if (!currentUser || !userProfile) return;

    try {
      const provaData = {
        title,
        description,
        instructions,
        maxPoints,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        isActive: true,
        submissions: [],
      };

      await addDoc(collection(db, 'provas'), provaData);
      await refreshData();
    } catch (error) {
      console.error('Erro ao criar prova:', error);
      throw error;
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const teamRef = doc(db, 'teams', teamId);
      const team = teams.find(t => t.id === teamId);
      
      if (team && !team.members.includes(currentUser.uid)) {
        const updatedMembers = [...team.members, currentUser.uid];
        await updateDoc(teamRef, { members: updatedMembers });
        
        // Atualizar perfil do usuário
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { teamId });
        
        await refreshData();
      }
    } catch (error) {
      console.error('Erro ao entrar na equipe:', error);
      throw error;
    }
  };

  const submitProva = async (provaId: string, content: string) => {
    if (!currentUser || !userProfile || !userProfile.teamId) return;

    try {
      const provaRef = doc(db, 'provas', provaId);
      const prova = provas.find(p => p.id === provaId);
      const team = teams.find(t => t.id === userProfile.teamId);
      
      if (prova && team) {
        const submission: ProvaSubmission = {
          id: `${currentUser.uid}_${provaId}`,
          studentId: currentUser.uid,
          studentName: userProfile.displayName || userProfile.email,
          teamId: userProfile.teamId,
          teamName: team.name,
          submittedAt: new Date(),
          content,
          maxPoints: prova.maxPoints,
          isGradeVisible: false,
        };

        const updatedSubmissions = [...prova.submissions, submission];
        await updateDoc(provaRef, { submissions: updatedSubmissions });
        
        await refreshData();
      }
    } catch (error) {
      console.error('Erro ao submeter prova:', error);
      throw error;
    }
  };

  const evaluateSubmission = async (provaId: string, submissionId: string, points: number, feedback: string, isGradeVisible: boolean) => {
    if (!currentUser || !userProfile) return;

    try {
      const provaRef = doc(db, 'provas', provaId);
      const prova = provas.find(p => p.id === provaId);
      
      if (prova) {
        const updatedSubmissions = prova.submissions.map(submission => {
          if (submission.id === submissionId) {
            return {
              ...submission,
              points,
              feedback,
              evaluatedAt: new Date(),
              evaluatedBy: currentUser.uid,
              isGradeVisible,
            };
          }
          return submission;
        });

        await updateDoc(provaRef, { submissions: updatedSubmissions });
        await refreshData();
      }
    } catch (error) {
      console.error('Erro ao avaliar prova:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const value = {
    teams,
    provas,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    transferMember,
    createProva,
    joinTeam,
    submitProva,
    evaluateSubmission,
    refreshData,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
