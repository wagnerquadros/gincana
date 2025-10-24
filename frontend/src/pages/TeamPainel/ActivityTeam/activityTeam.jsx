import React from 'react';
import './stylesActivityTeam.css';
import HeaderTeamManeger from '../../../components/HeaderTeamPainel/headerTeamPainel';

function ActivityTeam() {
  const activities = [
    {
      title: 'Quiz de História',
      description: 'Responda perguntas sobre a história do Brasil',
      type: 'Individual',
      points: 100,
      deadline: '2024-03-15',
      status: 'Disponível',
      action: 'Participar',
    },
    {
      title: 'Poesia Declamada',
      description: 'Declame uma poesia de autor brasileiro',
      type: 'Individual',
      points: null,
      deadline: '2024-03-18',
      status: 'Disponível',
      action: 'Participar',
    },
    {
      title: 'Dança Folclórica',
      description: 'Apresente uma dança folclórica regional',
      type: 'Coletiva',
      points: 200,
      deadline: '2024-03-20',
      status: 'Em Andamento',
      action: 'Ver Detalhes',
    },
  ];

  return (
    <div className='activity-team-container'>
      <HeaderTeamManeger />
      <h2 className='activity-header-text'>Atividades Disponíveis</h2>

      {activities.map((act, index) => (
        <div key={index} className='activity-card'>
          <div className='activity-info'>
            <h3>{act.title}</h3>
            <p className='activity-description'>{act.description}</p>
            <p className='activity-meta'>
              {act.type}
              {act.points && <> • {act.points} pontos</>} • Prazo: {act.deadline}
            </p>
          </div>

          <div className='activity-actions'>
            <span
              className={`activity-status ${
                act.status === 'Disponível' ? 'available' : 'progress'
              }`}
            >
              {act.status}
            </span>
            <button className='activity-button'>{act.action}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityTeam;
