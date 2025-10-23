import { createRoot } from 'react-dom/client';
import './styles/globalStyles.css';
import AppRoutes from './routes/index.routes.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
