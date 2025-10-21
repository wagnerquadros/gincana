import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import AuthGate from './components/AuthGate';
import AlunoDashboard from './components/dashboards/AlunoDashboard';
import ProfessorDashboard from './components/dashboards/ProfessorDashboard';
import DevDashboard from './components/dashboards/DevDashboard';

function AppContent() {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser || !userProfile) {
    return <AuthGate />;
  }

  switch (userProfile.role) {
    case 'aluno':
      return <AlunoDashboard />;
    case 'professor':
      return <ProfessorDashboard />;
    case 'dev':
      return <DevDashboard />;
    default:
      return <AuthGate />;
  }
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
