import React from 'react';
import './stylesDashboardTeam.css';
import HeaderTeamPainel from '../../../components/HeaderTeamPainel/headerTeamPainel';

function DashboardTeam() {
  return (
    <div className='dashboard-team-container'>
      <HeaderTeamPainel />
      {/* ==== HEADER DA EQUIPE ==== */}
      <div className='team-header'>
        <div>
          <h2>Águias Douradas</h2>
          <p>25 membros</p>
        </div>
        <div className='team-points'>
          <h3>850</h3>
          <span>pontos</span>
        </div>
      </div>

      {/* ==== STATUS GERAL ==== */}
      <div className='team-status-cards'>
        <div className='status-card'>
          <div>
            <h4>Atividades Disponíveis</h4>
            <p>Participe e ganhe pontos</p>
          </div>
          <h2>3</h2>
        </div>

        <div className='status-card'>
          <div>
            <h4>Em Andamento</h4>
            <p>Atividade em progresso</p>
          </div>
          <h2>1</h2>
        </div>

        <div className='status-card'>
          <div>
            <h4>Finalizadas</h4>
            <p>Atividades concluídas</p>
          </div>
          <h2>2</h2>
        </div>
      </div>

      {/* ==== PRÓXIMAS ATIVIDADES ==== */}
      <div className='next-activities'>
        <h3>Próximas Atividades</h3>

        <div className='activity-item'>
          <div>
            <h4>Quiz de História</h4>
            <p>Individual • 100 pontos</p>
            <span className='activity-deadline'>Prazo: 2024-03-15</span>
          </div>
          <span className='activity-status available'>Disponível</span>
        </div>

        <div className='activity-item'>
          <div>
            <h4>Poesia Declamada</h4>
            <p>Individual</p>
            <span className='activity-deadline'>Prazo: 2024-03-18</span>
          </div>
          <span className='activity-status available'>Disponível</span>
        </div>

        <div className='activity-item'>
          <div>
            <h4>Dança Folclórica</h4>
            <p>Coletiva • 200 pontos</p>
            <span className='activity-deadline'>Prazo: 2024-03-20</span>
          </div>
          <span className='activity-status progress'>Em Andamento</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardTeam;
