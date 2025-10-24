import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Team, Prova, ProvaSubmission, RankingSettings, ReviewRequest, ReviewStatus } from '../types/user';
import { useAuth } from './AuthContext';

interface GameContextType {
  teams: Team[];
  provas: Prova[];
  rankingSettings: RankingSettings | null;
  reviewRequests: ReviewRequest[];
  loading: boolean;
  createTeam: (name: string, description: string, color: string) => Promise<void>;
  updateTeam: (teamId: string, name: string, description: string, color: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  transferMember: (memberId: string, fromTeamId: string, toTeamId: string) => Promise<void>;
  createProva: (title: string, description: string, instructions: string, maxPoints: number) => Promise<void>;
  updateProva: (provaId: string, title: string, description: string, instructions: string, maxPoints: number) => Promise<void>;
  deleteProva: (provaId: string) => Promise<void>;
  toggleProvaStatus: (provaId: string, isActive: boolean) => Promise<void>;
  joinTeam: (teamId: string) => Promise<void>;
  submitProva: (provaId: string, content: string) => Promise<void>;
  evaluateSubmission: (provaId: string, submissionId: string, points: number, feedback: string, isGradeVisible: boolean) => Promise<void>;
  toggleRankingVisibility: (isVisible: boolean) => Promise<void>;
  createReviewRequest: (reviewData: Omit<ReviewRequest, 'id'>) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: ReviewStatus, reviewedBy: string, resolution?: string) => Promise<void>;
  deleteReviewRequest: (reviewId: string) => Promise<void>;
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
  const [rankingSettings, setRankingSettings] = useState<RankingSettings | null>(null);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();


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
    } catch (error) {
      console.error('Erro ao criar prova:', error);
      throw error;
    }
  };

  const updateProva = async (provaId: string, title: string, description: string, instructions: string, maxPoints: number) => {
    if (!currentUser || !userProfile) return;

    try {
      const provaRef = doc(db, 'provas', provaId);
      await updateDoc(provaRef, {
        title,
        description,
        instructions,
        maxPoints,
      });
    } catch (error) {
      console.error('Erro ao atualizar prova:', error);
      throw error;
    }
  };

  const deleteProva = async (provaId: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const provaRef = doc(db, 'provas', provaId);
      await deleteDoc(provaRef);
    } catch (error) {
      console.error('Erro ao excluir prova:', error);
      throw error;
    }
  };

  const toggleProvaStatus = async (provaId: string, isActive: boolean) => {
    if (!currentUser || !userProfile) return;

    try {
      const provaRef = doc(db, 'provas', provaId);
      await updateDoc(provaRef, {
        isActive,
      });
    } catch (error) {
      console.error('Erro ao alterar status da prova:', error);
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
      }
    } catch (error) {
      console.error('Erro ao avaliar prova:', error);
      throw error;
    }
  };

  const toggleRankingVisibility = async (isVisible: boolean) => {
    if (!currentUser || !userProfile) return;

    try {
      const rankingSnapshot = await getDocs(collection(db, 'rankingSettings'));
      if (rankingSnapshot.empty) {
        // Criar configurações se não existirem
        const newSettings = {
          isVisible,
          lastUpdated: new Date(),
          updatedBy: currentUser.uid,
        };
        await addDoc(collection(db, 'rankingSettings'), newSettings);
      } else {
        // Atualizar configurações existentes
        const rankingDoc = rankingSnapshot.docs[0];
        const rankingRef = doc(db, 'rankingSettings', rankingDoc.id);
        await updateDoc(rankingRef, {
          isVisible,
          lastUpdated: new Date(),
          updatedBy: currentUser.uid,
        });
      }
    } catch (error) {
      console.error('Erro ao alterar visibilidade do ranking:', error);
      throw error;
    }
  };

  const createReviewRequest = async (reviewData: Omit<ReviewRequest, 'id'>) => {
    if (!currentUser || !userProfile) return;

    try {
      // Função recursiva para remover campos undefined
      const removeUndefined = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(removeUndefined);
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
              cleaned[key] = removeUndefined(value);
            }
          }
          return cleaned;
        }
        return obj;
      };

      const reviewRequestData = {
        ...removeUndefined(reviewData),
        createdAt: new Date(),
        evidence: reviewData.evidence.map(evidence => ({
          ...evidence,
          uploadedAt: new Date(),
        })),
      };

      await addDoc(collection(db, 'reviewRequests'), reviewRequestData);
    } catch (error) {
      console.error('Erro ao criar solicitação de revisão:', error);
      throw error;
    }
  };

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus, reviewedBy: string, resolution?: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const reviewRef = doc(db, 'reviewRequests', reviewId);
      const updateData: any = {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        reviewedByName: userProfile.displayName || userProfile.email,
      };

      if (resolution) {
        updateData.resolution = resolution;
      }

      await updateDoc(reviewRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar status da revisão:', error);
      throw error;
    }
  };

  const deleteReviewRequest = async (reviewId: string) => {
    if (!currentUser || !userProfile) return;

    try {
      const reviewRef = doc(db, 'reviewRequests', reviewId);
      await deleteDoc(reviewRef);
    } catch (error) {
      console.error('Erro ao excluir solicitação de revisão:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Configurar listeners em tempo real
    const teamsUnsubscribe = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Team[];
      setTeams(teamsData);
    });

    const provasUnsubscribe = onSnapshot(
      query(collection(db, 'provas'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const provasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          submissions: doc.data().submissions?.map((sub: any) => ({
            ...sub,
            submittedAt: sub.submittedAt?.toDate() || new Date(),
            evaluatedAt: sub.evaluatedAt?.toDate() || undefined,
          })) || [],
        })) as Prova[];
        setProvas(provasData);
      }
    );

    const rankingUnsubscribe = onSnapshot(collection(db, 'rankingSettings'), (snapshot) => {
      if (snapshot.empty) {
        // Criar configurações padrão se não existirem
        const defaultSettings = {
          isVisible: false,
          lastUpdated: new Date(),
          updatedBy: currentUser.uid,
        };
        addDoc(collection(db, 'rankingSettings'), defaultSettings);
        setRankingSettings({
          id: 'default',
          ...defaultSettings,
        });
      } else {
        const rankingDoc = snapshot.docs[0];
        setRankingSettings({
          id: rankingDoc.id,
          ...rankingDoc.data(),
          lastUpdated: rankingDoc.data().lastUpdated?.toDate() || new Date(),
        } as RankingSettings);
      }
    });

    const reviewRequestsUnsubscribe = onSnapshot(
      query(collection(db, 'reviewRequests'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const reviewRequestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
          evidence: doc.data().evidence?.map((evidence: any) => ({
            ...evidence,
            uploadedAt: evidence.uploadedAt?.toDate() || new Date(),
          })) || [],
        })) as ReviewRequest[];
        setReviewRequests(reviewRequestsData);
        setLoading(false);
      }
    );

    // Cleanup dos listeners
    return () => {
      teamsUnsubscribe();
      provasUnsubscribe();
      rankingUnsubscribe();
      reviewRequestsUnsubscribe();
    };
  }, [currentUser]);

  const value = {
    teams,
    provas,
    rankingSettings,
    reviewRequests,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    transferMember,
    createProva,
    updateProva,
    deleteProva,
    toggleProvaStatus,
    joinTeam,
    submitProva,
    evaluateSubmission,
    toggleRankingVisibility,
    createReviewRequest,
    updateReviewStatus,
    deleteReviewRequest,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
