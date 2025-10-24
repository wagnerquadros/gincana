import { Routes, Route } from 'react-router-dom';
import Initial from '../pages/Initial/Initial';
import ActivityManagement from '../pages/ManagerPanel/Activity/activityManagement';
import Dashboard from '../pages/ManagerPanel/Dashboard/dashboard';
import Report from '../pages/ManagerPanel/Report/report';
import Team from '../pages/ManagerPanel/Team/team';
import DashboardTeam from '../pages/TeamPainel/DashboardTeam/dashboardTeam';
import ActivityTeam from '../pages/TeamPainel/ActivityTeam/activityTeam';
import History from '../pages/TeamPainel/History/history';
import Responsible from '../pages/TeamPainel/Responsible/responsible';
function AppRoutes() {
  return (
    <Routes>
      {/* Rotas do painel do gestor */}
      <Route path='/' element={<Initial />} />
      <Route path='/activity' element={<ActivityManagement />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/report' element={<Report />} />
      <Route path='/team' element={<Team />} />

      {/* Rotas do painel da equipe */}
      <Route path='/dashboardTeam' element={<DashboardTeam />} />
      <Route path='/activityTeam' element={<ActivityTeam />} />
      <Route path='/history' element={<History />} />
      <Route path='/responsible' element={<Responsible />} />
    </Routes>
  );
}

export default AppRoutes;
