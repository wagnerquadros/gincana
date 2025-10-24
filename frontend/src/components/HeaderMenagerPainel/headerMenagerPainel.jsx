import './stylesHeaderMenagerPainel.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function HeaderMenagerPainel() {
  const navigate = useNavigate();
  const location = useLocation();

  const handlerBack = () => {
    navigate(-1);
  };

  return (
    <header className='painel-header'>
      <div className='painel-header-left'>
        <button className='btn-voltar' onClick={handlerBack}>
          ← Voltar
        </button>
        <h2>Painel do Gestor</h2>
      </div>

      <nav className='painel-nav'>
        <button
          onClick={() => navigate('/dashboard')}
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate('/team')}
          className={location.pathname === '/team' ? 'active' : ''}
        >
          Equipes
        </button>

        <button
          onClick={() => navigate('/activity')}
          className={location.pathname === '/activity' ? 'active' : ''}
        >
          Atividades
        </button>

        <button
          onClick={() => navigate('/report')}
          className={location.pathname === '/report' ? 'active' : ''}
        >
          Relatórios
        </button>
      </nav>
    </header>
  );
}
