import { Routes, Route } from 'react-router-dom';
import Initial from '../pages/Initial/Initial';
import ActivityManagement from '../pages/ManagerPanel/Activity/activityManagement';
import Dashboard from '../pages/ManagerPanel/Dashboard/dashboard';
import Report from '../pages/ManagerPanel/Report/report';
import Team from '../pages/ManagerPanel/Team/team';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Initial />} />
      <Route path='/activity' element={<ActivityManagement />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/report' element={<Report />} />
      <Route path='/team' element={<Team />} />
    </Routes>
  );
}

export default AppRoutes;
