import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, LogOut } from 'lucide-react';
import TeamSelection from '../TeamSelection';
import ProvaList from '../ProvaList';
import StudentTeamRanking from '../StudentTeamRanking';
import BottomNavigation from '../BottomNavigation';
import TeamTab from '../tabs/TeamTab';
import ProfileTab from '../tabs/ProfileTab';
import ReviewsTab from '../tabs/ReviewsTab';

export default function AlunoDashboard() {
  const { userProfile, signOut } = useAuth();
  const { teams, provas, rankingSettings, reviewRequests } = useGame();
  const [activeTab, setActiveTab] = useState('team');

  const userTeam = teams.find(team => team.members.includes(userProfile?.uid || ''));
  const hasTeam = !!userProfile?.teamId || !!userTeam;

  // Calcular estatísticas das provas
  const userSubmissions = provas.flatMap(prova => 
    prova.submissions.filter(sub => sub.studentId === userProfile?.uid)
  );

  // Filtrar solicitações de revisão do usuário
  const userReviewRequests = reviewRequests.filter(review => review.createdBy === userProfile?.uid);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamTab />;
      case 'provas':
        return (
          <div className="p-4 tab-content-padding">
            <ProvaList />
          </div>
        );
      case 'ranking':
        return (
          <div className="p-4 tab-content-padding">
            <StudentTeamRanking 
              isVisible={rankingSettings?.isVisible || false}
            />
          </div>
        );
      case 'reviews':
        return <ReviewsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <TeamTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header - apenas em desktop */}
      <nav className="bg-white shadow-sm border-b border-gray-200 hidden md:block">
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

      {/* Header Mobile */}
      <div className="bg-white shadow-sm border-b border-gray-200 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-800">Gincana</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="mobile-content-padding">
        {!hasTeam ? (
          <div className="p-4">
            <TeamSelection onTeamSelected={() => {}} />
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      {/* Navegação Inferior - apenas em mobile */}
      {hasTeam && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reviewCount={userReviewRequests.length}
        />
      )}
    </div>
  );
}
