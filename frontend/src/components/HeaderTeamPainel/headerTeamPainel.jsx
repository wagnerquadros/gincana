import React from 'react';
import './stylesheaderTeamPainel.css';
import { useNavigate, useLocation } from 'react-router-dom';

function HeaderTeamPainel() {
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
        <h2>Painel da Equipe</h2>
      </div>

      <nav className='painel-nav'>
        <button
          onClick={() => navigate('/dashboardTeam')}
          className={location.pathname === '/dashboardTeam' ? 'active' : ''}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate('/activityTeam')}
          className={location.pathname === '/activityTeam' ? 'active' : ''}
        >
          Atividades
        </button>

        <button
          onClick={() => navigate('/history')}
          className={location.pathname === '/history' ? 'active' : ''}
        >
          Historico
        </button>

        <button
          onClick={() => navigate('/responsible')}
          className={location.pathname === '/responsible' ? 'active' : ''}
        >
          Responsaveis
        </button>
      </nav>
    </header>
  );
}

export default HeaderTeamPainel;
